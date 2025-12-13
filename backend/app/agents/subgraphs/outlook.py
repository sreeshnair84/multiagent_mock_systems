from langgraph.graph import StateGraph, START, END
from app.agents.state import AgentState
from app.agents.outlook_agent import outlook_agent

def create_outlook_subgraph():
    workflow = StateGraph(AgentState)
    
    # Add Outlook agent node
    workflow.add_node("outlook_agent", outlook_agent)
    
    # Simple flow: START -> agent -> END
    workflow.add_edge(START, "outlook_agent")
    workflow.add_edge("outlook_agent", END)
    
    return workflow.compile()

outlook_graph = create_outlook_subgraph()
