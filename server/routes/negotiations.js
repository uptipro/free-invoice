const express = require("express");
const router = express.Router();
const { supabase } = require("../db");
const { notifyProfiles } = require("../notify");

// Supplier submits a counter-offer
router.post("/", async (req, res) => {
  const { invoice_id, sender_profile_id, proposed_total, message } = req.body;

  const { data, error } = await supabase
    .from("negotiations")
    .insert([{ invoice_id, sender_profile_id, proposed_total, message }])
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });

  // Mark invoice as negotiating
  await supabase
    .from("invoices")
    .update({ status: "negotiating" })
    .eq("id", invoice_id);

  // Notify the buyer
  const { data: invoice } = await supabase
    .from("invoices")
    .select("profile_id, invoice_number")
    .eq("id", invoice_id)
    .single();
  if (invoice?.profile_id) {
    await notifyProfiles(
      [invoice.profile_id],
      invoice_id,
      "counter_offer",
      `New counter-offer on invoice ${invoice.invoice_number}`,
    );
  }

  res.json(data);
});

// Get all negotiation threads for an invoice
router.get("/:invoiceId", async (req, res) => {
  const { data, error } = await supabase
    .from("negotiations")
    .select("*, profiles(name, company, role)")
    .eq("invoice_id", req.params.invoiceId)
    .order("created_at", { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Accept a negotiation offer
router.patch("/:id/accept", async (req, res) => {
  const { data: neg, error } = await supabase
    .from("negotiations")
    .update({ status: "accepted" })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });

  await supabase
    .from("invoices")
    .update({ status: "accepted", total: neg.proposed_total })
    .eq("id", neg.invoice_id);

  await notifyProfiles(
    [neg.sender_profile_id],
    neg.invoice_id,
    "accepted",
    "Your counter-offer was accepted!",
  );
  res.json(neg);
});

// Reject a negotiation offer
router.patch("/:id/reject", async (req, res) => {
  const { data: neg, error } = await supabase
    .from("negotiations")
    .update({ status: "rejected" })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });

  await notifyProfiles(
    [neg.sender_profile_id],
    neg.invoice_id,
    "rejected",
    "Your counter-offer was declined.",
  );
  res.json(neg);
});

module.exports = router;
