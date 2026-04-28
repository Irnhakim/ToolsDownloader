import './globals.css';

export const metadata = {
  title: 'Tools — Social Downloader, QR Generator & File Tools',
  description: 'Download videos from YouTube, Facebook, Instagram & TikTok. Generate advanced QR codes. Compress, resize images and convert PDF files.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Google Fonts to avoid render-blocking @import */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
