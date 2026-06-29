import httpx
from typing import Union
from app.models.schemas import SimplexInput, GraphicInput, TransportInput

class IAService:
    def __init__(self, model_name: str = "llama3", ollama_url: str = "http://localhost:11434"):
        self.model_name = model_name
        self.ollama_url = f"{ollama_url}/api/generate"

    def _call_ollama(self, prompt: str) -> str:
        """Método privado para centralizar las peticiones HTTP a Ollama"""
        json_payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.5,
                "num_predict": 300,
                "num_thread": 4
            }
        }
        try:
            with httpx.Client(timeout=90.0) as client:
                response = client.post(self.ollama_url, json=json_payload)
                response.raise_for_status()
                return response.json().get("response", "No se recibió una interpretación válida.")
        except httpx.ConnectError:
            raise Exception("No se pudo conectar con Ollama. Verifica que esté corriendo en localhost:11434")
        except Exception as e:
            raise Exception(f"Error en Ollama: {str(e)}")

    def generate_interpretation(self, payload: Union[SimplexInput, GraphicInput, TransportInput], solution: dict) -> str:
        """
        Detecta automáticamente el tipo de problema y genera el análisis correspondiente.
        """
        # CASO 1: PROBLEMAS DE TRANSPORTE
        if hasattr(payload, 'origins_names'):
            method_names = {
                "NRE": "Método de la Esquina Noroeste",
                "MCM": "Método del Costo Mínimo",
                "VOGEL": "Método de Aproximación de Vogel"
            }
            friendly_method = method_names.get(solution.get("method_used"), "Optimización de Transporte")
            obj_value = solution.get("objective_value", 0)
            formatted_cost = f"{obj_value:,}" if obj_value is not None else "0"

            prompt = f"""
            Actúa como un Consultor Experto en Optimización Logística.
            Analiza el siguiente problema de Transporte:

            --- CONTEXTO ---
            - Orígenes: {payload.origins_names} con capacidades {payload.supply}.
            - Destinos: {payload.destinations_names} con demandas {payload.demand}.
            - Matriz Costos: {payload.costs_matrix}

            --- SOLUCIÓN ---
            - Heurística: {friendly_method}.
            - Costo Total: ${formatted_cost} MXN.
            - Asignación: {solution.get('variables')}

            Escribe en español un informe usando:
            1. **Resumen Ejecutivo**: Qué significa este costo de ${formatted_cost} MXN.
            2. **Análisis del Algoritmo**: Evaluación corta del método ({friendly_method}).
            3. **Rutas Críticas**: Qué rutas absorbieron más flujo y sugerencia de mejora.
            """
            return self._call_ollama(prompt)

        # CASO 2: SIMPLEX O MÉTODO GRÁFICO (Optimización Lineal Tradicional)
        else:
            tipo_metodo = "Método Gráfico (2 Variables)" if len(payload.objective_coefficients) == 2 else "Método Simplex General"
            obj_type = "Maximizar" if payload.objective_type == "MAX" else "Minimizar"
            obj_value = solution.get("objective_value", 0)
            
            prompt = f"""
            Actúa como un Consultor Experto en Investigación de Operaciones.
            Analiza el siguiente modelo de programación lineal resuelto:

            --- CONFIGURACIÓN DEL MODELO ---
            - Objetivo: {obj_type} la función con coeficientes {payload.objective_coefficients}.
            - Restricciones: {[{'coef': c.coefficients, 'sign': c.sign, 'rhs': c.rhs} for c in payload.constraints]}

            --- RESULTADOS ---
            - Método empleado: {tipo_metodo}.
            - Valor Óptimo de Z (Función Objetivo): {obj_value}
            - Valores de las Variables de Decisión: {solution.get('variables')}

            Escribe en español un análisis ejecutivo rápido usando:
            1. **Interpretación del Óptimo**: Explica el rendimiento máximo/mínimo alcanzado ({obj_value}).
            2. **Uso de Recursos**: Analiza cómo impactan las restricciones según las variables finales.
            3. **Recomendación Operativa**: Qué decisión estratégica debe tomar el negocio con estos números.
            """
            return self._call_ollama(prompt)