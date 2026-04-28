# 🚀 4-in-1 Social Media Downloader

A modern, responsive web application built with **Next.js (App Router)** and **yt-dlp** to download high-quality videos and audio from leading social media platforms. This application is specifically designed to be deployed on self-hosted servers such as Armbian, CasaOS, Ubuntu, or Windows.

![Thumbnail Preview](https://img.shields.io/badge/Next.js-Black?style=for-the-badge&logo=next.js&logoColor=white)
![yt-dlp](https://img.shields.io/badge/yt--dlp-red?style=for-the-badge&logo=youtube&logoColor=white)
![FFmpeg](https://img.shields.io/badge/FFmpeg-green?style=for-the-badge&logo=ffmpeg&logoColor=white)

## ✨ Key Features

- **4 Major Platforms:** Supports downloading from **YouTube, Facebook, Instagram, and TikTok**.
- **Server-Side Remuxing (FFmpeg):** Say goodbye to "silent videos" on 1080p/4K resolutions. The system automatically downloads separate video and audio tracks and merges them on the backend using FFmpeg.
- **Dynamic Glassmorphism UI:** The web theme, colors, and gradients transition smoothly and automatically based on the social media platform you select.
- **Mobile Responsive & Tree View Sidebar:** Clean, native-app-like interface on mobile devices. Features a directory-style sidebar (tree lines) that can be expanded or collapsed.
- **State Preservation:** The active tab is automatically saved in the URL (`#youtube`, `#tiktok`, etc.), preventing accidental refresh loss and making it easily shareable.
- **IPv4 Forcing:** Bypasses API timeout issues and routing errors commonly caused by ISP IPv6 routing.

---

## 🛠️ Prerequisites

Before installing the application, ensure your server or machine has the following installed:
1. **Node.js** (v18 or newer)
2. **Python 3** (Required by `youtube-dl-exec` / `yt-dlp`)
3. **FFmpeg** (🌟 **CRITICAL!** Without FFmpeg, high-resolution formats cannot be merged with their audio tracks).

### How to Install FFmpeg:
- **Windows:** Open Terminal/CMD as Administrator and run:
  ```bash
  winget install gyan.ffmpeg
  ```
  *(Restart your computer or terminal after installation)*
- **Linux (Armbian / Ubuntu / Debian / CasaOS):**
  ```bash
  sudo apt update
  sudo apt install ffmpeg -y
  ```

---

## 🚀 Installation & Development

1. **Clone/Download** this repository to your local machine.
2. Open a terminal inside the project directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000` in your browser.

---

## 🌍 Production Deployment (PM2)

If you want to run this application 24/7 on a self-hosted server (like CasaOS or Ubuntu Server), it is highly recommended to use **PM2**.

1. Ensure PM2 is installed globally:
   ```bash
   npm install -g pm2
   ```
2. Build the application for production:
   ```bash
   npm run build
   ```
3. Start the application using PM2:
   ```bash
   pm2 start npm --name "tools-downloader" -- start
   ```
4. Configure PM2 to auto-start on server reboot/startup:
   ```bash
   pm2 startup
   pm2 save
   ```

*(Optional: You can expose port 3000 using an Nginx Reverse Proxy or Cloudflare Tunnel to access it from outside your home network).*

---

## 📝 Important Notes

- **Private Content:** This application can only download **PUBLIC** videos. If an IG/TikTok user has a private account or restricts their video audience, the download process will fail with an error.
- **Temp Folder Management:** The system automatically saves videos being processed in the OS temporary directory (`os.tmpdir()`). It features smart cleanup code that automatically deletes leftover files to prevent server memory leaks/storage overflow.
- **yt-dlp Limitations:** This application relies heavily on the open-source `yt-dlp` project. If social media platforms change their API architectures, download features may break. **Solution:** Regularly update the module by running `npm update youtube-dl-exec`.

---
*Built with ❤️ to make social media management easier.*
