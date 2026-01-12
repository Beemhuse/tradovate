/*
  Warnings:

  - You are about to drop the column `amountCoin` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `amountUsdt` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `coinId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `exchangeRate` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `networkId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to alter the column `balance` on the `Wallet` table. The data in that column could be lost. The data in that column will be cast from `Decimal(36,18)` to `DoublePrecision`.
  - You are about to drop the `TradePeriods` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `amount` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TradePeriods" DROP CONSTRAINT "TradePeriods_pairId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_coinId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_networkId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "amountCoin",
DROP COLUMN "amountUsdt",
DROP COLUMN "coinId",
DROP COLUMN "exchangeRate",
DROP COLUMN "networkId",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fullName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Wallet" ALTER COLUMN "balance" SET DATA TYPE DOUBLE PRECISION;

-- DropTable
DROP TABLE "TradePeriods";
