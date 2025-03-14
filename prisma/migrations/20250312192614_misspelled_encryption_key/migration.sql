/*
  Warnings:

  - You are about to drop the column `encrytptionKey` on the `CipherMessage` table. All the data in the column will be lost.
  - Added the required column `encryptionKey` to the `CipherMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CipherMessage" DROP COLUMN "encrytptionKey",
ADD COLUMN     "encryptionKey" INTEGER NOT NULL;
