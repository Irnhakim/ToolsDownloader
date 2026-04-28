'use client';

import { useState, useEffect } from 'react';
import { Download, X, ChevronDown, Loader2, Video, Tv, Camera, Music, Wrench, Menu, QrCode, ImageUp, Copy, Check } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('youtube');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSocialGroupOpen, setIsSocialGroupOpen] = useState(true);
  const [isGeneratorGroupOpen, setIsGeneratorGroupOpen] = useState(true);
  
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');

  // QR Code States
  const [qrText, setQrText] = useState('');
  const [qrLogo, setQrLogo] = useState(null);
  const [isQrGenerated, setIsQrGenerated] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');

  // Sinkronisasi tab dengan URL Hash agar bertahan saat di-refresh
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (['youtube', 'facebook', 'instagram', 'tiktok', 'qrcode'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);
  const [isDownloading, setIsDownloading] = useState(false);

  // Reset state when switching tabs
  useEffect(() => {
    setUrl('');
    setVideoInfo(null);
    setError('');
    setSelectedFormat('');
    setIsDownloading(false);
  }, [activeTab]);

  // Debounce fetching info
  useEffect(() => {
    const fetchInfo = async () => {
      // Basic validation based on active tab
      if (!url) {
        setVideoInfo(null);
        setError('');
        return;
      }
      
      // Jangan lakukan request ke backend jika berada di halaman QR Code
      if (activeTab === 'qrcode') {
        return;
      }
      
      const isYtLink = url.includes('youtube.com/') || url.includes('youtu.be/');
      const isFbLink = url.includes('facebook.com/') || url.includes('fb.watch/');
      const isIgLink = url.includes('instagram.com/');
      const isTkLink = url.includes('tiktok.com/');
      
      if (activeTab === 'youtube' && !isYtLink) {
        setVideoInfo(null);
        return; 
      }
      
      if (activeTab === 'facebook' && !isFbLink) {
        setVideoInfo(null);
        return; 
      }
      
      if (activeTab === 'instagram' && !isIgLink) {
        setVideoInfo(null);
        return; 
      }
      
      if (activeTab === 'tiktok' && !isTkLink) {
        setVideoInfo(null);
        return; 
      }

      setIsLoading(true);
      setError('');
      setVideoInfo(null);

      try {
        const res = await fetch('/api/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
  }, [url, activeTab]);

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
    
    // Tentukan apakah format yang dipilih adalah video atau audio
    const isVideo = videoInfo.videoFormats?.some(f => f.format_id === selectedFormat);
    const type = isVideo ? 'video' : 'audio';

    const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&format_id=${selectedFormat}&ext=${ext}&title=${encodeURIComponent(title)}&downloadId=${downloadId}&type=${type}`;
    
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
        document.cookie = `download_token_${downloadId}=; Max-Age=0; Path=/`;
      }
    }, 1000);
    
    // Safety timeout
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

  // --- QR Code Handlers ---
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setQrLogo(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'QR_Code.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const copyQR = async () => {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopySuccess('QR Code copied to clipboard!');
        setTimeout(() => setCopySuccess(''), 3000);
      } catch (err) {
        console.error('Copy failed:', err);
        setCopySuccess('Failed: Browser does not support this feature.');
        setTimeout(() => setCopySuccess(''), 3000);
      }
    });
  };

  const getPageConfig = () => {
    if (activeTab === 'youtube') {
      return {
        title: 'YouTube Downloader',
        placeholder: 'Paste YouTube Link here...',
        icon: <Video size={32} />
      };
    }
    if (activeTab === 'instagram') {
      return {
        title: 'Instagram Downloader',
        placeholder: 'Paste Instagram Reel/Video Link here...',
        icon: <Camera size={32} />
      };
    }
    if (activeTab === 'tiktok') {
      return {
        title: 'TikTok Downloader',
        placeholder: 'Paste TikTok Video Link here...',
        icon: <Music size={32} />
      };
    }
    if (activeTab === 'qrcode') {
      return {
        title: 'QR Code Generator',
        placeholder: 'Enter Text or URL to generate QR...',
        icon: <QrCode size={32} />
      };
    }
    return {
      title: 'Facebook Downloader',
      placeholder: 'Paste Facebook Video Link here...',
      icon: <Tv size={32} />
    };
  };

  const pageConfig = getPageConfig();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.location.hash = tab; 
  };

  return (
    <div className={`app-wrapper ${activeTab}`}>
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">
            <Wrench size={24} /> Tools
          </div>
          <button className="mobile-close-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <div className="nav-group">
          <div className="nav-group-title" onClick={() => setIsSocialGroupOpen(!isSocialGroupOpen)}>
            <span>Social Downloader</span>
            <ChevronDown size={16} style={{ transform: isSocialGroupOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
          </div>
          
          <div className={`nav-group-content ${isSocialGroupOpen ? 'open' : ''}`}>
            <button className={`nav-item youtube-btn ${activeTab === 'youtube' ? 'active' : ''}`} onClick={() => handleTabChange('youtube')}><Video size={20} /> YT Downloader</button>
            <button className={`nav-item facebook-btn ${activeTab === 'facebook' ? 'active' : ''}`} onClick={() => handleTabChange('facebook')}><Tv size={20} /> FB Downloader</button>
            <button className={`nav-item instagram-btn ${activeTab === 'instagram' ? 'active' : ''}`} onClick={() => handleTabChange('instagram')}><Camera size={20} /> IG Downloader</button>
            <button className={`nav-item tiktok-btn ${activeTab === 'tiktok' ? 'active' : ''}`} onClick={() => handleTabChange('tiktok')}><Music size={20} /> TikTok Downloader</button>
          </div>
        </div>

        <div className="nav-group">
          <div className="nav-group-title" onClick={() => setIsGeneratorGroupOpen(!isGeneratorGroupOpen)}>
            <span>Generators</span>
            <ChevronDown size={16} style={{ transform: isGeneratorGroupOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
          </div>
          
          <div className={`nav-group-content ${isGeneratorGroupOpen ? 'open' : ''}`}>
            <button className={`nav-item qrcode-btn ${activeTab === 'qrcode' ? 'active' : ''}`} onClick={() => handleTabChange('qrcode')}><QrCode size={20} /> QR Code Generator</button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="container">
          <div className="header-row">
            <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={28} />
            </button>
            <h1 className="title">
              {pageConfig.icon} {pageConfig.title}
            </h1>
          </div>
          
          <div className="glass-card">
            <div className="input-wrapper">
              <input
                type="text"
                className="url-input"
                placeholder={pageConfig.placeholder}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (activeTab === 'qrcode') {
                      if (!url.trim()) return;
                      setQrText(url);
                      setIsQrGenerated(true);
                    } else {
                      handleFetchInfo();
                    }
                  }
                }}
              />
              {url && (
                <button 
                  className="clear-btn"
                  onClick={() => {
                    setUrl('');
                    if (activeTab === 'qrcode') {
                      setQrText('');
                      setIsQrGenerated(false);
                    } else {
                      setVideoInfo(null);
                      setError('');
                    }
                  }}
                >
                  <X size={18} />
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
                <span>Fetching data...</span>
              </div>
            )}

            {activeTab === 'qrcode' ? (
              <div className="qrcode-container">
                <div className="file-upload-wrapper">
                  <label className="file-upload-label">
                    <ImageUp size={20} />
                    {qrLogo ? 'Change Logo / Center Image' : 'Upload Logo (Optional)'}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                  </label>
                  {qrLogo && (
                    <button className="clear-btn" onClick={() => setQrLogo(null)} style={{ justifyContent: 'center' }}>
                      <X size={16} /> Remove Logo
                    </button>
                  )}
                </div>

                <button 
                  className="download-btn" 
                  onClick={() => {
                    if (!url.trim()) return alert('Text cannot be empty');
                    setQrText(url);
                    setIsQrGenerated(true);
                  }}
                  disabled={!url}
                  style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}
                >
                  <QrCode size={20} />
                  Generate QR Code
                </button>

                {isQrGenerated && qrText && (
                  <div className="qr-preview">
                    <div className="qr-canvas-wrapper">
                      <QRCodeCanvas
                        id="qr-canvas"
                        value={qrText}
                        size={256}
                        level="H"
                        includeMargin={true}
                        imageSettings={
                          qrLogo ? {
                            src: qrLogo,
                            height: 64,
                            width: 64,
                            excavate: true,
                          } : undefined
                        }
                      />
                    </div>
                    
                    <div className="qr-actions">
                      <button className="qr-action-btn qr-copy-btn" onClick={copyQR}>
                        <Copy size={18} /> Copy
                      </button>
                      <button className="qr-action-btn qr-download-btn" onClick={downloadQR}>
                        <Download size={18} /> Download
                      </button>
                    </div>
                    {copySuccess && (
                      <div className="copy-success-msg">
                        <Check size={16} /> {copySuccess}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              videoInfo && !isLoading && (
                <>
                  <div className="action-row">
                    <div className="format-select-wrapper">
                      <select 
                        className="format-select"
                        value={selectedFormat}
                        onChange={(e) => setSelectedFormat(e.target.value)}
                      >
                        {videoInfo.videoFormats && videoInfo.videoFormats.length > 0 && (
                          <optgroup label="Video">
                            {videoInfo.videoFormats.map((format) => (
                              <option key={format.format_id} value={format.format_id}>
                                {format.ext.toUpperCase()} {format.resolution !== 'audio only' ? `(${format.resolution})` : ''} - {formatFileSize(format.filesize)}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        
                        {videoInfo.audioFormats && videoInfo.audioFormats.length > 0 && (
                          <optgroup label="Audio">
                            {videoInfo.audioFormats.map((format) => (
                              <option key={format.format_id} value={format.format_id}>
                                {format.ext.toUpperCase()} Audio - {formatFileSize(format.filesize)}
                              </option>
                            ))}
                          </optgroup>
                        )}
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
                    {videoInfo.thumbnail ? (
                      <img src={videoInfo.thumbnail} alt="Thumbnail" className="thumbnail" />
                    ) : (
                      <div className="thumbnail" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No Thumb</span>
                      </div>
                    )}
                    <div className="info-text">
                      <div className="video-title" title={videoInfo.title}>{videoInfo.title}</div>
                      <div className="video-meta">
                        {isDownloading 
                          ? "Processing video on server... Please wait (do not close this page)." 
                          : "Ready to download. Please select your preferred format."}
                      </div>
                    </div>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
