# WatchPick Backend

Production-ready FastAPI backend — AI watch picks with fallback, Stripe payments, Supabase auth, email notifications, admin panel.

## Project Structure

```
backend/
├── run.py                         # Entry point — starts uvicorn
├── Dockerfile                     # Container build
├── requirements.txt
├── .env.example
├── app/
│   ├── main.py                    # App factory, middleware, router mounts
│   ├── core/
│   │   ├── config.py              # Pydantic Settings (all env vars)
│   │   ├── clients.py             # Supabase, Stripe singletons
│   │   ├── dependencies.py        # Auth + admin key dependencies
│   │   ├── responses.py           # Consistent JSON envelope
│   │   ├── exceptions.py          # Global exception handlers
│   │   ├── middleware.py           # Security headers, request logging, size limits
│   │   └── logging_config.py      # Structured JSON logging (prod) / human (dev)
│   ├── ai/
│   │   ├── base.py                # Abstract AIProvider
│   │   ├── factory.py             # Fallback chain: OpenAI → Anthropic → Gemini
│   │   └── providers/
│   │       ├── openai_provider.py
│   │       ├── anthropic_provider.py
│   │       └── gemini_provider.py
│   ├── schemas/
│   │   ├── picks.py               # PickRequest, WatchResult, PickResponse
│   │   ├── payments.py            # CheckoutRequest, PortalResponse
│   │   └── users.py               # UserProfile, UserStats, PickHistory
│   ├── repositories/
│   │   ├── profile_repository.py  # Profile data access
│   │   └── picks_repository.py   # Picks data access
│   ├── services/
│   │   ├── ai_service.py          # AI watch pick generation
│   │   ├── stripe_service.py      # Checkout, portal, webhook verify
│   │   ├── profile_service.py     # Profile business logic
│   │   ├── picks_service.py      # Picks business logic
│   │   └── email_service.py       # Resend — welcome, payment confirmation
│   └── routers/
│       ├── health.py              # GET  /api/v1/health
│       ├── users.py               # GET/PATCH /api/v1/users/me, stats, picks
│       ├── picks.py               # POST /api/v1/picks/generate (rate-limited)
│       ├── payments.py            # POST /api/v1/payments/* + webhook
│       └── admin.py               # GET  /api/v1/admin/* (API key auth)
└── tests/
    ├── conftest.py                # Test client fixture
    ├── test_health.py
    ├── test_auth.py
    ├── test_payments.py
    ├── test_admin.py
    └── test_middleware.py
```

## Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

## Environment Variables

Copy `.env.example` → `.env` and fill in your keys:

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (Settings → API) |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe CLI webhook secret |
| `STRIPE_PRO_PRICE_ID` | Yes | Price ID for Pro plan |
| `STRIPE_LIFETIME_PRICE_ID` | Yes | Price ID for Lifetime plan |
| `OPENAI_API_KEY` | At least one AI key | OpenAI API key |
| `ANTHROPIC_API_KEY` | Optional | Anthropic fallback |
| `GEMINI_API_KEY` | Optional | Google Gemini fallback |
| `RESEND_API_KEY` | Optional | Resend email service |
| `ADMIN_API_KEY` | Optional | Key for admin endpoints |
| `CORS_ORIGINS` | Prod | Comma-separated allowed origins |
| `RATE_LIMIT_DEFAULT` | No | Default rate limit (default: 60/minute) |
| `RATE_LIMIT_AI` | No | AI endpoint rate limit (default: 5/minute) |

## Run

```bash
python run.py
```

Open `http://localhost:8000` → redirects to Swagger docs.

## Run with Docker

```bash
docker build -t watchpick-backend .
docker run -p 8000:8000 --env-file .env watchpick-backend
```

Or from the project root:

```bash
docker-compose up --build
```

## Run Tests

```bash
pytest -v
```

## Stripe Webhook (local dev)

```bash
stripe listen --forward-to localhost:8000/api/v1/payments/webhook
```

## API Endpoints

### Health
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/health` | No | Health check + service status |

### Users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/users/me` | JWT | Current user profile |
| PATCH | `/api/v1/users/me` | JWT | Update profile |
| GET | `/api/v1/users/me/stats` | JWT | User stats |
| GET | `/api/v1/users/me/picks` | JWT | Pick history (Pro/Lifetime) |
| GET | `/api/v1/users/me/picks/{id}` | JWT | Single pick detail |

### Picks
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/picks/generate` | JWT | Generate AI picks (rate-limited: 5/min) |
| GET | `/api/v1/picks/history` | JWT | Pick history |
| GET | `/api/v1/picks/{id}` | JWT | Single pick |

### Payments
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/payments/create-checkout` | JWT | Start Stripe checkout |
| POST | `/api/v1/payments/portal` | JWT | Stripe customer portal |
| POST | `/api/v1/payments/webhook` | No | Stripe webhook (idempotent) |

### Admin (X-Admin-Key header)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/admin/users` | Admin | List users (paginated) |
| GET | `/api/v1/admin/users/{id}` | Admin | User detail + pick count |
| GET | `/api/v1/admin/analytics` | Admin | Total users, picks, plan breakdown |

Auth = Supabase JWT in `Authorization: Bearer <token>`.
Admin = `X-Admin-Key: <your-admin-key>` header.

### Production Features

- **Rate limiting** — Global 60 req/min, AI endpoint 5 req/min (slowapi)
- **Security headers** — X-Frame-Options, CSP, HSTS in prod
- **Structured logging** — JSON logs in production, human-readable in dev
- **Request ID** — Every response includes X-Request-ID for tracing
- **Request size limit** — Configurable max body size (default 2MB)
- **Webhook idempotency** — Duplicate Stripe events are safely skipped
- **AI fallback** — OpenAI → Anthropic → Gemini automatic failover
- **Email notifications** — Welcome + payment confirmation via Resend
- **API versioning** — All routes under /api/v1/, backward-compat /api/ aliases
- **Docker ready** — Dockerfile + docker-compose for deployment
