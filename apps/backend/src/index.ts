import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { HTTPException } from 'hono/http-exception';
import modelsRouter from './routes/models.js';
import subscriptionsRouter from './routes/subscriptions.js';
import healthRouter from './routes/health.js';
import { OpenRouterService } from './services/openrouter.js';
import { StorageService } from './services/storage.js';
import { ResendService } from './services/resend.js';
import { DigestService } from './services/digest.js';
import { DiffService } from './lib/diff.js';
import type { Env } from './lib/db.js';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Routes
app.route('/api/models', modelsRouter);
app.route('/api/subscriptions', subscriptionsRouter);
app.route('/api', healthRouter);

// Cron endpoint for scheduled updates
app.get('/cron/sync', async (c) => {
  // Verify cron secret in production
  const authHeader = c.req.header('Authorization');
  const cronSecret = c.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const openRouter = new OpenRouterService();
  const storage = new StorageService(c.env.DB);
  const diffService = new DiffService();

  try {
    // Fetch current models
    const models = await openRouter.fetchFreeModels();

    // Get existing models from database
    const existingModels = await storage.getActiveModels();

    // Detect changes
    const diff = diffService.detectChanges(existingModels, models);

    // Save changes and update database
    const changes = await storage.saveChanges(diff);

    return c.json({
      success: true,
      timestamp: new Date().toISOString(),
      models_fetched: models.length,
      changes_detected: changes.length,
      changes: changes,
    });
  } catch (error) {
    console.error('Cron sync failed:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// Cron endpoint for daily digest emails
app.get('/cron/daily-digest', async (c) => {
  // Verify cron secret
  const authHeader = c.req.header('Authorization');
  const cronSecret = c.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Check if Resend is configured
  if (!c.env.RESEND_API_KEY) {
    return c.json({ error: 'Resend API key not configured' }, 500);
  }

  const storage = new StorageService(c.env.DB);
  const resend = new ResendService(
    c.env.RESEND_API_KEY,
    c.env.RESEND_FROM_EMAIL || 'noreply@openrouter-free-models.pages.dev',
    c.env.BASE_URL || 'https://openrouter-free-models-frontend.pages.dev'
  );
  const digestService = new DigestService(storage, resend);

  try {
    // Get changes since last digest (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const changes = await storage.getChangesSince(yesterday);

    if (changes.length === 0) {
      return c.json({
        success: true,
        message: 'No changes in the last 24 hours',
        timestamp: new Date().toISOString(),
      });
    }

    // Send daily digest
    const results = await digestService.sendDailyDigest(changes);

    return c.json({
      success: true,
      timestamp: new Date().toISOString(),
      changes_count: changes.length,
      digest: results,
    });
  } catch (error) {
    console.error('Daily digest failed:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);

  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }

  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;
