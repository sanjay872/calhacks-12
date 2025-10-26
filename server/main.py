from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from graphs.riskAnalysisGraph import riskAnalysisGraph
from utils.webScraper import get_company_data

app = FastAPI(title="AI Service", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/riskanalysis")
def read_root(payload: dict= Body(...)):
    companyName=payload.get("companyName","")
    criticality=payload.get("criticality","Medium")
    return riskAnalysisGraph(companyName,criticality)

@app.get("/search")
def read_item(payload: dict= Body()):
    return get_company_data(payload.get('companyName',""))