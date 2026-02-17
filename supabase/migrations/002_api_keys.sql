-- API Keys table for storing user API keys
-- The full key is never stored, only a SHA-256 hash

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name VARCHAR(100) NOT NULL,
  key_prefix VARCHAR(20) NOT NULL,
  key_hash VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  
  -- Index for faster lookups
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) 
    REFERENCES user_profiles(clerk_user_id) ON DELETE CASCADE
);

-- Index for finding keys by hash (for validation)
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);

-- Index for listing user's keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);

-- Index for active keys only
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(key_hash) 
  WHERE revoked_at IS NULL;

-- RLS Policies (if using Supabase RLS)
-- Note: These use service role, so RLS is typically bypassed
-- ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
