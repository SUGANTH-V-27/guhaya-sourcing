"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Plus,
  Printer,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { useEffect } from "react";
import financeService from "../../../services/finance.service";
import { BrandsApi } from "@/lib/api/brands-api";
import {
  computeFactoryLedger,
  formatDateShort,
  formatInrCurrency,
  getAvailableFiscalYears,
  getFactoryList,
  type FactoryLedgerSummary,
  type LedgerTransaction,
} from "@/lib/finance/factory-ledger-data";

export function FactoryLedgerPage() {
  const fiscalYears = useMemo(() => getAvailableFiscalYears(), []);
  const [factoryOptions, setFactoryOptions] = useState<string[]>([]);

  const [selectedFy, setSelectedFy] = useState<string>("2026-27");
  const [selectedFactory, setSelectedFactory] = useState<string>(factoryOptions[0] || "");
  const [openingBalanceStr, setOpeningBalanceStr] = useState<string>("0");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [backendEntries, setBackendEntries] = useState<LedgerTransaction[]>([]);

  useEffect(() => {
    BrandsApi.getFactories()
      .then((factories: any[]) => setFactoryOptions(factories.map((factory) => factory.name).filter(Boolean)))
      .catch(() => getFactoryList().then(setFactoryOptions).catch(() => setFactoryOptions([])));
  }, []);

  useEffect(() => {
    if (!selectedFactory) return;
    const startYear = Number(selectedFy.slice(0, 4));
    const fromDate = `${startYear}-04-01`;
    const toDate = `${startYear + 1}-04-01`;
    financeService.getLedger(selectedFactory, fromDate, toDate)
      .then((records: any[]) => setBackendEntries(records.map((record) => ({
        id: record.id,
        date: record.transactionDate || record.date || "",
        particulars: record.description || record.particulars || "Ledger entry",
        vchType: "Journal Entry",
        vchNo: record.referenceNo || record.referenceNumber || "",
        debit: Number(record.debitAmount || record.debit) || null,
        credit: Number(record.creditAmount || record.credit) || null,
        balance: Number(record.runningBalance || record.balance) || 0,
        remarks: record.notes || record.remarks,
      }))))
      .catch(() => setBackendEntries([]));
    financeService.getLedgerOpeningBalance(selectedFactory, selectedFy)
      .then((record) => setOpeningBalanceStr(String(record?.openingBalance || 0)))
      .catch(() => setOpeningBalanceStr("0"));
  }, [selectedFactory, selectedFy]);

  const openingBalance = parseFloat(openingBalanceStr) || 0;

  const [ledgerSummary, setLedgerSummary] = useState<FactoryLedgerSummary>({
    openingBalance: 0,
    totalInvoiced: 0,
    totalReceived: 0,
    totalDebit: 0,
    totalCredit: 0,
    closingBalance: 0,
    transactions: [],
  });

  useEffect(() => {
    computeFactoryLedger(selectedFactory, selectedFy, openingBalance, backendEntries)
      .then(setLedgerSummary)
      .catch(() => setLedgerSummary((current) => ({ ...current, transactions: [] })));
  }, [selectedFactory, selectedFy, openingBalance, backendEntries]);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  function handleDownloadPDF() {
    if (!selectedFactory) {
      showToast("Please select a factory first");
      return;
    }

    try {
      // Create printable statement window
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        showToast("Popup blocked. Please allow popups to export ledger.");
        return;
      }

      const rowsHtml = ledgerSummary.transactions
        .map(
          (t) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px 12px; font-size: 12px;">${formatDateShort(t.date)}</td>
          <td style="padding: 8px 12px; font-size: 12px;">
            <span style="color: #6b7280; font-size: 11px;">${t.credit !== null ? "By " : "To "}</span>
            <strong>${t.particulars}</strong>
          </td>
          <td style="padding: 8px 12px; font-size: 12px;">${t.vchType}</td>
          <td style="padding: 8px 12px; font-size: 12px; font-family: monospace;">${t.vchNo || "-"}</td>
          <td style="padding: 8px 12px; font-size: 12px; text-align: right; font-family: monospace;">${
            t.debit !== null ? "₹ " + formatInrCurrency(t.debit) : ""
          }</td>
          <td style="padding: 8px 12px; font-size: 12px; text-align: right; font-family: monospace; color: #16a34a;">${
            t.credit !== null ? "₹ " + formatInrCurrency(t.credit) : ""
          }</td>
          <td style="padding: 8px 12px; font-size: 12px; text-align: right; font-family: monospace; font-weight: 600;">₹ ${formatInrCurrency(
            t.balance
          )}</td>
        </tr>
      `
        )
        .join("");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ledger Statement - ${selectedFactory} (FY ${selectedFy})</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 30px; color: #111827; }
            .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #0d9488; padding-bottom: 16px; }
            .company { font-size: 22px; font-weight: bold; color: #0f766e; }
            .factory { font-size: 18px; font-weight: 600; margin-top: 6px; }
            .subtitle { font-size: 13px; color: #4b5563; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #0d9488; color: white; padding: 10px 12px; font-size: 12px; text-align: left; }
            th.right { text-align: right; }
            .summary-box { display: flex; justify-content: space-between; margin-top: 24px; padding: 16px; background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; }
            .summary-item { text-align: center; }
            .summary-val { font-size: 16px; font-weight: bold; font-family: monospace; margin-top: 4px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">GUHAYA SOURCING PRIVATE LIMITED</div>
            <div class="factory">Ledger Account: ${selectedFactory}</div>
            <div class="subtitle">Financial Year: ${selectedFy} | Statement Generated on ${new Date().toLocaleDateString()}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Particulars</th>
                <th>Vch Type</th>
                <th>Vch No.</th>
                <th class="right">Debit</th>
                <th class="right">Credit</th>
                <th class="right">Balance</th>
              </tr>
            </thead>
            <tbody>
              ${
                openingBalance !== 0
                  ? `
                <tr style="background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 8px 12px; font-size: 12px;">-</td>
                  <td style="padding: 8px 12px; font-size: 12px; font-weight: 600;">Opening Balance</td>
                  <td style="padding: 8px 12px; font-size: 12px;">-</td>
                  <td style="padding: 8px 12px; font-size: 12px;">-</td>
                  <td style="padding: 8px 12px; font-size: 12px; text-align: right; font-family: monospace; font-weight: 600;">₹ ${formatInrCurrency(
                    openingBalance
                  )}</td>
                  <td style="padding: 8px 12px; font-size: 12px; text-align: right;">-</td>
                  <td style="padding: 8px 12px; font-size: 12px; text-align: right; font-family: monospace; font-weight: bold;">₹ ${formatInrCurrency(
                    openingBalance
                  )}</td>
                </tr>
              `
                  : ""
              }
              ${rowsHtml}
              <tr style="background-color: #f0fdf4; border-top: 2px solid #16a34a; font-weight: bold;">
                <td colspan="4" style="padding: 10px 12px; font-size: 13px;">Closing Balance</td>
                <td style="padding: 10px 12px; font-size: 13px; text-align: right; font-family: monospace;">₹ ${formatInrCurrency(
                  ledgerSummary.totalDebit
                )}</td>
                <td style="padding: 10px 12px; font-size: 13px; text-align: right; font-family: monospace; color: #16a34a;">₹ ${formatInrCurrency(
                  ledgerSummary.totalCredit
                )}</td>
                <td style="padding: 10px 12px; font-size: 13px; text-align: right; font-family: monospace; color: #dc2626;">₹ ${formatInrCurrency(
                  ledgerSummary.closingBalance
                )} Dr</td>
              </tr>
            </tbody>
          </table>

          <div class="summary-box">
            <div class="summary-item">
              <div style="font-size: 12px; color: #4b5563;">Total Invoiced</div>
              <div class="summary-val" style="color: #0f172a;">₹ ${formatInrCurrency(
                ledgerSummary.totalInvoiced
              )}</div>
            </div>
            <div class="summary-item">
              <div style="font-size: 12px; color: #4b5563;">Total Received</div>
              <div class="summary-val" style="color: #16a34a;">₹ ${formatInrCurrency(
                ledgerSummary.totalReceived
              )}</div>
            </div>
            <div class="summary-item">
              <div style="font-size: 12px; color: #4b5563;">Balance Due</div>
              <div class="summary-val" style="color: #dc2626;">₹ ${formatInrCurrency(
                ledgerSummary.closingBalance
              )} Dr</div>
            </div>
          </div>

          <div style="margin-top: 30px; text-align: right;">
            <button class="no-print" onclick="window.print()" style="padding: 10px 20px; background: #0d9488; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Print / Save as PDF</button>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      showToast("Ledger statement prepared for printing");
    } catch {
      showToast("Export failed");
    }
  }

  return (
    <SourcingShell
      breadcrumb={
        <>
          <Link href="/dashboard" className="transition-colors hover:text-teal-400">
            Dashboard
          </Link>
          <ChevronRight size={14} />
          <Link href="/finance" className="transition-colors hover:text-teal-400">
            Finance
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-gray-200">Factory Ledger</span>
        </>
      }
    >
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-xl animate-fade-in">
          {toastMsg}
        </div>
      )}

      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Factory Ledger</h1>
            <p className="text-sm text-gray-400">Invoice &amp; payment statement per factory</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-400"
            >
              <Download size={16} />
              Download Statement / PDF
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/70 p-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              FY:
            </label>
            <select
              value={selectedFy}
              onChange={(e) => setSelectedFy(e.target.value)}
              className="rounded-lg border border-gray-700 bg-black px-3 py-1.5 text-sm font-medium text-white outline-none focus:border-teal-400"
            >
              {fiscalYears.map((fy) => (
                <option key={fy} value={fy}>
                  FY {fy}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Factory:
            </label>
            <select
              value={selectedFactory}
              onChange={(e) => setSelectedFactory(e.target.value)}
              className="min-w-[240px] rounded-lg border border-gray-700 bg-black px-3 py-1.5 text-sm font-medium text-white outline-none focus:border-teal-400"
            >
              <option value="">-- Select Factory --</option>
              {factoryOptions.map((fac) => (
                <option key={fac} value={fac}>
                  {fac}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Opening Balance (₹):
            </label>
            <input
              type="number"
              value={openingBalanceStr}
              onChange={(e) => setOpeningBalanceStr(e.target.value)}
              onBlur={() => {
                if (!selectedFactory) return;
                financeService.saveLedgerOpeningBalance({
                  factoryName: selectedFactory,
                  fiscalYear: selectedFy,
                  openingBalance: parseFloat(openingBalanceStr) || 0,
                }).catch(() => showToast("Failed to save opening balance"));
              }}
              placeholder="0"
              className="w-32 rounded-lg border border-gray-700 bg-black px-3 py-1.5 font-mono text-sm text-white outline-none focus:border-teal-400"
            />
          </div>
        </div>

        {/* Content Area */}
        {!selectedFactory ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 bg-gray-900/40 py-20 text-center">
            <BookOpen size={48} className="mb-3 text-gray-600" />
            <h3 className="text-lg font-semibold text-white">Select a factory to view ledger</h3>
            <p className="mt-1 text-sm text-gray-400">Choose a factory from the dropdown above to display invoice and payment history.</p>
          </div>
        ) : ledgerSummary.transactions.length === 0 && openingBalance === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 bg-gray-900/40 py-20 text-center">
            <BookOpen size={48} className="mb-3 text-gray-600" />
            <h3 className="text-lg font-semibold text-white">No invoices or payments found</h3>
            <p className="mt-1 text-sm text-gray-400">
              No transactions recorded for <strong className="text-teal-400">{selectedFactory}</strong> in FY {selectedFy}.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/90 shadow-xl">
            {/* Table Header Bar */}
            <div className="border-b border-gray-800 bg-gray-800/40 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedFactory}</h3>
                  <p className="text-xs text-gray-400">Statement of Account — FY {selectedFy}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-400 border border-teal-500/20">
                    {ledgerSummary.transactions.length} Transactions
                  </span>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead>
                  <tr className="bg-teal-600 text-white font-semibold text-xs tracking-wider uppercase">
                    <th className="py-3 px-4 w-28">Date</th>
                    <th className="py-3 px-4">Particulars</th>
                    <th className="py-3 px-4 w-32">Vch Type</th>
                    <th className="py-3 px-4 w-36">Vch No.</th>
                    <th className="py-3 px-4 text-right w-36">Debit (₹)</th>
                    <th className="py-3 px-4 text-right w-36">Credit (₹)</th>
                    <th className="py-3 px-4 text-right w-36">Balance (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/70">
                  {/* Opening Balance Row if non-zero */}
                  {openingBalance !== 0 && (
                    <tr className="bg-gray-800/30 font-medium">
                      <td className="py-3 px-4 text-xs text-gray-400">-</td>
                      <td className="py-3 px-4 text-teal-300 font-semibold">Opening Balance</td>
                      <td className="py-3 px-4 text-xs text-gray-400">Opening Balance</td>
                      <td className="py-3 px-4 text-xs text-gray-400">-</td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-white">
                        {formatInrCurrency(openingBalance)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-400">-</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {formatInrCurrency(openingBalance)}
                      </td>
                    </tr>
                  )}

                  {/* Transaction Rows */}
                  {ledgerSummary.transactions.map((tx) => {
                    const isCredit = tx.credit !== null;
                    return (
                      <tr
                        key={tx.id}
                        className={`transition hover:bg-gray-800/40 ${
                          isCredit ? "bg-emerald-950/20" : ""
                        }`}
                      >
                        <td className="py-3 px-4 text-xs font-medium text-gray-400">
                          {formatDateShort(tx.date)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs text-gray-500 mr-1.5 font-medium">
                            {isCredit ? "By" : "To"}
                          </span>
                          <span
                            className={
                              isCredit
                                ? "font-semibold text-emerald-400"
                                : "font-medium text-white"
                            }
                          >
                            {tx.particulars}
                          </span>
                          {tx.remarks && tx.remarks !== tx.particulars && (
                            <span className="ml-2 text-xs italic text-gray-500">
                              ({tx.remarks})
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-400">{tx.vchType}</td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-300">{tx.vchNo || "-"}</td>
                        <td className="py-3 px-4 text-right font-mono text-sm text-gray-200">
                          {tx.debit !== null ? formatInrCurrency(tx.debit) : ""}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-sm font-semibold text-emerald-400">
                          {tx.credit !== null ? formatInrCurrency(tx.credit) : ""}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-sm font-bold text-white">
                          {formatInrCurrency(tx.balance)}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Closing Balance Row */}
                  <tr className="bg-teal-950/40 border-t-2 border-teal-600 font-bold">
                    <td colSpan={2} className="py-3.5 px-4 text-white text-base">
                      Closing Balance
                    </td>
                    <td className="py-3.5 px-4"></td>
                    <td className="py-3.5 px-4"></td>
                    <td className="py-3.5 px-4 text-right font-mono text-sm text-white">
                      ₹ {formatInrCurrency(ledgerSummary.totalDebit)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-sm text-emerald-400">
                      ₹ {formatInrCurrency(ledgerSummary.totalCredit)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-base text-red-400">
                      ₹ {formatInrCurrency(ledgerSummary.closingBalance)} Dr
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary KPI Footer Cards */}
            <div className="grid grid-cols-1 divide-y divide-gray-800 sm:grid-cols-3 sm:divide-x sm:divide-y-0 border-t border-gray-800 bg-black/40">
              <div className="p-4 text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Total Invoiced
                </p>
                <p className="mt-1 font-mono text-xl font-bold text-white">
                  ₹ {formatInrCurrency(ledgerSummary.totalInvoiced)}
                </p>
              </div>
              <div className="p-4 text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Total Received
                </p>
                <p className="mt-1 font-mono text-xl font-bold text-emerald-400">
                  ₹ {formatInrCurrency(ledgerSummary.totalReceived)}
                </p>
              </div>
              <div className="p-4 text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Balance Due
                </p>
                <p className="mt-1 font-mono text-xl font-bold text-red-400">
                  ₹ {formatInrCurrency(ledgerSummary.closingBalance)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </SourcingShell>
  );
}
