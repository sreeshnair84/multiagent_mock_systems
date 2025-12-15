"""
Test script to verify composite server loads correctly
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

print("Testing composite server import...")

try:
    from app.mcp.composite_server import mcp
    print("✓ Composite server imported successfully")
    print(f"✓ Server name: {mcp.name}")
    
    # Try to get tools
    import asyncio
    async def test_tools():
        tools = await mcp.get_tools()
        print(f"✓ Found {len(tools)} tools")
        print("\nAvailable tools:")
        for tool_name in sorted(tools.keys())[:10]:  # Show first 10
            print(f"  - {tool_name}")
        if len(tools) > 10:
            print(f"  ... and {len(tools) - 10} more")
    
    asyncio.run(test_tools())
    print("\n✓ All tests passed!")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
