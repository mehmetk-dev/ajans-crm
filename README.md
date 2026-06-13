# FOG Istanbul CRM

Monorepo containing the Spring Boot backend and React frontend for the agency
CRM.

## Toolchain

- Java 17
- Maven Wrapper
- Node.js 22
- npm 10 or newer
- PostgreSQL 16 for local runtime

Node and Java versions are declared in `.nvmrc` and `.tool-versions`.

## Verify

Run the same quality gates used by CI:

```bash
cd frontend
npm ci
npm run lint -- --max-warnings=0
npm run test:ci
npm run build

cd ../backend
./mvnw test
```

Backend tests use the test profile and an in-memory H2 database. They do not
require a running PostgreSQL instance.

## Local Runtime

Create a `.env` file with the required Docker Compose values:

```dotenv
DB_USERNAME=ajans_crm
DB_PASSWORD=change-me
JWT_SECRET=replace-with-a-long-random-secret
```

Then start the stack:

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

Optional Google, Meta and PageSpeed credentials are listed in
`docker-compose.yml`. They can remain empty when those integrations are not in
use.

## Repository Rules

- `frontend/src` is the only live frontend source tree.
- `frontend/src_backup` is ignored and must not be committed.
- `backend/uploads` contains runtime user files and must not be committed.
- Controllers call application services rather than repositories directly.
- Frontend feature consumers use each feature's public API.

See `REFACTOR_PLANI.md` for the architecture and refactor record.
