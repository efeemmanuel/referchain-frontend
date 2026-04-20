# CORS Setup for Django Backend

The frontend (running on localhost:5173) needs CORS configured on your Django backend.

## Step 1 — Install django-cors-headers

```bash
pip install django-cors-headers
pip freeze > requirements.txt
```

## Step 2 — Add to INSTALLED_APPS in settings.py

```python
THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'drf_spectacular',
    'corsheaders',       # add this
]
```

## Step 3 — Add to MIDDLEWARE in settings.py

Must be placed BEFORE CommonMiddleware:

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',       # add this here
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    ...
]
```

## Step 4 — Add CORS settings in settings.py

```python
# Development
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

# Production — add your deployed frontend URL
# CORS_ALLOWED_ORIGINS = [
#     'https://yourfrontend.vercel.app',
# ]
```

## Step 5 — Restart your server

```bash
python manage.py runserver
```
