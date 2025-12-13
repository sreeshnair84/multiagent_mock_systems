"""
M365 User Management Agent with Long-Term Memory
Handles user management ONLY via M365 MCP server (port 8004)
Includes memory tools for user preferences and conversation context
"""
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.agents.state import AgentState
from app.core.llm import get_llm
from app.mcp.mcp_client import get_tools_for_server
from app.tools.memory_tools import MEMORY_TOOLS


async def m365_agent(state: AgentState):
    """
    M365 Agent: Handles user identity management (Entra ID).
    Only calls M365 User Management MCP server (port 8004).
    Has access to long-term memory tools.
    """
    model = get_llm()
    
    # Get tools from M365 User Management MCP server + memory tools
    m365_tools = await get_tools_for_server("m365")
    all_tools = m365_tools + MEMORY_TOOLS
    model = model.bind_tools(all_tools)

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are the M365 User Management Agent. You ONLY handle user identities and roles through Microsoft Entra ID (formerly Azure AD).

Your ONLY available M365 tools are from the M365 User Management MCP server (port 8004):
- get_user_roles: Fetch user roles by email
- create_user: Create new user accounts
- list_users: List users with optional filters (status, role)
- deactivate_user: Deactivate user accounts
- generate_token: Generate JWT authentication tokens

You also have access to MEMORY TOOLS to remember user preferences and context:
- save_user_preference: Save user preferences (e.g., default user role, preferred filters)
- get_user_preferences: Retrieve saved user preferences
- save_conversation_context: Save important context (e.g., users being managed, onboarding workflows)
- get_conversation_context: Retrieve conversation context
- search_conversation_history: Search past conversations

Use memory tools to:
- Remember frequently managed users or groups
- Save user's preferred role assignments
- Track onboarding workflows in progress
- Remember organizational patterns

You do NOT have access to email (Outlook), devices, or tickets.
If the user asks for email operations, redirect them to the Outlook agent.
If the user asks for device management, redirect them to the Intune agent."""),
        MessagesPlaceholder(variable_name="messages"),
    ])

    chain = prompt | model
    response = await chain.ainvoke(state)
    
    return {
        "messages": [response]
    }
