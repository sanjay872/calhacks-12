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
def list_files():
    files = s3_client.list_files('calhacks3.0')
    return {"files": files}

@app.post("/upload_file")
async def upload_file(file: UploadFile = File(...), user_id: str = Body(...)):
    try:
        # Create a temporary file to save the upload
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            # Read file content and write to temp file
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # Upload to S3
        file_name = f"{user_id}/{file.filename}"
        
        print(f"Uploading file {file_name} to S3")
        s3_client.upload_file(temp_file_path, 'calhacks3.0', file_name)
        
        # Clean up temporary file
        os.unlink(temp_file_path)
        
        return {
            "success": True,
            "file_name": file.filename,
            "file_type": file.content_type,
            "file_size": len(content),
            "message": "File uploaded successfully to S3"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to upload file"
        }