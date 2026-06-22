from fastapi import APIRouter, HTTPException
from app.models.schemas import GraphicInput
from app.services.solver_engine import solve_graphic
from app.services.ia_service import IAService

router = APIRouter(
    prefix="/grafico",
    tags=["Método Gráfico"]
)

# Reutilizamos el servicio de IA local
ia_service = IAService(model_name="llama3", ollama_url="http://localhost:11434")

@router.post("/solve")
def solve_graphic_problem(payload: GraphicInput):
    try:
        # 1. Resolver geométricamente el problema de 2 variables
        result = solve_graphic(payload)
        
        if not result["feasible_region"]:
            return {
                "success": False,
                "message": "El problema no tiene una región factible acotada o válida (Inviable)."
            }
            
        # 2. Generar interpretación con IA pasándole el formato estructurado
        # Creamos un diccionario simulando la respuesta clásica del Simplex para mantener compatibilidad con el prompt de la IA
        format_solution = {
            "status": "Optimal",
            "objective_value": result["optimal_solution"]["objective_value"],
            "variables": result["optimal_solution"]["variables"]
        }
        explicacion_ia = ia_service.generate_interpretation(payload, format_solution)
        
        return {
            "success": True,
            "data": result,
            "analysis": explicacion_ia
        }
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el servidor gráfico: {str(e)}")