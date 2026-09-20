import os
from fastapi import FastAPI, Request
import uvicorn
import time

from agents.state import TraceFixState
from controller.pworkflow import Eventhandler
from core.phoenix_setup import setup_phoenix

from graphs.diagnosis_graph import create_diagnosis_graph
from graphs.judge_graph import create_judge_graph


from langchain_google_genai import ChatGoogleGenerativeAI
from config import GEMINI_API_KEY

from controller.pworkflow import is_new_error


setup_phoenix()

app = FastAPI()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-lite",
    temperature=0,
    google_api_key=GEMINI_API_KEY
)

DIAGNOSIS_GRAPH = create_diagnosis_graph(llm)
JUDGE_GRAPH = create_judge_graph(llm)



router = Eventhandler(
    DIAGNOSIS_GRAPH,
    JUDGE_GRAPH
)


@app.post("/github-webhook")
async def github_webhook(request: Request):
    payload = await request.json()
    #print(payload)

    event = {
        "repo": payload["repository"]["full_name"],
        "commit": payload["after"],
        "previous": payload["before"],
        "message": payload["commits"][0]["message"]
    }

    initial_state: TraceFixState = {
        "failure_log": "npm: command not found",
        "actual_fix": "Installed npm package globally",
        "diagnosis": {
            "root_cause": "",
            "confidence": 0.0,
            "fix": ""
        },
        "evaluation": {
            "score": 0.0,
            "verdict": "",
            "feedback": ""
        }
    }

    time.sleep(30)

    router.handle(initial_state)

    return {
        "status": initial_state
    }


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000
    )