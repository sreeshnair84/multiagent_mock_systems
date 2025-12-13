import os
from glob import glob
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from app.core.llm import get_embeddings

VECTOR_STORE_PATH = "faiss_index"

def build_index():
    """
    Loads docs from data/docs, splits, embeds, and saves FAISS index.
    """
    if not os.path.exists("data/docs"):
        print("No docs found.")
        return

    loader = DirectoryLoader("data/docs", glob="*.txt", loader_cls=TextLoader)
    docs = loader.load()
    
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    splits = splitter.split_documents(docs)
    
    embeddings = get_embeddings()
    vectorstore = FAISS.from_documents(splits, embeddings)
    vectorstore.save_local(VECTOR_STORE_PATH)
    print(f"Index built with {len(splits)} chunks.")

def get_retriever():
    """
    Returns a retriever from the local FAISS index.
    """
    embeddings = get_embeddings()
    if not os.path.exists(VECTOR_STORE_PATH):
        # Build functionality on demand or warn
        print("Index not found. Building now...")
        build_index()
    
    vectorstore = FAISS.load_local(VECTOR_STORE_PATH, embeddings, allow_dangerous_deserialization=True)
    return vectorstore.as_retriever(search_kwargs={"k": 3})
