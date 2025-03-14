/*
  Warnings:

  - You are about to drop the column `message` on the `CipherMessage` table. All the data in the column will be lost.
  - Added the required column `encrytptionKey` to the `CipherMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `input` to the `CipherMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `output` to the `CipherMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `CipherMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CipherMessage" DROP COLUMN "message",
ADD COLUMN     "encrytptionKey" INTEGER NOT NULL,
ADD COLUMN     "input" TEXT NOT NULL,
ADD COLUMN     "output" TEXT NOT NULL,
ADD COLUMN     "time" INTEGER NOT NULL;
