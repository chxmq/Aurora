import React, { useState, useEffect, useRef, useCallback } from "react";
import { Track } from "@/lib/types";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Shuffle,
  Heart,
  MoreHorizontal,
  Maximize2,
  ChevronUp,
  Share,
  Download,
  Volume1,
  Settings,
  Music,
  BarChart3
} from "lucide-react";
import { AvatarWithVerify } from "@/components/ui/avatar-with-verify";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { mockTracks } from "@/lib/mockData";
import { toast } from "sonner";
import { getFileUrl } from "@/lib/fileStorage";
import { getGatewayUrl } from "@/lib/utils";
import AudioVisualizer from "./AudioVisualizer";
import AudioEqualizer from "./AudioEqualizer";
import LyricsDisplay from "./LyricsDisplay";
import CrossfadeController from "./CrossfadeController";

interface AudioState {
  volume: number;
  isMuted: boolean;
  isLooping: boolean;
  isShuffling: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
}

interface MusicPlayerProps {
  className?: string;
  minimized?: boolean;
}

// Create a single global audio instance
const globalAudio = new Audio();
globalAudio.preload = "auto";
globalAudio.crossOrigin = "anonymous";

// Add audio context for better control
let audioContext: AudioContext | null = null;
let audioSource: MediaElementAudioSourceNode | null = null;
let gainNode: GainNode | null = null;
let analyserNode: AnalyserNode | null = null;

// Initialize audio context on first user interaction
const initAudioContext = async () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioSource = audioContext.createMediaElementSource(globalAudio);
      gainNode = audioContext.createGain();
      analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;
      audioSource.connect(analyserNode);
      analyserNode.connect(gainNode);
      gainNode.connect(audioContext.destination);
      console.log('Audio context initialized');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }
  
  if (audioContext && audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
      console.log('Audio context resumed');
    } catch (error) {
      console.error('Failed to resume audio context:', error);
    }
  }
  
  return audioContext;
};

