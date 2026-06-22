from pulp import *
import numpy as np
import copy
from app.models.schemas import SimplexInput, GraphicInput, TransportInput

# =====================================================================
# MÓDULO 1: MÉTODO SIMPLEX (Soporta n variables)
# =====================================================================
def solve_simplex(data: SimplexInput):
    if data.objective_type == "MAX":
        prob = LpProblem("Simplex_Optimization", LpMaximize)
    else:
        prob = LpProblem("Simplex_Optimization", LpMinimize)
    
    num_vars = len(data.objective_coefficients)
    variables = [LpVariable(f"x{i+1}", lowBound=0) for i in range(num_vars)]
    
    prob += lpSum([data.objective_coefficients[i] * variables[i] for i in range(num_vars)])
    
    for c in data.constraints:
        constraint_expr = lpSum([c.coefficients[i] * variables[i] for i in range(num_vars)])
        if c.sign == "<=":
            prob += (constraint_expr <= c.rhs)
        elif c.sign == ">=":
            prob += (constraint_expr >= c.rhs)
        elif c.sign == "=":
            prob += (constraint_expr == c.rhs)
            
    prob.solve(PULP_CBC_CMD(msg=0))
    
    status = LpStatus[prob.status]
    objective_value = value(prob.objective) if status == "Optimal" else None
    
    solution_variables = {}
    for i, var in enumerate(variables):
        solution_variables[var.name] = value(var) if status == "Optimal" else 0.0

    return {
        "status": status,
        "objective_value": objective_value,
        "variables": solution_variables
    }


# =====================================================================
# MÓDULO 2: MÉTODO GRÁFICO (Estricto para 2 variables)
# =====================================================================
def solve_graphic(data: GraphicInput):
    data.validate_variables()
    
    num_vars = 2
    c_obj = data.objective_coefficients
    
    equations = []
    for c in data.constraints:
        equations.append({'coef': c.coefficients, 'rhs': c.rhs, 'sign': c.sign})
        
    equations.append({'coef': [1, 0], 'rhs': 0, 'sign': '>='})
    equations.append({'coef': [0, 1], 'rhs': 0, 'sign': '>='})
    
    intersections = []
    num_eq = len(equations)
    
    for i in range(num_eq):
        for j in range(i + 1, num_eq):
            A = np.array([equations[i]['coef'], equations[j]['coef']])
            B = np.array([equations[i]['rhs'], equations[j]['rhs']])
            
            try:
                point = np.linalg.solve(A, B)
                point = [round(float(point[0]), 4), round(float(point[1]), 4)]
                
                if point not in intersections:
                    intersections.append(point)
            except np.linalg.LinAlgError:
                continue

    feasible_points = []
    for pt in intersections:
        x1, x2 = pt[0], pt[1]
        is_feasible = True
        
        for eq in equations:
            val = eq['coef'][0] * x1 + eq['coef'][1] * x2
            if eq['sign'] == '<=' and val > eq['rhs'] + 1e-4:
                is_feasible = False
                break
            elif eq['sign'] == '>=' and val < eq['rhs'] - 1e-4:
                is_feasible = False
                break
            elif eq['sign'] == '=' and not np.isclose(val, eq['rhs']):
                is_feasible = False
                break
                
        if is_feasible and pt not in feasible_points:
            feasible_points.append(pt)

    best_value = float('-inf') if data.objective_type == "MAX" else float('inf')
    optimal_point = None
    
    vertices_evaluated = []
    for pt in feasible_points:
        z_val = c_obj[0] * pt[0] + c_obj[1] * pt[1]
        vertices_evaluated.append({'point': pt, 'z': round(z_val, 4)})
        
        if data.objective_type == "MAX":
            if z_val > best_value:
                best_value = z_val
                optimal_point = pt
        else:
            if z_val < best_value:
                best_value = z_val
                optimal_point = pt

    return {
        "intersections": intersections,
        "feasible_region": feasible_points,
        "vertices_evaluated": vertices_evaluated,
        "optimal_solution": {
            "objective_value": round(best_value, 4) if len(feasible_points) > 0 else None,
            "variables": {"x1": optimal_point[0], "x2": optimal_point[1]} if optimal_point else None
        }
    }


