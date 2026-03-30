import React from 'react';
import styles from './PdfPreviewModal.module.css';

export default function PdfPreviewModal({ isOpen, pdfDataUrl, onClose, onDownload }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Invoice Preview</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close preview">✕</button>
        </div>
        <div className={styles.body}>
          {pdfDataUrl ? (
            <iframe
              src={pdfDataUrl}
              className={styles.iframe}
              title="Invoice PDF Preview"
            />
          ) : (
            <div className={styles.loading}>Generating preview…</div>
          )}
        </div>
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.downloadBtn} onClick={onDownload}>Download PDF</button>
        </div>
      </div>
    </div>
  );
}
