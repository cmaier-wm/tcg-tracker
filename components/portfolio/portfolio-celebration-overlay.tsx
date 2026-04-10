"use client";

import React, { useEffect, useRef } from "react";
import { Fireworks } from "fireworks-js";

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function PortfolioCelebrationOverlay({
  cardName,
  quantity
}: {
  cardName?: string;
  quantity: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) {
      return;
    }

    let fireworks: Fireworks;

    try {
      fireworks = new Fireworks(container, {
        autoresize: true,
        mouse: {
          click: false,
          move: false,
          max: 1
        },
        sound: {
          enabled: false,
          files: [],
          volume: {
            min: 0,
            max: 0
          }
        },
        opacity: 0.2,
        acceleration: 1.08,
        friction: 0.94,
        gravity: 1.46,
        particles: 84,
        explosion: 11,
        intensity: 20,
        flickering: 14,
        traceLength: 3,
        traceSpeed: 12,
        lineStyle: "round",
        hue: {
          min: 0,
          max: 360
        },
        brightness: {
          min: 46,
          max: 72
        },
        decay: {
          min: 0.012,
          max: 0.02
        },
        lineWidth: {
          trace: {
            min: 2,
            max: 3.4
          },
          explosion: {
            min: 2,
            max: 4.2
          }
        }
      });
    } catch {
      return;
    }

    const updateBoundaries = () => {
      fireworks.updateBoundaries({
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    const launchVolley = (count: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const hueStart = Math.floor(randomBetween(0, 360));
      const hueSpan = randomBetween(28, 86);

      fireworks.updateOptions({
        rocketsPoint: {
          min: 49.5,
          max: 50.5
        },
        boundaries: {
          x: 0,
          y: height * randomBetween(0.1, 0.3),
          width,
          height: height * randomBetween(0.42, 0.76),
          debug: false
        },
        hue: {
          min: hueStart,
          max: Math.min(360, hueStart + hueSpan)
        },
        traceSpeed: randomBetween(11, 18),
        acceleration: randomBetween(1.05, 1.14),
        gravity: randomBetween(1.34, 1.62),
        particles: Math.round(randomBetween(64, 112)),
        explosion: Math.round(randomBetween(8, 14)),
        brightness: {
          min: randomBetween(42, 54),
          max: randomBetween(62, 78)
        },
        lineWidth: {
          trace: {
            min: randomBetween(1.4, 2.2),
            max: randomBetween(2.4, 3.8)
          },
          explosion: {
            min: randomBetween(1.4, 2.4),
            max: randomBetween(3.2, 4.8)
          }
        }
      });

      fireworks.launch(count);
    };

    updateBoundaries();
    launchVolley(3);

    const followUpLaunches = [140, 300, 480, 700, 940, 1220].map((delay) =>
      window.setTimeout(() => {
        launchVolley(Math.round(randomBetween(2, 4)));
      }, delay)
    );

    window.addEventListener("resize", updateBoundaries);

    return () => {
      for (const timeoutId of followUpLaunches) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener("resize", updateBoundaries);
      fireworks.stop(true);
    };
  }, [quantity]);

  const accessibleName = cardName
    ? `Quantity updated for ${cardName}. Celebrating ${quantity} cards.`
    : `Quantity updated. Celebrating ${quantity} cards.`;

  return (
    <div className="portfolio-celebration" role="status" aria-live="polite" aria-label={accessibleName}>
      <div className="portfolio-celebration-scrim" aria-hidden="true" />
      <div ref={containerRef} className="portfolio-celebration-canvas" aria-hidden="true" />
    </div>
  );
}
