"""
Long-Term Memory Store
Provides persistent memory across conversations using LangGraph store
"""
from langgraph.store.memory import InMemoryStore
from langchain_community.embeddings import HuggingFaceEmbeddings
from typing import List


def create_embedding_function():
    """Create embedding function for memory store"""
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    def embed(texts: List[str]) -> List[List[float]]:
        """Embed texts using HuggingFace embeddings"""
        return embeddings.embed_documents(texts)
    
    return embed


# Global memory store instance
# In production, replace with a database-backed store (PostgreSQL, Redis, etc.)
memory_store = InMemoryStore(
    index={
        "embed": create_embedding_function(),
        "dims": 384  # all-MiniLM-L6-v2 produces 384-dimensional embeddings
    }
)


def get_memory_store():
    """Get the global memory store instance"""
    return memory_store
