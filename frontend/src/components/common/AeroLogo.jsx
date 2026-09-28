import React from "react";

export default function AeroLogo({ className = "w-9 h-9" }) {
  return (
    <img
      className={`${className} rounded-xl object-contain shrink-0`}
      src="/apple-touch-icon.png"
      alt="AeroMobility logo"
    />
  );
}
