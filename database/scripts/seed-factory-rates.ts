import { existsSync, readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

type FactoryRateSeed = {
  factoryName: string;
  commissionRatePct: number;
};

function resolveSeedPayload() {
  const direct = process.env.FACTORY_COMMISSION_RATES || process.env.FACTORY_RATE_SEED;
  const filePath = process.env.FACTORY_COMMISSION_RATES_FILE || process.env.FACTORY_RATE_SEED_FILE;

  if (direct) {
    return direct;
  }

  if (filePath && existsSync(filePath)) {
    return readFileSync(filePath, "utf-8");
  }

  return "";
}

function normalizeSeed(input: unknown): FactoryRateSeed[] {
  const list = Array.isArray(input)
    ? input
    : input && typeof input === "object" && Array.isArray((input as { rates?: unknown[] }).rates)
      ? (input as { rates: unknown[] }).rates
      : input && typeof input === "object"
        ? [input]
        : [];

  return list
    .map((item) => {
      const rawItem = item as Record<string, unknown> | null;
      if (!rawItem) return null;

      const factoryName = String(rawItem.factoryName ?? rawItem.factory ?? rawItem.name ?? "").trim();
      const rawPct = rawItem.commissionRatePct ?? rawItem.commissionPct ?? rawItem.rate ?? rawItem.value;
      const commissionRatePct = Number(rawPct);

      if (!factoryName || Number.isNaN(commissionRatePct)) {
        return null;
      }

      return {
        factoryName,
        commissionRatePct: Number(commissionRatePct.toFixed(2)),
      };
    })
    .filter((value): value is FactoryRateSeed => Boolean(value));
}

async function main() {
  const payload = resolveSeedPayload();

  if (!payload) {
    console.log("No factory commission rate seed payload was provided. Skipping one-time seed.");
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch (error) {
    throw new Error(`Invalid factory commission rate seed JSON: ${(error as Error).message}`);
  }

  const seedRows = normalizeSeed(parsed);

  if (!seedRows.length) {
    console.log("Factory commission rate seed payload was empty. Nothing to migrate.");
    return;
  }

  const prisma = new PrismaClient();

  try {
    for (const row of seedRows) {
      await prisma.factoryCommissionRate.upsert({
        where: { factoryName: row.factoryName },
        update: { commissionRatePct: row.commissionRatePct },
        create: {
          factoryName: row.factoryName,
          commissionRatePct: row.commissionRatePct,
        },
      });
    }

    console.log(`Seeded ${seedRows.length} factory commission rate rows.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Failed to seed factory commission rates:", error);
  process.exit(1);
});
