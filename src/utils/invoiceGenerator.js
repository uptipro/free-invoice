import jsPDF from 'jspdf';
import { calculateLineTotal, formatCurrency } from './calculations';

// simple invoice number generator using localStorage counter

export function generateInvoiceNumber() {
  let count = parseInt(localStorage.getItem('invoiceCount') || '0', 10);
  count += 1;
  localStorage.setItem('invoiceCount', count);
  return `INV-${String(count).padStart(4, '0')}`;
}

// counter for how many invoices have actually been exported (PDF or Excel)

export function getExportedCount() {
  return parseInt(localStorage.getItem('invoicesExported') || '0', 10);
}

export function incrementExportedCount() {
  const next = getExportedCount() + 1;
  localStorage.setItem('invoicesExported', next);
  return next;
}

/**
 * Record metadata for tracking
 * @param {{email?: string, industry?: string}} data
 */
export function recordInvoiceData(data) {
  if (data.email) {
    const emails = JSON.parse(localStorage.getItem('invoiceEmails') || '[]');
    if (!emails.includes(data.email)) {
      emails.push(data.email);
      localStorage.setItem('invoiceEmails', JSON.stringify(emails));
    }
  }
  if (data.industry) {
    const industries = JSON.parse(localStorage.getItem('invoiceIndustries') || '[]');
    if (!industries.includes(data.industry)) {
      industries.push(data.industry);
      localStorage.setItem('invoiceIndustries', JSON.stringify(industries));
    }
  }
}

function getImageFormat(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return 'PNG';
  if (dataUrl.includes('image/jpeg') || dataUrl.includes('image/jpg')) return 'JPEG';
  if (dataUrl.includes('image/webp')) return 'WEBP';
  return 'PNG';
}

function addImageIfPresent(doc, image, x, y, width, height) {
  if (!image) return;
  doc.addImage(image, getImageFormat(image), x, y, width, height);
}

function buildRows(items, currency) {
  return items.map((item) => ({
    description: item.description || '-',
    quantity: Number(item.quantity) || 0,
    unitPrice: Number(item.unitPrice) || 0,
    total: calculateLineTotal(item.quantity, item.unitPrice),
    currency,
  }));
}

function drawTableHeader(doc, y, columns, options = {}) {
  const { dark = false } = options;
  if (dark) {
    doc.setFillColor(20, 20, 20);
    doc.rect(12, y - 5, 186, 10, 'F');
    doc.setTextColor(255, 255, 255);
  } else {
    doc.setDrawColor(220, 222, 226);
    doc.line(12, y + 5, 198, y + 5);
    doc.setTextColor(28, 28, 30);
  }

  doc.setFont('helvetica', 'bold');
  doc.text(columns[0], 14, y + 1);
  doc.text(columns[1], 112, y + 1, { align: 'right' });
  doc.text(columns[2], 145, y + 1, { align: 'right' });
  doc.text(columns[3], 188, y + 1, { align: 'right' });
}

function drawRows(doc, y, rows, options = {}) {
  const { dark = false } = options;
  let currentY = y;

  doc.setFont('helvetica', 'normal');
  rows.forEach((row) => {
    const descriptionLines = doc.splitTextToSize(row.description, 84);
    const rowHeight = Math.max(8, descriptionLines.length * 4 + 2);

    if (dark) {
      doc.setTextColor(255, 255, 255);
      doc.setDrawColor(70, 70, 70);
    } else {
      doc.setTextColor(28, 28, 30);
      doc.setDrawColor(228, 230, 234);
    }

    doc.text(descriptionLines, 14, currentY);
    doc.text(formatCurrency(row.unitPrice, 'en-NG', row.currency), 112, currentY, { align: 'right' });
    doc.text(String(row.quantity), 145, currentY, { align: 'right' });
    doc.text(formatCurrency(row.total, 'en-NG', row.currency), 188, currentY, { align: 'right' });
    doc.line(12, currentY + rowHeight - 2, 198, currentY + rowHeight - 2);
    currentY += rowHeight;
  });

  return currentY;
}

