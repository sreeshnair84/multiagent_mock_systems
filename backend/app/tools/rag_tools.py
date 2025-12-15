
"""
RAG Tools
Tools for retrieving information from static documentation/SOPs.
"""
from langchain.tools import tool
import os

# Define path to SOPs relative to possible execution contexts or absolute
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
SOP_PATH = os.path.join(BASE_DIR, "docs", "intune_device_provisioning_sop_v1.txt")

@tool
def consult_intune_sop(query: str) -> str:
    """
    Consults the 'Intune Device Provisioning Standard Operating Procedure'.
    Use this tool to answer questions about:
    - Device enrollment steps and prerequisites
    - Profile types (Standard, Mobile, Executive)
    - Device status definitions
    - Compliance checks and policies
    - Wipe procedures
    
    Args:
        query: The search query or question (e.g., "how to wipe device", "standard profile details")
        
    Returns:
        Relevant sections of the SOP text that match the query.
    """
    if not os.path.exists(SOP_PATH):
        return f"Error: SOP document not found at {SOP_PATH}"
        
    try:
        with open(SOP_PATH, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Simple keyword/semantic-ish search strategy for this single file:
        # 1. If query is very short, return list of headers
        # 2. Split content by headers (##) or sections
        # 3. Return sections containing the keywords from the query
        
        query_lower = query.lower()
        
        # Split into sections based on Markdown headers
        # This is a naive split but effective for structured MD/Text
        sections = content.split("## ")
        
        results = []
        for section in sections:
            section_lower = section.lower()
            # Simple keyword matching: check if any significant word from query is in section
            # Excluding common stop words is better, but naive check works for specific nouns provided in definitions.
            
            # Check for exact phrase matching or significant keyword overlap
            if query_lower in section_lower:
                results.append("## " + section)
                continue
                
            # Fallback: Check if words match
            words = [w for w in query_lower.split() if len(w) > 3]
            match_count = sum(1 for w in words if w in section_lower)
            if match_count > 0 and match_count >= len(words) * 0.5: # 50% keyword match
                results.append("## " + section)
                
        if not results:
            return "No specific sections found matching your query in the SOP. Please try a broader search term like 'enrollment' or 'compliance'."
            
        return "\n---\n".join(results[:3]) # Return top 3 matching sections
        
    except Exception as e:
        return f"Error reading SOP: {str(e)}"
