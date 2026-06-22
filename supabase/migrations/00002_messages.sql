CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  from_user_id TEXT NOT NULL,
  from_email TEXT NOT NULL,
  to_admin BOOLEAN DEFAULT true,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  reply TEXT,
  replied_at TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
