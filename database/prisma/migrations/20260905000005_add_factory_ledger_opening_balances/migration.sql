CREATE TABLE IF NOT EXISTS "factory_ledger_opening_balances" (
    "id" TEXT NOT NULL,
    "factoryName" TEXT NOT NULL,
    "fiscalYear" TEXT NOT NULL,
    "openingBalance" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "factory_ledger_opening_balances_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "factory_ledger_opening_balances_factoryName_fiscalYear_key"
  ON "factory_ledger_opening_balances"("factoryName", "fiscalYear");