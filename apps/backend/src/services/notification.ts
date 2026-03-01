import type { ModelChangeWithDetails, NotificationConfig } from '@openrouter-free-models/shared';

/**
 * Notification service for sending alerts about model changes
 */
export class NotificationService {
  constructor(private config: NotificationConfig) {}

  /**
   * Send notification about model changes
   */
  async sendChanges(changes: ModelChangeWithDetails[]): Promise<boolean> {
    if (!this.config.enabled || changes.length === 0) {
      return false;
    }

    const summary = this.buildSummary(changes);

    let success = false;

    for (const channel of this.config.channels) {
      try {
        if (channel === 'email' && this.config.email) {
          await this.sendEmail(summary);
          success = true;
        } else if (channel === 'webhook' && this.config.webhook) {
          await this.sendWebhook(summary);
          success = true;
        }
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error);
      }
    }

    return success;
  }

  /**
   * Build a summary of changes
   */
  private buildSummary(changes: ModelChangeWithDetails[]): string {
    const added = changes.filter((c) => c.change_type === 'added');
    const removed = changes.filter((c) => c.change_type === 'removed');
    const modified = changes.filter((c) => c.change_type === 'modified');

    let summary = `OpenRouter Free Models Update\n`;
    summary += `==============================\n\n`;

    if (added.length > 0) {
      summary += `New Free Models (${added.length}):\n`;
      for (const change of added) {
        summary += `  + ${change.model_name || change.model_id}\n`;
      }
      summary += `\n`;
    }

    if (removed.length > 0) {
      summary += `Removed Free Models (${removed.length}):\n`;
      for (const change of removed) {
        summary += `  - ${change.model_name || change.model_id}\n`;
      }
      summary += `\n`;
    }

    if (modified.length > 0) {
      summary += `Modified Free Models (${modified.length}):\n`;
      for (const change of modified) {
        summary += `  ~ ${change.model_name || change.model_id}\n`;
      }
      summary += `\n`;
    }

    summary += `Detected at: ${new Date().toISOString()}\n`;

    return summary;
  }

  /**
   * Send email notification (placeholder)
   */
  private async sendEmail(summary: string): Promise<void> {
    if (!this.config.email) {
      throw new Error('Email configuration missing');
    }

    // In production, integrate with Resend or Cloudflare Email Workers
    console.log('Email notification:', {
      to: this.config.email.to,
      subject: this.config.email.subject || 'OpenRouter Free Models Update',
      body: summary,
    });

    // TODO: Implement actual email sending
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${RESEND_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: 'noreply@openrouter-monitor.com',
    //     to: this.config.email.to,
    //     subject: this.config.email.subject || 'OpenRouter Free Models Update',
    //     text: summary,
    //   }),
    // });
  }

  /**
   * Send webhook notification (placeholder)
   */
  private async sendWebhook(summary: string): Promise<void> {
    if (!this.config.webhook) {
      throw new Error('Webhook configuration missing');
    }

    console.log('Webhook notification:', {
      url: this.config.webhook.url,
      body: summary,
    });

    const response = await fetch(this.config.webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.config.webhook.headers,
      },
      body: JSON.stringify({
        summary,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`);
    }
  }
}
