import { NextResponse } from 'next/server';
// Trigger recompile to fix Turbopack ChunkLoadError


export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    // Fetch the target stream page with the whitelisted referer
    const res = await fetch(targetUrl, {
      headers: {
        'Referer': 'https://starballtv09.blogspot.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) {
      return new NextResponse(`Failed to fetch player: ${res.statusText}`, { status: res.status });
    }

    let html = await res.text();

    // 1. Convert relative links/sources to absolute pointing to serverplayer2.pages.dev
    // e.g. src="/... -> src="https://serverplayer2.pages.dev/...
    html = html.replace(/(src|href)="\/([^"]*)/g, '$1="https://serverplayer2.pages.dev/$2');

    // 2. Strip the DRM / block scripts. We replace allow.js and block.js with blank/no-op scripts
    html = html.replace(/https:\/\/serverplayer2\.pages\.dev\/script\/allow\.js(\?v=\d+)?/g, '');
    html = html.replace(/https:\/\/serverplayer2\.pages\.dev\/script\/block\.js(\?v=\d+)?/g, '');
    html = html.replace(/\/script\/allow\.js(\?v=\d+)?/g, '');
    html = html.replace(/\/script\/block\.js(\?v=\d+)?/g, '');

    // 3. Strip disable-devtool script to prevent console/page wipes in dev environments
    html = html.replace(/<script[^>]*disable-devtool[^>]*><\/script>/gi, '');

    // 3. Inject a script inside the head to mock ancestorOrigins or top location if needed
    const mockScript = `
      <script>
        // Prevent redirects by overriding location.replace or similar
        window.location.replace = function(url) {
          console.log('[Bypassed Redirect] Tried to redirect to:', url);
        };
        // Mock document.referrer to be whitelisted
        Object.defineProperty(document, 'referrer', {
          get: () => 'https://starballtv09.blogspot.com/'
        });
      </script>
    `;
    html = html.replace('<head>', `<head>${mockScript}`);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'ALLOWALL'
      }
    });
  } catch (error) {
    console.error('Proxy error:', error);
    const causeStr = error.cause ? (error.cause.stack || error.cause.message || JSON.stringify(error.cause)) : 'none';
    return new NextResponse(`Proxy error: ${error.message}. Cause: ${causeStr}`, { status: 500 });
  }
}
