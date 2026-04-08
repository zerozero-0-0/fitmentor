from fastapi import FastAPI

from app.services.trainer import make_response

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}    
    
@app.get("/gemini")
async def make_gemini_response(input: str):
    response = make_response(input)
    return {"response": response}    
