BEGIN;
ALTER TABLE contact.contact_messages ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT 'Demande de contact';
DO $$ BEGIN
  CREATE TYPE contact."ContactRole" AS ENUM ('STUDENT', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE TABLE IF NOT EXISTS contact.contact_thread_messages (
  id uuid PRIMARY KEY,
  "ticketId" uuid NOT NULL REFERENCES contact.contact_messages(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "senderId" uuid NOT NULL,
  "senderRole" contact."ContactRole" NOT NULL,
  content text NOT NULL,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "readAt" timestamp(3)
);
CREATE INDEX IF NOT EXISTS "contact_thread_messages_ticketId_createdAt_id_idx"
  ON contact.contact_thread_messages ("ticketId", "createdAt", id);
INSERT INTO contact.contact_thread_messages (id, "ticketId", "senderId", "senderRole", content, "createdAt", "readAt")
SELECT id, id, "userId", 'STUDENT', "messageBody", "createdAt", "updatedAt"
FROM contact.contact_messages AS legacy
WHERE NOT EXISTS (SELECT 1 FROM contact.contact_thread_messages AS thread WHERE thread."ticketId" = legacy.id AND thread."senderRole" = 'STUDENT')
ON CONFLICT (id) DO NOTHING;
INSERT INTO contact.contact_thread_messages (id, "ticketId", "senderId", "senderRole", content, "createdAt", "readAt")
SELECT md5(id::text || ':legacy-reply')::uuid, id, "repliedBy", 'ADMIN', "adminReply", "updatedAt", "updatedAt"
FROM contact.contact_messages WHERE "repliedBy" IS NOT NULL AND "adminReply" IS NOT NULL
ON CONFLICT (id) DO NOTHING;
COMMIT;
