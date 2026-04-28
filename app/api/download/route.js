import { NextResponse } from 'next/server';
import { exec } from 'youtube-dl-exec';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const format_id = searchParams.get('format_id');
  const ext = searchParams.get('ext') || 'mp4';
  const title = searchParams.get('title') || 'video';
  const downloadId = searchParams.get('downloadId');

  if (!url || !format_id) {
    return NextResponse.json({ error: 'URL and format_id are required' }, { status: 400 });
  }

  try {
    const subprocess = exec(url, {
      format: format_id,
      output: '-', // stream to stdout
    });

    const stream = new ReadableStream({
      start(controller) {
        subprocess.stdout.on('data', (chunk) => {
          controller.enqueue(chunk);
        });
        subprocess.stdout.on('end', () => {
          controller.close();
        });
        subprocess.stdout.on('error', (err) => {
          controller.error(err);
        });
      },
      cancel() {
        subprocess.kill();
      }
    });

    const safeTitle = title.replace(/[^a-z0-9\u00C0-\u024F\u1E00-\u1EFF]/gi, '_').replace(/_+/g, '_').substring(0, 50);
    const filename = `${safeTitle}.${ext}`;

    const headers = {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': 'application/octet-stream',
    };

    if (downloadId) {
      headers['Set-Cookie'] = `download_token_${downloadId}=true; Path=/; SameSite=Lax`;
    }

    return new NextResponse(stream, { headers });
  } catch (error) {
    console.error('Error streaming download:', error);
    return NextResponse.json({ error: 'Failed to stream download' }, { status: 500 });
  }
}
