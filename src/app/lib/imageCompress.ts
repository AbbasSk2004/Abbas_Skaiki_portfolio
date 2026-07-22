'use client';

// -----------------------------------------------------------------------------
// Client-side image compression / downscale, run BEFORE any admin upload.
//
// Why this exists: the admin panel uploads originals straight from the file
// picker. A desktop screenshot (PNG) or a modern phone photo is routinely
// 4–10 MB. Pushing that much over an flaky path — a reverse proxy with a body
// limit, an antivirus doing HTTPS inspection, or a slow uplink — is exactly what
// makes a multipart PUT/POST get reset mid-flight (the browser then surfaces it
// as the misleading "Failed to fetch" / CORS error). Shrinking to a ~1920px,
// re-encoded webp/jpeg drops the payload to a few hundred KB, so the request is
// small enough to sail past all of those layers, uploads faster, and costs less
// Cloudinary bandwidth. Cloudinary re-encodes on ingest anyway, so nothing is
// lost by sending it a smaller, already-web-friendly file.
//
// This NEVER throws and NEVER blocks an upload: any failure (unsupported format,
// no canvas, decode error) falls back to the original File untouched.
// -----------------------------------------------------------------------------

export type CompressOptions = {
  /** Longest edge, in px, the output is scaled down to (never scaled up). */
  maxDimension?: number;
  /** Lossy encoder quality, 0..1. Ignored by PNG. */
  quality?: number;
  /** Preferred output type. Falls back to JPEG if the browser can't encode it. */
  mimeType?: string;
  /** If the file is already at/under this size AND needs no downscale, skip. */
  maxBytes?: number;
};

const DEFAULTS: Required<CompressOptions> = {
  maxDimension: 1920,
  quality: 0.82,
  mimeType: 'image/webp',
  maxBytes: 500 * 1024, // 500 KB
};

// GIF (animation) and SVG (vector) can't round-trip through a raster canvas
// meaningfully, and SVGs are already tiny — leave both alone.
const canCompress = (file: File) =>
  typeof window !== 'undefined' &&
  typeof document !== 'undefined' &&
  file.type.startsWith('image/') &&
  file.type !== 'image/gif' &&
  file.type !== 'image/svg+xml';

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, quality));
}

/**
 * Compress/downscale a single image. Resolves to a new (smaller) File, or the
 * ORIGINAL file if compression isn't applicable or wouldn't help.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const opts = { ...DEFAULTS, ...options };
  try {
    if (!canCompress(file)) return file;

    const img = await loadImage(file);
    const longest = Math.max(img.width, img.height);
    const scale = longest > opts.maxDimension ? opts.maxDimension / longest : 1;

    // Nothing to gain: already small AND no downscale needed.
    if (scale === 1 && file.size <= opts.maxBytes) return file;

    const targetW = Math.max(1, Math.round(img.width * scale));
    const targetH = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, targetW, targetH);

    // Try the efficient encoder first; older Safari can't encode webp and
    // returns null (or a fallback PNG), so fall back to JPEG in that case.
    let blob = await canvasToBlob(canvas, opts.mimeType, opts.quality);
    let outType = opts.mimeType;
    if (!blob || (opts.mimeType === 'image/webp' && blob.type !== 'image/webp')) {
      blob = await canvasToBlob(canvas, 'image/jpeg', opts.quality);
      outType = 'image/jpeg';
    }
    if (!blob) return file;

    // If re-encoding somehow produced a larger file, keep the original.
    if (blob.size >= file.size) return file;

    const ext = outType === 'image/webp' ? 'webp' : 'jpg';
    const base = file.name.replace(/\.[^.]+$/, '') || 'image';
    return new File([blob], `${base}.${ext}`, {
      type: outType,
      lastModified: file.lastModified,
    });
  } catch {
    // Compression must never break an upload — send the original as-is.
    return file;
  }
}

/** Compress many images concurrently. Preserves order. */
export async function compressImages(
  files: File[],
  options: CompressOptions = {}
): Promise<File[]> {
  return Promise.all(files.map((f) => compressImage(f, options)));
}
