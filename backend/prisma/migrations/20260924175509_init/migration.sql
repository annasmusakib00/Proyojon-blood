-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `blood_group` ENUM('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'O_POS', 'O_NEG', 'AB_POS', 'AB_NEG') NOT NULL,
    `profile_photo` VARCHAR(191) NULL,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `otp_hash` VARCHAR(191) NULL,
    `otp_expires_at` DATETIME(3) NULL,
    `is_available` BOOLEAN NOT NULL DEFAULT false,
    `is_locked` BOOLEAN NOT NULL DEFAULT false,
    `lock_start_date` DATETIME(3) NULL,
    `lock_end_date` DATETIME(3) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `fcm_token` VARCHAR(191) NULL,
    `donation_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blood_requests` (
    `id` VARCHAR(191) NOT NULL,
    `blood_group` ENUM('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'O_POS', 'O_NEG', 'AB_POS', 'AB_NEG') NOT NULL,
    `bags_needed` INTEGER NOT NULL,
    `hospital_name` VARCHAR(191) NOT NULL,
    `hospital_lat` DOUBLE NOT NULL,
    `hospital_lng` DOUBLE NOT NULL,
    `conveyance_amount` INTEGER NOT NULL,
    `agreement_accepted` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('PENDING', 'MATCHED', 'IN_PROGRESS', 'ARRIVED', 'COMPLETED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `acceptance_type` ENUM('SELF', 'PROXY') NULL,
    `proxy_name` VARCHAR(191) NULL,
    `proxy_phone` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `matched_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `requester_id` VARCHAR(191) NOT NULL,
    `matched_donor_id` VARCHAR(191) NULL,
    `organizer_id` VARCHAR(191) NULL,

    INDEX `blood_requests_blood_group_status_idx`(`blood_group`, `status`),
    INDEX `blood_requests_hospital_lat_hospital_lng_idx`(`hospital_lat`, `hospital_lng`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_logs` (
    `id` VARCHAR(191) NOT NULL,
    `channel` ENUM('PUSH', 'SMS') NOT NULL,
    `delivery_status` ENUM('SENT', 'DELIVERED', 'FAILED') NOT NULL DEFAULT 'SENT',
    `sent_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `request_id` VARCHAR(191) NOT NULL,
    `donor_id` VARCHAR(191) NOT NULL,

    INDEX `notification_logs_request_id_idx`(`request_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_badges` (
    `id` VARCHAR(191) NOT NULL,
    `badge_type` ENUM('HERO', 'ORGANIZER') NOT NULL,
    `awarded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` VARCHAR(191) NOT NULL,

    INDEX `user_badges_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `blood_requests` ADD CONSTRAINT `blood_requests_requester_id_fkey` FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blood_requests` ADD CONSTRAINT `blood_requests_matched_donor_id_fkey` FOREIGN KEY (`matched_donor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blood_requests` ADD CONSTRAINT `blood_requests_organizer_id_fkey` FOREIGN KEY (`organizer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_logs` ADD CONSTRAINT `notification_logs_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `blood_requests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_logs` ADD CONSTRAINT `notification_logs_donor_id_fkey` FOREIGN KEY (`donor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_badges` ADD CONSTRAINT `user_badges_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
