from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from app.agents.state import AgentState
from app.tools import get_m365_users, get_outlook_emails
from app.core.llm import get_llm
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

def m365_agent_node(state: AgentState):
    model = get_llm()
    tools = [get_m365_users, get_outlook_emails]
    model = model.bind_tools(tools)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the M365 Agent. You manage users, licenses, and email strategy."),
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
builder.add_node("agent", m365_agent_node)
builder.add_node("tools", ToolNode([get_m365_users, get_outlook_emails]))

builder.add_edge(START, "agent")
builder.add_conditional_edges("agent", should_continue, ["tools", END])
builder.add_edge("tools", "agent")

m365_graph = builder.compile()
