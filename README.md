# ReferChain Frontend

A React + TypeScript + Tailwind CSS frontend for the ReferChain digital hospital referral system.

---

## Tech Stack

- **React 18** — UI framework
- **TypeScript** — type safety
- **Vite** — build tool
- **Tailwind CSS** — styling
- **React Router v6** — routing
- **Axios** — API calls with interceptors
- **React Hook Form** — form validation
- **Zustand** — auth state management
- **React Hot Toast** — notifications
- **Lucide React** — icons

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the root:

```
VITE_API_URL=http://127.0.0.1:8000
```

Replace with your backend URL if deployed.

### 3. Start development server

```bash
npm run dev
```

Open http://localhost:5173

### 4. Build for production

```bash
npm run build
```

---

## Project Structure

```
src/
├── pages/
│   ├── auth/
│   │   ├── Login.tsx           — Login page
│   │   ├── Register.tsx        — Hospital registration
│   │   └── AcceptInvite.tsx    — Doctor invite acceptance
│   ├── dashboard/
│   │   └── Dashboard.tsx       — Main dashboard with stats
│   ├── doctors/
│   │   └── Doctors.tsx         — Doctor list + invite page
│   ├── patients/
│   │   └── Patients.tsx        — Patient list, create, detail
│   └── referrals/
│       └── Referrals.tsx       — Referral list, create, detail + chain
├── components/
│   ├── ui/
│   │   └── index.tsx           — Reusable UI components
│   ├── layout/
│   │   └── DashboardLayout.tsx — Sidebar layout with nav
│   └── shared/
│       └── ProtectedRoute.tsx  — Auth guards
├── lib/
│   ├── api.ts                  — Axios instance + interceptors
│   ├── types.ts                — TypeScript interfaces
│   └── utils.ts                — Helper functions
├── store/
│   └── auth.ts                 — Zustand auth store
├── App.tsx                     — Router setup
├── main.tsx                    — Entry point
└── index.css                   — Global styles + Tailwind
```

---

## Features

### Authentication
- Hospital registration with validation
- JWT login for both hospital admins and doctors
- Automatic token refresh on expiry
- Role-based route protection

### Hospital Admin
- Dashboard with stats overview
- Doctor management (list, invite, remove)
- Patient management (list, view, delete)
- Referral management (list, view, accept, reject)

### Doctor
- Dashboard with personal stats
- Patient management (list, create, view)
- Referral creation and tracking
- Full referral chain view

### UX Features
- Responsive across all screen sizes
- Loading states on all async operations
- Toast notifications for all actions
- Inline form validation with helpful messages
- Patient code/QR lookup
- Referral chain timeline view
- Contextual empty states with guidance

---

## Connecting to Backend

The frontend connects to your Django REST Framework backend via Axios.

Every request automatically includes the JWT access token.
If a 401 is received, the refresh token is used to get a new access token.
If refresh fails, the user is redirected to login.

Make sure your Django backend has CORS configured:

```bash
pip install django-cors-headers
```

In `settings.py`:
```python
INSTALLED_APPS = [..., 'corsheaders']

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'https://yourdomain.com',
]
```
