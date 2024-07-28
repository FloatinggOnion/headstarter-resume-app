from pydantic import BaseModel

class Query(BaseModel):
    query: str
    # neighbours: int = 3
    
class Document(BaseModel):
    text: str
    metadata: dict