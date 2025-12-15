
from typing import Annotated, Literal
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.agents.state import AgentState
from app.core.llm import get_llm
from app.mcp.mcp_client_langgraph import get_mcp_tools
from app.tools.memory_tools import MEMORY_TOOLS
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode

async def create_resource_graph():
    """
    Creates the Resource Provisioning Workflow Graph.
    Uses MCP tools.
    """
    model = get_llm()
    
    # We will grab all tools starting with 'resource_'
    # In composite_server.py/resource_mcp.py we need to ensure we mount them with prefix 'resource'
    resource_tools = await get_mcp_tools(prefix="resource_")
    all_tools = resource_tools + MEMORY_TOOLS
    
    model = model.bind_tools(all_tools)
    
    # Define the agent node
    async def resource_agent_node(state: AgentState):
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are the Azure Resource Provisioning Specialist.
            Your responsibilities:
            - Provision and manage Azure Virtual Machines.
            - Provision and manage Azure App Services (Web Apps).
            - Create and manage Resource Groups.
            - Create Service Accounts (Managed Identities).
            
            Tools available (resource_ prefix):
            - resource_list_resource_groups, resource_create_resource_group
            - resource_list_vms, resource_provision_vm, resource_get_vm_status
            - resource_list_app_services, resource_create_app_service
            - resource_list_service_accounts, resource_create_service_account
            
            Always confirm with the user before provisioning a new resource if details are missing.
            Locations: eastus, westus, northeurope, westeurope, southeastasia.
            
            If the user asks for "resources", list everything you can found in the requested group or all groups.
            """),
            MessagesPlaceholder(variable_name="messages"),
        ])
        
        chain = prompt | model
        response = await chain.ainvoke(state)
        return {"messages": [response]}

    # Define the graph
    workflow = StateGraph(AgentState)
    
    workflow.add_node("agent", resource_agent_node)
    workflow.add_node("tools", ToolNode(all_tools))
    
    workflow.add_edge(START, "agent")
    
    def should_continue(state: AgentState) -> Literal["tools", "end"]:
        messages = state["messages"]
        last_message = messages[-1]
        if last_message.tool_calls:
            return "tools"
        return "end"

    workflow.add_conditional_edges(
        "agent",
        should_continue,
        {
            "tools": "tools",
            "end": END
        }
    )
    
    workflow.add_edge("tools", "agent")
    
    return workflow.compile()
