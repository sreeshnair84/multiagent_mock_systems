from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from app.agents.state import AgentState
from app.tools import get_servicenow_tickets
from app.core.llm import get_llm
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# 1. Define Agent Node
def servicenow_agent_node(state: AgentState):
    model = get_llm()
    tools = [get_servicenow_tickets]
    model = model.bind_tools(tools)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the ServiceNow Agent. You handle IT incidents and requests."),
        MessagesPlaceholder(variable_name="messages"),
    ])
    
    chain = prompt | model
    # We invoke with the full state (which has messages)
    response = chain.invoke(state)
    return {"messages": [response]}

# 2. Define Tools Check
def should_continue(state: AgentState):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return END

# 3. Build Graph
builder = StateGraph(AgentState)
builder.add_node("agent", servicenow_agent_node)
builder.add_node("tools", ToolNode([get_servicenow_tickets]))

builder.add_edge(START, "agent")
builder.add_conditional_edges(
    "agent",
    should_continue,
    {"tools": "tools", END: END}
)
builder.add_edge("tools", "agent")

servicenow_graph = builder.compile()
