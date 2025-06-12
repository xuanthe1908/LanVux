-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th6 12, 2025 lúc 10:14 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `e_learning`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ai_chat_history`
--

CREATE TABLE `ai_chat_history` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `user_id` varchar(36) NOT NULL,
  `course_id` varchar(36) DEFAULT NULL,
  `query` text NOT NULL,
  `response` text NOT NULL,
  `session_id` varchar(36) DEFAULT NULL,
  `tokens_used` int(11) DEFAULT 0,
  `response_time_ms` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `assignments`
--

CREATE TABLE `assignments` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `course_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `due_date` timestamp NULL DEFAULT NULL,
  `max_points` int(11) NOT NULL DEFAULT 100,
  `assignment_type` enum('essay','multiple_choice','file_upload','coding','project') DEFAULT 'essay',
  `instructions` text DEFAULT NULL,
  `grading_rubric` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`grading_rubric`)),
  `allow_late_submission` tinyint(1) DEFAULT 0,
  `late_penalty_percent` decimal(5,2) DEFAULT 0.00,
  `is_published` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `assignment_submissions`
--

CREATE TABLE `assignment_submissions` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `assignment_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `submission_url` text DEFAULT NULL,
  `submission_text` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `grade` decimal(5,2) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `graded_at` timestamp NULL DEFAULT NULL,
  `graded_by` varchar(36) DEFAULT NULL,
  `is_late` tinyint(1) DEFAULT 0,
  `submission_status` enum('draft','submitted','graded','returned') DEFAULT 'submitted',
  `attempt_number` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `color` varchar(7) DEFAULT NULL,
  `parent_id` varchar(36) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `coupons`
--

CREATE TABLE `coupons` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `discount_type` enum('percentage','fixed','bogo','free_shipping') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `minimum_amount` decimal(10,2) DEFAULT 0.00,
  `maximum_discount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `usage_limit_per_user` int(11) DEFAULT 1,
  `used_count` int(11) DEFAULT 0,
  `valid_from` datetime NOT NULL,
  `valid_until` datetime NOT NULL,
  `timezone` varchar(50) DEFAULT 'UTC',
  `is_active` tinyint(1) DEFAULT 1,
  `is_public` tinyint(1) DEFAULT 1,
  `auto_apply` tinyint(1) DEFAULT 0,
  `applicable_courses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`applicable_courses`)),
  `applicable_categories` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`applicable_categories`)),
  `excluded_courses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`excluded_courses`)),
  `excluded_categories` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`excluded_categories`)),
  `user_restrictions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`user_restrictions`)),
  `eligible_user_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`eligible_user_ids`)),
  `stackable` tinyint(1) DEFAULT 0,
  `priority` int(11) DEFAULT 0,
  `first_purchase_only` tinyint(1) DEFAULT 0,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `internal_notes` text DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ;

--
-- Đang đổ dữ liệu cho bảng `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `name`, `description`, `discount_type`, `discount_value`, `minimum_amount`, `maximum_discount`, `usage_limit`, `usage_limit_per_user`, `used_count`, `valid_from`, `valid_until`, `timezone`, `is_active`, `is_public`, `auto_apply`, `applicable_courses`, `applicable_categories`, `excluded_courses`, `excluded_categories`, `user_restrictions`, `eligible_user_ids`, `stackable`, `priority`, `first_purchase_only`, `tags`, `internal_notes`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('coupon-001-welcome-10-percent', 'WELCOME10', 'Welcome 10% Discount', 'Get 10% off your first course', 'percentage', 10.00, 50000.00, NULL, NULL, 1, 1, '2024-01-01 00:00:00', '2024-12-31 23:59:59', 'UTC', 1, 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL, 'admin-user-id', '2025-06-04 19:59:30', '2025-06-04 20:00:12', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `coupon_usage`
--

CREATE TABLE `coupon_usage` (
  `id` varchar(36) NOT NULL,
  `coupon_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `payment_id` varchar(36) DEFAULT NULL,
  `order_id` varchar(50) DEFAULT NULL,
  `discount_amount` decimal(10,2) NOT NULL,
  `original_amount` decimal(10,2) NOT NULL,
  `final_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','applied','expired','cancelled') DEFAULT 'applied',
  `course_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`course_ids`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `referrer_url` text DEFAULT NULL,
  `used_at` datetime DEFAULT current_timestamp(),
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `coupon_usage`
--

