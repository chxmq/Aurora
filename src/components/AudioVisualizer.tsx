import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  analyserNode: AnalyserNode | null;
  isPlaying: boolean;
  type?: 'waveform' | 'spectrum' | 'circular';
  className?: string;
}

export default function AudioVisualizer({ 
  analyserNode, 
  isPlaying, 
  type = 'spectrum',
  className 
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!analyserNode || !canvasRef.current) return;

    // Set up data array
    const bufferLength = type === 'waveform' 
      ? analyserNode.fftSize 
      : analyserNode.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyserNode, type]);

  useEffect(() => {
    if (!analyserNode || !isPlaying || !dataArrayRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!analyserNode || !dataArrayRef.current) return;

      if (type === 'waveform') {
        analyserNode.getByteTimeDomainData(dataArrayRef.current);
        drawWaveform(ctx, canvas, dataArrayRef.current);
      } else if (type === 'spectrum') {
        analyserNode.getByteFrequencyData(dataArrayRef.current);
        drawSpectrum(ctx, canvas, dataArrayRef.current);
      } else if (type === 'circular') {
        analyserNode.getByteFrequencyData(dataArrayRef.current);
        drawCircular(ctx, canvas, dataArrayRef.current);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyserNode, isPlaying, type]);

  const drawWaveform = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array) => {
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#8b5cf6';
    ctx.beginPath();

    const sliceWidth = width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * height / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  };

  const drawSpectrum = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array) => {
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    const barWidth = width / dataArray.length * 2.5;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * height;

      // Create gradient for each bar
      const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
      gradient.addColorStop(0, '#8b5cf6');
      gradient.addColorStop(0.5, '#a855f7');
      gradient.addColorStop(1, '#c084fc');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  };

  const drawCircular = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array) => {
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 4;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    const bars = 64;
    const step = Math.floor(dataArray.length / bars);

    for (let i = 0; i < bars; i++) {
      const value = dataArray[i * step] / 255;
      const angle = (i / bars) * Math.PI * 2;
      
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + value * 40);
      const y2 = centerY + Math.sin(angle) * (radius + value * 40);

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, '#8b5cf6');
      gradient.addColorStop(1, '#c084fc');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
    ctx.fill();
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <canvas
        ref={canvasRef}
        width={type === 'circular' ? 140 : 220}
        height={type === 'circular' ? 140 : 70}
        className={cn(
          'rounded-lg bg-black/20 backdrop-blur-sm scale-90',
          className
        )}
        style={{ maxWidth: type === 'circular' ? 160 : 240 }}
      />
    </div>
  );
}