import { NextRequest, NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory per-IP request store (IP -> { count, resetAt })
const ipStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipStore.entries()) {
      if (now > record.resetAt) {
        ipStore.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp.trim();
  }
  return '127.0.0.1';
}

export function checkRateLimit(req: NextRequest): {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
} {
  const limit = parseInt(process.env.RATE_LIMIT_PER_MINUTE || '10', 10);
  const windowMs = 60 * 1000;
  const now = Date.now();
  const ip = getClientIp(req);

  const record = ipStore.get(ip);

  if (!record || now > record.resetAt) {
    ipStore.set(ip, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetSeconds: 60,
    };
  }

  if (record.count >= limit) {
    const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      success: false,
      limit,
      remaining: 0,
      resetSeconds,
    };
  }

  record.count += 1;
  const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    resetSeconds,
  };
}

export function createRateLimitResponse(resetSeconds: number): NextResponse {
  return NextResponse.json(
    {
      error: 'Too many requests right now — please wait a minute and try again.',
      retryAfter: resetSeconds,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(resetSeconds),
      },
    }
  );
}
