from fastapi import FastAPI, Request
import uvicorn
import os

from controller.event_router import EventRouter, IncidentStore
from core.phoenix_setup import setup_phoenix

from graphs.diagnosis_graph import create_diagnosis_graph
from graphs.judge_graph import create_judge_graph

from services.github_service import GitHubService

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


github_service = GitHubService()

incident_store = IncidentStore()


router = EventRouter(
    DIAGNOSIS_GRAPH,
    JUDGE_GRAPH,
    github_service,
    incident_store
)



@app.post("/github-webhook")
async def github_webhook(request: Request):

    payload = await request.json()
    print(payload)


    event = {

        "repo":
            payload["repository"]["full_name"],

        "commit":
            payload["after"],

        "previous":
            payload["before"],

        "message":
            payload["commits"][0]["message"]
    }



    print(is_new_error())


    return {
        "status":"ok"
    }



if __name__ == "__main__":

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000
    )