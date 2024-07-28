import pickle
import os

SESSIONS_FILE = "sessions.pkl"

def load_sessions():
    if os.path.exists(SESSIONS_FILE):
        if os.path.getsize(SESSIONS_FILE) > 0:  # Ensure the file is not empty
            try:
                with open(SESSIONS_FILE, 'rb') as f:
                    return pickle.load(f)
            except EOFError:
                # Handle the case where the file might be corrupted or incomplete
                print("Warning: Pickle file appears to be empty or corrupted.")
                return {}
    return {}

def save_sessions(sessions):
    with open(SESSIONS_FILE, "wb") as file:
        pickle.dump(sessions, file)
