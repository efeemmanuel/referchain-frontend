import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, FileText, UserPlus, ArrowRight, Clock, CheckCircle, XCircle, Activity } from 'lucide-react'
import api from '../../lib/api'
import { useAuthStore } from '../../store/auth'
import { Doctor, Patient, Referral } from '../../lib/types'
import { formatDate, statusColor, urgencyColor } from '../../lib/utils'
import { StatCard, Badge, LoadingPage } from '../../components/ui'
import { DashboardLayout } from '../../components/layout/DashboardLayout'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const isAdmin = user?.role === 'hospital_admin'

  useEffect(() => {
    async function fetchData() {
      try {
        const [pRes, rRes] = await Promise.all([
          api.get('/patients/'),
          api.get('/referrals/'),
        ])
        setPatients(pRes.data)
        setReferrals(rRes.data)

        if (isAdmin) {
          const dRes = await api.get('/doctors/')
          setDoctors(dRes.data)
        }
      } catch {
        // silently fail — page still loads
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isAdmin])

  if (loading) return <LoadingPage />

  const pendingReferrals = referrals.filter((r) => r.status === 'pending')
  const acceptedReferrals = referrals.filter((r) => r.status === 'accepted')
  const recentReferrals = referrals.slice(0, 5)

  return (
    <DashboardLayout>
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-brand-100 rounded-xl flex items-center justify-center">
              <Activity className="w-4 h-4 text-brand-600" />
            </div>
            <p className="text-sm text-brand-600 font-medium">
              {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <h1 className="page-title">
            Good {getGreeting()},{' '}
            <span className="text-brand-600">
              {isAdmin ? 'Admin' : user?.email?.split('@')[0]}
            </span>
          </h1>
          <p className="page-subtitle">
            {isAdmin
              ? 'Here\'s an overview of your hospital\'s referral activity'
              : 'Here\'s a summary of your patients and referrals'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-stagger">
          {isAdmin && (
            <StatCard
              label="Total doctors"
              value={doctors.length}
              icon={<UserPlus className="w-5 h-5 text-brand-600" />}
              iconBg="bg-brand-50"
            />
          )}
          <StatCard
            label="Total patients"
            value={patients.length}
            icon={<Users className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-50"
          />
          <StatCard
            label="Pending referrals"
            value={pendingReferrals.length}
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            iconBg="bg-amber-50"
          />
          <StatCard
            label="Active referrals"
            value={acceptedReferrals.length}
            icon={<CheckCircle className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent referrals */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between p-6 border-b border-slate-50">
                <h2 className="text-lg text-slate-900">Recent referrals</h2>
                <Link to="/referrals" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {recentReferrals.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No referrals yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {recentReferrals.map((referral, i) => (
                    <Link
                      key={referral.id}
                      to={`/referrals/${referral.id}`}
                      className="flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {referral.patient_name}
                          </p>
                          <Badge variant={referral.status as 'pending' | 'accepted' | 'rejected' | 'completed'}>
                            {referral.status}
                          </Badge>
                          <Badge variant={referral.urgency_level as 'low' | 'medium' | 'high' | 'critical'}>
                            {referral.urgency_level}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400">
                          To {referral.receiving_hospital_name} · {formatDate(referral.created_at)}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="space-y-4">
            <div className="card p-6">
              <h2 className="text-lg text-slate-900 mb-4">Quick actions</h2>
              <div className="space-y-2">
                <Link
                  to="/patients/new"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">New patient</p>
                    <p className="text-xs text-slate-400">Register a patient</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-slate-500 transition-colors" />
                </Link>

                {!isAdmin && (
                  <Link
                    to="/referrals/new"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">New referral</p>
                      <p className="text-xs text-slate-400">Refer a patient</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-slate-500 transition-colors" />
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/doctors/invite"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <UserPlus className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Invite doctor</p>
                      <p className="text-xs text-slate-400">Send an invite link</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-slate-500 transition-colors" />
                  </Link>
                )}
              </div>
            </div>

            {/* Pending referrals notice */}
            {pendingReferrals.length > 0 && isAdmin && (
              <div className="card p-5 border-l-4 border-l-amber-400">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {pendingReferrals.length} referral{pendingReferrals.length > 1 ? 's' : ''} awaiting response
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Review and accept or reject incoming referrals
                    </p>
                    <Link
                      to="/referrals"
                      className="text-xs text-amber-600 hover:text-amber-700 font-medium mt-2 inline-block"
                    >
                      Review now →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}
