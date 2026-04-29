import { NextResponse } from 'next/server';

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Extract pin ID directly from URL string (no network call needed)
function extractPinId(url) {
  const match = /\/pin\/(\d+)/i.exec(url);
  return match?.[1] || null;
}

// Get meta content from HTML
function getMeta(html, ...properties) {
  for (const prop of properties) {
    const r1 = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'is').exec(html);
    const r2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'is').exec(html);
    const v = (r1 || r2)?.[1];
    if (v) return v.trim();
  }
  return null;
}

// Upgrade pinimg.com URL to highest quality
function upgradeImageUrl(url) {
  if (!url) return url;
  // Replace size prefixes like /236x/, /474x/, /564x/, /736x/ → /originals/
  return url.replace(/\/\d+x(?:\/|$)/, '/originals/');
}

export async function POST(req) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    // === Step 1: Resolve final URL (handle pin.it short links & regional domains) ===
    let finalUrl = url;
    if (url.includes('pin.it/') || !url.includes('/pin/')) {
      try {
        const headRes = await fetch(url, {
          method: 'GET',
          headers: { 'User-Agent': BROWSER_UA },
          redirect: 'follow',
        });
        finalUrl = headRes.url || url;
      } catch {
        finalUrl = url;
      }
    }

    // Normalize to www.pinterest.com
    finalUrl = finalUrl.replace(/https?:\/\/[a-z]{0,3}\.?pinterest\.[a-z.]+\//, 'https://www.pinterest.com/');

    // === Step 2: Fetch Pinterest page HTML ===
    const res = await fetch(finalUrl, {
      headers: {
        'User-Agent': BROWSER_UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
      },
      redirect: 'follow',
    });

    if (!res.ok) {
      throw new Error(`Pinterest page returned HTTP ${res.status}`);
    }

    const html = await res.text();

    // === Step 3: Try JSON-LD (most reliable — server-rendered by Pinterest) ===
    const ldBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    for (const block of ldBlocks) {
      try {
        const ld = JSON.parse(block[1]);
        if (ld['@type'] === 'VideoObject' && ld.contentUrl) {
          return NextResponse.json({
            type: 'video',
            title: ld.name || ld.description || 'Pinterest Video',
            thumbnail: ld.thumbnailUrl || ld.image || getMeta(html, 'og:image'),
            formats: [{ format_id: 'original', quality: 'Original', ext: 'mp4', url: ld.contentUrl }],
          });
        }
        if ((ld['@type'] === 'ImageObject' || ld['@type'] === 'Article') && ld.contentUrl) {
          const imgUrl = upgradeImageUrl(ld.contentUrl);
          return NextResponse.json({
            type: 'image',
            title: ld.name || ld.description || 'Pinterest Image',
            thumbnail: imgUrl,
            downloadUrl: imgUrl,
          });
        }
      } catch { /* ignore parse errors */ }
    }

    // === Step 4: Look for v.pinimg.com video URLs embedded in page scripts ===
    const videoUrlMatch = /["'](https:\/\/v\.pinimg\.com\/[^"']+\.mp4[^"']*?)["']/i.exec(html);
    if (videoUrlMatch) {
      const videoUrl = videoUrlMatch[1].replace(/\\u002F/g, '/');
      const ogImage = getMeta(html, 'og:image');
      const ogTitle = getMeta(html, 'og:title', 'og:description');
      return NextResponse.json({
        type: 'video',
        title: ogTitle || 'Pinterest Video',
        thumbnail: ogImage,
        formats: [{ format_id: 'original', quality: 'Original', ext: 'mp4', url: videoUrl }],
      });
    }

    // === Step 5: OG meta tags (image fallback) ===
    const ogImage = getMeta(html, 'og:image');
    const ogVideo = getMeta(html, 'og:video', 'og:video:url', 'og:video:secure_url');
    const ogTitle = getMeta(html, 'og:title', 'og:description', 'description');

    if (ogVideo) {
      return NextResponse.json({
        type: 'video',
        title: ogTitle || 'Pinterest Video',
        thumbnail: ogImage,
        formats: [{ format_id: 'original', quality: 'Original', ext: 'mp4', url: ogVideo }],
      });
    }

    if (ogImage) {
      const hiResUrl = upgradeImageUrl(ogImage);
      return NextResponse.json({
        type: 'image',
        title: ogTitle || 'Pinterest Image',
        thumbnail: ogImage,
        downloadUrl: hiResUrl,
      });
    }

    // === Nothing found ===
    const pinId = extractPinId(finalUrl);
    throw new Error(
      `Could not extract media from pin${pinId ? ` ${pinId}` : ''}. ` +
      `The pin may be private, deleted, or Pinterest is blocking this request.`
    );

  } catch (err) {
    console.error('[Pinterest API Error]', err.message);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch Pinterest content' },
      { status: 500 }
    );
  }
}
