import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ChevronIcon({ rotated }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      style={{
        display: "inline-block",
        flexShrink: 0,
        transition: "transform 0.22s ease",
        transform: rotated ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function HeartNavIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function HamburgerIcon({ open }) {
  const bar = (extra) => ({
    display: "block",
    position: "absolute",
    left: 0,
    width: "22px",
    height: "2px",
    backgroundColor: "#ffffff",
    borderRadius: "2px",
    transition: "transform 0.25s ease, opacity 0.25s ease",
    ...extra,
  });

  return (
    <span
      style={{ position: "relative", display: "block", width: "22px", height: "16px" }}
    >
      <span
        style={bar({ top: 0, transform: open ? "translateY(7px) rotate(45deg)" : "none" })}
      />
      <span style={bar({ top: "7px", opacity: open ? 0 : 1 })} />
      <span
        style={bar({ top: "14px", transform: open ? "translateY(-7px) rotate(-45deg)" : "none" })}
      />
    </span>
  );
}

const CAR_CATEGORIES = [
  { label: "Alla bilar",     sub: "Hela sortimentet",    bodyType: null },
  { label: "SUV & Jeep",    sub: "Rymliga och robusta",  bodyType: "SUV" },
  { label: "Sedan",          sub: "Klassisk komfort",     bodyType: "Sedan" },
  { label: "Kombi",          sub: "Praktisk vardag",      bodyType: "Kombi" },
  { label: "Elbil & Hybrid", sub: "Framtidens teknik",   bodyType: "Hybrid" },
];

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 700);
  const [searchValue, setSearchValue] = useState("");
  const triggerRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e) {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const hover = (key) => ({
    onMouseEnter: () => setHovered(key),
    onMouseLeave: () => setHovered(null),
  });

  function closeDropdown() {
    setDropdownOpen(false);
    setHovered(null);
  }

  function handleSearchChange(e) {
    const val = e.target.value;
    setSearchValue(val);
    if (val.trim()) {
      navigate(`/?search=${encodeURIComponent(val.trim())}`, { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }

  function clearSearch() {
    setSearchValue("");
    navigate("/", { replace: true });
  }

  return (
    <>
      <style>{`
        @keyframes dd-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .nav-search-input::placeholder { color: rgba(255,255,255,0.38); }
        .nav-search-input:focus { border-color: rgba(255,255,255,0.4) !important; background: rgba(255,255,255,0.16) !important; }
        .mobile-search-input::placeholder { color: rgba(255,255,255,0.38); }
        .mobile-search-input:focus { outline: none; border-color: rgba(255,255,255,0.35) !important; }
      `}</style>

      <header style={styles.header}>
        <div style={isMobile ? styles.navMobile : styles.navDesktop}>
          <Link to="/" style={styles.logo}>
            Swedmarks<span style={styles.logoThin}> Bil</span>
          </Link>

          {!isMobile && (
            <nav style={styles.centerLinks}>
              <div ref={triggerRef} style={{ position: "relative" }}>
                <button
                  style={{
                    ...styles.navBtn,
                    backgroundColor: dropdownOpen
                      ? "rgba(255,255,255,0.08)"
                      : "transparent",
                    color: "#ffffff",
                  }}
                  onClick={() => setDropdownOpen((o) => !o)}
                  onMouseEnter={() => setDropdownOpen(true)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  Bilar
                  <ChevronIcon rotated={dropdownOpen} />
                </button>

                {dropdownOpen && (
                  <div
                    style={styles.dropdownWrapper}
                    onMouseLeave={closeDropdown}
                  >
                    <div style={styles.dropdownCard}>
                      <p style={styles.dropdownHeading}>Välj karosstyp</p>
                      {CAR_CATEGORIES.map((cat, i) => (
                        <Link
                          key={cat.label}
                          to={cat.bodyType ? `/?bodyType=${cat.bodyType}` : "/"}
                          onClick={closeDropdown}
                          style={{
                            ...styles.dropdownItem,
                            ...(hovered === `cat${i}` ? styles.dropdownItemHover : {}),
                          }}
                          {...hover(`cat${i}`)}
                        >
                          <span style={styles.dropdownItemLabel}>{cat.label}</span>
                          <span style={styles.dropdownItemSub}>{cat.sub}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/"
                style={{
                  ...styles.navLink,
                  ...(hovered === "catalog" ? styles.navLinkHover : {}),
                }}
                {...hover("catalog")}
              >
                Katalog
              </Link>

              <Link
                to="/favorites"
                style={{
                  ...styles.navLink,
                  ...(hovered === "favorites" ? styles.navLinkHover : {}),
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                }}
                {...hover("favorites")}
              >
                <HeartNavIcon />
                Favoriter
              </Link>

              <Link
                to="/contact"
                style={{
                  ...styles.navLink,
                  ...(hovered === "contact" ? styles.navLinkHover : {}),
                }}
                {...hover("contact")}
              >
                Kontakt
              </Link>
            </nav>
          )}

          {!isMobile && (
            <div style={styles.rightActions}>
              <div style={styles.searchWrap}>
                <svg
                  style={styles.searchIconEl}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="2.5"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="nav-search-input"
                  style={styles.searchInput}
                  placeholder="Sök bil..."
                  value={searchValue}
                  onChange={handleSearchChange}
                />
                {searchValue && (
                  <button
                    style={styles.clearBtn}
                    onClick={clearSearch}
                    aria-label="Rensa sökning"
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(255,255,255,0.65)"
                      strokeWidth="2.5"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              {user ? (
                <>
                  {user.isAdmin && (
                    <Link
                      to="/admin"
                      style={{
                        ...styles.navLink,
                        ...(hovered === "admin" ? styles.navLinkHover : {}),
                      }}
                      {...hover("admin")}
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/logout"
                    style={{
                      ...styles.ghostBtn,
                      ...(hovered === "logout" ? styles.ghostBtnHover : {}),
                    }}
                    {...hover("logout")}
                  >
                    Logga ut
                  </Link>
                </>
              ) : (
                <Link
                  to="/login"
                  style={{
                    ...styles.loginBtn,
                    ...(hovered === "login" ? styles.loginBtnHover : {}),
                  }}
                  {...hover("login")}
                >
                  Logga in
                </Link>
              )}
            </div>
          )}

          {isMobile && (
            <button
              style={styles.hamburgerBtn}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Stäng meny" : "Öppna meny"}
              aria-expanded={menuOpen}
            >
              <HamburgerIcon open={menuOpen} />
            </button>
          )}
        </div>

        {isMobile && (
          <div
            style={{
              ...styles.mobileMenu,
              maxHeight: menuOpen ? "560px" : "0",
              opacity: menuOpen ? 1 : 0,
              overflow: "hidden",
              transition: "max-height 0.32s ease, opacity 0.22s ease",
            }}
          >
            <div style={styles.mobileSearchWrap}>
              <svg
                style={styles.mobileSearchIcon}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="mobile-search-input"
                style={styles.mobileSearchInput}
                placeholder="Sök bil..."
                value={searchValue}
                onChange={handleSearchChange}
              />
            </div>

            {CAR_CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                to={cat.bodyType ? `/?bodyType=${cat.bodyType}` : "/"}
                style={styles.mobileLink}
                onClick={() => setMenuOpen(false)}
              >
                <span style={styles.mobileLinkLabel}>{cat.label}</span>
                <span style={styles.mobileLinkSub}>{cat.sub}</span>
              </Link>
            ))}

            <div style={styles.mobileDivider} />

            <Link
              to="/favorites"
              style={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              <span style={{ ...styles.mobileLinkLabel, display: "flex", alignItems: "center", gap: "6px" }}>
                <HeartNavIcon />
                Favoriter
              </span>
            </Link>

            <Link
              to="/contact"
              style={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              <span style={styles.mobileLinkLabel}>Kontakt</span>
            </Link>

            {user ? (
              <>
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    style={styles.mobileLink}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span style={styles.mobileLinkLabel}>Admin</span>
                  </Link>
                )}
                <Link
                  to="/logout"
                  style={{ ...styles.mobileLink, opacity: 0.55 }}
                  onClick={() => setMenuOpen(false)}
                >
                  <span style={styles.mobileLinkLabel}>Logga ut</span>
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                style={styles.mobileLink}
                onClick={() => setMenuOpen(false)}
              >
                <span style={styles.mobileLinkLabel}>Logga in</span>
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
}

const styles = {
  header: {
    backgroundColor: "#285570",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
  },

  navDesktop: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 1.5rem",
    height: "68px",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
  },

  navMobile: {
    padding: "0 1rem",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    fontSize: "1.25rem",
    fontWeight: 800,
    color: "#ffffff",
    textDecoration: "none",
    letterSpacing: "-0.03em",
    justifySelf: "start",
  },
  logoThin: {
    fontWeight: 300,
    opacity: 0.75,
  },

  centerLinks: {
    display: "flex",
    alignItems: "center",
    gap: "0.15rem",
    justifyContent: "center",
  },

  navLink: {
    color: "rgba(255,255,255,0.78)",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: 500,
    padding: "0.45rem 0.8rem",
    borderRadius: "6px",
    transition: "color 0.15s, background-color 0.15s",
    display: "inline-block",
  },
  navLinkHover: {
    color: "#ffffff",
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  navBtn: {
    background: "none",
    border: "none",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
    color: "rgba(255,255,255,0.78)",
    fontSize: "0.9rem",
    fontWeight: 500,
    padding: "0.45rem 0.8rem",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontFamily: "inherit",
    transition: "color 0.15s, background-color 0.15s",
  },

  rightActions: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    justifyContent: "flex-end",
  },

  searchWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchInput: {
    width: "170px",
    backgroundColor: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "20px",
    padding: "0.35rem 1.8rem 0.35rem 2rem",
    fontSize: "0.82rem",
    color: "#ffffff",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.15s, background-color 0.15s",
  },
  searchIconEl: {
    position: "absolute",
    left: "0.65rem",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  clearBtn: {
    position: "absolute",
    right: "0.5rem",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    outline: "none",
    padding: "2px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    WebkitTapHighlightColor: "transparent",
  },

  ghostBtn: {
    color: "rgba(255,255,255,0.8)",
    textDecoration: "none",
    fontSize: "0.85rem",
    fontWeight: 600,
    padding: "0.4rem 0.9rem",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "7px",
    display: "inline-block",
    transition: "color 0.15s, border-color 0.15s",
    cursor: "pointer",
  },
  ghostBtnHover: {
    color: "#ffffff",
    borderColor: "rgba(255,255,255,0.65)",
  },

  loginBtn: {
    backgroundColor: "#ffffff",
    color: "#285570",
    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: 700,
    padding: "0.45rem 1.15rem",
    borderRadius: "7px",
    border: "none",
    display: "inline-block",
    transition: "opacity 0.15s",
    cursor: "pointer",
  },
  loginBtnHover: {
    opacity: 0.88,
  },

  dropdownWrapper: {
    position: "absolute",
    top: "calc(100% + 10px)",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 200,
    animation: "dd-in 0.18s ease both",
  },
  dropdownCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 12px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)",
    minWidth: "240px",
    padding: "0.5rem",
    overflow: "hidden",
  },
  dropdownHeading: {
    fontSize: "0.68rem",
    fontWeight: 700,
    color: "#cbcac7",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    padding: "0.4rem 0.85rem 0.6rem",
    margin: 0,
  },
  dropdownItem: {
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    textDecoration: "none",
    padding: "0.55rem 0.85rem",
    borderRadius: "8px",
    transition: "background-color 0.12s",
  },
  dropdownItemHover: {
    backgroundColor: "#faf7f6",
  },
  dropdownItemLabel: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#285570",
  },
  dropdownItemSub: {
    fontSize: "0.75rem",
    color: "#cbcac7",
  },

  hamburgerBtn: {
    background: "none",
    border: "none",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
    padding: "0.5rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },

  mobileMenu: {
    backgroundColor: "#285570",
    borderTop: "1px solid rgba(255,255,255,0.12)",
    padding: "0.85rem 1.25rem 0.75rem",
  },
  mobileSearchWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  mobileSearchIcon: {
    position: "absolute",
    left: "0.75rem",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  mobileSearchInput: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "20px",
    padding: "0.5rem 1rem 0.5rem 2.25rem",
    fontSize: "0.9rem",
    color: "#ffffff",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  mobileLink: {
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    textDecoration: "none",
    padding: "0.85rem 0",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  mobileLinkLabel: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "rgba(255,255,255,0.9)",
  },
  mobileLinkSub: {
    fontSize: "0.78rem",
    color: "rgba(255,255,255,0.45)",
  },
  mobileDivider: {
    height: "1px",
    backgroundColor: "rgba(255,255,255,0.18)",
    margin: "0.5rem 0",
  },
};
