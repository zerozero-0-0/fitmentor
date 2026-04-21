from dotenv import load_dotenv
from google import genai
from google.genai import types

from app.models import Exercise, SuggestResponse, WorkoutSessionRead
from app.prompts.suggest_menu import build_suggest_prompt

load_dotenv()

_MODEL = "gemini-3-flash-preview"


def make_response(prompt: str) -> str:
    client = genai.Client()
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=[prompt],
    )
    if not response.candidates:
        return "Failed to generate a response."
    return response.text or "Failed to generate a response."


def suggest_menu(
    condition: int,
    available_hours: int,
    recent_sessions: list[WorkoutSessionRead],
    exercises: list[Exercise],
) -> SuggestResponse:
    client = genai.Client()
    prompt = build_suggest_prompt(
        condition, available_hours, recent_sessions, exercises
    )

    response = client.models.generate_content(
        model=_MODEL,
        contents=[prompt],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=SuggestResponse,
        ),
    )

    if not response.text:
        raise ValueError("Gemini returned empty response")

    return SuggestResponse.model_validate_json(response.text)
