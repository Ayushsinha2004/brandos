# Govind Brand OS - Setup Guide

This guide explains how to set up and run the FastAPI backend and React frontend.

## Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn
- OpenAI API key

## Project Structure

```
Brandos/
├── backend/                    # FastAPI Backend
│   ├── main.py                # Application entry point
│   ├── database.py            # Database configuration
│   ├── config.py              # App settings
│   ├── requirements.txt       # Python dependencies
│   ├── models/                # SQLAlchemy models
│   │   ├── post.py           # Post and PostImage models
│   │   └── context_profile.py # ContextProfile model
│   ├── schemas/               # Pydantic schemas
│   │   ├── post.py           # Post request/response schemas
│   │   ├── context_profile.py # Profile schemas
│   │   ├── content_generation.py # Generation schemas
│   │   └── image_generation.py # Image schemas
│   ├── routers/               # API routes
│   │   ├── posts.py          # Post CRUD endpoints
│   │   ├── context_profiles.py # Profile endpoints
│   │   ├── content_generation.py # Generation endpoints
│   │   └── images.py         # Image generation endpoints
│   └── services/              # Business logic
│       ├── content_generator.py # Content generation service
│       └── image_generator.py # Image generation service
│
├── frontend/                   # React Frontend
│   ├── package.json           # Node dependencies
│   ├── vite.config.ts         # Vite configuration
│   ├── tailwind.config.js     # TailwindCSS config
│   └── src/
│       ├── main.tsx           # App entry point
│       ├── App.tsx            # Router setup
│       ├── api/               # API client
│       │   └── index.ts       # Axios API functions
│       ├── components/        # Shared components
│       │   └── Layout.tsx     # Main layout with sidebar
│       └── pages/             # Page components
│           ├── Dashboard.tsx  # Overview page
│           ├── PostGenerator.tsx # Content generation
│           ├── PostsPage.tsx  # Post list
│           ├── PostEditor.tsx # Post editor
│           ├── ContextProfiles.tsx # Profile management
│           └── ImageGenerator.tsx # Image generation
│
├── context/                    # Brand context JSON files
├── directives/                 # Content directives (SOPs)
└── execution/                  # Python execution scripts
```

## Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Create .env file:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_key_here
   ```

6. **Run the server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

**Note:** On startup, the backend automatically loads:
- All 5 context profiles from `Govind-Brand-Os/context/*.json`
- All existing posts from `Govind-Brand-Os/directives/content/linkedincontent/posts/*.md`
- All existing images from `Govind-Brand-Os/directives/content/linkedincontent/posts/images/`

## Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Posts (`/api/posts`)
- `GET /` - List all posts
- `GET /{id}` - Get post by ID
- `POST /` - Create new post
- `PUT /{id}` - Update post
- `DELETE /{id}` - Delete post
- `POST /{id}/publish` - Mark post as published
- `POST /{id}/archive` - Archive post
- `POST /{id}/export-to-file` - Export to markdown

### Context Profiles (`/api/context`)
- `GET /` - List all profiles
- `GET /types` - List profile types
- `GET /active/{type}` - Get active profile by type
- `GET /{id}` - Get profile by ID
- `POST /` - Create new profile
- `PUT /{id}` - Update profile
- `DELETE /{id}` - Delete profile
- `POST /import-from-files` - Import from JSON files
- `POST /{id}/export-to-file` - Export to JSON file

### Content Generation (`/api/generate`)
- `GET /discovery-questions` - Get Q&A questions
- `POST /from-transcript` - Generate from transcript
- `POST /from-questions` - Generate from Q&A
- `POST /hooks` - Generate hook suggestions
- `GET /post-types` - Get available post types
- `GET /context-summary` - Get loaded context summary

### Images (`/api/images`)
- `POST /generate` - Generate images for post
- `POST /{id}/generate-prompts` - Generate image prompts
- `POST /{id}/validate-prompts` - Validate prompts
- `GET /{id}/images` - Get post images
- `GET /styles` - Get available styles
- `DELETE /{id}` - Delete image

## Features

### Dashboard
- Overview of post statistics
- Recent posts list
- Context profile status
- Quick action buttons

### Post Generator
- **Transcript Method:** Paste any transcript (YouTube, podcast, sales call) and generate a LinkedIn post
- **Q&A Method:** Answer 10 discovery questions to generate content
- Post type selection (Story, Framework, Contrarian, Case Study)
- Real-time preview and copy functionality

### Posts Management
- View all posts with filtering by status
- Search posts by title or hook
- Edit, publish, archive, or delete posts
- Export posts to markdown files

### Context Profiles
- View and edit all 5 profile types:
  - Brand Voice
  - Business Context
  - ICP Context
  - Marketing Strategy
  - Personal Story
- Import from existing JSON files
- Export changes back to files
- Visual JSON editor

### Image Generation
- Select posts and generate images
- 3 style options:
  - Technical (flowcharts, diagrams)
  - Apple (minimal, premium)
  - Business Results (metrics, infographics)
- Prompt validation before generation
- Preview prompts without generating

## Development Notes

- Backend uses SQLite by default (can be changed to PostgreSQL)
- Frontend proxies API requests to backend via Vite config
- Content generation requires OpenAI API key
- Image generation uses DALL-E 3

## Troubleshooting

### Backend Issues
- Ensure virtual environment is activated
- Check `.env` file has valid OpenAI API key
- Verify Python 3.9+ is installed

### Frontend Issues
- Ensure Node 18+ is installed
- Run `npm install` to install dependencies
- Check backend is running on port 8000

### API Connection Issues
- Verify both servers are running
- Check CORS settings in `backend/main.py`
- Frontend proxy is configured for port 8000
