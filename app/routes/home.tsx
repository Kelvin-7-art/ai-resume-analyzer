import type { Route } from "./+types/home";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { resumes } from "~/constants";
import { usePuterStore } from "~/lib/puter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Task 03: AI Resume Screener" },
    { name: "description", content: "Smart Feedback for your dream job!" },
  ];
}

/** Backend response row (what we show in UI) */
type RankedRow = {
  ID?: string | number;
  Category?: string;
  score?: number;
  similarity?: number;
  matched_skills?: string[]; // from csv_ranker.py
  missing_skills?: string[]; // from csv_ranker.py
};

export default function Home() {
  const { isLoading, auth } = usePuterStore();
  const navigate = useNavigate();

  // ---------------------------
  // Auth redirect
  // ---------------------------
  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/", { replace: true });
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  // ---------------------------
  // CSV Ranker UI state
  // ---------------------------
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [topK, setTopK] = useState(10);

  const [rankLoading, setRankLoading] = useState(false);
  const [rankError, setRankError] = useState<string>("");
  const [rankResults, setRankResults] = useState<RankedRow[]>([]);

  const canRank = useMemo(() => {
    return !!csvFile && jobDescription.trim().length > 10 && topK > 0;
  }, [csvFile, jobDescription, topK]);

  async function handleRankCsv() {
    setRankError("");
    setRankResults([]);

    if (!csvFile) {
      setRankError("Please select a CSV file.");
      return;
    }
    if (jobDescription.trim().length < 10) {
      setRankError("Please paste a longer job description (at least ~10 characters).");
      return;
    }

    setRankLoading(true);

    try {
      const form = new FormData();
      form.append("file", csvFile);
      form.append("job_description", jobDescription);
      form.append("top_k", String(topK));

      const res = await fetch("http://localhost:8000/rank-csv", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Ranking request failed.");
      }

      const json = await res.json();
      const rows: RankedRow[] = Array.isArray(json?.results) ? json.results : [];

      setRankResults(rows);
    } catch (e: any) {
      const msg = e?.message ?? "Failed to rank CSV. Is the Python backend running?";
      setRankError(msg);
    } finally {
      setRankLoading(false);
    }
  }

  // optional: show nothing / spinner while checking auth
  if (isLoading) return null;

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications and Resume Ratings</h1>
          <h2>Review your submissions and check AI-powered feedback.</h2>
        </div>

        {/* -----------------------------
            NEW: Bulk CSV Ranker Section
           ----------------------------- */}
        <div className="rounded-2xl bg-white/70 border p-6 mb-10">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-bold text-gray-900">
              Bulk CSV Ranking (NLTK + spaCy + scikit-learn)
            </h3>
            <p className="text-sm text-gray-700">
              Upload a CSV dataset (with columns like <b>ID</b> and <b>Resume_str</b>), paste the job description,
              and the backend will rank candidates + show matched/missing skills.
            </p>
          </div>

          <div className="mt-5 grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-gray-800">Upload CSV Dataset</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
              />
              {csvFile ? (
                <p className="text-xs text-gray-600">Selected: {csvFile.name}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-gray-800">Job Description</label>
              <textarea
                rows={5}
                className="job-description"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-semibold text-gray-800">Top K</label>
              <input
                type="number"
                min={1}
                max={50}
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="w-24 border rounded-lg px-2 py-1"
              />

              <button
                className="auth-button"
                type="button"
                onClick={handleRankCsv}
                disabled={!canRank || rankLoading}
              >
                {rankLoading ? "Ranking..." : "Rank Candidates"}
              </button>

              <button
                className="auth-button"
                type="button"
                onClick={() => {
                  setCsvFile(null);
                  setJobDescription("");
                  setTopK(10);
                  setRankResults([]);
                  setRankError("");
                }}
                disabled={rankLoading}
              >
                Clear
              </button>
            </div>

            {rankError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {rankError}
                <div className="mt-2 text-xs text-red-700/80">
                  Tip: Make sure your Python backend is running at{" "}
                  <b>http://127.0.0.1:8000/docs#/</b> and has the <b>/rank-csv</b> endpoint.
                </div>
              </div>
            ) : null}

            {rankResults.length > 0 ? (
              <div className="rounded-xl border bg-white/60 p-4 overflow-auto">
                <h4 className="font-semibold text-gray-900 mb-3">Ranked Results</h4>

                <table className="min-w-[900px] w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-700 border-b">
                      <th className="py-2 pr-3">ID</th>
                      <th className="py-2 pr-3">Category</th>
                      <th className="py-2 pr-3">Score</th>
                      <th className="py-2 pr-3">Similarity</th>
                      <th className="py-2 pr-3">Matched Skills</th>
                      <th className="py-2 pr-3">Missing Skills</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankResults.map((row, i) => (
                      <tr key={i} className="border-b last:border-b-0 text-gray-800">
                        <td className="py-2 pr-3">{row.ID ?? "—"}</td>
                        <td className="py-2 pr-3">{row.Category ?? "—"}</td>
                        <td className="py-2 pr-3">{row.score ?? "—"}</td>
                        <td className="py-2 pr-3">
                          {typeof row.similarity === "number"
                            ? row.similarity.toFixed(4)
                            : "—"}
                        </td>
                        <td className="py-2 pr-3">
                          {(row.matched_skills ?? []).slice(0, 10).join(", ") || "—"}
                        </td>
                        <td className="py-2 pr-3">
                          {(row.missing_skills ?? []).slice(0, 10).join(", ") || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>

        {/* Existing resume cards */}
        {resumes.length > 0 && (
          <div className="resume-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
