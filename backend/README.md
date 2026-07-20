# Raf's Souq Django Backend

This backend gives the store owner a secure Django admin area for managing products, images, variants, inventory, customers, and orders.

## Why This Store Needs A Backend

The current Next.js storefront can display products, but a real online store needs a backend for:

- Owner-managed inventory and product uploads
- Secure admin login and staff permissions
- Product images and variant stock
- Order records and fulfilment status
- Stock validation before checkout
- Future payment integration with providers such as Paystack or Flutterwave

## Local Setup

From the repo root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py seed_store
python manage.py createsuperuser
python manage.py runserver 127.0.0.1:8000
```

Admin URL:

```text
http://127.0.0.1:8000/secure-admin/
```

API base URL:

```text
http://127.0.0.1:8000/api/
```

## Production Security Checklist

- Set `DJANGO_DEBUG=False`
- Set a long random `DJANGO_SECRET_KEY`
- Set `DJANGO_ALLOWED_HOSTS` to the real backend domain
- Set `DJANGO_CSRF_TRUSTED_ORIGINS` and `DJANGO_CORS_ALLOWED_ORIGINS` to the storefront domain
- Change `DJANGO_ADMIN_URL` to a private path
- Use PostgreSQL via `DATABASE_URL`
- Use a shared Redis instance via `DJANGO_CACHE_URL` so rate limits work across every backend worker
- Store secrets in the deployment platform's encrypted environment/secret manager, never in committed files
- Generate a unique `DJANGO_SECRET_KEY` of at least 50 characters
- Serve media files from trusted object storage or a protected media host
- Keep admin accounts staff-only and use strong passwords
- Put the backend behind HTTPS

## API Endpoints

```text
GET  /api/health/
GET  /api/csrf/
GET  /api/settings/
GET  /api/categories/
GET  /api/products/
GET  /api/products/<slug>/
POST /api/orders/
```

Order creation is CSRF-protected and validates live stock inside a database transaction.

## Frontend Integration Notes

Set the frontend API URL in a Next.js environment file:

```text
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Before posting an order, fetch `/api/csrf/` with credentials and send the returned token as `X-CSRFToken`.
# Deploying the API to Render

The repository-root `render.yaml` defines the Django web service, PostgreSQL
database, and shared Key Value cache. Create a Render Blueprint from that file,
then provide the environment values marked `sync: false`:

- `DJANGO_ALLOWED_HOSTS`: custom API hosts only, comma-separated and without a scheme. Render's own hostname is added automatically.
- `DJANGO_CORS_ALLOWED_ORIGINS` and `DJANGO_CSRF_TRUSTED_ORIGINS`: the public frontend URL, including `https://`.
- `FRONTEND_SITE_URL`: the public frontend URL.
- `DJANGO_ADMIN_URL`: a private path ending in `/`, for example `management-7f3a/`.
- SMTP host, username, and password for transactional email.

Render generates `DJANGO_SECRET_KEY` and connects `DATABASE_URL` and
`DJANGO_CACHE_URL` automatically. Never paste production values into `.env` or
commit them to Git.

Product media uploaded through Django must use durable object storage or a
Render persistent disk before production. Render's normal service filesystem is
ephemeral; static assets are handled separately by WhiteNoise.
