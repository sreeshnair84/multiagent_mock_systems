from langchain_openai import ChatOpenAI, AzureChatOpenAI, AzureOpenAIEmbeddings, OpenAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from app.core.config import settings

def get_llm():
    """
    Returns the configured LLM instance based on MODEL_PROVIDER settings.
    """
    provider = settings.MODEL_PROVIDER.lower()
    
    if provider == "azure":
        return AzureChatOpenAI(
            azure_deployment=settings.AZURE_OPENAI_DEPLOYMENT,
            api_version=settings.AZURE_OPENAI_API_VERSION,
            temperature=0
        )
    elif provider == "gemini":
        return ChatGoogleGenerativeAI(
            model="gemini-1.5-pro",
            temperature=0,
            google_api_key=settings.GEMINI_API_KEY,
            convert_system_message_to_human=True 
        )
    else:
        # Default to standard OpenAI
        return ChatOpenAI(
            model=settings.OPENAI_MODEL, 
            temperature=0
        )

def get_embeddings():
    """
    Returns the configured Embeddings instance.
    Forcing Local Embeddings to avoid Quota issues.
    """
    from langchain_huggingface import HuggingFaceEmbeddings
    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
