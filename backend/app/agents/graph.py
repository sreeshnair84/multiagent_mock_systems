from langgraph.graph import StateGraph, START, END
from app.agents.state import AgentState
from app.agents.supervisor import supervisor_agent

# Import Subgraphs
from app.agents.subgraphs.servicenow import servicenow_graph

from app.agents.subgraphs.m365 import m365_graph
from app.agents.subgraphs.outlook import outlook_graph
from app.agents.subgraphs.access import access_graph
from app.agents.subgraphs.workflow import workflow_graph
from app.agents.subgraphs.context import knowledge_graph

async def create_supervisor_graph(checkpointer=None):
    workflow = StateGraph(AgentState)

    # Initialize Agents (Subgraphs)
    # Using lazy imports or direct async creation if needed
    from app.agents.intune_agent import create_intune_graph
    intune_graph = await create_intune_graph()
    
    # Add Nodes
    workflow.add_node("Supervisor", supervisor_agent)
    
    # Add Subgraphs as Nodes
    workflow.add_node("ServiceNow", servicenow_graph)
    workflow.add_node("Intune", intune_graph)
    workflow.add_node("M365", m365_graph)
    workflow.add_node("Outlook", outlook_graph)
    workflow.add_node("Access", access_graph)
    workflow.add_node("Workflow", workflow_graph)
    workflow.add_node("Knowledge", knowledge_graph)

    # Define Edges
    workflow.add_edge(START, "Supervisor")

    # Supervisor Routing
    def route_supervisor(state: AgentState):
        return state["next"] 

    # Map supervisor choices to node names
    workflow.add_conditional_edges(
        "Supervisor",
        route_supervisor,
        {
            "ServiceNow": "ServiceNow",
            "Intune": "Intune",
            "M365": "M365",
            "Outlook": "Outlook",
            "Access": "Access",
            "Workflow": "Workflow",
            "Knowledge": "Knowledge",
            "FINISH": END
        }
    )

    # Return control to supervisor after subgraph finishes
    workflow.add_edge("ServiceNow", "Supervisor")
    workflow.add_edge("Intune", "Supervisor")
    workflow.add_edge("M365", "Supervisor")
    workflow.add_edge("Outlook", "Supervisor")
    workflow.add_edge("Access", "Supervisor")
    workflow.add_edge("Workflow", "Supervisor")
    workflow.add_edge("Knowledge", "Supervisor")

    return workflow.compile(checkpointer=checkpointer)
