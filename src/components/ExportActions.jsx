import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { calculateLineTotal } from '../utils/calculations';
import { downloadInvoicePdf, generateInvoicePdfDataUrl } from '../utils/invoiceGenerator';
import { storeInvoiceAfterDownload } from '../utils/invoiceApi';
import PdfPreviewModal from './PdfPreviewModal';

export default function ExportActions({ invoice, items, signature, logo, tax = 0 }) {
  const [template, setTemplate] = useState('template-1');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState(null);
  const [previewSession, setPreviewSession] = useState(0);
  const [savingAfterDownload, setSavingAfterDownload] = useState(false);

  const buildPdfData = () => {
    const subtotal = items.reduce((sum, item) => sum + calculateLineTotal(item.quantity, item.unitPrice), 0);
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
    const pdfData = buildPdfData();
    downloadInvoicePdf(template, pdfData);

    if (!privacyPolicyAccepted) {
      return;
    }

    try {
      setSavingAfterDownload(true);
      await storeInvoiceAfterDownload({
        invoiceNumber: pdfData.invoiceNumber,
        clientEmail: pdfData.clientEmail,
        senderCompanyName: pdfData.companyName,
        total: pdfData.total,
        currency: pdfData.currency,
        template,
        privacyPolicyAccepted,
        downloadedAt: new Date().toISOString(),
        payload: pdfData,
      });
      setPreviewOpen(false);
    } catch (error) {
      // Keep the modal open so the user can retry if storing fails.
      alert(error.message || 'Invoice downloaded, but storing in database failed.');
    } finally {
      setSavingAfterDownload(false);
    }
  };

  const downloadExcel = () => {
    const wsData = [
      ['Internal Invoice Count', invoice.internalNumber],
      ['Invoice ID', invoice.number],
      ['Sender Company', invoice.senderCompanyName],
      ['Sender Address', invoice.senderCompanyAddress],
      ['Client Name', invoice.clientName],
      ['Receiver Company', invoice.clientCompanyName],
      ['Client Email', invoice.clientEmail],
      ['Currency', invoice.currency],
      [],
      ['Description', 'Quantity', 'Unit Price', 'Total'],
      ...items.map((i) => [i.description, i.quantity, i.unitPrice, calculateLineTotal(i.quantity, i.unitPrice)]),
      [],
      ['Grand Total', '', '', items.reduce((sum, item) => sum + calculateLineTotal(item.quantity, item.unitPrice), 0)],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invoice');
    XLSX.writeFile(wb, `invoice-${invoice.number}.xlsx`);
  };

  return (
    <div className="export-actions">
      <label>
        PDF Template
        <select value={template} onChange={(event) => setTemplate(event.target.value)}>
          <option value="template-1">Template 1: Corporate</option>
          <option value="template-2">Template 2: Monochrome</option>
          <option value="template-3">Template 3: Creative</option>
        </select>
      </label>
      <button onClick={handlePreviewPdf}>Download PDF</button>
      <button onClick={downloadExcel}>Download Excel</button>
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
