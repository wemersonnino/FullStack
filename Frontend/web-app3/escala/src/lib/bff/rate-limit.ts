import 'server-only';

import { Socket } from 'node:net';
import { NextResponse } from 'next/server';

type RateLimitOptions = {
  name: string;
  limit: number;
  windowMs: number;
  keyParts?: Array<string | null | undefined>;
};

type RateLimitResult = {
  key: string;
  count: number;
  limit: number;
  windowMs: number;
};

type RedisConfig = {
  host: string;
  port: number;
  password?: string;
};

type RedisBuffer = Buffer<ArrayBufferLike>;

const memoryBuckets = new Map<string, { count: number; expiresAt: number }>();

export async function enforceRateLimit(
  request: Request,
  options: RateLimitOptions
): Promise<NextResponse | null> {
  const result = await incrementRateLimitCounter(request, options);
  const retryAfterSeconds = Math.max(1, Math.ceil(result.windowMs / 1000));
  const remaining = Math.max(0, result.limit - result.count);

  if (result.count <= result.limit) {
    return null;
  }

  return NextResponse.json(
    {
      message: 'Muitas tentativas para esta operacao. Aguarde e tente novamente.',
      code: 'RATE_LIMITED',
    },
    {
      status: 429,
      headers: {
        'Cache-Control': 'no-store',
        'Retry-After': String(retryAfterSeconds),
        'X-Content-Type-Options': 'nosniff',
        'RateLimit-Limit': String(result.limit),
        'RateLimit-Remaining': String(remaining),
        'RateLimit-Reset': String(Math.floor(Date.now() / 1000) + retryAfterSeconds),
      },
    }
  );
}

async function incrementRateLimitCounter(
  request: Request,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const bucket = Math.floor(Date.now() / options.windowMs);
  const key = [
    'escala',
    'bff',
    'rate-limit',
    options.name,
    String(bucket),
    buildRequestFingerprint(request, options.keyParts),
  ].join(':');

  const count = (await incrementRedisBucket(key, options.windowMs)) ?? incrementMemoryBucket(key, options.windowMs);

  return {
    key,
    count,
    limit: options.limit,
    windowMs: options.windowMs,
  };
}

function buildRequestFingerprint(
  request: Request,
  keyParts: Array<string | null | undefined> = []
) {
  const clientIp =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';

  const userAgent = request.headers.get('user-agent') || 'unknown-agent';
  const extras = keyParts
    .map((value) => value?.trim().toLowerCase())
    .filter((value): value is string => Boolean(value));

  return [clientIp, userAgent, ...extras].join('|');
}

function incrementMemoryBucket(key: string, windowMs: number) {
  const now = Date.now();
  const current = memoryBuckets.get(key);

  if (!current || current.expiresAt <= now) {
    memoryBuckets.set(key, { count: 1, expiresAt: now + windowMs });
    cleanupMemoryBuckets(now);
    return 1;
  }

  current.count += 1;
  return current.count;
}

function cleanupMemoryBuckets(now: number) {
  if (memoryBuckets.size < 500) {
    return;
  }

  for (const [key, entry] of memoryBuckets.entries()) {
    if (entry.expiresAt <= now) {
      memoryBuckets.delete(key);
    }
  }
}

async function incrementRedisBucket(key: string, windowMs: number) {
  const config = resolveRedisConfig();
  if (!config) {
    return null;
  }

  try {
    const responses = await sendRedisCommands(config, [
      ['INCR', key],
      ['EXPIRE', key, String(Math.max(1, Math.ceil(windowMs / 1000) + 1))],
    ]);
    const count = responses[0];
    return typeof count === 'number' ? count : null;
  } catch {
    return null;
  }
}

function resolveRedisConfig(): RedisConfig | null {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    const parsed = new URL(redisUrl);
    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 6379,
      password: parsed.password || undefined,
    };
  }

  if (!process.env.REDIS_HOST) {
    return null;
  }

  return {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  };
}

async function sendRedisCommands(config: RedisConfig, commands: string[][]) {
  const socket = new Socket();
  const payload = buildRedisPayload(config.password, commands);

  return new Promise<Array<string | number | null>>((resolve, reject) => {
    let buffer: RedisBuffer = Buffer.alloc(0);
    const replies: Array<string | number | null> = [];
    const expectedReplies = commands.length + (config.password ? 1 : 0);

    socket.setTimeout(700);

    socket.on('connect', () => {
      socket.write(payload);
    });

    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);

      while (replies.length < expectedReplies) {
        const parsed = parseRedisReply(buffer);
        if (!parsed) {
          break;
        }
        buffer = parsed.rest;
        replies.push(parsed.value);
      }

      if (replies.length === expectedReplies) {
        socket.end();
        resolve(config.password ? replies.slice(1) : replies);
      }
    });

    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('Redis timeout'));
    });

    socket.on('error', (error) => {
      socket.destroy();
      reject(error);
    });

    socket.connect(config.port, config.host);
  });
}

function buildRedisPayload(password: string | undefined, commands: string[][]) {
  const allCommands = password ? [['AUTH', password], ...commands] : commands;
  return allCommands.map(encodeRedisCommand).join('');
}

function encodeRedisCommand(parts: string[]) {
  const encoded = parts
    .map((part) => `$${Buffer.byteLength(part)}\r\n${part}\r\n`)
    .join('');
  return `*${parts.length}\r\n${encoded}`;
}

function parseRedisReply(buffer: RedisBuffer): { value: string | number | null; rest: RedisBuffer } | null {
  const prefix = String.fromCharCode(buffer[0] ?? 0);
  const lineEnd = buffer.indexOf('\r\n');
  if (lineEnd === -1) {
    return null;
  }

  if (prefix === '+' || prefix === '-') {
    const value = buffer.subarray(1, lineEnd).toString('utf8');
    if (prefix === '-') {
      throw new Error(value);
    }
    return { value, rest: buffer.subarray(lineEnd + 2) };
  }

  if (prefix === ':') {
    const value = Number(buffer.subarray(1, lineEnd).toString('utf8'));
    return { value, rest: buffer.subarray(lineEnd + 2) };
  }

  if (prefix === '$') {
    const size = Number(buffer.subarray(1, lineEnd).toString('utf8'));
    if (size === -1) {
      return { value: null, rest: buffer.subarray(lineEnd + 2) };
    }
    const end = lineEnd + 2 + size;
    if (buffer.length < end + 2) {
      return null;
    }
    return {
      value: buffer.subarray(lineEnd + 2, end).toString('utf8'),
      rest: buffer.subarray(end + 2),
    };
  }

  return null;
}
