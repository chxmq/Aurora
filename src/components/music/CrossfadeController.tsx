import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  crossfadeSettings,
  setCrossfadeEnabled,
  setCrossfadeDuration,
  audioStore,
} from '@/components/layout/MusicPlayer';

interface CrossfadeControllerProps {
  audioContext: AudioContext | null;
  onCrossfadeChange?: (duration: number) => void;
  onGaplessChange?: (enabled: boolean) => void;
  className?: string;
}

export default function CrossfadeController({
  onCrossfadeChange,
  onGaplessChange,
  className
}: CrossfadeControllerProps) {
  // Seed local UI state from the shared engine settings
  const [crossfadeDuration, setCrossfadeDurationState] = useState(crossfadeSettings.duration);
  const [isEnabled, setIsEnabled] = useState(crossfadeSettings.enabled);
  const [mixStyle, setMixStyle] = useState<'smooth' | 'cut' | 'fade'>('smooth');

  // Keep the engine in sync with the UI
  useEffect(() => {
    setCrossfadeDuration(crossfadeDuration);
    onCrossfadeChange?.(crossfadeDuration);
  }, [crossfadeDuration, onCrossfadeChange]);

  useEffect(() => {
    setCrossfadeEnabled(isEnabled);
    onGaplessChange?.(isEnabled);
  }, [isEnabled, onGaplessChange]);

  const handleCrossfadeDurationChange = (value: number[]) => {
    setCrossfadeDurationState(value[0]);
  };

  const testCrossfade = () => {
    // Trigger an immediate crossfade into the next track
    audioStore.startCrossfade();
  };

  const previewWidth = Math.min(60, (crossfadeDuration / 10) * 60);

  return (
    <div className={cn('p-4 bg-secondary/20 rounded-xl space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Crossfade & Transitions</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={testCrossfade}
          disabled={!isEnabled}
          className="text-xs"
        >
          Test
        </Button>
      </div>

      {/* Enable Crossfade */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="crossfade-enabled">Enable Crossfade</Label>
          <p className="text-xs text-muted-foreground">
            Blend the end of one track into the start of the next
          </p>
        </div>
        <Switch
          id="crossfade-enabled"
          checked={isEnabled}
          onCheckedChange={setIsEnabled}
        />
      </div>

      {/* Crossfade Duration */}
      <div className={cn('space-y-3 transition-opacity', !isEnabled && 'opacity-50 pointer-events-none')}>
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
          min={1}
          max={10}
          step={0.5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1s (Short)</span>
          <span>5s</span>
          <span>10s (Long)</span>
        </div>
      </div>

      {/* Mix Style (visual preference only) */}
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
              onClick={() => setMixStyle(style.value as 'smooth' | 'cut' | 'fade')}
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <span className="text-lg font-mono">{style.icon}</span>
              <span className="text-xs">{style.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Visual Crossfade Indicator */}
      <div className="space-y-2">
        <Label>Crossfade Preview</Label>
        <div className="relative h-8 bg-secondary rounded-lg overflow-hidden">
          <div className="absolute left-0 top-0 h-full bg-primary/60 flex items-center justify-center text-xs font-medium transition-all duration-300"
               style={{ width: '60%' }}>
            Current Track
          </div>
          <div className="absolute right-0 top-0 h-full bg-primary/30 flex items-center justify-center text-xs font-medium transition-all duration-300"
               style={{ width: '40%' }}>
            Next Track
          </div>
          <div className="absolute top-0 h-full bg-gradient-to-r from-primary/60 to-primary/30 border-x border-primary/40 transition-all duration-300"
               style={{
                 left: `${60 - previewWidth / 2}%`,
                 width: `${previewWidth}%`
               }}>
          </div>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Track A</span>
          <span>Crossfade Zone ({crossfadeDuration.toFixed(1)}s)</span>
          <span>Track B</span>
        </div>
      </div>
    </div>
  );
}
