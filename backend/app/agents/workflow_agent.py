"""
Workflow Agent with Long-Term Memory
Handles workflow checkpoints and resumption via MCP server
Includes memory tools for user preferences and conversation context
"""
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.agents.state import AgentState
from app.core.llm import get_llm
from app.mcp.mcp_client_langgraph import get_mcp_tools
from app.tools.memory_tools import MEMORY_TOOLS
import logging

logger = logging.getLogger(__name__)


async def workflow_agent(state: AgentState):
    """
    Workflow Agent: Handles workflow checkpoint management and resumption.
    Uses MCP tools via LangGraph client.
    Has access to long-term memory tools.
    """
    try:
        model = get_llm()
        
        # Get Workflow tools from MCP server + memory tools
        workflow_tools = await get_mcp_tools(prefix="workflow_")
        all_tools = workflow_tools + MEMORY_TOOLS
        
        if not workflow_tools:
            logger.warning("No Workflow tools found from MCP server")
        
        model = model.bind_tools(all_tools)

        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are the Workflow Agent. You ONLY handle workflow checkpoint management and resumption for long-running processes.

Your available Workflow tools from the MCP server:
- replay_workflow: Replay workflow from a specific checkpoint
- terminate_workflow: Force terminate a workflow
- resume_interrupted: Resume an interrupted workflow

You also have access to MEMORY TOOLS to remember user preferences and context:
- save_user_preference: Save user preferences (e.g., default checkpoint intervals, retry policies)
- get_user_preferences: Retrieve saved user preferences
- save_conversation_context: Save important context (e.g., active workflows, checkpoint history)
- get_conversation_context: Retrieve conversation context
- search_conversation_history: Search past conversations

Use memory tools to:
- Remember active workflows and their states
- Save checkpoint patterns and preferences
- Track workflow execution history
- Remember common workflow issues and resolutions

You do NOT have access to user management, devices, tickets, or emails.
You help manage the execution state of complex multi-step workflows."""),
            MessagesPlaceholder(variable_name="messages"),
        ])

        chain = prompt | model
        response = await chain.ainvoke(state)
        
        return {
            "messages": [response]
        }
    except Exception as e:
        logger.error(f"Error in workflow_agent: {e}")
        raise
