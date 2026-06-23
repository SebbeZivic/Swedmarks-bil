import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCars } from "../services/api";

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

function formatMileage(km) { return Number(km).toLocaleString("sv-SE") + " km"; }
function formatPrice(price) { return Number(price).toLocaleString("sv-SE") + " kr"; }
function loadFavorites() {
  try { return JSON.parse(localStorage.getItem("favorites") || "[]"); }
  catch { return []; }
}

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [allCars, setAllCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [favorites, setFavs]  = useState(loadFavorites);
  const [hovered, setHovered] = useState(null);

  const favoriteCars = allCars.filter((car) => favorites.includes(car._id));

  useEffect(() => {
    getAllCars()
      .then((d) => setAllCars(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function toggleFav(id) {
    setFavs((p) => {
      const n = p.includes(id) ? p.filter((f) => f !== id) : [...p, id];
      localStorage.setItem("favorites", JSON.stringify(n));
      return n;
    });
  }

  return (
    <main style={s.page}>
      <div style={s.header}>
        <h1 style={s.heading}>Sparade bilar</h1>
        {!loading && !error && favoriteCars.length > 0 && (
          <span style={s.count}>{favoriteCars.length} {favoriteCars.length === 1 ? "bil" : "bilar"}</span>
        )}
      </div>

      {loading && <p style={s.status}>Laddar bilar...</p>}
      {error   && <p style={s.error}>{error}</p>}

      {!loading && !error && favoriteCars.length === 0 && (
        <div style={s.emptyState}>
          <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="rgba(201,169,97,0.25)" strokeWidth="1.5">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <p style={s.emptyTitle}>Inga sparade bilar ännu</p>
          <p style={s.emptySub}>Tryck på hjärtsymbolen på en bil för att spara den här.</p>
          <button style={s.browseBtn} onClick={() => navigate("/")}>Bläddra bland bilar</button>
        </div>
      )}

      {!loading && !error && favoriteCars.length > 0 && (
        <div style={s.grid}>
          {favoriteCars.map((car) => {
            const isFav  = favorites.includes(car._id);
            const imgSrc = car.images?.[0] || null;
            return (
              <article
                key={car._id}
                style={{ ...s.card, ...(hovered === car._id ? s.cardHover : {}) }}
                onMouseEnter={() => setHovered(car._id)}
                onMouseLeave={() => setHovered(null)}
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
                  <div style={s.imageGradient} />
                  <button
                    style={s.heartBtn}
                    onClick={(e) => { e.stopPropagation(); toggleFav(car._id); }}
                    aria-label={isFav ? "Ta bort" : "Spara"}
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
    </main>
  );
}

const s = {
  page: {
    padding: "2.5rem 1.25rem 4rem",
    maxWidth: "1240px",
    margin: "0 auto",
    minHeight: "calc(100vh - 68px)",
    backgroundColor: "#0a0e27",
  },
  header: {
    display: "flex",
    alignItems: "baseline",
    gap: "1rem",
    marginBottom: "2rem",
  },
  heading: {
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#ffffff",
    letterSpacing: "-0.02em",
  },
  count: {
    fontSize: "0.85rem",
    color: "#6b6b7e",
  },
  status: {
    textAlign: "center",
    color: "#6b6b7e",
    marginTop: "5rem",
    fontSize: "1rem",
  },
  error: {
    textAlign: "center",
    color: "#ef4444",
    marginTop: "5rem",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "5rem 1rem",
    textAlign: "center",
    gap: "0",
  },
  emptyTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#e0e0e0",
    margin: "1rem 0 0.5rem",
  },
  emptySub: {
    fontSize: "0.875rem",
    color: "#6b6b7e",
    marginBottom: "1.75rem",
  },
  browseBtn: {
    backgroundColor: "#c9a961",
    color: "#0a0e27",
    border: "none",
    borderRadius: "8px",
    padding: "0.7rem 1.6rem",
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.02em",
  },
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
    transition: "box-shadow 0.25s, transform 0.2s",
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
    width: "100%", height: "100%", objectFit: "cover", display: "block",
  },
  imageGradient: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
    background: "linear-gradient(to top, rgba(10,14,39,0.7), transparent)",
    pointerEvents: "none",
  },
  imagePlaceholder: {
    width: "100%", height: "100%", display: "flex", alignItems: "center",
    justifyContent: "center", color: "#6b6b7e", fontSize: "0.875rem",
  },
  heartBtn: {
    position: "absolute", top: "0.6rem", right: "0.6rem",
    background: "rgba(10,14,39,0.7)",
    backdropFilter: "blur(4px)",
    border: "1px solid rgba(201,169,97,0.2)",
    borderRadius: "50%",
    width: "36px", height: "36px",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", padding: 0,
  },
  info: {
    padding: "1.1rem 1rem",
    display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1,
  },
  carTitle: { fontSize: "1rem", fontWeight: 600, color: "#ffffff", letterSpacing: "-0.01em" },
  carYear: { fontSize: "0.82rem", color: "#6b6b7e" },
  carDetails: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.4rem" },
  carMileage: { fontSize: "0.82rem", color: "#a0a0b0" },
  carPrice: { fontSize: "1.05rem", fontWeight: 700, color: "#c9a961", letterSpacing: "-0.01em" },
};
