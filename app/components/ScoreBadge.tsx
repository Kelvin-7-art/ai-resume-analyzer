import React from "react";

type ScoreBadgeProps = {
  score: number;
};

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  const isStrong = score > 70;
  const isGoodStart = score > 49 && score <= 70;

  const label = isStrong ? "Strong" : isGoodStart ? "Good Start" : "Needs Work";

  const classes = isStrong
    ? "bg-badge-green text-green-600"
    : isGoodStart
    ? "bg-badge-yellow text-yellow-600"
    : "bg-badge-red text-red-600";

  return (
    <div className={`px-3 py-1 rounded-full w-fit ${classes}`}>
      <p className="text-xs font-semibold">{label}</p>
    </div>
  );
};

export default ScoreBadge;
