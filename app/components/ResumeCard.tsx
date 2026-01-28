import { Link } from "react-router";
import type { Resume } from "~/constants";
import ScoreCircle from "~/components/ScoreCircle";

type Props = {
  resume: Resume;
};

const ResumeCard = ({ resume }: Props) => {
  const { id, companyName, jobTitle, feedback, imagePath } = resume;

  // Public assets should load from "/images/..."
  // This ensures you don't accidentally pass a bad/relative path.
  const imgSrc = imagePath?.startsWith("/") ? imagePath : `/${imagePath}`;

  return (
    <Link
      to={`/resume/${id}`}
      className="resume-card animate-in fade-in duration-1000"
    >
      <div className="resume-card-header">
        <div className="flex flex-col gap-2">
          <h2 className="!text-black font-bold break-words">{companyName}</h2>
          <h3 className="!text-lg break-words text-gray-500">{jobTitle}</h3>
        </div>

        <div className="flex-shrink-0">
          <ScoreCircle score={feedback.overallScore} />
        </div>
      </div>

      <div className="gradient-border animate-in fade-in duration-1000">
        <div className="w-full h-full">
          <img
            src={imgSrc}
            alt={`${companyName} resume preview`}
            loading="lazy"
            className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
            onError={(e) => {
              // Helps you debug missing images + shows a clean fallback
              console.log("Image failed to load:", imgSrc);

              const el = e.currentTarget;
              el.src = "/images/placeholder-resume.png"; // <-- add this file in public/images
              el.alt = "Resume preview placeholder";
            }}
          />
        </div>
      </div>
    </Link>
  );
};

export default ResumeCard;
