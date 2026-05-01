# 🛠️ All-in-One Tools — Social Downloader, QR Generator, File Tools & More

A modern, premium all-in-one web utility built with **Next.js (App Router)**, featuring social media downloaders, an advanced QR code generator, file tools, and secure file sharing — wrapped in a stunning glassmorphism UI with dynamic per-tool color themes.

![Next.js](https://img.shields.io/badge/Next.js-Black?style=for-the-badge&logo=next.js&logoColor=white)
![yt-dlp](https://img.shields.io/badge/yt--dlp-red?style=for-the-badge&logo=youtube&logoColor=white)
![FFmpeg](https://img.shields.io/badge/FFmpeg-green?style=for-the-badge&logo=ffmpeg&logoColor=white)
![Sharp](https://img.shields.io/badge/Sharp-grey?style=for-the-badge&logo=node.js&logoColor=white)

---

## ✨ Features

### 📥 Social Media Downloader

| Platform | Supported Content |
|---|---|
| **YouTube** | Videos (all resolutions), Audio (MP3/M4A) with server-side FFmpeg remuxing |
| **Facebook** | Public videos |
| **Instagram** | Reels & public videos |
| **TikTok** | Videos (no watermark via yt-dlp) |
| **Pinterest** | Photos (original resolution) & Videos — auto-detects type |

- **Server-Side Remuxing (FFmpeg):** Merges separate video + audio tracks (no silent 1080p/4K)
- **Smart URL Validation:** No backend calls for invalid URLs
- **Pinterest:** Pure HTML scraping — no yt-dlp required, faster and more reliable

---

### 🎨 Advanced QR Code Generator

- **Solid & Gradient Colors:** Single color or two-color linear blend
- **Custom Dot Shapes:** Square, Dots, Rounded, Classy, Extra Rounded
- **Error Correction Levels:** L / M / Q / H
- **Custom Frame:** Editable text around the QR (e.g. "SCAN ME")
- **Logo Upload:** Embed any image at the center
- **Export:** Download as PNG (2× resolution) or Copy to Clipboard

---

### 🔗 Temp Link Generator

Share files securely with self-destructing links:

| Expiry Mode | Behavior |
|---|---|
| **1× Download** | Link deletes itself after a single download |
| **24 Hours** | Link expires automatically after 24 hours |

- Max file size: **50 MB**
- Files stored in server temp directory (`os.tmpdir()`) with auto-cleanup
- Shareable link — works from any device on the same network

> ⚠️ Uses in-memory store. For multi-instance/Vercel deployments, use Redis or a persistent DB.

---

### 🗂️ File Tools

| Tool | Description |
|---|---|
| **Compress Image** | Reduce JPEG/PNG/WebP size with quality slider (10–100%) |
| **Resize Image** | Auto (keep aspect ratio) or Custom (W × H) with Fit or Fill/Crop |
| **Image to PDF** | Combine multiple images into a single PDF (client-side, `pdf-lib`) |
| **PDF to Image** | Extract each PDF page as high-res PNG (2× scale, client-side, `pdfjs-dist`) |

---

### 🎨 UI / UX

- **Dynamic themed backgrounds** — each tool has its own gradient palette
- **Glassmorphism sidebar** with collapsible groups, persistent state via `localStorage`
- **Tree-line navigation** — clean, connected sidebar tree view
- **Modern slim scrollbar** — 4px translucent, matches each theme
- **Developer card** at sidebar bottom with social links & Saweria support button
- **Mobile responsive** with `safe-area-inset` support
- **URL hash sync** — active tab persists on page refresh (`#youtube`, `#pinterest`, etc.)
- **Non-blocking font loading** — Google Fonts via `<link>` preload, not `@import`

---

## 🛠️ Prerequisites

1. **Node.js** v18+
2. **Python 3** — required by `youtube-dl-exec` / `yt-dlp`
3. **FFmpeg** — **required** for merging high-res video + audio tracks

### Install FFmpeg

**Windows:**
```bash
winget install gyan.ffmpeg
```
> Restart terminal after installation.

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

# 2. Install dependencies
npm install

# 3. Start dev server (default port 3000)
npm run dev

# Custom port
npm run dev -- -p 3001
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌍 Production Deployment (PM2)

For 24/7 self-hosted deployment (CasaOS, Ubuntu Server, Armbian, etc.):

```bash
# Install PM2
npm install -g pm2

# Build for production
npm run build

# Start with PM2
pm2 start npm --name "tools-downloader" -- start

# Auto-start on reboot
pm2 startup
pm2 save
```

### Change Port (Production)

Edit `package.json`:
```json
"start": "next start -p 3001"
```

Or with PM2:
```bash
pm2 start npm --name "tools-downloader" -- start -- -p 3001
```

> **Optional:** Expose via Nginx Reverse Proxy or Cloudflare Tunnel for external access.

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `next` | App framework (App Router) |
| `youtube-dl-exec` | yt-dlp wrapper — YouTube, Facebook, Instagram, TikTok |
| `sharp` | Server-side image compression & resizing |
| `pdf-lib` | Client-side Image → PDF |
| `pdfjs-dist` | Client-side PDF → Image |
| `qr-code-styling` | Advanced QR code with custom styling |
| `html-to-image` | Capture QR frame as PNG |
| `lucide-react` | Icon library |

> **Pinterest** uses native `fetch()` HTML scraping — no extra dependency needed.

---

## 📝 Important Notes

- **Private Content:** Only **public** posts can be downloaded. Private accounts return an error.
- **Temp Files:** Processed videos saved to `os.tmpdir()`, cleaned up automatically after streaming.
- **yt-dlp Updates:** Social platforms change APIs frequently. If downloads break:
  ```bash
  npm update youtube-dl-exec
  ```
- **Image & PDF Processing:**
  - Compress & Resize → **server-side** (Sharp)
  - Image→PDF & PDF→Image → **client-side** (no upload needed)
- **Pinterest:** Uses JSON-LD + OG scraping — works without yt-dlp or cookies.
- **Temp Link Store:** In-memory only. Restarting the server clears all active links.

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
