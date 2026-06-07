-- Her Google servisi (GA, SC, Ads) için ayrı OAuth token kaydı
ALTER TABLE google_oauth_tokens ADD COLUMN IF NOT EXISTS service_type VARCHAR(30) NOT NULL DEFAULT 'ANALYTICS';

-- Eski unique constraint'i kaldır (company_id tek başına unique olmamalı)
ALTER TABLE google_oauth_tokens DROP CONSTRAINT IF EXISTS google_oauth_tokens_company_id_key;
ALTER TABLE google_oauth_tokens DROP CONSTRAINT IF EXISTS uk_google_oauth_tokens_company;

-- Yeni unique constraint: (company_id, service_type) birlikte unique
ALTER TABLE google_oauth_tokens ADD CONSTRAINT uk_google_oauth_company_service
    UNIQUE (company_id, service_type);

-- Her servis artık ayrı ayrı bağlanmalı, mevcut tokenlar kopyalanmaz.
