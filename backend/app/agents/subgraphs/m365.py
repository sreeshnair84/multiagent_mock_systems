"""
M365 Agent Subgraph
Uses the updated async m365_agent with MCP tools
"""
from langgraph.graph import StateGraph, START, END
from app.agents.state import AgentState
from app.agents.m365_agent import m365_agent

def should_continue(state: AgentState):
    """Check if the agent wants to use tools"""
    last_message = state["messages"][-1]
    if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
        return "continue"
    return END

# Build simple graph - agent handles tools internally via LangGraph
builder = StateGraph(AgentState)
builder.add_node("agent", m365_agent)

builder.add_edge(START, "agent")
# The agent will handle tool calls internally, so we just loop back or end
builder.add_conditional_edges("agent", should_continue, {"continue": "agent", END: END})

m365_graph = builder.compile()
