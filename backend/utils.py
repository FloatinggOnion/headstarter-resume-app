import uuid
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceHubEmbeddings
# from langchain_chroma import Chroma
from langchain_qdrant import QdrantVectorStore
from IPython.display import display
from IPython.display import Markdown

from dotenv import load_dotenv
import warnings
import shutil
import textwrap
import os

load_dotenv()

warnings.filterwarnings("ignore")

HUGGINGFACE_KEY = os.getenv('HUGGINGFACE_TOKEN')

# loading the pdf and creating db
def create_db(path_to_file: str, session_id):

    # load the pdf
    loader = PyPDFLoader(path_to_file)
    pages = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100, length_function=len, is_separator_regex=False)
    chunks = text_splitter.split_documents(pages)
    print(len(chunks))

    # Generate UUIDs for IDs
    ids = [str(uuid.uuid4()) for _ in range(len(chunks))]

    # creating open-source embedding function
    embedding_function = HuggingFaceHubEmbeddings(model="sentence-transformers/all-mpnet-base-v2", huggingfacehub_api_token=HUGGINGFACE_KEY)

    # create qdrant database with IDs
    vector_store = QdrantVectorStore.from_documents(chunks, embedding_function, collection_name=f"qdrant_db_{session_id}", location=":memory:", ids=ids)
    
    return vector_store


# deleting the db
def delete_db():
    try:
        shutil.rmtree("chroma_db")
    except FileNotFoundError:
        raise FileNotFoundError("Database not found")
    

def to_markdown(text):
  text = text.replace('•', '  *')
  return Markdown(textwrap.indent(text, '> ', predicate=lambda _: True))
