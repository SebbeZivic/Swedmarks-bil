import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  return Number(km).toLocaleString("sv-SE") + " km";
}

function formatPrice(price) {
  return Number(price).toLocaleString("sv-SE") + " kr";
}

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem("favorites") || "[]");
  } catch {
    return [];
  }
}

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [allCars, setAllCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(loadFavorites);
  const [hoveredCard, setHoveredCard] = useState(null);

  const favoriteCars = allCars.filter((car) => favorites.includes(car._id));

  useEffect(() => {
    getAllCars()
      .then((data) => setAllCars(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function toggleFavorite(id) {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem("favorites", JSON.stringify(next));
      return next;
    });
  }

  return (
    <main style={styles.page}>
      <h1 style={styles.heading}>Sparade bilar</h1>

      {loading && <p style={styles.status}>Laddar bilar...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && favoriteCars.length === 0 && (
        <div style={styles.emptyState}>
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#cbcac7" strokeWidth="1.5" style={{ marginBottom: "1rem" }}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <p style={styles.emptyTitle}>Du har inga sparade bilar ännu</p>
          <p style={styles.emptySub}>Tryck på hjärtsymbolen på en bil för att spara den här.</p>
          <button style={styles.browseBtn} onClick={() => navigate("/")}>
            Bläddra bland bilar
          </button>
        </div>
      )}

      {!loading && !error && favoriteCars.length > 0 && (
        <>
          <p style={styles.count}>
            {favoriteCars.length} {favoriteCars.length === 1 ? "sparad bil" : "sparade bilar"}
          </p>
          <div style={styles.grid}>
            {favoriteCars.map((car) => {
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
        </>
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
    marginBottom: "0.25rem",
  },
  count: {
    fontSize: "0.9rem",
    color: "#cbcac7",
    marginBottom: "1.5rem",
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
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "5rem 1rem",
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#285570",
    margin: 0,
  },
  emptySub: {
    fontSize: "0.9rem",
    color: "#cbcac7",
    marginTop: "0.5rem",
    marginBottom: "1.5rem",
  },
  browseBtn: {
    backgroundColor: "#285570",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "0.65rem 1.5rem",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
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
