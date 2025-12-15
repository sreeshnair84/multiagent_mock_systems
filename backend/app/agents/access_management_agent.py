"""
Access Management Agent with Long-Term Memory
Handles access requests and onboarding ONLY via Access Management MCP server (port 8005)
Includes memory tools for user preferences and conversation context
"""
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.agents.state import AgentState
from app.core.llm import get_llm
from app.mcp.mcp_client_langgraph import get_mcp_tools
from app.tools.memory_tools import MEMORY_TOOLS
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from typing import Literal


async def create_access_graph():
    """
    Creates the Access Management Workflow Graph.
    """
    model = get_llm()
    
    # Get tools from Access Management MCP server + memory tools
    # Using prefix matching for composite server
    access_tools = await get_mcp_tools(prefix="access")
    all_tools = access_tools + MEMORY_TOOLS
    model = model.bind_tools(all_tools)

    async def access_agent_node(state: AgentState):
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
        return {"messages": [response]}

    workflow = StateGraph(AgentState)
    workflow.add_node("agent", access_agent_node)
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
