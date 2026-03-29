import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import styles from './EmailModal.module.css';
import { calculateLineTotal, formatCurrency } from '../utils/calculations';

const LS_KEY = 'emailjsConfig';

function loadConfig() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || 'null');
  } catch {
    return null;
  }
}

function saveConfig(cfg) {
  localStorage.setItem(LS_KEY, JSON.stringify(cfg));
}

function buildDefaultMessage(invoice, items) {
  const subtotal = items.reduce(
    (sum, item) => sum + calculateLineTotal(item.quantity, item.unitPrice),
    0,
  );
  const formattedTotal = formatCurrency(subtotal, undefined, invoice.currency);
  const lines = [
    `Dear ${invoice.clientName || 'Client'},`,
    '',
    `Please find attached Invoice ${invoice.number} from ${invoice.senderCompanyName || 'us'}.`,
    '',
    `Invoice Number : ${invoice.number}`,
    invoice.date ? `Invoice Date   : ${invoice.date}` : null,
    invoice.dueDate ? `Due Date       : ${invoice.dueDate}` : null,
    `Amount Due     : ${formattedTotal}`,
    '',
    invoice.notes ? `Notes: ${invoice.notes}` : null,
    '',
    'Thank you for your business.',
    '',
    `Best regards,`,
    invoice.senderCompanyName || '',
  ]
    .filter((l) => l !== null)
    .join('\n');
  return lines;
}

export default function EmailModal({ invoice, items, onClose }) {
  const [config, setConfig] = useState(loadConfig);
  const [configDraft, setConfigDraft] = useState({ serviceId: '', templateId: '', publicKey: '' });
  const [tab, setTab] = useState(loadConfig() ? 'compose' : 'setup');

  const [to, setTo] = useState(invoice.clientEmail || '');
  const [subject, setSubject] = useState(
    `Invoice ${invoice.number}${invoice.senderCompanyName ? ` from ${invoice.senderCompanyName}` : ''}`,
  );
  const [message, setMessage] = useState(() => buildDefaultMessage(invoice, items));
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSaveConfig = () => {
    const trimmed = {
      serviceId: configDraft.serviceId.trim(),
      templateId: configDraft.templateId.trim(),
      publicKey: configDraft.publicKey.trim(),
    };
    if (!trimmed.serviceId || !trimmed.templateId || !trimmed.publicKey) {
      setErrorMsg('All three fields are required.');
      return;
    }
    saveConfig(trimmed);
    setConfig(trimmed);
    setErrorMsg('');
    setTab('compose');
  };

  const handleSend = async () => {
    if (!to) {
      setErrorMsg('Recipient email is required.');
      return;
    }
    setStatus('sending');
    setErrorMsg('');
    try {
      await emailjs.send(
        config.serviceId,
        config.templateId,
        {
          to_email: to,
          from_name: invoice.senderCompanyName || 'Invoice Sender',
          reply_to: invoice.senderEmail || '',
          subject,
          message,
        },
        config.publicKey,
      );
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.text || err?.message || 'Failed to send. Check your EmailJS configuration.');
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Send Invoice Email">
        <div className={styles.modalHeader}>
          <h2 className={styles.title}>Send Invoice via Email</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'compose' ? styles.tabActive : ''}`}
            onClick={() => setTab('compose')}
            disabled={!config}
          >
            Compose
          </button>
          <button
            className={`${styles.tab} ${tab === 'setup' ? styles.tabActive : ''}`}
            onClick={() => { setTab('setup'); setErrorMsg(''); }}
          >
            {config ? 'Reconfigure' : '⚙ Setup'}
          </button>
        </div>

        {tab === 'setup' && (
          <div className={styles.body}>
            <p className={styles.hint}>
              This app uses <strong>EmailJS</strong> to send emails without a backend.
              You need a free account at{' '}
              <a href="https://www.emailjs.com" target="_blank" rel="noreferrer">emailjs.com</a>{' '}
              to get these values.
            </p>
            <ol className={styles.steps}>
              <li>Sign up at emailjs.com and create an <strong>Email Service</strong> (Gmail, Outlook, etc.).</li>
              <li>
                Create an <strong>Email Template</strong> with these variables:
                <code className={styles.codeBlock}>
                  {'To: {{to_email}}\nSubject: {{subject}}\nBody:\n  Dear {{to_email}},\n  {{message}}\n  — {{from_name}}'}
                </code>
              </li>
              <li>Copy your <strong>Service ID</strong>, <strong>Template ID</strong>, and <strong>Public Key</strong> (from Account &gt; API Keys).</li>
            </ol>
            <label className={styles.field}>
              Service ID
              <input
                type="text"
                placeholder="service_xxxxxxx"
                value={configDraft.serviceId}
                onChange={(e) => setConfigDraft({ ...configDraft, serviceId: e.target.value })}
              />
            </label>
            <label className={styles.field}>
              Template ID
              <input
                type="text"
                placeholder="template_xxxxxxx"
                value={configDraft.templateId}
                onChange={(e) => setConfigDraft({ ...configDraft, templateId: e.target.value })}
              />
            </label>
            <label className={styles.field}>
              Public Key
              <input
                type="text"
                placeholder="your_public_key"
                value={configDraft.publicKey}
                onChange={(e) => setConfigDraft({ ...configDraft, publicKey: e.target.value })}
              />
            </label>
            {errorMsg && <p className={styles.error}>{errorMsg}</p>}
            <button className={styles.primaryBtn} onClick={handleSaveConfig}>
              Save & Continue
            </button>
          </div>
        )}

        {tab === 'compose' && (
          <div className={styles.body}>
            {status === 'success' ? (
              <div className={styles.successBox}>
                <span className={styles.successIcon}>✓</span>
                <p>Email sent successfully to <strong>{to}</strong>.</p>
                <button className={styles.primaryBtn} onClick={onClose}>Close</button>
              </div>
            ) : (
              <>
                <label className={styles.field}>
                  To
                  <input
                    type="email"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="recipient@example.com"
                  />
                </label>
                <label className={styles.field}>
                  Subject
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  Message
                  <textarea
                    className={styles.messageArea}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </label>
                {errorMsg && <p className={styles.error}>{errorMsg}</p>}
                <button
                  className={styles.primaryBtn}
                  onClick={handleSend}
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? 'Sending…' : 'Send Email'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
