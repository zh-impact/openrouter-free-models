import type { Subscriber, ModelChangeWithDetails } from '@openrouter-free-models/shared';

interface SendResult {
  subscriberId: string;
  email: string;
  success: boolean;
  error?: string;
}

interface ResendResponse {
  id?: string;
  error?: {
    message: string;
  };
}

/**
 * Resend email service for sending daily digests
 */
export class ResendService {
  constructor(
    private apiKey: string,
    private fromEmail: string,
    private baseUrl: string
  ) {}

  /**
   * Send daily digest to multiple subscribers
   */
  async sendDailyDigest(
    subscribers: Subscriber[],
    changes: ModelChangeWithDetails[]
  ): Promise<SendResult[]> {
    const results: SendResult[] = [];
    const emailContent = this.generateEmailContent(changes);

    // Process in batches to respect rate limits
    const batchSize = 100;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);

      const batchResults = await Promise.allSettled(
        batch.map((subscriber) => this.sendEmail(subscriber, emailContent))
      );

      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j];
        const subscriber = batch[j];

        if (result.status === 'fulfilled') {
          results.push({
            subscriberId: subscriber.id,
            email: subscriber.email,
            success: true,
          });
        } else {
          results.push({
            subscriberId: subscriber.id,
            email: subscriber.email,
            success: false,
            error: result.reason?.message || 'Unknown error',
          });
        }
      }

      // Rate limiting: wait between batches if not the last batch
      if (i + batchSize < subscribers.length) {
        await this.delay(1000); // 1 second delay between batches
      }
    }

    return results;
  }

  /**
   * Send email to a single subscriber
   */
  private async sendEmail(
    subscriber: Subscriber,
    content: string
  ): Promise<void> {
    const unsubscribeUrl = this.unsubscribeUrl(subscriber.unsubscribe_token);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.fromEmail,
        to: [subscriber.email],
        subject: this.getSubject(content),
        html: content,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
        },
      }),
    });

    if (!response.ok) {
      const data: ResendResponse = await response.json();
      throw new Error(data.error?.message || 'Failed to send email');
    }
  }

  /**
   * Generate email content from changes
   */
  private generateEmailContent(changes: ModelChangeWithDetails[]): string {
    const added = changes.filter((c) => c.change_type === 'added');
    const removed = changes.filter((c) => c.change_type === 'removed');
    const modified = changes.filter((c) => c.change_type === 'modified');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenRouter Free Models Update</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #444; }
    .change-item { background: white; padding: 15px; margin-bottom: 10px; border-radius: 6px; border-left: 4px solid #ddd; }
    .change-item.added { border-left-color: #10b981; }
    .change-item.removed { border-left-color: #ef4444; }
    .change-item.modified { border-left-color: #f59e0b; }
    .model-name { font-weight: bold; margin-bottom: 5px; }
    .model-desc { font-size: 14px; color: #666; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-right: 8px; }
    .badge.added { background: #d1fae5; color: #065f46; }
    .badge.removed { background: #fee2e2; color: #991b1b; }
    .badge.modified { background: #fef3c7; color: #92400e; }
    .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
    .footer a { color: #667eea; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤖 OpenRouter Free Models Update</h1>
      <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    <div class="content">
      ${added.length > 0 ? `
        <div class="section">
          <div class="section-title">✅ New Free Models (${added.length})</div>
          ${added.map(change => `
            <div class="change-item added">
              <span class="badge added">NEW</span>
              <div class="model-name">${change.model_name || change.model_id}</div>
              ${change.new_model?.description ? `<div class="model-desc">${change.new_model.description}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${removed.length > 0 ? `
        <div class="section">
          <div class="section-title">❌ Removed from Free Tier (${removed.length})</div>
          ${removed.map(change => `
            <div class="change-item removed">
              <span class="badge removed">REMOVED</span>
              <div class="model-name">${change.model_name || change.model_id}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${modified.length > 0 ? `
        <div class="section">
          <div class="section-title">🔄 Modified Models (${modified.length})</div>
          ${modified.map(change => `
            <div class="change-item modified">
              <span class="badge modified">UPDATED</span>
              <div class="model-name">${change.model_name || change.model_id}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${changes.length === 0 ? `
        <div class="section">
          <div class="section-title">No Changes Today</div>
          <p>There are no changes to the free models since the last update.</p>
        </div>
      ` : ''}

      <div style="text-align: center; margin-top: 30px;">
        <a href="${this.baseUrl}" class="button">View All Models</a>
        <a href="${this.baseUrl}/changes" class="button">View Change History</a>
      </div>

      <div class="footer">
        <p>You're receiving this email because you subscribed to OpenRouter Free Models Monitor.</p>
        <p><a href="${this.baseUrl}/unsubscribe?token={{ unsubscribe_token }}">Unsubscribe</a> from these emails.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate email subject based on content
   */
  private getSubject(content: string): string {
    const addedMatch = content.match(/New Free Models \((\d+)\)/);
    const removedMatch = content.match(/Removed from Free Tier \((\d+)\)/);

    const addedCount = addedMatch ? parseInt(addedMatch[1]) : 0;
    const removedCount = removedMatch ? parseInt(removedMatch[1]) : 0;

    if (addedCount > 0 || removedCount > 0) {
      const parts = [];
      if (addedCount > 0) parts.push(`${addedCount} new`);
      if (removedCount > 0) parts.push(`${removedCount} removed`);
      return `OpenRouter Free Models: ${parts.join(', ')}`;
    }

    return 'OpenRouter Free Models: Daily Update';
  }

  /**
   * Generate unsubscribe URL
   */
  private unsubscribeUrl(token: string): string {
    return `${this.baseUrl}/api/subscriptions/unsubscribe?token=${token}`;
  }

  /**
   * Delay utility for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
