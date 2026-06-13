# FOG Istanbul CRM Frontend

React 19, TypeScript, Vite and TanStack Query based CRM frontend.

## Requirements

- Node.js 22
- npm 10 or newer

The repository pins Node in `.nvmrc` and `.tool-versions`.

## Setup

```bash
nvm use
npm ci
npm run dev
```

The development server runs at `http://localhost:5173` and expects the backend
at `http://localhost:8080`.

## Quality Commands

```bash
npm run lint -- --max-warnings=0
npm run test:ci
npm run build
```

## Source Boundaries

- `src/app`: providers and route composition
- `src/pages`: route-level composition
- `src/features`: feature APIs, hooks, models and UI
- `src/components`: genuinely shared UI
- `src/store`: application-wide contexts

Feature consumers should import from the feature's public `index.ts` instead of
its internal files. Runtime uploads and backup source trees do not belong in Git.
