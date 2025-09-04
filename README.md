# Lingput - AI-Powered Comprehensible Input for Language Learning

[![Tests](https://github.com/markmdev/lingput/actions/workflows/pr-tests.yml/badge.svg)](https://github.com/markmdev/lingput/actions/workflows/pr-tests.yml)
[![Deploy](https://github.com/markmdev/lingput/actions/workflows/deploy.yml/badge.svg)](https://github.com/markmdev/lingput/actions/workflows/deploy.yml)

**Demo:**  
https://lingput.dev/  
https://app.lingput.dev/  
API:  
https://docs.lingput.dev/

<img src="docs/logo_min.jpeg" alt="Lingput logo" width="320" />

**Lingput** is a full-stack, production-grade application that helps learners acquire a new language through **short, AI-generated stories**.
Unlike generic flashcard apps, Lingput adapts to your vocabulary and provides **natural comprehensible input**: stories, translations, audio, and smart word tracking.

---

## Architectural & Technical Highlights

- **Scalable Background Processing:** Utilizes a robust **Job Queue System (BullMQ & Redis)** to handle complex, long-running AI tasks (story and audio generation) asynchronously. This ensures the API remains fast and responsive, providing a seamless user experience with real-time progress updates on the frontend.
- **Clean Backend Architecture:** The Express.js backend is built on a **testable, multi-layered architecture** (Controller, Service, Repository) with **Dependency Injection** for loose coupling and maintainability.
- **Robust Caching Strategy:** Leverages **Redis** for caching frequently accessed data (like stories and word lists), significantly **reducing database load** and improving API response times.
- **Secure Authentication:** Implements a secure, modern authentication system using **HTTP-only cookies** with access and refresh tokens to protect against XSS attacks.
- **Advanced Frontend State Management:** The Next.js frontend features a **custom React hook (`handleJob`)** to intelligently manage the lifecycle of background jobs, abstracting away the complexity of polling and providing optimistic UI updates.
- **Containerized for Production:** The entire application is containerized using **Docker and Docker Compose**, ensuring consistent, reproducible deployments for all services (backend, frontend, workers, NGINX).

Full tech stack: [Tech Stack](#tech-stack)

---

## CI/CD

This repo ships with a simple, reliable pipeline built around **Docker**, **GitHub Actions**, and **CapRover** on a DigitalOcean droplet.

### Branch strategy & protections

- `main` is **protected**: direct pushes are blocked; changes land via Pull Requests.
- Status checks (tests + ESLint) are **required** to merge.

### Continuous Integration — `pr-tests.yml`

On every **Pull Request** and on **pushes to `main`**, GitHub Actions runs:

- **ESLint**.
- **Unit/Integration tests**.
- Dependency caching to keep CI fast.

### Continuous Delivery — `deploy.yml` (CapRover on DigitalOcean)

- **Trigger:** Runs when the PR Tests workflow completes on commits to `main`.
- **Docker images:** Services are built via Docker and tagged (with the commit SHA).
- **CapRover release:** The workflow updates CapRover apps using the new image tags.
- **What gets built and deployed:**
  - Backend API (`lingput-backend`)
  - Worker (BullMQ worker) (`lingput-worker`)
  - Frontend app (`lingput-frontend`)
  - Marketing/landing site (`lingput-landing`)
  - API/docs site (`lingput-docs`)
- **NGINX:** Not deployed by this workflow. On CapRover, NGINX is provided by the platform (you configure routes/SSL there). The `lingput-nginx` image in compose is only for self-hosted Docker setups.

---

<p align="center" id="video-demo">
  <img src="docs/lingput-demo.gif" width="960" height="540"/>
</p>

## Table of Contents

- [Use Cases](#use-cases)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quickstart](#quickstart)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Use Cases

**Who is this app for?**

- Language learners who want to acquire a new language through **immersive content** rather than dry flashcards.
- Users who want stories tailored to their **current vocabulary level**, so they can read and listen with confidence.
- Learners who need a simple way to **track, review, and master new words** over time.

---

## Features

- **Auth with secure cookies** - register/login with HTTP-only tokens, refresh flow included.
- **Vocabulary assessment** - quick test estimates your vocab size using a frequency list.
- **Personalized story generation** - AI generates stories with your known words (plus a few new).
- **Chunked translation** - story is split into chunks with translations for easier comprehension.
- **Audio generation** - full audio track (story + translations with pauses), stored in Supabase.
- **Smart word tracking** - The app doesn't just show translations, it saves words with examples and helps you track your progress.
- **Background jobs** - BullMQ workers handle long-running tasks with progress updates.
- **Caching** - Redis caches stories and word lists for fast responses.

---

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router)
- **Backend**: [Express.js](https://expressjs.com/)
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **UI**: [Tailwind CSS](https://tailwindcss.com/)
- **Background Jobs**: [BullMQ](https://docs.bullmq.io/)
- **Caching**: [Redis](https://redis.io/)
- **DevOps**: [Docker](https://www.docker.com/), [NGINX](https://nginx.org/)
- **Cloud Storage**: [Supabase](https://supabase.com/)
- **AI**: [OpenAI](https://openai.com/api/)

<p align="center">
  <img src="docs/architecture.png" alt="Architecture diagram" width="650"/>
</p>

**High-level flow for story generation:**

1. User starts job → backend enqueues `generateStory` task (BullMQ).
2. Worker pipeline:

   - Fetch user vocabulary (Postgres)
   - Generate story (OpenAI)
   - Translate chunks (OpenAI)
   - Lemmatize + translate lemmas (lemma service (`apps/lemmas/`) + OpenAI)
   - Assemble audio (TTS + ffmpeg) -> upload to Supabase
   - Save the story to PostgreSQL

3. Frontend polls job status → displays story, audio, and unknown words.

---

## Roadmap

✅ = Done · 🟦 = Planned

- ✅ Interactive onboarding
- 🟦 Import from Anki
- 🟦 Audio downloading (export generated audio as MP3)
- 🟦 Word info on click (definitions, examples, grammar)
- 🟦 Detailed statistics (track number of learned words over time)
- 🟦 Gamification (XP, streaks, achievements)
- 🟦 Audio voice settings (choose between different TTS voices)
- 🟦 Leaderboard (compare progress with other learners)
- 🟦 Multi-language support (beyond current target language)

---

## Quickstart

```bash
# Clone the repository
git clone https://github.com/markmdev/lingput
```

Create `.env` files for backend and frontend:

- `apps/backend/.env`

```env
OPENAI_API_KEY=sk-...
JWT_SECRET=replace-with-a-long-random-secret
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_API_KEY=eyJ......
```

- `apps/frontend/.env`

```env
NEXT_PUBLIC_AUDIO_BUCKET_URL=https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/YOUR_BUCKET/
```

```bash
# Navigate to the project directory
cd lingput

# Start Lingput
docker compose -f docker-compose-dev.yml up -d
```

[How to create supabase audio bucket](docs/supabase-guide.md)

App: [http://localhost:3050](http://localhost:3050)

---

## Contributing

Contributions welcome!

- Use **TypeScript strict mode** & meaningful names.
- Follow existing style (early returns, focused modules).

---

## License

Licensed under the [ISC License](./LICENSE).
