import { useState, useEffect } from "react";
import {
  createCar,
  updateCar,
  deleteCar,
  getAllCars,
  uploadImage,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

const EMPTY_FORM = {
  title: "",
  brand: "",
  model: "",
  year: "",
  mileage: "",
  price: "",
  fuel: "Bensin",
  transmission: "Manuell",
  bodyType: "",
  color: "",
  description: "",
};

export default function AdminPage() {
  useAuth();

  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const [cars, setCars] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchCars();
  }, []);

  async function fetchCars() {
    setListLoading(true);
    setListError(null);
    try {
      setCars(await getAllCars());
    } catch (err) {
      setListError(err.message);
    } finally {
      setListLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function applyFiles(raw) {
    const limited = Array.from(raw).slice(0, 5);
    setFiles(limited);
    setPreviews(limited.map((f) => URL.createObjectURL(f)));
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    applyFiles(e.dataTransfer.files);
  }

  function startEdit(car) {
    setEditId(car._id);
    setForm({
      title: car.title,
      brand: car.brand,
      model: car.model,
      year: car.year,
      mileage: car.mileage,
      price: car.price,
      fuel: car.fuel,
      transmission: car.transmission,
      bodyType: car.bodyType,
      color: car.color,
      description: car.description,
    });
    setFiles([]);
    setPreviews([]);
    setFormError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFiles([]);
    setPreviews([]);
    setFormError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const payload = {
        ...form,
        year: Number(form.year),
        mileage: Number(form.mileage),
        price: Number(form.price),
      };

      const saved = editId
        ? await updateCar(editId, payload)
        : await createCar(payload);

      if (files.length > 0) {
        setUploading(true);
        const targetId = editId ?? saved._id;
        for (let i = 0; i < files.length; i++) {
          await uploadImage(targetId, files[i]);
          setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        }
        setUploading(false);
        setUploadProgress(0);
      }

      cancelEdit();
      await fetchCars();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Är du säker på att du vill ta bort denna bil?"))
      return;
    setDeletingId(id);
    try {
      await deleteCar(id);
      setCars((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert("Kunde inte ta bort bilen: " + err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main style={s.page}>
      {/* ── FORM ── */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>
          {editId ? "Redigera bil" : "Lägg till bil"}
        </h2>

        <form onSubmit={handleSubmit} style={s.form}>
          {formError && <p style={s.errorMsg}>{formError}</p>}

          <div style={s.formGrid}>
            <Field label="Titel">
              <input
                style={s.input}
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="t.ex. Volvo V60 2021"
              />
            </Field>
            <Field label="Märke">
              <input
                style={s.input}
                name="brand"
                value={form.brand}
                onChange={handleChange}
                required
                placeholder="Volvo"
              />
            </Field>
            <Field label="Modell">
              <input
                style={s.input}
                name="model"
                value={form.model}
                onChange={handleChange}
                required
                placeholder="V60"
              />
            </Field>
            <Field label="År">
              <input
                style={s.input}
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                required
                min="1900"
                max="2099"
                placeholder="2021"
              />
            </Field>
            <Field label="Miltal (km)">
              <input
                style={s.input}
                type="number"
                name="mileage"
                value={form.mileage}
                onChange={handleChange}
                required
                min="0"
                placeholder="45000"
              />
            </Field>
            <Field label="Pris (kr)">
              <input
                style={s.input}
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                placeholder="199900"
              />
            </Field>
            <Field label="Drivmedel">
              <select
                style={s.input}
                name="fuel"
                value={form.fuel}
                onChange={handleChange}
              >
                {["Bensin", "Diesel", "El", "Hybrid"].map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </Field>
            <Field label="Växellåda">
              <select
                style={s.input}
                name="transmission"
                value={form.transmission}
                onChange={handleChange}
              >
                {["Manuell", "Automatisk"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Karosseri">
              <input
                style={s.input}
                name="bodyType"
                value={form.bodyType}
                onChange={handleChange}
                required
                placeholder="Kombi"
              />
            </Field>
            <Field label="Färg">
              <input
                style={s.input}
                name="color"
                value={form.color}
                onChange={handleChange}
                required
                placeholder="Svart"
              />
            </Field>
          </div>

          <Field label="Beskrivning">
            <textarea
              style={{ ...s.input, minHeight: "100px", resize: "vertical" }}
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              placeholder="Beskriv bilen..."
            />
          </Field>

          <Field label="Bilder (max 5)">
            <div
              style={{ ...s.dropZone, ...(dragging ? s.dropZoneActive : {}) }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("fileInput").click()}
            >
              <p style={s.dropText}>
                {dragging
                  ? "Släpp bilderna här"
                  : "Dra & släpp bilder hit, eller klicka för att välja"}
              </p>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => applyFiles(e.target.files)}
              />
            </div>

            {previews.length > 0 && (
              <div style={s.previews}>
                {previews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Förhandsvisning ${i + 1}`}
                    style={s.previewImg}
                  />
                ))}
              </div>
            )}

            {uploading && (
              <div style={s.progressWrap}>
                <div
                  style={{ ...s.progressBar, width: `${uploadProgress}%` }}
                />
                <span style={s.progressText}>
                  Laddar upp… {uploadProgress}%
                </span>
              </div>
            )}
          </Field>

          <div style={s.formActions}>
            {editId && (
              <button type="button" onClick={cancelEdit} style={s.cancelBtn}>
                Avbryt
              </button>
            )}
            <button
              type="submit"
              style={{ ...s.submitBtn, opacity: formLoading ? 0.7 : 1 }}
              disabled={formLoading}
            >
              {formLoading
                ? "Sparar…"
                : editId
                  ? "Spara ändringar"
                  : "Lägg till bil"}
            </button>
          </div>
        </form>
      </section>

      {/* ── LIST ── */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Mina bilar</h2>

        {listLoading && <p style={s.statusText}>Laddar bilar…</p>}
        {listError && <p style={s.errorMsg}>{listError}</p>}
        {!listLoading && !listError && cars.length === 0 && (
          <p style={s.statusText}>Inga bilar tillagda ännu.</p>
        )}

        <div style={s.carGrid}>
          {cars.map((car) => {
            const imgSrc = car.images?.[0] || null;
            const isDeleting = deletingId === car._id;
            return (
              <article key={car._id} style={s.carCard}>
                <div style={s.thumb}>
                  {imgSrc ? (
                    <img src={imgSrc} alt={car.title} style={s.thumbImg} />
                  ) : (
                    <div style={s.thumbPlaceholder}>Ingen bild</div>
                  )}
                </div>
                <div style={s.carInfo}>
                  <p style={s.carTitle}>{car.title}</p>
                  <p style={s.carMeta}>
                    {car.year} &middot; {car.price.toLocaleString("sv-SE")} kr
                  </p>
                </div>
                <div style={s.carActions}>
                  <button
                    style={s.editBtn}
                    onClick={() => startEdit(car)}
                    disabled={isDeleting}
                  >
                    Redigera
                  </button>
                  <button
                    style={{ ...s.deleteBtn, opacity: isDeleting ? 0.6 : 1 }}
                    onClick={() => handleDelete(car._id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "…" : "Ta bort"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  );
}

const s = {
  page: {
    padding: "2rem 1rem",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  section: {
    marginBottom: "3rem",
  },
  sectionTitle: {
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "#285570",
    marginBottom: "1.25rem",
    paddingBottom: "0.5rem",
    borderBottom: "2px solid #e3ded7",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    backgroundColor: "#ffffff",
    border: "1px solid #e3ded7",
    borderRadius: "10px",
    padding: "1.5rem",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "1rem",
  },
  label: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#285570",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  input: {
    border: "1px solid #cbcac7",
    borderRadius: "8px",
    padding: "0.55rem 0.75rem",
    fontSize: "0.95rem",
    color: "#333333",
    backgroundColor: "#faf7f6",
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
  },
  dropZone: {
    border: "2px dashed #cbcac7",
    borderRadius: "8px",
    padding: "2rem 1rem",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: "#faf7f6",
    transition: "border-color 0.2s, background-color 0.2s",
  },
  dropZoneActive: {
    borderColor: "#285570",
    backgroundColor: "#e3ded7",
  },
  dropText: {
    color: "#cbcac7",
    fontSize: "0.9rem",
    pointerEvents: "none",
  },
  previews: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
    marginTop: "0.75rem",
  },
  previewImg: {
    width: "80px",
    height: "60px",
    objectFit: "cover",
    borderRadius: "6px",
    border: "1px solid #e3ded7",
  },
  progressWrap: {
    marginTop: "0.75rem",
    position: "relative",
    backgroundColor: "#e3ded7",
    borderRadius: "4px",
    height: "8px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#285570",
    transition: "width 0.3s",
  },
  progressText: {
    position: "absolute",
    top: "10px",
    left: 0,
    fontSize: "0.75rem",
    color: "#285570",
  },
  formActions: {
    display: "flex",
    gap: "0.75rem",
    justifyContent: "flex-end",
    marginTop: "0.5rem",
  },
  submitBtn: {
    backgroundColor: "#285570",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "0.65rem 1.5rem",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  cancelBtn: {
    backgroundColor: "transparent",
    color: "#285570",
    border: "1px solid #285570",
    borderRadius: "8px",
    padding: "0.65rem 1.25rem",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  errorMsg: {
    color: "#b00020",
    fontSize: "0.9rem",
    backgroundColor: "#fff0f0",
    border: "1px solid #f5c6cb",
    borderRadius: "6px",
    padding: "0.6rem 0.9rem",
  },
  statusText: {
    color: "#cbcac7",
    fontSize: "0.95rem",
  },
  carGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "1rem",
  },
  carCard: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
    border: "1px solid #e3ded7",
    borderRadius: "8px",
    overflow: "hidden",
  },
  thumb: {
    width: "100%",
    aspectRatio: "16/9",
    backgroundColor: "#e3ded7",
    overflow: "hidden",
  },
  thumbImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  thumbPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#cbcac7",
    fontSize: "0.8rem",
  },
  carInfo: {
    padding: "0.75rem 1rem",
    flex: 1,
  },
  carTitle: {
    fontWeight: 600,
    color: "#285570",
    fontSize: "0.95rem",
    marginBottom: "0.2rem",
  },
  carMeta: {
    fontSize: "0.85rem",
    color: "#cbcac7",
  },
  carActions: {
    display: "flex",
    gap: "0.5rem",
    padding: "0.75rem 1rem",
    borderTop: "1px solid #e3ded7",
  },
  editBtn: {
    flex: 1,
    backgroundColor: "#285570",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "0.45rem 0",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: "transparent",
    color: "#b00020",
    border: "1px solid #b00020",
    borderRadius: "6px",
    padding: "0.45rem 0",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
  },
};
