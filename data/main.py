from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
import os

DATA_PATH = "data/pdfs/"

def main():
  documents = load_documents()
  chunks = split_text(documents)

def load_documents():
  document_loader = PyPDFDirectoryLoader(DATA_PATH)
  docs = document_loader.load()

  return docs

def split_text(documents: list[Document]):
  text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=300,
    chunk_overlap=100,
    length_function=len,
    add_start_index=True,
  )
  chunks = text_splitter.split_documents(documents)
  print(f"Split {len(documents)} documents into {len(chunks)} chunks.")

  document = chunks[100]
  print(document.page_content)
  print(document.metadata)

  return chunks

if __name__ == "__main__":
    main()