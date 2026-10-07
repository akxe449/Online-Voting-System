-- Run this in phpMyAdmin against the voting_system database.
-- BACK UP the database first.

CREATE TABLE IF NOT EXISTS constituency (
    constituency_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE
);

ALTER TABLE voter
    ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS constituency_id INT NULL;

ALTER TABLE election
    ADD COLUMN IF NOT EXISTS constituency_id INT NULL;

-- IMPORTANT:
-- Insert the real constituencies and assign the correct constituency_id
-- to each existing voter and election before testing the new flow.
-- Example only (DO NOT blindly use these IDs if your project already has data):
-- INSERT INTO constituency (name) VALUES ('Delhi'), ('Haryana');
-- UPDATE voter SET constituency_id = 1 WHERE voter_id IN (...);
-- UPDATE election SET constituency_id = 1 WHERE election_id IN (...);

-- After the existing data has been assigned correctly, you may add these
-- foreign keys if the column types match your existing primary keys:
-- ALTER TABLE voter ADD CONSTRAINT fk_voter_constituency
--   FOREIGN KEY (constituency_id) REFERENCES constituency(constituency_id);
-- ALTER TABLE election ADD CONSTRAINT fk_election_constituency
--   FOREIGN KEY (constituency_id) REFERENCES constituency(constituency_id);
