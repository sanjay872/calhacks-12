from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import os
from awsS3 import S3Client

from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://localhost:5173",
        "http://127.0.0.1:5174",
        # "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

s3_client = S3Client()

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/contracts")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.get("/list_files")
def list_files():
    files = s3_client.list_files('calhacks3.0')
    return {"files": files}