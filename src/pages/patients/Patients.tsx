import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Users, Search, Plus, QrCode, Copy, User, Phone, Mail,
  MapPin, Calendar, FileText, ArrowLeft, Stethoscope,
  ClipboardList, Send, PlusCircle, X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import { useAuthStore } from '../../store/auth'
import { Patient, Doctor, CreatePatientForm, Referral, MedicalRecord } from '../../lib/types'
import { formatDate, formatDateTime, getApiError } from '../../lib/utils'
import { Button, EmptyState, Input, Textarea, Select, Alert, Spinner, Badge, ConfirmDialog, Modal } from '../../components/ui'
import { DashboardLayout } from '../../components/layout/DashboardLayout'

// ─── Patients List ────────────────────────────────────────────────────────────
export function PatientsPage() {
  const { user } = useAuthStore()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [codeSearch, setCodeSearch] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    api.get('/patients/').then((res) => setPatients(res.data)).finally(() => setLoading(false))
  }, [])

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.unique_code.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone && p.phone.includes(search))
  )

  async function handleCodeSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!codeSearch.trim()) return
    setSearchLoading(true)
    try {
      const res = await api.get(`/patients/code/${codeSearch.trim()}/`)
      window.location.href = `/patients/${res.data.id}`
    } catch {
      toast.error('No patient found with that code')
    } finally {
      setSearchLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="page-title">Patients</h1>
            <p className="page-subtitle">{patients.length} patient{patients.length !== 1 ? 's' : ''} registered</p>
          </div>
          <Link to="/patients/new"><Button><Plus className="w-4 h-4" /> New patient</Button></Link>
        </div>

        {/* QR / Code lookup */}
        <div className="card p-5 mb-6 border-l-4 border-l-brand-400">
          <p className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-brand-600" /> Look up patient by code or QR scan
          </p>
          <form onSubmit={handleCodeSearch} className="flex gap-2">
            <input className="input-base flex-1" placeholder="Enter patient code e.g. A3XK92PL"
              value={codeSearch} onChange={(e) => setCodeSearch(e.target.value.toUpperCase())} />
            <Button type="submit" loading={searchLoading} size="sm">Search</Button>
          </form>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input-base pl-11" placeholder="Search by name, code, or phone..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8" />}
            title={search ? 'No patients found' : 'No patients yet'}
            description={search ? 'Try a different search term' : 'Register your first patient to start creating referrals.'}
            action={!search ? <Link to="/patients/new"><Button><Plus className="w-4 h-4" /> New patient</Button></Link> : undefined}
          />
        ) : (
          <>
            <div className="table-container hidden sm:block">
              <table className="table-base">
                <thead>
                  <tr><th>Patient</th><th>Unique code</th><th>Phone</th><th>Registered</th><th></th></tr>
                </thead>
                <tbody>
                  {filtered.map((patient) => (
                    <tr key={patient.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{patient.name}</p>
                            {patient.email && <p className="text-xs text-slate-400">{patient.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">{patient.unique_code}</code>
                          <button onClick={() => { navigator.clipboard.writeText(patient.unique_code); toast.success('Code copied') }}
                            className="text-slate-400 hover:text-slate-600"><Copy className="w-3 h-3" /></button>
                        </div>
                      </td>
                      <td className="text-slate-500">{patient.phone}</td>
                      <td className="text-slate-400 text-xs">{formatDate(patient.created_at)}</td>
                      <td>
                        <Link to={`/patients/${patient.id}`} className="text-brand-600 hover:text-brand-700 text-xs font-medium">
                          View profile →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden space-y-3">
              {filtered.map((patient) => (
                <Link key={patient.id} to={`/patients/${patient.id}`} className="card p-4 block">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{patient.name}</p>
                        <p className="text-xs text-slate-400">{patient.phone}</p>
                      </div>
                    </div>
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">{patient.unique_code}</code>
                  </div>
                  <p className="text-xs text-brand-600">View full profile →</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

// ─── New Patient ──────────────────────────────────────────────────────────────
export function NewPatientPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [serverError, setServerError] = useState('')
  const isAdmin = user?.role === 'hospital_admin'

  useEffect(() => {
    if (isAdmin) {
      api.get('/doctors/').then((res) => setDoctors(res.data))
    }
  }, [isAdmin])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreatePatientForm>()

  async function onSubmit(data: CreatePatientForm) {
    setServerError('')
    try {
      // if doctor, don't send doctor field — backend auto assigns
      const payload = isAdmin ? data : { ...data, doctor: undefined }
      const res = await api.post('/patients/', payload)
      toast.success(`Patient registered! Code: ${res.data.unique_code}`)
      navigate(`/patients/${res.data.id}`)
    } catch (err) {
      setServerError(getApiError(err))
    }
  }

  return (
    <DashboardLayout>
      <div className="page-container max-w-lg">
        <div className="mb-8">
          <button onClick={() => navigate('/patients')}
            className="text-sm text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to patients
          </button>
          <h1 className="page-title">Register patient</h1>
          <p className="page-subtitle">A unique code and QR code will be generated automatically</p>
        </div>

        <div className="card p-8">
          <div className="bg-brand-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-brand-800">
              💡 After registration, the patient receives a unique code they can use at any hospital in the referral chain.
              {!isAdmin && ' This patient will be automatically assigned to you.'}
            </p>
          </div>

          {serverError && <div className="mb-6"><Alert type="error" message={serverError} /></div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input label="Full name" placeholder="John Doe" error={errors.name?.message} required
              {...register('name', {
                required: 'Patient name is required',
                pattern: { value: /^[a-zA-Z\s]+$/, message: 'Name can only contain letters and spaces' },
              })} />
            <Input label="Phone number" type="tel" placeholder="08012345678" error={errors.phone?.message} required
              {...register('phone', {
                required: 'Phone number is required',
                pattern: { value: /^\+?[0-9]{7,15}$/, message: 'Enter a valid phone number' },
              })} />
            <Input label="Email address" type="email" placeholder="patient@example.com" hint="Optional"
              {...register('email', {
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
              })} />
            <Textarea label="Home address" placeholder="123 Main Street, Lagos" hint="Optional"
              {...register('address')} />
            {isAdmin && doctors.length > 0 && (
              <Select label="Assign to doctor" placeholder="Select a doctor (optional)"
                hint="Optional — can be assigned later"
                options={doctors.map((d) => ({ value: String(d.id), label: `${d.name} — ${d.specialty}` }))}
                {...register('doctor')} />
            )}
            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              {isSubmitting ? 'Registering...' : 'Register patient'}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

// ─── Patient Detail ───────────────────────────────────────────────────────────
export function PatientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'records' | 'referrals'>('info')
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const isAdmin = user?.role === 'hospital_admin'
  const isDoctor = user?.role === 'doctor'

  useEffect(() => {
    async function fetchData() {
      try {
        const [pRes, rRes] = await Promise.all([
          api.get(`/patients/${id}/`),
          api.get('/referrals/'),
        ])
        setPatient(pRes.data)
        setReferrals(rRes.data.filter((r: Referral) => r.patient === Number(id)))
        // load saved records from localStorage
        const saved = localStorage.getItem(`patient_records_${id}`)
        if (saved) setRecords(JSON.parse(saved))
      } catch {
        toast.error('Patient not found')
        navigate('/patients')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  function saveRecord(record: MedicalRecord) {
    const updated = [record, ...records]
    setRecords(updated)
    localStorage.setItem(`patient_records_${id}`, JSON.stringify(updated))
    toast.success('Record saved')
    setShowRecordModal(false)
  }

  function deleteRecord(recordId: string) {
    const updated = records.filter((r) => r.id !== recordId)
    setRecords(updated)
    localStorage.setItem(`patient_records_${id}`, JSON.stringify(updated))
    toast.success('Record deleted')
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await api.delete(`/patients/${id}/`)
      toast.success('Patient deleted')
      navigate('/patients')
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <DashboardLayout><div className="flex justify-center py-16"><Spinner size="lg" /></div></DashboardLayout>
  if (!patient) return null

  const tabs = [
    { key: 'info', label: 'Patient info' },
    { key: 'records', label: `Records (${records.length})` },
    { key: 'referrals', label: `Referrals (${referrals.length})` },
  ]

  return (
    <DashboardLayout>
      <div className="page-container">
        <div className="mb-8">
          <button onClick={() => navigate('/patients')}
            className="text-sm text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to patients
          </button>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="page-title">{patient.name}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <code className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg font-mono text-slate-700">
                  {patient.unique_code}
                </code>
                <button onClick={() => { navigator.clipboard.writeText(patient.unique_code); toast.success('Code copied') }}
                  className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1">
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Refer button — both admin and doctor can refer */}
              <Link to={`/referrals/new?patient=${patient.id}`}>
                <Button size="sm" variant="secondary">
                  <Send className="w-3.5 h-3.5" /> Refer patient
                </Button>
              </Link>
              {isAdmin && (
                <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>Delete patient</Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Info tab */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            <div className="card p-6">
              <h2 className="text-base font-medium text-slate-700 mb-4">Patient details</h2>
              <div className="space-y-4">
                <InfoRow icon={<User className="w-4 h-4" />} label="Full name" value={patient.name} />
                <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={patient.phone} />
                {patient.email && <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={patient.email} />}
                {patient.address && <InfoRow icon={<MapPin className="w-4 h-4" />} label="Address" value={patient.address} />}
                <InfoRow icon={<Calendar className="w-4 h-4" />} label="Registered" value={formatDate(patient.created_at)} />
              </div>
            </div>

            {patient.qr_code && (
              <div className="card p-6 text-center">
                <h2 className="text-base font-medium text-slate-700 mb-4">QR Code</h2>
                <img
                  src={patient.qr_code.startsWith('http') ? patient.qr_code : `${import.meta.env.VITE_API_URL}${patient.qr_code}`}
                  alt="Patient QR Code"
                  className="w-48 h-48 mx-auto rounded-xl border border-slate-100"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <p className="text-xs text-slate-400 mt-3">Patient presents this at any receiving hospital</p>
              </div>
            )}
          </div>
        )}

        {/* Records tab */}
        {activeTab === 'records' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">{records.length} record{records.length !== 1 ? 's' : ''} saved</p>
              <Button size="sm" onClick={() => setShowRecordModal(true)}>
                <PlusCircle className="w-3.5 h-3.5" /> Add record
              </Button>
            </div>

            {records.length === 0 ? (
              <EmptyState
                icon={<ClipboardList className="w-8 h-8" />}
                title="No records yet"
                description="Add medical records like symptoms, test results, diagnoses, and prescriptions for this patient."
                action={<Button onClick={() => setShowRecordModal(true)}><PlusCircle className="w-4 h-4" /> Add first record</Button>}
              />
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <div key={record.id} className="card p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <RecordTypeBadge type={record.type} />
                          <h3 className="text-sm font-medium text-slate-800">{record.title}</h3>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{record.content}</p>
                        <p className="text-xs text-slate-400 mt-3">
                          By {record.created_by} · {formatDateTime(record.created_at)}
                        </p>
                      </div>
                      <button onClick={() => deleteRecord(record.id)}
                        className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Referrals tab */}
        {activeTab === 'referrals' && (
          <div className="animate-fade-in">
            {referrals.length === 0 ? (
              <EmptyState
                icon={<FileText className="w-8 h-8" />}
                title="No referrals yet"
                description="This patient has not been referred to another hospital yet."
                action={
                  <Link to={`/referrals/new?patient=${patient.id}`}>
                    <Button><Send className="w-4 h-4" /> Refer this patient</Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <Link key={referral.id} to={`/referrals/${referral.id}`} className="card p-5 block hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge variant={referral.status as 'pending' | 'accepted' | 'rejected' | 'completed'}>{referral.status}</Badge>
                          <Badge variant={referral.urgency_level as 'low' | 'medium' | 'high' | 'critical'}>{referral.urgency_level}</Badge>
                        </div>
                        <p className="text-sm font-medium text-slate-700">
                          {referral.referring_hospital_name} → {referral.receiving_hospital_name}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{referral.symptoms}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatDateTime(referral.created_at)}</p>
                      </div>
                      <span className="text-brand-600 text-xs font-medium flex-shrink-0">View →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add record modal */}
      <AddRecordModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        onSave={saveRecord}
        createdBy={user?.email || ''}
      />

      <ConfirmDialog
        isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
        title="Delete patient"
        message="Are you sure you want to delete this patient? This action cannot be undone."
        confirmLabel="Delete patient" loading={deleting}
      />
    </DashboardLayout>
  )
}

// ─── Add Record Modal ─────────────────────────────────────────────────────────
interface AddRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (record: MedicalRecord) => void
  createdBy: string
}

function AddRecordModal({ isOpen, onClose, onSave, createdBy }: AddRecordModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    type: MedicalRecord['type']
    title: string
    content: string
  }>()

  function onSubmit(data: { type: MedicalRecord['type']; title: string; content: string }) {
    onSave({
      id: Date.now().toString(),
      ...data,
      created_by: createdBy,
      created_at: new Date().toISOString(),
    })
    reset()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add medical record">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          label="Record type"
          required
          options={[
            { value: 'symptom', label: 'Symptom' },
            { value: 'test_result', label: 'Test result' },
            { value: 'diagnosis', label: 'Diagnosis' },
            { value: 'prescription', label: 'Prescription' },
            { value: 'note', label: 'Clinical note' },
          ]}
          error={errors.type?.message}
          {...register('type', { required: 'Please select a type' })}
        />
        <Input
          label="Title"
          placeholder="e.g. Blood pressure reading, Malaria test result"
          error={errors.title?.message}
          required
          {...register('title', { required: 'Title is required' })}
        />
        <Textarea
          label="Details"
          placeholder="Enter the full details of this record..."
          error={errors.content?.message}
          required
          {...register('content', {
            required: 'Details are required',
            minLength: { value: 5, message: 'Please provide more detail' },
          })}
        />
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" className="flex-1">Save record</Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-slate-400 mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm text-slate-700">{value}</p>
      </div>
    </div>
  )
}

function RecordTypeBadge({ type }: { type: MedicalRecord['type'] }) {
  const styles: Record<MedicalRecord['type'], string> = {
    symptom: 'badge bg-orange-50 text-orange-700',
    test_result: 'badge bg-blue-50 text-blue-700',
    diagnosis: 'badge bg-purple-50 text-purple-700',
    prescription: 'badge bg-emerald-50 text-emerald-700',
    note: 'badge bg-slate-100 text-slate-600',
  }
  const labels: Record<MedicalRecord['type'], string> = {
    symptom: 'Symptom',
    test_result: 'Test result',
    diagnosis: 'Diagnosis',
    prescription: 'Prescription',
    note: 'Note',
  }
  return <span className={styles[type]}>{labels[type]}</span>
}
