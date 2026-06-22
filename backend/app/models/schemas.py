from pydantic import BaseModel, Field
from typing import List, Literal

class Constraint(BaseModel):
    coefficients: List[float] = Field(..., description="Coeficientes de las variables en la restricción. Ej: [6, 4]")
    sign: Literal["<=", ">=", "="] = Field("<=", description="Signo de la restricción")
    rhs: float = Field(..., description="Valor del lado derecho de la restricción (Right-Hand Side). Ej: 24")

class IOInputBase(BaseModel):
    objective_type: Literal["MAX", "MIN"] = Field("MAX", description="Tipo de optimización: Maximizar o Minimizar")
    objective_coefficients: List[float] = Field(..., description="Coeficientes de la función objetivo. Ej: [5, 4]")
    constraints: List[Constraint] = Field(..., description="Lista de restricciones del problema")

# Schema específico para el Método Simplex (Soporta 'n' variables)
class SimplexInput(IOInputBase):
    pass

# Schema específico para el Método Gráfico (Estrictamente limitado a 2 variables)
class GraphicInput(IOInputBase):
    def validate_variables(self):
        if len(self.objective_coefficients) != 2:
            raise ValueError("El método gráfico requiere estrictamente 2 variables de decisión.")
        for c in self.constraints:
            if len(c.coefficients) != 2:
                raise ValueError("Todas las restricciones en el método gráfico deben tener 2 coeficientes.")
            
class TransportInput(BaseModel):
    origins_names: List[str] = Field(..., description="Nombres de los puntos de origen. Ej: ['Fábrica A', 'Fábrica B']")
    destinations_names: List[str] = Field(..., description="Nombres de los puntos de destino. Ej: ['Cliente 1', 'Cliente 2', 'Cliente 3']")
    costs_matrix: List[List[float]] = Field(..., description="Matriz de costos de transporte de tamaño (orígenes x destinos)")
    supply: List[float] = Field(..., description="Vector de capacidades de oferta de cada origen")
    demand: List[float] = Field(..., description="Vector de requerimientos de demanda de cada destino")
    method: Literal["NRE", "MCM", "VOGEL"] = Field(..., description="Método de aproximación inicial a utilizar: NRE (Esquina Noroeste), MCM (Costo Mínimo), VOGEL (Aproximación de Vogel)")