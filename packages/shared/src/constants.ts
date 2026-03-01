/**
 * OpenRouter API endpoints
 */
export const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';
export const OPENROUTER_MODELS_ENDPOINT = `${OPENROUTER_API_BASE}/models`;

/**
 * Free model ID suffix
 */
export const FREE_MODEL_SUFFIX = ':free';

/**
 * Cache durations (in seconds)
 */
export const CACHE_DURATIONS = {
  MODELS: 3600, // 1 hour
  CHANGES: 300, // 5 minutes
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 500,
  DEFAULT_OFFSET: 0,
} as const;

/**
 * API version
 */
export const API_VERSION = '1.0.0';

/**
 * Application name
 */
export const APP_NAME = 'OpenRouter Free Models Monitor';

/**
 * Modality types
 */
export const MODALITY_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
} as const;

/**
 * Change types
 */
export const CHANGE_TYPES = {
  ADDED: 'added',
  REMOVED: 'removed',
  MODIFIED: 'modified',
} as const;

/**
 * Notification statuses
 */
export const NOTIFICATION_STATUSES = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
} as const;

/**
 * Error messages
 */
export const ERRORS = {
  OPENROUTER_API_ERROR: 'Failed to fetch models from OpenRouter API',
  DATABASE_ERROR: 'Database operation failed',
  NOTIFICATION_ERROR: 'Failed to send notification',
  INVALID_REQUEST: 'Invalid request',
  UNAUTHORIZED: 'Unauthorized access',
} as const;

/**
 * Cron schedule for hourly updates
 */
export const CRON_SCHEDULE_HOURLY = '0 * * * *';

/**
 * Database table names
 */
export const TABLES = {
  MODELS: 'models',
  MODEL_CHANGES: 'model_changes',
  NOTIFICATIONS: 'notifications',
} as const;
