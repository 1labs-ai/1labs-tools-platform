-- 1Labs Tools Platform Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  name VARCHAR(255),
  credits INTEGER DEFAULT 25,
  plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'unlimited')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups by clerk_id
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_id ON user_profiles(clerk_id);

-- Credit Transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('purchase', 'usage', 'bonus', 'refund', 'signup')),
  description TEXT,
  tool_type VARCHAR(50),
  generation_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user transactions
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- Generations table
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  tool_type VARCHAR(50) NOT NULL CHECK (tool_type IN ('roadmap', 'prd', 'pitch_deck', 'persona', 'competitive_analysis')),
  title VARCHAR(255),
  input JSONB NOT NULL,
  output JSONB NOT NULL,
  credits_used INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for generations
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_tool_type ON generations(tool_type);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  clerk_id VARCHAR(255) NOT NULL, -- Clerk user ID for direct lookup
  name VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(20) NOT NULL, -- First few chars for identification (e.g., "1labs_abc...")
  key_hash VARCHAR(255) NOT NULL UNIQUE, -- SHA-256 hash of the full key
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE
);

-- Index for API keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_clerk_id ON api_keys(clerk_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Service role can access everything (for server-side operations)
CREATE POLICY "Service role has full access to user_profiles"
  ON user_profiles FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to credit_transactions"
  ON credit_transactions FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to generations"
  ON generations FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to api_keys"
  ON api_keys FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional - comment out in production)
-- INSERT INTO user_profiles (clerk_id, email, name, credits, plan)
-- VALUES ('test_user_123', 'test@example.com', 'Test User', 100, 'pro');
