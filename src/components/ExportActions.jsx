import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { calculateLineTotal } from '../utils/calculations';
import { downloadInvoicePdf } from '../utils/invoiceGenerator';
import EmailModal from './EmailModal';

export default function ExportActions({ invoice, items, signature, logo, onExport }) {
  const [template, setTemplate] = useState('template-1');
  const [showEmailModal, setShowEmailModal] = useState(false);

  const downloadPdf = () => {
    const subtotal = items.reduce((sum, item) => sum + calculateLineTotal(item.quantity, item.unitPrice), 0);

    downloadInvoicePdf(template, {
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
      tax: 0,
      total: subtotal,
      notes: invoice.notes,
      signature,
      signerName: invoice.signerName,
      logo,
      currency: invoice.currency,
      companyPhone: invoice.senderPhone,
      companyWebsite: invoice.senderWebsite,
      tagline: invoice.tagline,
    });
    onExport?.();
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
    onExport?.();
  };

  return (
    <>
      <div className="export-actions">
        <label>
          PDF Template
          <select value={template} onChange={(event) => setTemplate(event.target.value)}>
            <option value="template-1">Template 1: Corporate</option>
            <option value="template-2">Template 2: Monochrome</option>
            <option value="template-3">Template 3: Creative</option>
          </select>
        </label>
        <button onClick={downloadPdf}>Download PDF</button>
        <button onClick={downloadExcel}>Download Excel</button>
        <button onClick={() => setShowEmailModal(true)}>Send via Email</button>
      </div>

      {showEmailModal && (
        <EmailModal
          invoice={invoice}
          items={items}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </>
  );
}

