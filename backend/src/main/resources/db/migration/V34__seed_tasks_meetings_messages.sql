-- V34: Seed tasks, meetings, and messages

-- ============================================================
-- GÖREVLER
-- ============================================================

-- Aydınlife görevleri
INSERT INTO tasks (id, company_id, assigned_to, created_by, title, description, category, priority, status, end_date) VALUES
(gen_random_uuid(), '2e05b337-a870-4a0e-8a79-be9c65f173fc', 'a1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Instagram Reels Hazırla',     'Koltuk serisini tanıtan 30 saniyelik reels içeriği hazırlanacak', 'REELS',    'HIGH',   'IN_PROGRESS', '2026-05-10 18:00:00+03'),
(gen_random_uuid(), '2e05b337-a870-4a0e-8a79-be9c65f173fc', 'a1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'Web Sitesi SEO Analizi',       'Aydinlife.com için teknik SEO raporu hazırlanacak',               'SEO',      'MEDIUM', 'TODO',        '2026-05-15 18:00:00+03'),
(gen_random_uuid(), '2e05b337-a870-4a0e-8a79-be9c65f173fc', 'a1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000002', 'Mayıs Sosyal Medya Takvimi',  'Mayıs ayı içerik takvimi planlanacak ve onaya sunulacak',         'PAYLASIM', 'HIGH',   'TODO',        '2026-05-08 18:00:00+03'),
(gen_random_uuid(), '2e05b337-a870-4a0e-8a79-be9c65f173fc', 'a1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Showroom Fotoğraf Düzenle',   'Çekilen showroom fotoğrafları renk düzenlemesi yapılacak',        'TASARIM',  'MEDIUM', 'DONE',        '2026-04-30 18:00:00+03'),
(gen_random_uuid(), '2e05b337-a870-4a0e-8a79-be9c65f173fc', 'a1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'Blog Yazısı: Dekorasyon Trendleri', 'Yeni sezon dekorasyon trendleri hakkında 1000 kelimelik blog', 'BLOG',     'LOW',    'IN_PROGRESS', '2026-05-12 18:00:00+03');

-- Mermersa görevleri
INSERT INTO tasks (id, company_id, assigned_to, created_by, title, description, category, priority, status, end_date) VALUES
(gen_random_uuid(), '6ac08a8d-c583-42cf-878e-c885b5f38f65', 'a1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'Mermer Kataloğu Tasarımı',    'Yeni mermer koleksiyonu için dijital katalog tasarımı',           'TASARIM',  'HIGH',   'IN_PROGRESS', '2026-05-14 18:00:00+03'),
(gen_random_uuid(), '6ac08a8d-c583-42cf-878e-c885b5f38f65', 'a1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'LinkedIn Şirket Sayfası',     'Mermersa LinkedIn kurumsal sayfası oluşturulacak',                'PAYLASIM', 'MEDIUM', 'TODO',        '2026-05-20 18:00:00+03'),
(gen_random_uuid(), '6ac08a8d-c583-42cf-878e-c885b5f38f65', 'a1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000002', 'Google Ads Kampanyası Kur',   'Mermer sektörü hedefli Google Ads kampanyası kurulacak',          'OTHER',    'MEDIUM', 'TODO',        '2026-05-25 18:00:00+03'),
(gen_random_uuid(), '6ac08a8d-c583-42cf-878e-c885b5f38f65', 'a1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'Fabrika Çekimi Düzenle',      'Fabrika çekim fotoğrafları düzenlenecek ve teslim edilecek',      'TASARIM',  'HIGH',   'DONE',        '2026-04-25 18:00:00+03');

-- FM Madencilik görevleri
INSERT INTO tasks (id, company_id, assigned_to, created_by, title, description, category, priority, status, end_date) VALUES
(gen_random_uuid(), 'd1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Kurumsal Web Sitesi Tasarımı','FM Madencilik için modern kurumsal web sitesi tasarımı',          'TASARIM',  'URGENT', 'IN_PROGRESS', '2026-05-30 18:00:00+03'),
(gen_random_uuid(), 'd1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000002', 'Sektör Analizi Raporu',       'Madencilik sektörü dijital pazarlama analizi hazırlanacak',       'OTHER',    'LOW',    'TODO',        '2026-05-18 18:00:00+03'),
(gen_random_uuid(), 'd1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'Logo ve Kurumsal Kimlik',     'FM Madencilik marka kimliği yenileme çalışması',                  'TASARIM',  'HIGH',   'TODO',        '2026-06-05 18:00:00+03');

-- Ecomspace görevleri
INSERT INTO tasks (id, company_id, assigned_to, created_by, title, description, category, priority, status, end_date) VALUES
(gen_random_uuid(), '9f93ad73-2278-4767-b49f-8574e1f58481', 'a1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Ürün Fotoğrafları Düzenle',   'E-ticaret çekim fotoğrafları arka plan temizleme ve düzenleme',   'TASARIM',  'HIGH',   'DONE',        '2026-04-28 18:00:00+03'),
(gen_random_uuid(), '9f93ad73-2278-4767-b49f-8574e1f58481', 'a1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000002', 'Meta Ads Hazırla',            'Instagram ve Facebook reklam görselleri ve metinleri hazırlanacak','REELS',    'URGENT', 'IN_PROGRESS', '2026-05-10 18:00:00+03'),
(gen_random_uuid(), '9f93ad73-2278-4767-b49f-8574e1f58481', 'a1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'SEO İçerik Planı',            'E-ticaret sitesi için 3 aylık SEO içerik planı hazırlanacak',     'SEO',      'MEDIUM', 'TODO',        '2026-05-22 18:00:00+03'),
(gen_random_uuid(), '9f93ad73-2278-4767-b49f-8574e1f58481', 'a1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'TikTok İçerik Serisi',        'Ürün tanıtım TikTok videolarından oluşan 5 parçalık seri',        'REELS',    'MEDIUM', 'TODO',        '2026-05-17 18:00:00+03');

-- ============================================================
-- TOPLANTILER
-- ============================================================

-- Aydınlife toplantıları
INSERT INTO meetings (id, company_id, title, description, meeting_date, duration_minutes, location, status, created_by) VALUES
('11100000-0000-0000-0000-000000000001', '2e05b337-a870-4a0e-8a79-be9c65f173fc',
 'Mayıs Strateji Toplantısı', 'Mayıs ayı dijital pazarlama stratejisi ve hedefler',
 '2026-05-06 14:00:00+03', 60, 'Google Meet', 'PLANNED', 'a1000000-0000-0000-0000-000000000002'),
('11100000-0000-0000-0000-000000000002', '2e05b337-a870-4a0e-8a79-be9c65f173fc',
 'İçerik Onay Toplantısı', 'Hazırlanan içeriklerin müşteri onayına sunulması',
 '2026-04-28 10:00:00+03', 45, 'Zoom', 'COMPLETED', 'a1000000-0000-0000-0000-000000000002');

-- Mermersa toplantıları
INSERT INTO meetings (id, company_id, title, description, meeting_date, duration_minutes, location, status, created_by) VALUES
('11100000-0000-0000-0000-000000000003', '6ac08a8d-c583-42cf-878e-c885b5f38f65',
 'Katalog Onay Toplantısı', 'Mermer katalog tasarımının müşteri onayı',
 '2026-05-08 11:00:00+03', 30, 'Google Meet', 'PLANNED', 'a1000000-0000-0000-0000-000000000002'),
('11100000-0000-0000-0000-000000000004', '6ac08a8d-c583-42cf-878e-c885b5f38f65',
 'Kampanya Planlama', 'Q2 dijital kampanya planlaması ve bütçe görüşmesi',
 '2026-05-15 15:00:00+03', 90, 'Ofis', 'PLANNED', 'a1000000-0000-0000-0000-000000000002');

-- FM Madencilik toplantıları
INSERT INTO meetings (id, company_id, title, description, meeting_date, duration_minutes, location, status, created_by) VALUES
('11100000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000001',
 'Keşif Toplantısı', 'FM Madencilik ile ilk keşif ve ihtiyaç analizi toplantısı',
 '2026-04-30 13:00:00+03', 60, 'Zoom', 'COMPLETED', 'a1000000-0000-0000-0000-000000000002'),
('11100000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000001',
 'Web Sitesi Brifing', 'Kurumsal web sitesi tasarım brifing toplantısı',
 '2026-05-12 10:00:00+03', 60, 'Google Meet', 'PLANNED', 'a1000000-0000-0000-0000-000000000002');

-- Ecomspace toplantıları
INSERT INTO meetings (id, company_id, title, description, meeting_date, duration_minutes, location, status, created_by) VALUES
('11100000-0000-0000-0000-000000000007', '9f93ad73-2278-4767-b49f-8574e1f58481',
 'Reklam Performans Değerlendirmesi', 'Nisan ayı reklam kampanya sonuçları değerlendirmesi',
 '2026-05-02 14:00:00+03', 45, 'Google Meet', 'PLANNED', 'a1000000-0000-0000-0000-000000000002'),
('11100000-0000-0000-0000-000000000008', '9f93ad73-2278-4767-b49f-8574e1f58481',
 'Ürün Lansmanı Planlaması', 'Yeni ürün grubunun dijital lansman stratejisi',
 '2026-05-20 15:00:00+03', 90, 'Zoom', 'PLANNED', 'a1000000-0000-0000-0000-000000000002');

-- Toplantı katılımcıları
INSERT INTO meeting_participants (meeting_id, user_id) VALUES
('11100000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002'),
('11100000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004'),
('11100000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002'),
('11100000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002'),
('11100000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000008'),
('11100000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002'),
('11100000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004'),
('11100000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002'),
('11100000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000006'),
('11100000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002'),
('11100000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002'),
('11100000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002'),
('11100000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002'),
('11100000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000003'),
('11100000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002'),
('11100000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000004'),
('11100000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000003'),
('11100000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000002'),
('11100000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000008'),
('11100000-0000-0000-0000-000000000007', 'e1000000-0000-0000-0000-000000000002'),
('11100000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000002'),
('11100000-0000-0000-0000-000000000008', 'e1000000-0000-0000-0000-000000000002'),
('11100000-0000-0000-0000-000000000008', 'e1000000-0000-0000-0000-000000000004');

-- ============================================================
-- GRUP MESAJLARI
-- ============================================================

-- Aydınlife grubu mesajları
INSERT INTO group_messages (id, group_id, sender_id, content, created_at) VALUES
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'Merhaba ekip! Mayıs ayı çalışmalarını bu gruptan koordine edeceğiz.', NOW() - INTERVAL '5 days'),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'Merhaba Enes Bey, bekliyoruz. Koltuk serisi için heyecanlıyız!', NOW() - INTERVAL '5 days' + INTERVAL '10 minutes'),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'Reels içeriği için taslak hazır, bugün paylaşacağım.', NOW() - INTERVAL '3 days'),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'Harika! Muhasebe tarafından onay gerektiğinde haber verin.', NOW() - INTERVAL '3 days' + INTERVAL '15 minutes'),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000008', 'Mayıs içerik takvimini hazırladım, mail attım Süleyman Bey.', NOW() - INTERVAL '1 day'),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'Aldım, inceleyeceğim teşekkürler Burcu Hanım.', NOW() - INTERVAL '1 day' + INTERVAL '20 minutes');

-- Mermersa grubu mesajları
INSERT INTO group_messages (id, group_id, sender_id, content, created_at) VALUES
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'Mermersa grubumuza hoş geldiniz! Çalışmalarımızı buradan takip edeceğiz.', NOW() - INTERVAL '7 days'),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'Teşekkürler, katalog tasarımı ne zaman hazır olacak?', NOW() - INTERVAL '7 days' + INTERVAL '30 minutes'),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000006', 'Bu hafta ilk taslağı paylaşacağız Ali Can Bey.', NOW() - INTERVAL '6 days'),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000004', 'Tasarımda kullanılacak görseller için onay bekleniyor muydu?', NOW() - INTERVAL '4 days'),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000006', 'Evet Merve Hanım, çekimden gelen fotoğrafları kullanacağız, onay beklemiyor.', NOW() - INTERVAL '4 days' + INTERVAL '5 minutes');

-- FM Madencilik grubu mesajları
INSERT INTO group_messages (id, group_id, sender_id, content, created_at) VALUES
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'FM Madencilik grubuna hoş geldiniz Fikret Bey ve İsmail Bey!', NOW() - INTERVAL '10 days'),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003', 'Teşekkürler Enes Bey. Web sitesi projesi için heyecanlıyız.', NOW() - INTERVAL '10 days' + INTERVAL '1 hour'),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 'Brifing toplantısının ardından tasarım sürecini başlatacağız.', NOW() - INTERVAL '5 days'),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000005', 'Web sitesi için referans sitelerimiz var, paylaşabilir miyiz?', NOW() - INTERVAL '3 days'),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 'Tabii İsmail Bey, buradan veya mail ile paylaşabilirsiniz.', NOW() - INTERVAL '3 days' + INTERVAL '10 minutes');

-- Ecomspace grubu mesajları
INSERT INTO group_messages (id, group_id, sender_id, content, created_at) VALUES
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Ecomspace grubuna hoş geldiniz! Yoğun bir Mayıs bizi bekliyor.', NOW() - INTERVAL '6 days'),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000002', 'Harika! Özellikle Meta Ads kampanyasını bekliyoruz Enes Bey.', NOW() - INTERVAL '6 days' + INTERVAL '20 minutes'),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000008', 'Ürün görselleri düzenlendi, Meta Ads reklam metinleri üzerinde çalışıyorum.', NOW() - INTERVAL '2 days'),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000004', 'SEO içerik planı için anahtar kelime araştırması yapıyorum, yarın paylaşırım.', NOW() - INTERVAL '2 days' + INTERVAL '45 minutes'),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000008', 'Bu ayki satış hedeflerimizi aştık, reklam performansı çok iyi gidiyor!', NOW() - INTERVAL '1 day'),
(gen_random_uuid(), 'f1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Haberdar ettiğiniz için teşekkürler Ömer Bey, devam edelim!', NOW() - INTERVAL '1 day' + INTERVAL '5 minutes');
