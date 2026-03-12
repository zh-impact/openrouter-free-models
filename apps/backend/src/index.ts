import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { HTTPException } from 'hono/http-exception'

import type { Env } from './lib/db'
import { DiffService } from './lib/diff'
import { AuthMiddleware } from './lib/auth'

import { NotificationService } from './services/notification'
import { StorageService } from './services/storage'
import { OpenRouterService } from './services/openrouter'

import healthRouter from './routes/health'
import modelsRouter from './routes/models'
import subscriptionsRouter from './routes/subscriptions'
import telegramRouter from './routes/telegram'
import telegramTestRouter from './routes/telegram-test'

const app = new Hono<{ Bindings: Env }>()

// Middleware
app.use('*', cors())
app.use('*', logger())

// Routes
app.route('/api/models', modelsRouter)
app.route('/api/subscriptions', subscriptionsRouter)
app.route('/api/telegram', telegramRouter)
app.route('/api/telegram/test', telegramTestRouter)
app.route('/api', healthRouter)

// Cron endpoint for scheduled updates
app.get('/cron/sync', AuthMiddleware.requireCronSecret(), async c => {

  const openRouter = new OpenRouterService()
  const storage = new StorageService(c.env.DB)
  const diffService = new DiffService()

  try {
    // Fetch current models
    const models = await openRouter.fetchFreeModels()

    // Get existing models from database
    const existingModels = await storage.getActiveModels()

    // Detect changes
    const diff = diffService.detectChanges(existingModels, models)

    // Save changes and update database
    const changes = await storage.saveChanges(diff)

    return c.json({
      success: true,
      timestamp: new Date().toISOString(),
      models_fetched: models.length,
      changes_detected: changes.length,
      changes: changes,
    })
  } catch (error) {
    console.error('Cron sync failed:', error)
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
})

// Cron endpoint for daily digest (email + telegram)
app.get('/cron/daily-digest', AuthMiddleware.requireCronSecret(), async c => {

  const storage = new StorageService(c.env.DB)

  // Initialize notification service
  const notificationService = new NotificationService(
    storage,
    c.env.TELEGRAM_BOT_TOKEN,
    c.env.TELEGRAM_WEBHOOK_URL
  )

  // Register Telegram bot commands
  if (c.env.TELEGRAM_BOT_TOKEN) {
    notificationService.registerTelegramCommands()
  }

  try {
    // Get changes since last digest (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const changes = await storage.getChangesSince(yesterday)

    if (changes.length === 0) {
      return c.json({
        success: true,
        message: 'No changes in the last 24 hours',
        timestamp: new Date().toISOString(),
      })
    }

    // Send daily digest via NotificationService (email + telegram)
    const results = await notificationService.sendDailyDigest(changes)

    return c.json({
      success: true,
      timestamp: new Date().toISOString(),
      changes_count: changes.length,
      results,
    })
  } catch (error) {
    console.error('Daily digest failed:', error)
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
})

// 404 handler
app.notFound(c => {
  return c.json({ error: 'Not Found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Error:', err)

  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }

  return c.json({ error: 'Internal Server Error' }, 500)
})

export default app
