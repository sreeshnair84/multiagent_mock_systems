"""
Outlook Agent with Long-Term Memory
Handles email operations ONLY via Outlook MCP server (port 8006)
Includes memory tools for user preferences and conversation context
"""
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.agents.state import AgentState
from app.core.llm import get_llm
from app.mcp.mcp_client import get_tools_for_server
from app.tools.memory_tools import MEMORY_TOOLS


async def outlook_agent(state: AgentState):
    """
    Outlook Agent: Handles email operations through Exchange Online.
    Only calls Outlook MCP server (port 8006).
    Has access to long-term memory tools.
    """
    model = get_llm()
    
    # Get tools from Outlook MCP server + memory tools
    outlook_tools = await get_tools_for_server("outlook")
    all_tools = outlook_tools + MEMORY_TOOLS
    model = model.bind_tools(all_tools)

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are the Outlook Agent. You ONLY handle email operations through Microsoft Exchange Online.

Your ONLY available Outlook tools are from the Outlook MCP server (port 8006):
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
