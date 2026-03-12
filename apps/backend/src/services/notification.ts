import { Bot } from 'grammy';

import type { ModelChangeWithDetails } from '@openrouter-free-models/shared';
import { StorageService } from './storage';

/**
 * Notification service for sending alerts about model changes via multiple channels
 */
export class NotificationService {
  private telegramBot?: Bot;

  constructor(
    private storage: StorageService,
    private telegramBotToken?: string,
    private telegramWebhookUrl?: string
  ) {
    if (this.telegramBotToken) {
      this.telegramBot = new Bot(this.telegramBotToken);
    }
  }

  /**
   * Send daily digest to all subscribers (email + telegram)
   */
  async sendDailyDigest(changes: ModelChangeWithDetails[]): Promise<{
    email: { total: number; sent: number; failed: number; skipped: number };
    telegram: { total: number; sent: number; failed: number; skipped: number };
  }> {
    if (changes.length === 0) {
      return {
        email: { total: 0, sent: 0, failed: 0, skipped: 0 },
        telegram: { total: 0, sent: 0, failed: 0, skipped: 0 },
      };
    }

    const [emailResults, telegramResults] = await Promise.all([
      this.sendEmailDigest(changes),
      this.sendTelegramDigest(changes),
    ]);

    return {
      email: emailResults,
      telegram: telegramResults,
    };
  }

  /**
   * Send email daily digest
   * NOTE: Email sending is DISABLED to reduce costs.
   * This method returns skipped status for all email subscribers.
   */
  private async sendEmailDigest(_changes: ModelChangeWithDetails[]): Promise<{
    total: number;
    sent: number;
    failed: number;
    skipped: number;
  }> {
    // Email notifications are disabled
    const subscribers = await this.storage.getActiveEmailSubscribers();
    return {
      total: subscribers.length,
      sent: 0,
      failed: 0,
      skipped: subscribers.length,
    };
  }

  /**
   * Send Telegram daily digest
   */
  private async sendTelegramDigest(changes: ModelChangeWithDetails[]): Promise<{
    total: number;
    sent: number;
    failed: number;
    skipped: number;
  }> {
    if (!this.telegramBot) {
      return { total: 0, sent: 0, failed: 0, skipped: 0 };
    }

    const subscribers = await this.storage.getActiveTelegramSubscribers();

    if (subscribers.length === 0) {
      return { total: 0, sent: 0, failed: 0, skipped: 0 };
    }

    const message = this.formatTelegramMessage(changes);

    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      try {
        await this.telegramBot.api.sendMessage(subscriber.chat_id, message, {
          parse_mode: 'HTML',
        });
        sent++;
        await this.storage.updateTelegramLastNotified(subscriber.id);
      } catch (error) {
        console.error(`Failed to send Telegram message to ${subscriber.chat_id}:`, error);
        failed++;
      }
    }

