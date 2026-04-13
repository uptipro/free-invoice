// Empty string = relative URLs (works on Vercel). Explicit value used in local dev via .env.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function getInvoices({ page = 1, limit = 20 } = {}) {
  const response = await fetch(
    `${API_BASE_URL}/api/invoices?page=${page}&limit=${limit}`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch invoices.");
  }
  return response.json(); // { invoices: [...], total: number }
}

export async function storeInvoiceAfterDownload(payload) {
  const response = await fetch(`${API_BASE_URL}/api/invoices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(() => ({ message: "Failed to store invoice record." }));
    throw new Error(errorBody.message || "Failed to store invoice record.");
  }

  return response.json();
}
