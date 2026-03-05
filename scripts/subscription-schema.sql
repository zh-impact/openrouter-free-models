-- Email subscription system for OpenRouter Free Models Monitor

-- Subscribers table
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_log_subscriber ON subscriptions_log(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_log_batch ON subscriptions_log(batch_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_log_sent_at ON subscriptions_log(sent_at);

-- Notification scheduling table (for daily digests)
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id TEXT PRIMARY KEY,
  target_date TEXT NOT NULL,
  notification_hour INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'sent', 'failed')),
  changes_snapshot TEXT,  -- JSON of changes to include
  subscriber_count INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
