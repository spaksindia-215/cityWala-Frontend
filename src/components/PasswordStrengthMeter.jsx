import { useMemo } from 'react';

// Utility functions
const validatePasswordRequirements = (password, email, firstName = '', lastName = '') => {
  const requirements = {
    minLength: password.length >= 8,
    maxLength: password.length <= 128,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    noSpaces: !/\s/.test(password),
    notEmail: !email || !password.toLowerCase().includes(email.split('@')[0].toLowerCase()),
    notName: !includesName(password, firstName, lastName),
  };
  return requirements;
};

const includesName = (password, firstName, lastName) => {
  const passwordLower = password.toLowerCase();
  const firstNameTrim = firstName?.toLowerCase().trim();
  const lastNameTrim = lastName?.toLowerCase().trim();

  if (firstNameTrim && firstNameTrim.length > 2 && passwordLower.includes(firstNameTrim)) {
    return true;
  }
  if (lastNameTrim && lastNameTrim.length > 2 && passwordLower.includes(lastNameTrim)) {
    return true;
  }
  return false;
};

const calculateStrength = (password) => {
  if (!password) return 0;
  let strength = 0;

  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 0.5;
  if (/[A-Z]/.test(password)) strength += 0.5;
  if (/[a-z]/.test(password)) strength += 0.5;
  if (/[0-9]/.test(password)) strength += 0.5;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 0.5;

  return Math.min(Math.round(strength), 4);
};

const getStrengthLabel = (strength) => {
  if (strength <= 1) return 'Weak';
  if (strength === 2) return 'Fair';
  if (strength === 3) return 'Good';
  return 'Strong';
};

const getStrengthVariant = (strength) => {
  if (strength <= 1) return 'weak';
  if (strength === 2) return 'fair';
  if (strength === 3) return 'good';
  return 'strong';
};

function RequirementItem({ met, label }) {
  return (
    <div className="d-flex align-items-center gap-2 mb-2">
      <i
        className={`fa-solid ${met ? 'fa-circle-check' : 'fa-circle-xmark'}`}
        style={{ fontSize: 14, color: met ? 'var(--cw-success)' : 'var(--cw-gray-300)' }}
        aria-hidden="true"
      ></i>
      <span
        style={{
          fontSize: 13,
          color: met ? 'var(--cw-success)' : 'var(--cw-gray-500)',
          textDecoration: met ? 'line-through' : 'none',
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function PasswordStrengthMeter({
  password = '',
  email = '',
  firstName = '',
  lastName = '',
  showMeter = true,
  showRequirements = true,
}) {
  const requirements = useMemo(
    () => validatePasswordRequirements(password, email, firstName, lastName),
    [password, email, firstName, lastName]
  );

  const strength = useMemo(() => calculateStrength(password), [password]);
  const strengthLabel = getStrengthLabel(strength);
  const strengthVariant = getStrengthVariant(strength);

  const allRequirementsMet = Object.values(requirements).every(v => v);

  return (
    <div className="password-strength-meter">
      {showMeter && password && (
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <small className="text-body-secondary">Password Strength</small>
            <small className="fw-bold" style={{ color: `var(--cw-${strengthVariant === 'weak' ? 'danger' : strengthVariant === 'fair' ? 'warning' : strengthVariant === 'good' ? 'success' : 'blue-600'})` }}>
              {strengthLabel}
            </small>
          </div>
          <div className="cw-pw-meter">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`cw-pw-meter__seg${i < strength ? ` is-filled--${strengthVariant}` : ''}`}
              />
            ))}
          </div>
        </div>
      )}

      {showRequirements && (
        <div className="password-requirements mt-3">
          <small className="d-block mb-2 fw-bold text-body-secondary">
            Password must contain:
          </small>

          <RequirementItem met={requirements.minLength} label="At least 8 characters" />
          <RequirementItem met={requirements.maxLength} label="Maximum 128 characters" />
          <RequirementItem met={requirements.uppercase} label="One uppercase letter (A–Z)" />
          <RequirementItem met={requirements.lowercase} label="One lowercase letter (a–z)" />
          <RequirementItem met={requirements.number} label="One number (0–9)" />
          <RequirementItem met={requirements.special} label="One special character (!@#$%^&* etc.)" />
          <RequirementItem met={requirements.noSpaces} label="No spaces" />
          <RequirementItem met={requirements.notEmail} label="Cannot contain your email" />
          <RequirementItem met={requirements.notName} label="Cannot contain your name" />

          {password && (
            <div
              className="mt-3 p-2 rounded-3"
              style={{
                background: allRequirementsMet ? 'var(--cw-success-50)' : 'var(--cw-danger-50)',
                borderLeft: `3px solid var(--cw-${allRequirementsMet ? 'success' : 'danger'})`,
              }}
            >
              <small style={{ color: allRequirementsMet ? 'var(--cw-success)' : 'var(--cw-danger)' }}>
                <i className={`fa-solid ${allRequirementsMet ? 'fa-circle-check' : 'fa-circle-xmark'} me-1`} aria-hidden="true"></i>
                {allRequirementsMet
                  ? 'Password is strong and meets all requirements'
                  : 'Password does not meet all requirements'}
              </small>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
