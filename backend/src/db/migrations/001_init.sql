-- Sign-in accounts for the admin console.
CREATE TABLE accounts (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  role          TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'user')),
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The user directory managed from the Users page.
CREATE TABLE users (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'user')),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  department  TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ
);

-- Email is unique among live users only, so a soft-deleted email can be reused.
CREATE UNIQUE INDEX users_email_live_key ON users (lower(email)) WHERE deleted_at IS NULL;
CREATE INDEX users_created_at_idx ON users (created_at DESC);

CREATE TABLE activity (
  id      BIGSERIAL PRIMARY KEY,
  actor   TEXT NOT NULL,
  action  TEXT NOT NULL,
  target  TEXT NOT NULL,
  at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX activity_at_idx ON activity (at DESC);
