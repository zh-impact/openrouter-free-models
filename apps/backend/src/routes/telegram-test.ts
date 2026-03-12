import { Hono } from 'hono';
import { Bot } from 'grammy';

import type { Env } from '../lib/db';
import { StorageService } from '../services/storage';

const telegramTest = new Hono<{ Bindings: Env }>();

/**
 * POST /api/telegram/test/add - 测试端点：手动添加 Telegram 订阅者
 * 仅用于本地开发测试
 */
telegramTest.post('/add', async (c) => {
  const { chat_id, username } = await c.req.json();

  if (!chat_id) {
    return c.json({ error: 'chat_id is required' }, 400);
  }

  const storage = new StorageService(c.env.DB);

  try {
    const subscriberId = await storage.addTelegramSubscriber({
      chat_id: String(chat_id),
      username,
    });

    return c.json({
      success: true,
      subscriber_id: subscriberId,
      message: 'Test subscriber added successfully',
    });
  } catch (error) {
    console.error('Failed to add test subscriber:', error);
    return c.json({ error: 'Failed to add subscriber' }, 500);
  }
});

/**
 * GET /api/telegram/test/list - 列出所有 Telegram 订阅者
 */
telegramTest.get('/list', async (c) => {
  const storage = new StorageService(c.env.DB);

  try {
    const subscribers = await storage.getActiveTelegramSubscribers();

    return c.json({
      total: subscribers.length,
      subscribers: subscribers.map((s) => ({
        id: s.id,
        chat_id: s.chat_id,
        username: s.username,
        first_name: s.first_name,
        status: s.status,
        subscribed_at: s.subscribed_at,
      })),
    });
  } catch (error) {
    console.error('Failed to list subscribers:', error);
    return c.json({ error: 'Failed to list subscribers' }, 500);
  }
});

/**
 * POST /api/telegram/test/send - 发送测试消息给指定订阅者
 */
telegramTest.post('/send', async (c) => {
  const { chat_id, message } = await c.req.json();

  if (!chat_id) {
    return c.json({ error: 'chat_id is required' }, 400);
  }

  if (!c.env.TELEGRAM_BOT_TOKEN) {
    return c.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, 500);
  }

  const bot = new Bot(c.env.TELEGRAM_BOT_TOKEN);

  try {
    const testMessage = message || '🧪 This is a test message from OpenRouter Free Models Monitor!\n\nTelegram integration is working correctly.';

    await bot.api.sendMessage(chat_id, testMessage, {
      parse_mode: 'HTML',
    });

    return c.json({
      success: true,
      message: 'Test message sent successfully',
    });
  } catch (error) {
    console.error('Failed to send test message:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send message',
      },
      500
    );
  }
});

/**
 * POST /api/telegram/test/broadcast - 发送测试消息给所有订阅者
 */
telegramTest.post('/broadcast', async (c) => {
  const { message } = await c.req.json();

  if (!c.env.TELEGRAM_BOT_TOKEN) {
    return c.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, 500);
  }

  const storage = new StorageService(c.env.DB);
  const bot = new Bot(c.env.TELEGRAM_BOT_TOKEN);

  try {
    const subscribers = await storage.getActiveTelegramSubscribers();

    if (subscribers.length === 0) {
      return c.json({
        success: true,
        message: 'No active subscribers found',
        sent: 0,
        failed: 0,
      });
    }

    const testMessage = message ||
      '<b>🧪 Test Broadcast</b>\n\n' +
      'This is a test message from <i>OpenRouter Free Models Monitor</i>!\n\n' +
      '✅ Bot is working correctly!\n' +
      '📊 Active subscribers: ' + subscribers.length;

    let sent = 0;
    let failed = 0;
    const errors: Array<{ chat_id: string | number; error: string }> = [];

    for (const subscriber of subscribers) {
      try {
        await bot.api.sendMessage(subscriber.chat_id, testMessage, {
          parse_mode: 'HTML',
        });
        sent++;
        await storage.updateTelegramLastNotified(subscriber.id);
      } catch (error) {
        failed++;
        errors.push({
          chat_id: subscriber.chat_id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return c.json({
      success: true,
      message: 'Broadcast completed',
      total: subscribers.length,
      sent,
      failed,
      errors,
    });
  } catch (error) {
    console.error('Failed to send broadcast:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send broadcast',
      },
      500
    );
  }
});

/**
 * POST /api/telegram/test/daily-digest - 发送模拟的每日摘要消息
 */
telegramTest.post('/daily-digest', async (c) => {
  if (!c.env.TELEGRAM_BOT_TOKEN) {
    return c.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, 500);
  }

  const storage = new StorageService(c.env.DB);
  const bot = new Bot(c.env.TELEGRAM_BOT_TOKEN);

  try {
    const subscribers = await storage.getActiveTelegramSubscribers();

    if (subscribers.length === 0) {
      return c.json({
        success: true,
        message: 'No active subscribers found',
        sent: 0,
        failed: 0,
      });
    }

    // 模拟变更数据
    const mockChanges = {
      added: [
        { name: 'google/gemma-3-27b-it:free' },
        { name: 'meta/llama-3-70b-instruct:free' },
      ],
      removed: [
        { name: 'openai/gpt-3.5-turbo:free' },
      ],
      modified: [
        { name: 'anthropic/claude-3-haiku:free' },
      ],
    };

    let message = '<b>🤖 OpenRouter Free Models Update</b>\n\n';

    if (mockChanges.added.length > 0) {
      message += '<b>✅ New Free Models</b> (' + mockChanges.added.length + ')\n';
      for (const model of mockChanges.added) {
        message += '  • ' + model.name + '\n';
      }
      message += '\n';
    }

    if (mockChanges.removed.length > 0) {
      message += '<b>❌ Removed from Free Tier</b> (' + mockChanges.removed.length + ')\n';
      for (const model of mockChanges.removed) {
        message += '  • ' + model.name + '\n';
      }
      message += '\n';
    }

    if (mockChanges.modified.length > 0) {
      message += '<b>🔄 Modified Models</b> (' + mockChanges.modified.length + ')\n';
      for (const model of mockChanges.modified) {
        message += '  • ' + model.name + '\n';
      }
      message += '\n';
    }

    message += '📅 ' + new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    message += '\n\n<i>🧪 This is a test daily digest</i>';

    let sent = 0;
    let failed = 0;
    const errors: Array<{ chat_id: string | number; error: string }> = [];

    for (const subscriber of subscribers) {
      try {
        await bot.api.sendMessage(subscriber.chat_id, message, {
          parse_mode: 'HTML',
        });
        sent++;
        await storage.updateTelegramLastNotified(subscriber.id);
      } catch (error) {
        failed++;
        errors.push({
          chat_id: subscriber.chat_id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return c.json({
      success: true,
      message: 'Test daily digest sent',
      total: subscribers.length,
      sent,
      failed,
      errors,
    });
  } catch (error) {
    console.error('Failed to send test daily digest:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send test daily digest',
      },
      500
    );
  }
});

export default telegramTest;
