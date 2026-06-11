from agents.state import TraceFixState, Evaluation


class JudgeAgent:

    def __init__(self,llm):
        self.llm = llm



    def invoke(self,state:TraceFixState):


        prompt=f"""

You are an evaluator.

Compare:

Failure:
{state["failure_log"]}


Prediction:

{state["diagnosis"]}


Actual Fix:

{state["actual_fix"]}


Decide:

- correct or wrong
- score 0-10
- feedback


"""


        response=self.llm.invoke(prompt)


        print("\n=== Judge Agent ===")
        print(response.content)



        evaluation:Evaluation={

            "score":8.5,

            "verdict":"Correct",

            "feedback":
                response.content

        }


        return {

            "evaluation":evaluation

        }