import { NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const action = formData.get('action'); // 'compress' or 'resize'
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let sharpInstance = sharp(buffer);
    const metadata = await sharpInstance.metadata();
    const format = metadata.format || 'jpeg';

    if (action === 'compress') {
      const quality = parseInt(formData.get('quality') || '80', 10);
      
      if (format === 'jpeg' || format === 'jpg') {
        sharpInstance = sharpInstance.jpeg({ quality, mozjpeg: true });
      } else if (format === 'png') {
        sharpInstance = sharpInstance.png({ quality, compressionLevel: 9 });
      } else if (format === 'webp') {
        sharpInstance = sharpInstance.webp({ quality });
      } else {
        // Fallback to jpeg
        sharpInstance = sharpInstance.jpeg({ quality });
      }
      
    } else if (action === 'resize') {
      const widthStr = formData.get('width');
      const heightStr = formData.get('height');
      const width = widthStr ? parseInt(widthStr, 10) : null;
      const height = heightStr ? parseInt(heightStr, 10) : null;
      const mode = formData.get('mode'); // 'auto' or 'custom'
      const fitOption = formData.get('fit'); // 'fit' or 'fill'

      if (mode === 'auto') {
        sharpInstance = sharpInstance.resize({
          width: width || undefined,
          height: height || undefined,
          fit: 'inside' // Menjaga aspect ratio
        });
      } else if (mode === 'custom') {
        sharpInstance = sharpInstance.resize({
          width: width || undefined,
          height: height || undefined,
          // 'cover' = crop biar pas ukuran (Fill)
          // 'contain' = padding biar muat semua (Fit)
          fit: fitOption === 'fill' ? 'cover' : 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent padding
        });
      }
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const outputBuffer = await sharpInstance.toBuffer();
    
    return new Response(outputBuffer, {
      status: 200,
      headers: {
        'Content-Type': `image/${format}`,
        'Content-Disposition': `attachment; filename="processed_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}"`,
      },
    });

  } catch (error) {
    console.error('Image processing error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