export const audioStore = {
  currentTrackId: null as string | null,
  isPlaying: false,
  audioElement: globalAudio,
  audioContext: null as AudioContext | null,
  gainNode: null as GainNode | null,
  analyserNode: null as AnalyserNode | null,
  volume: 0.8,
  isMuted: false,
  isLooping: false,
  isShuffling: false,
  currentTime: 0,
  duration: 0,
  buffered: 0,
  listeners: [] as Array<(trackId: string | null, playing: boolean, state: AudioState) => void>,
  
  cleanup() {
    try {
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      }
      this.isPlaying = false;
      this.currentTrackId = null;
      this.notifyListeners();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  },

  handleAudioError(error: unknown, context: string) {
    console.error(`Audio error during ${context}:`, error);
    this.cleanup();
    
    let errorMessage = "An error occurred while playing audio.";
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      if (error.message.includes('source')) {
        errorMessage = "Could not load audio file. Please check your connection.";
      } else if (error.message.includes('aborted')) {
        errorMessage = "Audio playback was interrupted.";
      } else if (error.message.includes('network')) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message.includes('NotAllowedError')) {
        errorMessage = "Audio playback not allowed. Please click to enable audio.";
      } else if (error.message.includes('NotSupportedError')) {
        errorMessage = "Audio format not supported by your browser.";
      }
    }

    if (error instanceof Event && error.target instanceof HTMLAudioElement) {
      const mediaError = error.target.error;
      console.error('Media error details:', mediaError);
      if (mediaError) {
        switch (mediaError.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = "Playback was interrupted.";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = "Network error. Please check your connection.";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = "Audio file format not supported.";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "Audio source not supported or file not found.";
            break;
        }
      }
    }

    if (!errorMessage.includes('not allowed')) {
      toast.error(errorMessage);
    } else {
      console.warn('Audio blocked by browser - user interaction required');
    }
  },

  async initializeAudio() {
    try {
      this.audioContext = await initAudioContext();
      this.gainNode = gainNode;
      this.analyserNode = analyserNode;
      
      if (this.audioContext && this.audioContext.state === 'suspended') {
        console.log('Resuming audio context...');
        await this.audioContext.resume();
      }
      
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
      this.audioElement.loop = this.isLooping;
      
      console.log('Audio context state:', this.audioContext?.state);
      console.log('Audio element ready state:', this.audioElement.readyState);
      
      return true;
    } catch (error) {
      console.error('Error initializing audio:', error);
      return false;
    }
  },
  
  async setCurrentTrack(trackId: string | null, playing: boolean = true) {
    try {
      if (!trackId) {
        this.cleanup();
        return;
      }

      const track = mockTracks.find(t => t.id === trackId);
      if (!track) {
        console.error('Track not found:', trackId);
        this.cleanup();
        return;
      }

      console.log('Setting current track:', track.title, 'URL:', track.audioUrl);

      const isNewTrack = this.currentTrackId !== trackId;
      this.currentTrackId = trackId;

      if (isNewTrack) {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        
        let audioUrl = track.audioUrl;
        
        if (audioUrl.startsWith('file://')) {
          const fileId = audioUrl.replace('file://', '');
          const storedUrl = getFileUrl(fileId);
          if (!storedUrl) {
            throw new Error('Audio file not found in storage');
          }
          audioUrl = storedUrl;
        } else if (audioUrl.startsWith('/')) {
          audioUrl = audioUrl;
          console.log('Using direct path:', audioUrl);
        } else if (audioUrl.startsWith('ipfs://')) {
          audioUrl = getGatewayUrl(audioUrl);
        } else if (!audioUrl.startsWith('http')) {
          audioUrl = `/${audioUrl}`;
        }

        console.log('Final audio URL:', audioUrl);
        this.audioElement.src = audioUrl;
        
        try {
          await new Promise((resolve, reject) => {
            const loadHandler = () => {
              this.audioElement.removeEventListener('error', errorHandler);
              console.log('Audio loaded successfully');
              resolve(true);
            };
            
            const errorHandler = (e: Event) => {
              this.audioElement.removeEventListener('loadeddata', loadHandler);
              console.error('Audio load error:', e);
              reject(e);
            };

            this.audioElement.addEventListener('loadeddata', loadHandler, { once: true });
            this.audioElement.addEventListener('error', errorHandler, { once: true });
            this.audioElement.addEventListener('canplay', loadHandler, { once: true });
            
            this.audioElement.load();
          });
        } catch (error) {
          console.error('Error loading audio:', error);
          console.log('Attempting to play despite load error...');
        }
      }

      if (playing) {
        await this.play();
      } else {
        this.pause();
      }
    } catch (error) {
      this.handleAudioError(error, 'setting track');
    }
  },

  async play() {
    try {
      if (!this.currentTrackId) {
        console.error('No current track to play');
        return;
      }
      
      console.log('Attempting to play audio...');
      await this.initializeAudio();
      
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        await playPromise;
        console.log('Audio playing successfully');
      }
      
      this.isPlaying = true;
      this.notifyListeners();
    } catch (error) {
      console.error('Play error:', error);
      this.handleAudioError(error, 'playing');
    }
  },

  pause() {
    try {
      this.audioElement.pause();
      this.isPlaying = false;
      this.notifyListeners();
    } catch (error) {
      this.handleAudioError(error, 'pausing');
    }
  },

  async togglePlay() {
    try {
      if (this.isPlaying) {
        this.pause();
      } else {
        await this.play();
      }
    } catch (error) {
      this.handleAudioError(error, 'toggling play/pause');
    }
  },

  replay() {
    try {
      this.audioElement.currentTime = 0;
      if (!this.isPlaying) {
        this.play();
      }
    } catch (error) {
      console.error("Error replaying audio:", error);
      toast.error("Error replaying audio. Please try again.");
    }
  },

  setVolume(volume: number) {
    this.volume = volume;
    this.audioElement.volume = this.isMuted ? 0 : volume;
    if (this.gainNode) {
      this.gainNode.gain.value = this.isMuted ? 0 : volume;
    }
    this.notifyListeners();
  },

  setMuted(muted: boolean) {
    this.isMuted = muted;
    this.audioElement.volume = muted ? 0 : this.volume;
    if (this.gainNode) {
      this.gainNode.gain.value = muted ? 0 : this.volume;
    }
    this.notifyListeners();
  },

  setLooping(looping: boolean) {
    this.isLooping = looping;
    this.audioElement.loop = looping;
    this.notifyListeners();
  },

  setShuffling(shuffling: boolean) {
    this.isShuffling = shuffling;
    this.notifyListeners();
  },

  seekTo(time: number) {
    if (this.audioElement && isFinite(time) && time >= 0) {
      this.audioElement.currentTime = time;
    }
  },
  
  subscribe(listener: (trackId: string | null, playing: boolean, state: AudioState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },
  
  notifyListeners() {
    this.listeners.forEach(listener => 
      listener(this.currentTrackId, this.isPlaying, {
        volume: this.volume,
        isMuted: this.isMuted,
        isLooping: this.isLooping,
        isShuffling: this.isShuffling,
        currentTime: this.currentTime,
        duration: this.duration,
        buffered: this.buffered
      })
    );
  },

  skipToNext() {
    if (!this.currentTrackId) return;
    
    const currentIndex = mockTracks.findIndex(t => t.id === this.currentTrackId);
    if (currentIndex === -1) return;
    
    let nextIndex;
    if (this.isShuffling) {
      const availableIndices = Array.from(
        { length: mockTracks.length },
        (_, i) => i
      ).filter(i => i !== currentIndex);
      nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    } else {
      nextIndex = (currentIndex + 1) % mockTracks.length;
    }
    
    this.setCurrentTrack(mockTracks[nextIndex].id, true);
  },

  skipToPrevious() {
    if (!this.currentTrackId) return;
    
    const currentIndex = mockTracks.findIndex(t => t.id === this.currentTrackId);
    if (currentIndex === -1) return;
    
    if (this.audioElement.currentTime > 3) {
      this.audioElement.currentTime = 0;
      return;
    }
    
    let prevIndex;
    if (this.isShuffling) {
      const availableIndices = Array.from(
        { length: mockTracks.length },
        (_, i) => i
      ).filter(i => i !== currentIndex);
      prevIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    } else {
      prevIndex = currentIndex - 1;
      if (prevIndex < 0) prevIndex = mockTracks.length - 1;
    }
    
    this.setCurrentTrack(mockTracks[prevIndex].id, true);
  },

  updateProgress() {
    if (this.audioElement) {
      this.currentTime = this.audioElement.currentTime;
      this.duration = this.audioElement.duration || 0;
      
      if (this.audioElement.buffered.length > 0 && this.duration > 0) {
        const bufferedEnd = this.audioElement.buffered.end(this.audioElement.buffered.length - 1);
        this.buffered = (bufferedEnd / this.duration) * 100;
      } else {
        this.buffered = 0;
      }
      
      this.notifyListeners();
    }
  }
};

