from dotenv import load_dotenv
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_google_alloydb_pg import AlloyDBEngine
from langchain_google_alloydb_pg import AlloyDBVectorStore
from langchain_google_vertexai import VertexAIEmbeddings

import asyncio
import os
import uuid

load_dotenv()

DATA_PATH = "data/pdfs/"
GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID")
PSQL_REGION = os.getenv("PSQL_REGION")
PSQL_CLUSTER = os.getenv("PSQL_CLUSTER")
PSQL_INSTANCE = os.getenv("PSQL_INSTANCE")
PSQL_DATABASE = os.getenv("PSQL_DATABASE")
PSQL_VECTOR_TABLE = os.getenv("PSQL_VECTOR_TABLE")
PSQL_USER = os.getenv("PSQL_USER")
PSQL_PW = os.getenv("PSQL_PW")

async def main() -> None:
  documents = load_documents()
  chunks = split_text(documents)

  await store = await create_store()
  await save_to_alloydb(store, chunks)

  # store = await get_store()
  # query = "I'd like to be a bard."
  # docs = await store.asimilarity_search(query)
  # print(docs)

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

  return chunks

async def create_store():
  engine = await AlloyDBEngine.afrom_instance(
    project_id=GCP_PROJECT_ID,
    region=PSQL_REGION,
    cluster=PSQL_CLUSTER,
    instance=PSQL_INSTANCE,
    database=PSQL_DATABASE,
    user=PSQL_USER,
    password=PSQL_PW,
  )

  embedding = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest", project=GCP_PROJECT_ID
  )

  await engine.ainit_vectorstore_table(
    table_name=PSQL_VECTOR_TABLE,
    vector_size=768,  # Vector size for VertexAI model(textembedding-gecko@latest)
  )

  store = await AlloyDBVectorStore.create(
    engine=engine,
    table_name=PSQL_VECTOR_TABLE,
    embedding_service=embedding,
  )

  return store

async def get_store():
  engine = await AlloyDBEngine.afrom_instance(
    project_id=GCP_PROJECT_ID,
    region=PSQL_REGION,
    cluster=PSQL_CLUSTER,
    instance=PSQL_INSTANCE,
    database=PSQL_DATABASE,
    user=PSQL_USER,
    password=PSQL_PW,
  )

  embedding = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest", project=GCP_PROJECT_ID
  )

  store = await AlloyDBVectorStore(
    engine=engine,
    table_name=PSQL_VECTOR_TABLE,
    embedding_service=embedding,
  )

  return store

async def save_to_alloydb(store, chunks: list[Document]):
  all_texts = [chunk.page_content for chunk in chunks]

  metadatas = [chunk.metadata for chunk in chunks]

  ids = [str(uuid.uuid4()) for _ in chunks]

  await store.aadd_texts(texts=all_texts, metadatas=metadatas, ids=ids)

if __name__ == "__main__":
  asyncio.run(main())