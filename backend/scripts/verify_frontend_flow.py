
import asyncio
import json
import aiohttp

AGENT_URL = "http://localhost:8006/agents/vm/v1/message:stream"

async def verify_streaming():
    print(f"Connecting to {AGENT_URL}...")
    
    payload = {
        "message": {
            "role": "ROLE_USER",
            "content": [{"text": "I need a Ubuntu VM"}]
        }
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(AGENT_URL, json=payload) as response:
                print(f"Status: {response.status}")
                if response.status != 200:
                    print(await response.text())
                    return

                print("\n--- Stream Start ---")
                async for line in response.content:
                    decoded = line.decode('utf-8').strip()
                    if not decoded: continue
                    if decoded.startswith("data: "):
                        data_str = decoded[6:]
                        if data_str == "[DONE]":
                            print("\n[Stream Complete]")
                            break
                        try:
                            data = json.loads(data_str)
                            # Print only relevant events
                            if data.get("type") == "token":
                                print(data.get("text", ""), end="", flush=True)
                            elif data.get("type") == "tool_call":
                                print(f"\n[Tool Call: {data.get('tool_name')}]")
                            elif data.get("type") == "error":
                                print(f"\n[Error: {data.get('error')}]")
                        except json.JSONDecodeError:
                            print(f"\n[Raw]: {data_str}")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(verify_streaming())
