from langgraph.graph import StateGraph, START, END
from app.agents.state import AgentState
from app.agents.workflow_agent import workflow_agent

def create_workflow_subgraph():
    workflow = StateGraph(AgentState)
    
    # Add Workflow agent node
    workflow.add_node("workflow_agent", workflow_agent)
    
    # Simple flow: START -> agent -> END
    workflow.add_edge(START, "workflow_agent")
    workflow.add_edge("workflow_agent", END)
    
    return workflow.compile()

workflow_graph = create_workflow_subgraph()
