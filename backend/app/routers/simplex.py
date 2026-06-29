from fastapi import APIRouter, HTTPException
from app.models.schemas import SimplexInput
from app.services.solver_engine import solve_simplex
from app.services.ia_service import IAService
import traceback

router = APIRouter(
    prefix="/simplex",
    tags=["Método Simplex"]
)

ia_service = IAService(model_name="llama3", ollama_url="http://localhost:11434")

@router.post("/solve")
def solve_simplex_problem(payload: SimplexInput):
    try:
        result = solve_simplex(payload)
        
        if not result or result.get("status") != "Optimal":
            return {
                "success": False,
                "status": result.get("status", "Unknown"),
                "message": f"No se pudo encontrar una solución óptima."
            }
        
        # Intentar obtener el análisis de IA, si falla no tumbamos los datos matemáticos
        try:
            explicacion_ia = ia_service.generate_interpretation(payload, result)
        except Exception as ia_err:
            print(f"⚠️ Alerta: La IA local falló o no está activa: {str(ia_err)}")
            explicacion_ia = "Análisis de IA no disponible (Verifica si Ollama está encendido)."
            
        return {
            "success": True,
            "status": result["status"],
            "data": {
                "objective_value": result["objective_value"],
                "variables": result["variables"]
            },
            "analysis": explicacion_ia
        }
    except Exception as e:
        # Esto imprimirá el error exacto en tu terminal MINGW64
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Error al procesar el modelo Simplex: {str(e)}")