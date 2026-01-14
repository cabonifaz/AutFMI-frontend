import React from "react";

export const InfoCard = ({ label, value }: { label: string; value?: string }) => (
  <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
    <span className="text-xs text-sky-700 font-semibold">
      {label}
    </span>
    <p className="text-sm mt-1">{value || "-"}</p>
  </div>
);