import { useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL;

export default function ProfileSetup({ onSave }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    role: "buyer",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setSaving(true);
    const res = await fetch(`${API}/api/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const profile = await res.json();
    localStorage.setItem("profileId", profile.id);
    onSave(profile);
    setSaving(false);
  }

  return (
    <div className="profile-setup">
      <h2>Set up your profile</h2>
      <select
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
      >
        <option value="buyer">Buyer (Procurement)</option>
        <option value="supplier">Supplier</option>
        <option value="contractor">Contractor</option>
      </select>
      <input
        placeholder="Full name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        placeholder="Company"
        value={form.company}
        onChange={(e) => setForm({ ...form, company: e.target.value })}
      />
      <input
        placeholder="Phone"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <button onClick={handleSubmit} disabled={saving}>
        {saving ? "Saving…" : "Save profile"}
      </button>
    </div>
  );
}
