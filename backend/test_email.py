"""
Test script for email marking endpoint
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_mark_email_read():
    print("Testing POST /api/emails/1/mark-read...")
    
    try:
        # Try to mark email ID 1 as read
        # Note: If email 1 doesn't exist, it will return 404, which is expected behavior for logic
        # but confirms the endpoint exists (otherwise would be 404 Not Found for route)
        response = requests.post(f"{BASE_URL}/api/emails/1/mark-read", json={})
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code in [200, 404]:
            # 404 from logic ("Email not found") is fine, means endpoint was hit
            # 404 from route would be HTML or "Not Found"
            if response.status_code == 404 and "Email not found" in response.text:
                 print("✅ Endpoint exists (returned logic 404)")
                 return True
            elif response.status_code == 200:
                print("✅ Endpoint exists and worked")
                return True
        
        print("❌ Endpoint check failed")
        return False
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_mark_email_read()
