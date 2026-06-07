-- V35: company_services tablosu — şirket başına hizmet kategorisi yönetimi
CREATE TABLE company_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    service_category VARCHAR(50) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_company_service UNIQUE (company_id, service_category)
);

CREATE INDEX idx_company_services_company ON company_services(company_id);
CREATE INDEX idx_company_services_active ON company_services(company_id, active);

-- Mevcut CLIENT şirketleri için tüm hizmetleri active=true olarak ekle
-- (admin sonradan gereksizleri kapatabilir)
INSERT INTO company_services (company_id, service_category, active)
SELECT c.id, cat.category, true
FROM companies c
CROSS JOIN (VALUES
    ('DIGITAL_MARKETING'),
    ('WEB_DESIGN'),
    ('AD_MANAGEMENT'),
    ('SOCIAL_MEDIA'),
    ('PRODUCTION'),
    ('CONTENT_MARKETING')
) AS cat(category)
WHERE c.kind = 'CLIENT'
ON CONFLICT (company_id, service_category) DO NOTHING;
