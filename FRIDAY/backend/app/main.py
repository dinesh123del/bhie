from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import logging
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info("New WebSocket connection established")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info("WebSocket disconnected")

    async def broadcast_message(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

@app.get("/")
def read_root():
    return {"status": "FRIDAY Systems Online", "api": "FastAPI"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive audio chunk or text command from frontend
            # Wait for text/binary data from the websocket
            data = await websocket.receive()
            
            if 'text' in data:
                payload = json.loads(data['text'])
                command = payload.get('command', '')
                logger.info(f"Received JSON payload: {command}")
                
                from app.brain.agent import generate_response
                from app.audio.tts import generate_speech
                import base64
                
                # Get reasoning
                answer = await generate_response(command)
                
                # Fetch audio bytes from ElevenLabs
                # Note: to not burn elevenlabs credits automatically, wrap it inside a try
                audio_b64 = ""
                try:
                    audio_bytes = generate_speech(answer)
                    if audio_bytes:
                        audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
                except:
                    pass
                
                response = {
                    "type": "agent_response",
                    "text": answer,
                    "audio": audio_b64,
                    "status": "complete"
                }
                await websocket.send_json(response)
                
            elif 'bytes' in data:
                # Handle binary audio stream for wake word or main query
                audio_bytes = data['bytes']
                logger.info(f"Received audio chunk of {len(audio_bytes)} bytes")
                
                # TODO: Send bytes to Whisper for STT
                
                # Mock
                await websocket.send_json({
                    "type": "audio_status",
                    "info": "Audio chunk received"
                })

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)
