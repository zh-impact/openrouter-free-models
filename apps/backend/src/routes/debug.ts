import { Hono } from 'hono';
import type { Env } from '../lib/db.js';

const debug = new Hono<{ Bindings: Env }>();

/**
 * GET /api/debug/env - Debug environment variables (remove in production)
 */
debug.get('/env', (c) => {
  return c.json({
    telegram_bot_token: c.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT_SET',
    telegram_bot_token_length: c.env.TELEGRAM_BOT_TOKEN?.length || 0,
    telegram_webhook_url: c.env.TELEGRAM_WEBHOOK_URL || 'NOT_SET',
    has_telegram_token: !!c.env.TELEGRAM_BOT_TOKEN,
  });
});

export default debug;
