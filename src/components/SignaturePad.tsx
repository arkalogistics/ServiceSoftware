"use client";
import { useEffect, useRef } from "react";
import { Box, Button, HStack } from "@chakra-ui/react";

export default function SignaturePad({ onChange }: { onChange?: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.lineCap = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#111";

    const getPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const down = (e: PointerEvent) => {
      drawing.current = true;
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };
    const move = (e: PointerEvent) => {
      if (!drawing.current) return;
      const { x, y } = getPos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    };
    const up = () => {
      drawing.current = false;
      onChange?.(canvas.toDataURL("image/png"));
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [onChange]);

  function clear() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange?.("");
  }

  return (
    <Box>
      <canvas ref={canvasRef} width={500} height={200} style={{ border: "1px solid #ddd", borderRadius: 6, touchAction: "none", background: "#fff" }} />
      <HStack mt={2}>
        <Button size="sm" onClick={clear}>Limpiar</Button>
      </HStack>
    </Box>
  );
}

