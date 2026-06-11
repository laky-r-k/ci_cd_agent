from typing import TypedDict


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