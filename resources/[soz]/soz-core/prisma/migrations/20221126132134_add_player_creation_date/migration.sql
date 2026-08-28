-- AlterTable
ALTER TABLE `player` ADD COLUMN `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- CreateIndex
CREATE INDEX `created_at` ON `player`(`created_at`);
