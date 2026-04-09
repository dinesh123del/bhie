import elevenlabs
from elevenlabs.client import ElevenLabs
from app.core.config import settings
import io

client = ElevenLabs(api_key=settings.ELEVENLABS_API_KEY)

def generate_speech(text: str) -> bytes:
    if not settings.ELEVENLABS_API_KEY:
        return b""
        
    try:
        audio_stream = client.generate(
            text=text,
            voice=settings.ELEVENLABS_VOICE_ID,
            model="eleven_monolingual_v1"
        )
        
        audio_bytes = b"".join([chunk for chunk in audio_stream if chunk])
        return audio_bytes
    except Exception as e:
        print(f"TTS Error: {e}")
        return b""
