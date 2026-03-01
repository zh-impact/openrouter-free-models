import { Hono } from 'hono';
import type { Env } from '../lib/db.js';
import type { HealthResponse } from '@openrouter-free-models/shared';
import { API_VERSION, APP_NAME } from '@openrouter-free-models/shared';

const health = new Hono<{ Bindings: Env }>();

/**
 * GET /api/health - Health check endpoint
 */
health.get('/health', async (c) => {
  const storage = await import('../services/storage.js');

  let dbStatus: 'connected' | 'disconnected' = 'connected';
  let lastSync: string | null = null;

  try {
    const { StorageService } = storage;
    const storageService = new StorageService(c.env.DB);
    lastSync = await storageService.getLastSync();
  } catch (error) {
    dbStatus = 'disconnected';
  }

  const response: HealthResponse = {
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: API_VERSION,
    database: dbStatus,
    last_sync: lastSync,
  };

  return c.json(response);
});

/**
 * GET /api/info - Application info
 */
health.get('/info', (c) => {
  return c.json({
    name: APP_NAME,
    version: API_VERSION,
    timestamp: new Date().toISOString(),
  });
});

export default health;
