import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# Importación de Routers (Módulos de IO)
from app.routers import simplex, grafico, transporte

# 1. Inicializar la instancia de FastAPI primero
app = FastAPI(
    title="Plataforma Web de Investigación de Operaciones con IA",
    description="Backend modular para resolver métodos Simplex, Gráfico y Transporte con explicaciones de IA.",
    version="1.0.0"
)

# 2. Configuración de CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, se cambia por la URL del frontend en React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Registro de Rutas/Endpoints (Bajo el prefijo de la API v1)
app.include_router(simplex.router, prefix="/api/v1")
app.include_router(grafico.router, prefix="/api/v1")
app.include_router(transporte.router, prefix="/api/v1")

# Endpoint base de prueba general
@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Servidor backend de Investigación de Operaciones funcionando correctamente.",
        "modules": ["Simplex", "Gráfico", "Transporte", "IA Explicativa"]
    }

# WebSocket interactivo para telemetría y respuestas asíncronas
@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Recibe datos o eventos del cliente (frontend)
            data = await websocket.receive_text()
            # Espacio reservado para métricas de OpenTelemetry / Logs en fases posteriores
            await websocket.send_text(f"Métrica recibida en el servidor: {data}")
    except WebSocketDisconnect:
        print("Cliente de telemetría desconectado.")