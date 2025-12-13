try:
    print("Importing faiss...")
    import faiss
    print("faiss ok")
    
    print("Importing langchain_community...")
    import langchain_community
    print("langchain_community ok")
    
    print("Importing Google GenAI...")
    from langchain_google_genai import GoogleGenerativeAIEmbeddings
    print("google genai ok")

    print("Importing RAG...")
    from app.core import rag
    print("rag module ok")

except Exception as e:
    import traceback
    traceback.print_exc()
