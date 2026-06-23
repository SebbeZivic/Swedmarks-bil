import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCarById, getAllCars } from "../services/api";

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

export default function CarDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [error, setError] = useState(null);
  const [loadedId, setLoadedId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [favorites, setFavorites] = useState(loadFavorites);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [similarCars, setSimilarCars] = useState([]);

  // Derived: loading when the fetched id doesn't match the current route id
  const loading = loadedId !== id;

  useEffect(() => {
    let cancelled = false;
    getCarById(id).then((data) => {
      if (cancelled) return;
      window.scrollTo({ top: 0, behavior: "smooth" }); // ← LÄGG TILL DENNA
      setCar(data);
      setError(null);
      setLoadedId(id);
      setActiveIndex(0);
      setLightboxOpen(false);
    });
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    getCarById(id)
      .then((data) => {
        if (cancelled) return;
        setCar(data);
        setError(null);
        setLoadedId(id);
        setActiveIndex(0);
        setLightboxOpen(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setCar(null);
        setError(err.message);
        setLoadedId(id);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!car || car._id !== id) return;
    getAllCars()
      .then((all) => {
        const others = all.filter((c) => c._id !== id);
        const sameMake = others.filter((c) => c.brand === car.brand);
        const priceMatch = others.filter(
          (c) => c.price >= car.price * 0.8 && c.price <= car.price * 1.2,
        );
        const combined = [
          ...new Map(
            [...sameMake, ...priceMatch].map((c) => [c._id, c]),
          ).values(),
        ].slice(0, 4);
        setSimilarCars(combined);
      })
      .catch(() => {});
  }, [car, id]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const imageCount = car?.images?.length ?? 0;
    function handleKey(e) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) => (i === 0 ? imageCount - 1 : i - 1));
      if (e.key === "ArrowRight")
        setLightboxIndex((i) => (i === imageCount - 1 ? 0 : i + 1));
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, car]);

  function toggleFavorite() {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      localStorage.setItem("favorites", JSON.stringify(next));
      return next;
    });
  }

  function openLightbox(index) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <p style={styles.status}>Laddar bil...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={styles.page}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Tillbaka
        </button>
        <p style={styles.errorText}>{error}</p>
      </main>
    );
  }

  const images = car.images?.length ? car.images : [];
  const isFav = favorites.includes(id);

  function prevImage() {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function nextImage() {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  function lbPrev(e) {
    e.stopPropagation();
    setLightboxIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function lbNext(e) {
    e.stopPropagation();
    setLightboxIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  const detailRows = [
    { label: "Bränsle", value: car.fuel },
    { label: "Växellåda", value: car.transmission },
    { label: "Karosstyp", value: car.bodyType },
    { label: "Färg", value: car.color },
  ].filter((r) => r.value);

  return (
    <>
      {/* ── Lightbox ── */}
      <div
        style={{
          ...styles.lightboxOverlay,
          opacity: lightboxOpen ? 1 : 0,
          pointerEvents: lightboxOpen ? "auto" : "none",
        }}
        onClick={() => setLightboxOpen(false)}
        aria-modal="true"
        role="dialog"
      >
        <button
          style={styles.lbClose}
          onClick={() => setLightboxOpen(false)}
          aria-label="Stäng"
        >
          ✕
        </button>

        {images.length > 1 && (
          <button
            style={{ ...styles.lbArrow, left: "1rem" }}
            onClick={lbPrev}
            aria-label="Föregående bild"
          >
            ‹
          </button>
        )}

        <div style={styles.lbImageWrap} onClick={(e) => e.stopPropagation()}>
          {images[lightboxIndex] && (
            <img
              src={images[lightboxIndex]}
              alt={`${car.brand} ${car.model} bild ${lightboxIndex + 1}`}
              style={styles.lbImage}
            />
          )}
        </div>

        {images.length > 1 && (
          <button
            style={{ ...styles.lbArrow, right: "1rem" }}
            onClick={lbNext}
            aria-label="Nästa bild"
          >
            ›
          </button>
        )}

        <span style={styles.lbCounter}>
          {lightboxIndex + 1} / {images.length}
        </span>
      </div>

      {/* ── Page ── */}
      <main style={styles.page}>
        <div style={styles.topBar}>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>
            ← Tillbaka
          </button>
          <button
            style={styles.favBtn}
            onClick={toggleFavorite}
            aria-label={
              isFav ? "Ta bort från favoriter" : "Lägg till i favoriter"
            }
          >
            <HeartIcon filled={isFav} />
            <span>{isFav ? "Sparat" : "Spara"}</span>
          </button>
        </div>

        {/* Gallery */}
        <div style={styles.gallery}>
          <div
            style={styles.mainWrap}
            onClick={() => images.length > 0 && openLightbox(activeIndex)}
          >
            {images.length > 0 ? (
              <img
                src={images[activeIndex]}
                alt={`${car.brand} ${car.model} bild ${activeIndex + 1}`}
                style={{ ...styles.mainImage, cursor: "zoom-in" }}
              />
            ) : (
              <div style={styles.noImage}>Ingen bild tillgänglig</div>
            )}
            {images.length > 1 && (
              <>
                <button
                  style={{ ...styles.arrowBtn, left: "0.5rem" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  aria-label="Föregående bild"
                >
                  ‹
                </button>
                <button
                  style={{ ...styles.arrowBtn, right: "0.5rem" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  aria-label="Nästa bild"
                >
                  ›
                </button>
                <span style={styles.counter}>
                  {activeIndex + 1} / {images.length}
                </span>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div style={styles.thumbRow}>
              {images.map((src, i) => (
                <button
                  key={i}
                  style={
                    i === activeIndex
                      ? { ...styles.thumb, ...styles.thumbActive }
                      : styles.thumb
                  }
                  onClick={() => {
                    setActiveIndex(i);
                    openLightbox(i);
                  }}
                  aria-label={`Bild ${i + 1}`}
                >
                  <img src={src} alt="" style={styles.thumbImg} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <section style={styles.info}>
          <h1 style={styles.heading}>
            {car.brand} {car.model}
          </h1>

          <div style={styles.meta}>
            <span>{car.year}</span>
            <span style={styles.dot}>·</span>
            <span>{formatMileage(car.mileage)}</span>
          </div>

          <p style={styles.price}>{formatPrice(car.price)}</p>

          {detailRows.length > 0 && (
            <dl style={styles.detailGrid}>
              {detailRows.map(({ label, value }) => (
                <div key={label} style={styles.detailItem}>
                  <dt style={styles.detailLabel}>{label}</dt>
                  <dd style={styles.detailValue}>{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {car.description && (
            <div style={styles.descBox}>
              <h2 style={styles.descHeading}>Beskrivning</h2>
              <p style={styles.description}>{car.description}</p>
            </div>
          )}

          {/* Säljare */}
          <div style={styles.sellerBox}>
            <div style={styles.sellerLeft}>
              <div style={styles.sellerBadge}>SW</div>
              <div>
                <p style={styles.sellerLabel}>Säljare</p>
                <p style={styles.sellerName}>Swedmarks Bil</p>
                <p style={styles.sellerLocation}>Helsingborg, Sverige</p>
              </div>
            </div>
            <button
              style={styles.contactBtn}
              onClick={() => navigate("/contact")}
            >
              Kontakta säljaren
            </button>
          </div>
        </section>

        {/* Liknande bilar */}
        {similarCars.length > 0 && (
          <section style={styles.similarSection}>
            <h2 style={styles.similarHeading}>Liknande bilar</h2>
            <div style={styles.similarGrid}>
              {similarCars.map((c) => {
                const thumb = c.images?.[0] ?? null;
                return (
                  <article
                    key={c._id}
                    style={styles.similarCard}
                    onClick={() => navigate(`/cars/${c._id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && navigate(`/cars/${c._id}`)
                    }
                  >
                    <div style={styles.similarImageWrap}>
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={`${c.brand} ${c.model}`}
                          style={styles.similarImage}
                        />
                      ) : (
                        <div style={styles.similarNoImage}>Ingen bild</div>
                      )}
                    </div>
                    <div style={styles.similarInfo}>
                      <p style={styles.similarTitle}>
                        {c.make} {c.model}
                      </p>
                      <p style={styles.similarYear}>{c.year}</p>
                      <p style={styles.similarPrice}>{formatPrice(c.price)}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

const styles = {
  page: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "1rem",
    backgroundColor: "#faf7f6",
    minHeight: "100vh",
  },
  status: {
    textAlign: "center",
    color: "#cbcac7",
    marginTop: "4rem",
    fontSize: "1rem",
  },
  errorText: {
    textAlign: "center",
    color: "#b00020",
    marginTop: "2rem",
    fontSize: "1rem",
  },

  // ── Top bar ──
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  backBtn: {
    background: "none",
    border: "1px solid #cbcac7",
    borderRadius: "6px",
    padding: "0.4rem 0.9rem",
    cursor: "pointer",
    color: "#285570",
    fontWeight: 600,
    fontSize: "0.875rem",
  },
  favBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    background: "none",
    border: "1px solid #cbcac7",
    borderRadius: "6px",
    padding: "0.4rem 0.9rem",
    cursor: "pointer",
    color: "#285570",
    fontWeight: 600,
    fontSize: "0.875rem",
  },

  // ── Gallery ──
  gallery: {
    marginBottom: "1.5rem",
  },
  mainWrap: {
    position: "relative",
    width: "80%",
    margin: "0 auto",
    aspectRatio: "16/9",
    backgroundColor: "#e3ded7",
    borderRadius: "10px",
    overflow: "hidden",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  noImage: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#cbcac7",
    fontSize: "1rem",
  },
  arrowBtn: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(250,247,246,0.85)",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    fontSize: "1.75rem",
    lineHeight: 1,
    cursor: "pointer",
    color: "#285570",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  counter: {
    position: "absolute",
    bottom: "0.5rem",
    right: "0.75rem",
    background: "rgba(0,0,0,0.45)",
    color: "#fff",
    fontSize: "0.75rem",
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
  },
  thumbRow: {
    display: "flex",
    gap: "0.5rem",
    overflowX: "auto",
    padding: "0.5rem 0",
    width: "80%",
    margin: "0.75rem auto 0",
  },
  thumb: {
    flex: "0 0 80px",
    height: "54px",
    border: "2px solid transparent",
    borderRadius: "6px",
    overflow: "hidden",
    padding: 0,
    cursor: "pointer",
    background: "none",
  },
  thumbActive: {
    borderColor: "#285570",
  },
  thumbImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  // ── Info ──
  info: {
    paddingBottom: "1.5rem",
  },
  heading: {
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#285570",
    margin: "0 0 0.4rem",
  },
  meta: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#cbcac7",
    fontSize: "0.9rem",
    marginBottom: "0.75rem",
  },
  dot: {
    color: "#cbcac7",
  },
  price: {
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#285570",
    margin: "0 0 1.25rem",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "0.75rem",
    backgroundColor: "#fff",
    border: "1px solid #e3ded7",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1.25rem",
  },
  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
  },
  detailLabel: {
    fontSize: "0.72rem",
    color: "#cbcac7",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: 600,
    margin: 0,
  },
  detailValue: {
    fontSize: "0.95rem",
    color: "#333333",
    fontWeight: 500,
    margin: 0,
  },
  descBox: {
    backgroundColor: "#fff",
    border: "1px solid #e3ded7",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1.25rem",
  },
  descHeading: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#285570",
    margin: "0 0 0.5rem",
  },
  description: {
    fontSize: "0.9rem",
    color: "#333333",
    lineHeight: 1.65,
    margin: 0,
    whiteSpace: "pre-wrap",
  },

  // ── Säljare ──
  sellerBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "1rem",
    backgroundColor: "#fff",
    border: "1px solid #e3ded7",
    borderRadius: "8px",
    padding: "1rem 1.25rem",
  },
  sellerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.85rem",
  },
  sellerBadge: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    backgroundColor: "#285570",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "0.85rem",
    flexShrink: 0,
  },
  sellerLabel: {
    fontSize: "0.72rem",
    color: "#cbcac7",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: 600,
    margin: "0 0 0.1rem",
  },
  sellerName: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#285570",
    margin: "0 0 0.1rem",
  },
  sellerLocation: {
    fontSize: "0.8rem",
    color: "#cbcac7",
    margin: 0,
  },
  contactBtn: {
    backgroundColor: "#285570",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "0.55rem 1.2rem",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.875rem",
    whiteSpace: "nowrap",
  },

  // ── Liknande bilar ──
  similarSection: {
    paddingBottom: "2rem",
  },
  similarHeading: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#285570",
    margin: "0 0 1rem",
  },
  similarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "0.75rem",
  },
  similarCard: {
    backgroundColor: "#fff",
    border: "1px solid #e3ded7",
    borderRadius: "8px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "box-shadow 0.15s",
  },
  similarImageWrap: {
    width: "100%",
    aspectRatio: "16/9",
    backgroundColor: "#e3ded7",
    overflow: "hidden",
  },
  similarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  similarNoImage: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#cbcac7",
    fontSize: "0.75rem",
  },
  similarInfo: {
    padding: "0.6rem 0.75rem",
  },
  similarTitle: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#285570",
    margin: "0 0 0.15rem",
  },
  similarYear: {
    fontSize: "0.78rem",
    color: "#cbcac7",
    margin: "0 0 0.25rem",
  },
  similarPrice: {
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#285570",
    margin: 0,
  },

  // ── Lightbox ──
  lightboxOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.88)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    transition: "opacity 0.25s ease",
  },
  lbClose: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    background: "rgba(255,255,255,0.15)",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    color: "#fff",
    fontSize: "1.1rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1001,
  },
  lbArrow: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.15)",
    border: "none",
    borderRadius: "50%",
    width: "52px",
    height: "52px",
    fontSize: "2rem",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    zIndex: 1001,
  },
  lbImageWrap: {
    maxWidth: "90vw",
    maxHeight: "85vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  lbImage: {
    maxWidth: "90vw",
    maxHeight: "85vh",
    objectFit: "contain",
    borderRadius: "6px",
    display: "block",
  },
  lbCounter: {
    position: "absolute",
    bottom: "1rem",
    left: "50%",
    transform: "translateX(-50%)",
    color: "rgba(255,255,255,0.7)",
    fontSize: "0.8rem",
  },
};
