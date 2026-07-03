import 'server-only';

import { mkdir, readdir, readFile, unlink, writeFile } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const PRIVATE_AVATAR_DIR = path.join(process.cwd(), '.data', 'private', 'avatars');
const ALLOWED_AVATAR_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_AVATAR_EXTENSIONS = new Set(['.jpg', '.png', '.webp']);
const MAX_AVATAR_DIMENSION = 512;
const MAX_AVATAR_INPUT_PIXELS = 4096 * 4096;

type AvatarFormat = {
  extension: '.jpg' | '.png' | '.webp';
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
};

function isPng(bytes: Uint8Array) {
  return bytes.length >= 8
    && bytes[0] === 0x89
    && bytes[1] === 0x50
    && bytes[2] === 0x4e
    && bytes[3] === 0x47
    && bytes[4] === 0x0d
    && bytes[5] === 0x0a
    && bytes[6] === 0x1a
    && bytes[7] === 0x0a;
}

function isJpeg(bytes: Uint8Array) {
  return bytes.length >= 3
    && bytes[0] === 0xff
    && bytes[1] === 0xd8
    && bytes[2] === 0xff;
}

function isWebp(bytes: Uint8Array) {
  return bytes.length >= 12
    && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF'
    && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
}

export function detectAvatarFormat(bytes: Uint8Array): AvatarFormat | null {
  if (isJpeg(bytes)) {
    return { extension: '.jpg', contentType: 'image/jpeg' };
  }

  if (isPng(bytes)) {
    return { extension: '.png', contentType: 'image/png' };
  }

  if (isWebp(bytes)) {
    return { extension: '.webp', contentType: 'image/webp' };
  }

  return null;
}

export function isAllowedDeclaredAvatarType(contentType: string) {
  return ALLOWED_AVATAR_MIME_TYPES.has(contentType);
}

export async function ensurePrivateAvatarDir() {
  await mkdir(PRIVATE_AVATAR_DIR, { recursive: true });
  return PRIVATE_AVATAR_DIR;
}

export function sanitizeAvatarFileName(fileName: string) {
  if (!fileName || fileName !== path.basename(fileName)) {
    return null;
  }

  const extension = path.extname(fileName).toLowerCase();
  if (!ALLOWED_AVATAR_EXTENSIONS.has(extension)) {
    return null;
  }

  if (!/^[A-Za-z0-9-]+\.(jpg|png|webp)$/.test(fileName)) {
    return null;
  }

  return fileName;
}

export function buildPrivateAvatarUrl(fileName: string) {
  return `/api/bff/avatar/files/${fileName}`;
}

export async function sanitizeAvatarImage(bytes: Uint8Array) {
  const processedBuffer = await sharp(Buffer.from(bytes), {
    failOn: 'error',
    limitInputPixels: MAX_AVATAR_INPUT_PIXELS,
    sequentialRead: true,
  })
    .rotate()
    .resize(MAX_AVATAR_DIMENSION, MAX_AVATAR_DIMENSION, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality: 82,
      effort: 4,
    })
    .toBuffer();

  return {
    bytes: new Uint8Array(processedBuffer),
    format: {
      extension: '.webp' as const,
      contentType: 'image/webp' as const,
    },
  };
}

export async function replaceUserAvatarFile(userId: string, bytes: Uint8Array, format: AvatarFormat) {
  const directory = await ensurePrivateAvatarDir();
  const safeUserId = userId.replace(/[^A-Za-z0-9-]/g, '');

  if (!safeUserId) {
    throw new Error('Invalid user id for avatar storage');
  }

  const existingFiles = await readdir(directory);
  await Promise.all(
    existingFiles
      .filter((name) => name.startsWith(`${safeUserId}-`))
      .map((name) => unlink(path.join(directory, name)).catch(() => undefined)),
  );

  const fileName = `${safeUserId}-${crypto.randomUUID()}${format.extension}`;
  await writeFile(path.join(directory, fileName), bytes);
  return fileName;
}

export async function readPrivateAvatarFile(fileName: string) {
  const safeFileName = sanitizeAvatarFileName(fileName);
  if (!safeFileName) {
    return null;
  }

  const extension = path.extname(safeFileName).toLowerCase();
  const contentType = extension === '.png'
    ? 'image/png'
    : extension === '.webp'
      ? 'image/webp'
      : 'image/jpeg';

  const bytes = await readFile(path.join(await ensurePrivateAvatarDir(), safeFileName));
  return { bytes, contentType };
}
