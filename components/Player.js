import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Shuffle,
  Repeat,
  Heart,
  Music
} from 'lucide-react';

export default function Player({ currentSong, isPlaying, onPlayPause, onNext, onPrevious }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // 'none', 'one', 'all'
  
  const audioRef = useRef(null);
  const volumeSliderRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.src = currentSong.audioUrl || currentSong.url;
      audioRef.current.load();
      
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentSong, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else if (repeatMode === 'all') {
        onNext?.();
      } else {
        onNext?.();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [repeatMode, onNext]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (volumeSliderRef.current && !volumeSliderRef.current.contains(event.target)) {
        setShowVolumeSlider(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientY - rect.top) / rect.height;
    const newVolume = Math.max(0, Math.min(1, 1 - percent));
    
    setVolume(newVolume);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const toggleRepeat = () => {
    const modes = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-gradient-secondary border-t border-echo-primary/20 backdrop-blur-md z-50 shadow-soft"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <motion.div
              className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow"
              whileHover={{ scale: 1.05 }}
            >
              <Music className="h-8 w-8 text-echo-white" />
            </motion.div>
            
            <div className="min-w-0 flex-1">
              <h3 className="text-echo-text font-semibold truncate">
                {currentSong.title}
              </h3>
              <p className="text-echo-text-secondary truncate">
                {currentSong.artist}
              </p>
              <p className="text-echo-text-secondary/70 text-sm truncate">
                {currentSong.album}
              </p>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex flex-col items-center space-y-3 flex-1">
            {/* Control Buttons */}
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={toggleShuffle}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isShuffled 
                    ? 'bg-echo-primary text-echo-white shadow-glow' 
                    : 'text-echo-primary hover:bg-echo-primary/20'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Shuffle className="h-4 w-4" />
              </motion.button>

              <motion.button
                onClick={onPrevious}
                className="p-2 text-echo-primary hover:bg-echo-primary/20 rounded-full transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <SkipBack className="h-5 w-5" />
              </motion.button>

              <motion.button
                onClick={onPlayPause}
                className="bg-gradient-button text-echo-white p-4 rounded-full shadow-glow hover:shadow-soft transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-1" />
                )}
              </motion.button>

              <motion.button
                onClick={onNext}
                className="p-2 text-echo-primary hover:bg-echo-primary/20 rounded-full transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <SkipForward className="h-5 w-5" />
              </motion.button>

              <motion.button
                onClick={toggleRepeat}
                className={`p-2 rounded-full transition-all duration-200 ${
                  repeatMode !== 'none' 
                    ? 'bg-echo-primary text-echo-white shadow-glow' 
                    : 'text-echo-primary hover:bg-echo-primary/20'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Repeat className="h-4 w-4" />
                {repeatMode === 'one' && (
                  <span className="text-xs absolute -top-1 -right-1 bg-echo-primary text-echo-white rounded-full w-3 h-3 flex items-center justify-center">
                    1
                  </span>
                )}
              </motion.button>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md flex items-center space-x-3">
              <span className="text-echo-text-secondary text-xs w-12 text-right">
                {formatTime(currentTime)}
              </span>
              
              <div 
                className="flex-1 h-2 bg-echo-gray rounded-full cursor-pointer relative group"
                onClick={handleSeek}
              >
                <div 
                  className="h-full bg-gradient-primary rounded-full relative"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                >
                  <div 
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-echo-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ 
                      left: `${(currentTime / duration) * 100}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                </div>
              </div>
              
              <span className="text-echo-text-secondary text-xs w-12">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
            {/* Favorite Button */}
            <motion.button
              className="p-2 text-echo-text-secondary hover:text-echo-primary transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className="h-5 w-5" />
            </motion.button>

            {/* Volume Control */}
            <div className="relative" ref={volumeSliderRef}>
              <motion.button
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                className="p-2 text-echo-primary hover:bg-echo-primary/20 rounded-full transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </motion.button>

              {showVolumeSlider && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute bottom-full right-0 mb-2 p-3 bg-gradient-secondary border border-echo-primary/20 rounded-lg shadow-xl"
                >
                  <div 
                    className="w-2 h-24 bg-echo-gray rounded-full cursor-pointer relative group"
                    onClick={handleVolumeChange}
                  >
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-primary rounded-full transition-all duration-200"
                      style={{ height: `${(isMuted ? 0 : volume) * 100}%` }}
                    />
                    <div 
                      className="absolute w-3 h-3 bg-echo-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ 
                        bottom: `${(isMuted ? 0 : volume) * 100}%`,
                        left: '50%',
                        transform: 'translateX(-50%)'
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onPlay={() => onPlayPause?.(true)}
        onPause={() => onPlayPause?.(false)}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onError={(e) => console.error('Audio error:', e)}
      />
    </motion.div>
  );
}
