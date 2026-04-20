import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { UserPlus, Users, Mail, Stethoscope, Search, Send, User, ArrowLeft, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import { Doctor, InviteForm, Patient } from '../../lib/types'
import { formatDate, getApiError } from '../../lib/utils'
import { Button, EmptyState, Input, Alert, Spinner, ConfirmDialog, Badge } from '../../components/ui'
import { DashboardLayout } from '../../components/layout/DashboardLayout'

// ─── Doctors List ─────────────────────────────────────────────────────────────
export function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    api.get('/doctors/').then((res) => setDoctors(res.data)).finally(() => setLoading(false))
  }, [])

  const filtered = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.delete(`/doctors/${deleteId}/`)
      setDoctors((prev) => prev.filter((d) => d.id !== deleteId))
      toast.success('Doctor removed successfully')
      setDeleteId(null)
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="page-title">Doctors</h1>
            <p className="page-subtitle">{doctors.length} doctor{doctors.length !== 1 ? 's' : ''} in your hospital</p>
          </div>
          <Link to="/doctors/invite">
            <Button><UserPlus className="w-4 h-4" /> Invite doctor</Button>
          </Link>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input-base pl-11" placeholder="Search by name, specialty, or email..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8" />}
            title={search ? 'No doctors found' : 'No doctors yet'}
            description={search ? 'Try a different search term' : 'Invite your first doctor to get started.'}
            action={!search ? <Link to="/doctors/invite"><Button><UserPlus className="w-4 h-4" /> Invite doctor</Button></Link> : undefined}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="table-container hidden sm:block">
              <table className="table-base">
                <thead>
                  <tr><th>Doctor</th><th>Specialty</th><th>Status</th><th>Joined</th><th></th></tr>
                </thead>
                <tbody>
                  {filtered.map((doctor) => (
                    <tr key={doctor.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-brand-700 text-sm font-medium">{doctor.name[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{doctor.name}</p>
                            <p className="text-xs text-slate-400">{doctor.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-slate-400" />{doctor.specialty}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${doctor.is_active ? 'badge-accepted' : 'badge-rejected'}`}>
                          {doctor.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-slate-400 text-xs">{formatDate(doctor.created_at)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Link to={`/doctors/${doctor.id}`}
                            className="text-brand-600 hover:text-brand-700 text-xs font-medium">
                            View patients →
                          </Link>
                          <button onClick={() => setDeleteId(doctor.id)}
                            className="btn-ghost text-red-500 hover:bg-red-50 text-xs py-1.5 px-3">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {filtered.map((doctor) => (
                <Link key={doctor.id} to={`/doctors/${doctor.id}`} className="card p-4 block">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                        <span className="text-brand-700 font-medium">{doctor.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{doctor.name}</p>
                        <p className="text-xs text-slate-400">{doctor.specialty}</p>
                      </div>
                    </div>
                    <span className={`badge ${doctor.is_active ? 'badge-accepted' : 'badge-rejected'}`}>
                      {doctor.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-1.5 text-xs text-slate-400">
                    <Mail className="w-3 h-3" />{doctor.email}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        <ConfirmDialog
          isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
          title="Remove doctor"
          message="Are you sure you want to remove this doctor? This will delete their account and cannot be undone."
          confirmLabel="Remove doctor" loading={deleting}
        />
      </div>
    </DashboardLayout>
  )
}

// ─── Doctor Detail (admin view) ───────────────────────────────────────────────
export function DoctorDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [dRes, pRes] = await Promise.all([
          api.get(`/doctors/${id}/`),
          api.get('/patients/'),
        ])
        setDoctor(dRes.data)
        // filter patients assigned to this doctor
        setPatients(pRes.data.filter((p: Patient) => p.doctor === Number(id)))
      } catch {
        toast.error('Doctor not found')
        navigate('/doctors')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) return <DashboardLayout><div className="flex justify-center py-16"><Spinner size="lg" /></div></DashboardLayout>
  if (!doctor) return null

  return (
    <DashboardLayout>
      <div className="page-container">
        <button onClick={() => navigate('/doctors')}
          className="text-sm text-slate-400 hover:text-slate-600 mb-6 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to doctors
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Doctor card */}
          <div className="space-y-4">
            <div className="card p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-700 text-2xl font-medium">{doctor.name[0]}</span>
                </div>
                <div>
                  <h1 className="text-xl text-slate-900">{doctor.name}</h1>
                  <p className="text-slate-500 text-sm">{doctor.specialty}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />{doctor.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Stethoscope className="w-4 h-4 text-slate-400" />{doctor.specialty}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${doctor.is_active ? 'badge-accepted' : 'badge-rejected'}`}>
                    {doctor.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Joined {formatDate(doctor.created_at)}</p>
              </div>
            </div>

            <div className="card p-5">
              <p className="text-2xl font-display text-slate-900">{patients.length}</p>
              <p className="text-sm text-slate-500 mt-1">Patients assigned</p>
            </div>
          </div>

          {/* Patients list */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between p-6 border-b border-slate-50">
                <h2 className="text-lg text-slate-900">Assigned patients</h2>
                <Link to={`/patients/new`}>
                  <Button size="sm"><UserPlus className="w-3.5 h-3.5" /> Add patient</Button>
                </Link>
              </div>

              {patients.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No patients assigned to this doctor yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {patients.map((patient) => (
                    <Link key={patient.id} to={`/patients/${patient.id}`}
                      className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">{patient.name}</p>
                        <p className="text-xs text-slate-400">{patient.phone}</p>
                      </div>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono hidden sm:block">
                        {patient.unique_code}
                      </code>
                      <p className="text-xs text-slate-400 hidden sm:block">{formatDate(patient.created_at)}</p>
                      <span className="text-brand-600 text-xs font-medium">View →</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// ─── Invite Doctor ────────────────────────────────────────────────────────────
export function InviteDoctorPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)
  const [invitedEmail, setInvitedEmail] = useState('')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<InviteForm>()

  async function onSubmit(data: InviteForm) {
    setServerError('')
    try {
      await api.post('/hospitals/invite/', data)
      setInvitedEmail(data.email)
      setSuccess(true)
      reset()
    } catch (err) {
      setServerError(getApiError(err))
    }
  }

  return (
    <DashboardLayout>
      <div className="page-container max-w-lg">
        <div className="mb-8">
          <button onClick={() => navigate('/doctors')}
            className="text-sm text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to doctors
          </button>
          <h1 className="page-title">Invite a doctor</h1>
          <p className="page-subtitle">Send an email invitation with a secure registration link</p>
        </div>

        {success ? (
          <div className="card p-8 text-center animate-slide-up">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Send className="w-7 h-7 text-emerald-500" />
            </div>
            <h2 className="text-xl text-slate-900 mb-2">Invitation sent!</h2>
            <p className="text-slate-500 text-sm mb-6">
              An email has been sent to <span className="font-medium text-slate-700">{invitedEmail}</span> with a link to create their account. The link expires in 48 hours.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => setSuccess(false)}>Invite another</Button>
              <Button onClick={() => navigate('/doctors')}>Back to doctors</Button>
            </div>
          </div>
        ) : (
          <div className="card p-8">
            <div className="bg-brand-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-brand-800">
                💡 The doctor will receive an email with a link to create their account. The link expires in <strong>48 hours</strong>.
              </p>
            </div>
            {serverError && <div className="mb-6"><Alert type="error" message={serverError} /></div>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input label="Doctor's name" placeholder="Dr. Emeka Okafor"
                error={errors.doctor_name?.message} required hint="This is for your reference only"
                {...register('doctor_name', { required: 'Doctor name is required' })} />
              <Input label="Doctor's email" type="email" placeholder="doctor@example.com"
                error={errors.email?.message} required hint="The invitation will be sent to this email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                })} />
              <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Sending invitation...' : 'Send invitation'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
