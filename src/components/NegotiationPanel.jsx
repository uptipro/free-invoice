import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export default function NegotiationPanel({ invoiceId, profileId, isOwner }) {
  const [threads, setThreads] = useState([]);
  const [offer, setOffer] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!invoiceId) return; // guard — don't fetch if undefined
    fetch(`${API}/api/negotiate/${invoiceId}`)
      .then((r) => r.json())
      .then((data) => setThreads(Array.isArray(data) ? data : []))
      .catch(() => setThreads([]));
  }, [invoiceId]);

  async function submitOffer() {
    if (!offer) return;
    setSubmitting(true);
    const res = await fetch(`${API}/api/negotiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoice_id: invoiceId,
        sender_profile_id: profileId,
        proposed_total: parseFloat(offer),
        message: msg,
      }),
    });
    const newThread = await res.json();
    setThreads((prev) => [...prev, newThread]);
    setOffer("");
    setMsg("");
    setSubmitting(false);
  }

  async function respond(id, action) {
    await fetch(`${API}/api/negotiate/${id}/${action}`, { method: "PATCH" });
    setThreads((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: action === "accept" ? "accepted" : "rejected" }
          : t,
      ),
    );
  }

  if (!invoiceId) return null;

  return (
    <div className="negotiation-panel">
      <h3>Negotiation</h3>

      <div className="thread">
        {threads.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            No offers yet.
          </p>
        )}
        {threads.map((t) => (
          <div key={t.id} className={`offer offer-${t.status}`}>
            <div className="offer-header">
              <strong>{t.profiles?.name ?? "Unknown"}</strong>
              <span className={`status-badge status-${t.status}`}>
                {t.status}
              </span>
            </div>
            <p className="offer-amount">
              Proposed: {Number(t.proposed_total).toLocaleString()}
            </p>
            {t.message && <p className="offer-message">{t.message}</p>}
            {isOwner && t.status === "pending" && (
              <div className="offer-actions">
                <button
                  className="accept"
                  onClick={() => respond(t.id, "accept")}
                >
                  Accept
                </button>
                <button
                  className="reject"
                  onClick={() => respond(t.id, "reject")}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {!isOwner && (
        <div className="counter-form">
          <h4>Submit counter-offer</h4>
          <input
            type="number"
            placeholder="Your proposed total"
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
          />
          <textarea
            placeholder="Message (optional)"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
          />
          <button onClick={submitOffer} disabled={!offer || submitting}>
            {submitting ? "Sending…" : "Send offer"}
          </button>
        </div>
      )}
    </div>
  );
}