function drawTemplateOne(doc, data) {
  const rows = buildRows(data.items, data.currency);
  const subtotal = rows.reduce((sum, row) => sum + row.total, 0);
  const tax = data.tax || 0;
  const total = subtotal + tax;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, 'F');
  addImageIfPresent(doc, data.logo, 14, 14, 26, 18);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(28, 28, 30);
  doc.setFontSize(24);
  doc.text('INVOICE', 14, 24);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice Number`, 14, 34);
  doc.text(`${data.invoiceNumber || '-'}`, 14, 39);
  doc.text(`Invoice Date`, 14, 46);
  doc.text(`${data.invoiceDate || '-'}`, 14, 51);
  doc.text(`Due Date`, 14, 58);
  doc.text(`${data.dueDate || '-'}`, 14, 63);

  doc.setFont('helvetica', 'bold');
  doc.text(data.companyName || '-', 140, 20, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(doc.splitTextToSize(data.companyAddress || '-', 48), 140, 26, { align: 'right' });
  doc.text(data.companyEmail || '-', 140, 40, { align: 'right' });

  doc.setDrawColor(224, 226, 230);
  doc.line(14, 72, 196, 72);

  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 14, 84);
  doc.setFont('helvetica', 'normal');
  doc.text(data.clientName || '-', 14, 90);
  doc.text(data.clientEmail || '-', 14, 96);

  drawTableHeader(doc, 112, ['Description', 'Unit Price', 'Quantity', 'Total']);
  const endY = drawRows(doc, 121, rows);

  const summaryY = endY + 12;
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal', 150, summaryY, { align: 'right' });
  doc.text(formatCurrency(subtotal, 'en-NG', data.currency), 188, summaryY, { align: 'right' });
  doc.text('Tax', 150, summaryY + 8, { align: 'right' });
  doc.text(formatCurrency(tax, 'en-NG', data.currency), 188, summaryY + 8, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Total Due', 150, summaryY + 20, { align: 'right' });
  doc.text(formatCurrency(total, 'en-NG', data.currency), 188, summaryY + 20, { align: 'right' });

  if (data.signature) {
    addImageIfPresent(doc, data.signature, 14, 228, 40, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(data.signerName || 'Authorized Signature', 14, 251);
  }

  doc.setFillColor(28, 28, 30);
  doc.rect(0, 262, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Notes / Terms', 14, 273);
  doc.setFont('helvetica', 'normal');
  doc.text(doc.splitTextToSize(data.notes || 'Thank you for your business.', 80), 14, 280);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Instructions', 128, 273);
  doc.setFont('helvetica', 'normal');
  doc.text('Please pay to the account on file.', 128, 280);
  doc.text(data.companyEmail || '-', 128, 286);
}

function drawTemplateTwo(doc, data) {
  const rows = buildRows(data.items, data.currency);
  const subtotal = rows.reduce((sum, row) => sum + row.total, 0);
  const total = subtotal + (data.tax || 0);

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, 'F');
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`Invoice To: ${data.clientName || '-'}`, 14, 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`No. Invoice: ${data.invoiceNumber || '-'}`, 196, 18, { align: 'right' });
  doc.text(`Date: ${data.invoiceDate || '-'}`, 196, 24, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(34);
  doc.text('Invoice', 14, 56);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(data.tagline || 'Structured billing for modern businesses', 14, 64);

  doc.setDrawColor(18, 18, 18);
  doc.rect(136, 40, 60, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('FIND US FOR MORE INFORMATION', 166, 49, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(doc.splitTextToSize(data.companyPhone || '+234 000 000 0000', 50), 141, 58);
  doc.text(data.companyEmail || '-', 141, 66);
  doc.text(data.companyWebsite || 'www.freeinvoice.app', 141, 72);
  doc.text(doc.splitTextToSize(data.companyAddress || '-', 50), 141, 78);

  const tableStart = 145;
  const tableHeight = Math.max(110, rows.length * 13 + 42);
  doc.setFillColor(18, 18, 18);
  doc.rect(0, tableStart, 210, tableHeight, 'F');

  drawTableHeader(doc, tableStart + 12, ['ITEM DESCRIPTION', 'UNIT PRICE', 'QUANTITY', 'AMOUNT'], { dark: true });
  const endY = drawRows(doc, tableStart + 24, rows, { dark: true });

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(118, endY + 10, 36, 12, 6, 6, 'F');
  doc.roundedRect(158, endY + 10, 38, 12, 6, 6, 'F');
  doc.setTextColor(18, 18, 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`SUB TOTAL: ${formatCurrency(subtotal, 'en-NG', data.currency)}`, 136, endY + 18, { align: 'center' });
  doc.text(`TOTAL: ${formatCurrency(total, 'en-NG', data.currency)}`, 177, endY + 18, { align: 'center' });
}

function drawTemplateThree(doc, data) {
  const rows = buildRows(data.items, data.currency);
  const subtotal = rows.reduce((sum, row) => sum + row.total, 0);
  const total = subtotal + (data.tax || 0);

  doc.setFillColor(250, 250, 248);
  doc.rect(0, 0, 210, 297, 'F');
  doc.setFillColor(30, 53, 99);
  doc.triangle(0, 0, 92, 0, 0, 92, 'F');
  doc.setFillColor(194, 231, 255);
  doc.circle(176, 48, 28, 'F');

  addImageIfPresent(doc, data.logo, 14, 14, 22, 22);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Creative Invoice', 14, 48);

  doc.setTextColor(28, 28, 30);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(data.companyName || '-', 124, 24);
  doc.setFont('helvetica', 'normal');
  doc.text(data.companyEmail || '-', 124, 31);
  doc.text(doc.splitTextToSize(data.companyAddress || '-', 60), 124, 38);

  doc.setDrawColor(205, 210, 216);
  doc.roundedRect(14, 86, 86, 34, 5, 5);
  doc.roundedRect(110, 86, 86, 34, 5, 5);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To', 20, 96);
  doc.text('Invoice Details', 116, 96);
  doc.setFont('helvetica', 'normal');
  doc.text(data.clientName || '-', 20, 104);
  doc.text(data.clientEmail || '-', 20, 111);
  doc.text(data.clientCompanyName || '-', 20, 118);
  doc.text(`ID: ${data.invoiceNumber || '-'}`, 116, 104);
  doc.text(`Date: ${data.invoiceDate || '-'}`, 116, 111);
  doc.text(`Due: ${data.dueDate || '-'}`, 116, 118);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 132, 182, 88, 8, 8, 'F');
  drawTableHeader(doc, 146, ['Description', 'Unit Price', 'Quantity', 'Total']);
  const endY = drawRows(doc, 156, rows);

  doc.setFillColor(30, 53, 99);
  doc.roundedRect(120, endY + 10, 76, 28, 8, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal', 128, endY + 20);
  doc.text(formatCurrency(subtotal, 'en-NG', data.currency), 190, endY + 20, { align: 'right' });
  doc.text('Total Due', 128, endY + 30);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(total, 'en-NG', data.currency), 190, endY + 30, { align: 'right' });

  if (data.signature) {
    addImageIfPresent(doc, data.signature, 14, 238, 38, 16);
  }
  doc.setTextColor(28, 28, 30);
  doc.setFont('helvetica', 'bold');
  doc.text(data.signerName || 'Authorized Signature', 14, 260);
  doc.setFont('helvetica', 'normal');
  doc.text(doc.splitTextToSize(data.notes || 'We appreciate your business and prompt payment.', 90), 14, 270);
}

export function downloadInvoicePdf(template, data) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  if (template === 'template-2') {
    drawTemplateTwo(doc, data);
  } else if (template === 'template-3') {
    drawTemplateThree(doc, data);
  } else {
    drawTemplateOne(doc, data);
  }

  doc.save(`invoice-${data.invoiceNumber || 'draft'}.pdf`);
}
