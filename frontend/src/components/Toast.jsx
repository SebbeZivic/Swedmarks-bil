import { useCallback, useRef, useState } from "react";

export function useToast() {
  const [message, setMessage] = useState("");
  const timerRef = useRef(null);

  const showToast = useCallback((msg) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    timerRef.current = setTimeout(() => setMessage(""), 2500);
  }, []);

  return [showToast, message];
}

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <>
      <style>{`
        @keyframes toast-slide-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        backgroundColor: "#0f1335",
        border: "1px solid rgba(201,169,97,0.4)",
        borderRadius: "10px",
        padding: "0.7rem 1.1rem",
        color: "#c9a961",
        fontSize: "0.875rem",
        fontWeight: 600,
        zIndex: 9999,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        gap: "0.45rem",
        animation: "toast-slide-in 0.22s ease both",
        pointerEvents: "none",
        maxWidth: "280px",
        letterSpacing: "0.01em",
      }}>
        {message}
      </div>
    </>
  );
}
