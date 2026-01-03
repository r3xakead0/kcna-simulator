# KCNA Simulator

![Podman](https://img.shields.io/badge/Podman-ready-892CA0?logo=podman&logoColor=white)
![GHCR](https://img.shields.io/badge/GHCR-published-brightgreen?logo=github)
![License](https://img.shields.io/github/license/r3xakead0/kcna-simulator)
![Platform](https://img.shields.io/badge/platform-linux%20%7C%20macOS-lightgrey)

A lightweight Next.js (TypeScript) simulator for the Linux Foundation KCNA exam. It supports light/dark themes, local JSON-backed authentication, randomized questions, detailed result breakdowns, and Podman-friendly containerization.

## Features
- Light and dark UI modes with a single toggle.
- Login validated against `data/users.json` (no external services).
- Questions stored as one JSON file per item under `data/questions/` and served randomly.
- Exam results highlight correct vs. incorrect answers per question.
- Jest unit tests for core scoring and user validation logic.
- Container-ready (Podman or Docker) build.

## Project Structure
- `data/users.json` – user list for login.
- `data/questions/*.json` – one file per question; sample format:
  ```json
  {
    "url": "https://example.com",
    "published_iso": "2023-08-28T15:14:00",
    "number": 1,
    "question": "In a cloud native world, what does the IaC abbreviation stand for?",
    "options": [
      { "key": "A", "text": "Infrastructure and Code" },
      { "key": "B", "text": "Infrastructure as Code" }
    ],
    "answers": { "platform": ["B"], "community": ["B"] }
  }
  ```
- API routes:
  - `api/login` reads `data/users.json`.
  - `api/questions` reads `data/questions/` and returns a random set.

## Getting Started
```bash
npm install
npm run dev
# open http://localhost:3000
```
Sample credentials: `demo` / `kcna2024!`.

## Tests and Linting
- Run unit tests: `npm test`
- Lint the project: `npm run lint`

## Containerization (Podman)
Build and run:
```bash
podman build -t kcna-simulator .
podman run --rm -p 3000:3000 kcna-simulator
```
The container runs `npm run start` after building with `npm run build`.

## Extending the Question Bank
1. Add a new JSON file under `data/questions/` following the format above.
2. Increment the `number` field sequentially.
3. Restart the dev server to pick up changes when running locally.

## Notes
- All data and authentication stay local (no remote calls).
- Dark/light preference is stored in `localStorage`.
- The UI supports single and multi-select questions based on the answer key count.
