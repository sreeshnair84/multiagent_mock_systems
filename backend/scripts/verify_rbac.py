
from fastapi.testclient import TestClient
from main import app
from app.core.seed_data import seed_database
from app.core.database import get_session
import asyncio
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

# Setup in-memory DB for testing
engine = create_engine(
    "sqlite://", 
    connect_args={"check_same_thread": False}, 
    poolclass=StaticPool
)

def get_session_override():
    with Session(engine) as session:
        yield session

app.dependency_overrides[get_session] = get_session_override

def test_rbac_flow():
    # 1. Create Tables
    SQLModel.metadata.create_all(engine)
    
    # 2. Seed Data (Manual or via API)
    # We'll use API for RBAC creation to test endpoints
    client = TestClient(app)
    
    print("Testing Application Creation...")
    app_data = {"name": "TestApp", "description": "For testing"}
    res = client.post("/rbac/applications", json=app_data)
    assert res.status_code == 200, f"Create App failed: {res.text}"
    app_id = res.json()["id"]
    print(f"✓ Created App ID: {app_id}")
    
    print("Testing Role Creation...")
    role_data = {
        "name": "TestRole",
        "application_id": app_id,
        "description": "Test Desc",
        "permissions": [{"resource": "vm", "action": "create"}]
    }
    res = client.post("/rbac/roles", json=role_data)
    assert res.status_code == 200, f"Create Role failed: {res.text}"
    role_id = res.json()["id"]
    print(f"✓ Created Role ID: {role_id}")
    
    print("Testing Permissions List...")
    res = client.get(f"/rbac/roles/{role_id}/permissions")
    assert res.status_code == 200
    perms = res.json()
    assert len(perms) == 1
    assert perms[0]["action"] == "create"
    print(f"✓ Verified Permission: {perms[0]['action']}")
    
    print("Testing Flavor Creation...")
    flavor_data = {"name": "Power User", "attributes": '{"cpu": "high"}'}
    res = client.post("/rbac/flavors", json=flavor_data)
    assert res.status_code == 200
    print("✓ Created User Flavor")

    print("\nRBAC Verification SUCCESS!")

if __name__ == "__main__":
    test_rbac_flow()
