import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  useEffect(() => {
    document.title = "404 – Sidan hittades inte | Swedmarks Bil";
    return () => { document.title = "Swedmarks Bil – Lyxiga bilar i Helsingborg"; };
  }, []);

  return (
    <main style={s.page}>
      <div style={s.inner}>
        <p style={s.code}>404</p>
        <h1 style={s.heading}>Sidan hittades inte</h1>
        <p style={s.sub}>
          Sidan du letar efter finns inte eller har flyttats.
        </p>
        <Link to="/" style={s.btn}>← Tillbaka till katalogen</Link>
      </div>
    </main>
  );
}

const s = {
  page: {
    minHeight: "calc(100vh - 68px)",
    backgroundColor: "#0a0e27",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
  },
  inner: {
    textAlign: "center",
    maxWidth: "480px",
  },
  code: {
    fontSize: "clamp(5rem, 20vw, 8rem)",
    fontWeight: 900,
    color: "rgba(201,169,97,0.12)",
    letterSpacing: "-0.05em",
    margin: "0 0 0.5rem",
    lineHeight: 1,
  },
  heading: {
    fontSize: "clamp(1.4rem, 4vw, 1.9rem)",
    fontWeight: 700,
    color: "#ffffff",
    margin: "0 0 0.75rem",
    letterSpacing: "-0.02em",
  },
  sub: {
    fontSize: "0.95rem",
    color: "#6b6b7e",
    marginBottom: "2rem",
    lineHeight: 1.6,
  },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    backgroundColor: "#c9a961",
    color: "#0a0e27",
    textDecoration: "none",
    borderRadius: "8px",
    padding: "0.75rem 1.5rem",
    fontWeight: 700,
    fontSize: "0.9rem",
    letterSpacing: "0.02em",
    transition: "opacity 0.18s",
  },
};
