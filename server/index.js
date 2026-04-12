import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getPersistenceMode, initDb, saveInvoice } from './db.js';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', persistence: getPersistenceMode() });
});

app.post('/api/invoices', async (req, res) => {
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
    return res.status(400).json({ message: 'Privacy policy must be accepted before storing invoice data.' });
  }

  if (!invoiceNumber || !currency || !template || !payload) {
    return res.status(400).json({ message: 'Missing required invoice fields.' });
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
      message: 'Invoice saved successfully.',
      id: saved.id,
      createdAt: saved.created_at,
    });
  } catch (error) {
    console.error('Failed to save invoice', error);
    return res.status(500).json({ message: 'Failed to save invoice.' });
  }
});

async function start() {
  await initDb();
  app.listen(port, () => {
    console.log(`Invoice API server running on port ${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start API server', error);
  process.exit(1);
});
