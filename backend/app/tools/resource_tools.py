
from typing import List, Optional, Dict
import random
import uuid
import datetime

# Mock database simulating Azure Resources
# Structure: {
#   "resource_groups": { "rg-name": { "location": "eastus", "tags": {} } },
#   "vms": { "vm-name": { ...vm_details... } },
#   "app_services": { "app-name": { ...app_details... } },
#   "service_accounts": { "sa-name": { ...sa_details... } }
# }

RESOURCE_GROUPS = {
    "default-rg": {"location": "eastus", "tags": {"environment": "dev"}}
}

VMS = {}
APP_SERVICES = {}
SERVICE_ACCOUNTS = {}

# Common Azure VM Sizes
VM_SIZES = [
    "Standard_B1s", "Standard_B2s", "Standard_D2s_v3", "Standard_D4s_v3", 
    "Standard_F2s_v2", "Standard_E2s_v3"
]

# Common App Service Plans
APP_SERVICE_PLANS = [
    "F1", "B1", "S1", "P1v2", "P2v2", "P3v2"
]

# Common Azure Marketplace Images (URNs)
IMAGES = [
    "UbuntuLTS", 
    "CentOS8", 
    "Windows2019Datacenter", 
    "Windows2022Datacenter",
    "Debian10"
]

LOCATIONS = ["eastus", "westus", "northeurope", "westeurope", "southeastasia"]

def list_resource_groups():
    """List all available Azure Resource Groups."""
    return list(RESOURCE_GROUPS.keys())

def create_resource_group(name: str, location: str, tags: Optional[Dict[str, str]] = None):
    """Create a new Azure Resource Group.
    
    Args:
        name: Name of the resource group (e.g., 'my-app-rg').
        location: Azure region (e.g., 'eastus', 'westeurope').
        tags: Optional dictionary of tags (e.g., {'env': 'production'}).
    """
    if name in RESOURCE_GROUPS:
        return f"Resource Group '{name}' already exists."
    
    if location not in LOCATIONS:
        return f"Invalid location. Allowed values: {', '.join(LOCATIONS)}"

    RESOURCE_GROUPS[name] = {
        "location": location,
        "tags": tags or {},
        "provisioning_state": "Succeeded"
    }
    return f"Successfully created Resource Group '{name}' in '{location}'."

# --- VM Tools ---

def list_vms(resource_group: Optional[str] = None):
    """List virtual machines, optionally filtered by resource group.
    
    Args:
        resource_group: Filter by specific resource group name.
    """
    if resource_group:
        if resource_group not in RESOURCE_GROUPS:
            return f"Resource group '{resource_group}' does not exist."
        return [vm for vm in VMS.values() if vm['resource_group'] == resource_group]
    return list(VMS.values())

def get_vm_status(name: str, resource_group: str):
    """Get the runtime view and status of a specific VM.
    
    Args:
        name: The name of the VM.
        resource_group: The resource group the VM belongs to.
    """
    key = f"{resource_group}/{name}"
    vm = VMS.get(key)
    if not vm:
        return f"VM '{name}' not found in resource group '{resource_group}'."
    
    return {
        "name": vm['name'],
        "status": vm['provisioning_state'], # "Succeeded", "Failed" etc for provisioning
        "power_state": vm['power_state'],   # "VM running", "VM deallocated"
        "public_ip": vm.get('public_ip', 'N/A')
    }

def validate_vm_parameters(name: str, resource_group: str, image: str, size: str, location: str):
    """Validate parameters before creating a VM. Returns 'Valid' or error message.
    
    Args:
        name: VM Name.
        resource_group: Resource Group Name.
        image: Image reference (URN).
        size: VM Size (SKU).
        location: Azure Region.
    """
    errors = []
    if resource_group not in RESOURCE_GROUPS:
        errors.append(f"Resource Group '{resource_group}' does not exist.")
    if image not in IMAGES:
        # Allow custom string but warn
        pass 
    if size not in VM_SIZES:
         errors.append(f"Invalid size '{size}'. Allowed: {', '.join(VM_SIZES)}")
    if location not in LOCATIONS:
        errors.append(f"Invalid location '{location}'. Allowed: {', '.join(LOCATIONS)}")
        
    if errors:
        return "Validation Failed: " + "; ".join(errors)
    return "Valid"

def provision_vm(
    name: str, 
    resource_group: str, 
    image: str, 
    size: str, 
    admin_username: str, 
    location: str,
    tags: Optional[Dict[str, str]] = None
):
    """Provision a new Azure Virtual Machine.
    
    Args:
        name: Name of the VM (e.g., 'web-server-01').
        resource_group: Existing Resource Group to deploy into.
        image: Image URN (e.g., 'UbuntuLTS', 'Windows2019Datacenter').
        size: VM Size (e.g., 'Standard_D2s_v3').
        admin_username: Username for the local administrator.
        location: Azure Region (e.g., 'eastus').
        tags: Optional resource tags.
    """
    # 1. Validation
    if resource_group not in RESOURCE_GROUPS:
        return f"Error: Resource Group '{resource_group}' does not exist. Please create it first."
    
    key = f"{resource_group}/{name}"
    if key in VMS:
        return f"Error: VM '{name}' already exists in '{resource_group}'."

    # 2. Mock Creation Process
    vm_id = str(uuid.uuid4())
    private_ip = f"10.0.{random.randint(0, 255)}.{random.randint(1, 254)}"
    public_ip = f"{random.randint(20, 200)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"
    
    vm_data = {
        "id": f"/subscriptions/{uuid.uuid4()}/resourceGroups/{resource_group}/providers/Microsoft.Compute/virtualMachines/{name}",
        "name": name,
        "resource_group": resource_group,
        "location": location,
        "size": size,
        "image": image,
        "os_profile": {
            "admin_username": admin_username,
            "computer_name": name
        },
        "network_profile": {
            "private_ip": private_ip,
            "public_ip": public_ip
        },
        "tags": tags or {},
        "provisioning_state": "Succeeded",
        "power_state": "VM running",
        "created_at": datetime.datetime.now().isoformat()
    }
    
    VMS[key] = vm_data
    
    return {
        "status": "Success",
        "message": f"VM '{name}' provisioned successfully in '{resource_group}'.",
        "details": {
            "id": vm_data["id"],
            "public_ip": public_ip,
            "private_ip": private_ip
        }
    }

