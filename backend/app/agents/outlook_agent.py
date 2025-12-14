"""
Outlook Agent with Long-Term Memory
Handles email operations via MCP server
Includes memory tools for user preferences and conversation context
"""
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.agents.state import AgentState
from app.core.llm import get_llm
from app.mcp.mcp_client_langgraph import get_mcp_tools
from app.tools.memory_tools import MEMORY_TOOLS
import logging

logger = logging.getLogger(__name__)


async def outlook_agent(state: AgentState):
    """
    Outlook Agent: Handles email operations through Exchange Online.
    Uses MCP tools via LangGraph client.
    Has access to long-term memory tools.
    """
    try:
        model = get_llm()
        
        # Get Outlook tools from MCP server + memory tools
        outlook_tools = await get_mcp_tools(prefix="outlook_")
        all_tools = outlook_tools + MEMORY_TOOLS
        
        if not outlook_tools:
            logger.warning("No Outlook tools found from MCP server")
        
        model = model.bind_tools(all_tools)

        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are the Outlook Agent. You ONLY handle email operations through Microsoft Exchange Online.

Your available Outlook tools from the MCP server:
- send_email: Send emails to recipients
- get_emails: Fetch emails with optional filters (recipient, status)
- mark_read: Mark emails as read
- extract_approval: Extract approval actions from emails

You also have access to MEMORY TOOLS to remember user preferences and context:
- save_user_preference: Save user preferences (e.g., email signature, default recipients)
- get_user_preferences: Retrieve saved user preferences
- save_conversation_context: Save important context (e.g., ongoing email threads, pending approvals)
- get_conversation_context: Retrieve conversation context
- search_conversation_history: Search past conversations

Use memory tools to:
- Remember frequently contacted recipients
- Save email templates or common subjects
- Track approval workflows in progress
- Remember email patterns and preferences

You do NOT have access to user management, devices, or tickets.
If the user asks for user management, redirect them to the M365 agent.
If the user asks for tickets, redirect them to the ServiceNow agent."""),
            MessagesPlaceholder(variable_name="messages"),
        ])

        chain = prompt | model
        response = await chain.ainvoke(state)
        
        return {
            "messages": [response]
        }
    except Exception as e:
        logger.error(f"Error in outlook_agent: {e}")
        raise
