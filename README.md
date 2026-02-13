# Brand OS - AI-Powered LinkedIn Content Creation Platform

A full-stack application for AI-powered LinkedIn content creation with context-aware post generation and image creation.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.11+-green)
![React](https://img.shields.io/badge/react-18+-blue)
![FastAPI](https://img.shields.io/badge/fastapi-0.104+-teal)

## Features

### 🎨 Modern UI/UX
- **Dark Theme** with glassmorphism effects
- **Responsive Design** optimized for all screen sizes
- **Animated Components** with smooth transitions
- **LinkedIn Post Preview** - see how posts will look before publishing

### 🤖 AI-Powered Content Generation
- **From Transcripts** - Transform YouTube, podcast, or meeting transcripts into LinkedIn posts
- **From Q&A** - Answer discovery questions to generate personalized content
- **Multiple Post Types** - Story-based, Framework, Contrarian Opinion, Case Study
- **Smart Hooks** - AI-generated attention-grabbing opening lines

### 🖼️ Image Generation
- **3 Visual Styles** - Technical, Apple-inspired, Business Results
- **AI-Generated Prompts** - Automatic prompt creation for images
- **DALL-E Integration** - High-quality image generation

### 📊 Content Management
- **Context Profiles** - Store personal, business, and audience context
- **Post Tracking** - Manage posts through drafting, review, and published stages
- **Post Editor** - Full-featured editor with preview

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database management
- **SQLite** - Lightweight database
- **OpenAI API** - Content and image generation
- **Python-dotenv** - Environment variable management

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Lucide Icons** - Beautiful icon library

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenAI API key

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
cp .env.example .env
```

5. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your_api_key_here
DATABASE_URL=sqlite:///./brandos.db
DEBUG=true
```

6. Start the server:
```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
Brandos/
├── backend/
│   ├── models/           # Database models
│   ├── routers/          # API endpoints
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   ├── main.py          # Application entry point
│   └── config.py        # Configuration
│
├── frontend/
│   ├── src/
│   │   ├── api/         # API client
│   │   ├── assets/      # Static assets
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── main.tsx     # Application entry point
│   └── public/          # Public assets
│
└── Govind-Brand-Os/     # Legacy data (context profiles, posts)
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Key Features Explained

### Context Profiles
Store information about yourself, your business, and your audience to generate personalized content:
- **Personal Context** - Your background, expertise, writing style
- **Business Context** - Company details, offerings, value propositions
- **Audience Context** - Target audience characteristics and pain points

### Post Generation Methods

**From Transcript:**
1. Paste a transcript from any source
2. Select source type (YouTube, Podcast, Meeting, etc.)
3. Choose preferred post type
4. Generate AI-powered content

**From Q&A:**
1. Answer discovery questions about your experience
2. AI analyzes your responses
3. Generates contextually relevant posts

### Image Styles

**Technical Style:**
- Clean flowcharts and system diagrams
- Monospace typography
- Engineering-inspired aesthetic

**Apple Style:**
- Ultra-minimal design
- Single focal point
- Premium aesthetic

**Business Results Style:**
- Metrics and numbers as hero elements
- Before/After comparisons
- ROI demonstrations

## Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=sqlite:///./brandos.db
DEBUG=true
```

## Deployment

### Backend Deployment (Render.com)
1. Create a new Web Service
2. Connect your GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables

### Frontend Deployment (Netlify/Vercel)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables if needed
4. Update API base URL in production

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Author

**Govind Bajwa**
- AI & Automation Expert
- Helping Businesses Scale with AI

## Acknowledgments

- OpenAI for GPT and DALL-E APIs
- FastAPI team for the excellent framework
- React and Vite communities
- TailwindCSS for the design system

---

Built with ❤️ for LinkedIn content creators
