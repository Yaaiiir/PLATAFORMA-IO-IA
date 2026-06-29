from fastapi import APIRouter, HTTPException
from app.models.schemas import GraphicInput
from app.services.solver_engine import solve_graphic
from app.services.ia_service import IAService
import traceback

router = APIRouter(
    prefix="/grafico",
    tags=["Método Gráfico"]
)

ia_service = IAService(model_name="llama3", ollama_url="http://localhost:11434")

@router.post("/solve")
def solve_graphic_problem(payload: GraphicInput):
    try:
        result = solve_graphic(payload)
        
        if not result or not result.get("feasible_region"):
            return {
                "success": False,
                "message": "El problema no tiene una región factible acotada o válida (Inviable)."
            }
            
        format_solution = {
            "status": "Optimal",
            "objective_value": result["optimal_solution"]["objective_value"],
            "variables": result["optimal_solution"]["variables"]
        }
        
        try:
            explicacion_ia = ia_service.generate_interpretation(payload, format_solution)
        except Exception as ia_err:
            print(f"⚠️ Alerta: La IA local falló o no está activa: {str(ia_err)}")
            explicacion_ia = "Análisis de IA no disponible (Verifica si Ollama está encendido)."
        
        return {
            "success": True,
            "data": result,
            "analysis": explicacion_ia
        }
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        traceback.print_exc()  # Muestra el error exacto en tu consola Git Bash
        raise HTTPException(status_code=500, detail=f"Error en el servidor gráfico: {str(e)}")