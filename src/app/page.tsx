"use client";

import styles from "./page.module.css";
import { useEffect, useRef, useState } from "react";
import { colors } from "./colors";

const MAX_ITERATIONS = colors.length;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = Number.MAX_VALUE;

interface ViewportState {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

const drawLines = (ctx: CanvasRenderingContext2D, viewport: ViewportState) => {
  const height = ctx.canvas.height;
  const width = ctx.canvas.width;

  // Calculate aspect ratio correction
  const aspectRatio = width / height;
  const yRange = 3; // Total range in y direction
  const xRange = yRange * aspectRatio; // Adjust x range to maintain aspect ratio

  // Calculate the visible region in the complex plane
  const centerX = -2 + viewport.offsetX + 3 / 2; // Center point in x
  const centerY = -1.5 + viewport.offsetY + 3 / 2; // Center point in y

  const halfRangeY = yRange / viewport.zoom / 2;
  const halfRangeX = xRange / viewport.zoom / 2;

  const xMin = centerX - halfRangeX;
  const xMax = centerX + halfRangeX;
  const yMin = centerY - halfRangeY;
  const yMax = centerY + halfRangeY;

  let x, y, iterations;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      // Map pixel coordinates to the complex plane coordinates
      x = xMin + (j / width) * (xMax - xMin);
      y = yMin + (i / height) * (yMax - yMin);

      iterations = getIterations(x, y);

      if (iterations >= MAX_ITERATIONS) drawRect(ctx, j, i, "#000");
      else drawRect(ctx, j, i, colors[iterations]);
    }
  }
};

const getIterations = (x: number, y: number): number => {
  let i = 0;

  let xAcc = 0;
  let yAcc = 0;
  let xTemp;

  while (Math.pow(xAcc, 2) + Math.pow(yAcc, 2) <= 4 && i <= MAX_ITERATIONS) {
    xTemp = Math.pow(xAcc, 2) - Math.pow(yAcc, 2) + x;
    yAcc = 2 * xAcc * yAcc + y;
    xAcc = xTemp;

    i++;
  }

  return i;
};

const drawRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string
) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
};

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewportRef = useRef<ViewportState>({
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [viewport, setViewport] = useState<ViewportState>({
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  });

  // Track drag state
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Set up mouse event listeners
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;

      const handleMouseDown = (e: MouseEvent) => {
        isDraggingRef.current = true;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        canvas.style.cursor = "grabbing";
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDraggingRef.current) return;

        const dx = e.clientX - lastMousePosRef.current.x;
        const dy = e.clientY - lastMousePosRef.current.y;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };

        const currentViewport = viewportRef.current;
        // Scale the movement based on zoom level and canvas size
        const scaleX = 3 / canvas.width / currentViewport.zoom;
        const scaleY = 3 / canvas.height / currentViewport.zoom;

        const newViewport = {
          zoom: currentViewport.zoom,
          offsetX: currentViewport.offsetX - dx * scaleX,
          offsetY: currentViewport.offsetY - dy * scaleY,
        };

        viewportRef.current = newViewport;
        setViewport(newViewport);
      };

      const handleMouseUp = () => {
        isDraggingRef.current = false;
        canvas.style.cursor = "grab";
      };

      const handleMouseEnter = () => {
        canvas.style.cursor = "grab";
      };

      const handleMouseLeave = () => {
        isDraggingRef.current = false;
        canvas.style.cursor = "default";
      };

      canvas.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("mouseenter", handleMouseEnter);
      canvas.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        canvas.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mouseenter", handleMouseEnter);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [canvasRef]);

  // Set up the wheel event listener only once
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;

      const handleWheelEvent = (e: WheelEvent) => {
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();

          const rect = canvas.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          const deltaY = -e.deltaY;
          const zoomFactor = deltaY > 0 ? 1.1 : 0.9;
          const currentViewport = viewportRef.current;
          const newZoom = Math.min(
            MAX_ZOOM,
            Math.max(MIN_ZOOM, currentViewport.zoom * zoomFactor)
          );

          // Calculate new offsets to zoom towards mouse position
          const zoomRatio = 1 - newZoom / currentViewport.zoom;
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;

          const newOffsetX =
            currentViewport.offsetX +
            (((mouseX / canvasWidth) * 3) / currentViewport.zoom) * zoomRatio;
          const newOffsetY =
            currentViewport.offsetY +
            (((mouseY / canvasHeight) * 3) / currentViewport.zoom) * zoomRatio;

          const newViewport = {
            zoom: newZoom,
            offsetX: newOffsetX,
            offsetY: newOffsetY,
          };

          viewportRef.current = newViewport;
          setViewport(newViewport);
        }
      };

      canvas.addEventListener("wheel", handleWheelEvent, { passive: false });

      // Cleanup
      return () => {
        canvas.removeEventListener("wheel", handleWheelEvent);
      };
    }
  }, [canvasRef]); // Only depends on canvasRef now

  // Handle rendering separately
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.canvas.height = ctx.canvas.offsetHeight;
        ctx.canvas.width = ctx.canvas.offsetWidth;
        drawLines(ctx, viewport);
      }
    }
  }, [viewport]);

  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <canvas ref={canvasRef} />
      </div>
    </main>
  );
}
