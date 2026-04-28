import { useState, useRef, useEffect } from "react";
import Header from "./components/Header";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
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
  // Page state
  const [page, setPage] = useState("main"); // 'main', 'login', 'register'

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

  // Login handler for LoginPage
  function handleLogin(profileId) {
    localStorage.setItem("profileId", profileId);
    setProfile({ id: profileId });
    setPage("main");
  }

  // Register handler for RegisterPage
  function handleRegister(profile) {
    setProfile(profile);
    setPage("main");
  }

  // Routing logic
  let content;
  if (page === "login") {
    content = (
      <LoginPage onLogin={handleLogin} onRegister={() => setPage("register")} />
    );
  } else if (page === "register") {
    content = <RegisterPage onRegister={handleRegister} />;
  } else {
    content = (
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
    );
  }

  return (
    <>
      <Header
        invoiceCount={totalInvoices ?? invoiceCount}
        profileId={profile?.id}
        onLogin={() => setPage("login")}
        onCreateProfile={() => setPage("register")}
      />
      {content}
    </>
  );
}

export default App;
