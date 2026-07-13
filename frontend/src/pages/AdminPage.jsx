import { useState, useEffect, useRef } from "react";
import {
  createCar,
  updateCar,
  deleteCar,
  getAllCars,
  uploadImage,
  getAllMessages,
  replyToMessage,
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

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPage() {
  useAuth();

  // ── Car form state ──
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [imageItems, setImageItems] = useState([]);
  const [draggingFileOver, setDraggingFileOver] = useState(false);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const dragSrcIdx = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // ── Car list state ──
  const [cars, setCars] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ── Messages state ──
  const [messages, setMessages] = useState([]);
  const [msgsLoading, setMsgsLoading] = useState(true);
  const [msgsError, setMsgsError] = useState(null);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState(null);

  useEffect(() => {
    fetchCars();
    fetchMessages();
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

  async function fetchMessages() {
    setMsgsLoading(true);
    setMsgsError(null);
    try {
      setMessages(await getAllMessages());
    } catch (err) {
      setMsgsError(err.message);
    } finally {
      setMsgsLoading(false);
    }
  }

  // ── Message handlers ──
  function openMsg(msg) {
    setSelectedMsg(msg);
    setReplyText("");
    setReplyError(null);
  }

  function closeMsg() {
    setSelectedMsg(null);
    setReplyText("");
    setReplyError(null);
  }

  async function handleReply(e) {
    e.preventDefault();
    setReplying(true);
    setReplyError(null);
    try {
      const { msg: updated } = await replyToMessage(selectedMsg._id, replyText);
      setMessages((prev) =>
        prev.map((m) => (m._id === updated._id ? updated : m))
      );
      closeMsg();
    } catch (err) {
      setReplyError(err.message);
    } finally {
      setReplying(false);
    }
  }

  // ── Car form handlers ──
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
    e.dataTransfer.setData("text/plain", String(idx));
  }

  function onImgDragOver(e, idx) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIdx !== idx) setDragOverIdx(idx);
  }

  function onImgDrop(e, idx) {
    e.preventDefault();
    e.stopPropagation();
    const from = dragSrcIdx.current;
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
      }))
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

  const unreadCount = messages.filter((m) => !m.replied).length;

  return (
    <main style={s.page} className="admin-page">
      <style>{`
        .admin-input::placeholder { color: rgba(160,160,176,0.35); }
        .admin-input:focus { border-color: rgba(201,169,97,0.5) !important; background: rgba(201,169,97,0.05) !important; outline: none; }
        .admin-input option { background: #1a1f3a; color: #e0e0e0; }
        .admin-input { min-height: 44px !important; }
        @media (max-width: 768px) {
          .admin-page { padding: 1.25rem 0.85rem 3rem !important; }
          .admin-form { padding: 1rem !important; overflow-x: hidden !important; }
          .admin-form-grid { grid-template-columns: 1fr !important; }
          .admin-msg-row {
            display: flex !important;
            flex-direction: column !important;
            gap: 0.5rem !important;
            align-items: flex-start !important;
          }
          .admin-msg-right { align-items: flex-start !important; flex-direction: row !important; gap: 0.75rem !important; }
          .admin-car-grid { grid-template-columns: 1fr !important; }
          .admin-submit-btn { width: 100% !important; min-height: 48px !important; }
          .admin-cancel-btn { min-height: 48px !important; }
          .admin-form-actions { flex-direction: column-reverse !important; }
          .admin-section-title { font-size: 1.1rem !important; }
          .admin-modal { padding: 0 !important; }
        }
        @media (max-width: 480px) {
          .admin-car-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {/* ── CAR FORM ── */}
      <section style={s.section}>
        <h2 style={s.sectionTitle} className="admin-section-title">
          {editId ? "Redigera bil" : "Lägg till bil"}
        </h2>

        <form onSubmit={handleSubmit} style={s.form} className="admin-form">
          {formError && <p style={s.errorMsg}>{formError}</p>}

          <div style={s.formGrid} className="admin-form-grid">
            <Field label="Titel">
              <input
                className="admin-input"
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
                className="admin-input"
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
                className="admin-input"
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
                className="admin-input"
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
                className="admin-input"
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
                className="admin-input"
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
                className="admin-input"
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
                className="admin-input"
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
                className="admin-input"
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
                className="admin-input"
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
              className="admin-input"
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

          <div style={s.formActions} className="admin-form-actions">
            {editId && (
              <button type="button" onClick={cancelEdit} style={s.cancelBtn} className="admin-cancel-btn">
                Avbryt
              </button>
            )}
            <button
              type="submit"
              style={{ ...s.submitBtn, opacity: formLoading ? 0.7 : 1 }}
              className="admin-submit-btn"
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

      {/* ── MESSAGES ── */}
      <section style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Mottagna meddelanden</h2>
          {unreadCount > 0 && (
            <span style={s.unreadBadge}>{unreadCount} obesvarade</span>
          )}
        </div>

        {msgsLoading && <p style={s.statusText}>Laddar meddelanden…</p>}
        {msgsError && <p style={s.errorMsg}>{msgsError}</p>}
        {!msgsLoading && !msgsError && messages.length === 0 && (
          <p style={s.statusText}>Inga meddelanden ännu.</p>
        )}

        <div style={s.msgList}>
          {messages.map((msg) => (
            <button
              key={msg._id}
              className="admin-msg-row"
              style={{
                ...s.msgRow,
                ...(msg.replied ? {} : s.msgRowUnread),
              }}
              onClick={() => openMsg(msg)}
            >
              <div style={s.msgLeft}>
                <span style={s.msgName}>{msg.name}</span>
                <span style={s.msgEmail}>{msg.email}</span>
              </div>
              <p style={s.msgPreview}>
                {msg.message.length > 90
                  ? msg.message.slice(0, 90) + "…"
                  : msg.message}
              </p>
              <div style={s.msgRight} className="admin-msg-right">
                <span style={s.msgDate}>{formatDate(msg.createdAt)}</span>
                <span
                  style={{
                    ...s.statusBadge,
                    ...(msg.replied ? s.statusReplied : s.statusPending),
                  }}
                >
                  {msg.replied ? "Besvarad" : "Ej besvarad"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── CAR LIST ── */}
      <section style={s.section}>
        <h2 style={{ ...s.sectionTitle, ...s.sectionTitleBorder }}>
          Mina bilar
        </h2>

        {listLoading && <p style={s.statusText}>Laddar bilar…</p>}
        {listError && <p style={s.errorMsg}>{listError}</p>}
        {!listLoading && !listError && cars.length === 0 && (
          <p style={s.statusText}>Inga bilar tillagda ännu.</p>
        )}

        <div style={s.carGrid} className="admin-car-grid">
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

      {/* ── REPLY MODAL ── */}
      {selectedMsg && (
        <div style={s.overlay} onClick={closeMsg}>
          <div style={s.modal} className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div>
                <h3 style={s.modalTitle}>
                  Meddelande från {selectedMsg.name}
                </h3>
                <p style={s.modalMeta}>{formatDate(selectedMsg.createdAt)}</p>
              </div>
              <button
                style={s.closeBtn}
                onClick={closeMsg}
                aria-label="Stäng"
              >
                ×
              </button>
            </div>

            <div style={s.modalBody}>
              <div style={s.senderInfo}>
                <div style={s.senderRow}>
                  <span style={s.senderLabel}>Namn</span>
                  <span style={s.senderValue}>{selectedMsg.name}</span>
                </div>
                <div style={s.senderRow}>
                  <span style={s.senderLabel}>E-post</span>
                  <span style={s.senderValue}>{selectedMsg.email}</span>
                </div>
                {selectedMsg.phone && (
                  <div style={s.senderRow}>
                    <span style={s.senderLabel}>Telefon</span>
                    <span style={s.senderValue}>{selectedMsg.phone}</span>
                  </div>
                )}
              </div>

              <div style={s.msgBox}>
                <p style={s.msgBoxLabel}>Meddelande</p>
                <p style={s.msgBoxText}>{selectedMsg.message}</p>
              </div>

              {selectedMsg.replied ? (
                <div style={s.replyBox}>
                  <p style={s.replyBoxLabel}>
                    Ditt svar · {formatDate(selectedMsg.replyDate)}
                  </p>
                  <p style={s.replyBoxText}>{selectedMsg.reply}</p>
                </div>
              ) : (
                <form onSubmit={handleReply} style={s.replyForm}>
                  <label style={s.label}>Skriv ett svar</label>
                  <textarea
                    className="admin-input"
                    style={{ ...s.input, minHeight: "90px", resize: "vertical" }}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Ditt svar till kunden…"
                    required
                  />
                  {replyError && <p style={s.errorMsg}>{replyError}</p>}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="submit"
                      style={{ ...s.submitBtn, opacity: replying ? 0.7 : 1 }}
                      disabled={replying}
                    >
                      {replying ? "Sparar…" : "Skicka svar"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
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
    padding: "2rem 1rem 4rem",
    maxWidth: "1100px",
    margin: "0 auto",
    backgroundColor: "#0a0e27",
    minHeight: "calc(100vh - 68px)",
  },
  section: {
    marginBottom: "3rem",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "1.25rem",
    paddingBottom: "0.6rem",
    borderBottom: "1px solid rgba(201,169,97,0.15)",
  },
  sectionTitle: {
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#ffffff",
    margin: 0,
    letterSpacing: "-0.01em",
  },
  sectionTitleBorder: {
    display: "block",
    marginBottom: "1.25rem",
    paddingBottom: "0.6rem",
    borderBottom: "1px solid rgba(201,169,97,0.15)",
  },
  unreadBadge: {
    backgroundColor: "rgba(201,169,97,0.15)",
    color: "#c9a961",
    fontSize: "0.72rem",
    fontWeight: 700,
    borderRadius: "20px",
    padding: "0.2rem 0.65rem",
    letterSpacing: "0.02em",
    border: "1px solid rgba(201,169,97,0.25)",
  },

  // ── Messages list ──
  msgList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  msgRow: {
    display: "grid",
    gridTemplateColumns: "160px 1fr 160px",
    gap: "1rem",
    alignItems: "center",
    backgroundColor: "#0f1335",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "8px",
    padding: "0.85rem 1rem",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
    transition: "box-shadow 0.15s, border-color 0.15s",
    width: "100%",
  },
  msgRowUnread: {
    borderLeftWidth: "3px",
    borderLeftColor: "#c9a961",
  },
  msgLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    overflow: "hidden",
  },
  msgName: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#e0e0e0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  msgEmail: {
    fontSize: "0.78rem",
    color: "#6b6b7e",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  msgPreview: {
    fontSize: "0.85rem",
    color: "#a0a0b0",
    margin: 0,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  msgRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "0.4rem",
  },
  msgDate: {
    fontSize: "0.75rem",
    color: "#6b6b7e",
    whiteSpace: "nowrap",
  },
  statusBadge: {
    fontSize: "0.7rem",
    fontWeight: 700,
    borderRadius: "20px",
    padding: "0.2rem 0.6rem",
    letterSpacing: "0.02em",
    whiteSpace: "nowrap",
  },
  statusReplied: {
    backgroundColor: "rgba(201,169,97,0.1)",
    color: "#c9a961",
  },
  statusPending: {
    backgroundColor: "rgba(251,191,36,0.1)",
    color: "#fbbf24",
  },

  // ── Modal ──
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(5,8,20,0.8)",
    backdropFilter: "blur(4px)",
    zIndex: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
  },
  modal: {
    backgroundColor: "#0f1335",
    border: "1px solid rgba(201,169,97,0.2)",
    borderRadius: "12px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
    width: "100%",
    maxWidth: "560px",
    maxHeight: "90vh",
    overflow: "auto",
  },
  modalHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  modalTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#ffffff",
    margin: 0,
  },
  modalMeta: {
    fontSize: "0.78rem",
    color: "#6b6b7e",
    marginTop: "2px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    lineHeight: 1,
    color: "#6b6b7e",
    cursor: "pointer",
    padding: "0 0 0 1rem",
    flexShrink: 0,
  },
  modalBody: {
    padding: "1.25rem 1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.1rem",
  },
  senderInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    backgroundColor: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "8px",
    padding: "0.85rem 1rem",
  },
  senderRow: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "baseline",
  },
  senderLabel: {
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "rgba(201,169,97,0.5)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    minWidth: "56px",
    flexShrink: 0,
  },
  senderValue: {
    fontSize: "0.9rem",
    color: "#e0e0e0",
  },
  msgBox: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  msgBoxLabel: {
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "rgba(201,169,97,0.5)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    margin: 0,
  },
  msgBoxText: {
    fontSize: "0.92rem",
    color: "#e0e0e0",
    lineHeight: 1.6,
    margin: 0,
    whiteSpace: "pre-wrap",
  },
  replyBox: {
    backgroundColor: "rgba(201,169,97,0.06)",
    border: "1px solid rgba(201,169,97,0.15)",
    borderRadius: "8px",
    padding: "0.85rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  replyBoxLabel: {
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "rgba(201,169,97,0.6)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    margin: 0,
  },
  replyBoxText: {
    fontSize: "0.9rem",
    color: "#c9a961",
    lineHeight: 1.6,
    margin: 0,
    whiteSpace: "pre-wrap",
  },
  replyForm: {
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
  },

  // ── Shared ──
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    backgroundColor: "#0f1335",
    border: "1px solid rgba(201,169,97,0.12)",
    borderRadius: "10px",
    padding: "1.5rem",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "1rem",
  },
  label: {
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "rgba(201,169,97,0.6)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  input: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    padding: "0.55rem 0.75rem",
    fontSize: "0.95rem",
    color: "#e0e0e0",
    backgroundColor: "#1a1f3a",
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.18s, background 0.18s",
  },
  dropZone: {
    border: "2px dashed rgba(201,169,97,0.2)",
    borderRadius: "8px",
    padding: "1.5rem 1rem",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: "rgba(201,169,97,0.03)",
    transition: "border-color 0.2s, background-color 0.2s",
  },
  dropZoneActive: {
    borderColor: "#c9a961",
    backgroundColor: "rgba(201,169,97,0.08)",
  },
  dropText: {
    color: "#6b6b7e",
    fontSize: "0.9rem",
    pointerEvents: "none",
  },
  imgHint: {
    fontSize: "0.78rem",
    color: "#6b6b7e",
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
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#1a1f3a",
    cursor: "grab",
    userSelect: "none",
  },
  imgCardOver: {
    borderColor: "#c9a961",
    boxShadow: "0 0 0 2px rgba(201,169,97,0.25)",
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
    backgroundColor: "#c9a961",
    color: "#0a0e27",
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
    backgroundColor: "rgba(0,0,0,0.65)",
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
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  arrowBtn: {
    flex: 1,
    border: "none",
    backgroundColor: "#1a1f3a",
    color: "#c9a961",
    fontSize: "1rem",
    padding: "4px 0",
    cursor: "pointer",
    transition: "background-color 0.15s",
  },
  progressOuter: {
    position: "relative",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: "4px",
    height: "8px",
    overflow: "visible",
  },
  progressInner: {
    height: "100%",
    backgroundColor: "#c9a961",
    borderRadius: "4px",
    transition: "width 0.3s",
  },
  progressText: {
    position: "absolute",
    top: "10px",
    left: 0,
    fontSize: "0.75rem",
    color: "#c9a961",
  },
  formActions: {
    display: "flex",
    gap: "0.75rem",
    justifyContent: "flex-end",
    marginTop: "0.5rem",
  },
  submitBtn: {
    backgroundColor: "#c9a961",
    color: "#0a0e27",
    border: "none",
    borderRadius: "8px",
    padding: "0.65rem 1.5rem",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.02em",
    transition: "opacity 0.18s",
  },
  cancelBtn: {
    backgroundColor: "transparent",
    color: "#c9a961",
    border: "1px solid rgba(201,169,97,0.3)",
    borderRadius: "8px",
    padding: "0.65rem 1.25rem",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "border-color 0.18s",
  },
  errorMsg: {
    color: "#ef4444",
    fontSize: "0.9rem",
    backgroundColor: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "6px",
    padding: "0.6rem 0.9rem",
    margin: 0,
  },
  statusText: {
    color: "#6b6b7e",
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
    backgroundColor: "#0f1335",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "8px",
    overflow: "hidden",
  },
  thumb: {
    width: "100%",
    aspectRatio: "16/9",
    backgroundColor: "#1a1f3a",
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
    color: "#6b6b7e",
    fontSize: "0.8rem",
  },
  carInfo: {
    padding: "0.75rem 1rem",
    flex: 1,
  },
  carTitle: {
    fontWeight: 600,
    color: "#e0e0e0",
    fontSize: "0.95rem",
    marginBottom: "0.2rem",
  },
  carMeta: {
    fontSize: "0.85rem",
    color: "#6b6b7e",
  },
  carActions: {
    display: "flex",
    gap: "0.5rem",
    padding: "0.75rem 1rem",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  editBtn: {
    flex: 1,
    backgroundColor: "#c9a961",
    color: "#0a0e27",
    border: "none",
    borderRadius: "6px",
    padding: "0.45rem 0",
    fontSize: "0.85rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "opacity 0.18s",
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: "transparent",
    color: "#ef4444",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "6px",
    padding: "0.45rem 0",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "border-color 0.18s",
  },
};
