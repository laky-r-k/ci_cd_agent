from langchain_google_genai import ChatGoogleGenerativeAI
from state import Diagnosis, TraceFixState


class DiagnosisAgent:

    def __init__(self, llm):
        self.llm = llm


    def invoke(self, state: TraceFixState):

        prompt = f"""

You are a CI/CD debugging expert.

Analyze this failure.

Return:

Root cause
Confidence
Fix


Failure:

{state["failure_log"]}

"""


        response = self.llm.invoke(prompt)


        print("\n=== Diagnosis Agent ===")
        print(response.content)



        # temporary structured output
        # later replace with Gemini JSON output

        diagnosis: Diagnosis = {

            "root_cause":
                response.content,

            "confidence":
                0.8,

            "fix":
                "Apply recommended solution"

        }


        return {
            "diagnosis": diagnosis
        }