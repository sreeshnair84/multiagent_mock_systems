"""
ServiceNow Agent with Long-Term Memory
Handles IT tickets and incidents via MCP server
Includes memory tools for user preferences and conversation context
"""
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.agents.state import AgentState
from app.core.llm import get_llm
from app.mcp.mcp_client_langgraph import get_mcp_tools
from app.tools.memory_tools import MEMORY_TOOLS
import logging

logger = logging.getLogger(__name__)


async def servicenow_agent(state: AgentState):
    """
    ServiceNow Agent: Handles IT tickets and incidents.
    Uses MCP tools via LangGraph client.
    Has access to long-term memory tools.
    """
    try:
        model = get_llm()
        
        # Get ServiceNow tools from MCP server + memory tools
        servicenow_tools = await get_mcp_tools(prefix="servicenow_")
        all_tools = servicenow_tools + MEMORY_TOOLS
        
        if not servicenow_tools:
            logger.warning("No ServiceNow tools found from MCP server")
        
        model = model.bind_tools(all_tools)

        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are the ServiceNow Agent. You ONLY handle IT incidents and service requests through the ServiceNow system.

Your available ServiceNow tools from the MCP server:
- create_ticket: Create new IT tickets
- get_ticket: Get ticket details by ID
- search_tickets: Search tickets with filters
- update_ticket_status: Update ticket status
- add_work_note: Add work notes to tickets
- update_ticket_tags: Update ticket tags
- escalate_ticket: Escalate ticket priority

You also have access to MEMORY TOOLS to remember user preferences and context:
- save_user_preference: Save user preferences (e.g., preferred ticket priority, notification style)
- get_user_preferences: Retrieve saved user preferences
- save_conversation_context: Save important context (e.g., active ticket IDs, current issues)
- get_conversation_context: Retrieve conversation context
- search_conversation_history: Search past conversations

Use memory tools to:
- Remember which tickets the user is currently working on
- Save user's preferred ticket categories or priorities
- Remember recurring issues or patterns
- Provide personalized service based on past interactions

You do NOT have access to user management, device management, or email tools.
If the user asks for something outside ServiceNow tickets, politely redirect them to the appropriate agent."""),
            MessagesPlaceholder(variable_name="messages"),
        ])

        chain = prompt | model
        response = await chain.ainvoke(state)
        
        return {
            "messages": [response]
        }
    except Exception as e:
        logger.error(f"Error in servicenow_agent: {e}")
        raise
