-- IPTV Manager Database Schema
-- Created for Next.js + Node.js + MySQL application

SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables if they exist
DROP TABLE IF EXISTS `reward_redemptions`;
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `rewards`;
DROP TABLE IF EXISTS `referrals`;
DROP TABLE IF EXISTS `subscriptions`;
DROP TABLE IF EXISTS `subscription_plans`;
DROP TABLE IF EXISTS `clients`;
DROP TABLE IF EXISTS `admins`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `system_settings`;
DROP TABLE IF EXISTS `user_sessions`;
DROP TABLE IF EXISTS `client_statistics`;
DROP TABLE IF EXISTS `active_subscriptions`;

-- Users table (base table for authentication)
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','client') NOT NULL DEFAULT 'client',
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `email_verified` boolean DEFAULT FALSE,
  `email_verified_at` timestamp NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` timestamp NULL,
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admins table (extends users)
CREATE TABLE `admins` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `user_id` varchar(36) NOT NULL,
  `permissions` json,
  `department` varchar(50),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clients table (extends users)
CREATE TABLE `clients` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `user_id` varchar(36) NOT NULL,
  `phone` varchar(20),
  `address` text,
  `city` varchar(100),
  `state` varchar(50),
  `zip_code` varchar(20),
  `country` varchar(50) DEFAULT 'Brasil',
  `referral_code` varchar(20) UNIQUE,
  `referred_by` varchar(36),
  `total_points` int DEFAULT 0,
  `total_referrals` int DEFAULT 0,
  `subscription_status` enum('none','active','expired','suspended') DEFAULT 'none',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`referred_by`) REFERENCES `clients`(`id`) ON DELETE SET NULL,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_referral_code` (`referral_code`),
  INDEX `idx_referred_by` (`referred_by`),
  INDEX `idx_subscription_status` (`subscription_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subscription Plans table
CREATE TABLE `subscription_plans` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `duration_days` int NOT NULL DEFAULT 30,
  `max_devices` int NOT NULL DEFAULT 1,
  `features` json,
  `is_popular` boolean DEFAULT FALSE,
  `is_active` boolean DEFAULT TRUE,
  `sort_order` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_is_popular` (`is_popular`),
  INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- Subscriptions table
CREATE TABLE `subscriptions` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `client_id` varchar(36) NOT NULL,
  `plan_id` varchar(36) NOT NULL,
  `status` enum('pending','active','expired','cancelled','suspended') NOT NULL DEFAULT 'pending',
  `start_date` timestamp DEFAULT CURRENT_TIMESTAMP,
  `end_date` timestamp NOT NULL,
  `auto_renew` boolean DEFAULT TRUE,
  `price_paid` decimal(10,2),
  `payment_method` varchar(50),
  `notes` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans`(`id`) ON DELETE RESTRICT,
  INDEX `idx_client_id` (`client_id`),
  INDEX `idx_plan_id` (`plan_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_end_date` (`end_date`),
  INDEX `idx_start_date` (`start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments table
CREATE TABLE `payments` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `subscription_id` varchar(36) NOT NULL,
  `client_id` varchar(36) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2),
  `currency` varchar(3) DEFAULT 'BRL',
  `payment_method` varchar(50) NOT NULL,
  `payment_gateway` varchar(50),
  `gateway_transaction_id` varchar(100),
  `status` enum('pending','processing','completed','failed','cancelled','refunded') NOT NULL DEFAULT 'pending',
  `payment_date` timestamp NULL,
  `due_date` timestamp NULL,
  `notes` text,
  `metadata` json,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE,
  INDEX `idx_subscription_id` (`subscription_id`),
  INDEX `idx_client_id` (`client_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_payment_date` (`payment_date`),
  INDEX `idx_gateway_transaction_id` (`gateway_transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- Referrals table
CREATE TABLE `referrals` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `referrer_id` varchar(36) NOT NULL,
  `referred_id` varchar(36) NOT NULL,
  `status` enum('pending','completed','cancelled') DEFAULT 'pending',
  `reward_points` int DEFAULT 0,
  `reward_given` boolean DEFAULT FALSE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`referrer_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`referred_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE,
  INDEX `idx_referrer_id` (`referrer_id`),
  INDEX `idx_referred_id` (`referred_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rewards table
CREATE TABLE `rewards` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `name` varchar(100) NOT NULL,
  `description` text,
  `points_required` int NOT NULL,
  `reward_type` enum('discount','free_month','upgrade','cashback') NOT NULL,
  `reward_value` decimal(10,2),
  `is_active` boolean DEFAULT TRUE,
  `max_redemptions` int,
  `current_redemptions` int DEFAULT 0,
  `valid_until` timestamp NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_points_required` (`points_required`),
  INDEX `idx_valid_until` (`valid_until`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reward Redemptions table
CREATE TABLE `reward_redemptions` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `client_id` varchar(36) NOT NULL,
  `reward_id` varchar(36) NOT NULL,
  `points_used` int NOT NULL,
  `status` enum('pending','approved','used','expired','cancelled') DEFAULT 'pending',
  `redeemed_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `used_at` timestamp NULL,
  `expires_at` timestamp NULL,
  `notes` text,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reward_id`) REFERENCES `rewards`(`id`) ON DELETE CASCADE,
  INDEX `idx_client_id` (`client_id`),
  INDEX `idx_reward_id` (`reward_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_redeemed_at` (`redeemed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Point Transactions table
CREATE TABLE `point_transactions` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `client_id` varchar(36) NOT NULL,
  `type` enum('earned','spent','bonus','penalty') NOT NULL,
  `points` int NOT NULL,
  `description` varchar(255) NOT NULL,
  `reference_type` enum('referral','subscription','reward','manual','bonus') DEFAULT NULL,
  `reference_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE,
  INDEX `idx_client_id` (`client_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_reference` (`reference_type`, `reference_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications table
CREATE TABLE `notifications` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `user_id` varchar(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') DEFAULT 'info',
  `is_read` boolean DEFAULT FALSE,
  `action_url` varchar(500),
  `metadata` json,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `read_at` timestamp NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_is_read` (`is_read`),
  INDEX `idx_type` (`type`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Logs table
CREATE TABLE `activity_logs` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `user_id` varchar(36),
  `action` varchar(100) NOT NULL,
  `description` text,
  `ip_address` varchar(45),
  `user_agent` text,
  `metadata` json,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_action` (`action`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_ip_address` (`ip_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System Settings table
CREATE TABLE `system_settings` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `key` varchar(100) NOT NULL UNIQUE,
  `value` text,
  `type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` text,
  `is_public` boolean DEFAULT FALSE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_key` (`key`),
  INDEX `idx_is_public` (`is_public`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Sessions table (for session management)
CREATE TABLE `user_sessions` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `user_id` varchar(36) NOT NULL,
  `session_token` varchar(255) NOT NULL UNIQUE,
  `device_info` json,
  `ip_address` varchar(45),
  `is_active` boolean DEFAULT TRUE,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `last_activity` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_session_token` (`session_token`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Client Statistics table (for analytics)
CREATE TABLE `client_statistics` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `client_id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `channels_watched` int DEFAULT 0,
  `watch_time_minutes` int DEFAULT 0,
  `devices_used` int DEFAULT 0,
  `peak_concurrent_streams` int DEFAULT 0,
  `data_consumed_mb` bigint DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_client_date` (`client_id`, `date`),
  INDEX `idx_client_id` (`client_id`),
  INDEX `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Expenses table (for business expense management)
CREATE TABLE `expenses` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `description` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `category` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `type` enum('fixed','variable') NOT NULL DEFAULT 'variable',
  `created_by` varchar(36) NOT NULL,
  `notes` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_category` (`category`),
  INDEX `idx_type` (`type`),
  INDEX `idx_date` (`date`),
  INDEX `idx_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Active Subscriptions View (for quick access to active subscriptions)
CREATE VIEW `active_subscriptions` AS
SELECT 
  s.*,
  c.user_id,
  u.name as client_name,
  u.email as client_email,
  sp.name as plan_name,
  sp.max_devices,
  DATEDIFF(s.end_date, NOW()) as days_remaining
FROM subscriptions s
JOIN clients c ON s.client_id = c.id
JOIN users u ON c.user_id = u.id
JOIN subscription_plans sp ON s.plan_id = sp.id
WHERE s.status = 'active' AND s.end_date > NOW();

SET FOREIGN_KEY_CHECKS = 1;