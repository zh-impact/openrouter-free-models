import { Hono } from 'hono'

import type { Env } from '../lib/db'
import { AuthMiddleware } from '../lib/auth'
import { NotificationService } from '../services/notification'
import { StorageService } from '../services/storage'

const telegram = new Hono<{ Bindings: Env }>()

/**
 * POST /api/telegram/webhook - Telegram bot webhook endpoint
 */
telegram.post('/webhook', async c => {
  const storage = new StorageService(c.env.DB)

  const notificationService = new NotificationService(
    storage,
    c.env.TELEGRAM_BOT_TOKEN,
    c.env.TELEGRAM_WEBHOOK_URL
  )

  // Register bot commands
  notificationService.registerTelegramCommands()

  try {
    const update = await c.req.json()

    // Handle the update
    await notificationService.handleTelegramUpdate(update)

    return c.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return c.json({ ok: false, error: 'Failed to process update' }, 500)
  }
})

/**
 * GET /api/telegram/info - Get Telegram bot information
 */
telegram.get('/info', async c => {
  const storage = new StorageService(c.env.DB)

  const notificationService = new NotificationService(
    storage,
    c.env.TELEGRAM_BOT_TOKEN
  )

  const botInfo = await notificationService.getTelegramBotInfo()

  if (!botInfo) {
    return c.json({ error: 'Telegram bot not configured' }, 500)
  }

  return c.json({
    username: botInfo.username,
    link: botInfo.link,
  })
})

/**
 * POST /api/telegram/setup-webhook - Set up Telegram bot webhook
 */
telegram.post('/setup-webhook', async c => {
  const storage = new StorageService(c.env.DB)

  const notificationService = new NotificationService(
    storage,
    c.env.TELEGRAM_BOT_TOKEN,
    c.env.TELEGRAM_WEBHOOK_URL
  )

  if (!c.env.TELEGRAM_WEBHOOK_URL) {
    return c.json({ error: 'TELEGRAM_WEBHOOK_URL not configured' }, 500)
  }

  try {
    await notificationService.setupTelegramWebhook()

    return c.json({
      success: true,
      message: 'Webhook set up successfully',
      webhook_url: c.env.TELEGRAM_WEBHOOK_URL,
    })
  } catch (error) {
    console.error('Failed to set up webhook:', error)
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Failed to set up webhook',
      },
      500
    )
  }
})

/**
 * POST /api/telegram/send - Send message to a specific subscriber
 * Requires admin API key
 */
telegram.post('/send', AuthMiddleware.requireApiKey(), async c => {
  const { chat_id, message } = await c.req.json()

  if (!chat_id) {
    return c.json({ error: 'chat_id is required' }, 400)
  }

  const storage = new StorageService(c.env.DB)

  const notificationService = new NotificationService(
    storage,
    c.env.TELEGRAM_BOT_TOKEN
  )

  try {
    const success = await notificationService.sendToTelegramSubscriber(
      chat_id,
      message || 'Default message'
    )

    return c.json({
      success,
      message: success ? 'Message sent successfully' : 'Failed to send message',
    })
  } catch (error) {
    console.error('Failed to send message:', error)
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send message',
      },
      500
    )
  }
})

/**
 * POST /api/telegram/broadcast - Broadcast message to all Telegram subscribers
 * Requires admin API key
 */
telegram.post('/broadcast', AuthMiddleware.requireApiKey(), async c => {
  const { message } = await c.req.json()

  if (!message) {
    return c.json({ error: 'message is required' }, 400)
  }

  const storage = new StorageService(c.env.DB)

  const notificationService = new NotificationService(
    storage,
    c.env.TELEGRAM_BOT_TOKEN
  )

  try {
    const result = await notificationService.sendBroadcastToAllTelegram(message)

    return c.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('Failed to broadcast:', error)
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Failed to broadcast',
      },
      500
    )
  }
})

/**
 * GET /api/telegram/subscribers - List all Telegram subscribers
 */
telegram.get('/subscribers', async c => {
  const storage = new StorageService(c.env.DB)

  try {
    const subscribers = await storage.getActiveTelegramSubscribers()

    return c.json({
      total: subscribers.length,
      subscribers: subscribers.map((s) => ({
        id: s.id,
        chat_id: s.chat_id,
        username: s.username,
        first_name: s.first_name,
        last_name: s.last_name,
        status: s.status,
        subscribed_at: s.subscribed_at,
        last_notified_at: s.last_notified_at,
      })),
    })
  } catch (error) {
    console.error('Failed to list subscribers:', error)
    return c.json({ error: 'Failed to list subscribers' }, 500)
  }
})

export default telegram
