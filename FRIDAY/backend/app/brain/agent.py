from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def generate_response(prompt: str, history: list = None):
    messages = [
        {"role": "system", "content": "You are FRIDAY, a highly intelligent and snarky AI assistant created by Tony Stark. Keep your responses concise and action-oriented."}
    ]
    
    if history:
        for msg in history[-10:]: # Get last 10 messages
            messages.append({"role": msg["role"], "content": msg["content"]})
            
    messages.append({"role": "user", "content": prompt})

    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=150
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error connecting to brain: {str(e)}"
