# DevBoard AI 🚀

> **AI-Powered Project Management Platform**

DevBoard AI is a production-ready, full-stack project management application that combines the power of modern development frameworks with Google Gemini AI to deliver an intelligent project management experience.

![Tech Stack](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)
![Tech Stack](https://img.shields.io/badge/FastAPI-Python-009688?style=flat&logo=fastapi)
![Tech Stack](https://img.shields.io/badge/PostgreSQL-SQLAlchemy-336791?style=flat&logo=postgresql)
![Tech Stack](https://img.shields.io/badge/Gemini-AI-4285F4?style=flat&logo=google)

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

### 🤖 AI Features (Powered by Google Gemini)
- **Task Breakdown**: Generate actionable subtasks from any task title
- **Bug Explainer**: Analyze errors and get root cause + solutions
- **Documentation Generator**: Create README, API docs, and release notes

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
- **AI**: Google Gemini API

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- PostgreSQL
- Google Gemini API key (for AI features)

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
# Edit .env with your database URL and Gemini API key

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
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/devboard
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGINS=http://localhost:3000
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📁 Project Structure

```
├── backend/
│   ├── api/           # API route handlers
│   ├── models/        # SQLAlchemy models
│   ├── schemas/       # Pydantic schemas
│   ├── services/      # Business logic
│   ├── database/      # DB configuration
│   ├── middleware/     # Auth middleware
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
| GET | `/me` | Get current user |

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is for demonstration purposes.

## 🙏 Acknowledgments

- Google Gemini AI for intelligent features
- shadcn/ui for beautiful components
- The open-source community
