import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

let idSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const showToast = useCallback((text, type = "info", duration = 4000) => {
    const id = ++idSeq;
    setToasts((prev) => [...prev, { id, text, type }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="cw-toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className={`cw-toast cw-toast--${t.type}`} role="status">
            <i className={`fa-solid ${iconFor(t.type)} cw-toast__icon`} aria-hidden="true"></i>
            <span className="cw-toast__text">{t.text}</span>
            <button
              type="button"
              className="cw-toast__close"
              aria-label="Dismiss notification"
              onClick={() => dismiss(t.id)}
            >
              <i className="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function iconFor(type) {
  if (type === "success") return "fa-circle-check";
  if (type === "danger") return "fa-circle-exclamation";
  if (type === "warning") return "fa-triangle-exclamation";
  return "fa-circle-info";
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
