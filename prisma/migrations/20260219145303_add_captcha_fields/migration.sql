-- AlterTable
ALTER TABLE "User" ADD COLUMN     "captchaBlockedUntil" TIMESTAMP(3),
ADD COLUMN     "failedCaptchaAttempts" INTEGER NOT NULL DEFAULT 0;
