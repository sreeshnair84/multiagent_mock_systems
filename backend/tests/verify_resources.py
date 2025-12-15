
import asyncio
import sys
import os

# Add backend to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.tools.resource_tools import (
    create_resource_group, list_resource_groups,
    create_app_service, list_app_services,
    create_service_account, list_service_accounts,
    provision_vm, list_vms
)
from app.tools.access_management_tools import (
    assign_role, list_role_assignments
)

async def test_resource_tools():
    print("--- Testing Resource Tools ---")
    
    # 1. Resource Group
    print(create_resource_group("test-rg", "eastus"))
    rgs = list_resource_groups()
    print(f"RGs: {rgs}")
    assert "test-rg" in rgs
    
    # 2. App Service
    print(create_app_service("test-app", "test-rg", "S1", "NODE|16-lts", "eastus"))
    apps = list_app_services("test-rg")
    print(f"Apps: {[a['name'] for a in apps]}")
    assert len(apps) == 1
    assert apps[0]['name'] == "test-app"
    
    # 3. Service Account
    print(create_service_account("test-sa", "test-rg"))
    sas = list_service_accounts()
    print(f"SAs: {[s['name'] for s in sas]}")
    assert len(sas) == 1
    
    # 4. VM
    print(provision_vm("test-vm", "test-rg", "UbuntuLTS", "Standard_D2s_v3", "adminuser", "eastus"))
    vms = list_vms("test-rg")
    print(f"VMs: {[v['name'] for v in vms]}")
    assert len(vms) == 1

async def test_access_tools():
    print("\n--- Testing Access Tools ---")
    
    # 1. RBAC
    await assign_role("user@example.com", "Contributor", "/subscriptions/s1/resourceGroups/test-rg")
    roles = await list_role_assignments("user@example.com")
    print(f"Roles for user@example.com: {roles}")
    assert len(roles) == 1
    assert roles[0]['role'] == "Contributor"

async def main():
    await test_resource_tools()
    await test_access_tools()
    print("\n✅ All verifications passed!")

if __name__ == "__main__":
    asyncio.run(main())
