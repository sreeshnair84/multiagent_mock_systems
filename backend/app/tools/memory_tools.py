"""
Memory Tools
Tools for reading and writing long-term memory across conversations
"""
from langchain.tools import tool, ToolRuntime
from typing import Dict, Any, List, Optional
from dataclasses import dataclass


@dataclass
class MemoryContext:
    """Context passed to memory tools"""
    user_id: str
    conversation_id: str


@tool
def save_user_preference(
    preference_key: str,
    preference_value: str,
    runtime: ToolRuntime[MemoryContext]
) -> str:
    """Save a user preference to long-term memory.
    
    Use this to remember user preferences like:
    - Communication style (formal, casual, technical)
    - Language preferences
    - Timezone
    - Notification preferences
    - Frequently used resources
    
    Args:
        preference_key: Key for the preference (e.g., "communication_style", "timezone")
        preference_value: Value to save
        runtime: Tool runtime with store and context
    
    Returns:
        Confirmation message
    """
    store = runtime.store
    user_id = runtime.context.user_id
    
    # Store in user preferences namespace
    namespace = ("user_preferences", user_id)
    
    # Get existing preferences or create new
    existing = store.get(namespace, "preferences")
    preferences = existing.value if existing else {}
    
    # Update preference
    preferences[preference_key] = preference_value
    
    # Save back to store
    store.put(namespace, "preferences", preferences)
    
    return f"Saved preference: {preference_key} = {preference_value}"


@tool
def get_user_preferences(
    runtime: ToolRuntime[MemoryContext]
) -> Dict[str, Any]:
    """Retrieve all user preferences from long-term memory.
    
    Returns:
        Dictionary of user preferences
    """
    store = runtime.store
    user_id = runtime.context.user_id
    
    namespace = ("user_preferences", user_id)
    preferences = store.get(namespace, "preferences")
    
    if preferences:
        return preferences.value
    return {}


@tool
def save_conversation_context(
    context_key: str,
    context_value: str,
    runtime: ToolRuntime[MemoryContext]
) -> str:
    """Save important context from the current conversation.
    
    Use this to remember:
    - Current project or task being discussed
    - Important decisions made
    - Action items
    - Relevant ticket/device/user IDs
    
    Args:
        context_key: Key for the context (e.g., "current_project", "active_ticket")
        context_value: Value to save
        runtime: Tool runtime with store and context
    
    Returns:
        Confirmation message
    """
    store = runtime.store
    user_id = runtime.context.user_id
    conversation_id = runtime.context.conversation_id
    
    namespace = ("conversation_context", user_id, conversation_id)
    
    # Get existing context or create new
    existing = store.get(namespace, "context")
    context = existing.value if existing else {}
    
    # Update context
    context[context_key] = context_value
    
    # Save back to store
    store.put(namespace, "context", context)
    
    return f"Saved context: {context_key} = {context_value}"


@tool
def get_conversation_context(
    runtime: ToolRuntime[MemoryContext]
) -> Dict[str, Any]:
    """Retrieve context from the current conversation.
    
    Returns:
        Dictionary of conversation context
    """
    store = runtime.store
    user_id = runtime.context.user_id
    conversation_id = runtime.context.conversation_id
    
    namespace = ("conversation_context", user_id, conversation_id)
    context = store.get(namespace, "context")
    
    if context:
        return context.value
    return {}


@tool
def search_conversation_history(
    query: str,
    runtime: ToolRuntime[MemoryContext],
    limit: int = 5
) -> List[Dict[str, Any]]:
    """Search through past conversation contexts using semantic search.
    
    Args:
        query: Search query (e.g., "tickets about network issues")
        runtime: Tool runtime with store and context
        limit: Maximum number of results to return
    
    Returns:
        List of matching conversation contexts
    """
    store = runtime.store
    user_id = runtime.context.user_id
    
    # Search across all conversation contexts for this user
    namespace = ("conversation_context", user_id)
    
    results = store.search(
        namespace,
        query=query,
        limit=limit
    )
    
    return [
        {
            "conversation_id": item.key,
            "context": item.value,
            "score": item.score if hasattr(item, 'score') else None
        }
        for item in results
    ]


# List of all memory tools
MEMORY_TOOLS = [
    save_user_preference,
    get_user_preferences,
    save_conversation_context,
    get_conversation_context,
    search_conversation_history
]
