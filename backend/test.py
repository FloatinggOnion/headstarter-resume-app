import requests
import json

url = "http://localhost:8000/query"  # Replace with your actual endpoint
headers = {
    "X-Session-ID": "c40d84cf-5f0b-4680-949e-5a75deca3e3e",  # Replace with your actual session ID
    "Content-Type": "application/json"
}

data = {
    "query": "Fullstack Engineer (Python, React)"
}

response = requests.post(url, headers=headers, json=data)
print(response.status_code)
print(response.json())
