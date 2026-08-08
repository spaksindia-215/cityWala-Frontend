import { useEffect, useRef } from "react";

/**
 * Confirmation dialog shown before deleting an FAQ — deletion is never
 * immediate on button click.
 *
 * Rendered as a plain fixed-position overlay rather than a Bootstrap JS modal:
 * the admin pages already mix Bootstrap markup with React state, and driving
 * bootstrap.Modal imperatively from an effect is the fragile part of that mix.
 */
export default function DeleteFAQModal({ faq, deleting, error, onCancel, onConfirm }) {
  const cancelRef = useRef(null);

  // Move focus into the dialog on open and close it on Escape.
  useEffect(() => {
    cancelRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape" && !deleting) onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel, deleting]);

  if (!faq) return null;

  return (
    <div
      className="cw-modal-backdrop"
      onClick={() => {
        if (!deleting) onCancel();
      }}
    >
      <div
        className="cw-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-faq-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="delete-faq-title" className="cw-modal__title">Delete FAQ?</h2>

        <p className="cw-modal__text">
          Are you sure you want to delete this FAQ? This action cannot be undone.
        </p>

        <p className="cw-modal__subject">{faq.question}</p>

        {error && (
          <p className="cw-modal__error" role="alert">{error}</p>
        )}

        <div className="cw-modal__actions">
          <button
            type="button"
            className="nav-btn outline"
            onClick={onCancel}
            disabled={deleting}
            ref={cancelRef}
          >
            Cancel
          </button>
          <button
            type="button"
            className="nav-btn ghost-danger"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
