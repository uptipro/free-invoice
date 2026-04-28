import { useState, useRef, useEffect } from "react";
import Header from "./components/Header";
import ProfileSetup from "./components/ProfileSetup";
import InvoiceForm from "./components/InvoiceForm";
import InvoiceTable from "./components/InvoiceTable";
import InvoiceSummary from "./components/InvoiceSummary";
import SignaturePad from "./components/SignaturePad";
import InvoicePreview from "./components/InvoicePreview";
import { useCallback } from "react";
import ExportActions from "./components/ExportActions";
import {
  generateInvoiceNumber,
  peekInvoiceCount,
  recordInvoiceData,
} from "./utils/invoiceGenerator";
import { getInvoices } from "./utils/invoiceApi";

function App() {
  // Profile state
  const [profile, setProfile] = useState(() => {
    const id = localStorage.getItem("profileId");
    return id ? { id } : null;
  });
  // Modal state
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const [invoice, setInvoice] = useState({
    internalNumber: `INV-${String(peekInvoiceCount()).padStart(4, "0")}`,
    number: "INV-001",
    senderCompanyName: "",
    senderCompanyAddress: "",
    senderEmail: "",
    senderPhone: "",
    senderWebsite: "",
    clientName: "",
    clientCompanyName: "",
    clientEmail: "",
    date: "",
    dueDate: "",
    industry: "",
    currency: "NGN",
    tax: 0,
    notes: "",
    signerName: "",
    tagline: "Create polished invoices in under a minute",
  });

  const [items, setItems] = useState([]);
  const [signature, setSignature] = useState(null);
  const [logo, setLogo] = useState(null);
  const [totalInvoices, setTotalInvoices] = useState(null);
  const sigRef = useRef();

  const refreshInvoiceCount = () => {
    getInvoices({ limit: 1 })
      .then((res) => setTotalInvoices(res.total))
      .catch(() => {});
  };

  useEffect(() => {
    refreshInvoiceCount();
  }, []);

  const handleInvoiceChange = (newData) => {
    setInvoice(newData);
  };

  // record email and industry whenever they become available
  useEffect(() => {
    if (invoice.clientEmail || invoice.industry) {
      recordInvoiceData({
        email: invoice.clientEmail,
        industry: invoice.industry,
      });
    }
  }, [invoice.clientEmail, invoice.industry]);

  const handleSignerNameChange = (e) => {
    setInvoice({ ...invoice, signerName: e.target.value });
  };

  const handleNotesChange = (e) => {
    setInvoice({ ...invoice, notes: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogo(event.target?.result || null);
    };
    reader.readAsDataURL(file);
  };

  const saveSignature = () => {
    if (sigRef.current) {
      const dataUrl = sigRef.current.toDataURL();
      setSignature(dataUrl);
    }
  };

  const invoiceCount = parseInt(invoice.internalNumber.replace("INV-", ""), 10);

  // Simple login logic (for demo: just ask for profileId)
  function handleLoginSubmit(e) {
    e.preventDefault();
    const id = e.target.elements.profileId.value.trim();
    if (id) {
      localStorage.setItem("profileId", id);
      setProfile({ id });
      setShowLogin(false);
    }
  }

  return (
    <>
      <Header
        invoiceCount={totalInvoices ?? invoiceCount}
        profileId={profile?.id}
        onLogin={() => setShowLogin(true)}
        onCreateProfile={() => setShowProfileSetup(true)}
      />

      {/* Login Modal */}
      {showLogin && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.3)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 32,
              borderRadius: 12,
              minWidth: 320,
              boxShadow: "0 2px 16px #0002",
            }}
          >
            <h2>Login</h2>
            <form
              onSubmit={handleLoginSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <input
                name="profileId"
                placeholder="Enter your Profile ID"
                required
                style={{ padding: 8 }}
              />
              <button
                type="submit"
                style={{
                  padding: 8,
                  background: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                }}
              >
                Login
              </button>
            </form>
            <div style={{ marginTop: 16 }}>
              <span>Don't have a profile? </span>
              <button
                onClick={() => {
                  setShowLogin(false);
                  setShowProfileSetup(true);
                }}
                style={{
                  color: "#00b894",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Register
              </button>
            </div>
            <button
              onClick={() => setShowLogin(false)}
              style={{ marginTop: 16 }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Profile Setup Modal */}
      {showProfileSetup && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.3)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 32,
              borderRadius: 12,
              minWidth: 320,
              boxShadow: "0 2px 16px #0002",
            }}
          >
            <ProfileSetup
              onSave={(p) => {
                setProfile(p);
                setShowProfileSetup(false);
              }}
            />
            <button
              onClick={() => setShowProfileSetup(false)}
              style={{ marginTop: 16 }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="main-container">
        <div className="left-side">
          <InvoiceForm
            invoice={invoice}
            onChange={handleInvoiceChange}
            onLogoChange={handleLogoChange}
          />
          <InvoiceTable
            items={items}
            onItemsChange={setItems}
            currency={invoice.currency}
          />
          <div className="note-field">
            <label>
              Notes
              <textarea value={invoice.notes} onChange={handleNotesChange} />
            </label>
          </div>
          <SignaturePad
            ref={sigRef}
            onEnd={saveSignature}
            signerName={invoice.signerName}
            onSignerNameChange={handleSignerNameChange}
          />
        </div>
        <div className="right-side">
          <InvoicePreview
            invoice={invoice}
            items={items}
            signature={signature}
            logo={logo}
            profileId={profile?.id}
          />
          <InvoiceSummary
            items={items}
            currency={invoice.currency}
            tax={invoice.tax}
          />
          <ExportActions
            invoice={invoice}
            items={items}
            signature={signature}
            logo={logo}
            tax={invoice.tax}
            onSaved={refreshInvoiceCount}
            onInvoiceNumberUsed={(num) =>
              setInvoice((prev) => ({ ...prev, internalNumber: num }))
            }
          />
        </div>
      </div>
    </>
  );
}

export default App;
