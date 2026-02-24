# TaskFlow - SaaS Task Management Dashboard

> A production-ready, full-stack task management application with authentication, analytics, notifications, smart suggestions, and logging.

---

## Tech Stack

### Frontend
- **Next.js 14+** (App Router)
- **React 18**
- **TailwindCSS**
- **Axios**
- **React Hook Form + Zod** validation
- **Recharts** for analytics charts
- **JWT** authentication via HTTP-only cookies
- **react-hot-toast** for toast notifications

### Backend
- **Node.js + Express**
- **Supabase** (PostgreSQL)
- **JWT** custom authentication
- **bcrypt** password hashing
- **Winston** logger
- **Morgan** request logging
- **Helmet** security headers
- **CORS** + **Rate Limiting**

---

## Project Structure

```
root/
├── client/                    # Next.js frontend
│   ├── app/                   # App Router pages
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── tasks/
│   │   ├── profile/
│   │   ├── notifications/
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── globals.css
│   ├── components/            # Reusable UI components
│   ├── lib/                   # API client
│   ├── context/               # Auth context
│   ├── middleware.js           # Route protection
│   ├── package.json
│   └── tailwind.config.js
├── server/                    # Express backend
│   ├── config/                # Supabase config
│   ├── controllers/           # Route handlers
│   ├── middleware/             # Auth, error, logger
│   ├── routes/                # API routes
│   ├── utils/                 # Logger utility
│   ├── logs/                  # Log files
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## Supabase Database Setup

### 1. Create a Supabase project at [supabase.com](https://supabase.com)

### 2. Run the following SQL in the Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'reminder', 'warning')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suggestions table
CREATE TABLE suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_suggestions_user_id ON suggestions(user_id);
```

### 3. Disable Row Level Security (RLS) for all tables or configure policies for service role access.

---

## Environment Setup

### Server (`server/.env`)

```
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=development
```

### Client (`client/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Running the Project

### 1. Clone and install

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure environment

```bash
# Copy env examples
cp server/.env.example server/.env
# Edit server/.env with your Supabase credentials

# Create client env
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > client/.env.local
```

### 3. Start development

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

The backend runs on `http://localhost:5000` and frontend on `http://localhost:3000`.

---

## API Documentation

### Auth Routes (`/api/auth`)

| Method | Endpoint    | Description         | Auth |
|--------|-------------|---------------------|------|
| POST   | /register   | Register new user   | No   |
| POST   | /login      | Login user          | No   |
| POST   | /logout     | Logout user         | Yes  |

### User Routes (`/api/users`)

| Method | Endpoint          | Description         | Auth |
|--------|-------------------|---------------------|------|
| GET    | /profile          | Get user profile    | Yes  |
| PUT    | /profile          | Update profile      | Yes  |
| PUT    | /change-password  | Change password     | Yes  |

### Task Routes (`/api/tasks`)

| Method | Endpoint    | Description              | Auth |
|--------|-------------|--------------------------|------|
| POST   | /           | Create task              | Yes  |
| GET    | /           | Get tasks (search/filter)| Yes  |
| GET    | /:id        | Get single task          | Yes  |
| PUT    | /:id        | Update task              | Yes  |
| DELETE | /:id        | Delete task              | Yes  |
| GET    | /dashboard/stats | Dashboard statistics | Yes  |

### Notification Routes (`/api/notifications`)

| Method | Endpoint    | Description           | Auth |
|--------|-------------|-----------------------|------|
| GET    | /           | Get notifications     | Yes  |
| PUT    | /:id/read   | Mark as read          | Yes  |
| PUT    | /read-all   | Mark all as read      | Yes  |
| DELETE | /:id        | Delete notification   | Yes  |

### Suggestion Routes (`/api/suggestions`)

| Method | Endpoint    | Description            | Auth |
|--------|-------------|------------------------|------|
| GET    | /           | Get suggestions        | Yes  |
| POST   | /generate   | Generate suggestions   | Yes  |

---

## Logging System

The application uses **Winston** for structured logging and **Morgan** for HTTP request logging.

### Log Files (`server/logs/`)

| File          | Description                    |
|---------------|--------------------------------|
| access.log    | HTTP request logs (Morgan)     |
| error.log     | Error-level logs only          |
| combined.log  | All log levels                 |

### Log Format
```
2026-02-24 10:30:00 [INFO]: Server started on port 5000
2026-02-24 10:30:01 [INFO]: Supabase connected successfully
2026-02-24 10:31:22 [INFO]: User registered: alex@taskflow.io
```

---

## Notification System

Notifications are automatically created when:

- A new task is created → `info` type
- A task is marked as completed → `info` type
- A task becomes overdue → `warning` type
- User profile is updated → `info` type

Notifications are stored in the database and fetched via API. The frontend displays a bell icon with unread count badge.

---

## Suggestion System

Smart suggestions are generated based on user's task data:

- "Aapke paas bahut pending tasks hain. Kuch complete karne ki koshish karein!"
- "High priority tasks pehle complete karein"
- "Aaj aap productive hain! Keep it up!"
- "Overdue tasks hain, unhe jaldi complete karein"

Suggestions are stored in the database and can be regenerated via API.

---

## Scaling Strategy

1. **Database**: Supabase auto-scales PostgreSQL. Add connection pooling for high traffic.
2. **Backend**: Deploy on Railway/Render with auto-scaling. Use PM2 for process management.
3. **Frontend**: Deploy on Vercel for edge caching and CDN.
4. **Caching**: Add Redis for session management and API response caching.
5. **Rate Limiting**: Already implemented. Adjust limits per tier.
6. **Monitoring**: Winston logs can be forwarded to services like Datadog or LogRocket.

---

## License

MIT License © 2026 TaskFlow