    return {
      total: subscribers.length,
      sent,
      failed,
      skipped: 0,
    };
  }

  /**
   * Format changes as Telegram message
   */
  private formatTelegramMessage(changes: ModelChangeWithDetails[]): string {
    const added = changes.filter((c) => c.change_type === 'added');
    const removed = changes.filter((c) => c.change_type === 'removed');
    const modified = changes.filter((c) => c.change_type === 'modified');

    let message = '<b>🤖 OpenRouter Free Models Update</b>\n\n';

    if (added.length > 0) {
      message += '<b>✅ New Free Models</b> (' + added.length + ')\n';
      for (const change of added.slice(0, 10)) {
        message += '  • ' + (change.model_name || change.model_id) + '\n';
      }
      if (added.length > 10) {
        message += '  ... and ' + (added.length - 10) + ' more\n';
      }
      message += '\n';
    }

    if (removed.length > 0) {
      message += '<b>❌ Removed from Free Tier</b> (' + removed.length + ')\n';
      for (const change of removed.slice(0, 10)) {
        message += '  • ' + (change.model_name || change.model_id) + '\n';
      }
      if (removed.length > 10) {
        message += '  ... and ' + (removed.length - 10) + ' more\n';
      }
      message += '\n';
    }

    if (modified.length > 0) {
      message += '<b>🔄 Modified Models</b> (' + modified.length + ')\n';
      for (const change of modified.slice(0, 10)) {
        message += '  • ' + (change.model_name || change.model_id) + '\n';
      }
      if (modified.length > 10) {
        message += '  ... and ' + (modified.length - 10) + ' more\n';
      }
      message += '\n';
    }

    message += '📅 ' + new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return message;
  }

  /**
   * Set up Telegram bot webhook
   */
  async setupTelegramWebhook(): Promise<void> {
    if (!this.telegramBot || !this.telegramWebhookUrl) {
      throw new Error('Telegram bot not configured');
    }

    await this.telegramBot.api.setWebhook(this.telegramWebhookUrl);
  }

  /**
   * Handle Telegram bot update (for webhook endpoint)
   */
  async handleTelegramUpdate(update: any): Promise<void> {
    if (!this.telegramBot) {
      throw new Error('Telegram bot not configured');
    }

    await this.telegramBot.handleUpdate(update);
  }

  /**
   * Get Telegram bot info
   */
  async getTelegramBotInfo(): Promise<{ username: string; link: string } | null> {
    if (!this.telegramBot) {
      return null;
    }

    try {
      const botInfo = await this.telegramBot.api.getMe();
      return {
        username: botInfo.username,
        link: `https://t.me/${botInfo.username}`,
      };
    } catch (error) {
      console.error('Failed to get Telegram bot info:', error);
      return null;
    }
  }

  /**
   * Register Telegram bot commands
   */
  registerTelegramCommands(): void {
    if (!this.telegramBot) {
      return;
    }

    this.telegramBot.command('start', async (ctx) => {
      const chatId = ctx.chat!.id;
      const user = ctx.from;

      // Add or update subscriber
      await this.storage.addTelegramSubscriber({
        chat_id: chatId,
        username: user?.username,
        first_name: user?.first_name,
        last_name: user?.last_name,
      });

      await ctx.reply(
        '✅ <b>You have subscribed to OpenRouter Free Models updates!</b>\n\n' +
          'You will receive daily summaries of:\n' +
          '• New free models\n' +
          '• Removed models\n' +
          '• Model modifications\n\n' +
          'Use /unsubscribe to stop receiving updates.',
        { parse_mode: 'HTML' }
      );
    });

    this.telegramBot.command('unsubscribe', async (ctx) => {
      const chatId = ctx.chat!.id;

      await this.storage.unsubscribeTelegramUser(chatId);

      await ctx.reply(
        '❌ <b>You have been unsubscribed.</b>\n\n' +
          'Use /start to subscribe again.',
        { parse_mode: 'HTML' }
      );
    });

    this.telegramBot.command('help', async (ctx) => {
      await ctx.reply(
        '<b>OpenRouter Free Models Bot Commands:</b>\n\n' +
          '/start - Subscribe to updates\n' +
          '/unsubscribe - Unsubscribe from updates\n' +
          '/help - Show this help message\n\n' +
          'You will receive daily summaries of changes to OpenRouter\'s free AI models.',
        { parse_mode: 'HTML' }
      );
    });
  }

  /**
   * Send message to a specific Telegram subscriber by chat ID
   * Useful for admin notifications or direct messages
   */
  async sendToTelegramSubscriber(chatId: string | number, message: string): Promise<boolean> {
    if (!this.telegramBot) {
      throw new Error('Telegram bot not configured');
    }

    try {
      await this.telegramBot.api.sendMessage(chatId, message, {
        parse_mode: 'HTML',
      });
      return true;
    } catch (error) {
      console.error(`Failed to send Telegram message to ${chatId}:`, error);
      return false;
    }
  }

  /**
   * Broadcast a message to all active Telegram subscribers
   * Useful for system announcements or admin broadcasts
   */
  async sendBroadcastToAllTelegram(message: string): Promise<{
    total: number;
    sent: number;
    failed: number;
  }> {
    if (!this.telegramBot) {
      throw new Error('Telegram bot not configured');
    }

    const subscribers = await this.storage.getActiveTelegramSubscribers();

    if (subscribers.length === 0) {
      return { total: 0, sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      try {
        await this.telegramBot.api.sendMessage(subscriber.chat_id, message, {
          parse_mode: 'HTML',
        });
        sent++;
        await this.storage.updateTelegramLastNotified(subscriber.id);
      } catch (error) {
        console.error(`Failed to send broadcast to ${subscriber.chat_id}:`, error);
        failed++;
      }
    }

    return {
      total: subscribers.length,
      sent,
      failed,
    };
  }

  /**
   * Send a test message to verify Telegram bot is working
   */
  async sendTestMessage(chatId: string | number): Promise<boolean> {
    const testMessage =
      '🧪 <b>Test Message</b>\n\n' +
      'This is a test from OpenRouter Free Models Monitor.\n\n' +
      '✅ Telegram integration is working correctly!';

    return this.sendToTelegramSubscriber(chatId, testMessage);
  }
}
