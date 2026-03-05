/**
 * Database types and initialization
 */

export interface Env {
  DB: D1Database;
  CRON_SECRET?: string;
  OPENROUTER_API_KEY?: string;
  NOTIFICATION_EMAIL?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  BASE_URL?: string;
}

/**
 * Database result types
 */
export interface ModelDBResult {
  id: string;
  name: string;
  description: string | null;
  context_length: number;
  pricing_prompt: string;
  pricing_completion: string;
  architecture: string | null;
  first_seen_at: string;
  last_seen_at: string;
  is_active: number;
}

export interface ChangeDBResult {
  id: string;
  model_id: string;
  change_type: string;
  detected_at: string;
  old_data: string | null;
  new_data: string | null;
}
