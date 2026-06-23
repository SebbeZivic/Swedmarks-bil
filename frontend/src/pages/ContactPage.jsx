import { useState } from "react";
import { createMessage } from "../services/api";

function InfoRow({ label, value }) {
  return (
    <div style={s.infoRow}>
      <span style={s.infoLabel}>{label}</span>
      <span style={s.infoValue}>{value}</span>
    </div>
  );
}

export default function ContactPage() {
  const [form, setForm]       = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setSendError(null);
    try {
      await createMessage(form);
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setSendError(err.message || "Kunde inte skicka meddelandet. Försök igen.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main style={s.page}>
      <style>{`
        .contact-input::placeholder { color: rgba(160,160,176,0.35); }
        .contact-input:focus { border-color: rgba(201,169,97,0.5) !important; background: rgba(201,169,97,0.05) !important; outline: none; }
      `}</style>

      <div style={s.hero}>
        <h1 style={s.heroTitle}>Kontakta oss</h1>
        <p style={s.heroSub}>Vi hjälper dig hitta rätt bil. Tveka inte att höra av dig!</p>
      </div>

      <div style={s.content}>
        <div style={s.infoCol}>
          <div style={s.card}>
            <h2 style={s.cardTitle}>Swedmarks Bil</h2>
            <div style={s.infoList}>
              <InfoRow label="Adress"  value="Birkagatan 5, Helsingborg" />
              <InfoRow label="Telefon" value="073-406 06 08" />
              <InfoRow label="E-post"  value="swedmarksbil@gmail.com" />
            </div>
          </div>

          <div style={{ ...s.card, marginTop: "1.25rem" }}>
            <h3 style={s.cardTitle}>Öppettider</h3>
            <div style={s.hoursGrid}>
              <span style={s.dayLabel}>Måndag–Fredag</span>
              <span style={s.timeLabel}>09:00–18:00</span>
              <span style={s.dayLabel}>Lördag</span>
              <span style={s.timeLabel}>10:00–15:00</span>
              <span style={s.dayLabel}>Söndag</span>
              <span style={{ ...s.timeLabel, color: "#6b6b7e", fontWeight: 400 }}>Stängt</span>
            </div>
          </div>
        </div>

        <div style={s.formCol}>
          <div style={s.card}>
            <h2 style={s.cardTitle}>Skicka ett meddelande</h2>

            {submitted ? (
              <div style={s.successBox}>
                <div style={s.successCheck}>✓</div>
                <div>
                  <p style={s.successTitle}>Tack för ditt meddelande!</p>
                  <p style={s.successSub}>Vi återkommer inom 1 arbetsdag.</p>
                </div>
              </div>
            ) : (
              <form style={s.form} onSubmit={handleSubmit}>
                <div style={s.formRow}>
                  <label style={s.label}>Namn *</label>
                  <input className="contact-input" style={s.input} name="name" value={form.name} onChange={handleChange} placeholder="Ditt namn" required />
                </div>
                <div style={s.formRow}>
                  <label style={s.label}>E-post *</label>
                  <input className="contact-input" style={s.input} name="email" type="email" value={form.email} onChange={handleChange} placeholder="din@email.se" required />
                </div>
                <div style={s.formRow}>
                  <label style={s.label}>Telefon</label>
                  <input className="contact-input" style={s.input} name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="070-000 00 00" />
                </div>
                <div style={s.formRow}>
                  <label style={s.label}>Meddelande *</label>
                  <textarea className="contact-input" style={s.textarea} name="message" value={form.message} onChange={handleChange} placeholder="Vad kan vi hjälpa dig med?" rows={5} required />
                </div>
                {sendError && <p style={s.sendError}>{sendError}</p>}
                <button type="submit" disabled={sending} style={{ ...s.submitBtn, opacity: sending ? 0.7 : 1 }}>
                  {sending ? "Skickar…" : "Skicka meddelande"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

const s = {
  page: { backgroundColor: "#0a0e27", minHeight: "calc(100vh - 68px)" },
  hero: {
    backgroundColor: "#0f1335",
    borderBottom: "1px solid rgba(201,169,97,0.15)",
    padding: "3.5rem 1.5rem",
    textAlign: "center",
  },
  heroTitle: {
    fontSize: "2.2rem",
    fontWeight: 800,
    color: "#ffffff",
    margin: 0,
    letterSpacing: "-0.03em",
  },
  heroSub: {
    fontSize: "0.95rem",
    color: "#6b6b7e",
    marginTop: "0.6rem",
  },
  content: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "2.5rem 1.5rem 4rem",
    display: "flex",
    flexWrap: "wrap",
    gap: "1.5rem",
    alignItems: "flex-start",
  },
  infoCol: { flex: "1", minWidth: "260px" },
  formCol: { flex: "1.6", minWidth: "300px" },
  card: {
    backgroundColor: "#0f1335",
    border: "1px solid rgba(201,169,97,0.15)",
    borderRadius: "12px",
    padding: "1.75rem",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#c9a961",
    marginBottom: "1.25rem",
    letterSpacing: "0.02em",
  },
  infoList: { display: "flex", flexDirection: "column", gap: "0.85rem" },
  infoRow: { display: "flex", flexDirection: "column", gap: "3px" },
  infoLabel: {
    fontSize: "0.65rem",
    fontWeight: 700,
    color: "rgba(201,169,97,0.5)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  infoValue: { fontSize: "0.9rem", color: "#e0e0e0", fontWeight: 500 },
  hoursGrid: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "0.65rem 1rem",
    alignItems: "center",
  },
  dayLabel: { fontSize: "0.875rem", color: "#a0a0b0" },
  timeLabel: { fontSize: "0.875rem", fontWeight: 600, color: "#c9a961", textAlign: "right" },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  formRow: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { fontSize: "0.78rem", fontWeight: 600, color: "#a0a0b0", letterSpacing: "0.02em" },
  input: {
    width: "100%",
    padding: "0.65rem 0.85rem",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    fontSize: "0.9rem",
    color: "#e0e0e0",
    backgroundColor: "#1a1f3a",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.18s, background 0.18s",
  },
  textarea: {
    width: "100%",
    padding: "0.65rem 0.85rem",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    fontSize: "0.9rem",
    color: "#e0e0e0",
    backgroundColor: "#1a1f3a",
    fontFamily: "inherit",
    boxSizing: "border-box",
    resize: "vertical",
    minHeight: "120px",
    transition: "border-color 0.18s, background 0.18s",
  },
  submitBtn: {
    backgroundColor: "#c9a961",
    color: "#0a0e27",
    border: "none",
    borderRadius: "8px",
    padding: "0.78rem 1.5rem",
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    alignSelf: "flex-start",
    letterSpacing: "0.02em",
    transition: "opacity 0.18s",
    marginTop: "0.25rem",
  },
  sendError: {
    fontSize: "0.82rem",
    color: "#ef4444",
    backgroundColor: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "6px",
    padding: "0.5rem 0.75rem",
  },
  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    backgroundColor: "rgba(201,169,97,0.08)",
    border: "1px solid rgba(201,169,97,0.2)",
    borderRadius: "8px",
    padding: "1.25rem",
    marginTop: "0.5rem",
  },
  successCheck: {
    width: "40px", height: "40px",
    backgroundColor: "#c9a961", color: "#0a0e27",
    borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.1rem", fontWeight: 700, flexShrink: 0,
  },
  successTitle: { fontWeight: 700, color: "#c9a961", fontSize: "0.95rem" },
  successSub: { color: "#a0a0b0", fontSize: "0.85rem", marginTop: "2px" },
};
