"""
M365 User Management Agent with Long-Term Memory
Handles user management via MCP server
Includes memory tools for user preferences and conversation context
"""
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.agents.state import AgentState
from app.core.llm import get_llm
from app.mcp.mcp_client_langgraph import get_mcp_tools
from app.tools.memory_tools import MEMORY_TOOLS
import logging

logger = logging.getLogger(__name__)


async def m365_agent(state: AgentState):
    """
    M365 Agent: Handles user identity management (Entra ID).
    Uses MCP tools via LangGraph client.
    Has access to long-term memory tools.
    """
    try:
        model = get_llm()
        
        # Get M365 tools from MCP server + memory tools
        m365_tools = await get_mcp_tools(prefix="m365_")
        all_tools = m365_tools + MEMORY_TOOLS
        
        if not m365_tools:
            logger.warning("No M365 tools found from MCP server")
        
        model = model.bind_tools(all_tools)

        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are the M365 User Management Agent. You ONLY handle user identities and roles through Microsoft Entra ID (formerly Azure AD).

Your available M365 tools from the MCP server:
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
    except Exception as e:
        logger.error(f"Error in m365_agent: {e}")
        raise
