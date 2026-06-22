// Configuración de la URL base del Backend de FastAPI
const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

export const ioApi = {
  /**
   * Envía un problema para ser resuelto por el método Simplex
   * @param {Object} payload Datos estructurados del problema (objective_type, coefficients, constraints)
   */
  solveSimplex: async (payload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/simplex/solve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error("Error en servicio Simplex:", error);
      return { success: false, message: "No se pudo conectar con el servidor backend." };
    }
  },

  /**
   * Envía un problema para ser resuelto por el método Gráfico
   */
  solveGraphic: async (payload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/grafico/solve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error("Error en servicio Gráfico:", error);
      return { success: false, message: "No se pudo conectar con el servidor backend." };
    }
  },

  /**
   * Envía un problema de Modelo de Transporte
   */
  solveTransport: async (payload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transporte/solve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error("Error en servicio de Transporte:", error);
      return { success: false, message: "No se pudo conectar con el servidor backend." };
    }
  }
};