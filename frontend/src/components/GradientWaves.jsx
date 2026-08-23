import React, { useRef, useEffect } from 'react';

const GradientWaves = ({
  horizonColor = "#5227FF",
  waveColor = "#FF9FFC",
  crestColor = "#FFFFFF",
  speed = 0.4,
  amplitude = 2.5,
  waveScale = 0.6,
  waveRatio = 0.9,
  swell = 35,
  turbulence = 20,
  tilt = 1.11,
  zoom = 1,
  height = 5.5,
  fogDepth = 15,
  detail = "medium",
  brightness = 1,
  opacity = 1,
  mouseInteraction = true,
  parallaxStrength = 0.5,
  grain = true,
  grainIntensity = 0.05
}) => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const handleMouseMove = (e) => {
      if (!mouseInteraction) return;
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      mouseRef.current.targetX = nx * parallaxStrength;
      mouseRef.current.targetY = ny * parallaxStrength;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stepCount = detail === 'high' ? 90 : detail === 'medium' ? 60 : 35;

    const render = () => {
      time += speed * 0.015;
      const w = canvas.width;
      const h = canvas.height;

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = opacity;

      // Base background horizon gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#060814');
      bgGrad.addColorStop(0.4, horizonColor);
      bgGrad.addColorStop(1, '#0b021c');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Render 3D Perspective Wave Grid Lines
      const lineCount = 28;
      const horizonY = h * 0.4 + mouseRef.current.y * 40;

      for (let i = 0; i < lineCount; i++) {
        const progress = i / lineCount;
        const perspectiveScale = Math.pow(progress, 1.8) * zoom;
        const currentY = horizonY + progress * (h - horizonY) * 1.1;

        ctx.beginPath();
        const startX = -w * 0.2;
        const endX = w * 1.2;
        const dx = (endX - startX) / stepCount;

        for (let s = 0; s <= stepCount; s++) {
          const x = startX + s * dx;
          const normX = (x / w - 0.5) * 2;

          // Wave math equation
          const wave1 = Math.sin(normX * waveScale * 4 + time + i * waveRatio) * swell;
          const wave2 = Math.cos(normX * turbulence * 0.1 - time * 1.2 + i * 0.3) * (amplitude * 6);
          const mouseEffect = Math.sin(normX * 3 + time) * mouseRef.current.x * 25;

          const totalElevation = (wave1 + wave2 + mouseEffect) * perspectiveScale * (height * 0.2);
          const py = currentY - totalElevation * tilt;

          if (s === 0) {
            ctx.moveTo(x, py);
          } else {
            ctx.lineTo(x, py);
          }
        }

        // Color blending across depth
        const alpha = Math.min(1, Math.max(0, progress * brightness));
        const colorGrad = ctx.createLinearGradient(0, horizonY, w, h);
        if (i > lineCount - 4) {
          colorGrad.addColorStop(0, crestColor);
          colorGrad.addColorStop(1, waveColor);
        } else {
          colorGrad.addColorStop(0, horizonColor);
          colorGrad.addColorStop(0.5, waveColor);
          colorGrad.addColorStop(1, crestColor);
        }

        ctx.strokeStyle = colorGrad;
        ctx.lineWidth = Math.max(0.8, progress * 3);
        ctx.globalAlpha = alpha * 0.7;
        ctx.stroke();
      }

      // Add noise / grain effect if enabled
      if (grain && grainIntensity > 0) {
        ctx.globalAlpha = grainIntensity;
        ctx.fillStyle = '#ffffff';
        for (let g = 0; g < 150; g++) {
          const gx = Math.random() * w;
          const gy = Math.random() * h;
          ctx.fillRect(gx, gy, 1.5, 1.5);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    horizonColor, waveColor, crestColor, speed, amplitude, waveScale,
    waveRatio, swell, turbulence, tilt, zoom, height, fogDepth, detail,
    brightness, opacity, mouseInteraction, parallaxStrength, grain, grainIntensity
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl"
    />
  );
};

export default GradientWaves;
