export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');
  const filename = searchParams.get('filename') || 'pinterest_image.jpg';

  if (!imageUrl) return new Response('Missing URL', { status: 400 });

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'Referer': 'https://www.pinterest.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return new Response(`Upstream error: ${response.status}`, { status: 502 });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');

    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    });
    if (contentLength) headers.set('Content-Length', contentLength);

    // Stream directly — don't buffer into memory
    return new Response(response.body, { headers });
  } catch (err) {
    return new Response('Failed to download image: ' + err.message, { status: 500 });
  }
}
