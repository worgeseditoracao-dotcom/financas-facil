CREATE TABLE IF NOT EXISTS user_data (
  user_id TEXT NOT NULL,
  key TEXT NOT NULL,
  data TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, key)
);
