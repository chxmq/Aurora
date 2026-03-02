import React, { useState, useEffect, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EqualizerBand {
  frequency: number;
  gain: number;
  filter?: BiquadFilterNode;
}

interface EqualizerPreset {
  name: string;
  gains: number[];
}

interface AudioEqualizerProps {
  audioContext: AudioContext | null;
  sourceNode: MediaElementAudioSourceNode | null;
  destinationNode: AudioNode | null;
  className?: string;
}

const EQUALIZER_PRESETS: EqualizerPreset[] = [
  { name: 'Flat', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'Rock', gains: [4, 3, -1, -2, 1, 2, 4, 5, 5, 4] },
  { name: 'Pop', gains: [-1, 2, 4, 4, 1, -1, -1, 1, 2, 3] },
  { name: 'Jazz', gains: [3, 2, 1, 2, -1, -1, 0, 1, 2, 3] },
  { name: 'Classical', gains: [4, 3, 2, 1, -1, -2, 0, 2, 3, 4] },
  { name: 'Electronic', gains: [3, 2, 0, -1, 2, 1, 0, 1, 3, 4] },
  { name: 'Hip Hop', gains: [4, 3, 1, 2, -1, 0, 1, 2, 3, 4] },
  { name: 'Vocal', gains: [-2, -1, 1, 3, 3, 2, 1, 0, -1, -2] },
  { name: 'Bass Boost', gains: [6, 5, 3, 1, 0, 0, 0, 0, 0, 0] },
  { name: 'Treble Boost', gains: [0, 0, 0, 0, 0, 1, 2, 3, 4, 5] }
];

const FREQUENCY_BANDS = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

const EQUALIZER_STORAGE_KEY = 'aurora-equalizer-settings';

export default function AudioEqualizer({ 
  audioContext, 
  sourceNode, 
  destinationNode,
  className 
}: AudioEqualizerProps) {
  const [bands, setBands] = useState<EqualizerBand[]>([]);
  const [selectedPreset, setSelectedPreset] = useState('Flat');
  const [isEnabled, setIsEnabled] = useState(true);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(EQUALIZER_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.preset) setSelectedPreset(parsed.preset);
        if (typeof parsed.isEnabled === 'boolean') setIsEnabled(parsed.isEnabled);
        if (Array.isArray(parsed.bands)) {
          setBands(parsed.bands);
        }
      } catch {}
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (bands.length === 0) return;
    localStorage.setItem(EQUALIZER_STORAGE_KEY, JSON.stringify({
      preset: selectedPreset,
      isEnabled,
      bands: bands.map(b => ({ frequency: b.frequency, gain: b.gain }))
    }));
  }, [bands, selectedPreset, isEnabled]);

  // Initialize equalizer
  useEffect(() => {
    if (!audioContext || !sourceNode || !destinationNode) return;

    try {
      gainNodeRef.current = audioContext.createGain();
      const filters = FREQUENCY_BANDS.map((frequency, index) => {
        const filter = audioContext.createBiquadFilter();
        filter.type = index === 0 ? 'lowshelf' : 
                     index === FREQUENCY_BANDS.length - 1 ? 'highshelf' : 'peaking';
        filter.frequency.value = frequency;
        filter.Q.value = 1;
        filter.gain.value = 0;
        return filter;
      });

      filtersRef.current = filters;
      let currentNode: AudioNode = sourceNode;
      filters.forEach(filter => {
        currentNode.connect(filter);
        currentNode = filter;
      });
      currentNode.connect(gainNodeRef.current);
      gainNodeRef.current.connect(destinationNode);

      // Restore bands from localStorage if available
      const saved = localStorage.getItem(EQUALIZER_STORAGE_KEY);
      let initialBands;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.bands) && parsed.bands.length === FREQUENCY_BANDS.length) {
            initialBands = FREQUENCY_BANDS.map((frequency, index) => ({
              frequency,
              gain: parsed.bands[index].gain,
              filter: filters[index]
            }));
            // Set filter gains
            parsed.bands.forEach((b, i) => {
              filters[i].gain.value = b.gain;
            });
          }
        } catch {}
      }
      if (!initialBands) {
        initialBands = FREQUENCY_BANDS.map((frequency, index) => ({
          frequency,
          gain: 0,
          filter: filters[index]
        }));
      }
      setBands(initialBands);
    } catch (error) {
      console.error('Error initializing equalizer:', error);
    }

    return () => {
      filtersRef.current.forEach(filter => {
        try {
          filter.disconnect();
        } catch (e) {}
      });
      if (gainNodeRef.current) {
        try {
          gainNodeRef.current.disconnect();
        } catch (e) {}
      }
    };
  }, [audioContext, sourceNode, destinationNode]);

  const updateBandGain = (bandIndex: number, gain: number) => {
    if (!filtersRef.current[bandIndex]) return;
    const clampedGain = Math.max(-12, Math.min(12, gain));
    setBands(prev => prev.map((band, index) => 
      index === bandIndex ? { ...band, gain: clampedGain } : band
    ));
    if (isEnabled) {
      filtersRef.current[bandIndex].gain.value = clampedGain;
    }
  };

  const applyPreset = (presetName: string) => {
    const preset = EQUALIZER_PRESETS.find(p => p.name === presetName);
    if (!preset) return;
    setSelectedPreset(presetName);
    preset.gains.forEach((gain, index) => {
      updateBandGain(index, gain);
    });
  };

  const resetEqualizer = () => {
    applyPreset('Flat');
  };

  const toggleEqualizer = () => {
    setIsEnabled(!isEnabled);
    filtersRef.current.forEach((filter, index) => {
      if (filter) {
        filter.gain.value = isEnabled ? 0 : bands[index]?.gain || 0;
      }
    });
  };

  const formatFrequency = (freq: number) => {
    if (freq >= 1000) {
      return `${(freq / 1000).toFixed(freq >= 10000 ? 0 : 1)}k`;
    }
    return `${freq}`;
  };

  return (
    <div className={cn('p-1 bg-secondary/20 rounded-xl space-y-2 scale-90', className)} style={{ maxWidth: 900, margin: '0 auto', marginTop: 0, paddingTop: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Equalizer</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetEqualizer}
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant={isEnabled ? "default" : "outline"}
            size="sm"
            onClick={toggleEqualizer}
          >
            {isEnabled ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      {/* Preset Selection */}
      <div className="space-y-1">
        <label className="text-xs font-medium">Preset</label>
        <Select value={selectedPreset} onValueChange={applyPreset}>
          <SelectTrigger className="w-full text-xs h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EQUALIZER_PRESETS.map(preset => (
              <SelectItem key={preset.name} value={preset.name} className="text-xs">
                {preset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Frequency Bands */}
      <div className="space-y-2">
        <div className="flex gap-1 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
          {bands.map((band, index) => (
            <div key={band.frequency} className="flex flex-col items-center space-y-1 min-w-[40px]">
              {/* Gain Value */}
              <div className="text-[10px] font-mono w-7 text-center">
                {band.gain > 0 ? '+' : ''}{band.gain.toFixed(1)}
              </div>
              
              {/* Slider */}
              <div className="h-24 flex items-center">
                <Slider
                  value={[band.gain]}
                  onValueChange={([value]) => updateBandGain(index, value)}
                  min={-12}
                  max={12}
                  step={0.5}
                  orientation="vertical"
                  className="h-full"
                  disabled={!isEnabled}
                />
              </div>
              
              {/* Frequency Label */}
              <div className="text-[10px] text-muted-foreground text-center">
                {formatFrequency(band.frequency)}Hz
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Indicator */}
      <div className="flex items-center justify-center space-x-0.5">
        {bands.map((band, index) => (
          <div
            key={index}
            className={cn(
              'w-1.5 bg-primary/20 rounded-full transition-all duration-200',
              isEnabled && band.gain !== 0 ? 'bg-primary' : ''
            )}
            style={{
              height: `${Math.max(3, Math.abs(band.gain) * 1.5 + 3)}px`
            }}
          />
        ))}
      </div>
    </div>
  );
}