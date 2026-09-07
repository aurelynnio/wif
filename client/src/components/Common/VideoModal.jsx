import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Download,
  PictureInPicture,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const VideoModal = ({ videoUrl, onClose, poster }) => {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [buffered, setBuffered] = useState(0);

  const controlsTimeoutRef = useRef(null);

  // Format time (seconds to mm:ss)
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  // Handle mute/unmute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Handle volume change
  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  // Handle seek
  const handleSeek = useCallback((e) => {
    if (videoRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [duration]);

  // Skip forward/backward
  const skip = useCallback((seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        Math.max(videoRef.current.currentTime + seconds, 0),
        duration
      );
    }
  }, [duration]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Picture in Picture
  const togglePiP = useCallback(async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP error:', error);
    }
  }, []);

  // Change playback rate
  const changePlaybackRate = useCallback((rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSettings(false);
    }
  }, []);

  // Download video
  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = 'video.mp4';
    link.click();
  }, [videoUrl]);

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      // Update buffered
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.min(volume + 0.1, 1);
            videoRef.current.volume = newVol;
            setVolume(newVol);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.max(volume - 0.1, 0);
            videoRef.current.volume = newVol;
            setVolume(newVol);
          }
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'Escape':
          if (!isFullscreen) onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, skip, volume, toggleMute, toggleFullscreen, isFullscreen, onClose]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose?.();
      }}
    >
      {/* Close Button - Same position as image preview */}
      <Button
        variant="ghost"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 h-auto w-auto rounded-xl bg-white/10 p-2.5 text-white shadow-none backdrop-blur-sm hover:bg-white/20 hover:text-white"
        aria-label="Close"
      >
        <X size={20} />
      </Button>

      <div
        ref={containerRef}
        className="relative w-full max-w-5xl mx-4"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={resetControlsTimeout}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >

        {/* Video Container */}
        <div className="relative rounded-xl overflow-hidden bg-black">
          <video
            ref={videoRef}
            src={videoUrl}
            poster={poster}
            autoPlay
            playsInline
            className="w-full max-h-[80vh] object-contain"
            onClick={togglePlay}
          />

          {/* Play/Pause Overlay */}
          {!isPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
              onClick={togglePlay}
            >
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play size={40} className="text-white ml-1" />
              </div>
            </div>
          )}

          {/* Controls */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Progress Bar */}
            <div
              ref={progressRef}
              className="relative h-1 bg-white/30 rounded-full cursor-pointer mb-4 group"
              onClick={handleSeek}
            >
              {/* Buffered */}
              <div
                className="absolute h-full bg-white/50 rounded-full"
                style={{ width: `${(buffered / duration) * 100}%` }}
              />
              {/* Progress */}
              <div
                className="absolute h-full bg-primary rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
              {/* Thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${(currentTime / duration) * 100}% - 6px)` }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Play/Pause */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20 hover:text-white"
                  aria-label={isPlaying ? 'Play' : 'Pause'}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </Button>

                {/* Skip Backward */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => skip(-10)}
                  className="text-white hover:bg-white/20 hover:text-white"
                  title="Rewind 10s"
                  aria-label="Rewind 10s"
                >
                  <SkipBack size={18} />
                </Button>

                {/* Skip Forward */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => skip(10)}
                  className="text-white hover:bg-white/20 hover:text-white"
                  title="Forward 10s"
                  aria-label="Forward 10s"
                >
                  <SkipForward size={18} />
                </Button>

                {/* Volume */}
                <div className="flex items-center gap-2 group">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20 hover:text-white"
                    aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </Button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    aria-label="Volume"
                    className="w-0 group-hover:w-20 transition-all duration-200 accent-primary"
                  />
                </div>

                {/* Time */}
                <span className="text-white text-sm ml-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Settings */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-white hover:bg-white/20 hover:text-white"
                    aria-label="Playback settings"
                  >
                    <Settings size={18} />
                  </Button>
                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 min-w-[150px] overflow-hidden rounded-lg bg-neutral-900">
                      <div className="border-b border-neutral-700 px-3 py-2 text-xs text-neutral-400">
                        Playback Speed
                      </div>
                      {playbackRates.map((rate) => (
                        <Button
                          key={rate}
                          variant="ghost"
                          onClick={() => changePlaybackRate(rate)}
                          className={`h-auto w-full justify-start rounded-none px-3 py-2 text-left text-sm ${
                            playbackRate === rate
                              ? 'bg-muted text-primary hover:text-primary'
                              : 'text-white hover:bg-neutral-800 hover:text-white'
                          }`}
                        >
                          {rate === 1 ? 'Normal' : `${rate}x`}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Picture in Picture */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={togglePiP}
                  className="text-white hover:bg-white/20 hover:text-white"
                  title="Picture in Picture"
                  aria-label="Picture in Picture"
                >
                  <PictureInPicture size={18} />
                </Button>

                {/* Download */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleDownload}
                  className="text-white hover:bg-white/20 hover:text-white"
                  title="Download"
                  aria-label="Download"
                >
                  <Download size={18} />
                </Button>

                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20 hover:text-white"
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="mt-4 text-center text-neutral-500 text-xs">
          <span className="mr-4">Space: Play/Pause</span>
          <span className="mr-4">←/→: Skip 10s</span>
          <span className="mr-4">↑/↓: Volume</span>
          <span className="mr-4">M: Mute</span>
          <span>F: Fullscreen</span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default VideoModal;
