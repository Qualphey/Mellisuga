CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 data JSONB
);

CREATE TABLE IF NOT EXISTS pages (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 data JSONB
);

CREATE TABLE IF NOT EXISTS posts (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 data JSONB
);
