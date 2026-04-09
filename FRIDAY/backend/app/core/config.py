from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FRIDAY AI System"
    OPENAI_API_KEY: str = ""
    ELEVENLABS_API_KEY: str = ""
    ELEVENLABS_VOICE_ID: str = "21m00Tcm4TlvDq8ikWAM"
    MONGODB_URI: str = "mongodb://localhost:27017"

    class Config:
        env_file = ".env"

settings = Settings()
