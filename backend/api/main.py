from __future__ import annotations

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from backend.src.csv_ranker import rank_from_csv_bytes

app = FastAPI(title="AI Resume Screener - CSV Ranker")

# Allow your frontend dev server (Vite usually = http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/rank-csv")
async def rank_csv(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    top_k: int = Form(10),
):
    csv_bytes = await file.read()
    df = rank_from_csv_bytes(csv_bytes, job_description, top_k=top_k)

    return {
        "count": int(len(df)),
        "results": df.to_dict(orient="records"),
    }
