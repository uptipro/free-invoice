import React from 'react';
import { calculateLineTotal, formatCurrency } from '../utils/calculations';

export default function InvoiceRow({ item, onChange, onDelete, currency }) {
  const handleInput = (e) => {
    const { name, value } = e.target;
    onChange({ ...item, [name]: value });
  };

  const total = calculateLineTotal(item.quantity, item.unitPrice);

  return (
    <tr>
      <td>
        <input
          name="description"
          value={item.description}
          onChange={handleInput}
        />
      </td>
      <td>
        <input
          type="number"
          name="quantity"
          value={item.quantity}
          onChange={handleInput}
          min="0"
        />
      </td>
      <td>
        <input
          type="number"
          name="unitPrice"
          value={item.unitPrice}
          onChange={handleInput}
          min="0"
          step="0.01"
        />
      </td>
      <td>{formatCurrency(total, 'en-NG', currency || 'NGN')}</td>
      <td>
        <button onClick={onDelete}>Delete</button>
      </td>
    </tr>
  );
}
