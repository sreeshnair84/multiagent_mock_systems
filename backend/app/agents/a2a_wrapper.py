
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

# Define custom events for streaming if not available in a2a.types
from a2a.server.events import Event

class TokenEvent(Event):
    type: str = "token"
    text: str

class ToolCallEvent(Event):
    type: str = "tool_call"
    tool_name: str
    parameters: Dict[str, Any]
    result: Optional[str] = None
    duration: float = 0


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
        Execute the agent logic (A2A 0.3.x).
        """
        initial_input = "Hello"
        content_parts = []
        
        if context.message:
            if context.message.parts:
                for part in context.message.parts:
                    if isinstance(part, TextPart):
                        content_parts.append({"type": "text", "text": part.text})
                    elif isinstance(part, DataPart):
                         # Assuming DataPart contains audio data in 'data' dictionary
                         # content_parts.append({"type": "media", "data": part.data})
                         # For now, we stringify it to debug, or pass it as is if LLM supports it
                         content_parts.append({"type": "text", "text": f"[Audio Data Received: {part.data.keys()}]"})
                         # TODO: Implement actual audio handling compatible with underlying LLM
            elif hasattr(context.message, 'content') and context.message.content:
                 initial_input = str(context.message.content)
                 content_parts.append({"type": "text", "text": initial_input})
        
        if not content_parts:
            content_parts.append({"type": "text", "text": initial_input})
            
        thread_id = context.context_id or str(uuid.uuid4())
        
        # Run the graph
        config = {"configurable": {"thread_id": thread_id}}
        
        try:
            # Construct message with content parts
            # If only text, pass string for simplicity/compatibility
            if len(content_parts) == 1 and content_parts[0]["type"] == "text":
                 inputs = {"messages": [HumanMessage(content=content_parts[0]["text"])]}
            else:
                 # Pass list of content blocks
                 inputs = {"messages": [HumanMessage(content=content_parts)]}
                 
            result = await self.graph.ainvoke(inputs, config)
            
            # Extract last AI message
            messages = result.get("messages", [])
            last_message = messages[-1] if messages else None
            output_text = last_message.content if last_message else "No response generated."
            
            # Update status to COMPLETED
            # We construct the status object
            status = TaskStatus(
                state=TaskState.completed,
                message=Message(
                    messageId=str(uuid.uuid4()),
                    role="agent",
                    parts=[TextPart(text="Workflow completed successfully.")]
                )
            )
            
            # Enqueue the update event
            event = TaskStatusUpdateEvent(
                task_id=context.task_id,
                status=status,
                context_id=context.context_id,
                final=True
            )
            await event_queue.enqueue_event(event)
            
            # TODO: Send the actual output message back using appropriate event if supported
            print(f"[Agent Execution] Output: {output_text}")
            
        except Exception as e:
            print(f"Error executing graph: {e}")
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
            async for event in self.graph.astream_events(inputs, config, version="v1"):
                kind = event["event"]
                
                if kind == "on_chat_model_stream":
                    content = event["data"]["chunk"].content
                    if content:
                        # Emit TokenEvent
                        token_evt = TokenEvent(text=content)
                        await event_queue.enqueue_event(token_evt)

                elif kind == "on_tool_end":
                    # Emit ToolCallEvent
                    # event['data'] usually has 'input' and 'output'
                    data = event.get("data", {})
                    tool_output = data.get("output")
                    tool_input = data.get("input")
                    name = event.get("name", "Tool")
                    
                    # Convert output to string if needed
                    output_str = str(tool_output) if tool_output is not None else ""
                    
                    tool_evt = ToolCallEvent(
                        tool_name=name,
                        parameters=tool_input if isinstance(tool_input, dict) else {"input": str(tool_input)},
                        result=output_str
                    )
                    await event_queue.enqueue_event(tool_evt)

                        
            # Execute and send final result
            result = await self.graph.ainvoke(inputs, config)
            messages = result.get("messages", [])
            last_message = messages[-1] if messages else None
            output_text = last_message.content if last_message else ""
            
            # Send completion
            status = TaskStatus(
                state=TaskState.completed, 
                message=Message(
                    messageId=str(uuid.uuid4()),
                    role="agent",
                    parts=[TextPart(text=output_text)]
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
