import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAllCars } from "../services/api";

function HeartIcon({ filled }) {
  return filled ? (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="#285570" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#285570" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function formatMileage(km) {
  return km.toLocaleString("sv-SE") + " km";
}

function formatPrice(price) {
  return price.toLocaleString("sv-SE") + " kr";
}

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem("favorites") || "[]");
  } catch {
    return [];
  }
}

const EMPTY_FILTERS = {
  search: "",
  brand: "",
  fuel: "",
  bodyType: "",
  yearMin: "",
  yearMax: "",
  priceMin: "",
  priceMax: "",
};

export default function CatalogPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(loadFavorites);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [filters, setFilters] = useState({
    ...EMPTY_FILTERS,
    bodyType: searchParams.get("bodyType") || "",
    search: searchParams.get("search") || "",
  });

  // Sync URL params → filter state when Navbar updates them
  useEffect(() => {
    const bt = searchParams.get("bodyType") || "";
    const s = searchParams.get("search") || "";
    setFilters((prev) => {
      if (prev.bodyType === bt && prev.search === s) return prev;
      return { ...prev, bodyType: bt, search: s };
    });
  }, [searchParams]);

  useEffect(() => {
    getAllCars()
      .then((data) => setCars(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const uniqueBrands = [...new Set(cars.map((c) => c.brand).filter(Boolean))].sort();
  const uniqueBodyTypes = [...new Set(cars.map((c) => c.bodyType).filter(Boolean))].sort();

  const filteredCars = cars.filter((c) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matches =
        c.brand?.toLowerCase().includes(q) ||
        c.model?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q) ||
        String(c.year).includes(q);
      if (!matches) return false;
    }
    if (filters.brand && c.brand?.toLowerCase() !== filters.brand.toLowerCase()) return false;
    if (filters.fuel && c.fuel?.toLowerCase() !== filters.fuel.toLowerCase()) return false;
    if (filters.bodyType && c.bodyType?.toLowerCase() !== filters.bodyType.toLowerCase()) return false;
    if (filters.yearMin && c.year < Number(filters.yearMin)) return false;
    if (filters.yearMax && c.year > Number(filters.yearMax)) return false;
    if (filters.priceMin && c.price < Number(filters.priceMin)) return false;
    if (filters.priceMax && c.price > Number(filters.priceMax)) return false;
    return true;
  });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS);
    navigate("/", { replace: true });
  }

  function toggleFavorite(id) {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem("favorites", JSON.stringify(next));
      return next;
    });
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <p style={styles.status}>Laddar bilar...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={styles.page}>
        <p style={styles.error}>{error}</p>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <h1 style={styles.heading}>Bilkatalog</h1>

      {/* ── Filter panel ── */}
      <div style={styles.filterPanel}>
        {/* Row 1 */}
        <div style={styles.filterRow}>
          <div style={styles.searchWrap}>
            <svg style={styles.searchIcon} viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#cbcac7" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              style={styles.searchInput}
              placeholder="Sök märke, modell, år..."
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
            />
          </div>

          <select style={styles.select} value={filters.brand} onChange={(e) => setFilter("brand", e.target.value)}>
            <option value="">Alla märken</option>
            {uniqueBrands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>

          <select style={styles.select} value={filters.fuel} onChange={(e) => setFilter("fuel", e.target.value)}>
            <option value="">Alla drivmedel</option>
            {["Bensin", "Diesel", "El", "Hybrid"].map((f) => <option key={f} value={f}>{f}</option>)}
          </select>

          <select style={styles.select} value={filters.bodyType} onChange={(e) => setFilter("bodyType", e.target.value)}>
            <option value="">Alla karosserier</option>
            {uniqueBodyTypes.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
          </select>
        </div>

        {/* Row 2 */}
        <div style={styles.filterRow}>
          <div style={styles.rangeGroup}>
            <span style={styles.rangeLabel}>År</span>
            <input
              style={styles.rangeInput}
              type="number"
              placeholder="Från"
              value={filters.yearMin}
              onChange={(e) => setFilter("yearMin", e.target.value)}
              min="1900"
              max="2099"
            />
            <span style={styles.rangeSep}>–</span>
            <input
              style={styles.rangeInput}
              type="number"
              placeholder="Till"
              value={filters.yearMax}
              onChange={(e) => setFilter("yearMax", e.target.value)}
              min="1900"
              max="2099"
            />
          </div>

          <div style={styles.rangeGroup}>
            <span style={styles.rangeLabel}>Pris (kr)</span>
            <input
              style={styles.rangeInput}
              type="number"
              placeholder="Från"
              value={filters.priceMin}
              onChange={(e) => setFilter("priceMin", e.target.value)}
              min="0"
            />
            <span style={styles.rangeSep}>–</span>
            <input
              style={styles.rangeInput}
              type="number"
              placeholder="Till"
              value={filters.priceMax}
              onChange={(e) => setFilter("priceMax", e.target.value)}
              min="0"
            />
          </div>

          {activeFilterCount > 0 && (
            <button style={styles.resetBtn} onClick={resetFilters}>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Återställ ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      <p style={styles.resultCount}>
        {filteredCars.length} {filteredCars.length === 1 ? "bil" : "bilar"}
        {activeFilterCount > 0 ? " matchar dina filter" : " totalt"}
      </p>

      {filteredCars.length === 0 ? (
        <p style={styles.status}>Inga bilar hittades med valda filter.</p>
      ) : (
        <div style={styles.grid}>
          {filteredCars.map((car) => {
            const isFav = favorites.includes(car._id);
            const imgSrc = car.images?.[0] || null;
            return (
              <article
                key={car._id}
                style={{
                  ...styles.card,
                  ...(hoveredCard === car._id ? styles.cardHover : {}),
                }}
                onMouseEnter={() => setHoveredCard(car._id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => navigate(`/cars/${car._id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate(`/cars/${car._id}`)}
              >
                <div style={styles.imageWrap}>
                  {imgSrc ? (
                    <img src={imgSrc} alt={`${car.brand} ${car.model}`} style={styles.image} />
                  ) : (
                    <div style={styles.imagePlaceholder}>Ingen bild</div>
                  )}
                  <button
                    style={styles.heartBtn}
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(car._id); }}
                    aria-label={isFav ? "Ta bort från favoriter" : "Lägg till i favoriter"}
                  >
                    <HeartIcon filled={isFav} />
                  </button>
                </div>
                <div style={styles.info}>
                  <h2 style={styles.title}>{car.brand} {car.model}</h2>
                  <span style={styles.year}>{car.year}</span>
                  <div style={styles.details}>
                    <span style={styles.mileage}>{formatMileage(car.mileage)}</span>
                    <span style={styles.price}>{formatPrice(car.price)}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

const styles = {
  page: {
    padding: "2rem 1rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  heading: {
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#285570",
    marginBottom: "1.25rem",
  },

  // ── Filter panel ──
  filterPanel: {
    backgroundColor: "#ffffff",
    border: "1px solid #e3ded7",
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
    border: "1px solid #e3ded7",
    borderRadius: "7px",
    padding: "0.5rem 0.75rem 0.5rem 2rem",
    fontSize: "0.875rem",
    color: "#333333",
    backgroundColor: "#faf7f6",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  select: {
    flex: "1 1 140px",
    minWidth: "120px",
    border: "1px solid #e3ded7",
    borderRadius: "7px",
    padding: "0.5rem 0.65rem",
    fontSize: "0.875rem",
    color: "#333333",
    backgroundColor: "#faf7f6",
    outline: "none",
    fontFamily: "inherit",
    cursor: "pointer",
  },
  rangeGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    flex: "1 1 200px",
    minWidth: "180px",
  },
  rangeLabel: {
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "#cbcac7",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
    minWidth: "52px",
  },
  rangeInput: {
    flex: 1,
    border: "1px solid #e3ded7",
    borderRadius: "7px",
    padding: "0.5rem 0.5rem",
    fontSize: "0.875rem",
    color: "#333333",
    backgroundColor: "#faf7f6",
    outline: "none",
    fontFamily: "inherit",
    minWidth: 0,
    width: "80px",
  },
  rangeSep: {
    color: "#cbcac7",
    fontSize: "0.85rem",
    flexShrink: 0,
  },
  resetBtn: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginLeft: "auto",
    background: "none",
    border: "1px solid #e3ded7",
    borderRadius: "7px",
    padding: "0.45rem 0.85rem",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#285570",
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    transition: "background-color 0.15s, border-color 0.15s",
  },

  resultCount: {
    fontSize: "0.85rem",
    color: "#cbcac7",
    marginBottom: "1rem",
    marginTop: 0,
  },
  status: {
    textAlign: "center",
    color: "#cbcac7",
    marginTop: "4rem",
    fontSize: "1rem",
  },
  error: {
    textAlign: "center",
    color: "#b00020",
    marginTop: "4rem",
    fontSize: "1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e3ded7",
    borderRadius: "8px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "box-shadow 0.2s, transform 0.15s",
    cursor: "pointer",
  },
  cardHover: {
    boxShadow: "0 8px 28px rgba(40,85,112,0.13)",
    transform: "translateY(-2px)",
  },
  imageWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: "16/9",
    backgroundColor: "#e3ded7",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#cbcac7",
    fontSize: "0.875rem",
  },
  heartBtn: {
    position: "absolute",
    top: "0.5rem",
    right: "0.5rem",
    background: "rgba(250,247,246,0.85)",
    border: "none",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  info: {
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    flex: 1,
  },
  title: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#285570",
  },
  year: {
    fontSize: "0.875rem",
    color: "#cbcac7",
  },
  details: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "0.25rem",
  },
  mileage: {
    fontSize: "0.875rem",
    color: "#333333",
  },
  price: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#285570",
  },
};
