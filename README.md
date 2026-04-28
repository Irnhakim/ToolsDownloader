# 🚀 4-in-1 Social Media Downloader

Sebuah aplikasi web modern berbasis **Next.js (App Router)** dan **yt-dlp** untuk mengunduh video dan audio resolusi tinggi dari berbagai platform media sosial terkemuka. Aplikasi ini dirancang khusus untuk berjalan di *self-hosted server* seperti Armbian, CasaOS, Ubuntu, maupun Windows.

![Thumbnail Preview](https://img.shields.io/badge/Next.js-Black?style=for-the-badge&logo=next.js&logoColor=white)
![yt-dlp](https://img.shields.io/badge/yt--dlp-red?style=for-the-badge&logo=youtube&logoColor=white)
![FFmpeg](https://img.shields.io/badge/FFmpeg-green?style=for-the-badge&logo=ffmpeg&logoColor=white)

## ✨ Fitur Utama

- **4 Platform Utama:** Mendukung pengunduhan dari **YouTube, Facebook, Instagram, dan TikTok**.
- **Server-Side Remuxing (FFmpeg):** Tidak ada lagi masalah "video bisu" pada resolusi 1080p/4K. Sistem akan secara otomatis mengunduh *track* video dan audio secara terpisah lalu menggabungkannya di *backend* menggunakan FFmpeg.
- **Dynamic Glassmorphism UI:** Tema web, warna, dan gradien akan berubah otomatis secara mulus mengikuti platform sosial media yang sedang Anda pilih.
- **Mobile Responsive & Tree View Sidebar:** Tampilan rapi layaknya aplikasi *native* di *smartphone*. Dilengkapi Sidebar bergaya direktori (*tree lines*) yang bisa *expand/collapse*.
- **State Preservation:** Tab yang sedang aktif otomatis tersimpan di URL (`#youtube`, `#tiktok`, dll), sehingga aman dari *refresh* tak sengaja dan mudah dibagikan.
- **IPv4 Forcing:** Mengatasi masalah *timeout* API atau salah rute (*routing issue*) yang sering terjadi jika ISP menggunakan IPv6.

---

## 🛠️ Persyaratan Sistem (Prerequisites)

Sebelum menginstal aplikasi ini, pastikan *server* atau komputer Anda sudah terpasang:
1. **Node.js** (Versi 18 atau lebih baru)
2. **Python 3** (Dibutuhkan oleh `youtube-dl-exec` / `yt-dlp`)
3. **FFmpeg** (🌟 **SANGAT PENTING!** Tanpa FFmpeg, format resolusi tinggi tidak akan bisa digabung dengan suaranya).

### Cara Install FFmpeg:
- **Windows:** Buka Terminal/CMD sebagai Admin lalu ketik:
  ```bash
  winget install gyan.ffmpeg
  ```
  *(Restart komputer/terminal Anda setelah instalasi)*
- **Linux (Armbian / Ubuntu / Debian / CasaOS):**
  ```bash
  sudo apt update
  sudo apt install ffmpeg -y
  ```

---

## 🚀 Cara Instalasi & Menjalankan (Development)

1. **Clone/Download** repositori ini ke komputer Anda.
2. Buka terminal di dalam folder proyek tersebut.
3. Install semua *dependencies*:
   ```bash
   npm install
   ```
4. Jalankan *server development*:
   ```bash
   npm run dev
   ```
5. Buka `http://localhost:3000` di *browser* Anda.

---

## 🌍 Deployment di Production Server (PM2)

Jika Anda ingin menjalankan aplikasi ini 24/7 di server *self-hosted* (misalnya CasaOS atau Ubuntu Server), sangat disarankan menggunakan **PM2**.

1. Pastikan Anda sudah menginstal PM2 secara global:
   ```bash
   npm install -g pm2
   ```
2. Lakukan proses *Build* (membuat versi ringan siap pakai):
   ```bash
   npm run build
   ```
3. Jalankan aplikasi menggunakan PM2:
   ```bash
   pm2 start npm --name "tools-downloader" -- start
   ```
4. Agar PM2 otomatis berjalan saat server *restart* (mati lampu/reboot):
   ```bash
   pm2 startup
   pm2 save
   ```

*(Opsional: Anda bisa mengekspos port 3000 ini menggunakan Nginx Reverse Proxy atau Cloudflare Tunnel agar bisa diakses dari luar jaringan rumah).*

---

## 📝 Catatan Penting

- **Konten Privat:** Aplikasi ini hanya dapat mengunduh video yang bersifat **PUBLIK**. Jika pengguna IG/TikTok mengunci akun mereka (*Private Account*) atau membatasi penonton videonya, proses pengunduhan akan gagal dengan pesan error.
- **Keamanan Folder Temp:** Sistem secara otomatis akan menyimpan video yang sedang diproses di folder sementara (`os.tmpdir()`). Sistem memiliki kode pintar yang otomatis menghapus file sisa (*cleanup*) agar memori penyimpanan server Anda tidak bocor/penuh.
- **Batasan yt-dlp:** Aplikasi ini sangat bergantung pada proyek sumber terbuka `yt-dlp`. Jika pihak sosial media merubah arsitektur API mereka, fitur unduhan mungkin akan gagal. **Solusi:** Rutin perbarui modul dengan menjalankan perintah `npm update youtube-dl-exec`.

---
*Dibuat dengan ❤️ untuk kemudahan mengelola media sosial.*
