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
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=DevBoard AI
FRONTEND_URL=http://localhost:3000
RESET_TOKEN_EXPIRE_MINUTES=30
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📧 Resend Setup

DevBoard AI uses [Resend](https://resend.com) for sending transactional emails (password reset, welcome, invitations).

### Getting a Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Go to **API Keys** in the dashboard
3. Create a new API key
4. Copy the key (starts with `re_...`)

### Verifying Your Domain

For production, you'll need to verify a domain in Resend:

1. Go to **Domains** in the Resend dashboard
2. Add your domain
3. Add the provided DNS records (TXT, CNAME) to your DNS provider
4. Wait for verification (usually a few minutes)

For development, you can use Resend's test mode (emails are logged but not delivered).

### Configuring Environment

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=DevBoard AI
FRONTEND_URL=https://yourdomain.com  # Production URL
RESET_TOKEN_EXPIRE_MINUTES=30
```

> **Note**: If `RESEND_API_KEY` is not set, the email service logs a warning and returns `False` without crashing the API. This allows the application to run without email functionality during development.

## 🔐 Password Reset Flow

1. User clicks **"Forgot Password?"** on the login page
2. User enters their email address
3. Backend generates a secure random token (`secrets.token_urlsafe(48)`)
4. Token and expiry (30 min) are stored in the database
5. Resend sends an HTML email with a reset link
6. User clicks the link and is taken to the reset page
7. User enters a new password
8. Token is validated and the password is updated
9. Token is cleared (single-use)
10. User is redirected to login

**Security measures:**
- Same response returned whether email exists or not (prevents email enumeration)
- Tokens expire after 30 minutes
- Single-use tokens (cleared after successful reset)
- Tokens are generated using Python's `secrets` module
- Password is bcrypt-hashed before storage

## 📁 Project Structure

```
├── backend/
│   ├── api/           # API route handlers
│   ├── models/        # SQLAlchemy models
│   ├── schemas/       # Pydantic schemas
│   ├── services/      # Business logic (auth, email, AI)
│   ├── database/      # DB configuration
│   ├── middleware/     # Auth middleware
│   ├── migrations/    # Alembic migrations
│   ├── utils/         # Helper functions
│   └── main.py        # FastAPI application
│
├── frontend/
│   ├── app/           # Next.js pages (App Router)
│   ├── components/    # React components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API client
│   ├── types/         # TypeScript types
│   └── lib/           # Utility functions
│
└── README.md
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | Login user |
| GET | `/api/me` | Get current user |
| POST | `/api/forgot-password` | Request password reset email |
| POST | `/api/reset-password` | Reset password with token |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/{id}` | Get project details |
| PUT | `/api/projects/{id}` | Update project |
| DELETE | `/api/projects/{id}` | Delete project |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (with filters) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/{id}` | Get task details |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |
| PUT | `/api/tasks/{id}/reorder` | Reorder task (Kanban) |

### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/task-breakdown` | Break down task into subtasks |
| POST | `/api/ai/bug-explain` | Explain bug/error |
| POST | `/api/ai/documentation` | Generate documentation |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/{id}/comments` | List comments |
| POST | `/api/tasks/{id}/comments` | Add comment |

## 🚢 Deployment

### Backend (Render)

1. Push the repository to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Connect your GitHub repository
4. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables from `.env.example`
6. Deploy

### Frontend (Vercel)

1. Create a new project on [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Set:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL
5. Deploy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is for demonstration purposes.

## 🙏 Acknowledgments

- OpenRouter for AI model access
- Resend for transactional email infrastructure
- shadcn/ui for beautiful components
- The open-source community
