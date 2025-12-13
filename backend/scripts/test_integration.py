"""
Quick test script for MCP servers and database
"""
import asyncio
import httpx
from app.tools import servicenow_tools, user_management_tools


async def test_database_tools():
    """Test database tools directly"""
    print("=" * 60)
    print("Testing Database Tools")
    print("=" * 60)
    
    # Test ServiceNow tools
    print("\n1. Testing ServiceNow - Create Ticket")
    ticket = await servicenow_tools.create_ticket(
        title="Test Ticket from Script",
        description="Testing the ServiceNow tools",
        priority="High",
        category="Software"
    )
    print(f"   Created: {ticket}")
    
    print("\n2. Testing ServiceNow - Get Ticket")
    ticket_details = await servicenow_tools.get_ticket("T001")
    print(f"   Retrieved: {ticket_details['title']}")
    
    # Test User Management tools
    print("\n3. Testing User Management - List Users")
    users = await user_management_tools.list_users(status="Active")
    print(f"   Found {len(users)} active users")
    
    print("\n4. Testing User Management - Get Roles")
    user_info = await user_management_tools.get_user_roles("admin@company.com")
    print(f"   Admin user role: {user_info['role']}")
    
    print("\n✅ All database tools working!")


async def test_mcp_server(port: int, server_name: str):
    """Test MCP server endpoints"""
    print(f"\n{'=' * 60}")
    print(f"Testing {server_name} MCP Server (port {port})")
    print("=" * 60)
    
    base_url = f"http://localhost:{port}"
    
    try:
        async with httpx.AsyncClient() as client:
            # Test root endpoint
            print(f"\n1. Testing GET {base_url}/")
            response = await client.get(base_url)
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Server: {data['server']}")
                print(f"   ✅ Tools: {len(data['tools'])} available")
            else:
                print(f"   ❌ Failed: {response.status_code}")
            
            # Test tools list
            print(f"\n2. Testing GET {base_url}/tools")
            response = await client.get(f"{base_url}/tools")
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Found {len(data['tools'])} tools:")
                for tool in data['tools'][:3]:  # Show first 3
                    print(f"      - {tool['name']}")
            else:
                print(f"   ❌ Failed: {response.status_code}")
    
    except httpx.ConnectError:
        print(f"   ❌ Server not running on port {port}")
        print(f"   💡 Start with: python app/mcp/servers/{server_name.lower()}_mcp.py")


async def main():
    print("\n" + "=" * 60)
    print("ENTERPRISE INTEGRATION TEST SUITE")
    print("=" * 60)
    
    # Test database tools
    await test_database_tools()
    
    # Test MCP servers (if running)
    print("\n\n" + "=" * 60)
    print("MCP SERVER TESTS (requires servers to be running)")
    print("=" * 60)
    
    mcp_servers = [
        (8001, "ServiceNow"),
        (8002, "Intune"),
        (8004, "M365_UserManagement"),
        (8005, "AccessManagement"),
        (8006, "Outlook"),
        (8007, "Workflow"),
    ]
    
    for port, name in mcp_servers:
        await test_mcp_server(port, name)
    
    print("\n" + "=" * 60)
    print("TEST SUITE COMPLETE")
    print("=" * 60)
    print("\n💡 To start all MCP servers:")
    print("   python scripts/start_mcp_servers.py")


if __name__ == "__main__":
    asyncio.run(main())
