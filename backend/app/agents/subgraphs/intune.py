from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from app.agents.state import AgentState
from app.tools import get_intune_devices
from app.core.llm import get_llm
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

def intune_agent_node(state: AgentState):
    model = get_llm()
    tools = [get_intune_devices]
    model = model.bind_tools(tools)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Intune Agent. You manage devices and compliance."),
        MessagesPlaceholder(variable_name="messages"),
    ])
    
    chain = prompt | model
    response = chain.invoke(state)
    return {"messages": [response]}

def should_continue(state: AgentState):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return END

builder = StateGraph(AgentState)
builder.add_node("agent", intune_agent_node)
builder.add_node("tools", ToolNode([get_intune_devices]))

builder.add_edge(START, "agent")
builder.add_conditional_edges("agent", should_continue, ["tools", END])
builder.add_edge("tools", "agent")

intune_graph = builder.compile()
