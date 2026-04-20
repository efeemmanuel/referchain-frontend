import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  FileText, Plus, Search, CheckCircle, XCircle, ChevronRight,
  Building2, User, AlertTriangle, Clock, ArrowLeft, Copy,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import { useAuthStore } from '../../store/auth'
import { Referral, ReferralChain, Patient, Hospital, CreateReferralForm } from '../../lib/types'
import { formatDate, formatDateTime, getApiError } from '../../lib/utils'
import { Button, EmptyState, Select, Textarea, Alert, Spinner, Badge, Modal } from '../../components/ui'
import { DashboardLayout } from '../../components/layout/DashboardLayout'

// ─── Referrals List ───────────────────────────────────────────────────────────
export function ReferralsPage() {
  const { user } = useAuthStore()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const isDoctor = user?.role === 'doctor'

  useEffect(() => {
    api.get('/referrals/').then((res) => setReferrals(res.data)).finally(() => setLoading(false))
  }, [])

  const filtered = referrals.filter((r) => {
    const matchSearch =
      r.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      r.referring_hospital_name.toLowerCase().includes(search.toLowerCase()) ||
      r.receiving_hospital_name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || r.status === filter
    return matchSearch && matchFilter
  })

  return (
    <DashboardLayout>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="page-title">Referrals</h1>
            <p className="page-subtitle">
              {referrals.length} total referral{referrals.length !== 1 ? 's' : ''}
            </p>
          </div>
          {isDoctor && (
            <Link to="/referrals/new">
              <Button><Plus className="w-4 h-4" /> New referral</Button>
            </Link>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input-base pl-11" placeholder="Search by patient, hospital..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'accepted', 'rejected', 'completed'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-brand-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-8 h-8" />}
            title={search || filter !== 'all' ? 'No referrals found' : 'No referrals yet'}
            description={
              search || filter !== 'all'
                ? 'Try adjusting your filters'
                : isDoctor
                ? 'Create your first referral to transfer a patient to another hospital.'
                : 'Referrals sent to or from your hospital will appear here.'
            }
            action={
              isDoctor && !search && filter === 'all'
                ? <Link to="/referrals/new"><Button><Plus className="w-4 h-4" /> New referral</Button></Link>
                : undefined
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="table-container hidden sm:block">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Route</th>
                    <th>Urgency</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((referral) => (
                    <tr key={referral.id}>
                      <td>
                        <p className="font-medium text-slate-800">{referral.patient_name}</p>
                        <p className="text-xs text-slate-400">Dr. {referral.referring_doctor_name}</p>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <span className="truncate max-w-[90px]">{referral.referring_hospital_name}</span>
                          <ChevronRight className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate max-w-[90px]">{referral.receiving_hospital_name}</span>
                        </div>
                      </td>
                      <td>
                        <Badge variant={referral.urgency_level as 'low' | 'medium' | 'high' | 'critical'}>
                          {referral.urgency_level}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={referral.status as 'pending' | 'accepted' | 'rejected' | 'completed'}>
                          {referral.status}
                        </Badge>
                      </td>
                      <td className="text-slate-400 text-xs">{formatDate(referral.created_at)}</td>
                      <td>
                        <Link to={`/referrals/${referral.id}`}
                          className="text-brand-600 hover:text-brand-700 text-xs font-medium">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {filtered.map((referral) => (
                <Link key={referral.id} to={`/referrals/${referral.id}`} className="card p-4 block">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-slate-800">{referral.patient_name}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <span>{referral.referring_hospital_name}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span>{referral.receiving_hospital_name}</span>
                      </div>
                    </div>
                    <Badge variant={referral.status as 'pending' | 'accepted' | 'rejected' | 'completed'}>
                      {referral.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={referral.urgency_level as 'low' | 'medium' | 'high' | 'critical'}>
                      {referral.urgency_level}
                    </Badge>
                    <span className="text-xs text-slate-400">{formatDate(referral.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

// ─── New Referral ─────────────────────────────────────────────────────────────
export function NewReferralPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedPatient = searchParams.get('patient')
  const [patients, setPatients] = useState<Patient[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [hospitalSearch, setHospitalSearch] = useState('')
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [pRes, hRes] = await Promise.all([
          api.get('/patients/'),
          api.get('/hospitals/'),
        ])
        setPatients(pRes.data)
        setHospitals(hRes.data)
      } catch {
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter hospitals based on search
  const filteredHospitals = hospitals.filter((h) =>
    h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
    h.address.toLowerCase().includes(hospitalSearch.toLowerCase())
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateReferralForm>({
    defaultValues: {
      patient: preselectedPatient ? Number(preselectedPatient) : undefined,
    },
  })

  async function onSubmit(data: CreateReferralForm) {
    if (!selectedHospital) {
      toast.error('Please select a receiving hospital')
      return
    }
    setServerError('')
    try {
      const payload = { ...data, receiving_hospital: selectedHospital.id }
      const res = await api.post('/referrals/', payload)
      toast.success('Referral created! The receiving hospital has been notified by email.')
      navigate(`/referrals/${res.data.id}`)
    } catch (err) {
      setServerError(getApiError(err))
    }
  }

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center py-16"><Spinner size="lg" /></div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="page-container max-w-lg">
        <div className="mb-8">
          <button onClick={() => navigate(-1)}
            className="text-sm text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <h1 className="page-title">Create referral</h1>
          <p className="page-subtitle">Transfer a patient to another hospital for further care</p>
        </div>

        <div className="card p-8">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                The receiving hospital will be notified by email immediately after you submit.
              </p>
            </div>
          </div>

          {serverError && <div className="mb-6"><Alert type="error" message={serverError} /></div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Select
              label="Patient"
              placeholder="Select a patient"
              error={errors.patient?.message}
              required
              options={patients.map((p) => ({
                value: String(p.id),
                label: `${p.name} — ${p.unique_code}`,
              }))}
              {...register('patient', {
                required: 'Please select a patient',
                valueAsNumber: true,
              })}
            />

            {/* Hospital search by name — no ID needed */}
            <div className="form-group">
              <label className="form-label">
                Receiving hospital <span className="text-red-400">*</span>
              </label>

              {selectedHospital ? (
                // Show selected hospital
                <div className="flex items-center gap-3 p-4 bg-brand-50 rounded-xl border border-brand-200">
                  <Building2 className="w-5 h-5 text-brand-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-800">{selectedHospital.name}</p>
                    <p className="text-xs text-brand-600 capitalize mt-0.5">
                      {selectedHospital.tier} hospital · {selectedHospital.address}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedHospital(null)}
                    className="text-xs text-brand-500 hover:text-brand-700 font-medium flex-shrink-0">
                    Change
                  </button>
                </div>
              ) : (
                // Show search + list
                <div>
                  <div className="relative mb-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      className="input-base pl-11"
                      placeholder="Search hospital by name or address..."
                      value={hospitalSearch}
                      onChange={(e) => setHospitalSearch(e.target.value)}
                    />
                  </div>

                  {/* Scrollable hospital list */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                    {filteredHospitals.length === 0 ? (
                      <div className="p-6 text-center">
                        <Building2 className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">
                          {hospitalSearch
                            ? 'No hospitals match your search'
                            : 'No other hospitals registered yet'}
                        </p>
                      </div>
                    ) : (
                      filteredHospitals.map((h) => (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => {
                            setSelectedHospital(h)
                            setHospitalSearch('')
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors">
                          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4 text-slate-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-700 truncate">{h.name}</p>
                            <p className="text-xs text-slate-400 capitalize">
                              {h.tier} hospital · {h.address}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  <p className="form-hint mt-1">
                    Search and select the hospital you are referring this patient to
                  </p>
                </div>
              )}
            </div>

            <Select
              label="Urgency level"
              placeholder="Select urgency"
              error={errors.urgency_level?.message}
              required
              options={[
                { value: 'low', label: '🟢 Low — Routine referral' },
                { value: 'medium', label: '🟡 Medium — Needs attention soon' },
                { value: 'high', label: '🟠 High — Urgent care needed' },
                { value: 'critical', label: '🔴 Critical — Immediate attention required' },
              ]}
              {...register('urgency_level', { required: 'Please select urgency level' })}
            />

            <Textarea
              label="Symptoms and clinical notes"
              placeholder="Describe the patient's symptoms, current condition, and reason for referral..."
              error={errors.symptoms?.message}
              required
              {...register('symptoms', {
                required: 'Please describe the symptoms',
                minLength: {
                  value: 20,
                  message: 'Please provide more detail (at least 20 characters)',
                },
              })}
            />

            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              {isSubmitting ? 'Creating referral...' : 'Create referral'}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

// ─── Referral Detail ──────────────────────────────────────────────────────────
export function ReferralDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, hospital } = useAuthStore()
  const [referral, setReferral] = useState<Referral | null>(null)
  const [chain, setChain] = useState<ReferralChain | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<'accept' | 'reject' | 'complete' | null>(null)
  const [showChain, setShowChain] = useState(false)
  const isAdmin = user?.role === 'hospital_admin'

  useEffect(() => {
    api.get(`/referrals/${id}/`)
      .then((res) => setReferral(res.data))
      .catch(() => { toast.error('Referral not found'); navigate('/referrals') })
      .finally(() => setLoading(false))
  }, [id])

  async function loadChain() {
    try {
      const res = await api.get(`/referrals/${id}/chain/`)
      setChain(res.data)
      setShowChain(true)
    } catch {
      toast.error('Could not load referral chain')
    }
  }

  async function handleAccept() {
    setActionLoading('accept')
    try {
      const res = await api.patch(`/referrals/${id}/accept/`)
      setReferral(res.data)
      toast.success('Referral accepted. Patient has been notified by email with their code.')
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject() {
    setActionLoading('reject')
    try {
      const res = await api.patch(`/referrals/${id}/reject/`)
      setReferral(res.data)
      toast.success('Referral rejected.')
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setActionLoading(null)
    }
  }

  async function handleComplete() {
    setActionLoading('complete')
    try {
      const res = await api.patch(`/referrals/${id}/complete/`)
      setReferral(res.data)
      toast.success('Referral marked as completed. Patient care is now closed.')
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center py-16"><Spinner size="lg" /></div>
    </DashboardLayout>
  )

  if (!referral) return null

  // Only the RECEIVING hospital can accept, reject, or complete
  const isReceivingHospital = isAdmin && hospital?.id === referral.receiving_hospital
  const isReferringHospital = isAdmin && hospital?.id === referral.referring_hospital
  const canAct = isReceivingHospital && referral.status === 'pending'
  const canComplete = isReceivingHospital && referral.status === 'accepted'

  return (
    <DashboardLayout>
      <div className="page-container">
        <div className="mb-8">
          <button onClick={() => navigate('/referrals')}
            className="text-sm text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to referrals
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="page-title mb-0">{referral.patient_name}</h1>
                <Badge variant={referral.status as 'pending' | 'accepted' | 'rejected' | 'completed'}>
                  {referral.status}
                </Badge>
                <Badge variant={referral.urgency_level as 'low' | 'medium' | 'high' | 'critical'}>
                  {referral.urgency_level}
                </Badge>
              </div>
              <p className="page-subtitle">Referral · {formatDateTime(referral.created_at)}</p>
            </div>

            {/* Action buttons — only for receiving hospital */}
            <div className="flex gap-2 flex-shrink-0 flex-wrap">
              {canAct && (
                <>
                  <Button
                    variant="danger" size="sm" onClick={handleReject}
                    loading={actionLoading === 'reject'} disabled={!!actionLoading}>
                    <XCircle className="w-4 h-4" /> Reject
                  </Button>
                  <Button
                    size="sm" onClick={handleAccept}
                    loading={actionLoading === 'accept'} disabled={!!actionLoading}>
                    <CheckCircle className="w-4 h-4" /> Accept referral
                  </Button>
                </>
              )}
              {canComplete && (
                <Button
                  variant="secondary" size="sm" onClick={handleComplete}
                  loading={actionLoading === 'complete'} disabled={!!actionLoading}>
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Mark as completed
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Status banners */}

        {/* Receiving hospital — pending action */}
        {canAct && (
          <div className="card p-5 border-l-4 border-l-amber-400 mb-6">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700">Action required</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  This referral is waiting for your hospital to accept or reject it.
                  On acceptance the patient will be notified by email with their referral code.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Receiving hospital — accepted, can complete */}
        {canComplete && (
          <div className="card p-5 border-l-4 border-l-brand-400 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700">Referral active</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  You have accepted this referral. Once you have finished treating the patient,
                  click <strong>Mark as completed</strong> to close this referral.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Referring hospital — waiting */}
        {isReferringHospital && referral.status === 'pending' && (
          <div className="card p-5 border-l-4 border-l-blue-400 mb-6">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700">Waiting for response</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  This referral has been sent to {referral.receiving_hospital_name}.
                  You will be able to see when they accept or reject it here.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Accepted — show referral code */}
        {referral.status === 'accepted' && referral.unique_code && (
          <div className="card p-5 border-l-4 border-l-emerald-400 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700">Referral accepted</p>
                <p className="text-xs text-slate-500 mt-0.5 mb-3">
                  Patient has been notified by email with their referral code and QR code.
                  The patient should present this code at {referral.receiving_hospital_name}:
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <code className="text-lg font-mono bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl">
                    {referral.unique_code}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(referral.unique_code!)
                      toast.success('Code copied to clipboard')
                    }}
                    className="btn-ghost text-xs flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Copy code
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rejected */}
        {referral.status === 'rejected' && (
          <div className="card p-5 border-l-4 border-l-red-400 mb-6">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700">Referral rejected</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {referral.receiving_hospital_name} has rejected this referral.
                  You may refer this patient to a different hospital.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Completed */}
        {referral.status === 'completed' && (
          <div className="card p-5 border-l-4 border-l-slate-400 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700">Referral completed</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {referral.receiving_hospital_name} has completed care for this patient.
                  This referral is now closed.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Route */}
            <div className="card p-6">
              <h2 className="text-base font-medium text-slate-700 mb-4">Referral route</h2>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-50 rounded-xl p-4 text-center">
                  <Building2 className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">From</p>
                  <p className="text-sm font-medium text-slate-700 mt-0.5">
                    {referral.referring_hospital_name}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
                <div className="flex-1 bg-brand-50 rounded-xl p-4 text-center">
                  <Building2 className="w-5 h-5 text-brand-500 mx-auto mb-1" />
                  <p className="text-xs text-brand-500">To</p>
                  <p className="text-sm font-medium text-brand-700 mt-0.5">
                    {referral.receiving_hospital_name}
                  </p>
                </div>
              </div>
            </div>

            {/* Doctor */}
            <div className="card p-6">
              <h2 className="text-base font-medium text-slate-700 mb-4">Referring doctor</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Dr. {referral.referring_doctor_name}
                  </p>
                  <p className="text-xs text-slate-400">{referral.referring_hospital_name}</p>
                </div>
              </div>
            </div>

            {/* Chain */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-medium text-slate-700">Patient referral chain</h2>
                <Button variant="ghost" size="sm" onClick={loadChain}>View chain</Button>
              </div>
              <p className="text-sm text-slate-400">
                See the complete history of where this patient has been referred
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Clinical notes */}
            <div className="card p-6">
              <h2 className="text-base font-medium text-slate-700 mb-4">Clinical notes</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{referral.symptoms}</p>
            </div>

            {/* Test attachments */}
            {referral.test_attachments && referral.test_attachments.length > 0 && (
              <div className="card p-6">
                <h2 className="text-base font-medium text-slate-700 mb-4">Test attachments</h2>
                <div className="space-y-2">
                  {referral.test_attachments.map((attachment, i) => (
                    <div key={i}
                      className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                      <FileText className="w-4 h-4 text-slate-400" />
                      {attachment}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Patient link */}
            <div className="card p-6">
              <h2 className="text-base font-medium text-slate-700 mb-3">Patient profile</h2>
              <Link to={`/patients/${referral.patient}`}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-slate-200">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{referral.patient_name}</p>
                  <p className="text-xs text-slate-400">View full patient profile and medical records</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Chain modal */}
      <Modal isOpen={showChain} onClose={() => setShowChain(false)}
        title={`Referral chain — ${chain?.patient}`} size="lg">
        {chain && (
          <div>
            <p className="text-sm text-slate-500 mb-6">
              {chain.total_referrals} referral{chain.total_referrals !== 1 ? 's' : ''} in total
            </p>
            <div className="space-y-4">
              {chain.chain.map((r, i) => (
                <div key={r.id} className="relative">
                  {i < chain.chain.length - 1 && (
                    <div className="absolute left-5 top-12 w-0.5 h-6 bg-slate-200" />
                  )}
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${
                      r.status === 'accepted' || r.status === 'completed' ? 'bg-emerald-50' :
                      r.status === 'rejected' ? 'bg-red-50' : 'bg-amber-50'
                    }`}>
                      {r.status === 'accepted' || r.status === 'completed' ? '✓' :
                       r.status === 'rejected' ? '✕' : '…'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-medium text-slate-800">
                          {r.referring_hospital_name} → {r.receiving_hospital_name}
                        </p>
                        <Badge variant={r.status as 'pending' | 'accepted' | 'rejected' | 'completed'}>
                          {r.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{formatDate(r.created_at)}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{r.symptoms}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}