CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  product_id TEXT DEFAULT '',
  product_name TEXT NOT NULL DEFAULT 'Finanças Fácil',
  amount NUMERIC(10,2) DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT DEFAULT '',
  raw_payload TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'cakto',
  event_type TEXT NOT NULL DEFAULT '',
  transaction_id TEXT DEFAULT '',
  email TEXT DEFAULT '',
  payload TEXT DEFAULT '',
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_transaction_id ON purchases(transaction_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
