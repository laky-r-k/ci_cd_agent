from langgraph.graph import StateGraph,START,END

from agents.state import TraceFixState
from agents.judge import JudgeAgent



def create_judge_graph(llm):


    builder=StateGraph(
        TraceFixState
    )


    judge=JudgeAgent(llm)



    builder.add_node(
        "judge",
        judge.invoke
    )


    builder.add_edge(
        START,
        "judge"
    )


    builder.add_edge(
        "judge",
        END
    )


    return builder.compile()