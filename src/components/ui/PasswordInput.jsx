import { useState } from 'react';

// Password field with a show/hide eye toggle, matching the pattern already
// used on the admin login page. Renders the <input> and toggle button as
// siblings (no extra wrapper div) so it can drop straight into Bootstrap's
// `.form-floating` (which relies on the input being a direct child) — just
// add `position-relative` to that existing container.
export default function PasswordInput({ inputClassName = '', ...inputProps }) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <input
        type={visible ? 'text' : 'password'}
        className={`pe-5 ${inputClassName}`}
        {...inputProps}
      />
      <button
        type="button"
        className="btn password-toggle-btn position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 bg-transparent text-body-secondary"
        style={{ zIndex: 5, width: 32, height: 32 }}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        tabIndex={-1}
      >
        <i className={`fa-solid ${visible ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
      </button>
    </>
  );
}
