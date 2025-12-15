
import os
from dotenv import load_dotenv

load_dotenv()

print(f"MODEL_PROVIDER: {os.environ.get('MODEL_PROVIDER')}")
print(f"GEMINI_API_KEY set: {bool(os.environ.get('GEMINI_API_KEY'))}")
print(f"AZURE_OPENAI_API_KEY set: {bool(os.environ.get('AZURE_OPENAI_API_KEY'))}")
