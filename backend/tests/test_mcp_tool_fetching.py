"""
Simplified test to verify MCP tool fetching works correctly
This test focuses on verifying that agents can fetch tools from MCP server
without requiring LLM API calls
"""
import asyncio
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

from app.mcp.mcp_client_langgraph import get_mcp_tools


async def test_tool_fetching_for_agents():
    """Test that each agent can fetch its tools from MCP server"""
    print("="*60)
    print("MCP TOOL FETCHING TEST")
    print("="*60)
    print("\nThis test verifies that tools can be fetched from MCP server")
    print("for each agent domain.\n")
    
    # Define agent prefixes
    agent_prefixes = {
        "Access Agent": "access_",
        "ServiceNow Agent": "servicenow_",
        "Intune Agent": "intune_",
        "M365 Agent": "m365_",
        "Outlook Agent": "outlook_",
        "Workflow Agent": "workflow_"
    }
    
    results = {}
    
    for agent_name, prefix in agent_prefixes.items():
        print(f"\n{'-'*60}")
        print(f"Testing {agent_name} (prefix: {prefix})")
        print(f"{'-'*60}")
        
        try:
            # Fetch tools for this agent
            tools = await get_mcp_tools(prefix=prefix)
            
            if tools:
                print(f"[OK] Fetched {len(tools)} tools")
                print(f"\nTools:")
                for i, tool in enumerate(tools, 1):
                    print(f"  {i}. {tool.name}")
                    if hasattr(tool, 'description') and tool.description:
                        desc_preview = tool.description[:80]
                        print(f"     Description: {desc_preview}...")
                results[agent_name] = True
            else:
                print(f"[WARNING] No tools found for prefix '{prefix}'")
                results[agent_name] = False
                
        except Exception as e:
            print(f"[ERROR] Failed to fetch tools: {e}")
            results[agent_name] = False
    
    # Print summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY")
    print(f"{'='*60}")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for agent_name, success in results.items():
        status = "[OK]" if success else "[FAIL]"
        print(f"{status} {agent_name}")
    
    print(f"\n{passed}/{total} agents can fetch tools from MCP server")
    
    if passed == total:
        print("\n[OK] All agents can successfully fetch tools from MCP server!")
        print("\nNOTE: This test verified MCP tool fetching only.")
        print("Full agent testing requires valid LLM API configuration.")
        return True
    else:
        print(f"\n[ERROR] {total - passed} agent(s) failed to fetch tools")
        return False


async def main():
    """Main test function"""
    try:
        print("\nMake sure the composite MCP server is running:")
        print("  cd backend")
        print("  .\\start_composite_server.bat\n")
        
        success = await test_tool_fetching_for_agents()
        return 0 if success else 1
    except Exception as e:
        print(f"\n[ERROR] Test suite failed: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
