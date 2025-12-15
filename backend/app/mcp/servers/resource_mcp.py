
from fastmcp import FastMCP
from typing import Optional, Dict
from app.tools.resource_tools import (
    list_resource_groups,
    create_resource_group,
    list_vms,
    get_vm_status,
    validate_vm_parameters,
    provision_vm,
    stop_vm,
    start_vm,
    list_app_services,
    create_app_service,
    list_service_accounts,
    create_service_account
)

# Initialize FastMCP server for Resource operations
mcp = FastMCP("Resource Provisioning Service")

# Register all Resource tools
mcp.tool()(list_resource_groups)
mcp.tool()(create_resource_group)
mcp.tool()(list_vms)
mcp.tool()(get_vm_status)
mcp.tool()(validate_vm_parameters)
mcp.tool()(provision_vm)
mcp.tool()(stop_vm)
mcp.tool()(start_vm)
mcp.tool()(list_app_services)
mcp.tool()(create_app_service)
mcp.tool()(list_service_accounts)
mcp.tool()(create_service_account)

if __name__ == "__main__":
    mcp.run()
