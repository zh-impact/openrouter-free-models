import type { ModelChangeWithDetails } from '@openrouter-free-models/shared';
import { ResendService } from './resend';
import { StorageService } from './storage';

/**
 * Daily digest service for scheduling and sending email notifications
 */
export class DigestService {
  constructor(
    private storage: StorageService,
    private resend: ResendService
  ) {}

  /**
   * Check if a subscriber should receive a digest based on their preferences
   */
  shouldSendDigest(subscriber: any, lastDigestTime: string): boolean {
    // Check if subscriber is active
    if (subscriber.status !== 'active') {
      return false;
    }

    // Check if already notified since last digest
    if (subscriber.last_notified_at && subscriber.last_notified_at > lastDigestTime) {
      return false;
    }

    return true;
  }

  /**
   * Send daily digest to eligible subscribers
   */
  async sendDailyDigest(changes: ModelChangeWithDetails[]): Promise<{
    total: number;
    sent: number;
    failed: number;
    skipped: number;
  }> {
    if (changes.length === 0) {
      return { total: 0, sent: 0, failed: 0, skipped: 0 };
    }

    // Get all active subscribers
    const subscribers = await this.storage.getActiveSubscribers();

    // Get the timestamp of the oldest change in this batch
    const lastDigestTime = changes[changes.length - 1].detected_at;

    // Filter subscribers who should receive this digest
    const eligibleSubscribers = subscribers.filter((s) =>
      this.shouldSendDigest(s, lastDigestTime)
    );

    if (eligibleSubscribers.length === 0) {
      return { total: subscribers.length, sent: 0, failed: 0, skipped: subscribers.length };
    }

    // Send emails in batches
    const results = await this.resend.sendDailyDigest(eligibleSubscribers, changes);

    // Log results
    const batchId = crypto.randomUUID();
    let sent = 0;
    let failed = 0;

    for (const result of results) {
      if (result.success) {
        sent++;
        await this.storage.updateLastNotified(result.subscriberId);
        await this.storage.logSubscription(
          result.subscriberId,
          batchId,
          changes.length,
          this.extractModelNames(changes.filter((c) => c.change_type === 'added')),
          this.extractModelNames(changes.filter((c) => c.change_type === 'removed')),
          'success'
        );
      } else {
        failed++;
        await this.storage.logSubscription(
          result.subscriberId,
          batchId,
          changes.length,
          null,
          null,
          'failed',
          result.error
        );
      }
    }

    return {
      total: subscribers.length,
      sent,
      failed,
      skipped: subscribers.length - eligibleSubscribers.length,
    };
  }

  /**
   * Extract model names from changes for logging
   */
  private extractModelNames(changes: ModelChangeWithDetails[]): string | null {
    if (changes.length === 0) return null;
    return changes.map((c) => c.model_name || c.model_id).join(', ');
  }
}
