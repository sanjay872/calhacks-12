from fastapi import FastAPI, Body, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from graphs.riskAnalysisGraph import riskAnalysisGraph
from utils.webScraper import get_company_data
from graphs.contractbot import handle_user_message

from typing import Union
import tempfile
import os

from awsS3 import S3Client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Service", version="1.0")



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

s3_client = S3Client()

@app.get("/riskanalysis")
def read_root(payload: dict= Body(...)):
    companyName=payload.get("companyName","")
    criticality=payload.get("criticality","Medium")
    return riskAnalysisGraph(companyName,criticality)

@app.get("/search")
def read_item(payload: dict= Body()):
    return get_company_data(payload.get('companyName',""))

@app.post("/chat")
def chatBot(payload: dict= Body(...)):
    userId=payload.get("userId")
    userMessage=payload.get("userMessage")
    return handle_user_message(userId,userMessage)



@app.get("/list_files")
def list_files_endpoint(user_id: str = None):
    """
    List files for a specific user
    Query param: user_id - User's UID to filter files
    Example: /list_files?user_id=abc123
    """
    files = s3_client.list_files('calhacks3.0', uid=user_id)
    return {"files": files, "user_id": user_id, "count": len(files)}




@app.post("/upload_file")
async def upload_file(file: UploadFile = File(...), user_id: str = Body(...), contract_name: str = Body(...), contract_date: str = Body(...), contract_signatory: str = Body(...)):
    """
    Upload a file to S3 under user's UID folder
    Form data:
    - file: The file to upload
    - user_id: User's UID
    """
    try:
        # Create a temporary file to save the upload
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            # Read file content and write to temp file
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # Upload to S3 with user_id as prefix (uses the updated method)
        print(f"Uploading file {file.filename} for user {user_id}")
        s3_path = s3_client.upload_file(temp_file_path, 'calhacks3.0', file.filename, uid=user_id)
        
        # Clean up temporary file
        os.unlink(temp_file_path)
        
        return {
            "success": True,
            "file_name": file.filename,
            "s3_path": s3_path,
            "file_type": file.content_type,
            "file_size": len(content),
            "user_id": user_id,
            "message": f"File uploaded successfully to S3 at {s3_path}"
        }
        
        
        
        
        
    except Exception as e:
        print(f"Error uploading file: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to upload file"
        }

