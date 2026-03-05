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

/**
 * Email subscriber
 */
export interface Subscriber {
  id: string;
  email: string;
  status: 'pending' | 'active' | 'unsubscribed';
  unsubscribe_token: string;
  subscribed_at: string;
  confirmed_at: string | null;
  last_notified_at: string | null;
  notification_hour: number;
  preferences: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Subscription log entry
 */
export interface SubscriptionLog {
  id: string;
  subscriber_id: string;
  batch_id: string;
  sent_at: string;
  changes_count: number;
  added_models: string | null;
  removed_models: string | null;
  status: 'success' | 'partial' | 'failed';
  error_message: string | null;
}

/**
 * Scheduled notification
 */
export interface ScheduledNotification {
  id: string;
  target_date: string;
  notification_hour: number;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  changes_snapshot: string | null;
  subscriber_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Subscription request
 */
export interface SubscribeRequest {
  email: string;
}

/**
 * Subscription response
 */
export interface SubscribeResponse {
  id: string;
  email: string;
  status: 'pending' | 'active';
  message: string;
}

/**
 * Unsubscribe response
 */
export interface UnsubscribeResponse {
  success: boolean;
  message: string;
}
