from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.agents.state import AgentState
from app.tools import get_sap_requests
from app.core.llm import get_llm

def access_agent(state: AgentState):
    """
    Access Agent: Handles SAP GRC and permission requests.
    """
    model = get_llm()
    tools = [get_sap_requests]
    model = model.bind_tools(tools)

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Access Control Agent. You handle SAP GRC requests and permission approvals."),
        MessagesPlaceholder(variable_name="messages"),
    ])

    chain = prompt | model
    response = chain.invoke(state)
    
    return {"messages": [response]}
