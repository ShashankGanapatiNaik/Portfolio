# 🚀 Shashank Ganapati Naik — Portfolio

**Full Stack Developer | AI & Machine Learning Enthusiast**

A production-ready, full-stack developer portfolio built with React.js, Node.js, Express.js, and MongoDB Atlas. Features an AI-powered chatbot, LeetCode/GitHub trackers, admin dashboard, and smooth Framer Motion animations.

---

## ✨ Features

| Feature                          | Status |
| -------------------------------- | ------ |
| Hero with typewriter effect      | ✅     |
| About, Skills, Projects sections | ✅     |
| LeetCode stats tracker + charts  | ✅     |
| GitHub activity tracker + charts | ✅     |
| AI Chatbot (OpenAI GPT-3.5)      | ✅     |
| Admin Dashboard + JWT Auth       | ✅     |
| Resume upload & download         | ✅     |
| Contact form → MongoDB           | ✅     |
| Dark mode portfolio design       | ✅     |
| Framer Motion animations         | ✅     |
| Rate limiting & security         | ✅     |
| Project filtering by tech        | ✅     |
| Skeleton loading states          | ✅     |
| Mobile responsive                | ✅     |

---

## 🗂 Project Structure

```
portfolio/
├── frontend/          # React.js + TailwindCSS + Framer Motion
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Hero.jsx
│       │   ├── About.jsx
│       │   ├── Skills.jsx
│       │   ├── Projects.jsx
│       │   ├── LeetcodeTracker.jsx
│       │   ├── GithubTracker.jsx
│       │   ├── Contact.jsx
│       │   └── Chatbot.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   └── Admin.jsx
│       ├── services/api.js
│       └── context/ThemeContext.jsx
│
└── backend/           # Node.js + Express.js + MongoDB
    ├── routes/        # All API routes
    ├── models/        # Mongoose schemas
    ├── middleware/    # JWT auth
    ├── config/db.js
    ├── server.js
    └── seed.js        # Seed initial data
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier works)
- OpenAI API key
- GitHub Personal Access Token (optional, for higher rate limits)

---

### 1. Clone & Install

```bash
# Clone repo
git clone <your-repo-url>
cd portfolio

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/portfolio
JWT_SECRET=change_this_to_a_long_random_string
FRONTEND_URL=http://localhost:5173
GITHUB_USERNAME=ShashankGanapatiNaik
GITHUB_TOKEN=ghp_your_github_token_here
LEETCODE_USERNAME=shashanknaik6226
OPENAI_API_KEY=sk-your_openai_key_here
ADMIN_EMAIL=shashankng626@gmail.com
ADMIN_PASSWORD=your_secure_password
NODE_ENV=development
```

---

### 3. Configure Frontend Environment

```bash
cd frontend
echo "VITE_API_URL=/api" > .env
```

For production, set:

```env
VITE_API_URL=https://your-backend-url.com/api
```

---

### 4. Seed the Database

```bash
cd backend
node seed.js
```

This populates MongoDB with:

- Your profile, education, bio
- All 4 projects
- All skill categories
- Admin user account

---

### 5. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Admin Dashboard: http://localhost:5173/admin

---

## 🔑 Admin Dashboard

Navigate to `/admin` and login with:

- **Email:** `shashankng626@gmail.com`
- **Password:** (whatever you set in `ADMIN_PASSWORD`)

Admin capabilities:

- ✅ Add / Edit / Delete projects
- ✅ Upload resume PDF
- ✅ View & manage contact messages
- ✅ Manage skill categories

---

## 📡 API Endpoints

| Method | Endpoint                   | Auth   | Description       |
| ------ | -------------------------- | ------ | ----------------- |
| GET    | `/api/profile`             | Public | Developer profile |
| GET    | `/api/projects`            | Public | All projects      |
| GET    | `/api/projects?tech=React` | Public | Filtered projects |
| POST   | `/api/projects`            | Admin  | Create project    |
| PUT    | `/api/projects/:id`        | Admin  | Update project    |
| DELETE | `/api/projects/:id`        | Admin  | Delete project    |
| GET    | `/api/skills`              | Public | All skills        |
| GET    | `/api/resume`              | Public | Download resume   |
| POST   | `/api/resume`              | Admin  | Upload resume     |
| POST   | `/api/contact`             | Public | Send message      |
| GET    | `/api/contact`             | Admin  | Get all messages  |
| GET    | `/api/github`              | Public | GitHub stats      |
| GET    | `/api/leetcode`            | Public | LeetCode stats    |
| POST   | `/api/chat`                | Public | AI chatbot        |
| POST   | `/api/auth/login`          | Public | Admin login       |
| GET    | `/api/health`              | Public | Health check      |

---

## 🚀 Deployment

### Backend → Render.com (Free)

1. Push backend to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Set environment variables in Render dashboard
4. Deploy!

### Frontend → Vercel (Free)

1. Push frontend to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Set `VITE_API_URL=https://your-backend.onrender.com/api`
4. Deploy!

### Database → MongoDB Atlas (Free)

1. Create cluster at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Add IP whitelist: `0.0.0.0/0` (or specific IPs)
3. Copy connection string to `MONGODB_URI`

---

## 🤖 Chatbot Setup

The chatbot uses **OpenAI GPT-3.5-turbo**. It automatically fetches your portfolio data from MongoDB to answer recruiter questions accurately.

To use it:

1. Get an API key from [platform.openai.com](https://platform.openai.com)
2. Add to `.env`: `OPENAI_API_KEY=sk-...`

**Without an API key**, the chatbot falls back to rule-based responses automatically.

---

## 🔧 Customization

All personal data is in `backend/seed.js`. After editing, re-run:

```bash
node seed.js
```

To add projects, use the Admin Dashboard at `/admin`.

---

## 📱 Tech Stack

**Frontend:** React.js, Vite, TailwindCSS, Framer Motion, Recharts  
**Backend:** Node.js, Express.js, JWT, Multer, Morgan  
**Database:** MongoDB Atlas, Mongoose  
**AI:** OpenAI GPT-3.5-turbo  
**APIs:** GitHub REST API, LeetCode GraphQL API  
**Security:** Helmet, express-rate-limit, bcryptjs

---

Built with ❤️ by **Shashank Ganapati Naik**
