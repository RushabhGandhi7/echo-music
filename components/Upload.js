import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload as UploadIcon, Music, CheckCircle, AlertCircle, Cloud } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Upload({ onUpload }) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file.type.includes('audio/')) {
      setUploadStatus('error');
      setUploadMessage('Please select an audio file');
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);
    setUploadMessage('Starting upload...');

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `songs/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('music')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('music')
        .getPublicUrl(filePath);

      // Extract metadata from filename
      const title = file.name.replace('.mp3', '').replace(/[-_]/g, ' ');
      const artist = 'Unknown Artist';
      const album = 'My Uploads';

      // Create database record
      const { data: songData, error: dbError } = await supabase
        .from('songs')
        .insert([
          {
            title,
            artist,
            album,
            duration: 0,
            file_path: filePath,
            file_size: file.size,
            url: publicUrl
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadProgress(100);
      setUploadStatus('success');
      setUploadMessage('Upload complete! Song added to library.');

      // Reset after delay
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
        setUploadMessage('');
      }, 3000);

      onUpload();

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadMessage(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-echo-text mb-3">
          Upload Your Music
        </h2>
        <p className="text-lg text-echo-text-secondary">
          Share your favorite tracks with the world
        </p>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            dragActive 
              ? 'border-echo-primary bg-echo-primary/10' 
              : 'border-echo-primary/30 hover:border-echo-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <motion.div
            animate={{ y: dragActive ? -5 : 0 }}
            className="mb-6"
          >
            <Cloud className="h-20 w-20 text-echo-primary mx-auto mb-4" />
          </motion.div>
          
          <h3 className="text-2xl font-semibold text-echo-text mb-2">
            Drop your MP3 files here
          </h3>
          <p className="text-echo-text-secondary mb-8 text-lg">
            or click to browse your computer
          </p>
          
          <button
            onClick={openFileDialog}
            disabled={isUploading}
            className="bg-gradient-button text-echo-white px-8 py-4 rounded-xl font-semibold hover:shadow-glow transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UploadIcon className="h-5 w-5 inline mr-2" />
            Choose Files
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      </motion.div>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploadStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-gradient-card border border-echo-primary/20 rounded-xl p-6 shadow-soft">
              <div className="flex items-center space-x-3 mb-4">
                {uploadStatus === 'success' && (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
                {uploadStatus === 'error' && (
                  <AlertCircle className="h-6 w-6 text-red-500" />
                )}
                {uploadStatus === 'uploading' && (
                  <div className="h-6 w-6 border-2 border-echo-primary border-t-transparent rounded-full animate-spin" />
                )}
                <span className="text-echo-text font-medium">
                  {uploadMessage}
                </span>
              </div>
              
              {uploadStatus === 'uploading' && (
                <div className="w-full bg-echo-gray rounded-full h-3 mb-2">
                  <motion.div 
                    className="bg-gradient-primary h-3 rounded-full transition-all duration-300"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
              
              {uploadStatus === 'success' && (
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-echo-text-secondary">
                    Your song has been uploaded successfully!
                  </p>
                </div>
              )}
              
              {uploadStatus === 'error' && (
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                  <p className="text-echo-text-secondary">
                    {uploadMessage}
                  </p>
                  <button
                    onClick={() => setUploadStatus('idle')}
                    className="bg-echo-primary text-echo-white px-6 py-2 rounded-lg mt-4 hover:bg-echo-accent transition-colors duration-200"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
      >
        <div className="bg-gradient-card border border-echo-primary/20 rounded-xl p-6 text-center hover:shadow-soft transition-all duration-300">
          <Music className="h-12 w-12 text-echo-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-echo-text mb-2">
            High Quality
          </h3>
          <p className="text-echo-text-secondary">
            Upload MP3 files and stream them in high quality
          </p>
        </div>
        
        <div className="bg-gradient-card border border-echo-primary/20 rounded-xl p-6 text-center hover:shadow-soft transition-all duration-300">
          <Cloud className="h-12 w-12 text-echo-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-echo-text mb-2">
            Cloud Storage
          </h3>
          <p className="text-echo-text-secondary">
            Your music is safely stored in the cloud
          </p>
        </div>
        
        <div className="bg-gradient-card border border-echo-primary/20 rounded-xl p-6 text-center hover:shadow-soft transition-all duration-300">
          <UploadIcon className="h-12 w-12 text-echo-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-echo-text mb-2">
            Easy Upload
          </h3>
          <p className="text-echo-text-secondary">
            Drag and drop or click to upload your files
          </p>
        </div>
      </motion.div>
    </div>
  );
}
