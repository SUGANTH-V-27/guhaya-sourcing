const ONES = [
  "",
  "ONE",
  "TWO",
  "THREE",
  "FOUR",
  "FIVE",
  "SIX",
  "SEVEN",
  "EIGHT",
  "NINE",
  "TEN",
  "ELEVEN",
  "TWELVE",
  "THIRTEEN",
  "FOURTEEN",
  "FIFTEEN",
  "SIXTEEN",
  "SEVENTEEN",
  "EIGHTEEN",
  "NINETEEN",
];
const TENS = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return `${TENS[t]}${o ? ` ${ONES[o]}` : ""}`.trim();
}

function threeDigits(n: number): string {
  if (n === 0) return "";
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const head = h ? `${ONES[h]} HUNDRED` : "";
  const tail = rest ? twoDigits(rest) : "";
  return [head, tail].filter(Boolean).join(" ");
}

export function amountInWordsINR(amount: number): string {
  if (!amount || amount <= 0) return "ZERO";

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const hundred = rupees % 1000;

  const parts: string[] = [];
  if (crore) parts.push(`${threeDigits(crore)} CRORE`);
  if (lakh) parts.push(`${threeDigits(lakh)} LAKH`);
  if (thousand) parts.push(`${threeDigits(thousand)} THOUSAND`);
  if (hundred) parts.push(threeDigits(hundred));

  let words = parts.join(" ").trim();
  if (paise) {
    words += ` AND ${twoDigits(paise)} PAISE`;
  }
  return `${words} ONLY`;
}

/** Indian FY: April 1 – March 31 → suffix like 26-27 */
export function getFinancialYearSuffix(date: Date): string {
  const month = date.getMonth();
  const year = date.getFullYear();
  const startYear = month >= 3 ? year : year - 1;
  const y1 = startYear % 100;
  const y2 = (startYear + 1) % 100;
  return `${String(y1).padStart(2, "0")}-${String(y2).padStart(2, "0")}`;
}

export function formatInvoiceNumber(seq: number, fySuffix: string): string {
  return `GS/${String(seq).padStart(3, "0")}/${fySuffix}`;
}

export function parseInvoiceNumber(invoiceNumber: string): { seq: number; fy: string } | null {
  const match = invoiceNumber.trim().match(/^GS\/(\d+)\/(\d{2}-\d{2})$/i);
  if (!match) return null;
  return { seq: parseInt(match[1], 10), fy: match[2] };
}

export function getNextInvoiceSeq(existingNumbers: string[], fySuffix: string): number {
  let max = 0;
  existingNumbers.forEach((num) => {
    const parsed = parseInvoiceNumber(num);
    if (parsed && parsed.fy === fySuffix) {
      max = Math.max(max, parsed.seq);
    }
  });
  return max + 1;
}

export function isInvoiceNumberTaken(invoiceNumber: string, existingNumbers: string[], exclude?: string) {
  const normalized = invoiceNumber.trim().toUpperCase();
  return existingNumbers.some(
    (n) => n.trim().toUpperCase() === normalized && n.trim().toUpperCase() !== exclude?.trim().toUpperCase(),
  );
}

export function calcCommissionRowAmountUsd(quantity: number, originalQuantity: number, originalAmountUsd: number) {
  if (!originalQuantity) return originalAmountUsd;
  return (quantity / originalQuantity) * originalAmountUsd;
}

export function calcCommissionRowInr(amountUsd: number, conversion: number) {
  return amountUsd * conversion;
}

export function calcCommissionValue(amountUsd: number, commissionPct: number, conversion: number) {
  return Math.round(calcCommissionInr(amountUsd, commissionPct, conversion));
}

function calcCommissionInr(poValueUsd: number, commissionPct: number, rateInrUsd: number) {
  return poValueUsd * (commissionPct / 100) * rateInrUsd;
}
