import httpx
from app.models.schemas import TransportInput

class IAService:
    def __init__(self, model_name: str = "llama3", ollama_url: str = "http://localhost:11434"):
        self.model_name = model_name
        self.ollama_url = f"{ollama_url}/api/generate"

    def generate_interpretation(self, payload: TransportInput, solution: dict) -> str:
        """
        Genera un análisis experto utilizando el modelo local de Ollama de forma optimizada.
        """
        # Mapeo de siglas a nombres elegantes para el reporte de la IA
        method_names = {
            "NRE": "Método de la Esquina Noroeste",
            "MCM": "Método del Costo Mínimo",
            "VOGEL": "Método de Aproximación de Vogel"
        }
        friendly_method = method_names.get(solution.get("method_used"), "Optimización General")
        
        # Recuperar de forma segura el valor objetivo para el formateo
        obj_value = solution.get("objective_value", 0)
        formatted_cost = f"{obj_value:,}" if obj_value is not None else "0"

        # 1. Diseñar un prompt sumamente descriptivo
        prompt = f"""
        Actúa como un Consultor Experto en Inteligencia de Negocios y Optimización Logística. 
        Analiza el siguiente problema de Investigación de Operaciones resuelto por nuestro sistema:

        --- CONTEXTO DEL PROBLEMA ---
        - Orígenes disponibles: {payload.origins_names} con capacidades respectivas de {payload.supply} unidades.
        - Destinos/Clientes: {payload.destinations_names} con demandas respectivas de {payload.demand} unidades.
        - Matriz de Costos Unitarios: {payload.costs_matrix} (donde la fila i representa el origen y la columna j el destino).

        --- SOLUCIÓN OBTENIDA ---
        - Heurística utilizada: {friendly_method} ({solution.get('method_used')}).
        - Costo Total de Distribución Calculado: ${formatted_cost} MXN.
        - Detalle de la Asignación: {solution.get('variables')}

        --- INSTRUCCIONES DE RESPUESTA ---
        Escribe un informe de análisis ejecutivo resumido, claro y profesional orientado a la toma de decisiones. Debes estructurarlo usando los siguientes puntos en Markdown:
        1. **Resumen Ejecutivo**: Explica de manera sencilla qué significa este costo de ${formatted_cost} MXN para la operación.
        2. **Análisis del Algoritmo Seleccionado**: Menciona brevemente si el método utilizado ({friendly_method}) suele ser el más óptimo o si es una aproximación inicial (por ejemplo, si usó Esquina Noroeste, advierte que no considera los costos y que podría haber una mejor opción; si usó Vogel, destaca que suele ser excelente).
        3. **Rutas Críticas / Recomendaciones**: Identifica qué rutas de distribución absorbieron más flujo y da 1 o 2 recomendaciones lógicas para mejorar los costos logísticos de la empresa basados en la matriz.

        Responde directamente con el análisis en español, usa un tono profesional pero accesible y de forma concisa para acelerar el procesamiento. Evita notas de sistema.
        """

        # 2. Configurar el JSON de petición optimizado para evitar cuellos de botella
        json_payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False,  # False para recibir la respuesta de un solo golpe
            "options": {
                "temperature": 0.5,     # Reducido ligeramente para mayor consistencia y velocidad
                "num_predict": 300,     # Reducido para acortar el tiempo de redacción de tokens masivos
                "num_thread": 4         # Fuerza a usar hilos de procesamiento en paralelo (CPU)
            }
        }

        # 3. Hacer la llamada HTTP sincrónica hacia Ollama con timeout extendido a 90 segundos
        try:
            with httpx.Client(timeout=90.0) as client:
                response = client.post(self.ollama_url, json=json_payload)
                response.raise_for_status()
                
                # Ollama por defecto responde con un JSON que contiene la clave "response"
                result_json = response.json()
                return result_json.get("response", "No se recibió una interpretación válida del modelo de lenguaje.")
                
        except httpx.ConnectError:
            raise Exception("No se pudo conectar con Ollama. Verifica que el servicio esté corriendo en http://localhost:11434")
        except httpx.HTTPStatusError as e:
            raise Exception(f"Error en el servidor de Ollama (Status: {e.response.status_code})")
        except Exception as e:
            raise Exception(f"Error inesperado al generar la interpretación de IA: {str(e)}")