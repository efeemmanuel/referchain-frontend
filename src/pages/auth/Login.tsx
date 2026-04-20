import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Activity, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import { useAuthStore } from '../../store/auth'
import { LoginForm } from '../../lib/types'
import { getApiError } from '../../lib/utils'
import { Input, Button, Alert } from '../../components/ui'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth, setHospital } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>()

  async function onSubmit(data: LoginForm) {
    setServerError('')
    try {
      const res = await api.post('/auth/login/', data)
      setAuth(res.data.user, res.data.tokens)

      // fetch hospital info after login
      if (res.data.user.role === 'hospital_admin') {
        try {
          const hRes = await api.get('/hospitals/me/')
          setHospital(hRes.data)
        } catch {}
      }

      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      setServerError(getApiError(err))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-2xl text-slate-900">ReferChain</span>
        </div>

        <div className="card p-8">
          <div className="mb-8">
            <h1 className="text-3xl text-slate-900 mb-2">Welcome back</h1>
            <p className="text-slate-500 text-sm">Sign in to your hospital or doctor account</p>
          </div>

          {serverError && <div className="mb-6"><Alert type="error" message={serverError} /></div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@hospital.com"
              error={errors.email?.message}
              required
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
              })}
            />
            <div className="form-group">
              <label className="form-label">Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  className={`input-base pr-12 ${errors.password ? 'input-error' : ''}`}
                  {...register('password', { required: 'Password is required' })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="form-error"><span>⚠</span> {errors.password.message}</p>}
            </div>
            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            New hospital?{' '}
            <Link to="/register" className="text-brand-600 hover:text-brand-700 font-medium">Create an account</Link>
          </p>
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">Secured by ReferChain · Nigeria's digital referral network</p>
      </div>
    </div>
  )
}
