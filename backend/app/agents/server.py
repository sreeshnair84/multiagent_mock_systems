
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from a2a.server.apps.rest.fastapi_app import A2ARESTFastAPIApplication
from a2a.server.request_handlers.default_request_handler import DefaultRequestHandler
from a2a.server.tasks.inmemory_task_store import InMemoryTaskStore
from app.agents.a2a_wrapper import LangGraphAgentExecutor
from app.agents.resource_agent import create_resource_graph
from app.agents.intune_agent import create_intune_graph
from app.agents.access_management_agent import create_access_graph
import asyncio

async def create_app():
    # 1. initialize graphs (async)
    resource_graph = await create_resource_graph()
    intune_graph = await create_intune_graph()
    access_graph = await create_access_graph()
    
    # 2. Create Executors
    resource_executor = LangGraphAgentExecutor(
        graph=resource_graph,
        name="Resource Provisioning Agent",
        description="Agent for provisioning and managing Azure Resources (VMs, App Services, RGs, Service Accounts)"
    )
    
    intune_executor = LangGraphAgentExecutor(
        graph=intune_graph, 
        name="Intune Management Agent",
        description="Agent for device management, compliance, and policies via Microsoft Intune"
    )
    
    access_executor = LangGraphAgentExecutor(
        graph=access_graph,
        name="Access Management Agent",
        description="Agent for handling user access requests, approvals, and onboarding workflows"
    )

    # 3. Create A2A Apps (FastAPI)
    # A2A 0.3.x uses A2ARESTFastAPIApplication which is a FastAPI subclass or wrapper.
    # It requires an AgentCard and a RequestHandler.
    
    # Resource Agent
    resource_store = InMemoryTaskStore()
    resource_handler = DefaultRequestHandler(agent_executor=resource_executor, task_store=resource_store)
    resource_card = await resource_executor.get_agent_card()
    resource_app = A2ARESTFastAPIApplication(agent_card=resource_card, http_handler=resource_handler).build()
    
    # Intune Agent
    intune_store = InMemoryTaskStore()
    intune_handler = DefaultRequestHandler(agent_executor=intune_executor, task_store=intune_store)
    intune_card = await intune_executor.get_agent_card()
    intune_app = A2ARESTFastAPIApplication(agent_card=intune_card, http_handler=intune_handler).build()
    
    # Access Agent
    access_store = InMemoryTaskStore()
    access_handler = DefaultRequestHandler(agent_executor=access_executor, task_store=access_store)
    access_card = await access_executor.get_agent_card()
    access_app = A2ARESTFastAPIApplication(agent_card=access_card, http_handler=access_handler).build()
    
    # 4. Main Composite App
    main_app = FastAPI()
    
    main_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Mount sub-apps
    main_app.mount("/agents/resource", resource_app)
    main_app.mount("/agents/intune", intune_app)
    main_app.mount("/agents/access", access_app)
    
    return main_app

if __name__ == "__main__":
    # Needed for async initialization
    print("Initializing event loop...")
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    print("Creating app...")
    try:
        app = loop.run_until_complete(create_app())
        print("App created successfully.")
        
        print("Starting uvicorn...")
        uvicorn.run(app, host="0.0.0.0", port=8006)
    except Exception as e:
        print(f"FAILED to start server: {e}")
        import traceback
        traceback.print_exc()
