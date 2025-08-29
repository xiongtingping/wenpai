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

  const toHsl = (v: string, fallback: string) => (v && v.length > 0 ? `hsl(${v})` : fallback)
  const doc = document.documentElement;
  const waveColors = colors ?? [
    toHsl(getComputedStyle(doc).getPropertyValue('--primary').trim(), '#38bdf8'),
    toHsl(getComputedStyle(doc).getPropertyValue('--secondary').trim(), '#818cf8'),
    toHsl(getComputedStyle(doc).getPropertyValue('--accent').trim(), '#c084fc'),
    toHsl(getComputedStyle(doc).getPropertyValue('--ring').trim(), '#e879f9'),
    toHsl(getComputedStyle(doc).getPropertyValue('--muted-foreground').trim(), '#22d3ee'),
  ];
  const drawWave = (n: number) => {
    nt += getSpeed();
    for (i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.lineWidth = waveWidth || 50;
      ctx.strokeStyle = waveColors[i % waveColors.length];
      for (x = 0; x < w; x += 5) {
        const y = noise(x / 800, 0.3 * i, nt) * 100;
        ctx.lineTo(x, y + h * 0.5); // adjust for height, currently at 50% of the container
      }
      ctx.stroke();
      ctx.closePath();
    }
  };

  let animationId: number;
  const render = () => {
    // 使用设计令牌作为背景/透明叠加，使浅色模式更协调
    const bg = backgroundFill || getComputedStyle(document.documentElement).getPropertyValue('--background').trim() || 'white';
    ctx.fillStyle = bg.startsWith('hsl') ? bg : `hsl(var(--background))`;
    ctx.globalAlpha = waveOpacity ?? 0.35;


    ctx.fillRect(0, 0, w, h);
    drawWave(5);
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
        "flex flex-col items-center justify-center",
        containerClassName
      )}
      style={{ minHeight: (props.containerHeight || '80vh') }}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        id="canvas"
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
        }}
      ></canvas>
      <div className={cn("relative z-10", className)} {...props}>
        {children}
      </div>
    </div>
  );
};
