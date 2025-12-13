"""
Intune Agent with Long-Term Memory
Handles device management ONLY via Intune MCP server (port 8002)
Includes memory tools for user preferences and conversation context
"""
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.agents.state import AgentState
from app.core.llm import get_llm
from app.mcp.mcp_client import get_tools_for_server
from app.tools.memory_tools import MEMORY_TOOLS


async def intune_agent(state: AgentState):
    """
    Intune Agent: Handles device management and compliance.
    Only calls Intune MCP server (port 8002).
    Has access to long-term memory tools.
    """
    model = get_llm()
    
    # Get tools from Intune MCP server + memory tools
    intune_tools = await get_tools_for_server("intune")
    all_tools = intune_tools + MEMORY_TOOLS
    model = model.bind_tools(all_tools)

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are the Intune Agent. You ONLY handle device management, enrollment, and compliance through Microsoft Intune.

Your ONLY available Intune tools are from the Intune MCP server (port 8002):
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
If the user asks for something outside device management, politely redirect them to the appropriate agent."""),
        MessagesPlaceholder(variable_name="messages"),
    ])

    chain = prompt | model
    response = await chain.ainvoke(state)
    
    return {
        "messages": [response]
    }
