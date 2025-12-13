"""
Workflow Agent with Long-Term Memory
Handles workflow checkpoints and resumption ONLY via Workflow MCP server (port 8007)
Includes memory tools for user preferences and conversation context
"""
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.agents.state import AgentState
from app.core.llm import get_llm
from app.mcp.mcp_client import get_tools_for_server
from app.tools.memory_tools import MEMORY_TOOLS


async def workflow_agent(state: AgentState):
    """
    Workflow Agent: Handles workflow checkpoint management and resumption.
    Only calls Workflow MCP server (port 8007).
    Has access to long-term memory tools.
    """
    model = get_llm()
    
    # Get tools from Workflow MCP server + memory tools
    workflow_tools = await get_tools_for_server("workflow")
    all_tools = workflow_tools + MEMORY_TOOLS
    model = model.bind_tools(all_tools)

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are the Workflow Agent. You ONLY handle workflow checkpoint management and resumption for long-running processes.

Your ONLY available Workflow tools are from the Workflow MCP server (port 8007):
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
