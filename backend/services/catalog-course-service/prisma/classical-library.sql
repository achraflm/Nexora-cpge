-- Additive migration. No user, exercise, document or message is removed.
ALTER TYPE catalog."SubjectCode" ADD VALUE IF NOT EXISTS 'CHEM';
CREATE TABLE IF NOT EXISTS catalog.classic_problems (
 "id" UUID PRIMARY KEY, "title" VARCHAR(200) NOT NULL,
 "subjectId" INTEGER NOT NULL REFERENCES catalog.subjects(id),
 "chapterId" UUID REFERENCES catalog.chapters(id), "level" catalog."StudyLevel" NOT NULL,
 "tracks" TEXT[] NOT NULL, "chapterLabel" TEXT NOT NULL, "difficulty" TEXT NOT NULL,
 "problemType" TEXT NOT NULL, "correctionStatus" TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
 "state" TEXT NOT NULL DEFAULT 'DISCOVERED', "metadata" JSONB NOT NULL,
 "revision" INTEGER NOT NULL DEFAULT 1, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS classic_problems_state_subjectId_level_idx ON catalog.classic_problems("state","subjectId","level");
CREATE TABLE IF NOT EXISTS catalog.classic_progress (
 "problemId" UUID NOT NULL REFERENCES catalog.classic_problems(id), "userId" UUID NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'NOT_STARTED', "favorite" BOOLEAN NOT NULL DEFAULT false,
 "saved" BOOLEAN NOT NULL DEFAULT false, "notes" TEXT NOT NULL DEFAULT '', "bookmarks" JSONB NOT NULL DEFAULT '[]',
 "lastAttemptedAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3), "masteredAt" TIMESTAMP(3),
 "updatedAt" TIMESTAMP(3) NOT NULL, PRIMARY KEY("problemId","userId")
);
CREATE INDEX IF NOT EXISTS classic_progress_userId_updatedAt_idx ON catalog.classic_progress("userId","updatedAt");
CREATE TABLE IF NOT EXISTS catalog.classic_reviews (
 "id" UUID PRIMARY KEY, "problemId" UUID NOT NULL REFERENCES catalog.classic_problems(id),
 "actorId" UUID NOT NULL, "fromState" TEXT NOT NULL, "toState" TEXT NOT NULL, "note" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS classic_reviews_problemId_createdAt_idx ON catalog.classic_reviews("problemId","createdAt");
