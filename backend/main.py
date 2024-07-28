from fastapi import Depends, FastAPI, Response, status, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from starlette.responses import JSONResponse
from langchain_community.embeddings import HuggingFaceHubEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage
import google.generativeai as genai

from models import Query
from utils import create_db, delete_db, to_markdown
from session import load_sessions, save_sessions

from threading import Timer, Lock
from dotenv import load_dotenv
import time
import shutil
import uuid
import os

load_dotenv()

API_KEY = os.getenv('GOOGLE_GEMINI_API_KEY')
HUGGINGFACE_KEY = os.getenv('HUGGINGFACE_TOKEN')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Handling sessions for deleting data after inactivity
sessions = load_sessions()
SESSION_TIMEOUT = 600  # 10 minutes

# Timers are not serializable; manage them separately
timers = {}
session_lock = Lock()

api_key_header = APIKeyHeader(name="X-Session-ID", auto_error=False)

# AI model
genai.configure(api_key=API_KEY)

PROMPT_TEMPLATE = '''
    You are a resume review agent. You have been asked to review 
    the following resume and make suggestions for improvement, if any,
    based on the job desription below.
    
    If any issues are spotted, that can be easily corrected by you,
    offer a correction as well. This is applicable to spelling, grammar,
    and formatting.
    
    Feel free to peruse everything and be critical, but friendly.
    This is resume in question for context:
    
    {context}

    ---

    This the role and/or job description in question. Use the context
    above to give your unbiased opinion: {question}
'''


# session handling
def cleanup_session(session_id):
    with session_lock:
        if session_id in sessions:
            del sessions[session_id]
            save_sessions(sessions)
            print(f"Session {session_id} cleaned up")
        
        if session_id in timers:
            timers[session_id].cancel()
            del timers[session_id]
        

def get_session(session_id: str = Depends(api_key_header)):
    with session_lock:
        print(f"Getting session for ID: {session_id}")
        print(sessions)
        
        if session_id is None or session_id not in sessions:
            new_session_id = str(uuid.uuid4())
            print(f"Creating new session with ID: {new_session_id}")
            sessions[new_session_id] = {
                "vector_store": None,
                "last_activity": time.time(),
                # "cleanup_timer": Timer(SESSION_TIMEOUT, cleanup_session, args=[new_session_id])
            }
            save_sessions(sessions)
            print(f"New session created: {sessions[new_session_id]}")
            timers[new_session_id] = Timer(SESSION_TIMEOUT, cleanup_session, args=[new_session_id])
            timers[new_session_id].start()
            return new_session_id, sessions[new_session_id]
        
        print(f"Returning existing session: {session_id}")
        print(f"Session data: {sessions[session_id]}")
        sessions[session_id]["last_activity"] = time.time()
        save_sessions(sessions) 
        
        if session_id in timers:
            timers[session_id].cancel()
            timers[session_id] = Timer(SESSION_TIMEOUT, cleanup_session, args=[session_id])
            timers[session_id].start()
        return session_id, sessions[session_id]


# routes
@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(response: Response, file: UploadFile = File(...), session_data: tuple = Depends(get_session)):
    session_id, session = session_data
    
    print(f"Upload started for session {session_id}")
    
    # Save the uploaded file to disk
    file_path = f"temp_{session_id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        print(f"Creating vector store for file: {file_path}")
        vector_store = create_db(file_path, session_id=session_id)
        print(f"Vector store created successfully")
        
        session['vector_store'] = vector_store
        print(f"Vector store stored in session {session_id}")
        print(f"Updated session data: {session}")
        
        # Update the global sessions dictionary
        sessions[session_id] = session
        print(f"Global sessions dictionary updated for {session_id}")
    
        response = {
            'message': f'Database {file.filename} created',
            'session_id': session_id,
        }
        
        return JSONResponse({'response': response}, status_code=status.HTTP_201_CREATED)
    
    except Exception as e:
        print(f"Error creating vector store: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating vector store: {str(e)}")
    
    finally:
        # remove temporary file
        os.remove(file_path)


@app.post("/query", status_code=status.HTTP_200_OK)
async def query_item(query: Query, session_data: tuple = Depends(get_session)):
    print(query)
    session_id, session = session_data
    
    print(f"Query received for session {session_id}")
    print(f"Session data: {session}")
    
    if "vector_store" not in session or session["vector_store"] is None:
        print(f"No vector store found in session {session_id}")
        raise HTTPException(status_code=400, detail="No documents have been added yet")
    
    # embedding_function = HuggingFaceHubEmbeddings(model="all-MiniLM-L6-v2")
    # db = QdrantVectorStore(collection_name=f"qdrant_db_{session_id}",embedding=embedding_function)
    db = session['vector_store']
    results = db.similarity_search(query.query)
    print(f"Vector store retrieved from session {session_id}")
    
    if len(results) == 0:
        return Response('Unable to find matching results', status_code=status.HTTP_200_OK)
    
    # format the prompt with the context and question
    formatted_prompt = PROMPT_TEMPLATE.format(
        context="\n".join(doc.page_content for doc in results),
        question=query.query
    )

    model = genai.GenerativeModel('gemini-1.5-flash')
    response_text = model.generate_content(formatted_prompt)

    print(response_text.text)

    sources = [doc.metadata.get('source') for doc in results]

    formatted_response = {'answer': response_text.text, 'sources': sources}

    return JSONResponse({'response': formatted_response}, status_code=status.HTTP_200_OK)


@app.delete("/delete", status_code=status.HTTP_200_OK)
async def delete_database():
    try:
        delete_db()
        return Response("Database deleted", status_code=status.HTTP_200_OK)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Database not found")
    
    


@app.on_event("startup")
def startup_event():
    global sessions
    sessions = load_sessions()

@app.on_event("shutdown")
def shutdown_event():
    save_sessions(sessions)
    for timer in timers.values():
        timer.cancel()