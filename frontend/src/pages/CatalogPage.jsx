import { useState, useEffect } from "react";
import { getAllCars } from "../services/api";

function HeartIcon({ filled }) {
  return filled ? (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="#285570"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="#285570"
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
    >
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

export default function CatalogPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(loadFavorites);

  useEffect(() => {
    getAllCars()
      .then((data) => setCars(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function toggleFavorite(id) {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
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
      <div style={styles.grid}>
        {cars.map((car) => {
          const isFav = favorites.includes(car._id);
          const imgSrc = car.images?.[0] || null;

          return (
            <article key={car._id} style={styles.card}>
              <div style={styles.imageWrap}>
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={`${car.make} ${car.model}`}
                    style={styles.image}
                  />
                ) : (
                  <div style={styles.imagePlaceholder}>Ingen bild</div>
                )}
                <button
                  style={styles.heartBtn}
                  onClick={() => toggleFavorite(car._id)}
                  aria-label={
                    isFav ? "Ta bort från favoriter" : "Lägg till i favoriter"
                  }
                >
                  <HeartIcon filled={isFav} />
                </button>
              </div>
              <div style={styles.info}>
                <h2 style={styles.title}>
                  {car.make} {car.model}
                </h2>
                <span style={styles.year}>{car.year}</span>
                <div style={styles.details}>
                  <span style={styles.mileage}>
                    {formatMileage(car.mileage)}
                  </span>
                  <span style={styles.price}>{formatPrice(car.price)}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
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
    marginBottom: "1.5rem",
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
    transition: "box-shadow 0.2s",
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
