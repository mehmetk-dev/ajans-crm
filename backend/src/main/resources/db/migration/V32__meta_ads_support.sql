-- Meta Ads Ad Account ID per company
ALTER TABLE instagram_tokens
    ADD COLUMN IF NOT EXISTS meta_ad_account_id VARCHAR(50);
