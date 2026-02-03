from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from typing import List, Optional, Tuple, Dict, Any

import pandas as pd
import numpy as np

import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# -----------------------------
# NLTK setup (safe downloads)
# -----------------------------
def _ensure_nltk():
    try:
        nltk.data.find("tokenizers/punkt")
    except LookupError:
        nltk.download("punkt", quiet=True)

    try:
        nltk.data.find("corpora/stopwords")
    except LookupError:
        nltk.download("stopwords", quiet=True)


_ensure_nltk()
STOPWORDS = set(stopwords.words("english"))


# -----------------------------
# spaCy model loader
# -----------------------------
def _load_spacy_model():
    # Best: en_core_web_sm (download once: python -m spacy download en_core_web_sm)
    try:
        return spacy.load("en_core_web_sm")
    except Exception:
        # fallback: blank pipeline (still works but weaker)
        return spacy.blank("en")


NLP = _load_spacy_model()


# -----------------------------
# Basic "skills" vocabulary
# (You can expand this list)
# -----------------------------
SKILL_TERMS = {
    "python", "java", "javascript", "typescript", "react", "next.js", "node", "express",
    "sql", "postgresql", "mysql", "mongodb", "docker", "kubernetes", "git",
    "machine learning", "deep learning", "nlp", "scikit-learn", "pandas", "numpy",
    "tensorflow", "pytorch", "streamlit", "fastapi", "flask",
    "aws", "azure", "gcp",
    "power bi", "tableau",
}


def clean_text_nltk(text: str) -> str:
    """NLTK-based tokenization + stopword removal."""
    if not isinstance(text, str):
        return ""

    text = text.replace("\n", " ").replace("\r", " ").strip().lower()
    tokens = word_tokenize(text)
    tokens = [t for t in tokens if t.isalnum()]
    tokens = [t for t in tokens if t not in STOPWORDS]
    return " ".join(tokens)


def extract_skills_spacy(text: str) -> List[str]:
    """Very practical spaCy-based skill extraction."""
    if not text:
        return []

    doc = NLP(text.lower())

    found = set()

    # 1) match against SKILL_TERMS using spans from noun chunks / entities
    # noun_chunks requires parser; blank model may not have it. So wrap safely.
    spans = []

    try:
        spans.extend([chunk.text for chunk in doc.noun_chunks])
    except Exception:
        pass

    spans.extend([ent.text for ent in doc.ents])
    spans.extend([t.text for t in doc if t.is_alpha and len(t.text) >= 3])

    for s in spans:
        s2 = s.strip().lower()
        if s2 in SKILL_TERMS:
            found.add(s2)

    # 2) also catch multi-word skills like "machine learning" by substring search
    txt = doc.text.lower()
    for term in SKILL_TERMS:
        if " " in term and term in txt:
            found.add(term)

    return sorted(found)


def _pick_resume_text_column(df: pd.DataFrame) -> str:
    """Try common column names. Your dataset screenshot shows 'Resume_str'."""
    candidates = ["Resume_str", "resume_str", "Resume", "resume", "text", "Text", "content", "Content"]
    for c in candidates:
        if c in df.columns:
            return c
    # fallback: first object column
    obj_cols = [c for c in df.columns if df[c].dtype == "object"]
    if obj_cols:
        return obj_cols[0]
    raise ValueError("Could not find a resume text column (e.g., Resume_str).")


def _pick_id_column(df: pd.DataFrame) -> Optional[str]:
    for c in ["ID", "id", "Id", "candidate_id", "CandidateID"]:
        if c in df.columns:
            return c
    return None


def _pick_category_column(df: pd.DataFrame) -> Optional[str]:
    for c in ["Category", "category", "Label", "label"]:
        if c in df.columns:
            return c
    return None


def rank_from_df(df: pd.DataFrame, job_description: str, top_k: int = 10) -> pd.DataFrame:
    if not isinstance(job_description, str) or not job_description.strip():
        raise ValueError("job_description is required")

    resume_col = _pick_resume_text_column(df)
    id_col = _pick_id_column(df)
    cat_col = _pick_category_column(df)

    # clean texts with NLTK
    resumes_raw = df[resume_col].fillna("").astype(str).tolist()
    resumes_clean = [clean_text_nltk(t) for t in resumes_raw]
    jd_clean = clean_text_nltk(job_description)

    # TF-IDF ranking (scikit-learn)
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
    matrix = vectorizer.fit_transform([jd_clean] + resumes_clean)
    jd_vec = matrix[0:1]
    resume_vecs = matrix[1:]

    sims = cosine_similarity(jd_vec, resume_vecs).flatten()  # 0..1
    scores_100 = (sims * 100.0).round(2)

    # spaCy skills
    jd_skills = set(extract_skills_spacy(job_description))

    rows: List[Dict[str, Any]] = []
    for i, raw_text in enumerate(resumes_raw):
        resume_skills = set(extract_skills_spacy(raw_text))
        matched = sorted(jd_skills.intersection(resume_skills))
        missing = sorted(jd_skills.difference(resume_skills))

        row = {
            "row_index": i,
            "similarity": float(sims[i]),
            "score": float(scores_100[i]),
            "matched_skills": matched,
            "missing_skills": missing,
        }
        if id_col:
            row["ID"] = df.iloc[i][id_col]
        if cat_col:
            row["Category"] = df.iloc[i][cat_col]
        rows.append(row)

    out = pd.DataFrame(rows).sort_values(by="score", ascending=False).head(int(top_k)).reset_index(drop=True)
    return out


def rank_from_csv_bytes(csv_bytes: bytes, job_description: str, top_k: int = 10) -> pd.DataFrame:
    df = pd.read_csv(BytesIO(csv_bytes))
    return rank_from_df(df, job_description, top_k=top_k)


# Optional: local test runner
if __name__ == "__main__":
    # This block is only for local testing, not needed for API.
    sample_jd = "We need Python, SQL, NLP, scikit-learn, Git, and experience building ML pipelines."
    path = "data/Resume.csv"  # change if you want
    try:
        test_df = pd.read_csv(path)
        print(rank_from_df(test_df, sample_jd, top_k=5).to_string(index=False))
    except FileNotFoundError:
        print("Place a CSV at data/Resume.csv or use the FastAPI upload endpoint.")
