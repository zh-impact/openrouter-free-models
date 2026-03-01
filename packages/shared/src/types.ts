/**
 * OpenRouter Model representation
 */
export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  architecture?: {
    modality: string;
    tokenizer?: string;
    instruct_type?: string;
  };
}

/**
 * Database model record
 */
export interface ModelRecord {
  id: string;
  name: string;
  description: string | null;
  context_length: number;
  pricing_prompt: string;
  pricing_completion: string;
  architecture: string | null;
  first_seen_at: string;
  last_seen_at: string;
  is_active: boolean;
}

/**
 * Model change record
 */
export interface ModelChange {
  id: string;
  model_id: string;
  change_type: 'added' | 'removed' | 'modified';
  detected_at: string;
  old_data: string | null;
  new_data: string | null;
}

/**
 * Notification record
 */
export interface NotificationRecord {
  id: string;
  change_id: string | null;
  sent_at: string;
  status: 'pending' | 'sent' | 'failed';
  error_message: string | null;
}

/**
 * Free models API response
 */
export interface FreeModelsResponse {
  models: OpenRouterModel[];
  last_updated: string;
  total_count: number;
}

/**
 * Changes response
 */
export interface ChangesResponse {
  changes: ModelChangeWithDetails[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Model change with parsed details
 */
export interface ModelChangeWithDetails extends ModelChange {
  model_name?: string;
  old_model?: OpenRouterModel | null;
  new_model?: OpenRouterModel | null;
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: 'healthy' | 'degraded';
  timestamp: string;
  version: string;
  database: 'connected' | 'disconnected';
  last_sync: string | null;
}

/**
 * Refresh response
 */
export interface RefreshResponse {
  success: boolean;
  message: string;
  changes_detected: number;
  changes: ModelChangeWithDetails[];
  timestamp: string;
}

/**
 * Diff result
 */
export interface ModelDiff {
  added: OpenRouterModel[];
  removed: OpenRouterModel[];
  modified: Array<{
    old: OpenRouterModel;
    new: OpenRouterModel;
  }>;
}

/**
 * Notification channels
 */
export type NotificationChannel = 'email' | 'webhook';

/**
 * Notification config
 */
export interface NotificationConfig {
  enabled: boolean;
  channels: NotificationChannel[];
  email?: {
    to: string;
    subject?: string;
  };
  webhook?: {
    url: string;
    headers?: Record<string, string>;
  };
}
