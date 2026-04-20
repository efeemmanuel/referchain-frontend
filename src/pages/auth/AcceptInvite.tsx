import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Activity, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import { AcceptInviteForm, Invitation } from '../../lib/types'
import { getApiError } from '../../lib/utils'
import { Input, Button, Alert, Spinner } from '../../components/ui'

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [verifying, setVerifying] = useState(true)
  const [tokenError, setTokenError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInviteForm>()

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setTokenError('No invitation token found. Please use the link from your email.')
      setVerifying(false)
      return
    }

    api
      .get(`/invitations/verify/?token=${token}`)
      .then((res) => {
        setInvitation(res.data)
      })
      .catch((err) => {
        setTokenError(getApiError(err))
      })
      .finally(() => setVerifying(false))
  }, [token])

  async function onSubmit(data: AcceptInviteForm) {
    setServerError('')
    try {
      await api.post('/invitations/accept/', { ...data, token })
      setSuccess(true)
      toast.success('Account created! You can now log in.')
    } catch (err) {
      setServerError(getApiError(err))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-2xl text-slate-900">ReferChain</span>
        </div>

        <div className="card p-8">
          {/* Verifying state */}
          {verifying && (
            <div className="flex flex-col items-center py-8 gap-4">
              <Spinner size="lg" />
              <p className="text-slate-500 text-sm">Verifying your invitation...</p>
            </div>
          )}

          {/* Token error */}
          {!verifying && tokenError && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl text-slate-900 mb-2">Invalid invitation</h2>
              <p className="text-slate-500 text-sm mb-6">{tokenError}</p>
              <Link to="/login" className="btn-secondary text-sm px-4 py-2">
                Back to login
              </Link>
            </div>
          )}

          {/* Success state */}
          {success && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl text-slate-900 mb-2">Account created!</h2>
              <p className="text-slate-500 text-sm mb-6">
                Your doctor account is ready. Sign in to get started.
              </p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Go to login
              </Button>
            </div>
          )}

          {/* Form */}
          {!verifying && !tokenError && !success && invitation && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl text-slate-900 mb-2">Accept invitation</h1>
                <p className="text-slate-500 text-sm">
                  You've been invited to join{' '}
                  <span className="font-medium text-slate-700">{invitation.hospital}</span>
                </p>
              </div>

              <div className="bg-brand-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-brand-800">
                  <span className="font-medium">Invited email:</span> {invitation.email}
                </p>
              </div>

              {serverError && (
                <div className="mb-6">
                  <Alert type="error" message={serverError} />
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="Full name"
                  placeholder="Dr. Emeka Okafor"
                  error={errors.name?.message}
                  required
                  hint="Include your title e.g. Dr., Prof."
                  {...register('name', {
                    required: 'Full name is required',
                    pattern: {
                      value: /^[a-zA-Z\s.]+$/,
                      message: 'Name can only contain letters, spaces, and dots',
                    },
                  })}
                />
                <Input
                  label="Specialty"
                  placeholder="Cardiology"
                  error={errors.specialty?.message}
                  required
                  {...register('specialty', {
                    required: 'Specialty is required',
                    pattern: {
                      value: /^[a-zA-Z\s]+$/,
                      message: 'Specialty can only contain letters and spaces',
                    },
                  })}
                />
                <div className="form-group">
                  <label className="form-label">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      className={`input-base pr-12 ${errors.password ? 'input-error' : ''}`}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 8, message: 'At least 8 characters required' },
                        validate: {
                          hasUpper: (v) => /[A-Z]/.test(v) || 'Must contain an uppercase letter',
                          hasNumber: (v) => /[0-9]/.test(v) || 'Must contain a number',
                        },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="form-error"><span>⚠</span> {errors.password.message}</p>
                  )}
                  <p className="form-hint">Min 8 chars, one uppercase, one number</p>
                </div>

                <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
                  {isSubmitting ? 'Creating account...' : 'Complete registration'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
