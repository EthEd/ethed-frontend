"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { logger } from '@/lib/monitoring';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface GlobalGridProps {
  contentSelectors?: string[];
  adaptiveGlow?: boolean;
  enabled?: boolean;
}

/**
 * Global Interactive Grid System
 * Covers the entire viewport and follows mouse throughout the page
 * Intelligently adapts glow intensity based on content detection
 */
export default function GlobalGrid({ 
  contentSelectors = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div[class*="text"]',
    'button', 'a', 'input', 'textarea', 'label',
    '.text-content', '[data-text-content]', '.content',
    '.card', '.modal', '.dialog', '.menu', '.dropdown',
    'nav', 'header', 'main', 'article', 'section',
    '[role="button"]', '[role="link"]', '[role="textbox"]'
  ],
  adaptiveGlow = true,
  enabled = true
}: GlobalGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const glowIntensityRef = useRef(1.0);
  const [isActive, setIsActive] = useState(false);
  const isDarkRef = useRef(true);

  // Track theme changes
  useEffect(() => {
    const check = () => {
      isDarkRef.current = document.documentElement.classList.contains('dark');
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Detect if mouse is over content areas globally
  const detectContentArea = useCallback((clientX: number, clientY: number) => {
    if (!adaptiveGlow) return false;
    
    try {
      const elementsUnderMouse = document.elementsFromPoint(clientX, clientY);
      
      for (const element of elementsUnderMouse) {
        // Skip the canvas itself
        if (element.tagName === 'CANVAS') continue;
        
        // Check if element matches any content selector
        for (const selector of contentSelectors) {
          try {
            if (element.matches?.(selector) || element.closest?.(selector)) {
              return true;
            }
          } catch {
            // Skip invalid selectors
            continue;
          }
        }
        
        // Additional intelligent checks
        if (element.textContent && element.textContent.trim().length > 3) {
          const computedStyle = window.getComputedStyle(element);
          const hasVisibleText = computedStyle.color !== 'rgba(0, 0, 0, 0)' && 
                                computedStyle.opacity !== '0' &&
                                computedStyle.visibility !== 'hidden' &&
                                computedStyle.display !== 'none';
          
          // Check if text is actually readable size
          const fontSize = parseInt(computedStyle.fontSize);
          if (hasVisibleText && fontSize > 10) {
            return true;
          }
        }
        
        // Check for interactive elements
        if (element.tagName === 'BUTTON' || 
            element.tagName === 'A' || 
            element.tagName === 'INPUT' ||
            element.getAttribute('role') === 'button' ||
            element.getAttribute('tabindex') ||
            (element as HTMLElement).style?.cursor === 'pointer') {
          return true;
        }
      }
    } catch (error) {
      logger.warn('Content detection error', 'GlobalGrid', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    
    return false;
  }, [adaptiveGlow, contentSelectors]);

  // Global mouse tracking
  const updateMousePosition = useCallback((e: MouseEvent) => {
    mouseRef.current.prevX = mouseRef.current.x;
    mouseRef.current.prevY = mouseRef.current.y;
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;

    // Detect content areas and adjust glow intensity
    const isOverContent = detectContentArea(e.clientX, e.clientY);
    const targetIntensity = isOverContent ? 0.4 : 1.2; // Still readable but much brighter
    
    // Smooth transition between intensities
    glowIntensityRef.current = glowIntensityRef.current + (targetIntensity - glowIntensityRef.current) * 0.15;

    // Create particles on mouse movement
    const speed = Math.sqrt(
      Math.pow(e.clientX - mouseRef.current.prevX, 2) + 
      Math.pow(e.clientY - mouseRef.current.prevY, 2)
    );

    if (speed > 3 && particlesRef.current.length < 30) { // Reduced particle count for global use
      const intensity = glowIntensityRef.current;
      if (intensity > 0.3) { // Only create particles when not heavily dimmed
        for (let i = 0; i < Math.min(2, Math.ceil(speed / 15)); i++) {
          particlesRef.current.push({
            x: e.clientX + (Math.random() - 0.5) * 15,
            y: e.clientY + (Math.random() - 0.5) * 15,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            life: 0,
            maxLife: 20 + Math.random() * 20,
            size: 0.5 + Math.random() * 1.5,
          });
        }
      }
    }
  }, [detectContentArea]);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup full viewport canvas
    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Global event handlers
    const handleMouseMove = (e: MouseEvent) => {
      updateMousePosition(e);
      if (!isActive) setIsActive(true);
    };

    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => {
      setIsActive(false);
      particlesRef.current = [];
    };

    // Attach to document for global coverage
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Animation loop
    let lastTime = 0;
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (isActive && enabled) {
        const mouse = mouseRef.current;
        const intensity = glowIntensityRef.current;
        const dark = isDarkRef.current;
        
        // Theme-aware color values
        const cyanR = dark ? 34 : 8;
        const cyanG = dark ? 211 : 145;
        const cyanB = dark ? 238 : 178;
        const greenR = dark ? 16 : 13;
        const greenG = dark ? 185 : 148;
        const greenB = dark ? 129 : 136;
        const blueR = dark ? 59 : 8;
        const blueG = dark ? 130 : 113;
        const blueB = dark ? 246 : 178;
        const themeMultiplier = dark ? 1.0 : 0.75;

        // Adaptive glow effect with multiple layers
        ctx.save();
        
        // Outer glow
        const outerGradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, 280
        );
        outerGradient.addColorStop(0, `rgba(${cyanR}, ${cyanG}, ${cyanB}, ${0.18 * intensity * themeMultiplier})`);
        outerGradient.addColorStop(0.3, `rgba(${greenR}, ${greenG}, ${greenB}, ${0.12 * intensity * themeMultiplier})`);
        outerGradient.addColorStop(0.6, `rgba(${blueR}, ${blueG}, ${blueB}, ${0.08 * intensity * themeMultiplier})`);
        outerGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = outerGradient;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        // Inner glow
        const innerGradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, 140
        );
        innerGradient.addColorStop(0, `rgba(${cyanR}, ${cyanG}, ${cyanB}, ${0.45 * intensity * themeMultiplier})`);
        innerGradient.addColorStop(0.5, `rgba(${greenR}, ${greenG}, ${greenB}, ${0.28 * intensity * themeMultiplier})`);
        innerGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = innerGradient;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        // Core bright spot
        const coreIntensity = Math.max(0.15, intensity * 0.9) * themeMultiplier;
        const coreGradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, 50
        );
        const coreWhite = dark ? 255 : 200;
        coreGradient.addColorStop(0, `rgba(${coreWhite}, ${coreWhite}, ${coreWhite}, ${0.25 * coreIntensity})`);
        coreGradient.addColorStop(0.3, `rgba(${cyanR}, ${cyanG}, ${cyanB}, ${0.6 * coreIntensity})`);
        coreGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = coreGradient;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        ctx.restore();

        // Update and draw particles
        particlesRef.current = particlesRef.current.filter(particle => {
          particle.life += deltaTime / 16.67;
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vx *= 0.98;
          particle.vy *= 0.98;

          if (particle.life >= particle.maxLife) return false;

          // Draw particle with adaptive intensity
          const alpha = Math.max(0, 1 - particle.life / particle.maxLife) * intensity;
          const size = particle.size * (1 - particle.life / particle.maxLife * 0.5);
          
          if (alpha > 0.01) {
            ctx.save();
            ctx.globalAlpha = alpha;
            
            const particleGradient = ctx.createRadialGradient(
              particle.x, particle.y, 0,
              particle.x, particle.y, size * 3.5
            );
            const pDark = isDarkRef.current;
            const pMul = pDark ? 1.0 : 0.7;
            const pCyanR = pDark ? 34 : 8, pCyanG = pDark ? 211 : 145, pCyanB = pDark ? 238 : 178;
            const pGreenR = pDark ? 16 : 13, pGreenG = pDark ? 185 : 148, pGreenB = pDark ? 129 : 136;
            particleGradient.addColorStop(0, `rgba(${pCyanR}, ${pCyanG}, ${pCyanB}, ${0.8 * intensity * pMul})`);
            particleGradient.addColorStop(0.5, `rgba(${pGreenR}, ${pGreenG}, ${pGreenB}, ${0.5 * intensity * pMul})`);
            particleGradient.addColorStop(1, 'transparent');

            ctx.fillStyle = particleGradient;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, size * 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
          }
          return true;
        });

        // Grid intersection highlights - sparse for performance
        const gridSize = 30; // Larger grid for global use
        const glowRadius = 150;
        
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        
        // Only render visible grid points for performance
        const startX = Math.max(0, Math.floor((mouse.x - glowRadius) / gridSize) * gridSize);
        const endX = Math.min(window.innerWidth, Math.ceil((mouse.x + glowRadius) / gridSize) * gridSize);
        const startY = Math.max(0, Math.floor((mouse.y - glowRadius) / gridSize) * gridSize);
        const endY = Math.min(window.innerHeight, Math.ceil((mouse.y + glowRadius) / gridSize) * gridSize);
        
        for (let x = startX; x <= endX; x += gridSize) {
          for (let y = startY; y <= endY; y += gridSize) {
            const distance = Math.sqrt(
              Math.pow(x - mouse.x, 2) + Math.pow(y - mouse.y, 2)
            );
            
            if (distance < glowRadius) {
              const gridIntensity = Math.max(0, 1 - distance / glowRadius);
              const alpha = gridIntensity * 0.7 * glowIntensityRef.current;
              
              if (alpha > 0.02) {
                ctx.save();
                ctx.globalAlpha = alpha;
                
                const gDark = isDarkRef.current;
                const gCyanR = gDark ? 34 : 8, gCyanG = gDark ? 211 : 145, gCyanB = gDark ? 238 : 178;
                const gGreenR = gDark ? 16 : 13, gGreenG = gDark ? 185 : 148, gGreenB = gDark ? 129 : 136;
                const dotGradient = ctx.createRadialGradient(
                  x, y, 0, x, y, 2 + gridIntensity * 1.5
                );
                dotGradient.addColorStop(0, `rgba(${gCyanR}, ${gCyanG}, ${gCyanB}, 1)`);
                dotGradient.addColorStop(0.7, `rgba(${gGreenR}, ${gGreenG}, ${gGreenB}, 0.8)`);
                dotGradient.addColorStop(1, 'transparent');
                
                ctx.fillStyle = dotGradient;
                ctx.beginPath();
                ctx.arc(x, y, 2 + gridIntensity * 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
              }
            }
          }
        }
        
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, isActive, updateMousePosition]);

  if (!enabled) return null;

  return (
    <>
      {/* Global static grid background */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(34, 211, 238, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(16, 185, 129, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />
      <div 
        className="fixed inset-0 pointer-events-none z-0 dark:hidden"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(8, 145, 178, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(13, 148, 136, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />
      
      {/* Interactive canvas overlay */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10 dark:mix-blend-screen mix-blend-multiply"
        style={{ 
          filter: 'blur(0.5px)',
        }}
      />
    </>
  );
}