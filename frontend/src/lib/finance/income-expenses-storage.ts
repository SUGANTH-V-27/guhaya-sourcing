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

const STORAGE_KEY = "guhaya-income-expenses";

export function loadManualEntries(): ManualEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ManualEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveManualEntries(entries: ManualEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getManualEntriesForMonth(
  year: number,
  month: number,
  type: ManualEntryType,
): ManualEntry[] {
  return loadManualEntries().filter(
    (entry) => entry.year === year && entry.month === month && entry.type === type,
  );
}

export function addManualEntry(entry: Omit<ManualEntry, "id">) {
  const entries = loadManualEntries();
  entries.push({ ...entry, id: `me-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` });
  saveManualEntries(entries);
}

export function deleteManualEntry(id: string) {
  saveManualEntries(loadManualEntries().filter((entry) => entry.id !== id));
}
