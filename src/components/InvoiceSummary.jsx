import React from 'react';
import { calculateGrandTotal, formatCurrency } from '../utils/calculations';

export default function InvoiceSummary({ items, currency = 'NGN' }) {
  const total = calculateGrandTotal(items);

  return (
    <div className="invoice-summary">
      <h3>Total</h3>
      <p>{formatCurrency(total, 'en-NG', currency)}</p>
    </div>
  );
}
