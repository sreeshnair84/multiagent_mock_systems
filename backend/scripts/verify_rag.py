
import asyncio
import uuid
import aiohttp
import json

async def test_rag():
    task_id = str(uuid.uuid4())
    context_id = str(uuid.uuid4())
    url = f"http://127.0.0.1:8006/agents/intune/v1/message:stream"
    
    # Question that requires consulting the SOP
    question = "What are the prerequisite steps for device enrollment according to the SOP?"
    
    payload = {
        "message": {
            "role": "ROLE_USER",
            "content": [{"text": question}]
        }
    }
    
    print(f"Connecting to {url}...")
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload, headers={"Content-Type": "application/json"}) as response:
            if response.status != 200:
                print(f"Failed with status {response.status}")
                text = await response.text()
                print(text)
                return

            print("Stream started...")
            async for line in response.content:
                decoded = line.decode('utf-8').strip()
                if not decoded: continue
                
                if decoded.startswith("data: "):
                    data_str = decoded[6:]
                    if data_str == "[DONE]":
                        break
                    try:
                        data = json.loads(data_str)
                        # Check for tool calls or specific text
                        if "tool_call" in data:
                             print(f"\n[TOOL CALL]: {data['tool_call']['name']}")
                             print(f"Arguments: {data['tool_call']['parameters']}")
                        elif "messageDelta" in data:
                             content = data['messageDelta'].get('content', [{}])[0].get('text', '')
                             print(content, end="", flush=True)
                        elif "delta" in data:
                             print(data['delta'].get('text', ''), end="", flush=True)
                    except json.JSONDecodeError:
                        pass
            print("\nStream finished.")

if __name__ == "__main__":
    asyncio.run(test_rag())
