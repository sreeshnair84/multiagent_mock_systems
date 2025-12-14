"""
Memory Tools
Tools for reading and writing long-term memory across conversations
"""
from langchain.tools import tool
from typing import Dict, Any, List
from dataclasses import dataclass


# Simple in-memory storage for demo purposes
# In production, this should use a proper database
_memory_store: Dict[str, Dict[str, Any]] = {
    "user_preferences": {},
    "conversation_context": {}
}


@tool
def save_user_preference(
    preference_key: str,
    preference_value: str,
    user_id: str = "default_user"
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
        user_id: User identifier (optional)
    
    Returns:
        Confirmation message
    """
    if user_id not in _memory_store["user_preferences"]:
        _memory_store["user_preferences"][user_id] = {}
    
    _memory_store["user_preferences"][user_id][preference_key] = preference_value
    
    return f"Saved preference: {preference_key} = {preference_value}"


@tool
def get_user_preferences(
    user_id: str = "default_user"
) -> Dict[str, Any]:
    """Retrieve all user preferences from long-term memory.
    
    Args:
        user_id: User identifier (optional)
    
    Returns:
        Dictionary of user preferences
    """
    return _memory_store["user_preferences"].get(user_id, {})


@tool
def save_conversation_context(
    context_key: str,
    context_value: str,
    conversation_id: str = "default_conversation",
    user_id: str = "default_user"
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
        conversation_id: Conversation identifier (optional)
        user_id: User identifier (optional)
    
    Returns:
        Confirmation message
    """
    key = f"{user_id}:{conversation_id}"
    
    if key not in _memory_store["conversation_context"]:
        _memory_store["conversation_context"][key] = {}
    
    _memory_store["conversation_context"][key][context_key] = context_value
    
    return f"Saved context: {context_key} = {context_value}"


@tool
def get_conversation_context(
    conversation_id: str = "default_conversation",
    user_id: str = "default_user"
) -> Dict[str, Any]:
    """Retrieve context from the current conversation.
    
    Args:
        conversation_id: Conversation identifier (optional)
        user_id: User identifier (optional)
    
    Returns:
        Dictionary of conversation context
    """
    key = f"{user_id}:{conversation_id}"
    return _memory_store["conversation_context"].get(key, {})


@tool
def search_conversation_history(
    query: str,
    user_id: str = "default_user",
    limit: int = 5
) -> List[Dict[str, Any]]:
    """Search through past conversation contexts.
    
    Args:
        query: Search query (e.g., "tickets about network issues")
        user_id: User identifier (optional)
        limit: Maximum number of results to return
    
    Returns:
        List of matching conversation contexts
    """
    results = []
    
    # Simple keyword search through conversation contexts
    for key, context in _memory_store["conversation_context"].items():
        if key.startswith(f"{user_id}:"):
            # Check if query matches any context values
            context_str = str(context).lower()
            if query.lower() in context_str:
                conversation_id = key.split(":", 1)[1]
                results.append({
                    "conversation_id": conversation_id,
                    "context": context
                })
                
                if len(results) >= limit:
                    break
    
    return results


# List of all memory tools
MEMORY_TOOLS = [
    save_user_preference,
    get_user_preferences,
    save_conversation_context,
    get_conversation_context,
    search_conversation_history
]
