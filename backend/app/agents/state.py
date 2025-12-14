from typing import Annotated, Sequence, TypedDict, Union, List
from langchain_core.messages import BaseMessage
from langgraph.graph import add_messages

class AgentState(TypedDict):
    """
    The state of the agent graph.
    """
    messages: Annotated[List[BaseMessage], add_messages]
    # The 'next' field records which agent should be called next.
    next: str
    # Optional: store structured outputs or tool calls
    outputs: dict
    # Workflow context (e.g., 'INTUNE_COPILOT', 'ACCESS_WORKFLOW')
    workflow: str
