"""
Quick test script to verify the POST /api/access-requests endpoint
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_create_access_request():
    """Test creating a new access request"""
    
    # Test data
    new_request = {
        "user_email": "test.user@example.com",
        "resource": "SAP Finance Module",
        "action": "Read",
        "business_justification": "Need access to review Q4 financial reports",
        "risk_level": "Low"
    }
    
    print("Testing POST /api/access-requests...")
    print(f"Request data: {json.dumps(new_request, indent=2)}")
    print()
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/access-requests",
            json=new_request,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2, default=str)}")
        
        if response.status_code == 200:
            print("\n✅ SUCCESS! Access request created successfully")
            return True
        else:
            print(f"\n❌ FAILED! Status: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Could not connect to server. Is it running on port 8000?")
        return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_get_access_requests():
    """Test getting all access requests"""
    print("\n" + "="*60)
    print("Testing GET /api/access-requests...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/access-requests")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            requests_list = response.json()
            print(f"Found {len(requests_list)} access request(s)")
            if requests_list:
                print("\nLatest request:")
                print(json.dumps(requests_list[-1], indent=2, default=str))
            print("\n✅ GET endpoint working")
            return True
        else:
            print(f"❌ FAILED! Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    print("="*60)
    print("  Access Requests API Test")
    print("="*60)
    print()
    
    # Test POST
    post_success = test_create_access_request()
    
    # Test GET
    get_success = test_get_access_requests()
    
    print("\n" + "="*60)
    print("  Test Summary")
    print("="*60)
    print(f"POST /api/access-requests: {'✅ PASS' if post_success else '❌ FAIL'}")
    print(f"GET  /api/access-requests: {'✅ PASS' if get_success else '❌ FAIL'}")
    print()
