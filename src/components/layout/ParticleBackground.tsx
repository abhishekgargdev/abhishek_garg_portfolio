"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

class Particle {
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  radius: number = 0;

  constructor(width: number, height: number) {
    this.reset(width, height);
  }

  reset(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    // Speed of ~1px per frame (as per tsParticles move speed: 1)
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.8 + Math.random() * 0.4;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    // Average radius ~3px (as per tsParticles size: 3)
    this.radius = 2.5 + Math.random() * 1.0;
  }

  update(width: number, height: number) {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off edges with bounds correction to prevent particles escaping
    if (this.x < 0) {
      this.x = 0;
      this.vx = Math.abs(this.vx);
    } else if (this.x > width) {
      this.x = width;
      this.vx = -Math.abs(this.vx);
    }

    if (this.y < 0) {
      this.y = 0;
      this.vy = Math.abs(this.vy);
    } else if (this.y > height) {
      this.y = height;
      this.vy = -Math.abs(this.vy);
    }
  }
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    // Mouse grab radius: 200px (matching grab distance in tsParticles config)
    const mouse = { x: -9999, y: -9999, radius: 200 };

    // Function to calculate particle density dynamically based on screen area
    const initParticles = (width: number, height: number) => {
      // Aim for ~100 particles on standard desktop (e.g. 1920x1080), bounded between 30 and 120
      const area = width * height;
      const count = Math.min(120, Math.max(30, Math.floor(area / 20000)));
      
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(width, height));
      }
    };

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      const width = parent ? parent.clientWidth : window.innerWidth;
      const height = parent ? parent.clientHeight : window.innerHeight;
      
      canvas.width = width;
      canvas.height = height;
      initParticles(width, height);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Track mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    // Attach listeners to window to capture movement across layout boundaries
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Animation Loop
    const animate = () => {
      if (!ctx || !canvas) return;

      const width = canvas.width;
      const height = canvas.height;
      
      // Clear canvas with a transparent background
      ctx.clearRect(0, 0, width, height);

      // Determine colors based on active theme
      const isDark = resolvedTheme === "dark";
      // Glow Cyan (#00e5ff / RGB: 0, 229, 255) for dark mode
      // Muted Cyan (#0891b2 / RGB: 8, 145, 178) for light mode
      const r = isDark ? 0 : 8;
      const g = isDark ? 229 : 145;
      const b = isDark ? 255 : 178;
      
      const particleColor = `rgba(${r}, ${g}, ${b}, ${isDark ? 0.8 : 0.6})`;
      const maxLineDistance = 150; // tsParticles distance: 150

      // Update and draw particles
      particles.forEach((p) => {
        p.update(width, height);
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();
      });

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        
        // Draw lines to mouse pointer (grab effect)
        if (mouse.x !== -9999) {
          const dx = p1.x - mouse.x;
          const dy = p1.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < mouse.radius) {
            // Grab lines: opacity scales up to 1.0 (matching grab links opacity: 1)
            const alpha = (1 - dist / mouse.radius) * (isDark ? 1.0 : 0.6);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Draw lines to neighbor particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxLineDistance) {
            // Links opacity scales up to 0.5 (matching links opacity: 0.5)
            const alpha = (1 - dist / maxLineDistance) * (isDark ? 0.5 : 0.25);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.lineWidth = 1; // tsParticles links width: 1
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full bg-transparent"
      style={{ mixBlendMode: "normal" }}
    />
  );
}

export default ParticleBackground;

