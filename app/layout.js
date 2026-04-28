import './globals.css';

export const metadata = {
  title: 'YouTube Downloader',
  description: 'Download YouTube videos locally',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
