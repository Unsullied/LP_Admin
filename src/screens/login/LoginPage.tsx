import { useRouter } from 'next/router'
import type React from 'react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { requestOtp, verifyOtp } from '@/lib/auth-api'
import form from '@/styles/form.module.css'
import ui from '@/styles/ui.module.css'
import type { LoginStep } from '@/types/login'

import styles from './login.module.css'

const LoginPage: React.FC = () => {
  const router = useRouter()
  const { signIn } = useAuth()

  const [step, setStep] = useState<LoginStep>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const phoneDigits = useMemo(() => phone.replace(/\D/g, ''), [phone])
  const isValidPhone = phoneDigits.length === 10

  const onRequestOtp = async () => {
    setError(null)
    setInfo(null)
    if (!isValidPhone) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }
    setLoading(true)
    try {
      const res = await requestOtp(phoneDigits)
      if (!res.ok) {
        setError(res.error.message)
        return
      }
      setInfo(res.data.message || 'OTP sent (dev mode).')
      setStep('verify')
    } finally {
      setLoading(false)
    }
  }

  const onVerify = async () => {
    setError(null)
    setInfo(null)
    if (!isValidPhone) {
      setError('Please go back and enter a valid 10-digit mobile number.')
      return
    }
    setLoading(true)
    try {
      const res = await verifyOtp({ phone: phoneDigits, code: code.trim() })
      if (!res.ok) {
        setError(res.error.message)
        return
      }
      await signIn(res.data.token)
      void router.replace('/admin')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={ui.centerPage}>
      <div className={ui.card} style={{ width: '100%', maxWidth: 520, padding: 20 }}>
        <div className={styles.titleRow}>
          <div className={styles.title}>LP Admin</div>
          <div className={styles.hint}>
            Backend: {process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8787'}
          </div>
        </div>

        {step === 'phone' && (
          <>
            <div className={form.field}>
              <div className={form.label}>Phone</div>
              <input
                className={form.control}
                placeholder="Enter mobile number (e.g. 9986589075)"
                inputMode="tel"
                value={phone}
                onChange={(e) => {
                  const next = e.target.value.replace(/\D/g, '').slice(0, 10)
                  setPhone(next)
                  if (error) setError(null)
                }}
              />
            </div>

            <div className={ui.btnRow} style={{ marginTop: 14 }}>
              <Button variant="primary" onClick={onRequestOtp} disabled={loading || !isValidPhone}>
                Get OTP
              </Button>
            </div>
          </>
        )}

        {step === 'verify' && (
          <>
            <div className={form.field}>
              <div className={form.label}>OTP (dev accepts any 6 digits)</div>
              <input
                className={form.control}
                placeholder="123456"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div className={ui.btnRow} style={{ marginTop: 14 }}>
              <Button onClick={() => setStep('phone')} disabled={loading}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={onVerify}
                disabled={loading || code.trim().length !== 6}
              >
                Verify & Sign in
              </Button>
            </div>
          </>
        )}

        {!!error && (
          <div className={ui.error} style={{ marginTop: 12 }}>
            {error}
          </div>
        )}
        {!!info && (
          <div className={ui.success} style={{ marginTop: 12 }}>
            {info}
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginPage
