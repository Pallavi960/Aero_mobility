import React from "react";

export default function MetricCard({ label, value, unit, icon, highlightColor }) {
  return (
    <div className="rounded-xl border border-[#e2ece6] bg-[#f8faf8] p-3 transition hover:border-[#cbdcd2]">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#789087]">{label}</p>
        {icon && <span className="text-xs">{icon}</span>}
      </div>
      <p
        className="mt-1 font-display text-base font-bold"
        style={{ color: highlightColor || "#17352b" }}
      >
        {value ?? "--"}
        {value !== undefined && value !== null && unit ? (
          <span className="text-xs font-medium text-[#789087] ml-0.5">{unit}</span>
        ) : ""}
      </p>
    </div>
  );
}
