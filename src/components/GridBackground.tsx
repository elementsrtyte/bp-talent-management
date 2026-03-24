import { useEffect, useRef, type CSSProperties } from "react";

export function GridBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 50, y: 50 });
  const currentPos = useRef({ x: 50, y: 50 });
  const rafId = useRef<number | undefined>(undefined);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth) * 100;
      mousePos.current.y = (e.clientY / window.innerHeight) * 100;
    };

    const animate = () => {
      const lerp = (start: number, end: number, factor: number) => {
        return start + (end - start) * factor;
      };

      currentPos.current.x = lerp(
        currentPos.current.x,
        mousePos.current.x,
        0.08,
      );
      currentPos.current.y = lerp(
        currentPos.current.y,
        mousePos.current.y,
        0.08,
      );

      container.style.setProperty(
        "--mouse-x",
        `${currentPos.current.x.toFixed(2)}%`,
      );
      container.style.setProperty(
        "--mouse-y",
        `${currentPos.current.y.toFixed(2)}%`,
      );

      rafId.current = requestAnimationFrame(animate);
    };

    container.style.setProperty("--mouse-x", "50%");
    container.style.setProperty("--mouse-y", "50%");

    window.addEventListener("mousemove", handleMouseMove);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none text-foreground"
      style={
        {
          zIndex: 0,
          "--mouse-x": "50%",
          "--mouse-y": "50%",
        } as CSSProperties
      }
    >
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.04 }}
      >
        <defs>
          <pattern
            id="grid"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 100 0 L 0 0 0 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
            />
            <path
              d="M 20 0 L 20 100 M 40 0 L 40 100 M 60 0 L 60 100 M 80 0 L 80 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.3"
              strokeDasharray="2 2"
            />
            <path
              d="M 0 20 L 100 20 M 0 40 L 100 40 M 0 60 L 100 60 M 0 80 L 100 80"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.3"
              strokeDasharray="2 2"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={
          {
            opacity: 0.15,
            WebkitMaskImage:
              "radial-gradient(circle 600px at var(--mouse-x) var(--mouse-y), white 0%, transparent 100%)",
            maskImage:
              "radial-gradient(circle 600px at var(--mouse-x) var(--mouse-y), white 0%, transparent 100%)",
            transition:
              "mask-position 0.3s ease-out, -webkit-mask-position 0.3s ease-out",
          } as CSSProperties
        }
      >
        <defs>
          <pattern
            id="grid-spotlight"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 100 0 L 0 0 0 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
            />
            <path
              d="M 20 0 L 20 100 M 40 0 L 40 100 M 60 0 L 60 100 M 80 0 L 80 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.3"
              strokeDasharray="2 2"
            />
            <path
              d="M 0 20 L 100 20 M 0 40 L 100 40 M 0 60 L 100 60 M 0 80 L 100 80"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.3"
              strokeDasharray="2 2"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-spotlight)" />
      </svg>
    </div>
  );
}
