import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Music, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LyricLine {
  time: number; // Time in seconds
  text: string;
  duration?: number;
}

interface LyricsDisplayProps {
  lyrics?: string;
  currentTime: number;
  isPlaying: boolean;
  className?: string;
}

// Parse LRC format lyrics or plain text
const parseLyrics = (lyricsText: string): LyricLine[] => {
  if (!lyricsText) return [];

  const lines = lyricsText.split('\n').filter(line => line.trim());
  
  // Check if it's LRC format (contains timestamps like [00:12.34])
  const lrcRegex = /^\[(\d{2}):(\d{2})\.(\d{2})\](.*)/;
  const isLrcFormat = lines.some(line => lrcRegex.test(line));

  if (isLrcFormat) {
    return lines
      .map(line => {
        const match = line.match(lrcRegex);
        if (match) {
          const minutes = parseInt(match[1]);
          const seconds = parseInt(match[2]);
          const centiseconds = parseInt(match[3]);
          const time = minutes * 60 + seconds + centiseconds / 100;
          return {
            time,
            text: match[4].trim()
          };
        }
        return null;
      })
      .filter((line): line is LyricLine => line !== null)
      .sort((a, b) => a.time - b.time);
  } else {
    // Plain text - estimate timing based on line count and average song length
    const estimatedDuration = 180; // 3 minutes average
    const timePerLine = estimatedDuration / lines.length;
    
    return lines.map((text, index) => ({
      time: index * timePerLine,
      text: text.trim()
    }));
  }
};

// Sample lyrics for demonstration
const SAMPLE_LYRICS = `[00:12.00]Welcome to the future sound
[00:16.50]Digital waves all around
[00:21.00]In this cyber symphony
[00:25.50]We find our harmony

[00:30.00]Neon lights and electric dreams
[00:34.50]Nothing's quite the way it seems
[00:39.00]In this world of ones and zeros
[00:43.50]We become the digital heroes

[00:48.00]Pulse of the machine
[00:50.50]In the code we trust
[00:53.00]Binary heartbeat
[00:55.50]In the digital dust

[00:58.00]Synthesized emotions flow
[01:02.50]Through the circuits down below
[01:07.00]Every beat a calculated move
[01:11.50]In this algorithmic groove

[01:16.00]Data streams like rivers run
[01:20.50]Underneath the silicon sun
[01:25.00]In this realm of infinite space
[01:29.50]We find our digital place

[01:34.00]Pulse of the machine
[01:36.50]In the code we trust
[01:39.00]Binary heartbeat
[01:41.50]In the digital dust

[01:44.00]When the servers sing their song
[01:48.50]We know where we belong
[01:53.00]In this electronic sea
[01:57.50]We find our destiny

[02:02.00]Future sounds calling out
[02:06.50]No more fear, no more doubt
[02:11.00]In this cyber symphony
[02:15.50]We are finally free`;

export default function LyricsDisplay({ 
  lyrics, 
  currentTime, 
  isPlaying,
  className 
}: LyricsDisplayProps) {
  const [parsedLyrics, setParsedLyrics] = useState<LyricLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [isVisible, setIsVisible] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Parse lyrics when they change
  useEffect(() => {
    const lyricsToUse = lyrics || SAMPLE_LYRICS;
    const parsed = parseLyrics(lyricsToUse);
    setParsedLyrics(parsed);
  }, [lyrics]);

  // Update current line based on playback time
  useEffect(() => {
    if (!parsedLyrics.length || !isPlaying) return;

    const newIndex = parsedLyrics.findIndex((line, index) => {
      const nextLine = parsedLyrics[index + 1];
      return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
    });

    if (newIndex !== currentLineIndex) {
      setCurrentLineIndex(newIndex);
    }
  }, [currentTime, parsedLyrics, isPlaying, currentLineIndex]);

  // Auto-scroll to current line
  useEffect(() => {
    if (currentLineIndex >= 0 && activeLineRef.current && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        const lineElement = activeLineRef.current;
        const containerHeight = scrollContainer.clientHeight;
        const lineTop = lineElement.offsetTop;
        const lineHeight = lineElement.clientHeight;
        
        // Center the current line in the viewport
        const scrollTop = lineTop - (containerHeight / 2) + (lineHeight / 2);
        
        scrollContainer.scrollTo({
          top: Math.max(0, scrollTop),
          behavior: 'smooth'
        });
      }
    }
  }, [currentLineIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!parsedLyrics.length) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
        <Music className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No lyrics available</p>
        <p className="text-sm text-muted-foreground mt-2">
          Lyrics will appear here when available
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Lyrics</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className="h-8 w-8 p-0"
        >
          {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
      </div>

      {/* Lyrics Content */}
      {isVisible && (
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-3">
            {parsedLyrics.map((line, index) => {
              const isActive = index === currentLineIndex;
              const isPast = index < currentLineIndex;
              const isFuture = index > currentLineIndex;

              return (
                <div
                  key={index}
                  ref={isActive ? activeLineRef : undefined}
                  className={cn(
                    'transition-all duration-300 cursor-pointer hover:text-primary',
                    'flex items-center gap-3 p-2 rounded-lg',
                    {
                      'text-primary font-semibold bg-primary/10 scale-105 shadow-sm': isActive,
                      'text-muted-foreground opacity-60': isPast,
                      'text-foreground/80': isFuture,
                      'hover:bg-secondary/50': !isActive
                    }
                  )}
                  onClick={() => {
                    // In a real implementation, you'd seek to this time
                    console.log(`Seek to ${line.time}s`);
                  }}
                >
                  {/* Timestamp */}
                  <span className="text-xs font-mono text-muted-foreground min-w-[40px]">
                    {formatTime(line.time)}
                  </span>
                  
                  {/* Lyric Text */}
                  <span className={cn(
                    'flex-1 leading-relaxed',
                    isActive && 'text-lg'
                  )}>
                    {line.text || '♪'}
                  </span>
                  
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* Progress Indicator */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {currentLineIndex >= 0 ? `Line ${currentLineIndex + 1} of ${parsedLyrics.length}` : 'Waiting for playback...'}
          </span>
          <span>{formatTime(currentTime)}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ 
              width: parsedLyrics.length > 0 
                ? `${Math.max(0, Math.min(100, ((currentLineIndex + 1) / parsedLyrics.length) * 100))}%`
                : '0%'
            }}
          />
        </div>
      </div>
    </div>
  );
}