// Set up global audio event listeners
globalAudio.addEventListener('ended', () => {
  if (!audioStore.isLooping) {
    audioStore.skipToNext();
  }
});

globalAudio.addEventListener('timeupdate', () => {
  audioStore.updateProgress();
});

globalAudio.addEventListener('progress', () => {
  audioStore.updateProgress();
});

globalAudio.addEventListener('error', (e) => {
  audioStore.handleAudioError(e, 'global error');
});

// Export utility functions
export function playTrack(trackId: string) {
  console.log('playTrack called with:', trackId);
  return audioStore.setCurrentTrack(trackId, true);
}

export function pauseTrack() {
  console.log('pauseTrack called');
  audioStore.pause();
}

export function togglePlayPause() {
  console.log('togglePlayPause called');
  return audioStore.togglePlay();
}

export function seekTo(time: number) {
  audioStore.seekTo(time);
}

export function setVolume(volume: number) {
  audioStore.setVolume(volume);
}

export function toggleMute() {
  audioStore.setMuted(!audioStore.isMuted);
}

export function toggleLoop() {
  audioStore.setLooping(!audioStore.isLooping);
}

export function toggleShuffle() {
  audioStore.setShuffling(!audioStore.isShuffling);
}

export function getCurrentTrackId() {
  return audioStore.currentTrackId;
}

export function getIsPlaying() {
  return audioStore.isPlaying;
}

export function replayTrack() {
  audioStore.replay();
}

export function skipToNextTrack() {
  audioStore.skipToNext();
}

export function skipToPreviousTrack() {
  audioStore.skipToPrevious();
}

