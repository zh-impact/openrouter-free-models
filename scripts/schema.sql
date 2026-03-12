-- Drop existing views and tables if they exist (for clean initialization)
DROP VIEW IF EXISTS recent_changes;
DROP VIEW IF EXISTS active_models;
DROP TABLE IF EXISTS telegram_subscribers;
DROP TABLE IF EXISTS scheduled_notifications;
DROP TABLE IF EXISTS subscriptions_log;
DROP TABLE IF EXISTS subscribers;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS model_changes;
DROP TABLE IF EXISTS models;

-- Create models table
CREATE TABLE models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  context_length INTEGER NOT NULL DEFAULT 0,
  pricing_prompt TEXT NOT NULL DEFAULT '0',
  pricing_completion TEXT NOT NULL DEFAULT '0',
  architecture TEXT,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1
);

-- Create model_changes table
CREATE TABLE model_changes (
  id TEXT PRIMARY KEY,
  model_id TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK(change_type IN ('added', 'removed', 'modified')),
  detected_at TEXT NOT NULL,
  old_data TEXT,
  new_data TEXT,
  FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
);

-- Create notifications table
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  change_id TEXT,
  sent_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  FOREIGN KEY (change_id) REFERENCES model_changes(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_models_active ON models(is_active);
CREATE INDEX idx_models_last_seen ON models(last_seen_at);
CREATE INDEX idx_changes_detected_on ON model_changes(detected_at DESC);
CREATE INDEX idx_changes_model_id ON model_changes(model_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at);

-- Create a view for active models with latest info
CREATE VIEW active_models AS
SELECT
  id,
  name,
  description,
  context_length,
  pricing_prompt,
  pricing_completion,
  architecture,
  first_seen_at,
  last_seen_at
FROM models
WHERE is_active = 1
ORDER BY name;

-- Create a view for recent changes
CREATE VIEW recent_changes AS
SELECT
  mc.id,
  mc.model_id,
  m.name as model_name,
  mc.change_type,
  mc.detected_at,
  mc.old_data,
  mc.new_data
FROM model_changes mc
LEFT JOIN models m ON mc.model_id = m.id
ORDER BY mc.detected_at DESC
LIMIT 100;

-- Subscribers table (email subscription system)
CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'unsubscribed')),
  unsubscribe_token TEXT NOT NULL UNIQUE,
  subscribed_at TEXT NOT NULL,
  confirmed_at TEXT,
  last_notified_at TEXT,
  notification_hour INTEGER NOT NULL DEFAULT 9,
  preferences TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Subscription log (for tracking sent emails)
CREATE TABLE IF NOT EXISTS subscriptions_log (
  id TEXT PRIMARY KEY,
  subscriber_id TEXT NOT NULL,
  batch_id TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  changes_count INTEGER NOT NULL,
  added_models TEXT,
  removed_models TEXT,
  status TEXT NOT NULL CHECK(status IN ('success', 'partial', 'failed')),
  error_message TEXT,
  FOREIGN KEY (subscriber_id) REFERENCES subscribers(id)
);

-- Notification scheduling table (for daily digests)
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id TEXT PRIMARY KEY,
  target_date TEXT NOT NULL,
  notification_hour INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'sent', 'failed')),
  changes_snapshot TEXT,
  subscriber_count INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Telegram subscribers table
CREATE TABLE IF NOT EXISTS telegram_subscribers (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL UNIQUE,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'unsubscribed')),
  subscribed_at TEXT NOT NULL,
  last_notified_at TEXT,
  preferences TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for subscription tables
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_log_subscriber ON subscriptions_log(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_log_batch ON subscriptions_log(batch_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_log_sent_at ON subscriptions_log(sent_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_date ON scheduled_notifications(target_date, notification_hour);
CREATE INDEX IF NOT EXISTS idx_telegram_subscribers_status ON telegram_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_telegram_subscribers_chat_id ON telegram_subscribers(chat_id);
