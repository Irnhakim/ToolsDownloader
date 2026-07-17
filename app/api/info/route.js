import { NextResponse } from 'next/server';
import youtubedl from 'youtube-dl-exec';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const cookiesPath = path.join(process.cwd(), 'cookies.txt');
    const options = {
      dumpJson: true,
      noWarnings: true,
      noCheckCertificate: true,
      preferFreeFormats: true,
      forceIpv4: true, // Bypass IPv6 routing issues yang sering menyebabkan timeout
    };

    if (fs.existsSync(cookiesPath)) {
      options.cookies = cookiesPath;
    }

    const output = await youtubedl(url, options);

    const formats = output.formats.map(format => ({
      format_id: format.format_id,
      ext: format.ext,
      resolution: format.resolution || 'audio only',
      filesize: format.filesize,
      has_video: format.vcodec !== 'none',
      has_audio: format.acodec !== 'none',
      vcodec: format.vcodec,
      acodec: format.acodec,
      format_note: format.format_note,
    }));

    // Grouping
    const videoFormats = formats
      .filter(f => f.has_video)
      .sort((a, b) => (b.filesize || 0) - (a.filesize || 0));
      
    const audioFormats = formats
      .filter(f => f.has_audio && !f.has_video)
      .sort((a, b) => (b.filesize || 0) - (a.filesize || 0));

    return NextResponse.json({
      title: output.title,
      thumbnail: output.thumbnail,
      duration: output.duration,
      videoFormats,
      audioFormats,
    });
  } catch (error) {
    console.error('Error fetching info:', error);
    
    let userMessage = error.message || String(error);
    if (userMessage.includes('Instagram sent an empty media response') || userMessage.includes('login') || userMessage.includes('cookies')) {
      userMessage = `Instagram/platform ini memerlukan autentikasi. Silakan buat file 'cookies.txt' di folder root proyek (d:\\Programing\\web\\ToolsDownloader\\cookies.txt) berisi cookies dari browser Anda.`;
    }
    
    return NextResponse.json({ error: `Failed to fetch video information: ${userMessage}` }, { status: 500 });
  }
}

