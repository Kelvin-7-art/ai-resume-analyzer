import React from "react";
import type { Feedback } from "../../types/resume";
import ScoreBadge from "~/components/ScoreBadge";

type Tip = {
  type?: "good" | "improve" | string;
  tip?: string;
  explanation?: string;
};

type SectionBlock = {
  score?: number;
  tips?: Tip[];
  matched?: string[];
  missing?: string[];
};

type DetailsProps = {
  feedback: Feedback;
};

/* =========================
   Helpers
========================= */
const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const TipIcon = ({ type }: { type?: string }) => {
  const isGood = String(type).toLowerCase() === "good";
  return (
    <img
      src={isGood ? "/icons/check.svg" : "/icons/warning.svg"}
      alt={type || "tip"}
      className="h-4 w-4 mt-0.5"
    />
  );
};

const CategoryHeader = ({
  title,
  categoryScore,
}: {
  title: string;
  categoryScore?: number;
}) => {
  const score = categoryScore ?? 0;
  const textColor =
    score > 69 ? "text-green-600" : score > 39 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <ScoreBadge score={score} />
      </div>

      <p className="text-sm text-gray-700">
        <span className={cn("font-bold", textColor)}>{score}</span>
        <span className="text-gray-500">/100</span>
      </p>
    </div>
  );
};

const CategoryContent = ({ tips }: { tips?: Tip[] }) => {
  if (!tips?.length) {
    return (
      <div className="text-sm text-gray-600">
        No tips provided for this section.
      </div>
    );
  }

  const goodTips = tips.filter((t) => String(t.type).toLowerCase() === "good");
  const improveTips = tips.filter((t) => String(t.type).toLowerCase() !== "good");

  return (
    <div className="space-y-4">
      {/* Tips list */}
      <div className="grid gap-2 md:grid-cols-2">
        {tips.map((t, i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded-xl bg-white/70 p-3 border"
          >
            <TipIcon type={t.type} />
            <div>
              <p className="text-sm text-gray-900">
                {t.type ? <b className="mr-1">[{t.type}]</b> : null}
                {t.tip ?? ""}
              </p>
              {t.explanation ? (
                <p className="text-xs text-gray-600 mt-1">{t.explanation}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Explanation boxes */}
      {(goodTips.length > 0 || improveTips.length > 0) && (
        <div className="grid gap-3 md:grid-cols-2">
          {goodTips.length > 0 && (
            <div className="rounded-xl border bg-green-50 p-3">
              <p className="text-sm font-semibold text-green-700">What you did well</p>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-green-900">
                {goodTips.map((t, i) => (
                  <li key={`g-${i}`}>{t.tip}</li>
                ))}
              </ul>
            </div>
          )}

          {improveTips.length > 0 && (
            <div className="rounded-xl border bg-yellow-50 p-3">
              <p className="text-sm font-semibold text-yellow-700">What to improve</p>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-yellow-900">
                {improveTips.map((t, i) => (
                  <li key={`i-${i}`}>{t.tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AccordionSection = ({
  title,
  block,
  defaultOpen,
}: {
  title: string;
  block?: SectionBlock;
  defaultOpen?: boolean;
}) => {
  const score = block?.score ?? 0;

  return (
    <details
      className="rounded-2xl border bg-white/60 p-4"
      open={defaultOpen}
    >
      <summary className="cursor-pointer list-none">
        <CategoryHeader title={title} categoryScore={score} />
      </summary>

      <div className="mt-4">
        <CategoryContent tips={block?.tips} />

        {/* Optional matched/missing (if your model returns it) */}
        {(block?.matched?.length || block?.missing?.length) && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {!!block?.matched?.length && (
              <div className="rounded-xl bg-white/70 p-3 border">
                <p className="text-sm font-semibold text-gray-800">Matched</p>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-700">
                  {block.matched.map((s, i) => (
                    <li key={`m-${i}`}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {!!block?.missing?.length && (
              <div className="rounded-xl bg-white/70 p-3 border">
                <p className="text-sm font-semibold text-gray-800">Missing</p>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-700">
                  {block.missing.map((s, i) => (
                    <li key={`x-${i}`}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </details>
  );
};

const Details: React.FC<DetailsProps> = ({ feedback }) => {
  return (
    <div className="flex flex-col gap-4">
      <AccordionSection
        title="Tone & Style"
        block={feedback.toneAndStyle as any}
        defaultOpen
      />
      <AccordionSection title="Content" block={feedback.content as any} />
      <AccordionSection title="Structure" block={feedback.structure as any} />
      <AccordionSection title="Skills" block={feedback.skills as any} />
    </div>
  );
};

export default Details;
