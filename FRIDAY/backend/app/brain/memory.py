from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client = AsyncIOMotorClient(settings.MONGODB_URI)
db = client['friday_memory']
short_term = db['short_term']
long_term = db['long_term']

async def add_memory(session_id: str, role: str, content: str):
    await short_term.insert_one({
        "session_id": session_id,
        "role": role,
        "content": content
    })

async def get_session_history(session_id: str):
    cursor = short_term.find({"session_id": session_id}).sort("_id", 1)
    return [doc async for doc in cursor]
