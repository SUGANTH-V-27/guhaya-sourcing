CREATE TABLE IF NOT EXISTS "factory_commission_rates" (
    "id" TEXT NOT NULL,
    "factoryName" TEXT NOT NULL,
    "commissionRatePct" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factory_commission_rates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "factory_commission_rates_factoryName_key"
    ON "factory_commission_rates"("factoryName");
