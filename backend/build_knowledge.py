from app.core.rag import build_index
from app.core.config import settings

if __name__ == "__main__":
    print(f"Provider: {settings.MODEL_PROVIDER}")
    print(f"Gemini Key: {settings.GEMINI_API_KEY[:5]}...")
    print("Building Knowledge Base...")
    try:
        build_index()
        print("Done.")
    except Exception as e:
        import traceback
        traceback.print_exc()
