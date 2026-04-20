import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Activity, Eye, EyeOff, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import { useAuthStore } from '../../store/auth'
import { RegisterForm } from '../../lib/types'
import { getApiError } from '../../lib/utils'
import { Input, Button, Select, Alert } from '../../components/ui'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>()

  async function onSubmit(data: RegisterForm) {
    setServerError('')
    try {
      const res = await api.post('/auth/register/', data)
      setAuth(res.data.user, res.data.tokens)
      toast.success(`${res.data.hospital.name} registered successfully!`)
      navigate('/dashboard')
    } catch (err) {
      setServerError(getApiError(err))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-2xl text-slate-900">ReferChain</span>
        </div>

        <div className="card p-8">
          <div className="mb-8">
            <h1 className="text-3xl text-slate-900 mb-2">Register your hospital</h1>
            <p className="text-slate-500 text-sm">
              Create your hospital's account to start managing referrals digitally
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-brand-50 rounded-xl p-4 mb-8 space-y-2">
            {[
              'Replace paper referral letters with digital records',
              'Track patients across hospitals in real time',
              'Invite and manage your doctors easily',
            ].map((benefit) => (
              <div key={benefit} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-brand-800">{benefit}</p>
              </div>
            ))}
          </div>

          {serverError && (
            <div className="mb-6">
              <Alert type="error" message={serverError} />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="border-b border-slate-100 pb-5 mb-2">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">
                Hospital details
              </p>
              <div className="space-y-4">
                <Input
                  label="Hospital name"
                  placeholder="Lagos General Hospital"
                  error={errors.hospital_name?.message}
                  required
                  {...register('hospital_name', {
                    required: 'Hospital name is required',
                    minLength: { value: 3, message: 'Name must be at least 3 characters' },
                  })}
                />
                <Input
                  label="Hospital address"
                  placeholder="123 Marina Road, Lagos Island"
                  error={errors.hospital_address?.message}
                  required
                  {...register('hospital_address', {
                    required: 'Address is required',
                  })}
                />
                <Select
                  label="Hospital tier"
                  placeholder="Select tier"
                  error={errors.hospital_tier?.message}
                  required
                  options={[
                    { value: 'primary', label: 'Primary — Community Health Centre' },
                    { value: 'secondary', label: 'Secondary — General Hospital' },
                    { value: 'tertiary', label: 'Tertiary — Teaching / Specialist Hospital' },
                  ]}
                  {...register('hospital_tier', {
                    required: 'Please select a tier',
                  })}
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">
                Admin account
              </p>
              <div className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="admin@hospital.com"
                  error={errors.email?.message}
                  required
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address',
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
                      placeholder="Min. 8 characters"
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
                  <p className="form-hint">Must have uppercase letter and number</p>
                </div>
              </div>
            </div>

            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              {isSubmitting ? 'Creating account...' : 'Create hospital account'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already registered?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
