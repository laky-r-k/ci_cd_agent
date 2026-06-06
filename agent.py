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


MODEL="gemini-2.5-flash-lite"
llm = ChatGoogleGenerativeAI(model=MODEL, temperature=0,google_api_key=GEMINI_API_KEY)

class TraceFixState(TypedDict):
    failure_log: str
    diagnosis: dict
    evaluation: dict


# ---------------- AGENTS ----------------

class Extractor:
    def invoke(self, state: TraceFixState):

        log = state["failure_log"]

        print("\n[Extractor]")
        print(log)

        return {
            "failure_log": log
        }


class DiagnosisAgent:

    def __init__(self, llm):
        self.llm = llm

    def invoke(self, state: TraceFixState):

        prompt = f"""
        You are a CI/CD debugging expert.

        Analyze this failure log.

        Return:
        - root_cause
        - confidence (0-1)
        - fix

        Log:
        {state['failure_log']}
        """

        response = self.llm.invoke(prompt)

        diagnosis = {
            "analysis": response.content
        }

        print("\n[Diagnosis Agent]")
        print(response.content)

        return {
            "diagnosis": diagnosis
        }


class JudgeAgent:

    def __init__(self, llm):
        self.llm = llm

    def invoke(self, state: TraceFixState):

        diagnosis = state["diagnosis"]

        prompt = f"""
        Evaluate the following diagnosis.

        Failure Log:
        {state['failure_log']}

        Diagnosis:
        {diagnosis}

        Give:
        - score out of 10
        - strengths
        - weaknesses
        """

        response = self.llm.invoke(prompt)

        evaluation = {
            "judge_feedback": response.content
        }

        print("\n[Judge Agent]")
        print(response.content)

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


# ---------------- RUN ----------------

initial_state = {
    "failure_log": "npm: command not found",
    "diagnosis": {},
    "evaluation": {}
}

result = graph.invoke(initial_state)

print("\nFINAL STATE")
print(result)