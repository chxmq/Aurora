import React, { useState, useEffect, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shuffle, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CrossfadeControllerProps {
  audioContext: AudioContext | null;
  onCrossfadeChange?: (duration: number) => void;
  onGaplessChange?: (enabled: boolean) => void;
  className?: string;
}

export default function CrossfadeController({
  audioContext,
  onCrossfadeChange,
  onGaplessChange,
  className
}: CrossfadeControllerProps) {
  const [crossfadeDuration, setCrossfadeDuration] = useState(3); // seconds
  const [isGaplessEnabled, setIsGaplessEnabled] = useState(true);
  const [isAutoMixEnabled, setIsAutoMixEnabled] = useState(false);
  const [mixStyle, setMixStyle] = useState<'smooth' | 'cut' | 'fade'>('smooth');
  
  // Audio nodes for crossfading
  const currentGainRef = useRef<GainNode | null>(null);
  const nextGainRef = useRef<GainNode | null>(null);
  const crossfadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!audioContext) return;

    // Create gain nodes for crossfading
    currentGainRef.current = audioContext.createGain();
    nextGainRef.current = audioContext.createGain();
    
    // Initialize gains
    currentGainRef.current.gain.value = 1;
    nextGainRef.current.gain.value = 0;

    return () => {
      if (crossfadeTimeoutRef.current) {
        clearTimeout(crossfadeTimeoutRef.current);
      }
    };
  }, [audioContext]);

  const handleCrossfadeDurationChange = (value: number[]) => {
    const duration = value[0];
    setCrossfadeDuration(duration);
    onCrossfadeChange?.(duration);
  };

  const handleGaplessToggle = (enabled: boolean) => {
    setIsGaplessEnabled(enabled);
    onGaplessChange?.(enabled);
  };

  const performCrossfade = (fromGain: GainNode, toGain: GainNode, duration: number) => {
    if (!audioContext) return;

    const currentTime = audioContext.currentTime;
    
    // Smooth crossfade using exponential ramps
    fromGain.gain.setValueAtTime(fromGain.gain.value, currentTime);
    fromGain.gain.exponentialRampToValueAtTime(0.001, currentTime + duration);
    
    toGain.gain.setValueAtTime(toGain.gain.value, currentTime);
    toGain.gain.exponentialRampToValueAtTime(1, currentTime + duration);
  };

  const testCrossfade = () => {
    if (!currentGainRef.current || !nextGainRef.current) return;
    
    // Simulate crossfade for demonstration
    performCrossfade(currentGainRef.current, nextGainRef.current, crossfadeDuration);
    
    // Reset after demonstration
    setTimeout(() => {
      if (currentGainRef.current && nextGainRef.current) {
        currentGainRef.current.gain.value = 1;
        nextGainRef.current.gain.value = 0;
      }
    }, crossfadeDuration * 1000 + 500);
  };

  return (
    <div className={cn('p-4 bg-secondary/20 rounded-xl space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Crossfade & Transitions</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={testCrossfade}
          className="text-xs"
        >
          Test
        </Button>
      </div>

      {/* Crossfade Duration */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="crossfade-duration">Crossfade Duration</Label>
          <span className="text-sm text-muted-foreground font-mono">
            {crossfadeDuration.toFixed(1)}s
          </span>
        </div>
        <Slider
          id="crossfade-duration"
          value={[crossfadeDuration]}
          onValueChange={handleCrossfadeDurationChange}
          min={0}
          max={10}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0s (Cut)</span>
          <span>5s</span>
          <span>10s (Long)</span>
        </div>
      </div>

      {/* Gapless Playback */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="gapless-playback">Gapless Playback</Label>
          <p className="text-xs text-muted-foreground">
            Eliminate silence between tracks
          </p>
        </div>
        <Switch
          id="gapless-playback"
          checked={isGaplessEnabled}
          onCheckedChange={handleGaplessToggle}
        />
      </div>

      {/* Auto Mix */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="auto-mix">Auto Mix</Label>
          <p className="text-xs text-muted-foreground">
            Intelligent track transitions
          </p>
        </div>
        <Switch
          id="auto-mix"
          checked={isAutoMixEnabled}
          onCheckedChange={setIsAutoMixEnabled}
        />
      </div>

      {/* Mix Style */}
      {isAutoMixEnabled && (
        <div className="space-y-3">
          <Label>Mix Style</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'smooth', label: 'Smooth', icon: '~' },
              { value: 'cut', label: 'Cut', icon: '|' },
              { value: 'fade', label: 'Fade', icon: '\\' }
            ].map((style) => (
              <Button
                key={style.value}
                variant={mixStyle === style.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMixStyle(style.value as any)}
                className="flex flex-col items-center gap-1 h-auto py-2"
              >
                <span className="text-lg font-mono">{style.icon}</span>
                <span className="text-xs">{style.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Visual Crossfade Indicator */}
      <div className="space-y-2">
        <Label>Crossfade Preview</Label>
        <div className="relative h-8 bg-secondary rounded-lg overflow-hidden">
          {/* Current Track */}
          <div className="absolute left-0 top-0 h-full bg-primary/60 flex items-center justify-center text-xs font-medium transition-all duration-300"
               style={{ width: '60%' }}>
            Current Track
          </div>
          
          {/* Next Track */}
          <div className="absolute right-0 top-0 h-full bg-primary/30 flex items-center justify-center text-xs font-medium transition-all duration-300"
               style={{ width: '40%' }}>
            Next Track
          </div>
          
          {/* Crossfade Zone */}
          <div className="absolute top-0 h-full bg-gradient-to-r from-primary/60 to-primary/30 border-x border-primary/40"
               style={{ 
                 left: `${60 - (crossfadeDuration / 10) * 30}%`,
                 width: `${(crossfadeDuration / 10) * 60}%`
               }}>
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Track A</span>
          <span>Crossfade Zone ({crossfadeDuration}s)</span>
          <span>Track B</span>
        </div>
      </div>

      {/* Advanced Options */}
      <details className="space-y-3">
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
          Advanced Options
        </summary>
        
        <div className="space-y-4 pl-4 border-l-2 border-secondary">
          {/* Beat Matching */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="beat-matching">Beat Matching</Label>
              <p className="text-xs text-muted-foreground">
                Sync BPM for smoother transitions
              </p>
            </div>
            <Switch id="beat-matching" />
          </div>

          {/* Key Matching */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="key-matching">Harmonic Mixing</Label>
              <p className="text-xs text-muted-foreground">
                Match musical keys
              </p>
            </div>
            <Switch id="key-matching" />
          </div>

          {/* Fade Curve */}
          <div className="space-y-2">
            <Label>Fade Curve</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">Linear</Button>
              <Button variant="default" size="sm">Exponential</Button>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}