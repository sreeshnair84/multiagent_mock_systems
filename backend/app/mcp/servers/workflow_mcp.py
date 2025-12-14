"""
Workflow MCP Server
Built with official FastMCP SDK
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from fastmcp import FastMCP
from app.tools.workflow_tools import (
    replay_workflow,
    terminate_workflow,
    resume_interrupted
)

# Initialize FastMCP server
mcp = FastMCP("Workflow")

@mcp.tool()
async def replay_workflow_from_checkpoint(
    workflow_id: str,
    checkpoint_id: str
) -> dict:
    """Replays workflow from a specific checkpoint.
    
    Args:
        workflow_id: Workflow identifier
        checkpoint_id: Checkpoint to replay from
    """
    return await replay_workflow(workflow_id, checkpoint_id)


@mcp.tool()
async def terminate_workflow_execution(workflow_id: str) -> dict:
    """Force terminates a workflow.
    
    Args:
        workflow_id: Workflow identifier
    """
    return await terminate_workflow(workflow_id)


@mcp.tool()
async def resume_interrupted_workflow(workflow_id: str) -> dict:
    """Resumes an interrupted workflow.
    
    Args:
        workflow_id: Workflow identifier
    """
    return await resume_interrupted(workflow_id)


if __name__ == "__main__":
    from app.mcp.config import run_server
    run_server(mcp, "Workflow")
