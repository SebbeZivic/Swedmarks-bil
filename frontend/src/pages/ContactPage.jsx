import { useState } from "react";
import { createMessage } from "../services/api";

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value}</span>
    </div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [btnHovered, setBtnHovered] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      setSendError(
        err.message || "Kunde inte skicka meddelandet. Försök igen.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Kontakta oss</h1>
        <p style={styles.heroSub}>
          Vi hjälper dig hitta rätt bil. Tveka inte att höra av dig!
        </p>
      </div>

      <div style={styles.content}>
        <div style={styles.infoCol}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Swedmarks Bil</h2>
            <div style={styles.infoList}>
              <InfoRow label="Adress" value="Birkagatan 5, Helsingborg" />
              <InfoRow label="Telefon" value="073-406 06 08" />
              <InfoRow label="E-post" value="swedmarksbil@gmail.com" />
            </div>
          </div>

          <div style={{ ...styles.card, marginTop: "1.25rem" }}>
            <h3 style={styles.cardTitle}>Öppettider</h3>
            <div style={styles.hoursGrid}>
              <span style={styles.dayLabel}>Måndag–Fredag</span>
              <span style={styles.timeLabel}>09:00–18:00</span>
              <span style={styles.dayLabel}>Lördag</span>
              <span style={styles.timeLabel}>10:00–15:00</span>
              <span style={styles.dayLabel}>Söndag</span>
              <span
                style={{
                  ...styles.timeLabel,
                  color: "#cbcac7",
                  fontWeight: 400,
                }}
              >
                Stängt
              </span>
            </div>
          </div>
        </div>

        <div style={styles.formCol}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Skicka ett meddelande</h2>

            {submitted ? (
              <div style={styles.successBox}>
                <div style={styles.successCheck}>✓</div>
                <div>
                  <p style={styles.successTitle}>Tack för ditt meddelande!</p>
                  <p style={styles.successSub}>
                    Vi återkommer inom 1 arbetsdag.
                  </p>
                </div>
              </div>
            ) : (
              <form style={styles.form} onSubmit={handleSubmit}>
                <div style={styles.formRow}>
                  <label style={styles.label}>Namn *</label>
                  <input
                    style={styles.input}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Ditt namn"
                    required
                  />
                </div>
                <div style={styles.formRow}>
                  <label style={styles.label}>E-post *</label>
                  <input
                    style={styles.input}
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="din@email.se"
                    required
                  />
                </div>
                <div style={styles.formRow}>
                  <label style={styles.label}>Telefon</label>
                  <input
                    style={styles.input}
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="070-000 00 00"
                  />
                </div>
                <div style={styles.formRow}>
                  <label style={styles.label}>Meddelande *</label>
                  <textarea
                    style={styles.textarea}
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Vad kan vi hjälpa dig med?"
                    rows={5}
                    required
                  />
                </div>
                {sendError && <p style={styles.sendError}>{sendError}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    ...styles.submitBtn,
                    ...(btnHovered && !sending ? styles.submitBtnHover : {}),
                    ...(sending ? { opacity: 0.7 } : {}),
                  }}
                  onMouseEnter={() => setBtnHovered(true)}
                  onMouseLeave={() => setBtnHovered(false)}
                >
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

const styles = {
  page: {
    backgroundColor: "#faf7f6",
  },
  hero: {
    backgroundColor: "#285570",
    padding: "3rem 1.5rem",
    textAlign: "center",
  },
  heroTitle: {
    fontSize: "2rem",
    fontWeight: 800,
    color: "#ffffff",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  heroSub: {
    fontSize: "1rem",
    color: "rgba(255,255,255,0.68)",
    marginTop: "0.5rem",
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
  infoCol: {
    flex: "1",
    minWidth: "260px",
  },
  formCol: {
    flex: "1.6",
    minWidth: "300px",
  },
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e3ded7",
    borderRadius: "10px",
    padding: "1.75rem",
  },
  cardTitle: {
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "#285570",
    marginBottom: "1.25rem",
  },
  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.85rem",
  },
  infoRow: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  infoLabel: {
    fontSize: "0.7rem",
    fontWeight: 700,
    color: "#cbcac7",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },
  infoValue: {
    fontSize: "0.92rem",
    color: "#333333",
    fontWeight: 500,
  },
  hoursGrid: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "0.65rem 1rem",
    alignItems: "center",
  },
  dayLabel: {
    fontSize: "0.9rem",
    color: "#333333",
  },
  timeLabel: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#285570",
    textAlign: "right",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  formRow: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  label: {
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#333333",
  },
  input: {
    width: "100%",
    padding: "0.6rem 0.85rem",
    border: "1px solid #e3ded7",
    borderRadius: "7px",
    fontSize: "0.9rem",
    color: "#333333",
    backgroundColor: "#faf7f6",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  },
  textarea: {
    width: "100%",
    padding: "0.6rem 0.85rem",
    border: "1px solid #e3ded7",
    borderRadius: "7px",
    fontSize: "0.9rem",
    color: "#333333",
    backgroundColor: "#faf7f6",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    resize: "vertical",
    minHeight: "120px",
  },
  submitBtn: {
    backgroundColor: "#285570",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "0.75rem 1.5rem",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "background-color 0.15s",
    marginTop: "0.25rem",
    fontFamily: "inherit",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
    alignSelf: "flex-start",
  },
  submitBtnHover: {
    backgroundColor: "#1e3f52",
  },
  sendError: {
    fontSize: "0.85rem",
    color: "#b00020",
    backgroundColor: "#fff0f0",
    border: "1px solid #f5c6cb",
    borderRadius: "6px",
    padding: "0.5rem 0.75rem",
  },
  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    backgroundColor: "#f0f7f4",
    border: "1px solid #a8d5c5",
    borderRadius: "8px",
    padding: "1.25rem",
    marginTop: "0.5rem",
  },
  successCheck: {
    width: "40px",
    height: "40px",
    backgroundColor: "#285570",
    color: "#ffffff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.1rem",
    fontWeight: 700,
    flexShrink: 0,
  },
  successTitle: {
    fontWeight: 700,
    color: "#285570",
    fontSize: "0.95rem",
  },
  successSub: {
    color: "#333333",
    fontSize: "0.85rem",
    marginTop: "2px",
  },
};