# =====================================================================
# MÓDULO 3: MODELO DE TRANSPORTE (Heurísticas Clásicas)
# =====================================================================
def solve_transport(data: TransportInput):
    # Corregido: Leer desde 'data' en lugar del payload inexistente
    metodo = data.method 
    
    num_origins = len(data.origins_names)
    num_destinations = len(data.destinations_names)
    
    # Clonamos las capacidades para no alterar el estado original en las iteraciones
    supply = list(data.supply)
    demand = list(data.demand)
    costs = data.costs_matrix
    
    # Inicializar la matriz de asignación vacía
    allocation = [[0.0 for _ in range(num_destinations)] for _ in range(num_origins)]
    
    # -----------------------------------------------------------------
    # HEURÍSTICA A: ESQUINA NOROESTE (NRE)
    # -----------------------------------------------------------------
    if metodo == "NRE":
        i, j = 0, 0
        while i < num_origins and j < num_destinations:
            quantity = min(supply[i], demand[j])
            allocation[i][j] = float(quantity)
            supply[i] -= quantity
            demand[j] -= quantity
            if supply[i] == 0:
                i += 1
            elif demand[j] == 0:
                j += 1
            else:
                i += 1
                j += 1

    # -----------------------------------------------------------------
    # HEURÍSTICA B: COSTO MÍNIMO (MCM)
    # -----------------------------------------------------------------
    elif metodo == "MCM":
        while sum(supply) > 0 and sum(demand) > 0:
            min_cost = float('inf')
            target_i, target_j = -1, -1
            
            # Buscar la celda con el menor costo que conserve oferta y demanda
            for i in range(num_origins):
                if supply[i] <= 0: continue
                for j in range(num_destinations):
                    if demand[j] <= 0: continue
                    if costs[i][j] < min_cost:
                        min_cost = costs[i][j]
                        target_i, target_j = i, j
            
            if target_i == -1 or target_j == -1: break
            
            quantity = min(supply[target_i], demand[target_j])
            allocation[target_i][target_j] = float(quantity)
            supply[target_i] -= quantity
            demand[target_j] -= quantity

    # -----------------------------------------------------------------
    # HEURÍSTICA C: APROXIMACIÓN DE VOGEL (VOGEL)
    # -----------------------------------------------------------------
    elif metodo == "VOGEL":
        while sum(supply) > 0 and sum(demand) > 0:
            row_penalties = [-1] * num_origins
            col_penalties = [-1] * num_destinations
            
            # Calcular penalizaciones por renglón
            for i in range(num_origins):
                if supply[i] <= 0: continue
                row_costs = [costs[i][j] for j in range(num_destinations) if demand[j] > 0]
                if len(row_costs) >= 2:
                    sorted_costs = sorted(row_costs)
                    row_penalties[i] = sorted_costs[1] - sorted_costs[0]
                elif len(row_costs) == 1:
                    row_penalties[i] = row_costs[0]
                    
            # Calcular penalizaciones por columna
            for j in range(num_destinations):
                if demand[j] <= 0: continue
                col_costs = [costs[i][j] for i in range(num_origins) if supply[i] > 0]
                if len(col_costs) >= 2:
                    sorted_costs = sorted(col_costs)
                    col_penalties[j] = sorted_costs[1] - sorted_costs[0]
                elif len(col_costs) == 1:
                    col_penalties[j] = col_costs[0]
            
            # Identificar la máxima penalización global
            max_row_p = max(row_penalties)
            max_col_p = max(col_penalties)
            
            if max_row_p >= max_col_p and max_row_p != -1:
                target_i = row_penalties.index(max_row_p)
                # Seleccionar la columna con menor costo en ese renglón
                valid_j = [j for j in range(num_destinations) if demand[j] > 0]
                target_j = min(valid_j, key=lambda j: costs[target_i][j])
            elif max_col_p != -1:
                target_j = col_penalties.index(max_col_p)
                # Seleccionar el renglón con menor costo en esa columna
                valid_i = [i for i in range(num_origins) if supply[i] > 0]
                target_i = min(valid_i, key=lambda i: costs[i][target_j])
            else:
                break
                
            quantity = min(supply[target_i], demand[target_j])
            allocation[target_i][target_j] = float(quantity)
            supply[target_i] -= quantity
            demand[target_j] -= quantity

    # Por si se recibe una variable vacía o no parametrizada
    else:
        return {"status": "Infeasible", "total_cost": None, "allocation": allocation}

    # Calcular el costo total final basado en las asignaciones de la heurística ejecutada
    total_cost = sum(allocation[i][j] * costs[i][j] for i in range(num_origins) for j in range(num_destinations))
    
    return {
        "status": "Optimal",
        "total_cost": round(float(total_cost), 2),
        "allocation": allocation
    }