from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import init_db
from app.models import * # Import models to register with SQLModel
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from app.agents.graph import create_supervisor_graph
from datetime import datetime
import json
from langchain_core.messages import HumanMessage

# Import API routers
from app.api import auth, users, onboarding, rbac

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Init DB
    await init_db()
    
    # 2. Init Checkpointer & Graph
    # Use manual connection to avoid parsing issues
    import aiosqlite
    async with aiosqlite.connect("checkpoints.db") as conn:
        checkpointer = AsyncSqliteSaver(conn)
        # Ensure tables are created
        await checkpointer.setup()
        
        app.state.graph = await create_supervisor_graph(checkpointer=checkpointer)
        
        yield
        # cleanup happens on exit

app = FastAPI(title="Antigravity Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers with /api prefix to match frontend expectations
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(onboarding.router, prefix="/api")
app.include_router(rbac.router, prefix="/api")

# Import and include data router
from app.api import data
app.include_router(data.router, prefix="/api", tags=["Data"])

# Include MCP router for listing servers
from app.mcp.mcp_router import router as mcp_router
app.include_router(mcp_router)

@app.get("/")
async def root():
    return {"message": "Antigravity Backend is running"}

@app.websocket("/ws/chat/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    
    # Init config for this session
    config = {"configurable": {"thread_id": client_id}}
    
    # Get graph from app state
    graph_runnable = app.state.graph
    
    try:
        while True:
            raw_data = await websocket.receive_text()
            
            try:
                payload = json.loads(raw_data)
                content = payload.get("message", "")
                workflow = payload.get("workflow", None)
            except json.JSONDecodeError:
                content = raw_data
                workflow = None

            # 1. Send user message to graph with workflow context
            input_message = HumanMessage(content=content)
            inputs = {"messages": [input_message]}
            if workflow:
                inputs["workflow"] = workflow
            
            # 2. Stream events from graph
            async for event in graph_runnable.astream_events(
                inputs, 
                config, 
                version="v1"
            ):
                kind = event["event"]
                
                # Filter for useful events to stream to frontend
                if kind == "on_chat_model_stream":
                    content = event["data"]["chunk"].content
                    if content:
                        await websocket.send_json({
                            "type": "token",
                            "value": content
                        })
                elif kind == "on_chain_end":
                    # Check if it is the final output from a node
                    data = event["data"].get("output")
                    if data and isinstance(data, dict) and "messages" in data:
                        last_msg = data["messages"][-1]
                        await websocket.send_json({
                            "type": "message",
                            "agent": "Supervisor", # TODO: Dynamic agent name
                            "content": last_msg.content
                        })

    except WebSocketDisconnect:
        logger.info(f"Client #{client_id} disconnected")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
