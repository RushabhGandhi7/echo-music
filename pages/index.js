import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Music2, Upload as UploadIcon, Play, Pause, Menu, X } from 'lucide-react';
import { SpotifyProvider, useSpotify } from '../contexts/SpotifyContext';
import SearchBar from '../components/SearchBar';
import Upload from '../components/Upload';
import UploadLibrary from '../components/UploadLibrary';
import PlayerBar from '../components/PlayerBar';

function HomeContent() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSection, setActiveSection] = useState('search'); // 'search', 'upload', 'library'
  const [uploadReload, setUploadReload] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { 
    isAuthenticated, 
    login, 
    logout, 
    currentTrack: spotifyTrack, 
    isPlaying: spotifyIsPlaying,
    togglePlayPause,
    skipToNext,
    skipToPrevious
  } = useSpotify();

  useEffect(() => {
    // Update local state when Spotify context changes
    if (spotifyTrack) {
      setCurrentTrack({
        ...spotifyTrack,
        isSpotify: true,
        title: spotifyTrack.name,
        artist: spotifyTrack.artists?.map(a => a.name).join(', '),
        album: spotifyTrack.album?.name,
        albumArt: spotifyTrack.album?.images?.[0]?.url
      });
    }
    setIsPlaying(spotifyIsPlaying);
  }, [spotifyTrack, spotifyIsPlaying]);

  const handleTrackSelect = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handlePlayPause = (playing) => {
    if (currentTrack?.isSpotify) {
      togglePlayPause();
    } else {
      setIsPlaying(playing);
    }
  };

  const handleNext = () => {
    if (currentTrack?.isSpotify) {
      skipToNext();
    } else {
      // TODO: Implement queue management for uploaded tracks
      console.log('Next track');
    }
  };

  const handlePrevious = () => {
    if (currentTrack?.isSpotify) {
      skipToPrevious();
    } else {
      // TODO: Implement queue management for uploaded tracks
      console.log('Previous track');
    }
  };

  const handleUploadSuccess = () => {
    setUploadReload(!uploadReload);
  };

  const handleSpotifyConnect = () => {
    login();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero text-echo-text">
      {/* Navigation */}
      <nav className="bg-echo-dark border-b border-echo-primary/20 shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Music className="h-6 w-6 text-echo-white" />
              </div>
              <h1 className="text-2xl font-bold text-echo-primary">Echo</h1>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {!isAuthenticated ? (
                <motion.button
                  onClick={handleSpotifyConnect}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Music2 className="h-5 w-5" />
                  <span>Connect Spotify</span>
                </motion.button>
              ) : (
                <motion.button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Music2 className="h-5 w-5" />
                  <span>Disconnect</span>
                </motion.button>
              )}

              <div className="flex space-x-1 bg-echo-gray rounded-lg p-1">
                <button
                  onClick={() => setActiveSection('search')}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeSection === 'search'
                      ? 'bg-echo-primary text-echo-dark shadow-glow'
                      : 'text-echo-text-secondary hover:text-echo-text'
                  }`}
                >
                  <Music2 className="h-4 w-4" />
                  <span>Search</span>
                </button>
                
                <button
                  onClick={() => setActiveSection('upload')}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeSection === 'upload'
                      ? 'bg-echo-primary text-echo-dark shadow-glow'
                      : 'text-echo-text-secondary hover:text-echo-text'
                  }`}
                >
                  <UploadIcon className="h-4 w-4" />
                  <span>Upload</span>
                </button>
                
                <button
                  onClick={() => setActiveSection('library')}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeSection === 'library'
                      ? 'bg-echo-primary text-echo-dark shadow-glow'
                      : 'text-echo-text-secondary hover:text-echo-text'
                  }`}
                >
                  <Music className="h-4 w-4" />
                  <span>Library</span>
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-echo-text hover:text-echo-primary transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 bg-echo-gray rounded-lg p-4 space-y-3"
              >
                {!isAuthenticated ? (
                  <motion.button
                    onClick={handleSpotifyConnect}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Music2 className="h-5 w-5" />
                    <span>Connect Spotify</span>
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={logout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Music2 className="h-5 w-5" />
                    <span>Disconnect Spotify</span>
                  </motion.button>
                )}

                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleSectionChange('search')}
                    className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-3 ${
                      activeSection === 'search'
                        ? 'bg-echo-primary text-echo-dark shadow-glow'
                        : 'text-echo-text-secondary hover:text-echo-text hover:bg-echo-primary/20'
                    }`}
                  >
                    <Music2 className="h-5 w-5" />
                    <span>Search</span>
                  </button>
                  
                  <button
                    onClick={() => handleSectionChange('upload')}
                    className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-3 ${
                      activeSection === 'upload'
                        ? 'bg-echo-primary text-echo-dark shadow-glow'
                        : 'text-echo-text-secondary hover:text-echo-text hover:bg-echo-primary/20'
                    }`}
                  >
                    <UploadIcon className="h-5 w-5" />
                    <span>Upload</span>
                  </button>
                  
                  <button
                    onClick={() => handleSectionChange('library')}
                    className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-3 ${
                      activeSection === 'library'
                        ? 'bg-echo-primary text-echo-dark shadow-glow'
                        : 'text-echo-text-secondary hover:text-echo-text hover:bg-echo-primary/20'
                    }`}
                  >
                    <Music className="h-5 w-5" />
                    <span>Library</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-32 md:py-8">
        <AnimatePresence mode="wait">
          {activeSection === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {!isAuthenticated ? (
                <div className="text-center py-12 md:py-20">
                  <Music2 className="h-16 w-16 md:h-24 md:w-24 text-echo-primary/40 mx-auto mb-4 md:mb-6" />
                  <h2 className="text-2xl md:text-3xl font-bold text-echo-text mb-3 md:mb-4">
                    Connect with Spotify
                  </h2>
                  <p className="text-base md:text-lg text-echo-text-secondary mb-6 md:mb-8 max-w-2xl mx-auto px-4">
                    Connect your Spotify account to search and play millions of tracks from around the world. 
                    You'll need a Spotify Premium account for playback.
                  </p>
                  <motion.button
                    onClick={handleSpotifyConnect}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-200 flex items-center space-x-3 mx-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Music2 className="h-5 w-5 md:h-6 md:w-6" />
                    <span>Connect Spotify Account</span>
                  </motion.button>
                </div>
              ) : (
                <SearchBar
                  onTrackSelect={handleTrackSelect}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayPause={handlePlayPause}
                />
              )}
            </motion.div>
          )}

          {activeSection === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Upload onUpload={handleUploadSuccess} />
            </motion.div>
          )}

          {activeSection === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <UploadLibrary
                onTrackSelect={handleTrackSelect}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                reload={uploadReload}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Player Bar */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </div>
  );
}

export default function Home() {
  return (
    <SpotifyProvider>
      <HomeContent />
    </SpotifyProvider>
  );
}
