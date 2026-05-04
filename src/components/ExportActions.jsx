import React, { useState } from "react";
import * as XLSX from "xlsx";
import { calculateLineTotal } from "../utils/calculations";
import {
  downloadInvoicePdf,
  generateInvoicePdfDataUrl,
  generateInvoiceNumber,
} from "../utils/invoiceGenerator";
import { storeInvoiceAfterDownload } from "../utils/invoiceApi";
import PdfPreviewModal from "./PdfPreviewModal";

export default function ExportActions({
  invoice,
  items,
  signature,
  logo,
  tax = 0,
  profile,
  onSaved,
  onLogin,
  onInvoiceNumberUsed,
}) {
  const [template, setTemplate] = useState("template-1");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState(null);
  const [previewSession, setPreviewSession] = useState(0);
  const [savingAfterDownload, setSavingAfterDownload] = useState(false);
  const [savedInvoiceId, setSavedInvoiceId] = useState(null);
  const [emailStatus, setEmailStatus] = useState("idle"); // idle | sending | sent | error
  const [emailError, setEmailError] = useState(null);
  const [savedInvoiceId, setSavedInvoiceId] = useState(null);
  const [emailStatus, setEmailStatus] = useState("idle"); // idle | sending | sent | error
  const [emailError, setEmailError] = useState(null);

  const buildPdfData = () => {
    const subtotal = items.reduce(
      (sum, item) => sum + calculateLineTotal(item.quantity, item.unitPrice),
      0,
    );
    const taxRate = parseFloat(tax) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    return {
      companyName: invoice.senderCompanyName,
      companyAddress: invoice.senderCompanyAddress,
      companyEmail: invoice.senderEmail,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      clientCompanyName: invoice.clientCompanyName,
      invoiceNumber: invoice.number,
      invoiceDate: invoice.date,
      dueDate: invoice.dueDate,
      items,
      subtotal,
      tax: taxAmount,
      total: subtotal + taxAmount,
      notes: invoice.notes,
      signature,
      signerName: invoice.signerName,
      logo,
      currency: invoice.currency,
      companyPhone: invoice.senderPhone,
      companyWebsite: invoice.senderWebsite,
      tagline: invoice.tagline,
    };
  };

  const handlePreviewPdf = () => {
    const dataUrl = generateInvoicePdfDataUrl(template, buildPdfData());
    setPdfDataUrl(dataUrl);
    setPreviewSession((prev) => prev + 1);
    setPreviewOpen(true);
  };

  const handleConfirmDownload = async ({ privacyPolicyAccepted }) => {
    const newInternalNumber = generateInvoiceNumber();
    onInvoiceNumberUsed?.(newInternalNumber);
    const pdfData = buildPdfData();
    downloadInvoicePdf(template, pdfData);

    if (!privacyPolicyAccepted) {
      return;
    }

    try {
      setSavingAfterDownload(true);
      const saved = await storeInvoiceAfterDownload({
        invoiceNumber: pdfData.invoiceNumber,
        clientEmail: pdfData.clientEmail,
        senderCompanyName: pdfData.companyName,
        total: pdfData.total,
        currency: pdfData.currency,
        template,
        privacyPolicyAccepted,
        downloadedAt: new Date().toISOString(),
        payload: pdfData,
        profileId: profile?.id || null,
        senderPhone: profile?.phone || invoice.senderPhone || null,
      });
      if (saved?.id) setSavedInvoiceId(saved.id);
      setEmailStatus("idle");
      onSaved?.();
      setPreviewOpen(false);
    } catch (error) {
      // Keep the modal open so the user can retry if storing fails.
      alert(
        error.message || "Invoice downloaded, but storing in database failed.",
      );
    } finally {
      setSavingAfterDownload(false);
    }
  };

  const handleEmailInvoice = async () => {
    if (!savedInvoiceId || !profile?.id) return;
    setEmailStatus("sending");
    setEmailError(null);
    try {
      const dataUrl = pdfDataUrl || generateInvoicePdfDataUrl(template, buildPdfData());
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
      const res = await fetch(`${API_BASE_URL}/api/invoices/${savedInvoiceId}/email-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: dataUrl, profileId: profile.id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to send email.");
      }
      setEmailStatus("sent");
    } catch (err) {
      setEmailStatus("error");
      setEmailError(err.message || "Failed to send email.");
    }
  };

  const handleEmailInvoice = async () => {
    if (!savedInvoiceId || !profile?.id) return;
    setEmailStatus("sending");
    setEmailError(null);
    try {
      const dataUrl = pdfDataUrl || generateInvoicePdfDataUrl(template, buildPdfData());
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
      const res = await fetch(`${API_BASE_URL}/api/invoices/${savedInvoiceId}/email-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: dataUrl, profileId: profile.id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to send email.");
      }
      setEmailStatus("sent");
    } catch (err) {
      setEmailStatus("error");
      setEmailError(err.message || "Failed to send email.");
    }
  };

  const downloadExcel = () => {
    const wsData = [
      ["Internal Invoice Count", invoice.internalNumber],
      ["Invoice ID", invoice.number],
      ["Sender Company", invoice.senderCompanyName],
      ["Sender Address", invoice.senderCompanyAddress],
      ["Client Name", invoice.clientName],
      ["Receiver Company", invoice.clientCompanyName],
      ["Client Email", invoice.clientEmail],
      ["Currency", invoice.currency],
      [],
      ["Description", "Quantity", "Unit Price", "Total"],
      ...items.map((i) => [
        i.description,
        i.quantity,
        i.unitPrice,
        calculateLineTotal(i.quantity, i.unitPrice),
      ]),
      [],
      [
        "Grand Total",
        "",
        "",
        items.reduce(
          (sum, item) =>
            sum + calculateLineTotal(item.quantity, item.unitPrice),
          0,
        ),
      ],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoice");
    XLSX.writeFile(wb, `invoice-${invoice.number}.xlsx`);
  };

  return (
    <div className="export-actions">
      <label>
        PDF Template
        <select
          value={template}
          onChange={(event) => setTemplate(event.target.value)}
        >
          <option value="template-1">Template 1: Corporate</option>
          <option value="template-2">Template 2: Monochrome</option>
          <option value="template-3">Template 3: Creative</option>
        </select>
      </label>

      <button onClick={handlePreviewPdf}>Download PDF</button>
      <button onClick={downloadExcel}>Download Excel</button>

      {profile && savedInvoiceId && (
        <div style={{ marginTop: 12 }}>
          <button
            onClick={handleEmailInvoice}
            disabled={emailStatus === "sending" || emailStatus === "sent"}
            style={{
              width: "100%",
              padding: "9px 14px",
              background: emailStatus === "sent" ? "#16a34a" : "var(--color-accent, #0f172a)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              cursor: emailStatus === "sending" || emailStatus === "sent" ? "default" : "pointer",
              opacity: emailStatus === "sending" ? 0.7 : 1,
              transition: "background 0.2s",
            }}
          >
            {emailStatus === "sending" && "Sending…"}
            {emailStatus === "sent" && "✓ Invoice emailed to your inbox"}
            {(emailStatus === "idle" || emailStatus === "error") && "✉️ Email invoice to my inbox"}
          </button>
          {emailStatus === "error" && (
            <p style={{ color: "#dc2626", fontSize: 12, marginTop: 6 }}>{emailError}</p>
          )}
        </div>
      )}

      {!profile && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            background: "var(--color-accent-soft, #f1f5f9)",
            borderRadius: 8,
            fontSize: 13,
            color: "var(--color-accent, #0f172a)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>
            🔒 <strong>Sign in</strong> to email your invoice directly to
            clients.
          </span>
          {onLogin && (
            <button
              onClick={onLogin}
              style={{
                marginLeft: "auto",
                padding: "5px 14px",
                background: "var(--color-accent, #0f172a)",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Sign in
            </button>
          )}
        </div>
      )}

      {savingAfterDownload && <p>Saving invoice for future reference...</p>}
      <PdfPreviewModal
        key={previewSession}
        isOpen={previewOpen}
        pdfDataUrl={pdfDataUrl}
        onClose={() => setPreviewOpen(false)}
        onDownload={handleConfirmDownload}
      />
    </div>
  );
}
