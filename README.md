# KCNA Exam Simulator

![License](https://img.shields.io/github/license/r3xakead0/kcna-simulator)
![Platform](https://img.shields.io/badge/platform-linux%20%7C%20macOS-lightgrey)

A lightweight Next.js (TypeScript) simulator for the Linux Foundation KCNA exam. It uses local JSON files for users and questions, paginates 10 questions per page, sorts items from newest to oldest, and stores the latest result locally for review on the `/results` page.

## Features
- Local login verified against `data/users.json` (no external services).
- Questions stored as one JSON file per item under `data/questions/`, sorted by `published_iso` (newest first).
- Pagination shows 10 questions at a time; supports single- and multi-select answers.
- Results are saved to `localStorage` and displayed on a dedicated `/results` page with per-question breakdown.
- Jest unit tests for scoring and credential validation.
- Container-ready with the provided `Dockerfile` (works with Podman or Docker).

## Data Model
- `data/users.json`
  ```json
  [
    { "username": "demo", "password": "kcna2026!", "name": "Demo Candidate" }
  ]
  ```
- `data/questions/*.json`
  ```json
  {
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
  Use ISO8601 timestamps for `published_iso`; higher/ newer timestamps appear first.

## Running Locally
```bash
npm install
npm run dev
# open http://localhost:3000
```
Sample credentials: `demo` / `kcna2026!` (or any entry in `data/users.json`).

## Results Workflow
- Submit answers to save the evaluation in `localStorage`.
- Visit `/results` to see the score and per-question detail (letters + option text).
- Login state is also stored locally so you return to the exam instead of the login screen.

## Tests and Linting
- Unit tests: `npm test`
- Lint: `npm run lint`

## Extending the Question Bank
1. Add a JSON file under `data/questions/` following the structure above.
2. Set `published_iso` to control ordering (newest first) and increment `number` as needed.
3. Restart the dev server while running locally to pick up new files.
