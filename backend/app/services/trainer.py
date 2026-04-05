from google import genai
from dotenv import load_dotenv

load_dotenv()

def make_response(prompt: str) -> str:
    client = genai.Client()
    
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=[prompt],
    )
    
    return response.text

if __name__ == "__main__":
    make_response("What is the best way to lose weight?")