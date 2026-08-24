import { loadCompanySettings } from "./company-settings-storage";
import {
  amountInWordsINR,
  calcInvoiceLineTotal,
  calcInvoiceNetAmount,
} from "./invoice-calculations";
import type { InvoiceRecord } from "./invoice-storage";

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function downloadInvoicePdf(invoice: InvoiceRecord) {
  const company = loadCompanySettings();
  const lineTotal = calcInvoiceLineTotal(invoice);
  const cgst = (lineTotal * invoice.cgstPct) / 100;
  const sgst = (lineTotal * invoice.sgstPct) / 100;
  const netAmount = calcInvoiceNetAmount(invoice);

  const lineRows = invoice.lineItems
    .map(
      (item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(item.description || "—")}</td>
        <td style="text-align:right">${item.quantity}</td>
        <td style="text-align:right">${item.price.toLocaleString("en-IN")}</td>
        <td style="text-align:right">${(item.quantity * item.price).toLocaleString("en-IN")}</td>
      </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(invoice.invoiceNumber)}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; color: #111; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .muted { color: #666; font-size: 13px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th, td { border: 1px solid #ccc; padding: 8px; }
    th { background: #f3f4f6; text-align: left; }
    .totals { margin-top: 16px; width: 320px; margin-left: auto; font-size: 14px; }
    .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
    .net { font-weight: bold; font-size: 16px; border-top: 2px solid #111; padding-top: 8px; }
    @media print { body { margin: 16px; } }
  </style>
</head>
<body>
  <div class="grid">
    <div>
      <h1>${escapeHtml(company.companyName)}</h1>
      <p class="muted">${escapeHtml(company.address || "")}</p>
      <p class="muted">GSTIN: ${escapeHtml(company.gstin)}</p>
      <p class="muted">Phone: ${escapeHtml(company.phone)}</p>
      <p class="muted">${escapeHtml(company.state)} — ${escapeHtml(company.code)}</p>
    </div>
    <div style="text-align:right">
      <h1>INVOICE</h1>
      <p><strong>No:</strong> ${escapeHtml(invoice.invoiceNumber)}</p>
      <p><strong>Date:</strong> ${escapeHtml(invoice.date)}</p>
      <p><strong>HSN:</strong> ${escapeHtml(invoice.hsnCode)}</p>
      ${invoice.brandName ? `<p><strong>Brand:</strong> ${escapeHtml(invoice.brandName)}</p>` : ""}
    </div>
  </div>

  <div>
    <strong>Invoice To</strong>
    <p>${escapeHtml(invoice.invoiceTo.company)}</p>
    <p class="muted">${escapeHtml(invoice.invoiceTo.address)}</p>
    <p class="muted">GSTIN: ${escapeHtml(invoice.invoiceTo.gstin)} | ${escapeHtml(invoice.invoiceTo.state)} — ${escapeHtml(invoice.invoiceTo.code)}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>S.No</th>
        <th>Description</th>
        <th style="text-align:right">Qty</th>
        <th style="text-align:right">Price</th>
        <th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${lineRows || '<tr><td colspan="5" style="text-align:center">No line items</td></tr>'}
    </tbody>
  </table>

  <div class="totals">
    <div><span>Total Amount</span><span>₹ ${lineTotal.toLocaleString("en-IN")}</span></div>
    <div><span>CGST (${invoice.cgstPct}%)</span><span>₹ ${cgst.toLocaleString("en-IN")}</span></div>
    <div><span>SGST (${invoice.sgstPct}%)</span><span>₹ ${sgst.toLocaleString("en-IN")}</span></div>
    <div class="net"><span>Net Amount</span><span>₹ ${netAmount.toLocaleString("en-IN")}</span></div>
    <p class="muted" style="margin-top:8px">${amountInWordsINR(netAmount)}</p>
  </div>

  <div style="margin-top:32px">
    <strong>Bank Details</strong>
    <p class="muted">${escapeHtml(company.bankName)} | A/C: ${escapeHtml(company.accountNumber)}</p>
    <p class="muted">IFSC: ${escapeHtml(company.ifscCode)} | ${escapeHtml(company.branch)}</p>
  </div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 300);
}
