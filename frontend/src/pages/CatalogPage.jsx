import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAllCars } from "../services/api";
import Toast, { useToast } from "../components/Toast";
const logoImg = "/logo.png";

// ── Hero ────────────────────────────────────────────────────────────

function HeroSection() {
  const heroRef   = useRef(null);
  const logoRef   = useRef(null);
  const tagRef    = useRef(null);
  const indRef    = useRef(null);

  // Entrance animation via JS (avoids CSS-animation / inline-style conflict)
  useEffect(() => {
    const logo = logoRef.current;
    const tag  = tagRef.current;
    if (!logo || !tag) return;

    logo.style.opacity   = "0";
    logo.style.transform = "translate(-50%, -50%) scale(0.9)";
    logo.style.transition = "opacity 1.2s ease, transform 1.2s ease";
    tag.style.opacity    = "0";
    tag.style.transform  = "translateX(-50%) translateY(14px)";
    tag.style.transition  = "opacity 0.9s ease 0.9s, transform 0.9s ease 0.9s";

    const t = setTimeout(() => {
      if (logo) {
        logo.style.opacity   = "1";
        logo.style.transform = "translate(-50%, -50%) scale(1)";
      }
      if (tag) {
        tag.style.opacity   = "1";
        tag.style.transform = "translateX(-50%) translateY(0)";
      }
    }, 60);
    return () => clearTimeout(t);
  }, []);

  // Scroll-driven parallax (direct DOM for perf — no re-renders)
  useEffect(() => {
    const onScroll = () => {
      const h = heroRef.current?.offsetHeight || window.innerHeight;
      const p = Math.min(window.scrollY / h, 1);

      const logo = logoRef.current;
      if (logo) {
        const scale = 1 - p * 0.28;
        const ty    = p * 70;
        const op    = Math.max(0, 1 - p * 1.8);
        logo.style.transition = "none";
        logo.style.transform  = `translate(-50%, calc(-50% - ${ty}px)) scale(${scale})`;
        logo.style.opacity    = op;
      }
      const tag = tagRef.current;
      if (tag) {
        tag.style.transition = "none";
        tag.style.opacity    = Math.max(0, 1 - p * 3.5);
      }
      const ind = indRef.current;
      if (ind) {
        ind.style.opacity = Math.max(0, 1 - p * 6);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={heroRef}
      style={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#0a0e27",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <style>{`
        @keyframes scrollPulse {
          0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.45; }
          50%       { transform: translateX(-50%) translateY(9px); opacity: 0.7; }
        }
      `}</style>

      {/* Subtle radial glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 70% 55% at 50% 46%, rgba(201,169,97,0.055) 0%, transparent 65%)",
      }} />

      {/* Logo — positioned absolute for parallax */}
      <div
        ref={logoRef}
        style={{
          position: "absolute",
          top: "48%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          willChange: "transform, opacity",
        }}
      >
        <img
          src={logoImg}
          alt="Swedmarks Bil"
          style={{ width: "min(500px, 84vw)", height: "auto", display: "block" }}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "block";
          }}
        />
        {/* Fallback text if logo.png not found */}
        <div style={{ display: "none", textAlign: "center" }}>
          <p style={{ fontSize: "clamp(2rem,8vw,4rem)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
            SWEDMARKS
          </p>
          <p style={{ fontSize: "clamp(1.2rem,4vw,2rem)", color: "#c9a961", fontWeight: 300, letterSpacing: "0.3em", marginTop: "0.3rem" }}>
            BIL
          </p>
        </div>
      </div>

      {/* Tagline */}
      <div
        ref={tagRef}
        style={{
          position: "absolute",
          bottom: "24%",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          willChange: "opacity",
          whiteSpace: "nowrap",
        }}
      >
        <p style={{
          color: "#c9a961",
          fontSize: "0.68rem",
          fontWeight: 700,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          margin: 0,
        }}>
          Explore the finest
        </p>
      </div>

      {/* Scroll indicator */}
      <div
        ref={indRef}
        style={{
          position: "absolute",
          bottom: "2.25rem",
          left: "50%",
          animation: "scrollPulse 2.2s ease-in-out infinite",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <span style={{ color: "rgba(201,169,97,0.45)", fontSize: "0.58rem", letterSpacing: "0.25em", textTransform: "uppercase" }}>
          Scroll
        </span>
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="rgba(201,169,97,0.45)" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Gold line at bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(201,169,97,0.45), transparent)",
      }} />
    </section>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────

function HeartIcon({ filled }) {
  return filled ? (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="#c9a961">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#c9a961" strokeWidth="2">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function formatMileage(km) { return km.toLocaleString("sv-SE") + " km"; }
function formatPrice(price) { return price.toLocaleString("sv-SE") + " kr"; }
function loadFavorites() {
  try { return JSON.parse(localStorage.getItem("favorites") || "[]"); }
  catch { return []; }
}

const EMPTY_FILTERS = { search: "", brand: "", fuel: "", bodyType: "", yearMin: "", yearMax: "", priceMin: "", priceMax: "" };

// ── CatalogPage ───────────────────────────────────────────────────────

export default function CatalogPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showToast, toastMsg] = useToast();

  const [cars, setCars]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [favorites, setFavs]    = useState(loadFavorites);
  const [hoveredCard, setHover] = useState(null);
  const [filterOpen, setFilterOpen] = useState(() => window.innerWidth > 768);
  const [sortBy, setSortBy]     = useState("");
  const [displayCount, setDisplayCount] = useState(12);
  const [filters, setFilters]   = useState({
    ...EMPTY_FILTERS,
    bodyType: searchParams.get("bodyType") || "",
    search:   searchParams.get("search")   || "",
  });

  useEffect(() => {
    const bt = searchParams.get("bodyType") || "";
    const s  = searchParams.get("search")   || "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters((p) => (p.bodyType === bt && p.search === s ? p : { ...p, bodyType: bt, search: s }));
  }, [searchParams]);

  useEffect(() => {
    const check = () => { if (window.innerWidth > 768) setFilterOpen(true); };
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    document.title = "Bilar till salu | Swedmarks Bil";
    return () => { document.title = "Swedmarks Bil – Lyxiga bilar i Helsingborg"; };
  }, []);

  useEffect(() => {
    getAllCars()
      .then((d) => setCars(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const uniqueBrands    = [...new Set(cars.map((c) => c.brand).filter(Boolean))].sort();
  const uniqueBodyTypes = [...new Set(cars.map((c) => c.bodyType).filter(Boolean))].sort();

  const filteredCars = cars.filter((c) => {
    if (c.status === "sold") return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!c.brand?.toLowerCase().includes(q) && !c.model?.toLowerCase().includes(q) &&
          !c.title?.toLowerCase().includes(q) && !String(c.year).includes(q)) return false;
    }
    if (filters.brand    && c.brand?.toLowerCase()    !== filters.brand.toLowerCase())    return false;
    if (filters.fuel     && c.fuel?.toLowerCase()     !== filters.fuel.toLowerCase())     return false;
    if (filters.bodyType && c.bodyType?.toLowerCase() !== filters.bodyType.toLowerCase()) return false;
    if (filters.yearMin  && c.year  < Number(filters.yearMin))  return false;
    if (filters.yearMax  && c.year  > Number(filters.yearMax))  return false;
    if (filters.priceMin && c.price < Number(filters.priceMin)) return false;
    if (filters.priceMax && c.price > Number(filters.priceMax)) return false;
    return true;
  });

  const sortedCars = [...filteredCars].sort((a, b) => {
    if (sortBy === "price-asc")  return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "year-desc")  return b.year  - a.year;
    if (sortBy === "year-asc")   return a.year  - b.year;
    return 0;
  });

  const visibleCars = sortedCars.slice(0, displayCount);
  const hasMore = displayCount < sortedCars.length;

  const activeCount = Object.values(filters).filter(Boolean).length;
  const setF = (k, v) => { setFilters((p) => ({ ...p, [k]: v })); setDisplayCount(12); };

  function reset() {
    setFilters(EMPTY_FILTERS);
    setDisplayCount(12);
    navigate("/", { replace: true });
  }

  function toggleFav(id) {
    setFavs((p) => {
      const adding = !p.includes(id);
      const n = adding ? [...p, id] : p.filter((f) => f !== id);
      localStorage.setItem("favorites", JSON.stringify(n));
      window.dispatchEvent(new Event("favoritesChanged"));
      showToast(adding ? "Tillagd i favoriter" : "Borttagen från favoriter");
      return n;
    });
  }

  return (
    <div style={{ background: "#0a0e27", minHeight: "100vh" }}>
      <style>{`
        .filter-input::placeholder { color: rgba(201,169,97,0.3); }
        .filter-input:focus { border-color: rgba(201,169,97,0.45) !important; background: rgba(201,169,97,0.07) !important; outline: none; }
        .filter-select:focus { border-color: rgba(201,169,97,0.45) !important; outline: none; }
        .car-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,169,97,0.15) !important; transform: translateY(-3px) !important; }

        .filter-toggle-row { display: none; }
        .filter-body { display: flex; flex-direction: column; gap: 0.75rem; }
        .filter-body--closed { display: flex; }

        @media (max-width: 768px) {
          .catalog-section { padding: 2rem 0.85rem 3rem !important; }
          .filter-panel { padding: 0.85rem 1rem !important; }
          .filter-toggle-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            min-height: 44px;
          }
          .filter-toggle-btn {
            margin-left: auto;
            background: none;
            border: 1px solid rgba(201,169,97,0.3);
            border-radius: 6px;
            color: #c9a961;
            padding: 0.35rem 0.85rem;
            font-size: 0.78rem;
            font-weight: 600;
            cursor: pointer;
            font-family: inherit;
            min-height: 44px;
          }
          .filter-body { display: none; }
          .filter-body--open { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.75rem; }
          .catalog-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 1rem !important; }
          .filter-input, .filter-select { min-height: 44px !important; }
          .reset-btn { min-height: 44px !important; }
        }
        @media (max-width: 480px) {
          .catalog-grid { grid-template-columns: 1fr !important; gap: 0.85rem !important; }
          .range-group { flex-wrap: wrap !important; }
        }
      `}</style>

      <HeroSection />

      {/* Catalog section */}
      <section style={{ maxWidth: "1240px", margin: "0 auto", padding: "3.5rem 1.25rem 4rem" }} className="catalog-section">
        <h2 style={s.sectionTitle}>Våra bilar</h2>

        {/* Filter panel */}
        <div style={s.filterPanel} className="filter-panel">
          {/* Mobile toggle header */}
          <div className="filter-toggle-row">
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#c9a961" }}>Filter</span>
            {activeCount > 0 && (
              <span style={{ fontSize: "0.72rem", color: "#c9a961", backgroundColor: "rgba(201,169,97,0.12)", borderRadius: "20px", padding: "0.15rem 0.55rem", border: "1px solid rgba(201,169,97,0.25)" }}>
                {activeCount} aktiva
              </span>
            )}
            <button className="filter-toggle-btn" onClick={() => setFilterOpen((o) => !o)} aria-expanded={filterOpen}>
              {filterOpen ? "▲ Dölj" : "▼ Visa filter"}
            </button>
          </div>

          <div className={filterOpen ? "filter-body filter-body--open" : "filter-body"}>
            <div style={s.filterRow}>
              <div style={s.searchWrap}>
                <svg style={s.searchIcon} viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="rgba(201,169,97,0.4)" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="filter-input"
                  style={s.searchInput}
                  placeholder="Sök märke, modell, år..."
                  value={filters.search}
                  onChange={(e) => setF("search", e.target.value)}
                />
              </div>
              <select className="filter-select" style={s.select} value={filters.brand} onChange={(e) => setF("brand", e.target.value)}>
                <option value="">Alla märken</option>
                {uniqueBrands.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <select className="filter-select" style={s.select} value={filters.fuel} onChange={(e) => setF("fuel", e.target.value)}>
                <option value="">Alla drivmedel</option>
                {["Bensin","Diesel","El","Hybrid"].map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              <select className="filter-select" style={s.select} value={filters.bodyType} onChange={(e) => setF("bodyType", e.target.value)}>
                <option value="">Alla karosserier</option>
                {uniqueBodyTypes.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
              </select>
            </div>

            <div style={s.filterRow}>
              <div style={s.rangeGroup} className="range-group">
                <span style={s.rangeLabel}>År</span>
                <input className="filter-input" style={s.rangeInput} type="number" placeholder="Från" value={filters.yearMin} onChange={(e) => setF("yearMin", e.target.value)} min="1900" max="2099" />
                <span style={s.rangeSep}>–</span>
                <input className="filter-input" style={s.rangeInput} type="number" placeholder="Till" value={filters.yearMax} onChange={(e) => setF("yearMax", e.target.value)} min="1900" max="2099" />
              </div>
              <div style={s.rangeGroup} className="range-group">
                <span style={s.rangeLabel}>Pris (kr)</span>
                <input className="filter-input" style={s.rangeInput} type="number" placeholder="Från" value={filters.priceMin} onChange={(e) => setF("priceMin", e.target.value)} min="0" />
                <span style={s.rangeSep}>–</span>
                <input className="filter-input" style={s.rangeInput} type="number" placeholder="Till" value={filters.priceMax} onChange={(e) => setF("priceMax", e.target.value)} min="0" />
              </div>
              {activeCount > 0 && (
                <button style={s.resetBtn} className="reset-btn" onClick={reset}>
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Återställ ({activeCount})
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <p style={{ ...s.resultCount, marginBottom: 0 }}>
            {loading ? "Laddar..." : `${sortedCars.length} ${sortedCars.length === 1 ? "bil" : "bilar"}${activeCount > 0 ? " matchar" : ""}`}
          </p>
          <select
            className="filter-select"
            style={{ ...s.select, flex: "0 0 auto", minWidth: "160px" }}
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setDisplayCount(12); }}
          >
            <option value="">Sortering</option>
            <option value="price-asc">Pris: lägst först</option>
            <option value="price-desc">Pris: högst först</option>
            <option value="year-desc">År: nyast först</option>
            <option value="year-asc">År: äldst först</option>
          </select>
        </div>

        {error && <p style={s.errorText}>{error}</p>}

        {!loading && !error && sortedCars.length === 0 && (
          <p style={s.emptyText}>Inga bilar hittades med valda filter.</p>
        )}

        {!loading && sortedCars.length > 0 && (
          <div style={s.grid} className="catalog-grid">
            {visibleCars.map((car) => {
              const isFav  = favorites.includes(car._id);
              const imgSrc = car.images?.[0] || null;
              return (
                <article
                  key={car._id}
                  className="car-card"
                  style={{
                    ...s.card,
                    ...(hoveredCard === car._id ? s.cardHover : {}),
                  }}
                  onMouseEnter={() => setHover(car._id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => navigate(`/cars/${car._id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/cars/${car._id}`)}
                >
                  <div style={s.imageWrap}>
                    {imgSrc ? (
                      <img src={imgSrc} alt={`${car.brand} ${car.model}`} style={s.image} />
                    ) : (
                      <div style={s.imagePlaceholder}>Ingen bild</div>
                    )}
                    {/* Gold gradient overlay */}
                    <div style={s.imageGradient} />
                    <button
                      style={s.heartBtn}
                      onClick={(e) => { e.stopPropagation(); toggleFav(car._id); }}
                      aria-label={isFav ? "Ta bort från favoriter" : "Lägg till i favoriter"}
                    >
                      <HeartIcon filled={isFav} />
                    </button>
                  </div>
                  <div style={s.info}>
                    <h2 style={s.carTitle}>{car.brand} {car.model}</h2>
                    <span style={s.carYear}>{car.year} · {car.fuel || ""}</span>
                    <div style={s.carDetails}>
                      <span style={s.carMileage}>{formatMileage(car.mileage)}</span>
                      <span style={s.carPrice}>{formatPrice(car.price)}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {hasMore && (
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <button
              style={s.loadMoreBtn}
              onClick={() => setDisplayCount((n) => n + 12)}
            >
              Ladda fler ({sortedCars.length - displayCount} kvar)
            </button>
          </div>
        )}
      </section>

      <Toast message={toastMsg} />
    </div>
  );
}

const s = {
  sectionTitle: {
    fontSize: "1.6rem",
    fontWeight: 700,
    color: "#ffffff",
    marginBottom: "1.75rem",
    letterSpacing: "-0.02em",
  },

  // Filter
  filterPanel: {
    backgroundColor: "#0f1335",
    border: "1px solid rgba(201,169,97,0.15)",
    borderRadius: "10px",
    padding: "1rem 1.25rem",
    marginBottom: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  filterRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.6rem",
    alignItems: "center",
  },
  searchWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    flex: "1 1 200px",
    minWidth: "160px",
  },
  searchIcon: {
    position: "absolute",
    left: "0.65rem",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    border: "1px solid rgba(201,169,97,0.18)",
    borderRadius: "7px",
    padding: "0.5rem 0.75rem 0.5rem 2rem",
    fontSize: "0.875rem",
    color: "#e0e0e0",
    backgroundColor: "#1a1f3a",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.18s, background 0.18s",
  },
  select: {
    flex: "1 1 140px",
    minWidth: "120px",
    border: "1px solid rgba(201,169,97,0.18)",
    borderRadius: "7px",
    padding: "0.5rem 0.6rem",
    fontSize: "0.875rem",
    color: "#e0e0e0",
    backgroundColor: "#1a1f3a",
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "border-color 0.18s",
  },
  rangeGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    flex: "1 1 200px",
    minWidth: "180px",
  },
  rangeLabel: {
    fontSize: "0.72rem",
    fontWeight: 600,
    color: "rgba(201,169,97,0.55)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
    minWidth: "52px",
  },
  rangeInput: {
    flex: 1,
    border: "1px solid rgba(201,169,97,0.18)",
    borderRadius: "7px",
    padding: "0.5rem 0.5rem",
    fontSize: "0.875rem",
    color: "#e0e0e0",
    backgroundColor: "#1a1f3a",
    fontFamily: "inherit",
    minWidth: 0,
    width: "80px",
    transition: "border-color 0.18s, background 0.18s",
  },
  rangeSep: {
    color: "rgba(201,169,97,0.4)",
    fontSize: "0.85rem",
    flexShrink: 0,
  },
  resetBtn: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    background: "none",
    border: "1px solid rgba(201,169,97,0.25)",
    borderRadius: "7px",
    padding: "0.45rem 0.85rem",
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "#c9a961",
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    transition: "border-color 0.18s, background 0.18s",
  },
  resultCount: {
    fontSize: "0.82rem",
    color: "#6b6b7e",
    marginBottom: "1.25rem",
    marginTop: 0,
  },
  errorText: {
    color: "#ef4444",
    textAlign: "center",
    marginTop: "3rem",
  },
  emptyText: {
    color: "#6b6b7e",
    textAlign: "center",
    marginTop: "4rem",
    fontSize: "1rem",
  },

  // Grid & cards
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.75rem",
  },
  card: {
    backgroundColor: "#0f1335",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "10px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "box-shadow 0.25s ease, transform 0.2s ease",
    cursor: "pointer",
  },
  cardHover: {
    boxShadow: "0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,169,97,0.15)",
    transform: "translateY(-3px)",
  },
  imageWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: "16/9",
    backgroundColor: "#1a1f3a",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.4s ease",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
    background: "linear-gradient(to top, rgba(10,14,39,0.7), transparent)",
    pointerEvents: "none",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b6b7e",
    fontSize: "0.875rem",
  },
  heartBtn: {
    position: "absolute",
    top: "0.6rem",
    right: "0.6rem",
    background: "rgba(10,14,39,0.7)",
    backdropFilter: "blur(4px)",
    border: "1px solid rgba(201,169,97,0.2)",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
    transition: "background 0.18s, border-color 0.18s",
  },
  info: {
    padding: "1.1rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    flex: 1,
  },
  carTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#ffffff",
    letterSpacing: "-0.01em",
  },
  carYear: {
    fontSize: "0.82rem",
    color: "#6b6b7e",
  },
  carDetails: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "0.4rem",
  },
  carMileage: {
    fontSize: "0.82rem",
    color: "#a0a0b0",
  },
  carPrice: {
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "#c9a961",
    letterSpacing: "-0.01em",
  },
  loadMoreBtn: {
    backgroundColor: "transparent",
    border: "1px solid rgba(201,169,97,0.35)",
    borderRadius: "8px",
    padding: "0.75rem 2.5rem",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#c9a961",
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.02em",
    transition: "border-color 0.18s, background 0.18s",
  },
};
