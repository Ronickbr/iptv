-- IPTV Manager Seed Data
-- Initial data for production environment

SET FOREIGN_KEY_CHECKS = 0;

-- Insert Admin User Only
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `status`, `email_verified`, `created_at`) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Administrador', 'admin@iptv.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'admin', 'active', TRUE, NOW());

-- Insert Admin
INSERT INTO `admins` (`id`, `user_id`, `permissions`, `department`, `created_at`) VALUES
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', '{"users": true, "subscriptions": true, "channels": true, "payments": true, "reports": true}', 'TI', NOW());

-- Insert example clients for testing referrals
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `status`, `email_verified`, `created_at`) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'Rafael Silva', 'rafael@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'client', 'active', TRUE, NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Maria Santos', 'maria@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'client', 'active', TRUE, NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'João Oliveira', 'joao@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'client', 'active', TRUE, NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'Ana Costa', 'ana@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'client', 'active', TRUE, NOW());

-- Insert example clients
INSERT INTO `clients` (`id`, `user_id`, `phone`, `referral_code`, `referred_by`, `total_points`, `total_referrals`, `subscription_status`, `created_at`) VALUES
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440002', '(11) 99999-0001', 'RAFAEL2024', NULL, 250, 2, 'active', NOW()),
('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440003', '(11) 99999-0002', 'MARIA2024', '550e8400-e29b-41d4-a716-446655440202', 100, 0, 'active', NOW()),
('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440004', '(11) 99999-0003', 'JOAO2024', '550e8400-e29b-41d4-a716-446655440202', 100, 0, 'active', NOW()),
('550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440005', '(11) 99999-0004', 'ANA2024', NULL, 50, 0, 'pending', NOW());

-- Insert Subscription Plans
INSERT INTO `subscription_plans` (`id`, `name`, `description`, `price`, `duration_days`, `max_devices`, `features`, `is_popular`, `is_active`, `sort_order`, `created_at`) VALUES
('550e8400-e29b-41d4-a716-446655440301', 'Plano Básico', 'Acesso a canais básicos com qualidade HD', 29.90, 30, 1, '["HD Quality", "100+ Canais", "Suporte 24h"]', FALSE, TRUE, 1, NOW()),
('550e8400-e29b-41d4-a716-446655440302', 'Plano Premium', 'Acesso completo com canais premium e múltiplos dispositivos', 49.90, 30, 3, '["Full HD Quality", "300+ Canais", "Canais Premium", "3 Dispositivos", "Suporte Prioritário"]', TRUE, TRUE, 2, NOW()),
('550e8400-e29b-41d4-a716-446655440303', 'Plano Família', 'Plano completo para toda a família com máxima qualidade', 79.90, 30, 5, '["4K Quality", "500+ Canais", "Canais Premium", "Canais Infantis", "5 Dispositivos", "Gravação na Nuvem"]', FALSE, TRUE, 3, NOW());





-- Insert example referrals
INSERT INTO `referrals` (`id`, `referrer_id`, `referred_id`, `status`, `reward_points`, `reward_given`, `created_at`, `updated_at`) VALUES
('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440203', 'completed', 100, TRUE, DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440204', 'completed', 100, TRUE, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('550e8400-e29b-41d4-a716-446655440403', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440205', 'pending', 0, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Insert example point transactions
INSERT INTO `point_transactions` (`id`, `client_id`, `type`, `points`, `description`, `reference_type`, `reference_id`, `created_at`) VALUES
('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440202', 'earned', 100, 'Indicação aprovada - Maria Santos', 'referral', '550e8400-e29b-41d4-a716-446655440401', DATE_SUB(NOW(), INTERVAL 10 DAY)),
('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440202', 'earned', 100, 'Indicação aprovada - João Oliveira', 'referral', '550e8400-e29b-41d4-a716-446655440402', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440202', 'earned', 50, 'Bônus de boas-vindas', 'bonus', NULL, DATE_SUB(NOW(), INTERVAL 20 DAY));

-- No subscriptions, payments, rewards, notifications or activity logs - will be created through application usage

-- Insert System Settings
INSERT INTO `system_settings` (`id`, `key`, `value`, `type`, `description`, `is_public`, `created_at`) VALUES
('550e8400-e29b-41d4-a716-446655441301', 'app_name', 'IPTV Manager', 'string', 'Nome da aplicação', TRUE, NOW()),
('550e8400-e29b-41d4-a716-446655441302', 'app_version', '1.0.0', 'string', 'Versão da aplicação', TRUE, NOW()),
('550e8400-e29b-41d4-a716-446655441303', 'max_devices_per_plan', '5', 'number', 'Máximo de dispositivos por plano', FALSE, NOW()),
('550e8400-e29b-41d4-a716-446655441304', 'referral_points', '50', 'number', 'Pontos ganhos por indicação', FALSE, NOW()),
('550e8400-e29b-41d4-a716-446655441305', 'maintenance_mode', 'false', 'boolean', 'Modo de manutenção ativo', FALSE, NOW());

SET FOREIGN_KEY_CHECKS = 1;