"""
Comprehensive Agent + MCP Server Test Suite
Tests all 6 agents with their dedicated MCP servers
"""
import asyncio
import httpx
from langchain_core.messages import HumanMessage
from app.agents.servicenow_agent import servicenow_agent
from app.agents.intune_agent import intune_agent
from app.agents.m365_agent import m365_agent
from app.agents.outlook_agent import outlook_agent
from app.agents.access_management_agent import access_management_agent
from app.agents.workflow_agent import workflow_agent


async def test_mcp_server_health(port: int, name: str) -> bool:
    """Test if MCP server is running"""
    url = f"http://localhost:{port}"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url)
            if response.status_code == 200:
                print(f"✅ {name} MCP Server (port {port}) - RUNNING")
                return True
            else:
                print(f"❌ {name} MCP Server (port {port}) - ERROR: {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ {name} MCP Server (port {port}) - NOT RUNNING: {e}")
        return False


async def test_servicenow_agent():
    """Test ServiceNow agent"""
    print("\n" + "="*60)
    print("Testing ServiceNow Agent")
    print("="*60)
    
    state = {
        "messages": [
            HumanMessage(content="Search for all open tickets")
        ]
    }
    
    try:
        result = await servicenow_agent(state)
        print(f"✅ ServiceNow Agent Response: {result['messages'][-1].content[:200]}...")
        return True
    except Exception as e:
        print(f"❌ ServiceNow Agent Error: {e}")
        return False


async def test_intune_agent():
    """Test Intune agent"""
    print("\n" + "="*60)
    print("Testing Intune Agent")
    print("="*60)
    
    state = {
        "messages": [
            HumanMessage(content="List all enrolled devices")
        ]
    }
    
    try:
        result = await intune_agent(state)
        print(f"✅ Intune Agent Response: {result['messages'][-1].content[:200]}...")
        return True
    except Exception as e:
        print(f"❌ Intune Agent Error: {e}")
        return False


async def test_m365_agent():
    """Test M365 agent"""
    print("\n" + "="*60)
    print("Testing M365 Agent")
    print("="*60)
    
    state = {
        "messages": [
            HumanMessage(content="List all active users")
        ]
    }
    
    try:
        result = await m365_agent(state)
        print(f"✅ M365 Agent Response: {result['messages'][-1].content[:200]}...")
        return True
    except Exception as e:
        print(f"❌ M365 Agent Error: {e}")
        return False


async def test_outlook_agent():
    """Test Outlook agent"""
    print("\n" + "="*60)
    print("Testing Outlook Agent")
    print("="*60)
    
    state = {
        "messages": [
            HumanMessage(content="Get my unread emails")
        ]
    }
    
    try:
        result = await outlook_agent(state)
        print(f"✅ Outlook Agent Response: {result['messages'][-1].content[:200]}...")
        return True
    except Exception as e:
        print(f"❌ Outlook Agent Error: {e}")
        return False


async def test_access_agent():
    """Test Access Management agent"""
    print("\n" + "="*60)
    print("Testing Access Management Agent")
    print("="*60)
    
    state = {
        "messages": [
            HumanMessage(content="Check the status of pending access requests")
        ]
    }
    
    try:
        result = await access_management_agent(state)
        print(f"✅ Access Management Agent Response: {result['messages'][-1].content[:200]}...")
        return True
    except Exception as e:
        print(f"❌ Access Management Agent Error: {e}")
        return False


async def test_workflow_agent():
    """Test Workflow agent"""
    print("\n" + "="*60)
    print("Testing Workflow Agent")
    print("="*60)
    
    state = {
        "messages": [
            HumanMessage(content="Show me active workflows")
        ]
    }
    
    try:
        result = await workflow_agent(state)
        print(f"✅ Workflow Agent Response: {result['messages'][-1].content[:200]}...")
        return True
    except Exception as e:
        print(f"❌ Workflow Agent Error: {e}")
        return False


async def main():
    print("\n" + "="*60)
    print("AGENT + MCP SERVER TEST SUITE")
    print("="*60)
    
    # Test MCP Server Health
    print("\n📡 Testing MCP Server Health...")
    print("-" * 60)
    
    servers = [
        (8001, "ServiceNow"),
        (8002, "Intune"),
        (8004, "M365 User Management"),
        (8005, "Access Management"),
        (8006, "Outlook"),
        (8007, "Workflow"),
    ]
    
    server_health = {}
    for port, name in servers:
        server_health[name] = await test_mcp_server_health(port, name)
    
    # Test Agents (only if their MCP servers are running)
    print("\n🤖 Testing Agents...")
    print("-" * 60)
    
    agent_results = {}
    
    if server_health.get("ServiceNow"):
        agent_results["ServiceNow"] = await test_servicenow_agent()
    else:
        print("\n⚠️  Skipping ServiceNow Agent (server not running)")
    
    if server_health.get("Intune"):
        agent_results["Intune"] = await test_intune_agent()
    else:
        print("\n⚠️  Skipping Intune Agent (server not running)")
    
    if server_health.get("M365 User Management"):
        agent_results["M365"] = await test_m365_agent()
    else:
        print("\n⚠️  Skipping M365 Agent (server not running)")
    
    if server_health.get("Outlook"):
        agent_results["Outlook"] = await test_outlook_agent()
    else:
        print("\n⚠️  Skipping Outlook Agent (server not running)")
    
    if server_health.get("Access Management"):
        agent_results["Access Management"] = await test_access_agent()
    else:
        print("\n⚠️  Skipping Access Management Agent (server not running)")
    
    if server_health.get("Workflow"):
        agent_results["Workflow"] = await test_workflow_agent()
    else:
        print("\n⚠️  Skipping Workflow Agent (server not running)")
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    print("\n📡 MCP Servers:")
    for name, status in server_health.items():
        print(f"  {'✅' if status else '❌'} {name}")
    
    print("\n🤖 Agents:")
    for name, status in agent_results.items():
        print(f"  {'✅' if status else '❌'} {name}")
    
    total_servers = len(server_health)
    running_servers = sum(server_health.values())
    total_agents = len(agent_results)
    working_agents = sum(agent_results.values())
    
    print(f"\n📊 Results:")
    print(f"  MCP Servers: {running_servers}/{total_servers} running")
    print(f"  Agents: {working_agents}/{total_agents} working")
    
    if running_servers == 0:
        print("\n⚠️  No MCP servers are running!")
        print("💡 Start them with: python scripts/start_mcp_servers.py")
    elif running_servers == total_servers and working_agents == total_agents:
        print("\n🎉 All tests passed!")
    else:
        print("\n⚠️  Some tests failed. Check errors above.")


if __name__ == "__main__":
    asyncio.run(main())
