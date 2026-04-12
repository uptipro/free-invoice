const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export async function storeInvoiceAfterDownload(payload) {
  const response = await fetch(`${API_BASE_URL}/api/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Failed to store invoice record.' }));
    throw new Error(errorBody.message || 'Failed to store invoice record.');
  }

  return response.json();
}
