import React from "react";

const Background = () => {
  return (
    <div className="absolute inset-0 -z-10">
      <div className="absolute left-1/2 top-0 h-130 w-130 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute right-10 top-40 h-72 w-72 rounded-full bg-secondary blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.22_0_0)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.22_0_0)_1px,transparent_1px)] bg-size-[64px_64px] opacity-20" />
    </div>
  );
};

export default Background;
