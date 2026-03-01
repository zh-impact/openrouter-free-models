-- Drop existing tables if they exist (for clean initialization)
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
