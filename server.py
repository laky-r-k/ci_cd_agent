from fastapi import FastAPI, Request
import uvicorn
from controller.event_router import EventRouter
app = FastAPI()
router = EventRouter()

@app.post("/github-webhook")
async def github_webhook(request: Request):

    payload = await request.json()


    event = {
        "repo": payload["repository"]["full_name"],
        "commit": payload["after"],
        "previous": payload["before"],
    }


    router.handle_event(event)


    return {"status":"ok"}


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000
    )