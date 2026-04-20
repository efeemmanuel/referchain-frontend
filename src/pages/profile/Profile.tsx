import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Building2, Mail, MapPin, Shield, User, Edit3, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import { useAuthStore } from '../../store/auth'
import { Hospital } from '../../lib/types'
import { formatDate, getApiError } from '../../lib/utils'
import { Button, Input, Select, Alert, Spinner } from '../../components/ui'
import { DashboardLayout } from '../../components/layout/DashboardLayout'

export default function ProfilePage() {
  const { user, hospital, setHospital } = useAuthStore()
  const isAdmin = user?.role === 'hospital_admin'
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Partial<Hospital>>()

  useEffect(() => {
    if (isAdmin) {
      api.get('/hospitals/me/').then((res) => {
        setHospital(res.data)
        reset(res.data)
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  async function onSubmit(data: Partial<Hospital>) {
    setServerError('')
    try {
      const res = await api.patch('/hospitals/me/', data)
      setHospital(res.data)
      toast.success('Hospital profile updated')
      setEditing(false)
    } catch (err) {
      setServerError(getApiError(err))
    }
  }

  if (loading) return <DashboardLayout><div className="flex justify-center py-16"><Spinner size="lg" /></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="page-container max-w-2xl">
        <div className="page-header">
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account and hospital information</p>
        </div>

        <div className="space-y-6 animate-stagger">
          {/* Account info */}
          <div className="card p-6">
            <h2 className="text-base font-medium text-slate-700 mb-5 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" /> Account
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-700 text-lg font-medium">{user?.email?.[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-medium text-slate-800">{user?.email}</p>
                  <p className="text-sm text-slate-500 capitalize mt-0.5">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Shield className="w-4 h-4 text-slate-400" />
                <span className="capitalize">{user?.role?.replace('_', ' ')}</span>
                <span className="badge badge-accepted ml-1">Active</span>
              </div>
            </div>
          </div>

          {/* Hospital info — admin only */}
          {isAdmin && hospital && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-medium text-slate-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" /> Hospital
                </h2>
                {!editing && (
                  <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </Button>
                )}
              </div>

              {!editing ? (
                <div className="space-y-4">
                  <InfoRow label="Hospital name" value={hospital.name} />
                  <InfoRow label="Address" value={hospital.address} />
                  <InfoRow label="Tier" value={hospital.tier.charAt(0).toUpperCase() + hospital.tier.slice(1)} />
                  <InfoRow label="Status" value={hospital.is_active ? 'Active' : 'Inactive'} />
                  <InfoRow label="Verified" value={hospital.is_verified ? 'Yes' : 'Pending verification'} />
                  <InfoRow label="Registered" value={formatDate(hospital.created_at)} />
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {serverError && <Alert type="error" message={serverError} />}
                  <Input
                    label="Hospital name"
                    error={errors.name?.message}
                    required
                    {...register('name', { required: 'Hospital name is required' })}
                  />
                  <Input
                    label="Address"
                    error={errors.address?.message}
                    required
                    {...register('address', { required: 'Address is required' })}
                  />
                  <Select
                    label="Tier"
                    options={[
                      { value: 'primary', label: 'Primary' },
                      { value: 'secondary', label: 'Secondary' },
                      { value: 'tertiary', label: 'Tertiary' },
                    ]}
                    {...register('tier')}
                  />
                  <div className="flex gap-3 pt-2">
                    <Button variant="secondary" type="button" onClick={() => { setEditing(false); reset(hospital) }}>
                      Cancel
                    </Button>
                    <Button type="submit" loading={isSubmitting}>
                      <Check className="w-4 h-4" /> Save changes
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Doctor info — doctor only */}
          {!isAdmin && (
            <div className="card p-6">
              <h2 className="text-base font-medium text-slate-700 mb-5 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" /> Doctor info
              </h2>
              <div className="bg-brand-50 rounded-xl p-4">
                <p className="text-sm text-brand-800">
                  To update your name or specialty, contact your hospital administrator.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-slate-50 last:border-0">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-sm text-slate-700 font-medium text-right">{value}</p>
    </div>
  )
}
