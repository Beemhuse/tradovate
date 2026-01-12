/*
  Warnings:

  - You are about to drop the column `accountName` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `accountNumber` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `ifscCode` on the `Transaction` table. All the data in the column will be lost.
  - You are about to alter the column `balance` on the `Wallet` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(36,18)`.
  - Added the required column `amountCoin` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountUsdt` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coinId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exchangeRate` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "accountName",
DROP COLUMN "accountNumber",
DROP COLUMN "amount",
DROP COLUMN "bankName",
DROP COLUMN "ifscCode",
ADD COLUMN     "amountCoin" DECIMAL(36,18) NOT NULL,
ADD COLUMN     "amountUsdt" DECIMAL(36,18) NOT NULL,
ADD COLUMN     "coinId" TEXT NOT NULL,
ADD COLUMN     "exchangeRate" DECIMAL(36,18) NOT NULL,
ADD COLUMN     "networkId" TEXT;

-- AlterTable
ALTER TABLE "Wallet" ALTER COLUMN "balance" SET DATA TYPE DECIMAL(36,18);

-- CreateTable
CREATE TABLE "TradePeriods" (
    "id" TEXT NOT NULL,
    "pairId" TEXT NOT NULL,
    "period" "TradePeriod" NOT NULL,
    "label" TEXT NOT NULL,
    "profitPercent" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TradePeriods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TradePeriods_pairId_period_key" ON "TradePeriods"("pairId", "period");

-- AddForeignKey
ALTER TABLE "TradePeriods" ADD CONSTRAINT "TradePeriods_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "MarketPair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_coinId_fkey" FOREIGN KEY ("coinId") REFERENCES "Coin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "Network"("id") ON DELETE SET NULL ON UPDATE CASCADE;
