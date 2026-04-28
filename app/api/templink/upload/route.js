import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { randomUUID } from 'crypto';

// Singleton in-memory store (persists during server runtime)
if (!global.tempLinkStore) global.tempLinkStore = new Map();
const linkStore = global.tempLinkStore;

const TEMP_DIR = path.join(os.tmpdir(), 'templinks');

// Cleanup expired links
function cleanupExpired() {
  const now = Date.now();
  for (const [id, meta] of linkStore.entries()) {
    const isTimeExpired = meta.expiresAt && now > meta.expiresAt;
    const isDownloadExpired = meta.maxDownloads !== null && meta.downloadCount >= meta.maxDownloads;
    if (isTimeExpired || isDownloadExpired) {
      try { fs.unlinkSync(meta.filePath); } catch {}
      linkStore.delete(id);
    }
  }
}

export async function POST(req) {
  try {
    cleanupExpired();

    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const expiry = formData.get('expiry'); // '1x' or '24h'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 50MB max
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 50MB.' }, { status: 413 });
    }

    const id = randomUUID();
    const ext = path.extname(file.name) || '';
    const filename = file.name;
    const filePath = path.join(TEMP_DIR, `${id}${ext}`);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const expiresAt = expiry === '24h' ? Date.now() + 24 * 60 * 60 * 1000 : null;
    const maxDownloads = expiry === '1x' ? 1 : null;

    linkStore.set(id, {
      id,
      filename,
      filePath,
      fileSize: file.size,
      createdAt: Date.now(),
      expiresAt,
      maxDownloads,
      downloadCount: 0,
    });

    return NextResponse.json({ id, filename, expiry });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
