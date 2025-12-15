"""
Intune Agent with Long-Term Memory
Handles device management via MCP server
Includes memory tools for user preferences and conversation context
"""
from typing import Literal
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.agents.state import AgentState
from app.core.llm import get_llm
from app.mcp.mcp_client_langgraph import get_mcp_tools
from app.tools.memory_tools import MEMORY_TOOLS
from app.tools.rag_tools import consult_intune_sop
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
import logging

logger = logging.getLogger(__name__)


async def create_intune_graph():
    """
    Creates the Intune Management Workflow Graph.
    """
    model = get_llm()
    
    # Get Intune tools from MCP server + memory tools
    intune_tools = await get_mcp_tools(prefix="intune_")
    if not intune_tools:
        logger.warning("No Intune tools found from MCP server")
        
    all_tools = intune_tools + MEMORY_TOOLS + [consult_intune_sop]
    model = model.bind_tools(all_tools)
    
    async def intune_agent_node(state: AgentState):
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are the Intune Agent. You ONLY handle device management, enrollment, and compliance through Microsoft Intune.

Your available Intune tools from the MCP server:
- provision_device: Enroll new devices with profile assignment
- get_device_profile: Get device configuration and status
- list_devices: List devices with optional filters
- update_device_status: Update device enrollment status
- wipe_device: Remote wipe device (admin only, requires confirmation)

You also have access to MEMORY TOOLS to remember user preferences and context:
- save_user_preference: Save user preferences (e.g., default device profile, preferred OS)
- get_user_preferences: Retrieve saved user preferences
- save_conversation_context: Save important context (e.g., devices being managed, current issues)
- get_conversation_context: Retrieve conversation context
- search_conversation_history: Search past conversations

Use memory tools to:
- Remember which devices the user frequently manages
- Save user's preferred device profiles or configurations
- Remember device compliance issues or patterns
- Track device provisioning workflows

You do NOT have access to user management, tickets, or email tools.
If the user asks for something outside device management, politely redirect them to the appropriate agent.
        
You now have access to the 'Intune Device Provisioning SOP'. 
ALWAYS use the 'consult_intune_sop' tool if the user asks about:
- Provisioning steps or workflows
- Device profile details (Standard/Mobile/Executive)
- Compliance policies
- Device status definitions (Enrolled/Pending/Wiped)
- Wipe procedures
        
Do not hallucinate procedures. Consult the SOP."""),
            MessagesPlaceholder(variable_name="messages"),
        ])
        
        chain = prompt | model
        response = await chain.ainvoke(state)
        return {"messages": [response]}

    workflow = StateGraph(AgentState)
    workflow.add_node("agent", intune_agent_node)
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

