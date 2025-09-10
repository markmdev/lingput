# Lingput - Production-Grade AI Language Learning Platform

[![Tests](https://github.com/markmdev/lingput/actions/workflows/pr-tests.yml/badge.svg)](https://github.com/markmdev/lingput/actions/workflows/pr-tests.yml)
[![Deploy](https://github.com/markmdev/lingput/actions/workflows/deploy.yml/badge.svg)](https://github.com/markmdev/lingput/actions/workflows/deploy.yml)

**🚀 Live Demo:** https://lingput.dev/ | **📚 API Docs:** https://docs.lingput.dev/

<img src="docs/logo_min.jpeg" alt="Lingput logo" width="320" />

## The Challenge

Traditional language learning apps rely on flashcards and repetitive drills. **Lingput solves the real problem**: providing learners with **comprehensible input** - personalized stories at exactly their vocabulary level, complete with audio and smart word tracking.

## Impact & Performance

- **85% faster page load** (600ms → 85ms) by implementing Redis caching to eliminate multiple redundant database queries
- **Zero-downtime deployments** with 80% reduction in deployment time (25min → 5min)
- **Non-blocking user experience** replacing 30-second blocking API requests with async job queues and real-time progress updates
- **Production-ready architecture** handling concurrent AI processing and real-time progress updates

<p align="center" id="video-demo">
  <img src="docs/lingput-demo.gif" width="960" height="540"/>
</p>

---

## Technical Architecture Highlights

### 🏗️ Scalable Backend Design

- **Clean Architecture**: Multi-layered Express.js backend (Controller/Service/Repository) with dependency injection for maintainability and testability
- **Async Job Processing**: BullMQ + Redis job queue system offloads heavy AI tasks, enabling responsive API and real-time progress tracking
- **Intelligent Caching**: Redis-powered caching strategy dramatically reduces database load and API latency
- **Secure Authentication**: HTTP-only cookies with access/refresh token flow, protecting against XSS attacks

### ⚡ Performance Engineering

- **Database Optimization**: PostgreSQL with Prisma ORM, optimized queries and connection pooling
- **Caching Strategy**: Multi-layer caching (Redis) for frequently accessed stories and vocabulary data
- **Background Processing**: Complex AI workflows (story generation, translation, audio synthesis) handled asynchronously
- **Resource Management**: Docker containerization with optimized resource allocation

### 🔄 Production DevOps

- **CI/CD Pipeline**: Automated testing, linting, and deployment with GitHub Actions
- **Containerized Deployment**: Docker Compose orchestration with NGINX reverse proxy
- **Monitoring & Reliability**: Comprehensive error handling and job queue monitoring

---

## System Architecture

<p align="center">
  <img src="docs/architecture.png" alt="Architecture diagram" width="650"/>
</p>

### Story Generation Pipeline

```
User Request → Job Queue → Background Worker Pipeline:
├── Vocabulary Analysis (PostgreSQL)
├── AI Story Generation (OpenAI)
├── Chunk Translation (OpenAI)
├── Lemmatization & Translation
├── Audio Synthesis (TTS + FFmpeg)
├── Asset Upload (Supabase)
└── Database Persistence
```

**Frontend receives real-time progress updates throughout the entire pipeline.**

---

## Tech Stack

**Backend & Infrastructure**

- **API**: Express.js with TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Caching & Jobs**: Redis + BullMQ
- **Authentication**: JWT with HTTP-only cookies
- **DevOps**: Docker, NGINX, GitHub Actions

**Frontend & User Experience**

- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Custom React hooks for job lifecycle management
- **Real-time Updates**: Polling-based progress tracking

**External Services**

- **AI**: OpenAI GPT for story generation and translation
- **Storage**: Supabase for audio file management
- **Deployment**: DigitalOcean + CapRover

---

## Key Features

### For Language Learners

- **Personalized Content**: AI generates stories tailored to individual vocabulary levels
- **Comprehensive Learning**: Story text, translations, audio, and vocabulary tracking
- **Progress Tracking**: Smart word learning system with spaced repetition principles
- **Seamless UX**: Non-blocking interface with real-time generation progress

### For Developers

- **Production-Ready**: Built with scalability, maintainability, and reliability in mind
- **Modern Architecture**: Clean separation of concerns with dependency injection
- **Comprehensive Testing**: Unit and integration tests with CI/CD pipeline
- **Developer Experience**: Fast local development setup with Docker Compose

---

## Getting Started

### Prerequisites

- Docker and Docker Compose
- OpenAI API key
- Supabase project (for audio storage)

### Quick Setup

```bash
# Clone repository
git clone https://github.com/markmdev/lingput
cd lingput

# Configure environment
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
# Edit .env files with your API keys

# Start all services
docker compose -f docker-compose-dev.yml up -d
```

**Access the app:** http://localhost:3050

> **Note:** Account creation takes 2 seconds with no email verification required for easy testing.

### Environment Configuration

**Backend (`apps/backend/.env`):**

```env
OPENAI_API_KEY=sk-...
JWT_SECRET=your-secure-jwt-secret
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_API_KEY=eyJ......
```

**Frontend (`apps/frontend/.env`):**

```env
NEXT_PUBLIC_AUDIO_BUCKET_URL=https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/YOUR_BUCKET/
```

---

## Development Workflow

### Branch Protection & CI/CD

- **Protected `main` branch**: All changes via Pull Requests
- **Automated Testing**: ESLint + unit/integration tests on every PR
- **Continuous Deployment**: Automatic deployment to production on merge
- **Zero-Downtime Deployments**: Rolling updates with health checks

### Code Quality Standards

- **TypeScript Strict Mode**: Type safety throughout the application
- **Clean Architecture**: Testable, maintainable code structure
- **Comprehensive Testing**: Unit tests for business logic, integration tests for API endpoints
- **Code Reviews**: All changes reviewed before merge

---

## Roadmap

**Phase 1: Core Learning Experience** ✅

- [x] Vocabulary assessment and personalized story generation
- [x] Audio synthesis with synchronized translations
- [x] Smart vocabulary tracking and progress monitoring

**Phase 2: Enhanced Features** 🚧

- [ ] Anki import/export functionality
- [ ] Advanced word information (definitions, grammar, examples)
- [ ] Detailed learning analytics and progress visualization
- [ ] Offline audio download capability

**Phase 3: Gamification & Social** 📋

- [ ] Achievement system and learning streaks
- [ ] Leaderboards and social learning features
- [ ] Multi-language support expansion
- [ ] Advanced TTS voice options

---

## Performance Benchmarks

| Metric                | Before Optimization | After Optimization | Improvement      |
| --------------------- | ------------------- | ------------------ | ---------------- |
| Story Fetch API       | 600ms               | 85ms               | **85% faster**   |
| Database Queries      | N/A                 | Cached             | **Reduced load** |
| Deployment Time       | 25 minutes          | 5 minutes          | **80% faster**   |
| Dev Environment Setup | 2 minutes           | 20 seconds         | **83% faster**   |

---

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository** and create a feature branch
2. **Follow the existing code style**: TypeScript strict mode, meaningful variable names
3. **Write tests** for new functionality
4. **Run the test suite**: `npm run test` before submitting
5. **Create a Pull Request** with a clear description

**Code Style Guidelines:**

- Use early returns and avoid deep nesting
- Prefer composition over inheritance
- Write self-documenting code with clear function names
- Include JSDoc comments for complex business logic

---

## License

Licensed under the [ISC License](./LICENSE).

---

## Connect

Built by **Mark** - Backend-focused Full-stack Developer  
🌐 **Portfolio:** https://markmdev.com/  
💼 **LinkedIn:** [Connect with me](https://www.linkedin.com/in/markmdev/)  
📧 **Contact:** Open to backend and full-stack opportunities!
