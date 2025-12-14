from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.agents.state import AgentState
from app.core.llm import get_llm
from app.mcp.mcp_client_langgraph import get_mcp_tools
import logging

logger = logging.getLogger(__name__)

async def access_agent(state: AgentState):
    """
    Access Agent: Handles SAP GRC and permission requests.
    Uses MCP tools via LangGraph client.
    """
    try:
        model = get_llm()
        
        # Get access-related tools from MCP server
        tools = await get_mcp_tools(prefix="access_")
        
        if not tools:
            logger.warning("No access tools found from MCP server, using empty tool list")
            tools = []
        
        model = model.bind_tools(tools)

        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are the Access Control Agent. You handle SAP GRC requests and permission approvals."),
            MessagesPlaceholder(variable_name="messages"),
        ])

        chain = prompt | model
        response = await chain.ainvoke(state)
        
        return {"messages": [response]}
    except Exception as e:
        logger.error(f"Error in access_agent: {e}")
        raise

