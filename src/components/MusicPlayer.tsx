import { useState, useRef, useEffect } from "react";
import { Track } from "@/lib/types";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Volume1, 
  VolumeX,
  Repeat,
  Shuffle,
  RotateCcw
} from "lucide-react";
import { AvatarWithVerify } from "@/components/ui/avatar-with-verify";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mockTracks } from "@/lib/mockData";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { getFileUrl } from "@/lib/fileStorage";
import { getGatewayUrl } from "@/lib/utils";

interface MusicPlayerProps {
  className?: string;
  minimized?: boolean;
}

// Create a single global audio instance
const globalAudio = new Audio();
globalAudio.preload = "auto";

// Add audio context for better control
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
const audioSource = audioContext.createMediaElementSource(globalAudio);
const gainNode = audioContext.createGain();
audioSource.connect(gainNode);
gainNode.connect(audioContext.destination);

export const audioStore = {
  currentTrackId: null as string | null,
  isPlaying: false,
  audioElement: globalAudio,
  audioContext,
  gainNode,
  volume: 0.8,
  isMuted: false,
  isLooping: false,
  isShuffling: false,
  currentTime: 0,
  duration: 0,
  buffered: 0,
  listeners: [] as Function[],
  
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

  handleAudioError(error: any, context: string) {
    console.error(`Audio error during ${context}:`, error);
    
    // Cleanup the audio state
    this.cleanup();
    
    let errorMessage = "An error occurred while playing audio.";
    
    if (error instanceof Error) {
      if (error.message.includes('source')) {
        errorMessage = "Could not load audio file. Please check your connection.";
      } else if (error.message.includes('aborted')) {
        errorMessage = "Audio playback was interrupted.";
      } else if (error.message.includes('network')) {
        errorMessage = "Network error. Please check your connection.";
      }
    }

    if (error instanceof Event && error.target instanceof HTMLAudioElement) {
      const mediaError = error.target.error;
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
            errorMessage = "Audio source not supported.";
            break;
        }
      }
    }

    toast.error(errorMessage);
  },

  async initializeAudio() {
    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Ensure audio element is in a clean state
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
      this.audioElement.loop = this.isLooping;
      
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
        this.cleanup();
        return;
      }

      const isNewTrack = this.currentTrackId !== trackId;
      this.currentTrackId = trackId;

      if (isNewTrack) {
        // Cleanup before loading new track
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        
        let audioUrl = track.audioUrl;
        
        // Handle different URL types
        if (audioUrl.startsWith('file://')) {
          // Get the file URL from storage
          const fileId = audioUrl.replace('file://', '');
          const storedUrl = getFileUrl(fileId);
          if (!storedUrl) {
            throw new Error('Audio file not found in storage');
          }
          audioUrl = storedUrl;
        } else if (audioUrl.startsWith('/')) {
          // Handle absolute paths that work across all routes
          audioUrl = audioUrl;
        } else if (audioUrl.startsWith('ipfs://')) {
          audioUrl = getGatewayUrl(audioUrl);
        }

        this.audioElement.src = audioUrl;
        
        // Wait for audio to be loaded
        try {
          await new Promise((resolve, reject) => {
            const loadHandler = () => {
              this.audioElement.removeEventListener('error', errorHandler);
              resolve(true);
            };
            
            const errorHandler = (e: Event) => {
              this.audioElement.removeEventListener('loadeddata', loadHandler);
              reject(e);
            };

            this.audioElement.addEventListener('loadeddata', loadHandler, { once: true });
            this.audioElement.addEventListener('error', errorHandler, { once: true });
            this.audioElement.load();
          });
        } catch (error) {
          console.error('Error loading audio:', error);
          this.cleanup();
          throw error;
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
      if (!this.currentTrackId) return;
      
      await this.initializeAudio();
      await this.audioElement.play();
      this.isPlaying = true;
      this.notifyListeners();
    } catch (error) {
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
        this.setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error replaying audio:", error);
      toast.error("Error replaying audio. Please try again.");
    }
  },

  setVolume(volume: number) {
    this.volume = volume;
    if (this.gainNode) {
      this.gainNode.gain.value = this.isMuted ? 0 : volume;
    }
    this.notifyListeners();
  },

  setMuted(muted: boolean) {
    this.isMuted = muted;
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
  
  subscribe(listener: Function) {
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
      // Get random index excluding current track
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
    
    // If we're more than 3 seconds into the song, restart it
    if (this.audioElement.currentTime > 3) {
      this.audioElement.currentTime = 0;
      return;
    }
    
    let prevIndex;
    if (this.isShuffling) {
      // Get random index excluding current track
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
      
      // Calculate buffered amount
      if (this.audioElement.buffered.length > 0) {
        this.buffered = (this.audioElement.buffered.end(this.audioElement.buffered.length - 1) / this.duration) * 100;
      }
      
      this.notifyListeners();
    }
  }
};