export default function MusicPlayer({ className, minimized = false }: MusicPlayerProps) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(audioStore.volume);
  const [isMuted, setIsMuted] = useState(audioStore.isMuted);
  const [isLooping, setIsLooping] = useState(audioStore.isLooping);
  const [isShuffling, setIsShuffling] = useState(audioStore.isShuffling);
  const [buffered, setBuffered] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('visualizer');
  
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeTimeoutRef = useRef<NodeJS.Timeout>();

  // Subscribe to audio store changes
  useEffect(() => {
    const updateStates = (trackId: string | null, playing: boolean, state: AudioState) => {
      if (trackId) {
        const track = mockTracks.find(t => t.id === trackId);
        if (track) {
          setCurrentTrack(track);
        }
      } else {
        setCurrentTrack(null);
      }
      setIsPlaying(playing);
      setCurrentTime(state.currentTime);
      setDuration(state.duration);
      setBuffered(state.buffered);
      setVolumeState(state.volume);
      setIsMuted(state.isMuted);
      setIsLooping(state.isLooping);
      setIsShuffling(state.isShuffling);
    };

    const unsubscribe = audioStore.subscribe(updateStates);
    return unsubscribe;
  }, []);

  // Format time helper
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get volume icon based on level
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 0.3) return Volume1;
    return Volume2;
  };

  // Handle play/pause
  const handlePlayPause = async () => {
    if (!currentTrack) return;
    await audioStore.togglePlay();
  };

  // Handle seeking
  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!duration || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const seekTime = percentage * duration;

    if (isFinite(seekTime) && seekTime >= 0 && seekTime <= duration) {
      audioStore.seekTo(seekTime);
    }
  };

  // Handle volume changes
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    audioStore.setVolume(newVolume);
  };

  const handleVolumeIconClick = () => {
    audioStore.setMuted(!isMuted);
  };

  const handleVolumeHover = (show: boolean) => {
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }

    if (show) {
      setShowVolumeSlider(true);
    } else {
      volumeTimeoutRef.current = setTimeout(() => {
        setShowVolumeSlider(false);
      }, 300);
    }
  };

  // Handle track actions
  const handleLike = () => {
    setIsLiked(!isLiked);
    if (currentTrack) {
      toast.success(isLiked ? "Removed from favorites" : "Added to favorites");
    }
  };

  const VolumeIcon = getVolumeIcon();
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercentage = buffered;

  // Don't render if no current track
  if (!currentTrack) {
    return (
      <div className={cn(
        "fixed bottom-0 left-0 right-0 bg-gradient-to-r from-background/95 via-background/98 to-background/95",
        "backdrop-blur-2xl border-t border-border/30 shadow-2xl",
        "h-20 flex items-center justify-center z-50",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:via-transparent before:to-primary/5",
        className
      )}>
        <div className="text-muted-foreground text-sm font-medium">
          Select a track to start playing
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Player Bar */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-gradient-to-r from-background/95 via-background/98 to-background/95",
        "backdrop-blur-2xl border-t border-border/30 shadow-2xl",
        isExpanded ? "h-96" : "h-24",
        "flex flex-col transition-all duration-300",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:via-transparent before:to-primary/5",
        className
      )}>
        {/* Progress Bar */}
        <div 
          ref={progressBarRef}
          className="h-1.5 w-full cursor-pointer group relative overflow-hidden"
          onClick={handleProgressClick}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-muted-foreground/10 via-muted-foreground/20 to-muted-foreground/10" />
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-muted-foreground/30 to-muted-foreground/50 transition-all duration-300 z-20"
            style={{ width: `${bufferedPercentage}%` }}
          />
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 transition-all duration-300 z-30"
            style={{ width: `${progressPercentage}%` }}
          />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-40">
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg shadow-primary/50 border-2 border-background"
              style={{ left: `${progressPercentage}%`, marginLeft: '-8px' }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center px-6 gap-6 relative">
          {/* Track Info */}
          <div className="flex items-center gap-4 w-80 min-w-0">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-xl group">
              <img 
                src={getGatewayUrl(currentTrack.coverArt)}
                alt={currentTrack.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-base truncate bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                {currentTrack.title}
              </div>
              <div className="text-muted-foreground text-sm truncate">
                {currentTrack.artist.displayName}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-2xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 hover:scale-110"
              onClick={handleLike}
            >
              <Heart className={cn("w-5 h-5 transition-all", isLiked && "fill-current text-red-500 scale-110")} />
            </Button>
          </div>

          {/* Center Controls */}
          <div className="flex items-center justify-center gap-3 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-10 h-10 rounded-2xl text-muted-foreground hover:text-foreground transition-all duration-200",
                "hover:bg-accent/50 hover:scale-110",
                isShuffling && "text-primary bg-primary/10 shadow-lg shadow-primary/20"
              )}
              onClick={() => audioStore.setShuffling(!isShuffling)}
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 hover:scale-110"
              onClick={() => audioStore.skipToPrevious()}
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            
            <Button
              variant="secondary"
              size="icon"
              className={cn(
                "w-14 h-14 rounded-3xl shadow-2xl transition-all duration-300",
                "bg-gradient-to-br from-foreground via-foreground/95 to-foreground/90",
                "text-background hover:scale-110 hover:shadow-3xl",
                "border border-foreground/20",
                "active:scale-95"
              )}
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 hover:scale-110"
              onClick={() => audioStore.skipToNext()}
            >
              <SkipForward className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-10 h-10 rounded-2xl text-muted-foreground hover:text-foreground transition-all duration-200",
                "hover:bg-accent/50 hover:scale-110",
                isLooping && "text-primary bg-primary/10 shadow-lg shadow-primary/20"
              )}
              onClick={() => audioStore.setLooping(!isLooping)}
            >
              <Repeat className="w-4 h-4" />
            </Button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4 w-80 justify-end">
            <div className="text-xs text-muted-foreground font-mono bg-muted/30 px-3 py-1.5 rounded-xl border border-border/50">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            
            <div 
              className="relative flex items-center gap-3 bg-muted/20 rounded-2xl px-3 py-2 border border-border/30"
              onMouseEnter={() => handleVolumeHover(true)}
              onMouseLeave={() => handleVolumeHover(false)}
            >
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-xl text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
                onClick={handleVolumeIconClick}
              >
                <VolumeIcon className="w-4 h-4" />
              </Button>
              
              <div className={cn(
                "transition-all duration-300 overflow-hidden",
                showVolumeSlider ? "w-24 opacity-100" : "w-0 opacity-0"
              )}>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-24"
                />
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-10 h-10 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 hover:scale-110",
                isExpanded && "text-primary bg-primary/10"
              )}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <ChevronUp className={cn("w-4 h-4 transition-transform duration-300", isExpanded && "rotate-180")} />
            </Button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="flex-1 border-t border-border/30 bg-background/50 backdrop-blur-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="w-full justify-start border-b border-border/30 bg-transparent rounded-none h-12">
                <TabsTrigger value="visualizer" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Visualizer
                </TabsTrigger>
                <TabsTrigger value="equalizer" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Equalizer
                </TabsTrigger>
                <TabsTrigger value="crossfade" className="gap-2">
                  <Shuffle className="w-4 h-4" />
                  Crossfade
                </TabsTrigger>
              </TabsList>
              
              <div className="h-64 overflow-hidden">
                <TabsContent value="visualizer" className="h-full m-0 p-4">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-5xl mx-auto py-8 px-2 md:px-8">
                    {/* Spectrum Visualizer - Large Wide Card */}
                    <div className="flex flex-col items-center justify-center bg-white/60 dark:bg-black/40 rounded-3xl shadow-xl border border-white/30 dark:border-gray-800/40 p-6 md:p-8 backdrop-blur-md transition-all duration-300 w-full max-w-3xl min-h-[220px] mr-0 md:mr-6" style={{ flex: 2 }}>
                      <AudioVisualizer 
                        analyserNode={audioStore.analyserNode}
                        isPlaying={isPlaying}
                        type="spectrum"
                        className="w-full h-full"
                      />
                      <span className="mt-4 text-base font-semibold text-gray-800 dark:text-gray-100 tracking-wide drop-shadow-sm">Spectrum</span>
                    </div>
                    {/* Circular Visualizer - Square Card */}
                    <div className="flex flex-col items-center justify-center bg-white/60 dark:bg-black/40 rounded-3xl shadow-xl border border-white/30 dark:border-gray-800/40 p-6 md:p-8 backdrop-blur-md transition-all duration-300 w-full max-w-xs min-h-[220px] mt-8 md:mt-0" style={{ flex: 1 }}>
                      <AudioVisualizer 
                        analyserNode={audioStore.analyserNode}
                        isPlaying={isPlaying}
                        type="circular"
                        className="w-full h-full"
                      />
                      <span className="mt-4 text-base font-semibold text-gray-800 dark:text-gray-100 tracking-wide drop-shadow-sm">Circular</span>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="equalizer" className="h-full m-0 p-4">
                  <AudioEqualizer 
                    audioContext={audioStore.audioContext}
                    sourceNode={audioSource}
                    destinationNode={gainNode}
                    className="h-full w-full"
                  />
                </TabsContent>
                
                <TabsContent value="crossfade" className="h-full m-0 p-4">
                  <CrossfadeController 
                    audioContext={audioStore.audioContext}
                    className="h-full"
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </div>
    </>
  );
}