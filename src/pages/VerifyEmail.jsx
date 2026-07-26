import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import API from '../api/axios'
import AuthCard from '../components/ui/AuthCard'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState('loading') // loading | success | already | invalid | expired | error
  const [message, setMessage] = useState('')
  const requested = useRef(false)

  useEffect(() => {
    if (requested.current) return
    requested.current = true

    if (!token) {
      setStatus('invalid')
      setMessage('This verification link is missing a token.')
      return
    }

    const verify = async () => {
      try {
        const { data } = await API.post('/auth/verify-email', { token })
        if (data?.alreadyVerified) {
          setStatus('already')
        } else {
          setStatus('success')
        }
        setMessage(data?.message || '')
      } catch (err) {
        const httpStatus = err.response?.status
        const serverMessage = err.response?.data?.message

        if (httpStatus === 410) {
          setStatus('expired')
        } else {
          setStatus('invalid')
        }
        setMessage(serverMessage || 'This verification link is invalid.')
      }
    }

    verify()
  }, [token])

  return (
    <AuthCard title="Email Verification">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="spinner-border text-primary mb-3" role="status" />
            <p className="text-body-secondary">Verifying your email…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <i className="fa-solid fa-circle-check fa-3x mb-3 text-success" aria-hidden="true"></i>
            <h2 className="mb-2">Email verified!</h2>
            <p className="text-body-secondary mb-4">
              Your email has been verified successfully. You can now log in to your account.
            </p>
            <Link to="/login" className="nav-btn primary w-100" style={{ height: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              Go to Login
            </Link>
          </>
        )}

        {status === 'already' && (
          <>
            <i className="fa-solid fa-circle-check fa-3x mb-3 text-success" aria-hidden="true"></i>
            <h2 className="mb-2">Already verified</h2>
            <p className="text-body-secondary mb-4">
              This email address has already been verified. You can log in normally.
            </p>
            <Link to="/login" className="nav-btn primary w-100" style={{ height: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              Go to Login
            </Link>
          </>
        )}

        {status === 'expired' && (
          <>
            <i className="fa-solid fa-clock fa-3x mb-3 text-warning" aria-hidden="true"></i>
            <h2 className="mb-2">Link expired</h2>
            <p className="text-body-secondary mb-4">
              This verification link has expired. Please request a new one.
            </p>
            <Link to="/verify-email-pending" className="nav-btn primary w-100" style={{ height: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              Resend Verification Email
            </Link>
          </>
        )}

        {status === 'invalid' && (
          <>
            <i className="fa-solid fa-circle-exclamation fa-3x mb-3 text-danger" aria-hidden="true"></i>
            <h2 className="mb-2">Invalid link</h2>
            <p className="text-body-secondary mb-4">{message || 'This verification link is invalid or has already been used.'}</p>
            <Link to="/verify-email-pending" className="nav-btn primary w-100" style={{ height: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              Resend Verification Email
            </Link>
          </>
        )}

        <div className="text-center mt-3">
          <Link to="/login" style={{ fontSize: 14 }}>Back to Login</Link>
        </div>
      </div>
    </AuthCard>
  )
}
