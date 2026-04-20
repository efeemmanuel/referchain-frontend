// Auth
export interface User {
  id: number
  email: string
  role: 'hospital_admin' | 'doctor'
}

export interface Tokens {
  access: string
  refresh: string
}

export interface AuthResponse {
  tokens: Tokens
  user: User
  hospital?: Hospital
}

// Hospital
export interface Hospital {
  id: number
  name: string
  address: string
  tier: 'primary' | 'secondary' | 'tertiary'
  is_active: boolean
  is_verified: boolean
  created_at: string
}

// Doctor
export interface Doctor {
  id: number
  name: string
  email: string
  specialty: string
  is_active: boolean
  is_verified: boolean
  hospital: number
  created_at: string
}

// Patient medical record (stored locally per session)
export interface MedicalRecord {
  id: string
  type: 'symptom' | 'test_result' | 'diagnosis' | 'note' | 'prescription'
  title: string
  content: string
  created_by: string
  created_at: string
}

// Patient
export interface Patient {
  id: number
  name: string
  phone: string
  email?: string
  address?: string
  unique_code: string
  qr_code?: string
  hospital: number
  doctor?: number
  created_at: string
}

// Referral
export interface Referral {
  id: number
  patient: number
  patient_name: string
  referring_doctor: number
  referring_doctor_name: string
  referring_hospital: number
  referring_hospital_name: string
  receiving_hospital: number
  receiving_hospital_name: string
  receiving_doctor?: number
  urgency_level: 'low' | 'medium' | 'high' | 'critical'
  symptoms: string
  test_attachments: string[]
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  unique_code?: string
  qr_code?: string
  created_at: string
  updated_at: string
}

export interface ReferralChain {
  patient: string
  total_referrals: number
  chain: Referral[]
}

// Invitation
export interface Invitation {
  email: string
  hospital: string
  expires_at: string
}

// Forms
export interface RegisterForm {
  email: string
  password: string
  hospital_name: string
  hospital_address: string
  hospital_tier: 'primary' | 'secondary' | 'tertiary'
}

export interface LoginForm {
  email: string
  password: string
}

export interface CreatePatientForm {
  name: string
  phone: string
  email?: string
  address?: string
  doctor?: number | string
}

export interface CreateReferralForm {
  patient: number
  receiving_hospital: number
  urgency_level: 'low' | 'medium' | 'high' | 'critical'
  symptoms: string
  test_attachments?: string[]
}

export interface InviteForm {
  email: string
  doctor_name: string
}

export interface AcceptInviteForm {
  token: string
  name: string
  specialty: string
  password: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
