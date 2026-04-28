'use client';

import { useState, useEffect } from 'react';
import { Download, X, Search, ChevronDown, Loader2 } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Debounce fetching info
  useEffect(() => {
    const fetchInfo = async () => {
      if (!url || (!url.includes('youtube.com/') && !url.includes('youtu.be/'))) {
        setVideoInfo(null);
        setError('');
        return;
      }

      setIsLoading(true);
      setError('');
      setVideoInfo(null);

      try {
        const res = await fetch('/api/info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch');
        }

        setVideoInfo(data);
        
        if (data.videoFormats && data.videoFormats.length > 0) {
          setSelectedFormat(data.videoFormats[0].format_id);
        } else if (data.audioFormats && data.audioFormats.length > 0) {
          setSelectedFormat(data.audioFormats[0].format_id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchInfo();
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [url]);

  const handleClear = () => {
    setUrl('');
    setVideoInfo(null);
    setError('');
  };

  const handleDownload = () => {
    if (!url || !selectedFormat || !videoInfo || isDownloading) return;
    
    setIsDownloading(true);

    const format = [...(videoInfo.videoFormats || []), ...(videoInfo.audioFormats || [])]
      .find(f => f.format_id === selectedFormat);
      
    if (!format) {
      setIsDownloading(false);
      return;
    }

    const ext = format.ext;
    const title = videoInfo.title;
    const downloadId = Date.now().toString();

    const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&format_id=${selectedFormat}&ext=${ext}&title=${encodeURIComponent(title)}&downloadId=${downloadId}`;
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Poll for the cookie to know when the download starts streaming
    const checkInterval = setInterval(() => {
      if (document.cookie.includes(`download_token_${downloadId}=true`)) {
        setIsDownloading(false);
        clearInterval(checkInterval);
        // Clear the cookie
        document.cookie = `download_token_${downloadId}=; Max-Age=0; Path=/`;
      }
    }, 1000);
    
    // Safety timeout to stop spinning after 1 hour (just in case)
    setTimeout(() => {
      setIsDownloading(false);
      clearInterval(checkInterval);
    }, 3600000);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container">
      <h1 className="title">YouTube Downloader</h1>
      
      <div className="glass-card">
        <div className="input-wrapper">
          <input
            type="text"
            className="url-input"
            placeholder="Paste YouTube Link here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          {url && (
            <button className="clear-btn" onClick={handleClear}>
              <X size={18} /> Clear
            </button>
          )}
        </div>

        {error && (
          <div style={{ color: 'var(--danger)', fontSize: '0.9rem', padding: '0.5rem 1rem', background: '#fee2e2', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        {isLoading && (
          <div className="loading-wrapper">
            <Loader2 className="spinner" size={24} />
            <span>Fetching video formats...</span>
          </div>
        )}

        {videoInfo && !isLoading && (
          <>
            <div className="action-row">
              <div className="format-select-wrapper">
                <select 
                  className="format-select"
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                >
                  <optgroup label="Video">
                    {videoInfo.videoFormats.map((format) => (
                      <option key={format.format_id} value={format.format_id}>
                        {format.ext.toUpperCase()} {format.resolution !== 'audio only' ? `(${format.resolution})` : ''} - {formatFileSize(format.filesize)}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Audio">
                    {videoInfo.audioFormats.map((format) => (
                      <option key={format.format_id} value={format.format_id}>
                        {format.ext.toUpperCase()} Audio - {formatFileSize(format.filesize)}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="select-icon" size={20} />
              </div>

              <button 
                className="download-btn" 
                onClick={handleDownload}
                disabled={!selectedFormat || isDownloading}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    PROCESSING...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    DOWNLOAD
                  </>
                )}
              </button>
            </div>

            <div className="video-info">
              {videoInfo.thumbnail && (
                <img src={videoInfo.thumbnail} alt="Thumbnail" className="thumbnail" />
              )}
              <div className="info-text">
                <div className="video-title" title={videoInfo.title}>{videoInfo.title}</div>
                <div className="video-meta">
                  {isDownloading 
                    ? "Memproses video di server... Harap tunggu (jangan tutup halaman)." 
                    : "Ready to download. Please select your preferred format."}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
