import { NextResponse } from 'next/server';
import youtubedl from 'youtube-dl-exec';

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const output = await youtubedl(url, {
      dumpJson: true,
      noWarnings: true,
      noCheckCertificate: true,
      preferFreeFormats: true,
    });

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
    return NextResponse.json({ error: `Failed to fetch video information: ${error.message || error}` }, { status: 500 });
  }
}
