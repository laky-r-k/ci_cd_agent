from fastapi import FastAPI, Request
import uvicorn

app = FastAPI()


@app.post("/github-webhook")
async def github_webhook(request: Request):

    payload = await request.json()

    event = payload.get("action")

    print("GitHub Event Received")

    # get commit information
    commits = payload.get("commits", [])

    for commit in commits:
        print(
            "Commit:",
            commit["id"]
        )

    # later:
    # call diagnosis graph
    # or judge graph

    return {
        "status": "received"
    }


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000
    )