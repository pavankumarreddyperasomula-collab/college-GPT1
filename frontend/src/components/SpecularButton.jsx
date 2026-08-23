import React, { useState, useRef } from 'react';

const SpecularButton = ({
  children,
  onClick,
  size = "lg",
  radius = 18,
  textColor = "#f5f5f5",
  lineColor = "#ffffff",
  baseColor = "#ea580c",
  className = "",
  type = "button",
  disabled = false,
  ...props
}) => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const btnRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <button
      ref={btnRef}
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        borderRadius: `${radius}px`,
        color: textColor,
        background: isHovered
          ? `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.25) 0%, transparent 60%), linear-gradient(135deg, #f97316 0%, #dc2626 100%)`
          : `linear-gradient(135deg, #ea580c 0%, #c2410c 100%)`,
        boxShadow: isHovered
          ? `0 10px 25px -5px rgba(234, 88, 12, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4)`
          : `0 4px 14px rgba(234, 88, 12, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)`
      }}
      className={`relative inline-flex items-center justify-center font-extrabold text-sm sm:text-base px-6 py-3.5 border border-white/30 transition-all duration-300 transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden backdrop-blur-md ${className}`}
      {...props}
    >
      {/* Specular Edge Highlight Overlay */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-300 opacity-60 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, ${lineColor} 0%, transparent 50%)`,
          mixBlendMode: 'overlay'
        }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
};

export default SpecularButton;
