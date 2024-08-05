"use client";

import styles from "./page.module.css";

import { useEffect, useRef } from "react";
import { colors } from "./colors";

const MAX_ITERATIONS = colors.length;

const drawLines = (ctx: CanvasRenderingContext2D) => {
  const height = ctx.canvas.height;
  const width = ctx.canvas.width;

  console.log({ height, width });

  let x,
    y,
    iterations,
    result = [];
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      x = (j * 3) / width - 2;
      y = (i * 3) / height - 1.5;

      iterations = getIterations(x, y);
      result.push({ i, j, iterations });

      if (iterations >= MAX_ITERATIONS) drawRect(ctx, j, i, "#000");
      else drawRect(ctx, j, i, colors[iterations]);
    }
  }

  console.log("Done", result);
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

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");

      if (ctx) {
        ctx.canvas.height = ctx.canvas.offsetHeight * 10;
        ctx.canvas.width = ctx.canvas.offsetWidth * 10;
        drawLines(ctx);
      }
    }
  }, [canvasRef]);

  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <canvas ref={canvasRef} />
      </div>
    </main>
  );
}
