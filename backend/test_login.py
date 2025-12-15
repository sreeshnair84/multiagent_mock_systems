
import requests
import sys

BASE_URL = "http://localhost:8000/api"
EMAIL = "admin@company.com"
PASSWORD = "password123"

def test_login():
    print(f"Attempting login for {EMAIL}...")
    headers = {"Content-Type": "application/json"}
    payload = {"email": EMAIL, "password": PASSWORD}
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Login Successful!")
            print(f"Token: {data.get('token')[:20]}...")
            print(f"Roles: {data.get('roles')}")
            print(f"User ID: {data.get('user_id')}")
            return True
        else:
            print("Login Failed!")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to backend. Is it running?")
        return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

if __name__ == "__main__":
    success = test_login()
    sys.exit(0 if success else 1)
