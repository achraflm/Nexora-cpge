DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'educational_resources_track_level_check') THEN
    ALTER TABLE catalog.educational_resources ADD CONSTRAINT educational_resources_track_level_check
      CHECK ((track = 'MPSI' AND level = 'SUP') OR (track = 'MP' AND level = 'SPE'));
  END IF;
END $$;
