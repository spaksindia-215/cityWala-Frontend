import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import API from '../api/axios'
import AuthCard from '../components/ui/AuthCard'

const RESEND_COOLDOWN_SECONDS = 60

export default function VerificationPending() {
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || '')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [message, setMessage] = useState('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleResend = async (e) => {
    e.preventDefault()
    if (cooldown > 0 || !email) return

    setStatus('sending')
    setMessage('')

    try {
      const { data } = await API.post('/auth/resend-verification', { email })
      setStatus('sent')
      setMessage(data?.message || 'Verification email sent.')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setStatus('error')
      if (err.response?.status === 429) {
        setMessage(err.response?.data?.message || 'Please wait before requesting another email.')
        setCooldown(RESEND_COOLDOWN_SECONDS)
      } else {
        setMessage(err.response?.data?.message || 'Something went wrong. Please try again.')
      }
    }
  }

  return (
    <AuthCard title="Verify Your Email">
      <div className="text-center">
        <i className="fa-solid fa-envelope-circle-check fa-3x mb-3" style={{ color: 'var(--cw-blue-600)' }} aria-hidden="true"></i>
        <h2 className="mb-2">Please verify your email</h2>
        <p className="text-body-secondary mb-4">
          We've sent a verification link to your email address. Click the link to activate your account.
          The link expires in 1 hour.
        </p>

        {message && (
          <div className={`alert ${status === 'error' ? 'alert-danger' : 'alert-success'} py-2`}>
            {message}
          </div>
        )}

        <form onSubmit={handleResend}>
          <div className="form-floating mb-3 text-start">
            <input
              type="email"
              className="form-control"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label>Email address</label>
          </div>

          <button
            className="nav-btn primary w-100"
            style={{ height: 48 }}
            type="submit"
            disabled={status === 'sending' || cooldown > 0 || !email}
          >
            {cooldown > 0
              ? `Resend available in ${cooldown}s`
              : status === 'sending'
                ? 'Sending…'
                : 'Resend Verification Email'}
          </button>
        </form>

        <div className="text-center mt-3">
          <Link to="/login" style={{ fontSize: 14 }}>Back to Login</Link>
        </div>
      </div>
    </AuthCard>
  )
}
