import { NextResponse } from 'next/server';
import { exec } from 'youtube-dl-exec';
import path from 'path';
import fs from 'fs';
import os from 'os';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const format_id = searchParams.get('format_id');
  const ext = searchParams.get('ext') || 'mp4';
  const title = searchParams.get('title') || 'video';
  const downloadId = searchParams.get('downloadId');
  const type = searchParams.get('type') || 'video';

  if (!url || !format_id) {
    return NextResponse.json({ error: 'URL and format_id are required' }, { status: 400 });
  }

  const tmpDir = os.tmpdir();
  const baseFilename = `ytdl_${downloadId || Date.now()}`;
  const outputPath = path.join(tmpDir, `${baseFilename}.%(ext)s`);

  try {
    // 1. Konfigurasi opsi unduhan
    const ytDlpOptions = {
      output: outputPath,
      noCheckCertificates: true,
      noWarnings: true,
    };

    if (type === 'video') {
      // Minta yt-dlp untuk mengunduh video spesifik + audio terbaik, lalu gabungkan ke MP4
      ytDlpOptions.format = `${format_id}+bestaudio[ext=m4a]/${format_id}+bestaudio/${format_id}`;
      ytDlpOptions.mergeOutputFormat = 'mp4';
    } else {
      // Ekstrak audio menjadi mp3
      ytDlpOptions.format = format_id;
      ytDlpOptions.extractAudio = true;
      ytDlpOptions.audioFormat = 'mp3';
    }

    // 2. Lakukan proses unduhan dan konversi (merging) di server
    await exec(url, ytDlpOptions);

    // 3. Cari file hasil yang telah dibuat oleh yt-dlp
    let actualFilePath = '';
    const files = fs.readdirSync(tmpDir);
    const relatedFiles = files.filter(f => f.startsWith(baseFilename));
    
    if (relatedFiles.length > 0) {
      if (type === 'video') {
        // Jika ffmpeg gagal/tidak ada, yt-dlp akan meninggalkan file video dan audio terpisah.
        // Kita harus memastikan yang terpilih adalah file videonya, bukan audionya (.m4a)
        const videoFile = relatedFiles.find(f => f.endsWith('.mp4')) 
                       || relatedFiles.find(f => f.endsWith('.mkv'))
                       || relatedFiles.find(f => f.endsWith('.webm'))
                       || relatedFiles.find(f => !f.endsWith('.m4a') && !f.endsWith('.mp3'));
        actualFilePath = path.join(tmpDir, videoFile || relatedFiles[0]);
      } else {
        actualFilePath = path.join(tmpDir, relatedFiles[0]);
      }
    } else {
      throw new Error('File tidak ditemukan setelah proses download selesai.');
    }

    // 4. Siapkan header HTTP
    const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').substring(0, 50);
    const finalExt = path.extname(actualFilePath).substring(1) || (type === 'video' ? 'mp4' : 'mp3');
    const filename = `${safeTitle}.${finalExt}`;

    const headers = {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': type === 'video' ? 'video/mp4' : 'audio/mpeg',
      'Content-Length': fs.statSync(actualFilePath).size.toString(), // Browser sekarang tahu persis ukuran filenya!
    };

    if (downloadId) {
      headers['Set-Cookie'] = `download_token_${downloadId}=true; Path=/; SameSite=Lax`;
    }

    // 5. Buat Node.js stream dan ubah ke Web ReadableStream
    const fileStream = fs.createReadStream(actualFilePath);
    const readableWebStream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk) => controller.enqueue(chunk));
        fileStream.on('end', () => {
          controller.close();
          // Hapus SEMUA file sementara (termasuk pecahan audio/video jika gagal merge)
          relatedFiles.forEach(f => {
            fs.unlink(path.join(tmpDir, f), () => {});
          });
        });
        fileStream.on('error', (err) => {
          controller.error(err);
          relatedFiles.forEach(f => {
            fs.unlink(path.join(tmpDir, f), () => {});
          });
        });
      },
      cancel() {
        fileStream.destroy();
        relatedFiles.forEach(f => {
          fs.unlink(path.join(tmpDir, f), () => {});
        });
      }
    });

    return new NextResponse(readableWebStream, { headers });
  } catch (error) {
    console.error('Error downloading:', error);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}
