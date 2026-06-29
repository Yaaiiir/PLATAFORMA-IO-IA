from fastapi import APIRouter
from app.models.schemas import ChatMessageInput
from app.services.asistente_service import AsistenteService
import traceback

router = APIRouter(
    prefix="/asistente",
    tags=["Asistente de IA (Chat Flotante)"]
)

asistente_service = AsistenteService()

@router.post("/chat")
def chat_flotante_endpoint(payload: ChatMessageInput):
    try:
        respuesta = asistente_service.generar_respuesta_chat(payload)
        return {
            "success": True,
            "response": respuesta
        }
    except Exception as e:
        traceback.print_exc()
        # En lugar de lanzar HTTPException 500, respondemos controlado para el frontend
        return {
            "success": False,
            "response": f"Error inesperado en el servidor: {str(e)}"
        }