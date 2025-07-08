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

  // Initialize equalizer
  useEffect(() => {
    if (!audioContext || !sourceNode || !destinationNode) return;

    try {
      // Create gain node for overall volume control
      gainNodeRef.current = audioContext.createGain();
      
      // Create filter nodes for each frequency band
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

      // Connect the audio chain
      let currentNode: AudioNode = sourceNode;
      
      filters.forEach(filter => {
        currentNode.connect(filter);
        currentNode = filter;
      });
      
      currentNode.connect(gainNodeRef.current);
      gainNodeRef.current.connect(destinationNode);

      // Initialize bands state
      const initialBands = FREQUENCY_BANDS.map((frequency, index) => ({
        frequency,
        gain: 0,
        filter: filters[index]
      }));

      setBands(initialBands);
    } catch (error) {
      console.error('Error initializing equalizer:', error);
    }

    return () => {
      // Cleanup
      filtersRef.current.forEach(filter => {
        try {
          filter.disconnect();
        } catch (e) {
          // Filter might already be disconnected
        }
      });
      if (gainNodeRef.current) {
        try {
          gainNodeRef.current.disconnect();
        } catch (e) {
          // Node might already be disconnected
        }
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
    <div className={cn('p-4 bg-secondary/20 rounded-xl space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Equalizer</h3>
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
      <div className="space-y-2">
        <label className="text-sm font-medium">Preset</label>
        <Select value={selectedPreset} onValueChange={applyPreset}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EQUALIZER_PRESETS.map(preset => (
              <SelectItem key={preset.name} value={preset.name}>
                {preset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Frequency Bands */}
      <div className="space-y-4">
        <div className="grid grid-cols-5 lg:grid-cols-10 gap-2">
          {bands.map((band, index) => (
            <div key={band.frequency} className="flex flex-col items-center space-y-2">
              {/* Gain Value */}
              <div className="text-xs font-mono w-8 text-center">
                {band.gain > 0 ? '+' : ''}{band.gain.toFixed(1)}
              </div>
              
              {/* Slider */}
              <div className="h-32 flex items-center">
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
              <div className="text-xs text-muted-foreground text-center">
                {formatFrequency(band.frequency)}Hz
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Indicator */}
      <div className="flex items-center justify-center space-x-1">
        {bands.map((band, index) => (
          <div
            key={index}
            className={cn(
              'w-2 bg-primary/20 rounded-full transition-all duration-200',
              isEnabled && band.gain !== 0 ? 'bg-primary' : ''
            )}
            style={{
              height: `${Math.max(4, Math.abs(band.gain) * 2 + 4)}px`
            }}
          />
        ))}
      </div>
    </div>
  );
}