def stop_vm(name: str, resource_group: str):
    """Stop (Deallocate) a running VM.
    
    Args:
        name: Name of the VM.
        resource_group: Resource Group of the VM.
    """
    key = f"{resource_group}/{name}"
    vm = VMS.get(key)
    if not vm:
        return f"VM '{name}' not found in '{resource_group}'."
    
    if vm['power_state'] == "VM deallocated":
        return f"VM '{name}' is already stopped (deallocated)."
        
    vm['power_state'] = "VM deallocated"
    return f"VM '{name}' in '{resource_group}' has been successfully deallocated."

def start_vm(name: str, resource_group: str):
    """Start a stopped VM.
    
    Args:
        name: Name of the VM.
        resource_group: Resource Group of the VM.
    """
    key = f"{resource_group}/{name}"
    vm = VMS.get(key)
    if not vm:
        return f"VM '{name}' not found in '{resource_group}'."
    
    if vm['power_state'] == "VM running":
        return f"VM '{name}' is already running."
        
    vm['power_state'] = "VM running"
    return f"VM '{name}' in '{resource_group}' has been started."


# --- App Service Tools ---

def list_app_services(resource_group: Optional[str] = None):
    """List App Services, optionally filtered by resource group.
    
    Args:
        resource_group: Filter by specific resource group name.
    """
    if resource_group:
        if resource_group not in RESOURCE_GROUPS:
            return f"Resource group '{resource_group}' does not exist."
        return [app for app in APP_SERVICES.values() if app['resource_group'] == resource_group]
    return list(APP_SERVICES.values())

def create_app_service(
    name: str,
    resource_group: str,
    plan: str,
    runtime: str,
    location: str
):
    """Create a new Azure App Service (Web App).
    
    Args:
        name: Unique name for the app (used in URL).
        resource_group: Resource Group Name.
        plan: App Service Plan (e.g., F1, B1, S1).
        runtime: Runtime stack (e.g., 'DOTNET|6.0', 'PYTHON|3.9', 'NODE|16-lts').
        location: Azure Region.
    """
    if resource_group not in RESOURCE_GROUPS:
        return f"Error: Resource Group '{resource_group}' does not exist."
    
    key = f"{resource_group}/{name}"
    if key in APP_SERVICES:
        return f"Error: App Service '{name}' already exists in '{resource_group}'."
        
    if plan not in APP_SERVICE_PLANS:
        return f"Error: Invalid plan '{plan}'. Allowed: {', '.join(APP_SERVICE_PLANS)}"

    default_host = f"{name}.azurewebsites.net"
    
    app_data = {
        "id": f"/subscriptions/{uuid.uuid4()}/resourceGroups/{resource_group}/providers/Microsoft.Web/sites/{name}",
        "name": name,
        "resource_group": resource_group,
        "location": location,
        "plan": plan,
        "runtime": runtime,
        "default_host_name": default_host,
        "state": "Running",
        "created_at": datetime.datetime.now().isoformat()
    }
    
    APP_SERVICES[key] = app_data
    
    return {
        "status": "Success",
        "message": f"App Service '{name}' created successfully.",
        "url": f"https://{default_host}"
    }

# --- Service Account Tools ---

def list_service_accounts():
    """List all Service Accounts (Mock Service Principals/Managed Identities)."""
    return list(SERVICE_ACCOUNTS.values())

def create_service_account(name: str, resource_group: str, type: str = "ManagedIdentity"):
    """Create a new Service Account (Managed Identity).
    
    Args:
        name: Name of the service account.
        resource_group: Resource Group to store it in.
        type: Type of account (default: ManagedIdentity).
    """
    if resource_group not in RESOURCE_GROUPS:
        return f"Error: Resource Group '{resource_group}' does not exist."

    key = f"{resource_group}/{name}"
    if key in SERVICE_ACCOUNTS:
        return f"Error: Service Account '{name}' already exists."
        
    client_id = str(uuid.uuid4())
    object_id = str(uuid.uuid4())
    
    sa_data = {
        "name": name,
        "resource_group": resource_group,
        "type": type,
        "client_id": client_id,
        "object_id": object_id,
        "created_at": datetime.datetime.now().isoformat()
    }
    
    SERVICE_ACCOUNTS[key] = sa_data
    
    return {
        "status": "Success",
        "message": f"Service Account '{name}' created.",
        "client_id": client_id
    }

VM_TOOLS = [
    list_resource_groups, create_resource_group, 
    list_vms, get_vm_status, 
    validate_vm_parameters, provision_vm, 
    stop_vm, start_vm,
    list_app_services, create_app_service,
    list_service_accounts, create_service_account
]
