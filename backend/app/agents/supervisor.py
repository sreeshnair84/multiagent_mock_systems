from typing import Literal
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.agents.state import AgentState
from app.core.llm import get_llm
from pydantic import BaseModel

# Define the routing structure
class Route(BaseModel):
    next: Literal["ServiceNow", "Intune", "M365", "Access", "Knowledge", "FINISH"]

def supervisor_agent(state: AgentState):
    """
    Supervisor Agent: Routes conversation to specialized workers or finishes.
    """
    model = get_llm()
    
    system_prompt = (
        "You are the Supervisor of an Enterprise Interface. "
        "Your goal is to route the user's request to the correct specialist worker. "
        "Workers: \n"
        "- ServiceNow: IT incidents, tickets, support requests.\n"
        "- Intune: Device management, compliance, wiping devices.\n"
        "- M365: User management, licenses, password resets, email (Outlook).\n"
        "- Access: SAP GRC, permission requests, role assignment.\n"
        "- Knowledge: Questions about HR policies, IT SOPs, Procedures, How-To guides.\n"
        "\n"
        "If the user is just saying hello or the task is done, route to FINISH. "
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="messages"),
        ("system", "Given the conversation above, who should act next? Select one of: ServiceNow, Intune, M365, Access, Knowledge, or FINISH.")
    ])

    # We use with_structured_output to force the model to pick a valid route
    router = prompt | model.with_structured_output(Route)
    
    try:
        result = router.invoke(state)
        next_step = result.next
    except Exception as e:
        print(f"Router failed: {e}")
        next_step = "FINISH"

    if next_step == "FINISH":
        return {"next": "FINISH"}
    else:
        return {"next": next_step}
