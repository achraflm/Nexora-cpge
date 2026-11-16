BEGIN;
ALTER TABLE auth.users
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "avatarUrl" text,
  ADD COLUMN IF NOT EXISTS badge text,
  ADD COLUMN IF NOT EXISTS "targetConcours" text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS "notifyAnswers" boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "notifyAnnales" boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "notifyReminders" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deactivatedAt" timestamp(3),
  ADD COLUMN IF NOT EXISTS "sessionVersion" integer NOT NULL DEFAULT 0;
ALTER TABLE auth.refresh_tokens ADD COLUMN IF NOT EXISTS "sessionVersion" integer NOT NULL DEFAULT 0;
COMMIT;
