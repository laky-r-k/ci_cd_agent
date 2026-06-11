from langgraph.graph import StateGraph,START,END

from agents.state import TraceFixState
from agents.diagnosis import DiagnosisAgent



class Extractor:

    def invoke(self,state):

        print("\nExtractor")

        print(
            state["failure_log"]
        )

        return {}



def create_diagnosis_graph(llm):


    builder=StateGraph(
        TraceFixState
    )


    extractor=Extractor()

    diagnosis=DiagnosisAgent(llm)



    builder.add_node(
        "extractor",
        extractor.invoke
    )


    builder.add_node(
        "diagnosis",
        diagnosis.invoke
    )


    builder.add_edge(
        START,
        "extractor"
    )

    builder.add_edge(
        "extractor",
        "diagnosis"
    )


    builder.add_edge(
        "diagnosis",
        END
    )


    return builder.compile()