import { useState } from "react";
import { ChevronDown } from "lucide-react";

export const ApprovalExpandableText = ({
  value,
  preview,
  label,
}: {
  value: string;
  preview: string;
  label: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  if (value === preview || value === "Sin información")
    return <span className="break-words">{value || "Sin información"}</span>;
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-label={
        expanded
          ? `Contraer ${label}`
          : `Ver ${label} ${label === "fecha" ? "completa" : "completo"}`
      }
      onClick={() => setExpanded((current) => !current)}
      className="flex max-w-xs items-start gap-1.5 rounded text-left text-slate-600 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <span className="min-w-0 whitespace-normal break-words leading-relaxed">
        {expanded ? value : preview}
      </span>
      <ChevronDown
        size={14}
        aria-hidden="true"
        className={`mt-1 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
      />
    </button>
  );
};
