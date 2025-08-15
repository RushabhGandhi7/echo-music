import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, Pause, Heart, Clock, Music, Filter, Shuffle, Spotify } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { spotifyService } from '../lib/spotifyService';

export default function SongList({ onPlay, reload, currentSong }) {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedArtist, setSelectedArtist] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [artists, setArtists] = useState([]);
  const [searchSource, setSearchSource] = useState('all'); // 'all', 'uploaded', 'spotify'
  const [spotifyResults, setSpotifyResults] = useState([]);
  const [isSearchingSpotify, setIsSearchingSpotify] = useState(false);

  useEffect(() => {
    fetchSongs();
  }, [reload]);

  useEffect(() => {
    filterSongs();
  }, [searchQuery, selectedGenre, selectedArtist, songs, spotifyResults, searchSource]);

  const fetchSongs = async () => {
    try {
      setIsLoading(true);
      
      // Fetch songs from Supabase
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      // Get public URLs for audio files
      const songsWithUrls = await Promise.all(
        data.map(async (song) => {
          const { data: { publicUrl } } = supabase.storage
            .from('music')
            .getPublicUrl(song.file_path);

          return {
            ...song,
            audioUrl: publicUrl,
            isUploaded: true,
            isSpotify: false
          };
        })
      );

      setSongs(songsWithUrls);
      
      // Extract unique genres and artists
      const uniqueGenres = [...new Set(songsWithUrls.map(song => song.genre))];
      const uniqueArtists = [...new Set(songsWithUrls.map(song => song.artist))];
      
      setGenres(uniqueGenres);
      setArtists(uniqueArtists);

    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchSpotify = async (query) => {
    if (!query.trim() || !spotifyService.isAuthenticated()) return;
    
    setIsSearchingSpotify(true);
    try {
      const results = await spotifyService.searchTracks(query);
      setSpotifyResults(results);
    } catch (error) {
      console.error('Spotify search error:', error);
      setSpotifyResults([]);
    } finally {
      setIsSearchingSpotify(false);
    }
  };

  const filterSongs = () => {
    let filtered = [];

    // Add uploaded songs
    if (searchSource === 'all' || searchSource === 'uploaded') {
      filtered.push(...songs);
    }

    // Add Spotify results
    if (searchSource === 'all' || searchSource === 'spotify') {
      filtered.push(...spotifyResults);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.album.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by genre
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(song => song.genre === selectedGenre);
    }

    // Filter by artist
    if (selectedArtist !== 'all') {
      filtered = filtered.filter(song => song.artist === selectedArtist);
    }

    setFilteredSongs(filtered);
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

  const handlePlayAll = () => {
    if (filteredSongs.length > 0) {
      onPlay(filteredSongs[0], filteredSongs);
    }
  };

  const handleSpotifyAuth = () => {
    window.location.href = spotifyService.getAuthUrl();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-echo-primary mx-auto mb-4"></div>
          <p className="text-echo-text-secondary">Loading your music library...</p>
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
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-echo-text mb-2">
              Music Library
            </h1>
            <p className="text-echo-text-secondary">
              {filteredSongs.length} songs in your collection
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {!spotifyService.isAuthenticated() && (
              <button
                onClick={handleSpotifyAuth}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <Spotify className="h-5 w-5" />
                <span>Connect Spotify</span>
              </button>
            )}
            
            {filteredSongs.length > 0 && (
              <button
                onClick={handlePlayAll}
                className="bg-gradient-button text-echo-white px-6 py-2 rounded-lg font-medium hover:shadow-glow transition-all duration-200 flex items-center space-x-2"
              >
                <Shuffle className="h-5 w-5" />
                <span>Play All</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-echo-text-secondary" />
              <input
                type="text"
                placeholder="Search songs, artists, or albums..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim() && spotifyService.isAuthenticated()) {
                    searchSpotify(e.target.value);
                  }
                }}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-echo-white border border-echo-primary/30 text-echo-text placeholder-echo-text-secondary focus:outline-none focus:ring-2 focus:ring-echo-primary focus:border-echo-primary transition-all duration-300"
              />
            </div>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={searchSource}
              onChange={(e) => setSearchSource(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-echo-white border border-echo-primary/30 text-echo-text focus:outline-none focus:ring-2 focus:ring-echo-primary focus:border-echo-primary transition-all duration-300"
            >
              <option value="all">All Sources</option>
              <option value="uploaded">Uploaded</option>
              <option value="spotify">Spotify</option>
            </select>
          </div>

          {/* Genre Filter */}
          <div>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-echo-white border border-echo-primary/30 text-echo-text focus:outline-none focus:ring-2 focus:ring-echo-primary focus:border-echo-primary transition-all duration-300"
            >
              <option value="all">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          {/* Artist Filter */}
          <div>
            <select
              value={selectedArtist}
              onChange={(e) => setSelectedArtist(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-echo-white border border-echo-primary/30 text-echo-text focus:outline-none focus:ring-2 focus:ring-echo-primary focus:border-echo-primary transition-all duration-300"
            >
              <option value="all">All Artists</option>
              {artists.map(artist => (
                <option key={artist} value={artist}>{artist}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Songs List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {filteredSongs.length === 0 ? (
          <div className="text-center py-20">
            <Music className="h-16 w-16 text-echo-primary/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-echo-text mb-2">
              {searchQuery || selectedGenre !== 'all' || selectedArtist !== 'all' 
                ? 'No songs found' 
                : 'No songs yet'
              }
            </h3>
            <p className="text-echo-text-secondary">
              {searchQuery || selectedGenre !== 'all' || selectedArtist !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Upload your first song or connect Spotify to get started!'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSongs.map((song, index) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-gradient-card border border-echo-primary/20 rounded-xl p-4 hover:shadow-soft transition-all duration-300 cursor-pointer ${
                  currentSong?.id === song.id ? 'border-echo-primary/60 bg-echo-primary/5' : ''
                }`}
                onClick={() => onPlay(song)}
              >
                <div className="flex items-center space-x-4">
                  {/* Album Art */}
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center">
                      {song.isSpotify ? (
                        <Spotify className="h-8 w-8 text-white" />
                      ) : (
                        <Music className="h-8 w-8 text-echo-white" />
                      )}
                    </div>
                    
                    {/* Play/Pause Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity duration-300">
                      {currentSong?.id === song.id ? (
                        <Pause className="h-6 w-6 text-white" />
                      ) : (
                        <Play className="h-6 w-6 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-echo-text truncate">
                      {song.title}
                    </h3>
                    <p className="text-echo-text-secondary truncate">
                      {song.artist}
                    </p>
                    <p className="text-echo-text-secondary/70 text-sm truncate">
                      {song.album} • {song.genre}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center space-x-6 text-echo-text-secondary text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(song.duration)}</span>
                    </div>
                    {song.fileSize && (
                      <span>{formatFileSize(song.fileSize)}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle favorite
                      }}
                      className="p-2 text-echo-text-secondary hover:text-echo-primary transition-colors duration-200"
                    >
                      <Heart className="h-5 w-5" />
                    </button>
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
