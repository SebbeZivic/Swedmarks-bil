import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { setToken } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const fn = tab === "login" ? login : register;
      const data = await fn(email, password);
      setToken(data.token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Swedmarks Bil</h1>

        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(tab === "login" ? styles.tabActive : {}),
            }}
            onClick={() => {
              setTab("login");
              setError("");
            }}
            type="button"
          >
            Logga in
          </button>
          <button
            style={{
              ...styles.tab,
              ...(tab === "register" ? styles.tabActive : {}),
            }}
            onClick={() => {
              setTab("register");
              setError("");
            }}
            type="button"
          >
            Registrera
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            E-post
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={styles.input}
              placeholder="din@email.se"
            />
          </label>

          <label style={styles.label}>
            Lösenord
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={
                tab === "login" ? "current-password" : "new-password"
              }
              style={styles.input}
              placeholder="••••••••"
            />
          </label>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.submit}>
            {loading
              ? "Väntar..."
              : tab === "login"
                ? "Logga in"
                : "Registrera"}
          </button>
        </form>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#faf7f6",
    padding: "1rem",
  },
  card: {
    backgroundColor: "#fff",
    border: "1px solid #cbcac7",
    borderRadius: "12px",
    padding: "2rem",
    width: "100%",
    maxWidth: "420px",
  },
  heading: {
    color: "#285570",
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "1.5rem",
    textAlign: "center",
  },
  tabs: {
    display: "flex",
    borderBottom: "2px solid #e3ded7",
    marginBottom: "1.5rem",
  },
  tab: {
    flex: 1,
    padding: "0.6rem",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#cbcac7",
    fontWeight: "600",
    fontSize: "0.95rem",
    borderBottom: "2px solid transparent",
    marginBottom: "-2px",
    transition: "color 0.15s",
  },
  tabActive: {
    color: "#285570",
    borderBottomColor: "#285570",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#333333",
  },
  input: {
    padding: "0.65rem 0.75rem",
    border: "1px solid #cbcac7",
    borderRadius: "8px",
    fontSize: "1rem",
    backgroundColor: "#faf7f6",
    color: "#333333",
    outline: "none",
  },
  error: {
    color: "#c0392b",
    fontSize: "0.875rem",
    margin: 0,
  },
  submit: {
    marginTop: "0.5rem",
    padding: "0.75rem",
    backgroundColor: "#285570",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
};
