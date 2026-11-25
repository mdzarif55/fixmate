import { jsPDF } from "jspdf";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export interface InvoiceData {
  bookingId: string;
  transactionId?: string;
  serviceTitle: string;
  category?: string;
  customerName: string;
  customerEmail: string;
  technicianName: string;
  technicianEmail: string;
  amount: number;
  paidAt: string;
}

export function downloadPaymentInvoicePdf(invoice: InvoiceData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 96, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("FixMate", 48, 46);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Repair smarter. Track every step. Pay when it's done.", 48, 68);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT INVOICE", pageWidth - 48, 48, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("STATUS: PAID (USD)", pageWidth - 48, 66, { align: "right" });

  // Body metadata
  doc.setTextColor(15, 23, 42);
  let y = 136;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Summary", 48, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const rows: Array<[string, string]> = [
    ["Booking Reference", invoice.bookingId],
    ["Transaction ID", invoice.transactionId || "Verified Stripe Payment"],
    ["Payment Date", formatDateTime(invoice.paidAt)],
    ["Service", invoice.serviceTitle],
    ...(invoice.category ? [["Category", invoice.category] as [string, string]] : []),
    ["Customer", `${invoice.customerName} (${invoice.customerEmail})`],
    ["Technician", `${invoice.technicianName} (${invoice.technicianEmail})`],
  ];

  for (const [label, value] of rows) {
    doc.setTextColor(100, 116, 139);
    doc.text(`${label}:`, 48, y);
    doc.setTextColor(15, 23, 42);
    doc.text(value, 180, y, { maxWidth: pageWidth - 228 });
    y += 22;
  }

  y += 12;
  doc.setDrawColor(226, 232, 240);
  doc.line(48, y, pageWidth - 48, y);
  y += 28;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(48, y - 18, pageWidth - 96, 52, 6, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("Total Paid", 68, y + 12);

  doc.setFontSize(16);
  doc.setTextColor(16, 185, 129);
  doc.text(`${formatCurrency(invoice.amount)} USD`, pageWidth - 68, y + 13, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Thank you for choosing FixMate. This receipt confirms post-completion payment.",
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 48,
    { align: "center" }
  );

  doc.save(`FixMate-Invoice-${invoice.bookingId.slice(-8)}.pdf`);
}
