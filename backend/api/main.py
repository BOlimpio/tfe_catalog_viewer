from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
from pydantic import BaseModel
import uvicorn
import json
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

API_TOKEN = "mock-token"
MOCK_HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/vnd.api+json"
}

# Load data from data.json
DATA_FILE = Path(__file__).parent / "data.json"
with open(DATA_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

WORKSPACES = data["workspaces"]
RESOURCES = data["resources"]

class ResourceAttributes(BaseModel):
    address: str
    name: str
    created_at: str
    updated_at: str
    module: str
    provider: str
    provider_type: str
    modified_by_state_version_id: str
    name_index: Optional[str]

class Resource(BaseModel):
    id: str
    type: str
    attributes: ResourceAttributes

class WorkspaceAttributes(BaseModel):
    name: str
    description: Optional[str]
    execution_mode: str
    terraform_version: str
    resource_count: int
    created_at: str
    updated_at: str
    locked: bool
    environment: str

class Workspace(BaseModel):
    id: str
    type: str
    attributes: WorkspaceAttributes

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v2/organizations/{org_name}/workspaces")
def get_workspaces(org_name: str, authorization: str = Header(...)):
    if authorization != MOCK_HEADERS["Authorization"]:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return JSONResponse(content={
        "data": WORKSPACES,
        "links": {
            "self": "https://localhost:8000/api/v2/workspaces?page[number]=1&page[size]=20",
            "first": "https://localhost:8000/api/v2/workspaces?page[number]=1&page[size]=20",
            "prev": None,
            "next": None,
            "last": "https://localhost:8000/api/v2/workspaces?page[number]=1&page[size]=20"
        },
        "meta": {
            "pagination": {
                "current-page": 1,
                "next-page": None,
                "page-size": 20,
                "prev-page": None,
                "total-count": len(WORKSPACES),
                "total-pages": 1
            }
        }
    })

@app.get("/api/v2/workspaces/{workspace_id}/resources")
def get_resources(workspace_id: str, authorization: str = Header(...)):
    if authorization != MOCK_HEADERS["Authorization"]:
        raise HTTPException(status_code=401, detail="Unauthorized")

    resources = RESOURCES.get(workspace_id, [])

    return JSONResponse(content={
        "data": resources,
        "links": {
            "self": f"https://localhost:8000/api/v2/workspaces/{workspace_id}/resources?page[number]=1&page[size]=20",
            "first": f"https://localhost:8000/api/v2/workspaces/{workspace_id}/resources?page[number]=1&page[size]=20",
            "prev": None,
            "next": None,
            "last": f"https://localhost:8000/api/v2/workspaces/{workspace_id}/resources?page[number]=1&page[size]=20"
        },
        "meta": {
            "pagination": {
                "current-page": 1,
                "next-page": None,
                "page-size": 20,
                "prev-page": None,
                "total-pages": 1,
                "total-count": len(resources)
            }
        }
    })

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
