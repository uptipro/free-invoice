import React, { useRef, useImperativeHandle, forwardRef, useState } from 'react';
import ReactSignatureCanvas from 'react-signature-canvas';
import styles from './SignaturePad.module.css';

const SignaturePad = forwardRef(({ onEnd, signerName, onSignerNameChange }, ref) => {
  const sigRef = useRef();
  const [isEmpty, setIsEmpty] = useState(true);

  useImperativeHandle(ref, () => ({
    clear: () => {
      sigRef.current.clear();
      setIsEmpty(true);
    },
    toDataURL: () => sigRef.current.getTrimmedCanvas().toDataURL('image/png'),
  }));

  const handleEnd = () => {
    setIsEmpty(sigRef.current.isEmpty());
    if (onEnd) onEnd();
  };

  const handleClear = () => {
    sigRef.current.clear();
    setIsEmpty(true);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>Signature</p>
          <p className={styles.hint}>Draw your signature in the box below</p>
        </div>
        {!isEmpty && (
          <button type="button" className={styles.clearBtn} onClick={handleClear}>
            Clear
          </button>
        )}
      </div>

      <div className={styles.canvasWrapper}>
        <ReactSignatureCanvas
          penColor="#0f172a"
          canvasProps={{ className: styles.canvas }}
          ref={sigRef}
          onEnd={handleEnd}
        />
        {isEmpty && (
          <p className={styles.placeholder}>Sign here ✦</p>
        )}
      </div>

      <div className={styles.signerRow}>
        <label className={styles.signerLabel}>
          Signer Name
          <input
            className={styles.signerInput}
            value={signerName || ''}
            onChange={onSignerNameChange}
            placeholder="e.g. John Doe"
          />
        </label>
        {!isEmpty && <span className={styles.badge}>✓ Signed</span>}
      </div>
    </div>
  );
});

export default SignaturePad;
