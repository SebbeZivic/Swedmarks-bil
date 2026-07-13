import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCarById, getAllCars } from "../services/api";

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

function formatMileage(km)  { return Number(km).toLocaleString("sv-SE") + " km"; }
function formatPrice(price) { return Number(price).toLocaleString("sv-SE") + " kr"; }
function loadFavorites() {
  try { return JSON.parse(localStorage.getItem("favorites") || "[]"); }
  catch { return []; }
}

export default function CarDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar]               = useState(null);
  const [error, setError]           = useState(null);
  const [loadedId, setLoadedId]     = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [favorites, setFavs]        = useState(loadFavorites);
  const [lightboxOpen, setLbOpen]   = useState(false);
  const [lbIndex, setLbIndex]       = useState(0);
  const [similarCars, setSimilar]   = useState([]);

  const loading = loadedId !== id;

  useEffect(() => {
    let cancelled = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
    getCarById(id)
      .then((d) => { if (!cancelled) { setCar(d); setError(null); setLoadedId(id); setActiveIndex(0); setLbOpen(false); } })
      .catch((e) => { if (!cancelled) { setCar(null); setError(e.message); setLoadedId(id); } });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!car || car._id !== id) return;
    let cancelled = false;
    getAllCars().then((all) => {
      if (cancelled) return;
      const others   = all.filter((c) => c._id !== id);
      const sameMake = others.filter((c) => c.brand === car.brand);
      const priceMatch = others.filter((c) => c.price >= car.price * 0.8 && c.price <= car.price * 1.2);
      const combined = [...new Map([...sameMake, ...priceMatch].map((c) => [c._id, c])).values()].slice(0, 4);
      setSimilar(combined);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [car, id]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const count = car?.images?.length ?? 0;
    function onKey(e) {
      if (e.key === "Escape")      setLbOpen(false);
      if (e.key === "ArrowLeft")   setLbIndex((i) => (i === 0 ? count - 1 : i - 1));
      if (e.key === "ArrowRight")  setLbIndex((i) => (i === count - 1 ? 0 : i + 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, car]);

  function toggleFav() {
    setFavs((p) => {
      const n = p.includes(id) ? p.filter((f) => f !== id) : [...p, id];
      localStorage.setItem("favorites", JSON.stringify(n));
      return n;
    });
  }

  if (loading) return <main style={s.page}><p style={s.status}>Laddar bil...</p></main>;
  if (error)   return (
    <main style={s.page}>
      <button style={s.backBtn} onClick={() => navigate(-1)}>← Tillbaka</button>
      <p style={s.errorText}>{error}</p>
    </main>
  );

  const images = car.images?.length ? car.images : [];
  const isFav  = favorites.includes(id);

  const detailRows = [
    { label: "Bränsle",    value: car.fuel },
    { label: "Växellåda",  value: car.transmission },
    { label: "Karosstyp",  value: car.bodyType },
    { label: "Färg",       value: car.color },
  ].filter((r) => r.value);

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .detail-main-wrap { width: 100% !important; border-radius: 8px !important; }
          .detail-thumb-row { width: 100% !important; }
          .detail-heading { font-size: 1.4rem !important; }
          .detail-price { font-size: 1.5rem !important; }
          .detail-page { padding: 1rem 0.85rem 2.5rem !important; }
          .detail-contact-btn { min-height: 44px !important; width: 100% !important; }
          .detail-back-btn { min-height: 44px !important; }
          .detail-fav-btn { min-height: 44px !important; }
          .detail-arrow-btn { width: 36px !important; height: 36px !important; font-size: 1.3rem !important; }
          .similar-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .detail-seller-box { flex-direction: column !important; align-items: flex-start !important; }
        }
        @media (max-width: 480px) {
          .similar-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .detail-heading { font-size: 1.25rem !important; }
          .detail-price { font-size: 1.35rem !important; }
        }
      `}</style>
      {/* Lightbox */}
      <div
        style={{ ...s.lbOverlay, opacity: lightboxOpen ? 1 : 0, pointerEvents: lightboxOpen ? "auto" : "none" }}
        onClick={() => setLbOpen(false)}
      >
        <button style={s.lbClose} onClick={() => setLbOpen(false)}>✕</button>
        {images.length > 1 && (
          <button style={{ ...s.lbArrow, left: "1rem" }} onClick={(e) => { e.stopPropagation(); setLbIndex((i) => (i === 0 ? images.length - 1 : i - 1)); }}>‹</button>
        )}
        <div style={s.lbImageWrap} onClick={(e) => e.stopPropagation()}>
          {images[lbIndex] && <img src={images[lbIndex]} alt="" style={s.lbImage} />}
        </div>
        {images.length > 1 && (
          <button style={{ ...s.lbArrow, right: "1rem" }} onClick={(e) => { e.stopPropagation(); setLbIndex((i) => (i === images.length - 1 ? 0 : i + 1)); }}>›</button>
        )}
        <span style={s.lbCounter}>{lbIndex + 1} / {images.length}</span>
      </div>

      <main style={s.page} className="detail-page">
        {/* Top bar */}
        <div style={s.topBar}>
          <button style={s.backBtn} className="detail-back-btn" onClick={() => navigate(-1)}>← Tillbaka</button>
          <button style={s.favBtn} className="detail-fav-btn" onClick={toggleFav}>
            <HeartIcon filled={isFav} />
            <span>{isFav ? "Sparat" : "Spara"}</span>
          </button>
        </div>

        {/* Gallery */}
        <div style={s.gallery}>
          <div style={s.mainWrap} className="detail-main-wrap" onClick={() => images.length > 0 && (setLbIndex(activeIndex), setLbOpen(true))}>
            {images.length > 0 ? (
              <>
                <img src={images[activeIndex]} alt={`${car.brand} ${car.model}`} style={{ ...s.mainImage, cursor: "zoom-in" }} />
                <div style={s.imgOverlay} />
              </>
            ) : (
              <div style={s.noImage}>Ingen bild tillgänglig</div>
            )}
            {images.length > 1 && (
              <>
                <button style={{ ...s.arrowBtn, left: "0.75rem" }} className="detail-arrow-btn" onClick={(e) => { e.stopPropagation(); setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1)); }}>‹</button>
                <button style={{ ...s.arrowBtn, right: "0.75rem" }} className="detail-arrow-btn" onClick={(e) => { e.stopPropagation(); setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1)); }}>›</button>
                <span style={s.counter}>{activeIndex + 1} / {images.length}</span>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div style={s.thumbRow} className="detail-thumb-row">
              {images.map((src, i) => (
                <button key={i} style={i === activeIndex ? { ...s.thumb, ...s.thumbActive } : s.thumb} onClick={() => { setActiveIndex(i); setLbIndex(i); setLbOpen(true); }}>
                  <img src={src} alt="" style={s.thumbImg} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <section style={s.info}>
          <h1 style={s.heading} className="detail-heading">{car.brand} {car.model}</h1>
          <div style={s.meta}>
            <span>{car.year}</span>
            <span style={s.dot}>·</span>
            <span>{formatMileage(car.mileage)}</span>
          </div>
          <p style={s.price} className="detail-price">{formatPrice(car.price)}</p>

          {detailRows.length > 0 && (
            <dl style={s.detailGrid}>
              {detailRows.map(({ label, value }) => (
                <div key={label} style={s.detailItem}>
                  <dt style={s.detailLabel}>{label}</dt>
                  <dd style={s.detailValue}>{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {car.description && (
            <div style={s.descBox}>
              <h2 style={s.descHeading}>Beskrivning</h2>
              <p style={s.description}>{car.description}</p>
            </div>
          )}

          {/* Säljare */}
          <div style={s.sellerBox} className="detail-seller-box">
            <div style={s.sellerLeft}>
              <div style={s.sellerBadge}>SW</div>
              <div>
                <p style={s.sellerLabel}>Säljare</p>
                <p style={s.sellerName}>Swedmarks Bil</p>
                <p style={s.sellerLocation}>Helsingborg, Sverige</p>
              </div>
            </div>
            <button style={s.contactBtn} className="detail-contact-btn" onClick={() => navigate("/contact")}>
              Kontakta säljaren
            </button>
          </div>
        </section>

        {/* Liknande bilar */}
        {similarCars.length > 0 && (
          <section style={s.similarSection}>
            <h2 style={s.similarHeading}>Liknande bilar</h2>
            <div style={s.similarGrid} className="similar-grid">
              {similarCars.map((c) => {
                const thumb = c.images?.[0] ?? null;
                return (
                  <article key={c._id} style={s.similarCard} onClick={() => navigate(`/cars/${c._id}`)} role="button" tabIndex={0}>
                    <div style={s.similarImageWrap}>
                      {thumb ? (
                        <img src={thumb} alt={`${c.brand} ${c.model}`} style={s.similarImage} />
                      ) : (
                        <div style={s.similarNoImage}>Ingen bild</div>
                      )}
                    </div>
                    <div style={s.similarInfo}>
                      <p style={s.similarTitle}>{c.brand} {c.model}</p>
                      <p style={s.similarYear}>{c.year}</p>
                      <p style={s.similarPrice}>{formatPrice(c.price)}</p>
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

const s = {
  page: { maxWidth: "900px", margin: "0 auto", padding: "1.5rem 1rem 3rem", backgroundColor: "#0a0e27", minHeight: "calc(100vh - 68px)" },
  status: { textAlign: "center", color: "#6b6b7e", marginTop: "4rem" },
  errorText: { textAlign: "center", color: "#ef4444", marginTop: "2rem" },

  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" },
  backBtn: {
    background: "none", border: "1px solid rgba(201,169,97,0.25)", borderRadius: "6px",
    padding: "0.42rem 0.9rem", cursor: "pointer", color: "#c9a961",
    fontWeight: 600, fontSize: "0.82rem", fontFamily: "inherit",
    transition: "border-color 0.18s",
  },
  favBtn: {
    display: "flex", alignItems: "center", gap: "0.4rem",
    background: "none", border: "1px solid rgba(201,169,97,0.25)", borderRadius: "6px",
    padding: "0.42rem 0.9rem", cursor: "pointer", color: "#c9a961",
    fontWeight: 600, fontSize: "0.82rem", fontFamily: "inherit",
    transition: "border-color 0.18s",
  },

  gallery: { marginBottom: "1.75rem" },
  mainWrap: {
    position: "relative", width: "80%", margin: "0 auto",
    aspectRatio: "16/9", backgroundColor: "#0f1335",
    borderRadius: "12px", overflow: "hidden",
    border: "1px solid rgba(201,169,97,0.12)",
  },
  mainImage: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  imgOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: "35%",
    background: "linear-gradient(to top, rgba(10,14,39,0.6), transparent)",
    pointerEvents: "none",
  },
  noImage: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b6b7e" },
  arrowBtn: {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    background: "rgba(10,14,39,0.75)", backdropFilter: "blur(4px)",
    border: "1px solid rgba(201,169,97,0.2)", borderRadius: "50%",
    width: "40px", height: "40px", fontSize: "1.6rem", lineHeight: 1,
    cursor: "pointer", color: "#c9a961", display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
  },
  counter: {
    position: "absolute", bottom: "0.6rem", right: "0.75rem",
    background: "rgba(10,14,39,0.7)", color: "rgba(201,169,97,0.7)",
    fontSize: "0.72rem", padding: "0.2rem 0.5rem", borderRadius: "4px",
  },
  thumbRow: {
    display: "flex", gap: "0.5rem", overflowX: "auto", padding: "0.5rem 0",
    width: "80%", margin: "0.75rem auto 0",
  },
  thumb: {
    flex: "0 0 80px", height: "54px",
    border: "2px solid rgba(255,255,255,0.08)", borderRadius: "6px",
    overflow: "hidden", padding: 0, cursor: "pointer", background: "none",
    transition: "border-color 0.18s",
  },
  thumbActive: { borderColor: "#c9a961" },
  thumbImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },

  info: { paddingBottom: "1.5rem" },
  heading: { fontSize: "1.85rem", fontWeight: 700, color: "#ffffff", margin: "0 0 0.4rem", letterSpacing: "-0.02em" },
  meta: { display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b6b7e", fontSize: "0.875rem", marginBottom: "0.75rem" },
  dot: { color: "#6b6b7e" },
  price: { fontSize: "1.9rem", fontWeight: 700, color: "#c9a961", margin: "0 0 1.5rem", letterSpacing: "-0.02em" },

  detailGrid: {
    display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem",
    backgroundColor: "#0f1335", border: "1px solid rgba(201,169,97,0.12)",
    borderRadius: "10px", padding: "1.1rem", marginBottom: "1.25rem",
  },
  detailItem: { display: "flex", flexDirection: "column", gap: "0.2rem" },
  detailLabel: { fontSize: "0.68rem", color: "rgba(201,169,97,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, margin: 0 },
  detailValue: { fontSize: "0.95rem", color: "#e0e0e0", fontWeight: 500, margin: 0 },

  descBox: {
    backgroundColor: "#0f1335", border: "1px solid rgba(201,169,97,0.12)",
    borderRadius: "10px", padding: "1.1rem", marginBottom: "1.25rem",
  },
  descHeading: { fontSize: "0.85rem", fontWeight: 700, color: "#c9a961", margin: "0 0 0.6rem", letterSpacing: "0.04em", textTransform: "uppercase" },
  description: { fontSize: "0.9rem", color: "#a0a0b0", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" },

  sellerBox: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexWrap: "wrap", gap: "1rem",
    backgroundColor: "#0f1335", border: "1px solid rgba(201,169,97,0.15)",
    borderRadius: "10px", padding: "1.1rem 1.25rem",
  },
  sellerLeft: { display: "flex", alignItems: "center", gap: "0.85rem" },
  sellerBadge: {
    width: "44px", height: "44px", borderRadius: "50%",
    backgroundColor: "#c9a961", color: "#0a0e27",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: "0.85rem", flexShrink: 0,
  },
  sellerLabel: { fontSize: "0.65rem", color: "rgba(201,169,97,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, margin: "0 0 0.1rem" },
  sellerName: { fontSize: "0.95rem", fontWeight: 700, color: "#ffffff", margin: "0 0 0.1rem" },
  sellerLocation: { fontSize: "0.78rem", color: "#6b6b7e", margin: 0 },
  contactBtn: {
    backgroundColor: "#c9a961", color: "#0a0e27",
    border: "none", borderRadius: "8px",
    padding: "0.6rem 1.35rem", cursor: "pointer",
    fontWeight: 700, fontSize: "0.875rem", fontFamily: "inherit",
    letterSpacing: "0.02em", transition: "opacity 0.18s",
  },

  similarSection: { paddingBottom: "2rem" },
  similarHeading: { fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", margin: "0 0 1rem", letterSpacing: "-0.01em" },
  similarGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.75rem" },
  similarCard: {
    backgroundColor: "#0f1335", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "8px", overflow: "hidden", cursor: "pointer",
    transition: "box-shadow 0.18s, border-color 0.18s",
  },
  similarImageWrap: { width: "100%", aspectRatio: "16/9", backgroundColor: "#1a1f3a", overflow: "hidden" },
  similarImage: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  similarNoImage: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b6b7e", fontSize: "0.75rem" },
  similarInfo: { padding: "0.65rem 0.75rem" },
  similarTitle: { fontSize: "0.85rem", fontWeight: 600, color: "#ffffff", margin: "0 0 0.15rem" },
  similarYear: { fontSize: "0.75rem", color: "#6b6b7e", margin: "0 0 0.25rem" },
  similarPrice: { fontSize: "0.9rem", fontWeight: 700, color: "#c9a961", margin: 0 },

  lbOverlay: {
    position: "fixed", inset: 0, backgroundColor: "rgba(5,8,20,0.95)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, transition: "opacity 0.25s ease",
  },
  lbClose: {
    position: "absolute", top: "1rem", right: "1rem",
    background: "rgba(201,169,97,0.12)", border: "1px solid rgba(201,169,97,0.2)",
    borderRadius: "50%", width: "40px", height: "40px",
    color: "#c9a961", fontSize: "1rem", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001,
  },
  lbArrow: {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    background: "rgba(201,169,97,0.1)", border: "1px solid rgba(201,169,97,0.2)",
    borderRadius: "50%", width: "52px", height: "52px",
    fontSize: "2rem", color: "#c9a961", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 0, zIndex: 1001,
  },
  lbImageWrap: { maxWidth: "90vw", maxHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center" },
  lbImage: { maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: "8px", display: "block" },
  lbCounter: { position: "absolute", bottom: "1rem", left: "50%", transform: "translateX(-50%)", color: "rgba(201,169,97,0.5)", fontSize: "0.78rem" },
};
