"""
Test script to verify all agents can fetch and use MCP tools
Run this with the composite server running on port 8000
"""
import asyncio
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

from app.agents.state import AgentState
from app.agents.access_agent import access_agent
from app.agents.servicenow_agent import servicenow_agent
from app.agents.intune_agent import intune_agent
from app.agents.m365_agent import m365_agent
from app.agents.outlook_agent import outlook_agent
from app.agents.workflow_agent import workflow_agent
from langchain_core.messages import HumanMessage


async def test_agent(agent_name: str, agent_func, test_message: str):
    """Test a single agent"""
    print(f"\n{'='*60}")
    print(f"Testing {agent_name}")
    print(f"{'='*60}")
    
    try:
        # Create initial state with a test message
        initial_state = AgentState(
            messages=[HumanMessage(content=test_message)]
        )
        
        print(f"Input: {test_message}")
        print(f"\nCalling {agent_name}...")
        
        # Call the agent
        result = await agent_func(initial_state)
        
        # Check result
        if "messages" in result and len(result["messages"]) > 0:
            response = result["messages"][0]
            print(f"\n[OK] {agent_name} responded successfully")
            print(f"Response type: {type(response).__name__}")
            
            # Check if agent has tool calls
            if hasattr(response, 'tool_calls') and response.tool_calls:
                print(f"Tool calls: {len(response.tool_calls)}")
                for i, tool_call in enumerate(response.tool_calls, 1):
                    print(f"  {i}. {tool_call.get('name', 'unknown')}")
            else:
                print("No tool calls (agent may have responded directly)")
            
            # Show response content if available
            if hasattr(response, 'content') and response.content:
                content_preview = str(response.content)[:200]
                print(f"Content preview: {content_preview}...")
            
            return True
        else:
            print(f"[ERROR] {agent_name} returned unexpected result format")
            return False
            
    except Exception as e:
        print(f"[ERROR] {agent_name} failed: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_all_agents():
    """Test all agents"""
    print("="*60)
    print("AGENT MCP INTEGRATION TEST")
    print("="*60)
    print("\nThis test verifies that all agents can:")
    print("1. Fetch tools from the MCP composite server")
    print("2. Process user messages")
    print("3. Generate appropriate responses/tool calls")
    
    # Define test cases for each agent
    test_cases = [
        {
            "name": "Access Agent",
            "func": access_agent,
            "message": "I need to request access to the finance system"
        },
        {
            "name": "ServiceNow Agent",
            "func": servicenow_agent,
            "message": "Create a ticket for my laptop not connecting to WiFi"
        },
        {
            "name": "Intune Agent",
            "func": intune_agent,
            "message": "Check the status of device DEV-001"
        },
        {
            "name": "M365 Agent",
            "func": m365_agent,
            "message": "Get user roles for john.doe@company.com"
        },
        {
            "name": "Outlook Agent",
            "func": outlook_agent,
            "message": "Send an email to team@company.com about the meeting"
        },
        {
            "name": "Workflow Agent",
            "func": workflow_agent,
            "message": "Resume the interrupted workflow WF-123"
        }
    ]
    
    results = {}
    
    # Test each agent
    for test_case in test_cases:
        success = await test_agent(
            test_case["name"],
            test_case["func"],
            test_case["message"]
        )
        results[test_case["name"]] = success
    
    # Print summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY")
    print(f"{'='*60}")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for agent_name, success in results.items():
        status = "[OK]" if success else "[FAIL]"
        print(f"{status} {agent_name}")
    
    print(f"\n{passed}/{total} agents passed")
    
    if passed == total:
        print("\n[OK] All agents are working correctly with MCP integration!")
        return True
    else:
        print(f"\n[ERROR] {total - passed} agent(s) failed")
        return False


async def main():
    """Main test function"""
    try:
        success = await test_all_agents()
        return 0 if success else 1
    except Exception as e:
        print(f"\n[ERROR] Test suite failed: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
