import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Music, Clock, Search, Loader } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function UploadLibrary({ onTrackSelect, currentTrack, isPlaying, onPlayPause }) {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    filterSongs();
  }, [searchQuery, songs]);

  const fetchSongs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Map songs to match our expected format
      const songsWithUrls = data.map((song) => ({
        ...song,
        audioUrl: song.file_url,
        isUploaded: true,
        isSpotify: false,
        artist: song.artist || 'Unknown Artist',
        album: 'My Uploads',
        duration: 0
      }));

      setSongs(songsWithUrls);
    } catch (err) {
      console.error('Error fetching songs:', err);
      setError('Failed to load your music library');
    } finally {
      setIsLoading(false);
    }
  };

  const filterSongs = () => {
    if (!searchQuery.trim()) {
      setFilteredSongs(songs);
      return;
    }

    const filtered = songs.filter(song =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.album.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredSongs(filtered);
  };

  const handleTrackSelect = (song) => {
    onTrackSelect(song);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 md:py-20">
        <div className="text-center">
          <Loader className="h-10 w-10 md:h-12 md:w-12 text-echo-primary animate-spin mx-auto mb-3 md:mb-4" />
          <p className="text-echo-text-secondary text-sm md:text-base">Loading your music library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 md:py-20 px-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 md:p-6 max-w-md mx-auto">
          <p className="text-red-400 mb-3 md:mb-4 text-sm md:text-base">{error}</p>
          <button
            onClick={fetchSongs}
            className="bg-echo-primary text-echo-dark px-3 md:px-4 py-2 rounded-lg hover:bg-echo-accent transition-colors duration-200 text-sm md:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 md:mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-echo-text mb-2 md:mb-3">
          Your Music Library
        </h2>
        <p className="text-base md:text-lg text-echo-text-secondary">
          {songs.length} uploaded tracks
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 md:mb-8"
      >
        <div className="relative max-w-md mx-auto px-4">
          <Search className="absolute left-6 md:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-echo-text-secondary" />
          <input
            type="text"
            placeholder="Search your library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 md:pl-10 pr-4 py-3 rounded-lg bg-echo-gray border border-echo-primary/30 text-echo-text placeholder-echo-text-secondary focus:outline-none focus:ring-2 focus:ring-echo-primary focus:border-echo-primary transition-all duration-300 text-sm md:text-base"
          />
        </div>
      </motion.div>

      {/* Songs List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-4"
      >
        {filteredSongs.length === 0 ? (
          <div className="text-center py-12 md:py-20">
            <Music className="h-12 w-12 md:h-16 md:w-16 text-echo-primary/40 mx-auto mb-3 md:mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-echo-text mb-2">
              {searchQuery ? 'No songs found' : 'No songs yet'}
            </h3>
            <p className="text-echo-text-secondary text-sm md:text-base">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Upload your first song to get started!'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {filteredSongs.map((song, index) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-gradient-card border border-echo-primary/20 rounded-xl p-3 md:p-4 hover:shadow-soft transition-all duration-300 cursor-pointer ${
                  currentTrack?.id === song.id ? 'border-echo-primary/60 bg-echo-primary/5' : ''
                }`}
                onClick={() => handleTrackSelect(song)}
              >
                <div className="flex items-center space-x-3 md:space-x-4">
                  {/* Album Art */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                      <Music className="h-6 w-6 md:h-8 md:w-8 text-echo-white" />
                    </div>
                    
                    {/* Play/Pause Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity duration-300">
                      {currentTrack?.id === song.id && isPlaying ? (
                        <Pause className="h-4 w-4 md:h-6 md:w-6 text-white" />
                      ) : (
                        <Play className="h-4 w-4 md:h-6 md:w-6 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-semibold text-echo-text truncate">
                      {song.title}
                    </h3>
                    <p className="text-sm md:text-base text-echo-text-secondary truncate">
                      {song.artist}
                    </p>
                    <p className="text-xs md:text-sm text-echo-text-secondary/70 truncate">
                      {song.album}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center space-x-3 md:space-x-6 text-echo-text-secondary text-xs md:text-sm flex-shrink-0">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 md:h-4 md:w-4" />
                      <span>{formatDuration(song.duration)}</span>
                    </div>
                    {song.file_size && (
                      <span className="hidden sm:inline">{formatFileSize(song.file_size)}</span>
                    )}
                  </div>

                  {/* Play Button */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (currentTrack?.id === song.id) {
                          onPlayPause?.();
                        } else {
                          handleTrackSelect(song);
                        }
                      }}
                      className="bg-gradient-button text-echo-white p-2 md:p-3 rounded-full shadow-glow hover:shadow-soft transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {currentTrack?.id === song.id && isPlaying ? (
                        <Pause className="h-4 w-4 md:h-5 md:w-5" />
                      ) : (
                        <Play className="h-4 w-4 md:h-5 md:w-5 ml-0.5" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
