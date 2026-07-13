import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CAR_CATEGORIES = [
  { label: "Alla bilar",     sub: "Hela sortimentet",   bodyType: null },
  { label: "SUV & Jeep",    sub: "Rymliga och robusta", bodyType: "SUV" },
  { label: "Sedan",          sub: "Klassisk komfort",    bodyType: "Sedan" },
  { label: "Kombi",          sub: "Praktisk vardag",     bodyType: "Kombi" },
  { label: "Elbil & Hybrid", sub: "Framtidens teknik",  bodyType: "Hybrid" },
];

function ChevronIcon({ rotated }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ flexShrink: 0, transition: "transform 0.22s ease", transform: rotated ? "rotate(180deg)" : "rotate(0deg)" }}>
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
    display: "block", position: "absolute", left: 0,
    width: "22px", height: "2px",
    backgroundColor: "#c9a961",
    borderRadius: "2px",
    transition: "transform 0.25s ease, opacity 0.25s ease",
    ...extra,
  });
  return (
    <span style={{ position: "relative", display: "block", width: "22px", height: "16px" }}>
      <span style={bar({ top: 0, transform: open ? "translateY(7px) rotate(45deg)" : "none" })} />
      <span style={bar({ top: "7px", opacity: open ? 0 : 1 })} />
      <span style={bar({ top: "14px", transform: open ? "translateY(-7px) rotate(-45deg)" : "none" })} />
    </span>
  );
}

