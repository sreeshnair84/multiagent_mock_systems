
import requests
import json
import time

BASE_URL = "http://localhost:8006"
AGENT = "vm"

def probe():
    print(f"Probing {AGENT} agent at {BASE_URL}...")
    
    # 1. List tools/docs?
    try:
        r = requests.get(f"{BASE_URL}/agents/{AGENT}/docs")
        print(f"/docs status: {r.status_code}")
    except Exception as e:
        print(f"Failed to connect: {e}")
        return

    # 2. Create Task
    print("\nCreating Task...")
    # A2A usually expects some input to start? or just empty?
    # Trying standard POST /tasks
    create_url = f"{BASE_URL}/agents/{AGENT}/tasks"
    payload = {
        "input": {
            "text": "Hello, I need a VM."
        }
        # In A2A 0.3.x, the payload structure might be strictly typed or just "input" dict.
        # Let's try simple dictionary.
    }
    
    # Actually, A2ARESTFastAPIApplication might map simply to:
    # POST /
    # OR
    # POST /tasks
    
    # Let's try POST /tasks first
    try:
        r = requests.post(create_url, json=payload)
        print(f"Create Task Status: {r.status_code}")
        print(f"Response: {r.text[:200]}")
        
        if r.status_code == 201 or r.status_code == 200:
            task_data = r.json()
            task_id = task_data.get("task_id") or task_data.get("id")
            print(f"Task ID: {task_id}")
            
            if task_id:
                # 3. Poll for status?
                time.sleep(1)
                status_url = f"{BASE_URL}/agents/{AGENT}/tasks/{task_id}"
                r = requests.get(status_url)
                print(f"Task Status Code: {r.status_code}")
                print(f"Task Status Data: {r.text[:200]}")
    except Exception as e:
        print(f"Error creating task: {e}")

if __name__ == "__main__":
    probe()
