import { Hono } from 'hono';
import type { Env } from '../lib/db.js';
import { OpenRouterService } from '../services/openrouter.js';
import { StorageService } from '../services/storage.js';
import { DiffService } from '../lib/diff.js';
import type { FreeModelsResponse, ChangesResponse, RefreshResponse } from '@openrouter-free-models/shared';
import { PAGINATION } from '@openrouter-free-models/shared';

const models = new Hono<{ Bindings: Env }>();

/**
 * GET /api/models - Fetch current free models (real-time from OpenRouter)
 */
models.get('/', async (c) => {
  const openRouter = new OpenRouterService(c.env.OPENROUTER_API_KEY);

  try {
    const freeModels = await openRouter.fetchFreeModels();

    const response: FreeModelsResponse = {
      models: freeModels,
      last_updated: new Date().toISOString(),
      total_count: freeModels.length,
    };

    return c.json(response);
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return c.json({ error: 'Failed to fetch models from OpenRouter' }, 500);
  }
});

/**
 * GET /api/models/cached - Fetch cached models from database
 */
models.get('/cached', async (c) => {
  const storage = new StorageService(c.env.DB);

  try {
    const models = await storage.getActiveModels();
    const lastSync = await storage.getLastSync();

    const response: FreeModelsResponse = {
      models: models.map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description || '',
        context_length: m.context_length,
        pricing: {
          prompt: m.pricing_prompt,
          completion: m.pricing_completion,
        },
        architecture: m.architecture ? JSON.parse(m.architecture) : undefined,
      })),
      last_updated: lastSync || '',
      total_count: models.length,
    };

    return c.json(response);
  } catch (error) {
    console.error('Failed to fetch cached models:', error);
    return c.json({ error: 'Failed to fetch cached models' }, 500);
  }
});

/**
 * GET /api/models/changes - Get change history
 */
models.get('/changes', async (c) => {
  const limit = Math.min(
    Number(c.req.query('limit') || PAGINATION.DEFAULT_LIMIT),
    PAGINATION.MAX_LIMIT
  );
  const offset = Number(c.req.query('offset') || PAGINATION.DEFAULT_OFFSET);

  const storage = new StorageService(c.env.DB);

  try {
    const changes = await storage.getChanges(limit, offset);

    const response: ChangesResponse = {
      changes,
      total: changes.length,
      limit,
      offset,
    };

    return c.json(response);
  } catch (error) {
    console.error('Failed to fetch changes:', error);
    return c.json({ error: 'Failed to fetch changes' }, 500);
  }
});

/**
 * POST /api/models/refresh - Manually trigger a refresh
 */
models.post('/refresh', async (c) => {
  const openRouter = new OpenRouterService(c.env.OPENROUTER_API_KEY);
  const storage = new StorageService(c.env.DB);
  const diffService = new DiffService();

  try {
    // Fetch current models
    const currentModels = await openRouter.fetchFreeModels();

    // Get existing models from database
    const existingModels = await storage.getActiveModels();

    // Detect changes
    const diff = diffService.detectChanges(existingModels, currentModels);

    // Save changes to database
    const changes = await storage.saveChanges(diff);

    const response: RefreshResponse = {
      success: true,
      message: 'Models refreshed successfully',
      changes_detected: changes.length,
      changes,
      timestamp: new Date().toISOString(),
    };

    return c.json(response);
  } catch (error) {
    console.error('Failed to refresh models:', error);

    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to refresh models',
        changes_detected: 0,
        changes: [],
        timestamp: new Date().toISOString(),
      } as RefreshResponse,
      500
    );
  }
});

/**
 * GET /api/models/:id - Get a specific model by ID
 */
models.get('/:id', async (c) => {
  const id = c.req.param('id');
  const storage = new StorageService(c.env.DB);

  try {
    const model = await storage.getModelById(id);

    if (!model) {
      return c.json({ error: 'Model not found' }, 404);
    }

    return c.json({
      id: model.id,
      name: model.name,
      description: model.description || '',
      context_length: model.context_length,
      pricing: {
        prompt: model.pricing_prompt,
        completion: model.pricing_completion,
      },
      architecture: model.architecture ? JSON.parse(model.architecture) : undefined,
      first_seen_at: model.first_seen_at,
      last_seen_at: model.last_seen_at,
      is_active: model.is_active,
    });
  } catch (error) {
    console.error('Failed to fetch model:', error);
    return c.json({ error: 'Failed to fetch model' }, 500);
  }
});

export default models;
