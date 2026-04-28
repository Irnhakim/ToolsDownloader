import fs from 'fs';

// Reference the same singleton store
if (!global.tempLinkStore) global.tempLinkStore = new Map();
const linkStore = global.tempLinkStore;

export async function GET(request, { params }) {
  const { id } = await params;
  const meta = linkStore.get(id);
  const now = Date.now();

  // Not found
  if (!meta) {
    return new Response(
      buildErrorPage('Link Not Found', 'This link does not exist or has already expired and been deleted.', '🔍'),
      { status: 404, headers: { 'Content-Type': 'text/html' } }
    );
  }

  // Time expired
  if (meta.expiresAt && now > meta.expiresAt) {
    linkStore.delete(id);
    try { fs.unlinkSync(meta.filePath); } catch {}
    return new Response(
      buildErrorPage('Link Expired', 'This temporary link has expired (24 hour limit reached).', '⏰'),
      { status: 410, headers: { 'Content-Type': 'text/html' } }
    );
  }

  // Download limit reached
  if (meta.maxDownloads !== null && meta.downloadCount >= meta.maxDownloads) {
    linkStore.delete(id);
    try { fs.unlinkSync(meta.filePath); } catch {}
    return new Response(
      buildErrorPage('Link Used', 'This single-use link has already been downloaded.', '🔒'),
      { status: 410, headers: { 'Content-Type': 'text/html' } }
    );
  }

  // File missing
  if (!fs.existsSync(meta.filePath)) {
    linkStore.delete(id);
    return new Response(
      buildErrorPage('File Not Found', 'The file associated with this link is no longer available.', '📄'),
      { status: 404, headers: { 'Content-Type': 'text/html' } }
    );
  }

  // Increment and stream
  meta.downloadCount++;
  linkStore.set(id, meta);

  const fileBuffer = fs.readFileSync(meta.filePath);

  // Clean up after max downloads reached
  if (meta.maxDownloads !== null && meta.downloadCount >= meta.maxDownloads) {
    linkStore.delete(id);
    try { fs.unlinkSync(meta.filePath); } catch {}
  }

  const safeFilename = encodeURIComponent(meta.filename);

  return new Response(fileBuffer, {
    status: 200,
    headers: {
      'Content-Disposition': `attachment; filename*=UTF-8''${safeFilename}`,
      'Content-Type': 'application/octet-stream',
      'Content-Length': fileBuffer.length.toString(),
    },
  });
}

function buildErrorPage(title, message, emoji) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — Temp Link</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #1e1b4b, #312e81);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      padding: 2rem;
    }
    .card {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 20px;
      padding: 3rem 2.5rem;
      text-align: center;
      max-width: 420px;
      width: 100%;
    }
    .emoji { font-size: 4rem; margin-bottom: 1rem; }
    h1 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.75rem; }
    p { color: rgba(255,255,255,0.7); line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">${emoji}</div>
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}
