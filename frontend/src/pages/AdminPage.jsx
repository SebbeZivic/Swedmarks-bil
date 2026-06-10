import { useState, useEffect, useRef } from "react";
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

  // Unified list: { id, src, file? }
  // existing images → { id, src: base64DataUri }
  // new images      → { id, src: blobUrl, file: File }
  const [imageItems, setImageItems] = useState([]);
  const [draggingFileOver, setDraggingFileOver] = useState(false);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const dragSrcIdx = useRef(null);

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

  function addFiles(raw) {
    const newItems = Array.from(raw).map((file) => ({
      id: `new-${Date.now()}-${Math.random()}`,
      src: URL.createObjectURL(file),
      file,
    }));
    setImageItems((prev) => [...prev, ...newItems].slice(0, 10));
  }

  function handleFileDrop(e) {
    e.preventDefault();
    setDraggingFileOver(false);
    addFiles(e.dataTransfer.files);
  }

  function moveImage(idx, dir) {
    setImageItems((prev) => {
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  }

  function removeImage(idx) {
    setImageItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function onImgDragStart(e, idx) {
    dragSrcIdx.current = idx;
    e.dataTransfer.effectAllowed = "move";
    // Required by Safari; Chrome/Firefox accept empty but this is safest
    e.dataTransfer.setData("text/plain", String(idx));
    console.log("[img-drag] dragstart idx=", idx);
  }

  function onImgDragOver(e, idx) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIdx !== idx) setDragOverIdx(idx);
    console.log("[img-drag] dragover idx=", idx, "src=", dragSrcIdx.current);
  }

  function onImgDrop(e, idx) {
    e.preventDefault();
    e.stopPropagation();
    const from = dragSrcIdx.current;
    console.log("[img-drag] drop from=", from, "to=", idx);
    if (from !== null && from !== idx) {
      setImageItems((prev) => {
        const arr = [...prev];
        const [moved] = arr.splice(from, 1);
        arr.splice(idx, 0, moved);
        return arr;
      });
    }
    dragSrcIdx.current = null;
    setDragOverIdx(null);
  }

  function onImgDragEnd() {
    console.log("[img-drag] dragend, resetting");
    dragSrcIdx.current = null;
    setDragOverIdx(null);
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
    setImageItems(
      (car.images || []).map((src, i) => ({
        id: `existing-${i}-${Date.now()}`,
        src,
      })),
    );
    setFormError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setImageItems([]);
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
      const targetId = editId ?? saved._id;

      // Upload new images; backend appends → last element = newly uploaded URI
      const newItems = imageItems.filter((item) => item.file);
      const uploadedUris = {};
      if (newItems.length > 0) {
        setUploading(true);
        for (let i = 0; i < newItems.length; i++) {
          const result = await uploadImage(targetId, newItems[i].file);
          uploadedUris[newItems[i].id] =
            result.car.images[result.car.images.length - 1];
          setUploadProgress(Math.round(((i + 1) / newItems.length) * 100));
        }
        setUploading(false);
        setUploadProgress(0);
      }

      // Save final image order (existing in new positions + new uploads)
      if (imageItems.length > 0) {
        const finalImages = imageItems
          .map((item) => (item.file ? uploadedUris[item.id] : item.src))
          .filter(Boolean);
        await updateCar(targetId, { ...payload, images: finalImages });
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

          {/* ── IMAGES ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <p style={s.label}>Bilder (max 10)</p>

            <div
              style={{
                ...s.dropZone,
                ...(draggingFileOver ? s.dropZoneActive : {}),
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDraggingFileOver(true);
              }}
              onDragLeave={() => setDraggingFileOver(false)}
              onDrop={handleFileDrop}
              onClick={() => document.getElementById("fileInput").click()}
            >
              <p style={s.dropText}>
                {draggingFileOver
                  ? "Släpp bilderna här"
                  : "Dra & släpp bilder hit, eller klicka för att välja"}
              </p>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {imageItems.length > 0 && (
              <>
                <p style={s.imgHint}>
                  Dra för att byta ordning · Pilar för att flytta · Första
                  bilden är omslagsfoto
                </p>
                <div style={s.imgGrid}>
                  {imageItems.map((item, idx) => (
                    <div
                      key={item.id}
                      draggable={true}
                      onDragStart={(e) => onImgDragStart(e, idx)}
                      onDragOver={(e) => onImgDragOver(e, idx)}
                      onDrop={(e) => onImgDrop(e, idx)}
                      onDragEnd={onImgDragEnd}
                      style={{
                        ...s.imgCard,
                        ...(dragOverIdx === idx ? s.imgCardOver : {}),
                      }}
                    >
                      <img
                        src={item.src}
                        alt={`Bild ${idx + 1}`}
                        style={s.imgCardImg}
                        draggable={false}
                      />

                      {idx === 0 && (
                        <span style={s.coverBadge}>Omslagsfoto</span>
                      )}

                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        style={s.removeBtn}
                        title="Ta bort bild"
                      >
                        ×
                      </button>

                      <div style={s.arrowRow}>
                        <button
                          type="button"
                          onClick={() => moveImage(idx, -1)}
                          disabled={idx === 0}
                          style={{
                            ...s.arrowBtn,
                            opacity: idx === 0 ? 0.25 : 1,
                          }}
                          title="Flytta vänster"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(idx, 1)}
                          disabled={idx === imageItems.length - 1}
                          style={{
                            ...s.arrowBtn,
                            opacity: idx === imageItems.length - 1 ? 0.25 : 1,
                          }}
                          title="Flytta höger"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {uploading && (
              <div style={s.progressOuter}>
                <div
                  style={{ ...s.progressInner, width: `${uploadProgress}%` }}
                />
                <span style={s.progressText}>
                  Laddar upp… {uploadProgress}%
                </span>
              </div>
            )}
          </div>

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
    padding: "1.5rem 1rem",
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
  imgHint: {
    fontSize: "0.78rem",
    color: "#cbcac7",
    margin: 0,
  },
  imgGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  imgCard: {
    position: "relative",
    width: "130px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#e3ded7",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#faf7f6",
    cursor: "grab",
    userSelect: "none",
  },
  imgCardOver: {
    borderColor: "#285570",
    boxShadow: "0 0 0 2px #28557044",
  },

  imgCardImg: {
    width: "130px",
    height: "90px",
    objectFit: "cover",
    display: "block",
  },
  coverBadge: {
    position: "absolute",
    bottom: "28px",
    left: 0,
    right: 0,
    backgroundColor: "#285570",
    color: "#ffffff",
    fontSize: "0.65rem",
    fontWeight: 700,
    textAlign: "center",
    padding: "2px 0",
    letterSpacing: "0.03em",
  },
  removeBtn: {
    position: "absolute",
    top: "4px",
    right: "4px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "rgba(0,0,0,0.55)",
    color: "#ffffff",
    fontSize: "14px",
    lineHeight: "18px",
    textAlign: "center",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowRow: {
    display: "flex",
    borderTop: "1px solid #e3ded7",
  },
  arrowBtn: {
    flex: 1,
    border: "none",
    backgroundColor: "#faf7f6",
    color: "#285570",
    fontSize: "1rem",
    padding: "4px 0",
    cursor: "pointer",
    transition: "background-color 0.15s",
  },
  progressOuter: {
    position: "relative",
    backgroundColor: "#e3ded7",
    borderRadius: "4px",
    height: "8px",
    overflow: "visible",
  },
  progressInner: {
    height: "100%",
    backgroundColor: "#285570",
    borderRadius: "4px",
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
