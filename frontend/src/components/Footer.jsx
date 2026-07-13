import { useState } from "react";
import { Link } from "react-router-dom";

function FooterLink({ to, children }) {
  const [hov, setHov] = useState(false);
  return (
    <Link
      to={to}
      style={{ ...styles.footerLink, ...(hov ? styles.footerLinkHov : {}) }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <div style={styles.brand}>
          <Link to="/" style={styles.logo}>
            Swedmarks<span style={styles.logoThin}> Bil</span>
          </Link>
          <p style={styles.tagline}>Din pålitliga bilhandlare i Helsingborg.</p>
        </div>

        <div style={styles.col}>
          <h4 style={styles.colTitle}>Navigering</h4>
          <FooterLink to="/">Bilkatalog</FooterLink>
          <FooterLink to="/contact">Kontakt</FooterLink>
          <FooterLink to="/admin">Admin</FooterLink>
        </div>

        <div style={styles.col}>
          <h4 style={styles.colTitle}>Kontakt</h4>
          <p style={styles.infoText}>Birkagatan 5</p>
          <p style={styles.infoText}>256 55 Helsingborg</p>
          <p style={{ ...styles.infoText, marginTop: "0.6rem" }}>
            073-406 06 08
          </p>
          <p style={styles.infoText}>swedmarksbil@gmail.com</p>
        </div>
      </div>

      <div style={styles.bottomWrap}>
        <div style={styles.bottom}>
          <p style={styles.copyright}>
            © {new Date().getFullYear()} Swedmarks Bil. Alla rättigheter
            förbehållna.
          </p>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: "#060919",
    borderTop: "1px solid rgba(201,169,97,0.12)",
  },
  inner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "3rem 1.5rem 2rem",
    display: "flex",
    flexWrap: "wrap",
    gap: "2.5rem",
  },
  brand: {
    flex: "2",
    minWidth: "200px",
  },
  logo: {
    fontSize: "1.2rem",
    fontWeight: 800,
    color: "#ffffff",
    textDecoration: "none",
    letterSpacing: "-0.03em",
    display: "inline-block",
    marginBottom: "0.65rem",
  },
  logoThin: {
    fontWeight: 300,
    color: "#c9a961",
  },
  tagline: {
    fontSize: "0.875rem",
    color: "rgba(255,255,255,0.35)",
    lineHeight: 1.6,
    maxWidth: "230px",
  },
  col: {
    flex: "1",
    minWidth: "140px",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  colTitle: {
    fontSize: "0.65rem",
    fontWeight: 700,
    color: "rgba(201,169,97,0.45)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "0.2rem",
  },
  footerLink: {
    fontSize: "0.875rem",
    color: "rgba(255,255,255,0.42)",
    textDecoration: "none",
    transition: "color 0.15s",
  },
  footerLinkHov: {
    color: "#c9a961",
  },
  infoText: {
    fontSize: "0.875rem",
    color: "rgba(255,255,255,0.35)",
    lineHeight: 1.55,
  },
  bottomWrap: {
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  bottom: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "1.1rem 1.5rem",
  },
  copyright: {
    fontSize: "0.78rem",
    color: "rgba(255,255,255,0.22)",
  },
};
