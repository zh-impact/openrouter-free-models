import type { Context, Next } from 'hono';

import type { Env } from './db';

/**
 * API authentication middleware
 */
export class AuthMiddleware {
  /**
   * Verify API key for admin endpoints
   */
  static requireApiKey() {
    return async (c: Context<{ Bindings: Env }>, next: Next) => {
      const authHeader = c.req.header('Authorization');
      const providedKey = authHeader?.replace('Bearer ', '');
      const apiKey = c.env.ADMIN_API_KEY;

      if (!apiKey) {
        return c.json({ error: 'API key not configured' }, 500);
      }

      if (providedKey !== apiKey) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      return await next();
    };
  }

  /**
   * Verify cron secret for scheduled tasks
   */
  static requireCronSecret() {
    return async (c: Context<{ Bindings: Env }>, next: Next) => {
      const authHeader = c.req.header('Authorization');
      const providedSecret = authHeader?.replace('Bearer ', '');
      const cronSecret = c.env.CRON_SECRET;

      if (!cronSecret) {
        // In development, allow without secret
        if (c.env.DEBUG === 'true') {
          return await next();
        }
        return c.json({ error: 'Cron secret not configured' }, 500);
      }

      if (providedSecret !== cronSecret) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      return await next();
    };
  }

  /**
   * Rate limiting middleware (simple in-memory)
   * In production, use Cloudflare Workers KV or D1
   */
  static rateLimit(maxRequests: number = 10, windowMs: number = 60000) {
    const requests = new Map<string, { count: number; resetTime: number }>();

    return async (c: Context, next: Next) => {
      // Get client identifier (IP or email from body)
      const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';

      const now = Date.now();
      const record = requests.get(ip);

      if (!record || now > record.resetTime) {
        // First request or window expired
        requests.set(ip, { count: 1, resetTime: now + windowMs });
        return await next();
      }

      if (record.count >= maxRequests) {
        return c.json({
          error: 'Too many requests',
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        }, 429);
      }

      record.count++;
      return await next();
    };
  }

  /**
   * Verify unsubscribe token
   */
  static verifyUnsubscribeToken(token: string | undefined) {
    return async (c: Context, next: Next) => {
      if (!token) {
        return c.json({ error: 'Missing unsubscribe token' }, 400);
      }

      if (!this.isValidUUID(token)) {
        return c.json({ error: 'Invalid unsubscribe token' }, 400);
      }

      // Store token in context for later use
      c.set('unsubscribeToken', token);
      return await next();
    };
  }

  /**
   * Validate UUID format
   */
  private static isValidUUID(token: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(token);
  }
}
