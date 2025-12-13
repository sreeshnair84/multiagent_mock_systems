"""
RAG Document Ingestion Script
Loads SOPs from docs/ directory, chunks them, and stores in FAISS index
"""
import os
from pathlib import Path
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings


def ingest_documents(docs_path: str = "./docs", index_path: str = "./faiss_index"):
    """Ingest policy/SOP documents into FAISS vector store"""
    
    print(f"Loading documents from {docs_path}...")
    
    # Find all text files
    docs_dir = Path(docs_path)
    doc_files = list(docs_dir.glob("*.txt")) + list(docs_dir.glob("*.md"))
    
    if not doc_files:
        print(f"No documents found in {docs_path}")
        return
    
    print(f"Found {len(doc_files)} documents")
    
    # Load documents
    documents = []
    for doc_file in doc_files:
        print(f"Loading {doc_file.name}...")
        try:
            loader = TextLoader(str(doc_file), encoding='utf-8')
            docs = loader.load()
            documents.extend(docs)
        except Exception as e:
            print(f"Error loading {doc_file.name}: {e}")
    
    print(f"Loaded {len(documents)} document(s)")
    
    # Split documents into chunks
    print("Splitting documents into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Created {len(chunks)} chunks")
    
    # Create embeddings
    print("Creating embeddings (this may take a moment)...")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    # Create or update FAISS index
    print(f"Storing in FAISS index at {index_path}...")
    
    if os.path.exists(index_path):
        print("Updating existing index...")
        vectorstore = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)
        vectorstore.add_documents(chunks)
    else:
        print("Creating new index...")
        vectorstore = FAISS.from_documents(chunks, embeddings)
    
    # Save index
    vectorstore.save_local(index_path)
    print(f"Successfully ingested {len(chunks)} chunks into FAISS index!")
    
    # Test query
    print("\nTesting RAG retrieval...")
    test_query = "How do I create a new M365 user?"
    results = vectorstore.similarity_search(test_query, k=3)
    print(f"\nQuery: {test_query}")
    print(f"Top result: {results[0].page_content[:200]}...")
    
    return vectorstore


if __name__ == "__main__":
    import sys
    
    docs_path = sys.argv[1] if len(sys.argv) > 1 else "./docs"
    index_path = sys.argv[2] if len(sys.argv) > 2 else "./faiss_index"
    
    ingest_documents(docs_path, index_path)
