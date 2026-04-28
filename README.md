# 🛠️ All-in-One Tools — Social Downloader, QR Generator & File Tools

A modern, premium all-in-one web utility built with **Next.js (App Router)**, featuring a social media downloader, advanced QR code generator, and a set of powerful image & PDF file tools — all wrapped in a dynamic glassmorphism UI.

![Next.js](https://img.shields.io/badge/Next.js-Black?style=for-the-badge&logo=next.js&logoColor=white)
![yt-dlp](https://img.shields.io/badge/yt--dlp-red?style=for-the-badge&logo=youtube&logoColor=white)
![FFmpeg](https://img.shields.io/badge/FFmpeg-green?style=for-the-badge&logo=ffmpeg&logoColor=white)
![Sharp](https://img.shields.io/badge/Sharp-grey?style=for-the-badge&logo=node.js&logoColor=white)

---

## ✨ Features

### 📥 Social Media Downloader
- **4 Major Platforms:** YouTube, Facebook, Instagram, TikTok
- **Server-Side Remuxing (FFmpeg):** Automatically merges separate video + audio tracks (no more silent 1080p/4K videos)
- **Smart URL Validation:** Prevents backend calls for invalid URLs per platform
- **IPv4 Forcing:** Bypasses API timeouts caused by ISP IPv6 routing issues

### 🎨 Advanced QR Code Generator
- **Solid & Gradient Colors:** Pick single color or blend two colors (linear 45°)
- **Custom Dot Shapes:** Square, Dots, Rounded, Classy, Extra Rounded
- **Error Correction Levels:** L / M / Q / H (H recommended when using logos)
- **Custom Frame with editable text:** "SCAN ME", promo text, etc.
- **Logo Upload:** Embed any image at the center of the QR
- **Export:** Download as PNG (2× resolution) or Copy to Clipboard — frame included!

### 🗂️ File Tools
| Tool | Description |
|---|---|
| **Compress Image** | Reduce JPEG/PNG/WebP file size with quality slider (10–100%) |
| **Resize Image** | Auto mode (keep aspect ratio) or Custom (Width × Height) with Fit or Fill/Crop option |
| **Image to PDF** | Combine multiple JPEG/PNG images into a single PDF (client-side via `pdf-lib`) |
| **PDF to Image** | Extract each PDF page as a high-resolution PNG (2× scale, client-side via `pdfjs-dist`) |

### 🎨 UI / UX
- **Dynamic themed backgrounds** — every tool has its own unique gradient palette
- **Glassmorphism sidebar** with collapsible groups, persistent expand/collapse state (localStorage)
- **Tree-line navigation** — connected, clean sidebar tree view
- **Modern slim scrollbar** — 4px translucent scrollbar matching each theme
- **Developer card** at sidebar bottom with social links & Saweria support button
- **Mobile responsive** with safe-area-inset support for modern browsers

---

## 🛠️ Prerequisites

Ensure your server or machine has the following installed:

1. **Node.js** v18 or newer
2. **Python 3** — required by `youtube-dl-exec` / `yt-dlp`
3. **FFmpeg** — **CRITICAL** for merging high-resolution video + audio tracks

### Install FFmpeg

**Windows:**
```bash
winget install gyan.ffmpeg
```
> Restart your terminal or computer after installation.

**Linux (Ubuntu / Debian / Armbian / CasaOS):**
```bash
sudo apt update && sudo apt install ffmpeg -y
```

---

## 🚀 Installation & Development

```bash
# 1. Clone the repository
git clone https://github.com/Irnhakim/ToolsDownloader.git
cd ToolsDownloader

# 2. Install all dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌍 Production Deployment (PM2)

For 24/7 self-hosted deployment (CasaOS, Ubuntu Server, Armbian, etc.):

```bash
# Install PM2 globally
npm install -g pm2

# Build for production
npm run build

# Start with PM2
pm2 start npm --name "tools-downloader" -- start

# Auto-start on reboot
pm2 startup
pm2 save
```

> **Optional:** Expose via Nginx Reverse Proxy or Cloudflare Tunnel to access from outside your network.

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `next` | App framework (App Router) |
| `youtube-dl-exec` | yt-dlp wrapper for video info & download |
| `sharp` | Server-side image compression & resizing |
| `pdf-lib` | Client-side Image → PDF conversion |
| `pdfjs-dist` | Client-side PDF → Image extraction |
| `qr-code-styling` | Advanced QR code generation with custom styling |
| `html-to-image` | Capture QR frame (with text) as PNG blob |
| `lucide-react` | Icon library |

---

## 📝 Important Notes

- **Private Content:** Only **public** videos/posts can be downloaded. Private accounts will return an error.
- **Temp Folder:** Processed videos are temporarily saved in `os.tmpdir()` and automatically cleaned up after streaming to prevent storage leaks.
- **yt-dlp Updates:** Social media platforms frequently change their APIs. If downloads break, update yt-dlp:
  ```bash
  npm update youtube-dl-exec
  ```
- **Image & PDF Processing:** Compress and Resize run on the **server** (Sharp). Image→PDF and PDF→Image run entirely in the **browser** (no server upload needed).

---

## 👨‍💻 Developer

**Irnhakim** — [@irnhakim](https://www.instagram.com/irnhakim/)

[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/irnhakim/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Irnhakim)
[![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://www.facebook.com/irnh4kim)
[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/@drandommusics)

☕ **Support the project:** [saweria.co/irnhakim](https://saweria.co/irnhakim)

---

*Built with ❤️ to make everyday digital tasks easier.*
