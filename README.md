# DevBoard AI 🚀

> **AI-Powered Project Management Platform**

DevBoard AI is a production-ready, full-stack project management application that combines the power of modern development frameworks with AI (via OpenRouter) to deliver an intelligent project management experience.

![Tech Stack](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)
![Tech Stack](https://img.shields.io/badge/FastAPI-Python-009688?style=flat&logo=fastapi)
![Tech Stack](https://img.shields.io/badge/PostgreSQL-SQLAlchemy-336791?style=flat&logo=postgresql)
![Tech Stack](https://img.shields.io/badge/Resend-Email-000000?style=flat&logo=resend)

## ✨ Features

### 📊 Dashboard
- Active projects overview
- Task statistics and trends
- Recent activity feed
- Productivity metrics

### 📁 Project Management
- Create, edit, and delete projects
- Team member management
- Status tracking
- Deadline management

### ✅ Task Management
- Full CRUD operations
- Priority levels (Low, Medium, High, Urgent)
- Status workflow (Todo → In Progress → Review → Done)
- Labels and tags
- Checklist items
- Comments and discussions
- Drag-and-drop Kanban board

### 📈 Analytics
- Task completion rates
- Status distribution charts
- Priority breakdown
- Weekly activity trends
- Interactive Recharts visualizations

### 🤖 AI Features (Powered by OpenRouter)
- **Task Breakdown**: Generate actionable subtasks from any task title
- **Bug Explainer**: Analyze errors and get root cause + solutions
- **Documentation Generator**: Create README, API docs, and release notes

### 🔐 Authentication & Security
- JWT-based authentication (python-jose + bcrypt)
- Password hashing with bcrypt
- Secure password reset via email (Resend)
- 30-minute token expiry with single-use tokens
- Rate-limited endpoints
- Email enumeration prevention

### 🎨 UI/UX
- Modern SaaS design with dark/light mode
- Responsive layout for all devices
- Loading skeletons and transitions
- Toast notifications
- Empty states
- Error boundaries
- Persistent sidebar navigation

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS + shadcn/ui
- **Forms**: React Hook Form + Zod
- **Data Fetching**: TanStack Query
- **Charts**: Recharts
- **Icons**: Lucide React
- **Theme**: next-themes
- **Notifications**: Sonner

### Backend
- **Framework**: FastAPI (Python)
- **ORM**: SQLAlchemy 2.0
- **Database**: PostgreSQL
- **Migrations**: Alembic
- **Auth**: JWT (python-jose) + bcrypt
- **Validation**: Pydantic v2
- **AI**: OpenRouter API (GPT-4o, Claude, etc.)
- **Email**: Resend API

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (or Supabase)
- [Resend](https://resend.com) API key (for password reset emails)
- [OpenRouter](https://openrouter.ai) API key (for AI features)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and API keys

# Run database migrations
alembic upgrade head

# Start the server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
# Edit .env.local with your API URL

# Start the development server
npm run dev
```

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/devboard

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# OpenRouter AI
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx
OPENROUTER_MODEL=openai/gpt-4o

# CORS
CORS_ORIGINS=http://localhost:3000

# Resend Email (get your API key at https://resend.com/api-keys)
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_NAME=DevBoard AI
FRONTEND_URL=http://localhost:3000
RESET_TOKEN_EXPIRE_MINUTES=30

# Environment (development | production)
# Development automatically uses onboarding@resend.dev for email
ENVIRONMENT=development
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📧 Resend Setup

DevBoard AI uses [Resend](https://resend.com) for sending transactional emails (password reset, welcome, invitations).

### Development Setup (FREE)

In development mode, you don't need to verify a domain. Resend provides a default sender:

1. Sign up at [resend.com](https://resend.com)
2. Go to **API Keys** in the dashboard
3. Create a new API key
4. Copy the key (starts with `re_...`)
5. Set these in your `.env`:

```env
ENVIRONMENT=development
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_NAME=DevBoard AI
# FROM_EMAIL is optional in development - onboarding@resend.dev is used automatically
```

> **Note**: In development mode, emails are only sent to the Resend account owner's email address (the one you registered with). This is a Resend limitation for the free tier.

### Production Setup

For production, you need to verify your own domain:

1. Go to **Domains** in the [Resend dashboard](https://resend.com/domains)
2. Add your domain (e.g., `yourdomain.com`)
3. Add the provided DNS records (TXT, CNAME) to your DNS provider
4. Wait for verification (usually a few minutes)
5. Configure your `.env`:

```env
ENVIRONMENT=production
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=DevBoard AI
FRONTEND_URL=https://yourdomain.com
```

### How Environment Detection Works

The email service automatically selects the correct sender address:
- **`ENVIRONMENT=development`** (or unset) -> uses `onboarding@resend.dev`
- **`ENVIRONMENT=production`** -> uses `FROM_EMAIL` from your `.env` file

No code changes needed when switching between environments.

