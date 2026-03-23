import React from 'react';
import { formatCurrency, calculateLineTotal } from '../utils/calculations';

export default function InvoicePreview({ invoice, items, signature, logo }) {
  const total = items.reduce(
    (sum, i) => sum + calculateLineTotal(i.quantity, i.unitPrice),
    0
  );

  return (
    <div className="invoice-preview">
      {logo && <img src={logo} alt="Company logo" style={{ maxWidth: 120, marginBottom: 12 }} />}
      <h2>Invoice {invoice.number}</h2>
      <p>
        <strong>Sender:</strong> {invoice.senderCompanyName || '-'}
      </p>
      <p>
        <strong>Sender Address:</strong> {invoice.senderCompanyAddress || '-'}
      </p>
      <p>
        <strong>Sender Email:</strong> {invoice.senderEmail || '-'}
      </p>
      <p>
        <strong>Client:</strong> {invoice.clientName || '-'} ({invoice.clientEmail || '-'})
      </p>
      <p>
        <strong>Receiver Company:</strong> {invoice.clientCompanyName || '-'}
      </p>
      <p>
        <strong>Date:</strong> {invoice.date} <strong>Due:</strong> {invoice.dueDate}
      </p>
      <table className="table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td>{item.description}</td>
              <td>{item.quantity}</td>
              <td>{formatCurrency(item.unitPrice, 'en-NG', invoice.currency)}</td>
              <td>{formatCurrency(calculateLineTotal(item.quantity, item.unitPrice), 'en-NG', invoice.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>{formatCurrency(total, 'en-NG', invoice.currency)}</h3>
      {invoice.notes && (
        <p className="note-field">
          <strong>Notes:</strong> {invoice.notes}
        </p>
      )}
      {signature && (
        <div>
          <img src={signature} alt="Signature" style={{ maxWidth: '100%' }} />
          <p><strong>Signed by:</strong> {invoice.signerName || '-'}</p>
        </div>
      )}
    </div>
  );
}
