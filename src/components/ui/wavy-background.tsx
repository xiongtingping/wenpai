"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  containerHeight,
  ...props
}: {
  children?: any;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  containerHeight?: string;
  [key: string]: any;
}) => {
  const noise = createNoise3D();
  let w: number,
    h: number,
    nt: number,
    i: number,
    x: number,
    ctx: any,
    canvas: any;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const getSpeed = () => {
    switch (speed) {
      case "slow":
        return 0.001;
      case "fast":
        return 0.002;
      default:
        return 0.001;
    }
  };

  const init = () => {
    canvas = canvasRef.current;
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    if (!ctx) return;
    w = (ctx.canvas.width = window.innerWidth);
    h = (ctx.canvas.height = window.innerHeight);
    ctx.filter = `blur(${blur}px)`;
    nt = 0;
    window.onresize = function () {
      if (!ctx) return;
      w = (ctx.canvas.width = window.innerWidth);
      h = (ctx.canvas.height = window.innerHeight);
      ctx.filter = `blur(${blur}px)`;
    };
    render();
  };

  const getThemeAwareColors = () => {
    const doc = document.documentElement;
    const toHsl = (v: string, fallback: string) => {
      const trimmed = v.trim();
      return trimmed && trimmed.length > 0 ? `hsl(${trimmed})` : fallback;
    };

    return [
      toHsl(getComputedStyle(doc).getPropertyValue('--primary').trim(), getComputedStyle(doc).getPropertyValue('--wave-color-primary')),
      toHsl(getComputedStyle(doc).getPropertyValue('--primary').trim().replace(/\d+/g, (match) => String(Math.max(10, parseInt(match) - 20))), getComputedStyle(doc).getPropertyValue('--wave-color-primary-dark')),
      toHsl(getComputedStyle(doc).getPropertyValue('--accent').trim(), getComputedStyle(doc).getPropertyValue('--wave-color-accent')),
      toHsl(getComputedStyle(doc).getPropertyValue('--secondary').trim(), getComputedStyle(doc).getPropertyValue('--wave-color-secondary')),
      toHsl(getComputedStyle(doc).getPropertyValue('--muted').trim(), getComputedStyle(doc).getPropertyValue('--wave-color-muted')),
    ];
  };
  
  const waveColors = colors ?? getThemeAwareColors();

  let animationId: number;
  const render = () => {
    // 使用主题感知的背景色
    const doc = document.documentElement;
    const bgVar = getComputedStyle(doc).getPropertyValue('--background').trim();
    const bg = backgroundFill || (bgVar ? `hsl(${bgVar})` : getComputedStyle(doc).getPropertyValue('--wave-background-fallback'));

    ctx.fillStyle = bg;
    ctx.globalAlpha = 1;
    ctx.fillRect(0, 0, w, h);

    // 更新波浪颜色以适应主题
    const currentColors = getThemeAwareColors();
    const waveOpacityValue = waveOpacity ?? (parseFloat(getComputedStyle(doc).getPropertyValue('--wave-opacity')) || 0.15);
    ctx.globalAlpha = waveOpacityValue;

    for (i = 0; i < 5; i++) {
      ctx.beginPath();
      const waveWidthValue = waveWidth || parseInt(getComputedStyle(doc).getPropertyValue('--wave-width')) || 50;
      ctx.lineWidth = waveWidthValue;
      ctx.strokeStyle = currentColors[i % currentColors.length];
      for (x = 0; x < w; x += 5) {
        const y = noise(x / 800, 0.3 * i, nt) * 100;
        ctx.lineTo(x, y + h * 0.5);
      }
      ctx.stroke();
      ctx.closePath();
    }
    
    nt += getSpeed();
    animationId = requestAnimationFrame(render);
  };

  useEffect(() => {
    init();
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    // I'm sorry but i have got to support it on safari.
    setIsSafari(
      typeof window !== "undefined" &&
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome")
    );
  }, []);

  return (
    <div
      className={cn(
        "relative wave-container",
        containerClassName
      )}
      style={{ '--wave-min-height': containerHeight || '80vh' } as React.CSSProperties}
    >
      <canvas
        className="absolute inset-0 z-0 pointer-events-none wave-canvas"
        ref={canvasRef}
        id="canvas"
        style={{
          ...(isSafari ? { filter: `blur(${blur || 'var(--wave-blur)'}px)` } : {}),
          pointerEvents: 'none'
        } as React.CSSProperties}
      ></canvas>
      <div className={cn("relative z-10", className)} {...props}>
        {children}
      </div>
    </div>
  );
};
