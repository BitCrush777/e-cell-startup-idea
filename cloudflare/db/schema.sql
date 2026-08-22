-- TempLink Cloudflare D1 Database Schema
-- Stores metadata requiring persistence while ephemeral chat content lives strictly in Durable Objects RAM

-- 1. Users Table (Optional authentication & subscriptions)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'free', -- 'free', 'pro', 'business'
    avatar_url TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- 2. Rooms Metadata Table (Only high-level metadata, NO message contents)
CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    room_code TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 15,
    participant_limit INTEGER NOT NULL DEFAULT 2,
    password_hash TEXT,
    allow_files INTEGER NOT NULL DEFAULT 1,
    notify_expiration INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting', 'active', 'expiring', 'expired', 'ended'
    created_by TEXT NOT NULL,
    ended_at INTEGER
);

-- 3. Room Participants Table
CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    participant_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member', -- 'creator', 'member'
    joined_at INTEGER NOT NULL,
    left_at INTEGER,
    is_online INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
);

-- 4. Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'pro',
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'past_due'
    current_period_start INTEGER NOT NULL,
    current_period_end INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 5. Usage & Analytics Table (Aggregated daily counts, zero personal telemetry)
CREATE TABLE IF NOT EXISTS usage (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    metric_date TEXT NOT NULL,
    rooms_created INTEGER NOT NULL DEFAULT 0,
    messages_relayed INTEGER NOT NULL DEFAULT 0,
    duration_minutes_total INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
);

-- Indices for rapid lookup & expiration queries
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_expires ON rooms(expires_at);
CREATE INDEX IF NOT EXISTS idx_rooms_created_by ON rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_participants_room ON participants(room_id);
