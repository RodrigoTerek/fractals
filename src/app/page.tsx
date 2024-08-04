"use client";

import Image from "next/image";
import styles from "./page.module.css";

import { useEffect, useRef, useState } from "react";
import { colors } from "./colors";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      setContext(ctx);

      console.log(canvasRef);
      console.log(ctx);

      if (ctx) {
        ctx.canvas.height = ctx.canvas.offsetHeight;
        ctx.canvas.width = ctx.canvas.offsetWidth;
        drawLines(ctx);
      }
    }
  }, []);

  const drawLines = (ctx: CanvasRenderingContext2D) => {
    const height = ctx.canvas.height;
    const width = ctx.canvas.width;

    console.log({ height, width });

    let x, y, iterations;
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        x = (j * 3) / width - 2;
        y = (i * 3) / height - 1.5;

        iterations = getIterations(x, y);
        // console.log({ i, j, iterations });

        drawRect(ctx, j, i, colors[iterations]);
      }
    }
  };

  const getIterations = (x: number, y: number): number => {
    let i = 0;

    let xAcc = 0;
    let yAcc = 0;
    let xTemp;

    while (Math.pow(xAcc, 2) + Math.pow(yAcc, 2) <= 4 && i <= 1000) {
      xTemp = Math.pow(xAcc, 2) - Math.pow(yAcc, 2) + x;
      yAcc = 2 * xAcc * yAcc + y;
      xAcc = xTemp;

      i++;
    }
    // console.log({ x, y, t: Math.pow(xAcc, 2) + Math.pow(yAcc, 2), i });

    return i;
  };

  const drawRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color = "#000"
  ) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  };

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>Header</p>
      </div>

      <div className={styles.center}>
        <canvas ref={canvasRef} />
      </div>

      <div>
        <p>Pé</p>
      </div>
    </main>
  );
}
