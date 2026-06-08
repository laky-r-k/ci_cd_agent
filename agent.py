import operator
from typing import TypedDict, Annotated, List, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage
from langgraph.graph import StateGraph, END, START
import os
from  google import genai
# --- CONFIGURATION ---
# Replace with your actual key or load from os.environ
# GEMINI_API_KEY = "Your-Key-Here" 
try:
    from config import GEMINI_API_KEY
except ImportError:
    GEMINI_API_KEY =  os.getenv("GEMINI_API_KEY")

from phoenix.otel import register
from openinference.instrumentation.langchain import LangChainInstrumentor

tracer_provider = register(
    project_name="tracefix",
    auto_instrument=True
)
LangChainInstrumentor().instrument()

MODEL="gemini-2.5-flash-lite"
llm = ChatGoogleGenerativeAI(model=MODEL, temperature=0,google_api_key=GEMINI_API_KEY)

# ---------------- STATE TYPES ----------------

class Diagnosis(TypedDict):
    root_cause: str
    confidence: float
    fix: str


class Evaluation(TypedDict):
    score: float
    verdict: str
    feedback: str


class TraceFixState(TypedDict):
    failure_log: str
    actual_fix: str
    diagnosis: Diagnosis
    evaluation: Evaluation


# ---------------- AGENTS ----------------

class Extractor:

    def invoke(self, state: TraceFixState):

        print("\n[Extractor]")
        print("Failure Log:")
        print(state["failure_log"])

        return {}


class DiagnosisAgent:

    def __init__(self, llm):
        self.llm = llm

    def invoke(self, state: TraceFixState):

        prompt = f"""
You are a CI/CD debugging expert.

Analyze the following CI/CD failure log.

Return:
1. Root cause
2. Confidence (0-1)
3. Recommended fix

Failure Log:
{state['failure_log']}
"""

        response = self.llm.invoke(prompt)

        print("\n[Diagnosis Agent]")
        print(response.content)

        # For now we'll create structured output manually.
        # Later we'll make Gemini return JSON.

        diagnosis: Diagnosis = {
            "root_cause": "Missing npm installation",
            "confidence": 0.95,
            "fix": "Install npm and ensure it is available in PATH"
        }

        return {
            "diagnosis": diagnosis
        }


class JudgeAgent:

    def __init__(self, llm):
        self.llm = llm

    def invoke(self, state: TraceFixState):

        diagnosis = state["diagnosis"]

        prompt = f"""
You are an evaluator.

Failure Log:
{state['failure_log']}

Predicted Root Cause:
{diagnosis['root_cause']}

Predicted Fix:
{diagnosis['fix']}

Actual Fix:
{state['actual_fix']}

Evaluate whether the diagnosis appears correct.
"""

        response = self.llm.invoke(prompt)

        print("\n[Judge Agent]")
        print(response.content)

        evaluation: Evaluation = {
            "score": 9.0,
            "verdict": "Correct",
            "feedback": "Suggested fix matches the actual fix."
        }

        return {
            "evaluation": evaluation
        }


# ---------------- BUILD GRAPH ----------------

builder = StateGraph(TraceFixState)

extractor = Extractor()
diagnosis_agent = DiagnosisAgent(llm)
judge_agent = JudgeAgent(llm)

builder.add_node("extractor", extractor.invoke)
builder.add_node("diagnosis", diagnosis_agent.invoke)
builder.add_node("judge", judge_agent.invoke)

builder.add_edge(START, "extractor")
builder.add_edge("extractor", "diagnosis")
builder.add_edge("diagnosis", "judge")
builder.add_edge("judge", END)

graph = builder.compile()

# ---------------- INITIAL STATE ----------------

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

# ---------------- RUN ----------------

result = graph.invoke(initial_state)

print("\n========================")
print("FINAL STATE")
print("========================")

print(result)