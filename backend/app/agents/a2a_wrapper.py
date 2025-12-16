from typing import Any, AsyncGenerator, Dict, List, Optional
import uuid
from a2a.server.agent_execution import AgentExecutor
from a2a.types import (
    AgentCard,
    AgentSkill,
    TaskStatus,
    TaskState,
    TaskStatusUpdateEvent,
    Task,
    Artifact,
    AgentCapabilities,
    Message,
    TextPart,
    DataPart
)
from a2a.server.agent_execution.context import RequestContext
from a2a.server.events.event_queue import EventQueue
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from app.agents.state import AgentState
from langgraph.graph.state import CompiledStateGraph
import uuid
import datetime


class LangGraphAgentExecutor(AgentExecutor):
    """
    Generic A2A Executor that wraps a LangGraph workflow.
    """
    
    def __init__(self, graph: CompiledStateGraph, name: str, description: str):
        self.graph = graph
        self.agent_name = name
        self.agent_description = description
        print(f"[DEBUG] Initialized LangGraphAgentExecutor for {name}. Has execute_streaming: {hasattr(self, 'execute_streaming')}")
        
        # In-memory session storage (simple map)
        self._sessions: Dict[str, Dict[str, Any]] = {}

    async def get_agent_card(self) -> AgentCard:
        return AgentCard(
            name=self.agent_name,
            description=self.agent_description,
            skills=[
                AgentSkill(id="chat", name="chat", description="Chat with the agent", tags=["chat"]),
                AgentSkill(id="run_workflow", name="run_workflow", description="Execute the agent's primary workflow", tags=["workflow"])
            ],
            version="0.1.0",
            capabilities=AgentCapabilities(streaming=True),
            default_input_modes=["text", "audio"],
            default_output_modes=["text"],
            url=f"/agent"
        )
        
    async def execute(self, context: RequestContext, event_queue: EventQueue) -> None:
        """
        Execute the agent logic with streaming (A2A 0.3.x).
        """
        print(f"[DEBUG] execute() called for task {context.task_id}")
        initial_input = "Hello"
        content_parts = []
        
        if context.message:
            if context.message.parts:
                for part in context.message.parts:
                    if isinstance(part, TextPart):
                        content_parts.append({"type": "text", "text": part.text})
                    elif isinstance(part, DataPart):
                         content_parts.append({"type": "text", "text": f"[Audio Data Received: {part.data.keys()}]"})
            elif hasattr(context.message, 'content') and context.message.content:
                 initial_input = str(context.message.content)
                 content_parts.append({"type": "text", "text": initial_input})
        
        if not content_parts:
            content_parts.append({"type": "text", "text": initial_input})
            
        thread_id = context.context_id or str(uuid.uuid4())
        config = {"configurable": {"thread_id": thread_id}}
        
        try:
            if len(content_parts) == 1 and content_parts[0]["type"] == "text":
                 inputs = {"messages": [HumanMessage(content=content_parts[0]["text"])]}
            else:
                 inputs = {"messages": [HumanMessage(content=content_parts)]}

            # Use astream_events for token streaming
            full_response = ""
            print(f"[DEBUG] Starting streaming...")
            async for event in self.graph.astream_events(inputs, config, version="v1"):
                kind = event["event"]
                
                if kind == "on_chat_model_stream":
                    content = event["data"]["chunk"].content
                    if content:
                        full_response += content
                        print(f"[DEBUG] Streamed {len(content)} chars, total: {len(full_response)}")
                        # Send status update with accumulated response
                        status = TaskStatus(
                            state=TaskState.in_progress,
                            message=Message(
                                messageId=str(uuid.uuid4()),
                                role="agent",
                                parts=[TextPart(text=full_response)]
                            )
                        )
                        status_event = TaskStatusUpdateEvent(
                            task_id=context.task_id,
                            status=status,
                            context_id=context.context_id,
                            final=False
                        )
                        await event_queue.enqueue_event(status_event)

            print(f"[DEBUG] Streaming complete. Full response length: {len(full_response)}")
            
            # If no streaming events, fall back to invoke
            if not full_response:
                print("[DEBUG] No streaming events captured, using ainvoke...")
                result = await self.graph.ainvoke(inputs, config)
                messages = result.get("messages", [])
                last_message = messages[-1] if messages else None
                
                # Handle both string and list content formats
                if last_message:
                    content = last_message.content
                    if isinstance(content, str):
                        full_response = content
                    elif isinstance(content, list):
                        # Extract text from content blocks
                        text_parts = []
                        for block in content:
                            if isinstance(block, dict) and 'text' in block:
                                text_parts.append(block['text'])
                            elif isinstance(block, str):
                                text_parts.append(block)
                        full_response = ''.join(text_parts)
                    else:
                        full_response = str(content)
                else:
                    full_response = "No response generated."
            
            print(f"[DEBUG] Final response: {full_response[:100]}...")
            
            # Send completion status
            status = TaskStatus(
                state=TaskState.completed,
                message=Message(
                    messageId=str(uuid.uuid4()),
                    role="agent",
                    parts=[TextPart(text=full_response)]
                )
            )
            event = TaskStatusUpdateEvent(
                task_id=context.task_id,
                status=status,
                context_id=context.context_id,
                final=True
            )
            await event_queue.enqueue_event(event)
            
            print(f"[Agent Execution] Output: {full_response}")
            
        except Exception as e:
            print(f"Error executing graph: {e}")
            import traceback
            traceback.print_exc()
            status = TaskStatus(
                state=TaskState.failed,
                message=Message(
                    messageId=str(uuid.uuid4()),
                    role="agent",
                    parts=[TextPart(text=str(e))]
                )
            )
            event = TaskStatusUpdateEvent(
                task_id=context.task_id,
                status=status,
                context_id=context.context_id,
                final=True
            )
            await event_queue.enqueue_event(event)

    async def execute_streaming(self, context: RequestContext, event_queue: EventQueue) -> None:
        """
        Stream the agent logic (A2A 0.3.x).
        """
        print(f"[DEBUG] execute_streaming() called (STREAMING) for task {context.task_id}")
        initial_input = "Hello"
        content_parts = []
        
        if context.message:
            if context.message.parts:
                for part in context.message.parts:
                    if isinstance(part, TextPart):
                        content_parts.append({"type": "text", "text": part.text})
                    elif isinstance(part, DataPart):
                         content_parts.append({"type": "text", "text": f"[Audio Data Received: {part.data.keys()}]"})
            elif hasattr(context.message, 'content') and context.message.content:
                 initial_input = str(context.message.content)
                 content_parts.append({"type": "text", "text": initial_input})
        
        if not content_parts:
            content_parts.append({"type": "text", "text": initial_input})
            
        thread_id = context.context_id or str(uuid.uuid4())
        config = {"configurable": {"thread_id": thread_id}}
        
        try:
            if len(content_parts) == 1 and content_parts[0]["type"] == "text":
                 inputs = {"messages": [HumanMessage(content=content_parts[0]["text"])]}
            else:
                 inputs = {"messages": [HumanMessage(content=content_parts)]}

            # Use astream_events for token streaming
            full_response = ""
            print(f"[DEBUG] Starting streaming for task {context.task_id}")
            async for event in self.graph.astream_events(inputs, config, version="v1"):
                kind = event["event"]
                print(f"[DEBUG] Event: {kind}")
                
                if kind == "on_chat_model_stream":
                    content = event["data"]["chunk"].content
                    if content:
                        full_response += content
                        print(f"[DEBUG] Accumulated response length: {len(full_response)}")
                        # Send status update with accumulated response
                        status = TaskStatus(
                            state=TaskState.in_progress,
                            message=Message(
                                messageId=str(uuid.uuid4()),
                                role="agent",
                                parts=[TextPart(text=full_response)]
                            )
                        )
                        status_event = TaskStatusUpdateEvent(
                            task_id=context.task_id,
                            status=status,
                            context_id=context.context_id,
                            final=False
                        )
                        await event_queue.enqueue_event(status_event)

                elif kind == "on_tool_end":
                    # For tool calls, we can send a status update
                    data = event.get("data", {})
                    tool_output = data.get("output")
                    tool_input = data.get("input")
                    name = event.get("name", "Tool")
                    
                    # Send status update about tool execution
                    tool_msg = f"\\n[Tool: {name}]\\n"
                    full_response += tool_msg
                    status = TaskStatus(
                        state=TaskState.in_progress,
                        message=Message(
                            messageId=str(uuid.uuid4()),
                            role="agent",
                            parts=[TextPart(text=full_response)]
                        )
                    )
                    status_event = TaskStatusUpdateEvent(
                        task_id=context.task_id,
                        status=status,
                        context_id=context.context_id,
                        final=False
                    )
                    await event_queue.enqueue_event(status_event)

            print(f"[DEBUG] Streaming complete. Full response length: {len(full_response)}")
            print(f"[DEBUG] Full response: {full_response[:200]}...")
            
            # Send completion status with the actual response
            status = TaskStatus(
                state=TaskState.completed, 
                message=Message(
                    messageId=str(uuid.uuid4()),
                    role="agent",
                    parts=[TextPart(text=full_response if full_response else "No response generated")]
                )
            )
            event = TaskStatusUpdateEvent(
                task_id=context.task_id, 
                status=status, 
                context_id=context.context_id,
                final=True
            )
            await event_queue.enqueue_event(event)

        except Exception as e:
            print(f"Error streaming graph: {e}")
            import traceback
            traceback.print_exc()
            status = TaskStatus(
                state=TaskState.failed,
                message=Message(
                    messageId=str(uuid.uuid4()),
                    role="agent",
                    parts=[TextPart(text=repr(e))]
                )
            )
            event = TaskStatusUpdateEvent(
                task_id=context.task_id,
                status=status,
                context_id=context.context_id,
                final=True
            )
            await event_queue.enqueue_event(event)


    async def cancel(self, context: RequestContext, event_queue: EventQueue) -> None:
        """
        Cancel the current execution.
        """
        print(f"[Agent Execution] Cancel requested for task {context.task_id}")
        # For this wrapper, we just acknowledge the cancellation
        status = TaskStatus(
            state=TaskState.canceled,
            message="Task cancelled by user request."
        )
        event = TaskStatusUpdateEvent(
            task_id=context.task_id,
            status=status,
            context_id=context.context_id
        )
        await event_queue.enqueue_event(event)
