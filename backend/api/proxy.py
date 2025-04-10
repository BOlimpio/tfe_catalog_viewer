from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx


# Configuration
TFE_API_BASE = "{TFE_API_BASE_URL}"
FRONTEND_ORIGIN = "http://localhost:5173"


# Initialize app
app = FastAPI()


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Proxy route
@app.api_route("/proxy/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_to_tfe(path: str, request: Request):

    headers = dict(request.headers)
    headers.pop("host", None)

    try:
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.request(
                method=request.method,
                url=f"{TFE_API_BASE}/{path}",
                headers=headers,
                params=dict(request.query_params),
                content=await request.body(),
            )
        # Try to return as JSON if possible
        try:
            return JSONResponse(
                status_code=response.status_code, content=response.json()
            )
        except Exception:
            return JSONResponse(
                status_code=response.status_code, content={"message": response.text}
            )
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
