ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS mail_email VARCHAR(255);

UPDATE user_profiles
SET mail_email = email
WHERE mail_email IS NULL;
