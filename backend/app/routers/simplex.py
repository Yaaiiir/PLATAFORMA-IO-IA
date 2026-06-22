from fastapi import APIRouter, HTTPException
from app.models.schemas import SimplexInput
from app.services.solver_engine import solve_simplex
from app.services.ia_service import IAService

router = APIRouter(
    prefix="/simplex",
    tags=["Método Simplex"]
)

# Inicializamos el servicio de IA apuntando al modelo local (por defecto llama3)
ia_service = IAService(model_name="llama3", ollama_url="http://localhost:11434")

@router.post("/solve")
def solve_simplex_problem(payload: SimplexInput):
    try:
        # 1. Resolver el problema matemáticamente con PuLP
        result = solve_simplex(payload)
        
        if result["status"] != "Optimal":
            return {
                "success": False,
                "status": result["status"],
                "message": f"No se pudo encontrar una solución óptima. Estado: {result['status']}"
            }
        
        # 2. Enviar los datos del problema y la solución matemática a la IA local
        # Nota: Si no tienes Ollama corriendo en tu PC, el bloque try/except de ia_service capturará el aviso sin tumbar el server.
        explicacion_ia = ia_service.generate_interpretation(payload, result)
            
        return {
            "success": True,
            "status": result["status"],
            "data": {
                "objective_value": result["objective_value"],
                "variables": result["variables"]
            },
            "analysis": explicacion_ia  # Aquí viaja la interpretación en lenguaje natural
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al procesar el modelo Simplex: {str(e)}")