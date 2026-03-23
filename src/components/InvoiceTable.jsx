import React from 'react';
import InvoiceRow from './InvoiceRow';

export default function InvoiceTable({ items, onItemsChange, currency }) {
  const handleRowChange = (index, newItem) => {
    const updated = [...items];
    updated[index] = newItem;
    onItemsChange(updated);
  };

  const addRow = () => {
    onItemsChange([...items, { description: '', quantity: 0, unitPrice: 0 }]);
  };

  const deleteRow = (index) => {
    const updated = items.filter((_, i) => i !== index);
    onItemsChange(updated);
  };

  return (
    <div className="invoice-table">
      <table className="table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Line Total</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <InvoiceRow
              key={idx}
              item={item}
              currency={currency}
              onChange={(newItem) => handleRowChange(idx, newItem)}
              onDelete={() => deleteRow(idx)}
            />
          ))}
        </tbody>
      </table>
      <button onClick={addRow}>Add Item</button>
    </div>
  );
}
