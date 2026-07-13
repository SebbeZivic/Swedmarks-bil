import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { login, register } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [tab, setTab]         = useState("login");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const { login: authLogin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Logga in | Swedmarks Bil";
    return () => { document.title = "Swedmarks Bil – Lyxiga bilar i Helsingborg"; };
  }, []);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fn   = tab === "login" ? login : register;
      const data = await fn(email, password);
      authLogin(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={s.page}>
      <style>{`
        .auth-input::placeholder { color: rgba(160,160,176,0.4); }
        .auth-input:focus { border-color: rgba(201,169,97,0.5) !important; background: rgba(201,169,97,0.05) !important; outline: none; }
      `}</style>

      <div style={s.card}>
        <div style={s.brand}>
          <span style={s.brandMain}>Swedmarks</span>
          <span style={s.brandAccent}> Bil</span>
        </div>
        <p style={s.brandSub}>Din pålitliga bilhandlare sedan 1998</p>

        <div style={s.tabs}>
          <button
            type="button"
            style={{ ...s.tab, ...(tab === "login" ? s.tabActive : {}) }}
            onClick={() => { setTab("login"); setError(""); }}
          >
            Logga in
          </button>
          <button
            type="button"
            style={{ ...s.tab, ...(tab === "register" ? s.tabActive : {}) }}
            onClick={() => { setTab("register"); setError(""); }}
          >
            Registrera
          </button>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <label style={s.label}>
            E-post
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={s.input}
              placeholder="din@email.se"
            />
          </label>

          <label style={s.label}>
            Lösenord
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={tab === "login" ? "current-password" : "new-password"}
              style={s.input}
              placeholder="••••••••"
            />
          </label>

          {error && <p style={s.error}>{error}</p>}

          <button type="submit" disabled={loading} style={{ ...s.submit, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Väntar..." : tab === "login" ? "Logga in" : "Registrera"}
          </button>

          {tab === "login" && (
            <p style={s.forgotNote}>
              Glömt lösenordet? Kontakta oss på{" "}
              <a href="mailto:swedmarksbil@gmail.com" style={s.forgotLink}>swedmarksbil@gmail.com</a>{" "}
              för återställning.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}

const s = {
  page: {
    minHeight: "calc(100vh - 68px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a0e27",
    padding: "2rem 1rem",
  },
  card: {
    backgroundColor: "#0f1335",
    border: "1px solid rgba(201,169,97,0.18)",
    borderRadius: "14px",
    padding: "2.5rem 2rem",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
  },
  brand: {
    textAlign: "center",
    fontSize: "1.6rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    marginBottom: "0.35rem",
  },
  brandMain: { color: "#ffffff" },
  brandAccent: { color: "#c9a961", fontWeight: 300 },
  brandSub: {
    textAlign: "center",
    fontSize: "0.78rem",
    color: "#6b6b7e",
    marginBottom: "2rem",
    letterSpacing: "0.02em",
  },
  tabs: {
    display: "flex",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    marginBottom: "1.75rem",
  },
  tab: {
    flex: 1,
    padding: "0.6rem",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b6b7e",
    fontWeight: 600,
    fontSize: "0.9rem",
    borderBottom: "2px solid transparent",
    marginBottom: "-1px",
    transition: "color 0.18s",
    fontFamily: "inherit",
  },
  tabActive: {
    color: "#c9a961",
    borderBottomColor: "#c9a961",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.1rem",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#a0a0b0",
    letterSpacing: "0.02em",
  },
  input: {
    padding: "0.7rem 0.85rem",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    fontSize: "0.95rem",
    backgroundColor: "#1a1f3a",
    color: "#e0e0e0",
    fontFamily: "inherit",
    transition: "border-color 0.18s, background 0.18s",
  },
  error: {
    color: "#ef4444",
    fontSize: "0.82rem",
    margin: 0,
    backgroundColor: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "6px",
    padding: "0.5rem 0.75rem",
  },
  submit: {
    marginTop: "0.5rem",
    padding: "0.8rem",
    backgroundColor: "#c9a961",
    color: "#0a0e27",
    border: "none",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "0.95rem",
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.02em",
    transition: "opacity 0.18s",
  },
  forgotNote: {
    fontSize: "0.78rem",
    color: "#6b6b7e",
    textAlign: "center",
    margin: "0.25rem 0 0",
    lineHeight: 1.5,
  },
  forgotLink: {
    color: "#c9a961",
    textDecoration: "none",
  },
};
