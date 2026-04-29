'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, X, ChevronDown, Loader2, Video, Tv, Camera, Music, Wrench, Menu, QrCode, ImageUp, Copy, Check, Settings2, Maximize2, FileText, FileImage, Link2, Clock, Shield, Upload } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

export default function Home() {
  const [activeTab, setActiveTab] = useState('youtube');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSocialGroupOpen, setIsSocialGroupOpen] = useState(false);
  const [isGeneratorGroupOpen, setIsGeneratorGroupOpen] = useState(false);
  const [isImageGroupOpen, setIsImageGroupOpen] = useState(false);

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

  // Advanced QR Settings
  const [qrColorType, setQrColorType] = useState('solid'); // 'solid' or 'gradient'
  const [qrColor1, setQrColor1] = useState('#000000');
  const [qrColor2, setQrColor2] = useState('#10b981');
  const [qrDotStyle, setQrDotStyle] = useState('square'); // square, dots, rounded, classy
  const [qrErrorCorrection, setQrErrorCorrection] = useState('Q'); // L, M, Q, H
  const [qrFrameText, setQrFrameText] = useState(''); // empty = no frame

  const qrRef = useRef(null);
  const frameRef = useRef(null);
  const [qrCodeInstance, setQrCodeInstance] = useState(null);

  // Image & PDF Tools States
  const [toolsFile, setToolsFile] = useState(null);
  const [toolsFiles, setToolsFiles] = useState([]);
  const [imgQuality, setImgQuality] = useState(80);
  const [resizeMode, setResizeMode] = useState('auto');
  const [resizeWidth, setResizeWidth] = useState('');
  const [resizeHeight, setResizeHeight] = useState('');
  const [resizeFit, setResizeFit] = useState('fit');
  const [isProcessing, setIsProcessing] = useState(false);

  // Temp Link Generator States
  const [tempFile, setTempFile] = useState(null);
  const [tempExpiry, setTempExpiry] = useState('1x'); // '1x' or '24h'
  const [tempLinkResult, setTempLinkResult] = useState(null);
  const [tempLinkCopied, setTempLinkCopied] = useState(false);
  const [isTempUploading, setIsTempUploading] = useState(false);

  // Pinterest States
  const [pinterestInfo, setPinterestInfo] = useState(null);
  const [isPinterestLoading, setIsPinterestLoading] = useState(false);
  const [pinterestSelectedFormat, setPinterestSelectedFormat] = useState('');

  // Restore sidebar group state from localStorage after mount (fix SSR hydration)
  useEffect(() => {
    setIsSocialGroupOpen(localStorage.getItem('sidebar_social') === 'true');
    setIsGeneratorGroupOpen(localStorage.getItem('sidebar_generators') === 'true');
    setIsImageGroupOpen(localStorage.getItem('sidebar_filetools') === 'true');
  }, []);

  // Sinkronisasi tab dengan URL Hash agar bertahan saat di-refresh
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (['youtube', 'facebook', 'instagram', 'tiktok', 'pinterest', 'qrcode', 'compress', 'resize', 'img2pdf', 'pdf2img', 'templink'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  // Initialize pdfjs-dist dynamically
  useEffect(() => {
    import('pdfjs-dist').then(pdfjs => {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
      window.pdfjsLib = pdfjs;
    });
  }, []);

  // Initialize qr-code-styling dynamically to avoid SSR issues
  useEffect(() => {
    import('qr-code-styling').then(({ default: QRCodeStyling }) => {
      const instance = new QRCodeStyling({
        width: 256,
        height: 256,
        type: "canvas",
        imageOptions: { crossOrigin: "anonymous", margin: 10 }
      });
      setQrCodeInstance(instance);
    });
  }, []);

  // Append QR Canvas to DOM
  useEffect(() => {
    if (qrCodeInstance && qrRef.current && isQrGenerated) {
      qrRef.current.innerHTML = '';
      qrCodeInstance.append(qrRef.current);
    }
  }, [qrCodeInstance, isQrGenerated]);

  // Update QR Code when settings change
  useEffect(() => {
    if (qrCodeInstance && qrText && isQrGenerated) {
      qrCodeInstance.update({
        data: qrText,
        dotsOptions: {
          color: qrColor1,
          type: qrDotStyle,
          gradient: qrColorType === 'gradient' ? {
            type: 'linear',
            rotation: Math.PI / 4,
            colorStops: [{ offset: 0, color: qrColor1 }, { offset: 1, color: qrColor2 }]
          } : undefined
        },
        backgroundOptions: { color: "#ffffff" },
        image: qrLogo,
        qrOptions: { errorCorrectionLevel: qrErrorCorrection }
      });
    }
  }, [qrText, qrLogo, qrColorType, qrColor1, qrColor2, qrDotStyle, qrErrorCorrection, isQrGenerated, qrCodeInstance]);

  // Sinkronisasi tab dengan URL Hash agar bertahan saat di-refresh
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (['youtube', 'facebook', 'instagram', 'tiktok', 'qrcode', 'compress', 'resize', 'img2pdf', 'pdf2img', 'templink'].includes(hash)) {
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
    setToolsFile(null);
    setToolsFiles([]);
    setIsProcessing(false);
    setTempFile(null);
    setTempLinkResult(null);
    setTempLinkCopied(false);
    setPinterestInfo(null);
    setPinterestSelectedFormat('');
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

      // Jangan lakukan request ke backend jika berada di halaman non-downloader
      if (['qrcode', 'compress', 'resize', 'img2pdf', 'pdf2img', 'templink', 'linkpreview'].includes(activeTab)) {
        return;
      }

      // Pinterest: route to dedicated API
      if (activeTab === 'pinterest') {
        const isPinUrl = url.includes('pinterest.') || url.includes('pin.it/');
        if (!isPinUrl) { setPinterestInfo(null); return; }
        setIsPinterestLoading(true);
        setError('');
        setPinterestInfo(null);
        try {
          const res = await fetch('/api/pinterest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed');
          setPinterestInfo(data);
          if (data.formats?.length > 0) setPinterestSelectedFormat(data.formats[0].format_id);
        } catch (err) { setError(err.message); }
        finally { setIsPinterestLoading(false); }
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

  // --- Image & PDF Tools Handlers ---
  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCompress = async () => {
    if (!toolsFile) return alert('Please select an image first!');
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', toolsFile);
      formData.append('action', 'compress');
      formData.append('quality', imgQuality);

      const res = await fetch('/api/image', { method: 'POST', body: formData });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      downloadBlob(blob, `compressed_${toolsFile.name}`);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResize = async () => {
    if (!toolsFile) return alert('Please select an image first!');
    if (!resizeWidth && !resizeHeight) return alert('Fill at least Width or Height!');

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', toolsFile);
      formData.append('action', 'resize');
      formData.append('mode', resizeMode);
      if (resizeWidth) formData.append('width', resizeWidth);
      if (resizeHeight) formData.append('height', resizeHeight);
      if (resizeMode === 'custom') formData.append('fit', resizeFit);

      const res = await fetch('/api/image', { method: 'POST', body: formData });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      downloadBlob(blob, `resized_${toolsFile.name}`);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImgToPdf = async () => {
    if (toolsFiles.length === 0) return alert('Please select at least one image!');
    setIsProcessing(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();

      for (const file of toolsFiles) {
        const arrayBuffer = await file.arrayBuffer();
        let image;
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(arrayBuffer);
        } else if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else {
          continue;
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }

      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'Converted_Images.pdf');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePdfToImg = async () => {
    if (!toolsFile) return alert('Please select a PDF file first!');
    setIsProcessing(true);
    try {
      if (!window.pdfjsLib) throw new Error('PDF.js is not loaded yet. Please refresh the page.');

      const arrayBuffer = await toolsFile.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        canvas.toBlob((blob) => {
          downloadBlob(blob, `${toolsFile.name.replace('.pdf', '')}_page_${i}.png`);
        }, 'image/png');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Temp Link Handler ---
  const handleTempLinkUpload = async () => {
    if (!tempFile) return alert('Please select a file first!');
    setIsTempUploading(true);
    setTempLinkResult(null);
    try {
      const formData = new FormData();
      formData.append('file', tempFile);
      formData.append('expiry', tempExpiry);

      const res = await fetch('/api/templink/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      const link = `${window.location.origin}/api/templink/${data.id}`;
      setTempLinkResult({ link, filename: data.filename, expiry: tempExpiry });
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsTempUploading(false);
    }
  };

  // --- OG Link Preview Handler ---
  const handleOgPreview = async () => {
    if (!url.trim()) return;
    setIsOgLoading(true);
    setOgPreview(null);
    try {
      const res = await fetch('/api/og', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch preview');
      setOgPreview(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsOgLoading(false);
    }
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

  const downloadQR = async () => {
    if (!frameRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(frameRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'Custom_QRCode.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to generate image for download.');
    }
  };

  const copyQR = async () => {
    if (!frameRef.current) return;
    try {
      const blob = await htmlToImage.toBlob(frameRef.current, { cacheBust: true, pixelRatio: 2 });
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopySuccess('QR Code copied to clipboard!');
      setTimeout(() => setCopySuccess(''), 3000);
    } catch (err) {
      console.error('Copy failed:', err);
      setCopySuccess('Failed: Browser does not support this feature.');
      setTimeout(() => setCopySuccess(''), 3000);
    }
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
    if (activeTab === 'pinterest') {
      return {
        title: 'Pinterest Downloader',
        placeholder: 'Paste Pinterest Pin URL (video or photo)...',
        icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
      };
    }
    if (activeTab === 'qrcode') {
      return { title: 'QR Code Generator', placeholder: 'Enter Text or URL to generate QR...', icon: <QrCode size={32} /> };
    }
    if (activeTab === 'compress') {
      return { title: 'Compress Image', placeholder: '', icon: <ImageUp size={32} /> };
    }
    if (activeTab === 'resize') {
      return { title: 'Resize Image', placeholder: '', icon: <Maximize2 size={32} /> };
    }
    if (activeTab === 'img2pdf') {
      return { title: 'Image to PDF', placeholder: '', icon: <FileText size={32} /> };
    }
    if (activeTab === 'pdf2img') {
      return { title: 'PDF to Image', placeholder: '', icon: <FileImage size={32} /> };
    }
    if (activeTab === 'templink') {
      return { title: 'Temp Link Generator', placeholder: '', icon: <Link2 size={32} /> };
    }
    if (activeTab === 'linkpreview') {
      return { title: 'Link Preview Generator', placeholder: 'Paste any URL to generate preview...', icon: <Eye size={32} /> };
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
          <div className="nav-group-title" onClick={() => { const v = !isSocialGroupOpen; setIsSocialGroupOpen(v); localStorage.setItem('sidebar_social', v); }}>
            <span>Social Downloader</span>
            <ChevronDown size={16} style={{ transform: isSocialGroupOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
          </div>

          <div className={`nav-group-content ${isSocialGroupOpen ? 'open' : ''}`}>
            <button className={`nav-item youtube-btn ${activeTab === 'youtube' ? 'active' : ''}`} onClick={() => handleTabChange('youtube')}><Video size={20} /> YT Downloader</button>
            <button className={`nav-item facebook-btn ${activeTab === 'facebook' ? 'active' : ''}`} onClick={() => handleTabChange('facebook')}><Tv size={20} /> FB Downloader</button>
            <button className={`nav-item instagram-btn ${activeTab === 'instagram' ? 'active' : ''}`} onClick={() => handleTabChange('instagram')}><Camera size={20} /> IG Downloader</button>
            <button className={`nav-item tiktok-btn ${activeTab === 'tiktok' ? 'active' : ''}`} onClick={() => handleTabChange('tiktok')}><Music size={20} /> TikTok Downloader</button>
            <button className={`nav-item pinterest-btn ${activeTab === 'pinterest' ? 'active' : ''}`} onClick={() => handleTabChange('pinterest')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
              Pinterest
            </button>
          </div>
        </div>

        <div className="nav-group">
          <div className="nav-group-title" onClick={() => { const v = !isGeneratorGroupOpen; setIsGeneratorGroupOpen(v); localStorage.setItem('sidebar_generators', v); }}>
            <span>Generators</span>
            <ChevronDown size={16} style={{ transform: isGeneratorGroupOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
          </div>
          <div className={`nav-group-content ${isGeneratorGroupOpen ? 'open' : ''}`}>
            <button className={`nav-item qrcode-btn ${activeTab === 'qrcode' ? 'active' : ''}`} onClick={() => handleTabChange('qrcode')}><QrCode size={20} /> QR Code Generator</button>
            <button className={`nav-item templink-btn ${activeTab === 'templink' ? 'active' : ''}`} onClick={() => handleTabChange('templink')}><Link2 size={20} /> Temp Link Generator</button>
          </div>
        </div>

        <div className="nav-group">
          <div className="nav-group-title" onClick={() => { const v = !isImageGroupOpen; setIsImageGroupOpen(v); localStorage.setItem('sidebar_filetools', v); }}>
            <span>File Tools</span>
            <ChevronDown size={16} style={{ transform: isImageGroupOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
          </div>
          <div className={`nav-group-content ${isImageGroupOpen ? 'open' : ''}`}>
            <button className={`nav-item compress-btn ${activeTab === 'compress' ? 'active' : ''}`} onClick={() => handleTabChange('compress')}><ImageUp size={20} /> Compress Image</button>
            <button className={`nav-item resize-btn ${activeTab === 'resize' ? 'active' : ''}`} onClick={() => handleTabChange('resize')}><Maximize2 size={20} /> Resize Image</button>
            <button className={`nav-item img2pdf-btn ${activeTab === 'img2pdf' ? 'active' : ''}`} onClick={() => handleTabChange('img2pdf')}><FileText size={20} /> Image to PDF</button>
            <button className={`nav-item pdf2img-btn ${activeTab === 'pdf2img' ? 'active' : ''}`} onClick={() => handleTabChange('pdf2img')}><FileImage size={20} /> PDF to Image</button>
          </div>
        </div>

        {/* Developer Info */}
        <div className="dev-info">
          <div className="dev-avatar">
            <img src="/avatar.png" alt="Developer Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          </div>
          <div className="dev-name">Irnhakim</div>
          <div className="dev-role">Developer</div>
          <div className="dev-links">
            <a href="https://www.instagram.com/irnhakim/" target="_blank" rel="noopener noreferrer" className="dev-link" title="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            </a>
            <a href="https://github.com/Irnhakim" target="_blank" rel="noopener noreferrer" className="dev-link" title="GitHub">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
            </a>
            <a href="https://www.facebook.com/irnh4kim" target="_blank" rel="noopener noreferrer" className="dev-link" title="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            </a>
            <a href="https://www.youtube.com/@drandommusics" target="_blank" rel="noopener noreferrer" className="dev-link" title="YouTube">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
            </a>
          </div>
          <a href="https://saweria.co/irnhakim" target="_blank" rel="noopener noreferrer" className="dev-support-btn">
            ☕ Support on Saweria
          </a>
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
            {!['compress', 'resize', 'img2pdf', 'pdf2img', 'templink'].includes(activeTab) && (
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
                        // Force re-trigger debounce by toggling URL state
                        setUrl(v => v);
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
            )}

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

            {isPinterestLoading && (
              <div className="loading-wrapper">
                <Loader2 className="spinner" size={24} />
                <span>Fetching Pinterest content...</span>
              </div>
            )}

            {activeTab === 'pinterest' && pinterestInfo && (
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Preview card */}
                <div className="video-info" style={{ padding: '1rem', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                  {pinterestInfo.thumbnail && (
                    <img src={pinterestInfo.thumbnail} alt="Preview" className="thumbnail" style={{ borderRadius: '8px', objectFit: 'cover' }} />
                  )}
                  <div className="info-text">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                      <span style={{ background: pinterestInfo.type === 'video' ? '#E60023' : '#E60023', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', textTransform: 'uppercase' }}>
                        {pinterestInfo.type === 'video' ? '🎬 Video' : '📷 Image'}
                      </span>
                    </div>
                    <div className="video-title">{pinterestInfo.title}</div>
                  </div>
                </div>

                {/* Image download */}
                {pinterestInfo.type === 'image' && (
                  <a
                    href={`/api/pinterest/download?url=${encodeURIComponent(pinterestInfo.downloadUrl)}&filename=${encodeURIComponent((pinterestInfo.title || 'pinterest_image').slice(0, 60).replace(/[^a-z0-9]/gi, '_') + '.jpg')}`}
                    download
                    className="download-btn"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', textDecoration: 'none', borderRadius: '12px', fontWeight: 700 }}
                  >
                    <Download size={20} /> Download Image
                  </a>
                )}

                {/* Video download */}
                {pinterestInfo.type === 'video' && pinterestInfo.formats && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                      className="download-btn"
                      style={{ padding: '1rem', justifyContent: 'center' }}
                      onClick={async () => {
                        const fmt = pinterestInfo.formats[0];
                        const dlUrl = pinterestInfo.directVideoUrl || fmt?.url;
                        if (dlUrl) {
                          const filename = `pinterest_video.${fmt?.ext || 'mp4'}`;
                          const a = document.createElement('a');
                          a.href = `/api/pinterest/download?url=${encodeURIComponent(dlUrl)}&filename=${encodeURIComponent(filename)}`;
                          a.download = filename;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        } else {
                          setError('No downloadable URL found for this format.');
                        }
                      }}
                      disabled={isDownloading}
                    >
                      {isDownloading ? <><Loader2 className="spinner" size={20} /> Downloading...</> : <><Download size={20} /> Download Video</>}
                    </button>
                  </div>
                )}
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

                <div className="qr-settings-panel">
                  <div className="setting-group">
                    <span className="setting-label">Color Style</span>
                    <select className="format-select" value={qrColorType} onChange={e => setQrColorType(e.target.value)}>
                      <option value="solid">Solid Color</option>
                      <option value="gradient">Gradient</option>
                    </select>
                    <div className="setting-row">
                      <input type="color" className="color-picker" value={qrColor1} onChange={e => setQrColor1(e.target.value)} />
                      {qrColorType === 'gradient' && (
                        <input type="color" className="color-picker" value={qrColor2} onChange={e => setQrColor2(e.target.value)} />
                      )}
                    </div>
                  </div>

                  <div className="setting-group">
                    <span className="setting-label">Dot Shape</span>
                    <select className="format-select" value={qrDotStyle} onChange={e => setQrDotStyle(e.target.value)}>
                      <option value="square">Square</option>
                      <option value="dots">Dots</option>
                      <option value="rounded">Rounded</option>
                      <option value="classy">Classy</option>
                      <option value="extra-rounded">Extra Rounded</option>
                    </select>
                  </div>

                  <div className="setting-group">
                    <span className="setting-label">Error Correction</span>
                    <select className="format-select" value={qrErrorCorrection} onChange={e => setQrErrorCorrection(e.target.value)}>
                      <option value="L">Low (Best for simple text)</option>
                      <option value="M">Medium</option>
                      <option value="Q">Quartile</option>
                      <option value="H">High (Best for logos)</option>
                    </select>
                  </div>

                  <div className="setting-group">
                    <span className="setting-label">Frame Text (Optional)</span>
                    <input
                      type="text"
                      className="url-input"
                      placeholder="e.g. SCAN ME"
                      value={qrFrameText}
                      onChange={e => setQrFrameText(e.target.value.toUpperCase())}
                      style={{ padding: '0.6rem', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <button
                  className="download-btn"
                  onClick={() => {
                    if (!url.trim()) return alert('Text cannot be empty');
                    setQrText(url);
                    setIsQrGenerated(true);
                  }}
                  disabled={!url}
                  style={{ width: '100%', marginTop: '0.5rem', padding: '1rem' }}
                >
                  <QrCode size={20} />
                  Generate QR Code
                </button>

                {isQrGenerated && qrText && (
                  <div className="qr-preview">
                    <div
                      className={`qr-frame-wrapper ${qrFrameText ? 'framed' : ''}`}
                      ref={frameRef}
                      style={qrFrameText ? { borderColor: qrColor1 } : {}}
                    >
                      {qrFrameText && (
                        <div className="qr-frame-text" style={{ color: qrColor1 }}>
                          {qrFrameText}
                        </div>
                      )}
                      <div className="qr-canvas-wrapper" ref={qrRef}></div>
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
            ) : activeTab === 'linkpreview' ? (
              <div>
                {/* Generate button */}
                <button
                  className="download-btn"
                  style={{ width: '100%', padding: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}
                  onClick={handleOgPreview}
                  disabled={!url.trim() || isOgLoading}
                >
                  {isOgLoading
                    ? <><Loader2 className="spinner" size={20} /> Fetching Preview...</>
                    : <><Eye size={20} /> Generate Preview</>
                  }
                </button>

                {/* Preview Card */}
                {ogPreview && (
                  <div className="og-card">
                    {ogPreview.image && (
                      <div className="og-card-image">
                        <img src={ogPreview.image} alt="OG Preview" onError={e => e.target.style.display = 'none'} />
                      </div>
                    )}
                    <div className="og-card-body">
                      <div className="og-card-site">
                        <img src={ogPreview.favicon} alt="" width={16} height={16} style={{ borderRadius: '3px' }} onError={e => e.target.style.display = 'none'} />
                        {ogPreview.siteName || ogPreview.hostname}
                      </div>
                      <div className="og-card-title">{ogPreview.title}</div>
                      {ogPreview.description && (
                        <div className="og-card-desc">{ogPreview.description}</div>
                      )}
                      <a href={ogPreview.url} target="_blank" rel="noopener noreferrer" className="og-card-link">
                        <ExternalLink size={13} /> {ogPreview.hostname}
                      </a>
                    </div>
                  </div>
                )}

                {/* Raw data table */}
                {ogPreview && (
                  <div className="og-meta-table">
                    <div className="og-meta-title"><Eye size={14} /> Open Graph Metadata</div>
                    {[
                      ['Title', ogPreview.title],
                      ['Description', ogPreview.description],
                      ['Image URL', ogPreview.image],
                      ['Site Name', ogPreview.siteName],
                      ['Canonical URL', ogPreview.url],
                    ].filter(([, v]) => v).map(([label, value]) => (
                      <div key={label} className="og-meta-row">
                        <span className="og-meta-label">{label}</span>
                        <span className="og-meta-value">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : ['compress', 'resize', 'img2pdf', 'pdf2img', 'templink'].includes(activeTab) ? (
              <div className="tools-container">

                {/* === TEMP LINK GENERATOR === */}
                {activeTab === 'templink' && (
                  <div className="tools-panel">
                    {/* Info badges */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '20px', padding: '0.3rem 0.75rem', fontSize: '0.78rem', color: '#6366f1', fontWeight: 600 }}>
                        <Shield size={13} /> Secure
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '20px', padding: '0.3rem 0.75rem', fontSize: '0.78rem', color: '#6366f1', fontWeight: 600 }}>
                        <Clock size={13} /> Auto-Expire
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '20px', padding: '0.3rem 0.75rem', fontSize: '0.78rem', color: '#6366f1', fontWeight: 600 }}>
                        <Upload size={13} /> Max 50MB
                      </span>
                    </div>

                    {/* File upload */}
                    <label className="file-upload-label" style={{ width: '100%', justifyContent: 'center', padding: '2rem', border: '2px dashed #cbd5e1', borderRadius: '12px', cursor: 'pointer', flexDirection: 'column', gap: '0.5rem' }}>
                      <Link2 size={32} style={{ color: '#6366f1' }} />
                      <span style={{ fontWeight: 700 }}>{tempFile ? tempFile.name : 'Click to select any file'}</span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Any file type · Max 50MB</span>
                      <input type="file" style={{ display: 'none' }} onChange={e => { setTempFile(e.target.files[0]); setTempLinkResult(null); }} />
                    </label>

                    {tempFile && (
                      <div className="qr-settings-panel" style={{ marginTop: '1rem' }}>
                        <div className="setting-group" style={{ gridColumn: '1 / -1' }}>
                          <span className="setting-label">Expiry Rule</span>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => setTempExpiry('1x')}
                              className={`qr-action-btn ${tempExpiry === '1x' ? 'qr-download-btn' : 'qr-copy-btn'}`}
                              style={{ flex: 1, justifyContent: 'center', flexDirection: 'column', gap: '0.2rem' }}
                            >
                              <span style={{ fontWeight: 700 }}>🔒 1 Download</span>
                              <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Link self-destructs after 1 use</span>
                            </button>
                            <button
                              onClick={() => setTempExpiry('24h')}
                              className={`qr-action-btn ${tempExpiry === '24h' ? 'qr-download-btn' : 'qr-copy-btn'}`}
                              style={{ flex: 1, justifyContent: 'center', flexDirection: 'column', gap: '0.2rem' }}
                            >
                              <span style={{ fontWeight: 700 }}>⏰ 24 Hours</span>
                              <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Expires after 24 hours</span>
                            </button>
                          </div>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                          <button
                            className="download-btn"
                            style={{ width: '100%', padding: '1rem', justifyContent: 'center' }}
                            onClick={handleTempLinkUpload}
                            disabled={isTempUploading}
                          >
                            {isTempUploading
                              ? <><Loader2 className="spinner" size={20} /> Uploading...</>
                              : <><Link2 size={20} /> Generate Temp Link</>
                            }
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Result */}
                    {tempLinkResult && (
                      <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'rgba(99,102,241,0.1)', border: '1.5px solid rgba(99,102,241,0.3)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#4f46e5', fontSize: '0.9rem' }}>
                          <Check size={18} />
                          Link Generated! {tempLinkResult.expiry === '1x' ? '(Single-use)' : '(Expires in 24h)'}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input
                            readOnly
                            value={tempLinkResult.link}
                            style={{ flex: 1, padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '0.8rem', color: '#334155', background: 'white', outline: 'none' }}
                            onFocus={e => e.target.select()}
                          />
                          <button
                            className="download-btn"
                            style={{ padding: '0.6rem 1rem', flexShrink: 0 }}
                            onClick={async () => {
                              await navigator.clipboard.writeText(tempLinkResult.link);
                              setTempLinkCopied(true);
                              setTimeout(() => setTempLinkCopied(false), 2500);
                            }}
                          >
                            {tempLinkCopied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
                          </button>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Shield size={12} />
                          Share this link. It will {tempLinkResult.expiry === '1x' ? 'auto-delete after 1 download' : 'expire in 24 hours'}.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* === COMPRESS IMAGE === */}
                {activeTab === 'compress' && (
                  <div className="tools-panel">
                    <label className="file-upload-label" style={{ width: '100%', justifyContent: 'center', padding: '2rem', border: '2px dashed #cbd5e1', borderRadius: '12px', cursor: 'pointer', flexDirection: 'column', gap: '0.5rem' }}>
                      <ImageUp size={32} style={{ color: 'var(--accent)' }} />
                      <span style={{ fontWeight: 700 }}>{toolsFile ? toolsFile.name : 'Click to upload an image'}</span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Supports JPEG, PNG, WebP</span>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setToolsFile(e.target.files[0])} />
                    </label>

                    {toolsFile && (
                      <>
                        <div className="setting-group" style={{ marginTop: '1rem' }}>
                          <span className="setting-label">Quality: {imgQuality}%</span>
                          <input type="range" min={10} max={100} value={imgQuality} onChange={e => setImgQuality(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent)' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                            <span>Smaller file</span><span>Best quality</span>
                          </div>
                        </div>
                        <button className="download-btn" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }} onClick={handleCompress} disabled={isProcessing}>
                          {isProcessing ? <><Loader2 className="spinner" size={20} /> Processing...</> : <><Download size={20} /> Compress & Download</>}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* === RESIZE IMAGE === */}
                {activeTab === 'resize' && (
                  <div className="tools-panel">
                    <label className="file-upload-label" style={{ width: '100%', justifyContent: 'center', padding: '2rem', border: '2px dashed #cbd5e1', borderRadius: '12px', cursor: 'pointer', flexDirection: 'column', gap: '0.5rem' }}>
                      <Maximize2 size={32} style={{ color: 'var(--accent)' }} />
                      <span style={{ fontWeight: 700 }}>{toolsFile ? toolsFile.name : 'Click to upload an image'}</span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Supports JPEG, PNG, WebP</span>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setToolsFile(e.target.files[0])} />
                    </label>

                    {toolsFile && (
                      <div className="qr-settings-panel" style={{ marginTop: '1rem' }}>
                        <div className="setting-group" style={{ gridColumn: '1 / -1' }}>
                          <span className="setting-label">Resize Mode</span>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => setResizeMode('auto')} className={`qr-action-btn ${resizeMode === 'auto' ? 'qr-download-btn' : 'qr-copy-btn'}`} style={{ flex: 1, justifyContent: 'center' }}>Auto (Keep Ratio)</button>
                            <button onClick={() => setResizeMode('custom')} className={`qr-action-btn ${resizeMode === 'custom' ? 'qr-download-btn' : 'qr-copy-btn'}`} style={{ flex: 1, justifyContent: 'center' }}>Custom</button>
                          </div>
                        </div>

                        <div className="setting-group">
                          <span className="setting-label">Width (px){resizeMode === 'auto' ? ' — optional' : ''}</span>
                          <input type="number" className="url-input" placeholder="e.g. 1920" value={resizeWidth} onChange={e => setResizeWidth(e.target.value)} style={{ padding: '0.6rem' }} />
                        </div>

                        <div className="setting-group">
                          <span className="setting-label">Height (px){resizeMode === 'auto' ? ' — optional' : ''}</span>
                          <input type="number" className="url-input" placeholder="e.g. 1080" value={resizeHeight} onChange={e => setResizeHeight(e.target.value)} style={{ padding: '0.6rem' }} />
                        </div>

                        {resizeMode === 'custom' && (
                          <div className="setting-group" style={{ gridColumn: '1 / -1' }}>
                            <span className="setting-label">Resize Behavior</span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => setResizeFit('fit')} className={`qr-action-btn ${resizeFit === 'fit' ? 'qr-download-btn' : 'qr-copy-btn'}`} style={{ flex: 1, justifyContent: 'center', flexDirection: 'column', gap: '0.2rem' }}>
                                <span style={{ fontWeight: 700 }}>Fit</span>
                                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>No crop, may have padding</span>
                              </button>
                              <button onClick={() => setResizeFit('fill')} className={`qr-action-btn ${resizeFit === 'fill' ? 'qr-download-btn' : 'qr-copy-btn'}`} style={{ flex: 1, justifyContent: 'center', flexDirection: 'column', gap: '0.2rem' }}>
                                <span style={{ fontWeight: 700 }}>Fill / Crop</span>
                                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Cropped to exact size</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div style={{ gridColumn: '1 / -1' }}>
                          <button className="download-btn" style={{ width: '100%', padding: '1rem' }} onClick={handleResize} disabled={isProcessing}>
                            {isProcessing ? <><Loader2 className="spinner" size={20} /> Processing...</> : <><Maximize2 size={20} /> Resize & Download</>}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* === IMAGE TO PDF === */}
                {activeTab === 'img2pdf' && (
                  <div className="tools-panel">
                    <label className="file-upload-label" style={{ width: '100%', justifyContent: 'center', padding: '2rem', border: '2px dashed #cbd5e1', borderRadius: '12px', cursor: 'pointer', flexDirection: 'column', gap: '0.5rem' }}>
                      <FileText size={32} style={{ color: 'var(--accent)' }} />
                      <span style={{ fontWeight: 700 }}>
                        {toolsFiles.length > 0 ? `${toolsFiles.length} image(s) selected` : 'Click to select images'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>JPEG and PNG only. Multiple files supported.</span>
                      <input type="file" accept="image/jpeg,image/png" multiple style={{ display: 'none' }} onChange={e => setToolsFiles(Array.from(e.target.files))} />
                    </label>

                    {toolsFiles.length > 0 && (
                      <>
                        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {toolsFiles.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.04)', borderRadius: '8px', fontSize: '0.85rem' }}>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{f.name}</span>
                              <span style={{ color: '#94a3b8', flexShrink: 0 }}>{formatFileSize(f.size)}</span>
                            </div>
                          ))}
                        </div>
                        <button className="download-btn" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }} onClick={handleImgToPdf} disabled={isProcessing}>
                          {isProcessing ? <><Loader2 className="spinner" size={20} /> Creating PDF...</> : <><FileText size={20} /> Convert to PDF & Download</>}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* === PDF TO IMAGE === */}
                {activeTab === 'pdf2img' && (
                  <div className="tools-panel">
                    <label className="file-upload-label" style={{ width: '100%', justifyContent: 'center', padding: '2rem', border: '2px dashed #cbd5e1', borderRadius: '12px', cursor: 'pointer', flexDirection: 'column', gap: '0.5rem' }}>
                      <FileImage size={32} style={{ color: 'var(--accent)' }} />
                      <span style={{ fontWeight: 700 }}>{toolsFile ? toolsFile.name : 'Click to upload a PDF'}</span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Each page will be saved as a separate PNG at 2x resolution.</span>
                      <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={e => setToolsFile(e.target.files[0])} />
                    </label>

                    {toolsFile && (
                      <button className="download-btn" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }} onClick={handlePdfToImg} disabled={isProcessing}>
                        {isProcessing ? <><Loader2 className="spinner" size={20} /> Converting pages...</> : <><FileImage size={20} /> Extract Pages as PNG</>}
                      </button>
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
