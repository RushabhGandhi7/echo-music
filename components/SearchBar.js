import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, Pause, Music, Music2, Loader } from 'lucide-react';

export default function SearchBar({ onTrackSelect, currentTrack, isPlaying, onPlayPause }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    // Clear timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, redirect to login
          window.location.href = '/api/auth/login';
          return;
        }
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.tracks?.items || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(value);
      }, 500);
    } else {
      setResults([]);
      setHasSearched(false);
    }
  };

  const handleTrackSelect = (track) => {
    onTrackSelect(track);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-echo-text mb-3">
          Search Spotify
        </h2>
        <p className="text-lg text-echo-text-secondary">
          Discover millions of tracks from around the world
        </p>
      </motion.div>

      {/* Search Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-echo-text-secondary" />
          <input
            type="text"
            placeholder="Search for songs, artists, or albums..."
            value={query}
            onChange={handleInputChange}
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-echo-gray border border-echo-primary/30 text-echo-text placeholder-echo-text-secondary focus:outline-none focus:ring-2 focus:ring-echo-primary focus:border-echo-primary transition-all duration-300 text-lg"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Loader className="h-6 w-6 text-echo-primary animate-spin" />
            </div>
          )}
        </div>
      </motion.div>

      {/* Search Results */}
      <AnimatePresence>
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            {results.length === 0 && !isSearching ? (
              <div className="text-center py-12">
                <Music className="h-16 w-16 text-echo-primary/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-echo-text mb-2">
                  No tracks found
                </h3>
                <p className="text-echo-text-secondary">
                  Try adjusting your search terms
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {results.map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-gradient-card border border-echo-primary/20 rounded-xl p-4 hover:shadow-soft transition-all duration-300 cursor-pointer ${
                      currentTrack?.id === track.id ? 'border-echo-primary/60 bg-echo-primary/5' : ''
                    }`}
                    onClick={() => handleTrackSelect(track)}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Album Art */}
                      <div className="relative">
                        {track.album?.images?.[0]?.url ? (
                          <img
                            src={track.album.images[0].url}
                            alt={track.album.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <Music2 className="h-8 w-8 text-echo-white" />
                          </div>
                        )}
                        
                        {/* Play/Pause Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity duration-300">
                          {currentTrack?.id === track.id && isPlaying ? (
                            <Pause className="h-6 w-6 text-white" />
                          ) : (
                            <Play className="h-6 w-6 text-white" />
                          )}
                        </div>
                      </div>

                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-echo-text truncate">
                          {track.name}
                        </h3>
                        <p className="text-echo-text-secondary truncate">
                          {track.artists?.map(a => a.name).join(', ')}
                        </p>
                        <p className="text-echo-text-secondary/70 text-sm truncate">
                          {track.album?.name}
                        </p>
                      </div>

                      {/* Duration */}
                      <div className="text-echo-text-secondary text-sm">
                        {formatDuration(track.duration_ms / 1000)}
                      </div>

                      {/* Play Button */}
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentTrack?.id === track.id) {
                              onPlayPause?.();
                            } else {
                              handleTrackSelect(track);
                            }
                          }}
                          className="bg-gradient-button text-echo-white p-3 rounded-full shadow-glow hover:shadow-soft transition-all duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {currentTrack?.id === track.id && isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5 ml-0.5" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
