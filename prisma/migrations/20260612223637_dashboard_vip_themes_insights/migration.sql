-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "detectedNewPrice" DOUBLE PRECISION,
ADD COLUMN     "paused" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sourceTier" TEXT,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "buyClicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isVip" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showcaseVisits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "template" TEXT NOT NULL DEFAULT 'grid',
ADD COLUMN     "themeCustom" TEXT,
ADD COLUMN     "themeFont" TEXT NOT NULL DEFAULT 'fonce',
ADD COLUMN     "themePreset" TEXT NOT NULL DEFAULT 'fonce',
ADD COLUMN     "vipPeriod" TEXT,
ADD COLUMN     "vipSince" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "orderId" TEXT,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reward_userId_idx" ON "Reward"("userId");

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
