# 🟣 CoWatch - Synchronized YouTube Watch Together Platform

Real-time collaborative video watching application with synchronized playback, live chat, and WebSocket communication.

## 🚀 Features

- **User Authentication** - Token-based registration/login with Django REST Framework
- **Room Management** - Create private rooms with unique 6-character codes
- **Real-time Sync** - WebSocket-powered video playback synchronization across users
- **Live Chat** - Per-room messaging with presence tracking
- **YouTube Integration** - Embedded player with shared controls
- **Responsive UI** - Modern React interface with Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **Django 4.x** - Web framework
- **Django REST Framework** - API endpoints
- **Django Channels** - WebSocket support
- **Daphne** - ASGI server
- **Redis (Upstash)** - Channel layer backend
- **PostgreSQL** - Production database

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client

## 📦 Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Redis (or Upstash account)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Environment Variables

### Backend `.env`
```env
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=postgresql://...
REDIS_URL=rediss://default:password@host.upstash.io:6379
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000
```

## 🌐 Deployment

**Live URLs:**
- Frontend: https://cowatch-hood.netlify.app
- Backend: https://co-watch.onrender.com

### Deploy Backend (Render)
1. Create Web Service from GitHub
2. Build: `pip install -r backend/requirements.txt`
3. Start: `daphne -b 0.0.0.0 -p $PORT --proxy-headers cowatch_backend.asgi:application`
4. Add environment variables (REDIS_URL, DATABASE_URL, etc.)

### Deploy Frontend (Netlify)
1. Build command: `cd frontend && npm run build`
2. Publish directory: `frontend/dist`
3. Environment: `VITE_API_URL=https://co-watch.onrender.com`

## 📝 Usage

1. **Register/Login** → Redirects to welcome page
2. **Create Room** → Generate unique code
3. **Share Code** → Invite friends to join
4. **Watch Together** → Synced playback + live chat



## 📄 License

Personal Project
