import "dotenv/config";
import express from "express";
import cors from "cors";
import { getPersistenceMode, initDb, saveInvoice, getInvoices } from "./db.js";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());
app.use(
  cors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  }),
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", persistence: getPersistenceMode() });
});

app.get("/api/invoices", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

  try {
    const result = await getInvoices({ page, limit });
    return res.json(result);
  } catch (error) {
    console.error("Failed to fetch invoices", error);
    return res.status(500).json({ message: "Failed to fetch invoices." });
  }
});

app.post("/api/invoices", async (req, res) => {
  const {
    invoiceNumber,
    clientEmail,
    senderCompanyName,
    total,
    currency,
    template,
    privacyPolicyAccepted,
    downloadedAt,
    payload,
  } = req.body || {};

  if (!privacyPolicyAccepted) {
    return res.status(400).json({
      message: "Privacy policy must be accepted before storing invoice data.",
    });
  }

  if (!invoiceNumber || !currency || !template || !payload) {
    return res
      .status(400)
      .json({ message: "Missing required invoice fields." });
  }

  try {
    const saved = await saveInvoice({
      invoiceNumber,
      clientEmail,
      senderCompanyName,
      total,
      currency,
      template,
      privacyPolicyAccepted,
      downloadedAt,
      payload,
    });

    return res.status(201).json({
      message: "Invoice saved successfully.",
      id: saved.id,
      createdAt: saved.created_at,
    });
  } catch (error) {
    console.error("Failed to save invoice", error);
    return res.status(500).json({ message: "Failed to save invoice." });
  }
});

async function start() {
  await initDb();
  app.listen(port, () => {
    console.log(`Invoice API server running on port ${port}`);
  });
}

// Export the app for Vercel serverless
export default app;

// Only start the HTTP server when executed directly (local dev)
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  start().catch((error) => {
    console.error("Failed to start API server", error);
    process.exit(1);
  });
}