function loadFavCount() {
  try { return JSON.parse(localStorage.getItem("favorites") || "[]").length; }
  catch { return 0; }
}

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [searchValue, setSearchValue] = useState("");
  const [favCount, setFavCount] = useState(loadFavCount);
  const triggerRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const update = () => setFavCount(loadFavCount());
    window.addEventListener("favoritesChanged", update);
    return () => window.removeEventListener("favoritesChanged", update);
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e) {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const hover = (key) => ({
    onMouseEnter: () => setHovered(key),
    onMouseLeave: () => setHovered(null),
  });

  function handleSearchChange(e) {
    const val = e.target.value;
    setSearchValue(val);
    if (val.trim()) navigate(`/?search=${encodeURIComponent(val.trim())}`, { replace: true });
    else navigate("/", { replace: true });
  }

  function clearSearch() {
    setSearchValue("");
    navigate("/", { replace: true });
  }

  const navLinkStyle = (key) => ({
    ...s.navLink,
    ...(hovered === key ? s.navLinkHover : {}),
  });

  return (
    <>
      <style>{`
        @keyframes dd-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .nav-search::placeholder { color: rgba(201,169,97,0.35); }
        .nav-search:focus { border-color: rgba(201,169,97,0.5) !important; background: rgba(201,169,97,0.07) !important; }
        .mob-search::placeholder { color: rgba(201,169,97,0.35); }
        .mob-search:focus { outline: none; border-color: rgba(201,169,97,0.4) !important; }
        @media (max-width: 480px) {
          .nav-logo { font-size: 1.05rem !important; }
        }
        .nav-hamburger { min-height: 44px !important; padding: 0.75rem 0.5rem !important; }
        .mob-link-touch { min-height: 44px !important; padding: 0.75rem 0 !important; }
        .mob-search-input { min-height: 44px !important; }
      `}</style>

      <header style={s.header}>
        <div style={isMobile ? s.navMobile : s.navDesktop}>
          <Link to="/" style={s.logo} className="nav-logo">
            Swedmarks<span style={s.logoGold}> Bil</span>
          </Link>

          {!isMobile && (
            <nav style={s.centerLinks}>
              <div ref={triggerRef} style={{ position: "relative" }}>
                <button
                  style={{ ...s.navBtn, ...(dropdownOpen ? { color: "#c9a961" } : {}) }}
                  onClick={() => setDropdownOpen((o) => !o)}
                  onMouseEnter={() => setDropdownOpen(true)}
                  aria-expanded={dropdownOpen}
                >
                  Bilar <ChevronIcon rotated={dropdownOpen} />
                </button>

                {dropdownOpen && (
                  <div style={s.dropdownWrapper} onMouseLeave={() => { setDropdownOpen(false); setHovered(null); }}>
                    <div style={s.dropdownCard}>
                      <p style={s.dropdownHeading}>Välj karosstyp</p>
                      {CAR_CATEGORIES.map((cat, i) => (
                        <Link
                          key={cat.label}
                          to={cat.bodyType ? `/?bodyType=${cat.bodyType}` : "/"}
                          onClick={() => setDropdownOpen(false)}
                          style={{ ...s.dropdownItem, ...(hovered === `cat${i}` ? s.dropdownItemHover : {}) }}
                          {...hover(`cat${i}`)}
                        >
                          <span style={s.dropdownLabel}>{cat.label}</span>
                          <span style={s.dropdownSub}>{cat.sub}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link to="/" style={navLinkStyle("catalog")} {...hover("catalog")}>Katalog</Link>

              <Link
                to="/favorites"
                style={{ ...navLinkStyle("favorites"), display: "inline-flex", alignItems: "center", gap: "5px" }}
                {...hover("favorites")}
              >
                <HeartNavIcon /> Favoriter
                {favCount > 0 && (
                  <span style={s.favBadge}>{favCount}</span>
                )}
              </Link>

              <Link to="/contact" style={navLinkStyle("contact")} {...hover("contact")}>Kontakt</Link>
            </nav>
          )}

          {!isMobile && (
            <div style={s.rightActions}>
              <div style={s.searchWrap}>
                <svg style={s.searchIcon} viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="rgba(201,169,97,0.45)" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="nav-search"
                  style={s.searchInput}
                  placeholder="Sök bil..."
                  value={searchValue}
                  onChange={handleSearchChange}
                />
                {searchValue && (
                  <button style={s.clearBtn} onClick={clearSearch} aria-label="Rensa">
                    <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="rgba(201,169,97,0.6)" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              {user ? (
                <>
                  {user.isAdmin && (
                    <Link to="/admin" style={navLinkStyle("admin")} {...hover("admin")}>Admin</Link>
                  )}
                  <Link
                    to="/logout"
                    style={{ ...s.ghostBtn, ...(hovered === "logout" ? s.ghostBtnHover : {}) }}
                    {...hover("logout")}
                  >
                    Logga ut
                  </Link>
                </>
              ) : (
                <Link
                  to="/login"
                  style={{ ...s.loginBtn, ...(hovered === "login" ? s.loginBtnHover : {}) }}
                  {...hover("login")}
                >
                  Logga in
                </Link>
              )}
            </div>
          )}

          {isMobile && (
            <button style={s.hamburgerBtn} className="nav-hamburger" onClick={() => setMenuOpen((o) => !o)} aria-label="Meny">
              <HamburgerIcon open={menuOpen} />
            </button>
          )}
        </div>

        {isMobile && (
          <div style={{ ...s.mobileMenu, maxHeight: menuOpen ? "600px" : "0", opacity: menuOpen ? 1 : 0, overflow: "hidden", transition: "max-height 0.32s ease, opacity 0.22s ease" }}>
            <div style={s.mobileSearchWrap}>
              <svg style={s.mobileSearchIcon} viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="rgba(201,169,97,0.4)" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input className="mob-search mob-search-input" style={s.mobileSearchInput} placeholder="Sök bil..." value={searchValue} onChange={handleSearchChange} />
            </div>

            {CAR_CATEGORIES.map((cat) => (
              <Link key={cat.label} to={cat.bodyType ? `/?bodyType=${cat.bodyType}` : "/"} style={s.mobileLink} className="mob-link-touch" onClick={() => setMenuOpen(false)}>
                <span style={s.mobileLinkLabel}>{cat.label}</span>
                <span style={s.mobileLinkSub}>{cat.sub}</span>
              </Link>
            ))}

            <div style={s.mobileDivider} />

            <Link to="/favorites" style={s.mobileLink} onClick={() => setMenuOpen(false)}>
              <span style={{ ...s.mobileLinkLabel, display: "flex", alignItems: "center", gap: "6px" }}>
                <HeartNavIcon /> Favoriter
                {favCount > 0 && <span style={s.favBadge}>{favCount}</span>}
              </span>
            </Link>

            <Link to="/contact" style={s.mobileLink} onClick={() => setMenuOpen(false)}>
              <span style={s.mobileLinkLabel}>Kontakt</span>
            </Link>

            {user ? (
              <>
                {user.isAdmin && (
                  <Link to="/admin" style={s.mobileLink} onClick={() => setMenuOpen(false)}>
                    <span style={{ ...s.mobileLinkLabel, color: "#c9a961" }}>Admin</span>
                  </Link>
                )}
                <Link to="/logout" style={{ ...s.mobileLink, opacity: 0.55 }} onClick={() => setMenuOpen(false)}>
                  <span style={s.mobileLinkLabel}>Logga ut</span>
                </Link>
              </>
            ) : (
              <Link to="/login" style={s.mobileLink} onClick={() => setMenuOpen(false)}>
                <span style={{ ...s.mobileLinkLabel, color: "#c9a961" }}>Logga in</span>
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
}

const s = {
  header: {
    backgroundColor: "#0a0e27",
    borderBottom: "1px solid rgba(201,169,97,0.18)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
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
    fontSize: "1.3rem",
    fontWeight: 800,
    color: "#ffffff",
    textDecoration: "none",
    letterSpacing: "-0.02em",
    justifySelf: "start",
  },
  logoGold: {
    color: "#c9a961",
    fontWeight: 300,
  },
  centerLinks: {
    display: "flex",
    alignItems: "center",
    gap: "0.1rem",
    justifyContent: "center",
  },
  navLink: {
    color: "rgba(224,224,224,0.72)",
    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: 500,
    padding: "0.45rem 0.85rem",
    borderRadius: "6px",
    transition: "color 0.18s",
    display: "inline-block",
    letterSpacing: "0.01em",
  },
  navLinkHover: {
    color: "#c9a961",
  },
  navBtn: {
    background: "none",
    border: "none",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
    color: "rgba(224,224,224,0.72)",
    fontSize: "0.875rem",
    fontWeight: 500,
    padding: "0.45rem 0.85rem",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontFamily: "inherit",
    transition: "color 0.18s",
  },
  rightActions: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    justifyContent: "flex-end",
  },
  searchWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "0.65rem",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  searchInput: {
    width: "160px",
    backgroundColor: "rgba(201,169,97,0.07)",
    border: "1px solid rgba(201,169,97,0.18)",
    borderRadius: "20px",
    padding: "0.35rem 1.8rem 0.35rem 2rem",
    fontSize: "0.82rem",
    color: "#e0e0e0",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.18s, background-color 0.18s",
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
  },
  ghostBtn: {
    color: "rgba(201,169,97,0.8)",
    textDecoration: "none",
    fontSize: "0.82rem",
    fontWeight: 600,
    padding: "0.38rem 0.85rem",
    border: "1px solid rgba(201,169,97,0.3)",
    borderRadius: "6px",
    display: "inline-block",
    transition: "color 0.18s, border-color 0.18s",
    cursor: "pointer",
    letterSpacing: "0.01em",
  },
  ghostBtnHover: {
    color: "#c9a961",
    borderColor: "rgba(201,169,97,0.65)",
  },
  loginBtn: {
    backgroundColor: "#c9a961",
    color: "#0a0e27",
    textDecoration: "none",
    fontSize: "0.82rem",
    fontWeight: 700,
    padding: "0.42rem 1.1rem",
    borderRadius: "6px",
    border: "none",
    display: "inline-block",
    transition: "opacity 0.18s",
    cursor: "pointer",
    letterSpacing: "0.02em",
  },
  loginBtnHover: {
    opacity: 0.85,
  },

  // Dropdown
  dropdownWrapper: {
    position: "absolute",
    top: "calc(100% + 12px)",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 200,
    animation: "dd-in 0.18s ease both",
  },
  dropdownCard: {
    backgroundColor: "#0f1335",
    border: "1px solid rgba(201,169,97,0.2)",
    borderRadius: "12px",
    boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
    minWidth: "240px",
    padding: "0.5rem",
  },
  dropdownHeading: {
    fontSize: "0.65rem",
    fontWeight: 700,
    color: "rgba(201,169,97,0.5)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    padding: "0.4rem 0.85rem 0.6rem",
    margin: 0,
  },
  dropdownItem: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    textDecoration: "none",
    padding: "0.55rem 0.85rem",
    borderRadius: "8px",
    transition: "background-color 0.12s",
  },
  dropdownItemHover: {
    backgroundColor: "rgba(201,169,97,0.08)",
  },
  dropdownLabel: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#e0e0e0",
  },
  dropdownSub: {
    fontSize: "0.72rem",
    color: "#6b6b7e",
  },

  // Hamburger
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

  // Mobile menu
  mobileMenu: {
    backgroundColor: "#0a0e27",
    borderTop: "1px solid rgba(201,169,97,0.12)",
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
    backgroundColor: "rgba(201,169,97,0.07)",
    border: "1px solid rgba(201,169,97,0.18)",
    borderRadius: "20px",
    padding: "0.5rem 1rem 0.5rem 2.25rem",
    fontSize: "0.9rem",
    color: "#e0e0e0",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  mobileLink: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    textDecoration: "none",
    padding: "0.85rem 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  mobileLinkLabel: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "rgba(224,224,224,0.88)",
  },
  mobileLinkSub: {
    fontSize: "0.75rem",
    color: "#6b6b7e",
  },
  mobileDivider: {
    height: "1px",
    backgroundColor: "rgba(201,169,97,0.15)",
    margin: "0.5rem 0",
  },
  favBadge: {
    backgroundColor: "rgba(201,169,97,0.18)",
    color: "#c9a961",
    fontSize: "0.68rem",
    fontWeight: 700,
    borderRadius: "20px",
    padding: "0.1rem 0.45rem",
    border: "1px solid rgba(201,169,97,0.28)",
    letterSpacing: "0.02em",
    lineHeight: 1.4,
  },
};
