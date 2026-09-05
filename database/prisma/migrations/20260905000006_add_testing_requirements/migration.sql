CREATE TABLE IF NOT EXISTS "testing_requirements" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "parameter" TEXT NOT NULL DEFAULT '',
    "product" TEXT NOT NULL DEFAULT '',
    "requirement" TEXT NOT NULL DEFAULT '',
    "testMethod" TEXT NOT NULL DEFAULT '',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "testing_requirements_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "testing_requirements_purchaseOrderId_idx"
  ON "testing_requirements"("purchaseOrderId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'testing_requirements_purchaseOrderId_fkey'
  ) THEN
    ALTER TABLE "testing_requirements"
      ADD CONSTRAINT "testing_requirements_purchaseOrderId_fkey"
      FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
