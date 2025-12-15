from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(prefix="/mcp", tags=["MCP"])

@router.get("/info")
async def get_mcp_info():
    return {
        "status": "active",
        "url": settings.MCP_COMPOSITE_URL,
        "transport": settings.MCP_TRANSPORT
    }
