"""
Access Management Agent with Long-Term Memory
Handles access requests and onboarding ONLY via Access Management MCP server (port 8005)
Includes memory tools for user preferences and conversation context
"""
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.agents.state import AgentState
from app.core.llm import get_llm
from app.mcp.mcp_client import get_tools_for_server
from app.tools.memory_tools import MEMORY_TOOLS


async def access_management_agent(state: AgentState):
    """
    Access Management Agent: Handles SAP-like access request workflows and user onboarding.
    Only calls Access Management MCP server (port 8005).
    Has access to long-term memory tools.
    """
    model = get_llm()
    
    # Get tools from Access Management MCP server + memory tools
    access_tools = await get_tools_for_server("access")
    all_tools = access_tools + MEMORY_TOOLS
    model = model.bind_tools(all_tools)

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are the Access Management Agent. You ONLY handle access request workflows and user onboarding processes.

Your ONLY available Access Management tools are from the Access Management MCP server (port 8005):
- submit_access_request: Submit new access requests for approval
- approve_request: Approve or reject access requests (requires Approver role)
- get_workflow_status: Check status of access requests
- notify_approver: Send notifications to approvers
- onboard_user: Orchestrate full user onboarding workflow

You also have access to MEMORY TOOLS to remember user preferences and context:
- save_user_preference: Save user preferences (e.g., default approvers, common resources)
- get_user_preferences: Retrieve saved user preferences
- save_conversation_context: Save important context (e.g., pending requests, onboarding workflows)
- get_conversation_context: Retrieve conversation context
- search_conversation_history: Search past conversations

Use memory tools to:
- Remember frequently requested resources
- Save common approval patterns
- Track onboarding workflows in progress
- Remember SLA requirements and deadlines

You do NOT have direct access to user management, devices, or tickets.
The onboard_user tool internally coordinates with other services, but you should not call other agents' tools directly.

Follow the 48-hour SLA for access requests. Ensure proper role validation for approvals."""),
        MessagesPlaceholder(variable_name="messages"),
    ])

    chain = prompt | model
    response = await chain.ainvoke(state)
    
    return {
        "messages": [response]
    }
