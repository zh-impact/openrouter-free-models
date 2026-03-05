import { Hono } from 'hono';
import { validator } from 'hono/validator';

import type {
  SubscribeResponse,
  UnsubscribeResponse,
} from '@openrouter-free-models/shared';

import type { Env } from '../lib/db';
import { StorageService } from '../services/storage';

const subscriptions = new Hono<{ Bindings: Env }>();

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * POST /api/subscriptions - Subscribe to email notifications
 */
subscriptions.post(
  '/',
  validator('json', (value) => {
    // Validate the request body
    if (!value.email || typeof value.email !== 'string') {
      return { email: '' };
    }
    return { email: value.email };
  }),
  async (c) => {
    const { email } = c.req.valid('json');

    // Validate email format
    if (!email || !isValidEmail(email)) {
      return c.json({ error: 'Invalid email address' }, 400);
    }

    const storage = new StorageService(c.env.DB);

    try {
      // Check if email already exists
      const existing = await storage.getSubscriberByEmail(email);

      if (existing) {
        if (existing.status === 'unsubscribed') {
          // Reactivate subscription
          await storage.updateSubscriberStatus(existing.id, 'active');
          const response: SubscribeResponse = {
            id: existing.id,
            email: existing.email,
            status: 'active',
            message: 'Subscription reactivated successfully',
          };
          return c.json(response);
        } else if (existing.status === 'active') {
          return c.json({ error: 'Email already subscribed' }, 409);
        } else {
          // Pending - activate it
          await storage.updateSubscriberStatus(existing.id, 'active');
          const response: SubscribeResponse = {
            id: existing.id,
            email: existing.email,
            status: 'active',
            message: 'Subscription activated',
          };
          return c.json(response);
        }
      }

      // Create new subscription
      const unsubscribeToken = crypto.randomUUID();
      const subscriberId = await storage.addSubscriber(email, unsubscribeToken);

      const response: SubscribeResponse = {
        id: subscriberId,
        email,
        status: 'active',
        message: 'Subscription successful',
      };

      return c.json(response, 201);
    } catch (error) {
      console.error('Failed to create subscription:', error);
      return c.json({ error: 'Failed to create subscription' }, 500);
    }
  }
);

/**
 * GET /api/subscriptions/unsubscribe?token={uuid} - Unsubscribe from notifications
 */
subscriptions.get('/unsubscribe', async (c) => {
  const token = c.req.query('token');

  if (!token) {
    return c.json({ error: 'Missing unsubscribe token' }, 400);
  }

  const storage = new StorageService(c.env.DB);

  try {
    const subscriber = await storage.getSubscriberByUnsubscribeToken(token);

    if (!subscriber) {
      return c.json({ error: 'Invalid unsubscribe token' }, 404);
    }

    if (subscriber.status === 'unsubscribed') {
      const response: UnsubscribeResponse = {
        success: true,
        message: 'Already unsubscribed',
      };
      return c.json(response);
    }

    await storage.updateSubscriberStatus(subscriber.id, 'unsubscribed');

    const response: UnsubscribeResponse = {
      success: true,
      message: 'Successfully unsubscribed from notifications',
    };

    return c.json(response);
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
    return c.json({ error: 'Failed to unsubscribe' }, 500);
  }
});

/**
 * GET /api/subscriptions/confirm?token={uuid} - Confirm subscription (for future use)
 */
subscriptions.get('/confirm', async (c) => {
  const token = c.req.query('token');

  if (!token) {
    return c.json({ error: 'Missing confirmation token' }, 400);
  }

  const storage = new StorageService(c.env.DB);

  try {
    const subscriber = await storage.getSubscriberByUnsubscribeToken(token);

    if (!subscriber) {
      return c.json({ error: 'Invalid confirmation token' }, 404);
    }

    if (subscriber.status === 'active') {
      return c.json({ success: true, message: 'Subscription already confirmed' });
    }

    await storage.updateSubscriberStatus(subscriber.id, 'active');

    return c.json({ success: true, message: 'Subscription confirmed successfully' });
  } catch (error) {
    console.error('Failed to confirm subscription:', error);
    return c.json({ error: 'Failed to confirm subscription' }, 500);
  }
});

/**
 * GET /api/subscriptions/status?token={uuid} - Check subscription status
 */
subscriptions.get('/status', async (c) => {
  const token = c.req.query('token');

  if (!token) {
    return c.json({ error: 'Missing token' }, 400);
  }

  const storage = new StorageService(c.env.DB);

  try {
    const subscriber = await storage.getSubscriberByUnsubscribeToken(token);

    if (!subscriber) {
      return c.json({ error: 'Invalid token' }, 404);
    }

    return c.json({
      status: subscriber.status,
      email: subscriber.email,
      subscribed_at: subscriber.subscribed_at,
    });
  } catch (error) {
    console.error('Failed to get subscription status:', error);
    return c.json({ error: 'Failed to get subscription status' }, 500);
  }
});

export default subscriptions;
