import financeService from "@/services/finance.service";

export type ManualEntryType = "income" | "expense";

export type ManualEntry = {
  id: string;
  year: number;
  month: number;
  type: ManualEntryType;
  date: string;
  value: number;
  remarks: string;
};

function mapEntry(item: any, type: ManualEntryType): ManualEntry {
  const date = item.entryDate || new Date().toISOString();
  return {
    id: item.id,
    year: new Date(date).getUTCFullYear(),
    month: new Date(date).getUTCMonth() + 1,
    type,
    date: String(date).slice(0, 10),
    value: Number(item.amount) || 0,
    remarks: item.remarks || item.description || "",
  };
}

export async function getManualEntriesForMonth(
  year: number,
  month: number,
  type: ManualEntryType,
): Promise<ManualEntry[]> {
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const result = await financeService.getIncomeExpenses(monthKey);
  const entries = type === "income" ? result.income : result.expenses;
  return entries.map((item: any) => mapEntry(item, type));
}

export async function addManualEntry(entry: Omit<ManualEntry, "id">) {
  const date = new Date(entry.date);
  const payload = {
    amount: entry.value,
    entryDate: entry.date,
    monthKey: `${entry.year}-${String(entry.month).padStart(2, "0")}`,
    ...(entry.type === "income"
      ? { sourceName: entry.remarks || "Manual income", category: "Manual", remarks: entry.remarks }
      : { expenseName: entry.remarks || "Manual expense", category: "Manual", remarks: entry.remarks }),
  };
  if (Number.isNaN(date.getTime())) throw new Error("A valid entry date is required.");
  if (entry.type === "income") await financeService.createIncome(payload);
  else await financeService.createExpense(payload);
}

export async function deleteManualEntry(id: string, type: ManualEntryType) {
  if (type === "income") await financeService.deleteIncome(id);
  else await financeService.deleteExpense(id);
}
