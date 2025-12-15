
from a2a.types import AgentCapabilities
try:
    caps = AgentCapabilities(streaming=True)
    print(f"Success: {caps}")
except Exception as e:
    print(f"Error: {e}")
