from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from app.agents.state import AgentState
from app.core.rag import get_retriever
from app.core.llm import get_llm
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.tools import tool

@tool
def search_knowledge_base(query: str):
    """Searches the internal Knowledge Base (HR Policies, IT SOPs) for information."""
    retriever = get_retriever()
    docs = retriever.invoke(query)
    return "\n\n".join([d.page_content for d in docs])

def knowledge_agent_node(state: AgentState):
    model = get_llm()
    tools = [search_knowledge_base]
    model = model.bind_tools(tools)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Knowledge Agent. You answer questions using the search_knowledge_base tool. Always search before answering."),
        MessagesPlaceholder(variable_name="messages"),
    ])
    
    chain = prompt | model
    response = chain.invoke(state)
    return {"messages": [response]}

def should_continue(state: AgentState):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return END

builder = StateGraph(AgentState)
builder.add_node("agent", knowledge_agent_node)
builder.add_node("tools", ToolNode([search_knowledge_base]))

builder.add_edge(START, "agent")
builder.add_conditional_edges("agent", should_continue, ["tools", END])
builder.add_edge("tools", "agent")

knowledge_graph = builder.compile()
