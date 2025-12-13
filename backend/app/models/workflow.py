from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class GraphCheckpoint(SQLModel, table=True):
    """Stores LangGraph checkpoints for replay/resume"""
    thread_id: str = Field(primary_key=True)
    checkpoint_ns: str = Field(primary_key=True) # Namespace
    checkpoint_id: str = Field(primary_key=True)
    
    checkpoint: bytes # Pickled state
    metadata_json: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
