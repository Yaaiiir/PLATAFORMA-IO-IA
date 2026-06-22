from fastapi import APIRouter
from app.models.schemas import TransportInput
from app.services.solver_engine import solve_transport
from app.services.ia_service import IAService

router = APIRouter(
    prefix="/transporte",
    tags=["Modelo de Transporte"]
)

ia_service = IAService(model_name="llama3", ollama_url="http://localhost:11434")

@router.post("/solve")
def solve_transport_problem(payload: TransportInput):
    try:
        # 1. Resolver el modelo logístico lineal pasando el payload completo (que incluye .method)
        # Nota: Asegúrate de que en tu solver_engine.py la función solve_transport reciba
        # este método para bifurcar la lógica (NRE, MCM, VOGEL) en el algoritmo de aproximación.
        result = solve_transport(payload)
        
        # Validar si el motor matemático devolvió un diccionario válido y un estado óptimo
        if not result or result.get("status") != "Optimal":
            status_err = result.get("status") if result else "Desconocido"
            return {
                "success": False,
                "message": f"No se pudo encontrar una distribución factible utilizando el método {payload.method}. Estado: {status_err}"
            }
            
        # 2. Formatear la solución extendida incluyendo el método usado para alimentar contextualmente a la IA
        format_solution = {
            "status": "Optimal",
            "method_used": payload.method,  # Informamos a la IA qué heurística se seleccionó
            "objective_value": result.get("total_cost", 0),
            "variables": f"Matriz de asignación de rutas óptimas: {result.get('allocation')} entre orígenes {payload.origins_names} y destinos {payload.destinations_names}"
        }
        
        # 3. Intentar generar la interpretación de IA (con salvaguarda por si Ollama está apagado)
        try:
            explicacion_ia = ia_service.generate_interpretation(payload, format_solution)
        except Exception as ia_err:
            explicacion_ia = f"El plan logístico con el método {payload.method} se calculó con éxito, pero el consultor de IA no está disponible en este momento. (Detalle: {str(ia_err)})"
        
        return {
            "success": True,
            "data": result,
            "analysis": explicacion_ia
        }
        
    except Exception as e:
        # Devolvemos el formato controlado que tu frontend intercepta nativamente sin romper el flujo de la UI
        return {
            "success": False,
            "message": f"Error interno en el motor de transporte [{payload.method}]: {str(e)}"
        }