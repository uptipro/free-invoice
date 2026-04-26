import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_BASE_URL;

export default function NotificationBell({ profileId }) {
  const [notes, setNotes] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!profileId) return;
    fetch(`${API}/api/notifications/${profileId}`)
      .then((r) => r.json())
      .then(setNotes);
    const id = setInterval(() => {
      fetch(`${API}/api/notifications/${profileId}`)
        .then((r) => r.json())
        .then(setNotes);
    }, 15000);
    return () => clearInterval(id);
  }, [profileId]);

  const unread = notes.filter((n) => !n.read).length;

  async function markRead(id) {
    await fetch(`${API}/api/notifications/${id}/read`, { method: "PATCH" });
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  return (
    <div className="notif-bell" ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ position: "relative" }}
      >
        🔔 {unread > 0 && <span className="badge">{unread}</span>}
      </button>
      {open && (
        <div className="notif-dropdown">
          {notes.length === 0 && <p>No notifications</p>}
          {notes.map((n) => (
            <div
              key={n.id}
              className={`notif-item ${n.read ? "read" : "unread"}`}
              onClick={() => markRead(n.id)}
            >
              <span>{n.message}</span>
              <small>{new Date(n.created_at).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