INSERT INTO `coupon_usage` (`id`, `coupon_id`, `user_id`, `payment_id`, `order_id`, `discount_amount`, `original_amount`, `final_amount`, `status`, `course_ids`, `ip_address`, `user_agent`, `referrer_url`, `used_at`, `expires_at`) VALUES
('usage-001-sample', 'coupon-001-welcome-10-percent', 'user-001-sample', NULL, 'ORDER-001-SAMPLE', 5000.00, 50000.00, 45000.00, 'applied', '[\"course-001\", \"course-002\"]', NULL, NULL, NULL, '2025-06-04 19:59:51', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `courses`
--

CREATE TABLE `courses` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `thumbnail_url` text DEFAULT NULL,
  `teacher_id` varchar(36) NOT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `level` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
  `category` varchar(100) DEFAULT NULL,
  `category_id` varchar(36) DEFAULT NULL,
  `duration_hours` int(11) DEFAULT 0,
  `language` varchar(5) DEFAULT 'en',
  `prerequisites` text DEFAULT NULL,
  `learning_objectives` text DEFAULT NULL,
  `target_audience` text DEFAULT NULL,
  `certificate_enabled` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `enrollments`
--

CREATE TABLE `enrollments` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `user_id` varchar(36) NOT NULL,
  `course_id` varchar(36) NOT NULL,
  `progress` decimal(5,2) DEFAULT 0.00,
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `last_accessed_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `enrollment_type` enum('free','paid','trial') DEFAULT 'free',
  `expires_at` timestamp NULL DEFAULT NULL,
  `certificate_issued` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lectures`
--

CREATE TABLE `lectures` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `course_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `content_type` enum('video','document','quiz','text','audio') DEFAULT 'video',
  `content_url` text DEFAULT NULL,
  `order_index` int(11) NOT NULL,
  `duration` int(11) DEFAULT 0,
  `is_published` tinyint(1) DEFAULT 0,
  `is_free` tinyint(1) DEFAULT 0,
  `transcript` text DEFAULT NULL,
  `resources` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`resources`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lecture_progress`
--

CREATE TABLE `lecture_progress` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `user_id` varchar(36) NOT NULL,
  `lecture_id` varchar(36) NOT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `progress_seconds` int(11) DEFAULT 0,
  `last_accessed_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `notes` text DEFAULT NULL,
  `bookmarks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`bookmarks`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `messages`
--

CREATE TABLE `messages` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `sender_id` varchar(36) NOT NULL,
  `recipient_id` varchar(36) NOT NULL,
  `course_id` varchar(36) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `message_type` enum('general','assignment','announcement','question','feedback') DEFAULT 'general',
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal',
  `parent_message_id` varchar(36) DEFAULT NULL,
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payments`
--

CREATE TABLE `payments` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `course_id` varchar(36) NOT NULL,
  `order_id` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'VND',
  `payment_method` varchar(50) DEFAULT 'vnpay',
  `payment_status` enum('pending','completed','failed','cancelled','refunded') DEFAULT 'pending',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reviews`
--

CREATE TABLE `reviews` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `course_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `helpful_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','teacher','admin') DEFAULT 'student',
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `profile_picture` text DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `timezone` varchar(50) DEFAULT 'UTC',
  `language` varchar(5) DEFAULT 'en',
  `is_active` tinyint(1) DEFAULT 1,
  `email_verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `role`, `first_name`, `last_name`, `profile_picture`, `bio`, `phone_number`, `date_of_birth`, `timezone`, `language`, `is_active`, `email_verified`, `created_at`, `updated_at`) VALUES
('admin-user-id', 'admin@elearning.com', '$2a$12$hashedpassword', 'admin', 'Admin', 'User', NULL, NULL, NULL, NULL, 'UTC', 'en', 1, 0, '2025-06-04 12:59:30', '2025-06-04 12:59:30'),
('user-001-sample', 'user001@example.com', '$2a$12$hashedpassword', 'student', 'John', 'Doe', NULL, NULL, NULL, NULL, 'UTC', 'en', 1, 0, '2025-06-04 12:56:30', '2025-06-04 12:56:30');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `ai_chat_history`
--
ALTER TABLE `ai_chat_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ai_chat_user` (`user_id`),
  ADD KEY `idx_ai_chat_course` (`course_id`),
  ADD KEY `idx_ai_chat_session` (`session_id`),
  ADD KEY `idx_ai_chat_created_at` (`created_at`);

--
-- Chỉ mục cho bảng `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_assignments_course` (`course_id`),
  ADD KEY `idx_assignments_due_date` (`due_date`),
  ADD KEY `idx_assignments_published` (`is_published`);

--
-- Chỉ mục cho bảng `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `graded_by` (`graded_by`),
  ADD KEY `idx_submissions_assignment` (`assignment_id`),
  ADD KEY `idx_submissions_user` (`user_id`),
  ADD KEY `idx_submissions_submitted_at` (`submitted_at`),
  ADD KEY `idx_submissions_status` (`submission_status`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_categories_name` (`name`),
  ADD KEY `idx_categories_parent` (`parent_id`),
  ADD KEY `idx_categories_active` (`is_active`);

--
-- Chỉ mục cho bảng `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_coupons_code` (`code`),
  ADD KEY `idx_coupons_active` (`is_active`),
  ADD KEY `idx_coupons_public` (`is_public`),
  ADD KEY `idx_coupons_valid_dates` (`valid_from`,`valid_until`),
  ADD KEY `idx_coupons_created_by` (`created_by`),
  ADD KEY `idx_coupons_usage` (`used_count`,`usage_limit`),
  ADD KEY `idx_coupons_type` (`discount_type`),
  ADD KEY `idx_coupons_priority` (`priority`),
  ADD KEY `idx_coupons_deleted` (`deleted_at`);

--
-- Chỉ mục cho bảng `coupon_usage`
--
ALTER TABLE `coupon_usage`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_coupon_order` (`coupon_id`,`user_id`,`order_id`),
  ADD KEY `idx_coupon_id` (`coupon_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_payment_id` (`payment_id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_used_at` (`used_at`);

--
-- Chỉ mục cho bảng `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_courses_teacher` (`teacher_id`),
  ADD KEY `idx_courses_status` (`status`),
  ADD KEY `idx_courses_category` (`category_id`),
  ADD KEY `idx_courses_level` (`level`),
  ADD KEY `idx_courses_price` (`price`),
  ADD KEY `idx_courses_created_at` (`created_at`);
ALTER TABLE `courses` ADD FULLTEXT KEY `idx_courses_search` (`title`,`description`);

--
-- Chỉ mục cho bảng `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_course` (`user_id`,`course_id`),
  ADD KEY `idx_enrollments_user` (`user_id`),
  ADD KEY `idx_enrollments_course` (`course_id`),
  ADD KEY `idx_enrollments_progress` (`progress`),
  ADD KEY `idx_enrollments_enrolled_at` (`enrolled_at`);

--
-- Chỉ mục cho bảng `lectures`
--
ALTER TABLE `lectures`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_course_order` (`course_id`,`order_index`),
  ADD KEY `idx_lectures_course` (`course_id`),
  ADD KEY `idx_lectures_order` (`course_id`,`order_index`),
  ADD KEY `idx_lectures_published` (`is_published`);

--
-- Chỉ mục cho bảng `lecture_progress`
--
ALTER TABLE `lecture_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_lecture` (`user_id`,`lecture_id`),
  ADD KEY `idx_lecture_progress_user` (`user_id`),
  ADD KEY `idx_lecture_progress_lecture` (`lecture_id`),
  ADD KEY `idx_lecture_progress_completed` (`is_completed`);

--
-- Chỉ mục cho bảng `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent_message_id` (`parent_message_id`),
  ADD KEY `idx_messages_sender` (`sender_id`),
  ADD KEY `idx_messages_recipient` (`recipient_id`),
  ADD KEY `idx_messages_course` (`course_id`),
  ADD KEY `idx_messages_created_at` (`created_at`),
  ADD KEY `idx_messages_read` (`is_read`);
ALTER TABLE `messages` ADD FULLTEXT KEY `idx_messages_search` (`subject`,`content`);

--
-- Chỉ mục cho bảng `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`);

--
-- Chỉ mục cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_course_review` (`user_id`,`course_id`),
  ADD KEY `idx_reviews_course` (`course_id`),
  ADD KEY `idx_reviews_user` (`user_id`),
  ADD KEY `idx_reviews_rating` (`rating`),
  ADD KEY `idx_reviews_created_at` (`created_at`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_created_at` (`created_at`);

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `ai_chat_history`
--
ALTER TABLE `ai_chat_history`
  ADD CONSTRAINT `ai_chat_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ai_chat_history_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  ADD CONSTRAINT `assignment_submissions_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignment_submissions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignment_submissions_ibfk_3` FOREIGN KEY (`graded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `coupons`
--
ALTER TABLE `coupons`
  ADD CONSTRAINT `coupons_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `coupon_usage`
--
ALTER TABLE `coupon_usage`
  ADD CONSTRAINT `fk_coupon_usage_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_coupon_usage_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_coupon_usage_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `courses_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `lectures`
--
ALTER TABLE `lectures`
  ADD CONSTRAINT `lectures_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `lecture_progress`
--
ALTER TABLE `lecture_progress`
  ADD CONSTRAINT `lecture_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lecture_progress_ibfk_2` FOREIGN KEY (`lecture_id`) REFERENCES `lectures` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `messages_ibfk_4` FOREIGN KEY (`parent_message_id`) REFERENCES `messages` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
