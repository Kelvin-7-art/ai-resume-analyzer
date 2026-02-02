import React from "react";

type Suggestion = {
  type: "good" | "improve" | string;
  tip: string;
};

type ATSProps = {
  score: number; // 0 - 100
  suggestions: Suggestion[];
};

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  const isGood = score > 69;
  const isWarn = score > 49 && score <= 69;

  const gradient = isGood
    ? "from-green-100"
    : isWarn
    ? "from-yellow-100"
    : "from-red-100";

  const icon = isGood
    ? "/icons/ats-good.svg"
    : isWarn
    ? "/icons/ats-warning.svg"
    : "/icons/ats-bad.svg";

  const subtitle = isGood
    ? "Strong ATS compatibility"
    : isWarn
    ? "Decent, but can be improved"
    : "Needs ATS improvements";

  const description = isGood
    ? "Your resume is formatted and written in a way that most ATS systems can parse reliably."
    : isWarn
    ? "Your resume is fairly ATS-friendly, but a few changes could significantly improve scanability and keyword matching."
    : "Your resume may struggle with ATS parsing or keyword matching. Fixing format and adding targeted keywords will help a lot.";

  return (
    <div className={`rounded-2xl p-4 shadow-md bg-white bg-gradient-to-br ${gradient}`}>
      {/* Top section */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-white/70 flex items-center justify-center border">
          <img src={icon} alt="ATS status" className="h-7 w-7" />
        </div>

        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-gray-900">
            ATS Score - {Math.round(score)}/100
          </h3>
          <p className="text-sm text-gray-700">{subtitle}</p>
        </div>
      </div>

      {/* Description */}
      <div className="mt-4">
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {/* Suggestions */}
      {!!suggestions?.length && (
        <div className="mt-4 space-y-2">
          {suggestions.map((s, i) => {
            const isGoodTip = String(s.type).toLowerCase() === "good";
            const tipIcon = isGoodTip ? "/icons/check.svg" : "/icons/warning.svg";

            return (
              <div
                key={i}
                className="flex items-start gap-2 rounded-xl bg-white/70 p-3 border"
              >
                <img src={tipIcon} alt={s.type} className="h-4 w-4 mt-0.5" />
                <p className="text-sm text-gray-800">
                  <b className="mr-1">[{s.type}]</b>
                  {s.tip}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Closing line */}
      <p className="mt-4 text-sm font-semibold text-gray-800">
        Keep refining — small changes can produce big jumps in ATS performance.
      </p>
    </div>
  );
};

export default ATS;
