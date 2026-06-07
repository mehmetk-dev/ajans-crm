-- V24: Create content_plans table + full demo seed data

-- ============================================================
-- content_plans table
-- ============================================================
CREATE TABLE content_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    author_name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    content_size VARCHAR(100),
    direction TEXT,
    speaker_model VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    revision_note TEXT,
    planned_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_content_plans_company     ON content_plans(company_id);
CREATE INDEX idx_content_plans_created_by  ON content_plans(created_by);
CREATE INDEX idx_content_plans_status      ON content_plans(status);
CREATE INDEX idx_content_plans_planned_date ON content_plans(planned_date);

-- ============================================================
-- FOG İstanbul Ajans Çalışanları
-- ============================================================
INSERT INTO persons (id, company_id, full_name, email, position_title) VALUES
('a1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Enes',   'enes@fogistanbul.com',   'Yönetici'),
('a1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Hakan',  'hakan@fogistanbul.com',  'Çalışan'),
('a1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Mehmet', 'mehmet@fogistanbul.com', 'Çalışan'),
('a1000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Burcu',  'burcu@fogistanbul.com',  'Çalışan');

INSERT INTO user_profiles (id, person_id, global_role, email, password_hash) VALUES
('a1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'ADMIN',        'enes@fogistanbul.com',   '$2a$10$2c/zXMlI3O0HIYkA7aOa4eRZHO37e/d5zAYVBYZ5wJRZ4S0voEtQ6'),
('a1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 'AGENCY_STAFF', 'hakan@fogistanbul.com',  '$2a$10$117XdIqzXM1N2GspZr3GMedxXTKj1Z93fazvsAw37hX1IEzZglHXS'),
('a1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000005', 'AGENCY_STAFF', 'mehmet@fogistanbul.com', '$2a$10$dm65RoHppVpbPYATkFTyxe64CWXDPUm0sZiY9uO7MAY4QUZhKKbUC'),
('a1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000007', 'AGENCY_STAFF', 'burcu@fogistanbul.com',  '$2a$10$98uEHpH/cD4I2SEnN/ADce3nTwajIWSuWc6FgIG.KmIFb/bH.SNc2');

INSERT INTO company_memberships (user_id, company_id, membership_role) VALUES
('a1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'OWNER'),
('a1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'AGENCY_STAFF'),
('a1000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'AGENCY_STAFF'),
('a1000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'AGENCY_STAFF');

-- ============================================================
-- Müşteri Şirketler
-- ============================================================
INSERT INTO companies (id, kind, name, industry, email, contract_status) VALUES
('2e05b337-a870-4a0e-8a79-be9c65f173fc', 'CLIENT', 'Aydınlife',     'Mobilya & Dekorasyon', 'info@aydinlife.com',     'ACTIVE'),
('6ac08a8d-c583-42cf-878e-c885b5f38f65', 'CLIENT', 'Mermersa',      'Mermer & İnşaat',      'info@mermersa.com',      'ACTIVE'),
('d1000000-0000-0000-0000-000000000001', 'CLIENT', 'FM Madencilik', 'Madencilik',           'info@fmmadencilik.com',  'ACTIVE'),
('9f93ad73-2278-4767-b49f-8574e1f58481', 'CLIENT', 'Ecomspace',     'E-Ticaret',            'info@ecomspace.com',     'ACTIVE');

-- Aydınlife çalışanları
INSERT INTO persons (id, company_id, full_name, email, position_title) VALUES
('b1000000-0000-0000-0000-000000000001', '2e05b337-a870-4a0e-8a79-be9c65f173fc', 'Süleyman', 'suleyman@aydinlife.com', 'Şirket Sahibi'),
('b1000000-0000-0000-0000-000000000003', '2e05b337-a870-4a0e-8a79-be9c65f173fc', 'Ebru',     'ebru@aydinlife.com',     'Muhasebeci'),
('b1000000-0000-0000-0000-000000000005', '2e05b337-a870-4a0e-8a79-be9c65f173fc', 'Raşit',    'rasit@aydinlife.com',    'Satıcı');
INSERT INTO user_profiles (id, person_id, global_role, email, password_hash) VALUES
('b1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'COMPANY_USER', 'suleyman@aydinlife.com', '$2a$10$6wqQ1wC22SG6bCmH4.8Kz.eoFR6u08loHJHuvYkAs/ZtzSh.uV1M6'),
('b1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000003', 'COMPANY_USER', 'ebru@aydinlife.com',     '$2a$10$UnTtqnNRfufHj57jbaAb0O2mc78a/esLJTwveJxXz0Rs/6bElbLwa'),
('b1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000005', 'COMPANY_USER', 'rasit@aydinlife.com',    '$2a$10$R9Ryg/s3wBOBMBnz7nhMVenU5j.fA.82raIoFGxikYcEXv/yCjc8y');
INSERT INTO company_memberships (user_id, company_id, membership_role) VALUES
('b1000000-0000-0000-0000-000000000002', '2e05b337-a870-4a0e-8a79-be9c65f173fc', 'OWNER'),
('b1000000-0000-0000-0000-000000000004', '2e05b337-a870-4a0e-8a79-be9c65f173fc', 'EMPLOYEE'),
('b1000000-0000-0000-0000-000000000006', '2e05b337-a870-4a0e-8a79-be9c65f173fc', 'EMPLOYEE'),
('a1000000-0000-0000-0000-000000000002', '2e05b337-a870-4a0e-8a79-be9c65f173fc', 'AGENCY_STAFF'),
('a1000000-0000-0000-0000-000000000004', '2e05b337-a870-4a0e-8a79-be9c65f173fc', 'AGENCY_STAFF'),
('a1000000-0000-0000-0000-000000000006', '2e05b337-a870-4a0e-8a79-be9c65f173fc', 'AGENCY_STAFF'),
('a1000000-0000-0000-0000-000000000008', '2e05b337-a870-4a0e-8a79-be9c65f173fc', 'AGENCY_STAFF'),
('00000000-0000-0000-0000-000000000003', '2e05b337-a870-4a0e-8a79-be9c65f173fc', 'AGENCY_STAFF');

-- Mermersa çalışanları
INSERT INTO persons (id, company_id, full_name, email, position_title) VALUES
('c1000000-0000-0000-0000-000000000001', '6ac08a8d-c583-42cf-878e-c885b5f38f65', 'Ali Can', 'alican@mermersa.com', 'Şirket Sahibi'),
('c1000000-0000-0000-0000-000000000003', '6ac08a8d-c583-42cf-878e-c885b5f38f65', 'Merve',   'merve@mermersa.com',  'Mimar'),
('c1000000-0000-0000-0000-000000000005', '6ac08a8d-c583-42cf-878e-c885b5f38f65', 'Gözde',   'gozde@mermersa.com',  'Mimar');
INSERT INTO user_profiles (id, person_id, global_role, email, password_hash) VALUES
('c1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'COMPANY_USER', 'alican@mermersa.com', '$2a$10$6zaq0icd4RQ8H/qzOLxFRuIAXQmwF5O/w196gzr.7FbajLJuq4lVi'),
('c1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000003', 'COMPANY_USER', 'merve@mermersa.com',  '$2a$10$wGmVonzpg5fTQa.PtFsG3ul5QfZmqZLpZNZ/Iujz0.I6mqsdHcTZe'),
('c1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000005', 'COMPANY_USER', 'gozde@mermersa.com',  '$2a$10$KCnjMf3NarlW9UrhPvTpW.bjNICo/glnd9idRQ55T/Ma22AFV5aCC');
INSERT INTO company_memberships (user_id, company_id, membership_role) VALUES
('c1000000-0000-0000-0000-000000000002', '6ac08a8d-c583-42cf-878e-c885b5f38f65', 'OWNER'),
('c1000000-0000-0000-0000-000000000004', '6ac08a8d-c583-42cf-878e-c885b5f38f65', 'EMPLOYEE'),
('c1000000-0000-0000-0000-000000000006', '6ac08a8d-c583-42cf-878e-c885b5f38f65', 'EMPLOYEE'),
('a1000000-0000-0000-0000-000000000002', '6ac08a8d-c583-42cf-878e-c885b5f38f65', 'AGENCY_STAFF'),
('a1000000-0000-0000-0000-000000000004', '6ac08a8d-c583-42cf-878e-c885b5f38f65', 'AGENCY_STAFF'),
('a1000000-0000-0000-0000-000000000006', '6ac08a8d-c583-42cf-878e-c885b5f38f65', 'AGENCY_STAFF'),
('a1000000-0000-0000-0000-000000000008', '6ac08a8d-c583-42cf-878e-c885b5f38f65', 'AGENCY_STAFF'),
('00000000-0000-0000-0000-000000000003', '6ac08a8d-c583-42cf-878e-c885b5f38f65', 'AGENCY_STAFF');

-- FM Madencilik çalışanları
INSERT INTO persons (id, company_id, full_name, email, position_title) VALUES
('d1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'Fikret', 'fikret@fmmadencilik.com', 'Şirket Sahibi'),
('d1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001', 'İsmail', 'ismail@fmmadencilik.com', 'Mimar');
INSERT INTO user_profiles (id, person_id, global_role, email, password_hash) VALUES
('d1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000002', 'COMPANY_USER', 'fikret@fmmadencilik.com', '$2a$10$8OGn7J9Iw00QtZlhe6Eub.lXStuqVexnf//H4t7kkYy4vbw/ePJ2y'),
('d1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000004', 'COMPANY_USER', 'ismail@fmmadencilik.com', '$2a$10$hYqdHCCNH5Ambe41EXBp4.rvJoUFoqvJBWzX82njLYDG91tscBxUq');
INSERT INTO company_memberships (user_id, company_id, membership_role) VALUES
('d1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'OWNER'),
('d1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000001', 'EMPLOYEE'),
('a1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'AGENCY_STAFF'),
('a1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001', 'AGENCY_STAFF'),
('a1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000001', 'AGENCY_STAFF'),
('a1000000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000001', 'AGENCY_STAFF'),
('00000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'AGENCY_STAFF');

-- Ecomspace çalışanları
INSERT INTO persons (id, company_id, full_name, email, position_title) VALUES
('e1000000-0000-0000-0000-000000000001', '9f93ad73-2278-4767-b49f-8574e1f58481', 'Ali Can',   'alican@ecomspace.com',    'Şirket Sahibi'),
('e1000000-0000-0000-0000-000000000003', '9f93ad73-2278-4767-b49f-8574e1f58481', 'Mehri',     'mehri@ecomspace.com',     'SEO Uzmanı'),
('e1000000-0000-0000-0000-000000000005', '9f93ad73-2278-4767-b49f-8574e1f58481', 'Anastasia', 'anastasia@ecomspace.com', 'Asistan'),
('e1000000-0000-0000-0000-000000000007', '9f93ad73-2278-4767-b49f-8574e1f58481', 'Ömer',      'omer@ecomspace.com',      'Satışçı');
INSERT INTO user_profiles (id, person_id, global_role, email, password_hash) VALUES
('e1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', 'COMPANY_USER', 'alican@ecomspace.com',    '$2a$10$6zaq0icd4RQ8H/qzOLxFRuIAXQmwF5O/w196gzr.7FbajLJuq4lVi'),
('e1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000003', 'COMPANY_USER', 'mehri@ecomspace.com',     '$2a$10$p2GXEpdWSNsccwy7vzwupOGCZ0VvHFcJAevoG84i8bpzAaZ/felGG'),
('e1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000005', 'COMPANY_USER', 'anastasia@ecomspace.com', '$2a$10$NVJGsWnfxi2jHQox.uLQ7uZXZkmPRRQ/ZMYGmsMwNmdHtVyo9PfZa'),
('e1000000-0000-0000-0000-000000000008', 'e1000000-0000-0000-0000-000000000007', 'COMPANY_USER', 'omer@ecomspace.com',      '$2a$10$D8aE95GYN4M5jWrVFVJhTuvR4irSwlXIAvFUza7k7baKBvqsSYj2i');
INSERT INTO company_memberships (user_id, company_id, membership_role) VALUES
('e1000000-0000-0000-0000-000000000002', '9f93ad73-2278-4767-b49f-8574e1f58481', 'OWNER'),
('e1000000-0000-0000-0000-000000000004', '9f93ad73-2278-4767-b49f-8574e1f58481', 'EMPLOYEE'),
('e1000000-0000-0000-0000-000000000006', '9f93ad73-2278-4767-b49f-8574e1f58481', 'EMPLOYEE'),
('e1000000-0000-0000-0000-000000000008', '9f93ad73-2278-4767-b49f-8574e1f58481', 'EMPLOYEE'),
('a1000000-0000-0000-0000-000000000002', '9f93ad73-2278-4767-b49f-8574e1f58481', 'AGENCY_STAFF'),
('a1000000-0000-0000-0000-000000000004', '9f93ad73-2278-4767-b49f-8574e1f58481', 'AGENCY_STAFF'),
('a1000000-0000-0000-0000-000000000006', '9f93ad73-2278-4767-b49f-8574e1f58481', 'AGENCY_STAFF'),
('a1000000-0000-0000-0000-000000000008', '9f93ad73-2278-4767-b49f-8574e1f58481', 'AGENCY_STAFF'),
('00000000-0000-0000-0000-000000000003', '9f93ad73-2278-4767-b49f-8574e1f58481', 'AGENCY_STAFF');

-- ============================================================
-- Grup Sohbetleri (her şirket için 1 adet)
-- ============================================================
INSERT INTO group_conversations (id, name, company_id) VALUES
('f1000000-0000-0000-0000-000000000001', 'Aydınlife Grubu',     '2e05b337-a870-4a0e-8a79-be9c65f173fc'),
('f1000000-0000-0000-0000-000000000002', 'Mermersa Grubu',      '6ac08a8d-c583-42cf-878e-c885b5f38f65'),
('f1000000-0000-0000-0000-000000000003', 'FM Madencilik Grubu', 'd1000000-0000-0000-0000-000000000001'),
('f1000000-0000-0000-0000-000000000004', 'Ecomspace Grubu',     '9f93ad73-2278-4767-b49f-8574e1f58481');

INSERT INTO group_members (group_id, user_id) VALUES
-- Aydınlife
('f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002'),
('f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004'),
('f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000006'),
('f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000008'),
('f1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002'),
('f1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004'),
('f1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000006'),
-- Mermersa
('f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002'),
('f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004'),
('f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000006'),
('f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000008'),
('f1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002'),
('f1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000004'),
('f1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000006'),
-- FM Madencilik
('f1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002'),
('f1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004'),
('f1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000006'),
('f1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000008'),
('f1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003'),
('f1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000005'),
-- Ecomspace
('f1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002'),
('f1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004'),
('f1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000006'),
('f1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000008'),
('f1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000002'),
('f1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000004'),
('f1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000006'),
('f1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000008');

-- ============================================================
-- Çekimler (V27 seed tarafından referans alınıyor)
-- ============================================================
INSERT INTO shoots (id, company_id, title, description, shoot_date, location, status, created_by) VALUES
('753e18bd-b454-4d4b-91a7-a6faf224dcbf', '2e05b337-a870-4a0e-8a79-be9c65f173fc', 'koltuklar çekilicek',      'Koltuk koleksiyonu ürün çekimi',        '2026-04-07 10:00:00+03', 'Aydınlife Showroom',  'PLANNED', 'a1000000-0000-0000-0000-000000000002'),
('7a017c97-6c5a-4642-8068-c030b0836c61', '6ac08a8d-c583-42cf-878e-c885b5f38f65', 'Mermersa Çekimi',          'Mermer ürün çekimi',                    '2026-04-14 10:00:00+03', 'Mermersa Fabrika',    'PLANNED', 'a1000000-0000-0000-0000-000000000002'),
('e58ecd2d-cce8-4f55-af18-36a512413125', '2e05b337-a870-4a0e-8a79-be9c65f173fc', 'Aydınlife Showroom Çekimi','Showroom genel tanıtım çekimi',         '2026-04-17 10:00:00+03', 'Masko Showroom',      'PLANNED', 'a1000000-0000-0000-0000-000000000002'),
('df93b394-de26-4338-b4c2-d906e4c405cc', '9f93ad73-2278-4767-b49f-8574e1f58481', 'Ecomspace Ürün Çekimi',   'E-ticaret ürün fotoğraf çekimi',        '2026-04-21 10:00:00+03', 'Ecomspace Stüdyo',   'PLANNED', 'a1000000-0000-0000-0000-000000000002'),
('0a3f9ed5-72a6-438b-8b78-24d4a68a5ee1', '2e05b337-a870-4a0e-8a79-be9c65f173fc', 'Aydınlife Drone Çekimi',  'Fabrika ve showroom drone çekimi',      '2026-04-24 10:00:00+03', 'Aydınlife Fabrika',   'PLANNED', 'a1000000-0000-0000-0000-000000000002'),
('1d8f81f5-24fd-43b7-9054-86be63f08da5', '2e05b337-a870-4a0e-8a79-be9c65f173fc', 'Salı Günü Çekimi',         'Yeni sezon ürün çekimi',                '2026-04-28 10:00:00+03', 'Aydınlife Showroom',  'PLANNED', 'a1000000-0000-0000-0000-000000000002'),
('52140000-0000-0000-0000-000000000001', '2e05b337-a870-4a0e-8a79-be9c65f173fc', 'Deneme 2',                 'Deneme çekimi',                         '2026-05-05 10:00:00+03', 'Stüdyo',              'PLANNED', 'a1000000-0000-0000-0000-000000000002');
