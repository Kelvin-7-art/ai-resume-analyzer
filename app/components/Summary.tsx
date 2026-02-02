import React from "react";
import type { Feedback, ResumeData } from "../../types/resume";
import ScoreGauge from "~/components/ScoreGauge";
import ScoreBadge from "~/components/ScoreBadge";

type CategoryProps = {
  title: string;
  score?: number;
};

const Category: React.FC<CategoryProps> = ({ title, score = 0 }) => {
  const textColor =
    score > 70 ? "text-green-600" : score > 49 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="resume-summary">
      <div className="category">
        <div className="flex flex-row gap-2 items-center justify-between">
          <p className="text-base font-semibold text-gray-800">{title}</p>
          <ScoreBadge score={score} />
        </div>

        <p className="text-2xl mt-2">
          <span className={textColor}>{score}</span>
          <span className="text-gray-500">/100</span>
        </p>
      </div>
    </div>
  );
};

const Summary: React.FC<{ feedback: Feedback; meta?: ResumeData }> = ({
  feedback,
  meta,
}) => {
  const overall = feedback?.overallScore ?? 0;

  return (
    <div className="bg-white rounded-2xl shadow-md w-full">
      <div className="flex flex-row items-center p-4 gap-8">
        <ScoreGauge score={overall} />

        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Your Resume Score</h2>
          <p className="text-sm text-gray-500">
            This score is based on ATS compatibility and overall quality.
          </p>

          {/* optional meta display */}
          {(meta?.companyName || meta?.jobTitle) && (
            <div className="text-sm text-gray-600">
              {meta?.companyName ? (
                <p>
                  <b>Company:</b> {meta.companyName}
                </p>
              ) : null}
              {meta?.jobTitle ? (
                <p>
                  <b>Job Title:</b> {meta.jobTitle}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 p-4 pt-0 sm:grid-cols-2">
        <Category title="Tone & Style" score={feedback?.toneAndStyle?.score} />
        <Category title="Content" score={feedback?.content?.score} />
        <Category title="Structure" score={feedback?.structure?.score} />
        <Category title="Skills" score={feedback?.skills?.score} />
      </div>
    </div>
  );
};

export default Summary;
