import React from 'react';

const Aurora = ({
  colorStops = ["#7cff67", "#B497CF", "#5227FF"],
  blend = 0.5,
  amplitude = 1.0,
  speed = 1,
  className = ""
}) => {
  const c1 = colorStops[0] || "#7cff67";
  const c2 = colorStops[1] || "#B497CF";
  const c3 = colorStops[2] || "#5227FF";

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      {/* Soft Aurora Color Orbs with CSS Keyframe Motion */}
      <div
        className="absolute -top-24 -left-24 w-[32rem] h-[32rem] rounded-full filter blur-[90px] opacity-35 animate-aurora-glow-1"
        style={{
          background: `radial-gradient(circle, ${c1} 0%, transparent 70%)`
        }}
      />
      <div
        className="absolute top-1/3 -right-24 w-[36rem] h-[36rem] rounded-full filter blur-[100px] opacity-35 animate-aurora-glow-2"
        style={{
          background: `radial-gradient(circle, ${c2} 0%, transparent 70%)`
        }}
      />
      <div
        className="absolute -bottom-24 left-1/4 w-[40rem] h-[40rem] rounded-full filter blur-[110px] opacity-30 animate-aurora-glow-3"
        style={{
          background: `radial-gradient(circle, ${c3} 0%, transparent 70%)`
        }}
      />
    </div>
  );
};

export default Aurora;
