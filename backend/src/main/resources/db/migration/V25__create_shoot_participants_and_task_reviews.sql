-- V25: Add indexes for content_plans performance
CREATE INDEX idx_content_plans_company_status ON content_plans(company_id, status);
CREATE INDEX idx_content_plans_company_date ON content_plans(company_id, planned_date);
