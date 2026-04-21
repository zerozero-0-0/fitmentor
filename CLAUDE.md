## Fitmentor

## Abstract
This application is designed to help me manage my exercise routine.
It is used on an iPhone through Chrome.
It has the following features:
- Exercise management: I can log my exercises, including the name, weight, reps, and other details.
- Today's exercise suggestions: Using the Gemini API, previous exercise data, and my condition today, it suggests today's exercise plan.
- Exercise history: I can review my past exercise records.
- For development, use docker-compose.dev.yml; for production, use docker-compose.prod.yml.

## Tech stack
- mise: 2026.2.22
- uv: 0.11.2
- pre-commit: 4.5.1
- Docker: 29.2.1
- Vercel: deploying the frontend
- fly.io: deploying the backend

### Frontend
- pnpm: 10.32.1
- React: 19.2.4
- tailwindcss: 4.2.2
- shadcn: 4.1.2
- TypeScript: 5.9.3

### Backend
- uv: 0.11.2
- Python: 3.10.20

### Database
- postgres: 17