// Set up global audio event listeners
globalAudio.addEventListener('ended', () => {
  if (!audioStore.isLooping) {
    // Move to next track if not looping
    const currentIndex = mockTracks.findIndex(t => t.id === audioStore.currentTrackId);
    if (currentIndex !== -1) {
      let nextIndex;
      if (audioStore.isShuffling) {
        // Get random index excluding current track
        const availableIndices = Array.from(
          { length: mockTracks.length },
          (_, i) => i
        ).filter(i => i !== currentIndex);
        nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      } else {
        nextIndex = (currentIndex + 1) % mockTracks.length;
      }
      audioStore.setCurrentTrack(mockTracks[nextIndex].id);
    }
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

export function playTrack(trackId: string) {
  return audioStore.setCurrentTrack(trackId, true);
}

export function pauseTrack() {
  audioStore.pause();
}

export function togglePlayPause() {
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
  const [trackIndex, setTrackIndex] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Add new states for UI
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(0);

  // Initialize audio element
  useEffect(() => {
    const audio = globalAudio;
    audioRef.current = audio;
    
    // Clean up any existing audio elements
    document.querySelectorAll('audio').forEach(existingAudio => {
      if (existingAudio !== audio) {
        existingAudio.pause();
        existingAudio.currentTime = 0;
        existingAudio.src = '';
        existingAudio.remove();
      }
    });
    
    // Set up event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadMetadata);
    audio.addEventListener('ended', handleTrackEnd);
    audio.addEventListener('play', () => {
      setIsPlaying(true);
      audioStore.isPlaying = true;
    });
    audio.addEventListener('pause', () => {
      setIsPlaying(false);
      audioStore.isPlaying = false;
    });
    audio.addEventListener('error', handleAudioError);
    
    // Set initial volume and loop state
    audio.volume = audioStore.volume;
    audio.loop = audioStore.isLooping;
    
    return () => {
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadMetadata);
      audio.removeEventListener('ended', handleTrackEnd);
      audio.removeEventListener('play', () => {
        setIsPlaying(true);
        audioStore.isPlaying = true;
      });
      audio.removeEventListener('pause', () => {
        setIsPlaying(false);
        audioStore.isPlaying = false;
      });
      audio.removeEventListener('error', handleAudioError);
    };
  }, []);

  // Subscribe to audio store changes
  useEffect(() => {
    const updateStates = (trackId: string | null, playing: boolean, state: any) => {
      if (trackId) {
        const track = mockTracks.find(t => t.id === trackId);
        if (track) {
          setCurrentTrack(track);
        }
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

  // Update cleanup effect for page navigation
  useEffect(() => {
    const cleanup = () => {
      audioStore.cleanup();
    };

    // Handle page visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        audioStore.pause();
      }
    };

    // Handle page navigation
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      cleanup();
    };

    // Handle route changes
    const handleRouteChange = () => {
      // Don't cleanup on route change, just ensure state is synced
      if (audioStore.isPlaying) {
        audioStore.notifyListeners();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Handle playback functions
  const handleSkipForward = () => {
    skipToNextTrack();
  };
  
  const handleSkipBack = () => {
    skipToPreviousTrack();
  };
  
  const handlePlayPause = async () => {
    if (!currentTrack) return;
    
    try {
      if (isPlaying) {
        audioStore.pause();
      } else {
        await audioStore.play();
      }
    } catch (error) {
      console.error("Error in play/pause:", error);
    }
  };
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const handleLoadMetadata = () => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      if (isFinite(audioDuration)) {
        setDuration(audioDuration);
      } else if (currentTrack?.duration) {
        setDuration(currentTrack.duration);
      }
    }
  };
  
  const handleTrackEnd = () => {
    if (audioRef.current) {
      if (audioRef.current.loop) {
        // If looping is enabled, the audio will automatically restart
        return;
      }
      
      // If not looping, move to next track
      handleSkipForward();
    }
  };
  
  const handleSeek = (value: number[]) => {
    const seekTime = value[0];
    if (audioRef.current && isFinite(seekTime) && seekTime >= 0) {
      audioRef.current.currentTime = seekTime;
      if (!isPlaying) {
        // If seeking while paused, don't auto-play
        setCurrentTime(seekTime);
      }
    }
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    if (isFinite(newVolume)) {
      setVolumeState(newVolume);
      audioStore.setVolume(newVolume);
    }
  };
  
  const handleMuteToggle = () => {
    audioStore.setMuted(!isMuted);
  };

  const handleLoopToggle = () => {
    audioStore.setLooping(!isLooping);
  };

  const handleShuffleToggle = () => {
    audioStore.setShuffling(!isShuffling);
  };

  // Helper functions for time formatting
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get appropriate volume icon based on level and mute state
  const VolumeIcon = isMuted ? VolumeX : volume > 0.5 ? Volume2 : Volume1;

  // Add a new error handler function
  const handleAudioError = (error: any) => {
    audioStore.handleAudioError(error, 'global error');
  };

  // Add replay handler
  const handleReplay = () => {
    if (currentTrack) {
      replayTrack();
    }
  };

  const handleProgressBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!duration || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const percentage = x / width;
    const seekTime = percentage * duration;

    if (isFinite(seekTime) && seekTime >= 0 && seekTime <= duration) {
      audioStore.audioElement.currentTime = seekTime;
    }
  };

  // Update the minimized player UI
  if (minimized) {
    return (
      <div className={cn(
        "fixed bottom-0 left-0 right-0 h-12 bg-background/95 backdrop-blur-lg border-t",
        "flex items-center px-3 gap-3 z-50 shadow-lg",
        className
      )}>
        {currentTrack ? (
          <>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="relative h-8 w-8 rounded overflow-hidden">
                <img 
                  src={currentTrack.coverArt} 
                  alt={currentTrack.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{currentTrack.title}</p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 rounded-full"
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </>
        ) : (
          <div className="flex-1 text-center text-sm text-muted-foreground">
            No track selected
          </div>
        )}
      </div>
    );
  }

  // Main player UI
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-lg border-t",
      "flex flex-col px-3 z-50 shadow-lg",
      className
    )}>
      {/* Progress bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 cursor-pointer group"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          setHoverPosition((x / rect.width) * 100);
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleProgressBarClick}
        ref={progressBarRef}
      >
        {/* Buffering progress */}
        <div 
          className="absolute h-full bg-muted-foreground/20"
          style={{ width: `${buffered}%` }}
        />
        {/* Playback progress */}
        <div 
          className="absolute h-full bg-primary transition-all"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
        {/* Hover indicator */}
        {isHovering && (
          <>
            <div 
              className="absolute h-full bg-primary/50 transition-all"
              style={{ width: `${hoverPosition}%` }}
            />
            <div 
              className="absolute -top-8 px-2 py-1 rounded bg-background border text-xs transform -translate-x-1/2"
              style={{ left: `${hoverPosition}%` }}
            >
              {formatTime(duration * (hoverPosition / 100))}
            </div>
          </>
        )}
      </div>

      {/* Main content */}
      <div className="flex items-center gap-3 h-full">
        {/* Track info */}
        {currentTrack ? (
          <div className="flex items-center gap-2 min-w-0 w-[240px]">
            <div className="relative h-10 w-10 rounded overflow-hidden">
              <img 
                src={currentTrack.coverArt} 
                alt={currentTrack.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{currentTrack.title}</p>
              <p className="text-xs text-muted-foreground truncate">{currentTrack.artist.displayName}</p>
            </div>
          </div>
        ) : (
          <div className="w-[240px] flex items-center justify-center text-muted-foreground text-sm">
            No track selected
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center flex-1 gap-1">
          <Button 
            variant={isShuffling ? "secondary" : "ghost"} 
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleShuffleToggle}
          >
            <Shuffle className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleSkipBack}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button 
            variant={isPlaying ? "default" : "secondary"}
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={handlePlayPause}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleSkipForward}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
          <Button 
            variant={isLooping ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleLoopToggle}
          >
            <Repeat className="h-4 w-4" />
          </Button>
        </div>

        {/* Time and Volume */}
        <div className="flex items-center gap-2 w-[240px]">
          <span className="text-xs text-muted-foreground w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <span className="text-xs text-muted-foreground">/</span>
          <span className="text-xs text-muted-foreground w-10">
            {formatTime(duration)}
          </span>
          <div className="flex items-center gap-1 flex-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleMuteToggle}
            >
              <VolumeIcon className="h-4 w-4" />
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
