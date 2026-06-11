Terminal 1 — Start Phoenix

Activate your venv:

cd ~/Desktop/hackathons/ci_cd_agent
source .venv/bin/activate

Start Phoenix:

phoenix serve

You should see:

Phoenix server running

http://localhost:6006

Keep this terminal open.






Terminal 2 — Start FastAPI

Same project:

cd ~/Desktop/hackathons/ci_cd_agent
source .venv/bin/activate

Run:

uvicorn server:app --reload

or:

python server.py

You should see:

Uvicorn running on http://127.0.0.1:8000

Keep this open.







Terminal 3 — Start ngrok

Run:

ngrok http 8000



Output:

Forwarding

https://xxxx.ngrok-free.app
       |
       v
http://localhost:8000

Copy:

https://xxxx.ngrok-free.app








Your GitHub webhook URL becomes:

https://xxxx.ngrok-free.app/github-webhook
Check everything

You should have:

Phoenix
localhost:6006
      ↑
      |
FastAPI
localhost:8000
      ↑
      |
ngrok
public URL
      ↑
      |
GitHub webhook