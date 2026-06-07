-- Google Ads Customer ID per company
ALTER TABLE google_oauth_tokens
    ADD COLUMN IF NOT EXISTS ads_customer_id VARCHAR(30);
