from phoenix.otel import register
from openinference.instrumentation.langchain import LangChainInstrumentor


def setup_phoenix():

    register(
        project_name="tracefix",
        auto_instrument=True
    )


    LangChainInstrumentor().instrument()


    print("Phoenix tracing enabled")