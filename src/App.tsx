import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import LoginPage from './pages/auth/Login'
import RegisterPage from './pages/auth/Register'
import AcceptInvitePage from './pages/auth/AcceptInvite'
import DashboardPage from './pages/dashboard/Dashboard'
import { DoctorsPage, InviteDoctorPage, DoctorDetailPage } from './pages/doctors/Doctors'
import { PatientsPage, NewPatientPage, PatientDetailPage } from './pages/patients/Patients'
import { ReferralsPage, NewReferralPage, ReferralDetailPage } from './pages/referrals/Referrals'
import ProfilePage from './pages/profile/Profile'
import { ProtectedRoute, PublicRoute } from './components/shared/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#f8fafc' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#f8fafc' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/invitations/accept" element={<AcceptInvitePage />} />

        {/* Protected — both roles */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/patients" element={<ProtectedRoute><PatientsPage /></ProtectedRoute>} />
        <Route path="/patients/new" element={<ProtectedRoute><NewPatientPage /></ProtectedRoute>} />
        <Route path="/patients/:id" element={<ProtectedRoute><PatientDetailPage /></ProtectedRoute>} />
        <Route path="/referrals" element={<ProtectedRoute><ReferralsPage /></ProtectedRoute>} />
        <Route path="/referrals/new" element={<ProtectedRoute><NewReferralPage /></ProtectedRoute>} />
        <Route path="/referrals/:id" element={<ProtectedRoute><ReferralDetailPage /></ProtectedRoute>} />

        {/* Admin only */}
        <Route path="/doctors" element={<ProtectedRoute allowedRoles={['hospital_admin']}><DoctorsPage /></ProtectedRoute>} />
        <Route path="/doctors/invite" element={<ProtectedRoute allowedRoles={['hospital_admin']}><InviteDoctorPage /></ProtectedRoute>} />
        <Route path="/doctors/:id" element={<ProtectedRoute allowedRoles={['hospital_admin']}><DoctorDetailPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
