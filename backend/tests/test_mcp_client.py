"""
Test script to verify MCP client can connect and fetch tools
Run this with the composite server running on port 8000
"""
import asyncio
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

from app.mcp.mcp_client_langgraph import mcp_manager


async def test_mcp_connection():
    """Test MCP client connection and tool retrieval"""
    print("=" * 60)
    print("Testing MCP Client Connection")
    print("=" * 60)
    
    try:
        # Test 1: Get all tools
        print("\n1. Fetching all tools from MCP server...")
        all_tools = await mcp_manager.get_all_tools()
        print(f"[OK] Successfully fetched {len(all_tools)} tools")
        
        # Print tool names
        print("\nAvailable tools:")
        for i, tool in enumerate(all_tools, 1):
            print(f"  {i}. {tool.name}")
        
        # Test 2: Get tools by prefix
        print("\n2. Testing prefix filtering...")
        prefixes = ["servicenow_", "intune_", "m365_", "outlook_", "workflow_", "access_"]
        
        for prefix in prefixes:
            tools = await mcp_manager.get_tools_by_prefix(prefix)
            print(f"  {prefix}: {len(tools)} tools")
        
        # Test 3: Get specific tools
        print("\n3. Testing specific tool retrieval...")
        if all_tools:
            # Try to get first 3 tools by name
            tool_names = [tool.name for tool in all_tools[:3]]
            specific_tools = await mcp_manager.get_tools_by_names(tool_names)
            print(f"  Requested {len(tool_names)} tools, got {len(specific_tools)}")
        
        print("\n" + "=" * 60)
        print("[OK] All MCP client tests passed!")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"\n[ERROR] Error: {e}")
        print("\nMake sure the composite MCP server is running:")
        print("  cd backend")
        print("  .\\start_composite_server.bat")
        return False
    finally:
        await mcp_manager.close()


if __name__ == "__main__":
    success = asyncio.run(test_mcp_connection())
    sys.exit(0 if success else 1)
