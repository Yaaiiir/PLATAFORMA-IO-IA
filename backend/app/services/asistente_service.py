import httpx
from app.models.schemas import ChatMessageInput

class AsistenteService:
    def __init__(self, model_name: str = "llama3", ollama_url: str = "http://localhost:11434"):
        self.model_name = model_name
        self.ollama_url = f"{ollama_url}/api/generate"

    def generar_respuesta_chat(self, payload: ChatMessageInput) -> str:
        contexto = ""
        if payload.context_data:
            contexto = f"\n[CONTEXTO OPERATIVO]:\n{payload.context_data}\n"

        prompt_final = f"""
        Actúa como un Asistente Experto en Investigación de Operaciones.
        {contexto}
        Pregunta del usuario: {payload.message}
        Responde en español de forma concisa.
        """

        json_payload = {
            "model": self.model_name,
            "prompt": prompt_final,
            "stream": False,
            "options": {
                "temperature": 0.6,
                "num_predict": 150,  # Reducido para que responda mucho más rápido
                "num_thread": 4
            }
        }

        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.post(self.ollama_url, json=json_payload)
                if response.status_code != 200:
                    return "Ollama respondió con un error. Verifica que el modelo esté cargado."
                
                return response.json().get("response", "No se generó texto.")
        except httpx.ConnectError:
            return "No se pudo conectar con Ollama local. ¿Está la aplicación Ollama encendida?"
        except Exception as e:
            return f"Error interno en el servicio de IA: {str(e)}"