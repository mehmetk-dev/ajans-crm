# Google Analytics and Instagram Snapshot-First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the default 30-day Google Analytics and Instagram overview screens read stored integration snapshots while retaining live provider calls for non-default date ranges.

**Architecture:** Extend the existing `integration-snapshots` force-refresh surface with integration-specific Google Analytics and Instagram endpoints. Frontend consumers use `/client/integration-snapshots/overview` for the default 30-day view, display snapshot metadata, and fall back to the existing live overview endpoints only when the user selects another preset or a custom range.

**Tech Stack:** Java 17, Spring Boot 3, JUnit 5, Mockito, React 19, TypeScript, TanStack Query, Vitest, Testing Library.

## Global Constraints

- Preserve all unrelated dirty-worktree changes.
- Reuse `IntegrationSnapshotSyncService`, `ClientIntegrationSnapshotService`, and the existing overview response; do not add a table or migration.
- Status/OAuth/account configuration requests remain live.
- Default range means preset index `2` for Google Analytics and preset index `1` for Instagram.
- Non-default presets and custom ranges continue to call the provider-backed overview endpoints.
- A failed refresh must preserve and display the last successful snapshot payload.
- Do not commit without an explicit user request because the working tree contains mixed changes.

---

### Task 1: Integration-specific backend refresh commands

**Files:**
- Modify: `backend/src/test/java/com/fogistanbul/crm/integrationsnapshot/application/ClientIntegrationSnapshotServiceTest.java`
- Modify: `backend/src/test/java/com/fogistanbul/crm/integrationsnapshot/application/IntegrationSnapshotSyncServiceTest.java`
- Modify: `backend/src/main/java/com/fogistanbul/crm/integrationsnapshot/application/IntegrationSnapshotSyncService.java`
- Modify: `backend/src/main/java/com/fogistanbul/crm/integrationsnapshot/application/ClientIntegrationSnapshotService.java`
- Modify: `backend/src/main/java/com/fogistanbul/crm/integrationsnapshot/web/ClientIntegrationSnapshotController.java`
- Modify: `frontend/src/features/integration-snapshots/api/integrationSnapshotApi.ts`

**Interfaces:**
- Produces: `syncGoogleAnalyticsSnapshotNow(UUID)`, `syncInstagramSnapshotNow(UUID)`, `refreshGoogleAnalytics(UUID, UUID)`, `refreshInstagram(UUID, UUID)`.
- Produces: `POST /api/client/integration-snapshots/google-analytics/refresh` and `POST /api/client/integration-snapshots/instagram/refresh`.
- Produces: `integrationSnapshotApi.refreshGoogleAnalytics(companyId)` and `integrationSnapshotApi.refreshInstagram(companyId)`.

- [ ] **Step 1: Write failing service tests**

Add tests that call the new refresh methods and verify membership plus exactly the matching sync method. Add sync-service tests that verify GA uses `DIGITAL_MARKETING`/`WEB_INTERVAL`, Instagram uses `SOCIAL_MEDIA`/`SOCIAL_INTERVAL`, and unrelated provider services are untouched.

- [ ] **Step 2: Verify RED**

Run: `cd backend && mvn -Dtest=ClientIntegrationSnapshotServiceTest,IntegrationSnapshotSyncServiceTest test`

Expected: compilation failure because the four new methods do not exist.

- [ ] **Step 3: Implement minimal backend and API surface**

Add the integration-specific sync methods by reusing `syncIfDue(..., true, ...)`. Add access-policy guarded service methods, controller routes, and frontend API methods with the exact names above.

- [ ] **Step 4: Verify GREEN**

Run: `cd backend && mvn -Dtest=ClientIntegrationSnapshotServiceTest,IntegrationSnapshotSyncServiceTest test`

Expected: both test classes pass with zero failures.

### Task 2: Google Analytics snapshot-first panel and detail hook

**Files:**
- Modify: `frontend/src/features/google-analytics/hooks/useGADetailPage.test.tsx`
- Create: `frontend/src/features/google-analytics/ui/GoogleAnalyticsPanel.test.tsx`
- Modify: `frontend/src/features/google-analytics/hooks/useGADetailPage.ts`
- Modify: `frontend/src/features/google-analytics/ui/GoogleAnalyticsPanel.tsx`
- Modify: `frontend/src/pages/client/GoogleAnalyticsDetailPage.tsx`

**Interfaces:**
- Consumes: `integrationSnapshotApi.getOverview(companyId)` and `refreshGoogleAnalytics(companyId)`.
- Produces: `snapshotMeta: IntegrationSnapshotMeta | null` from `useGADetailPage`.

- [ ] **Step 1: Write failing frontend tests**

Assert that the initial/default preset reads `snapshot.ga`, does not call `googleAnalyticsApi.getOverview`, and exposes `gaSnapshot`. Assert that changing to a non-default preset calls the live overview endpoint. Assert that default refresh calls `refreshGoogleAnalytics` before reloading the snapshot. Render the panel and assert the same default snapshot behavior.

- [ ] **Step 2: Verify RED**

Run: `cd frontend && npm run test:ci -- useGADetailPage.test.tsx GoogleAnalyticsPanel.test.tsx`

Expected: failures showing the default view still calls the live endpoint and the dedicated refresh API is missing from consumers.

- [ ] **Step 3: Implement minimal snapshot selection**

For preset index `2` with no custom range, load `snapshot.ga` and `snapshot.gaSnapshot`. Otherwise keep the current live request. On default refresh, call `refreshGoogleAnalytics`, then reload. Surface last-sync/failed-snapshot information without hiding preserved payload data.

- [ ] **Step 4: Verify GREEN**

Run: `cd frontend && npm run test:ci -- useGADetailPage.test.tsx GoogleAnalyticsPanel.test.tsx`

Expected: both suites pass with zero failures.

### Task 3: Instagram overview snapshot-first consumers

**Files:**
- Modify: `frontend/src/features/client-analytics/ui/InstagramAnalyticsPanel.test.tsx`
- Create: `frontend/src/pages/client/InstagramDetailPage.test.tsx`
- Modify: `frontend/src/features/instagram/ui/InstagramPanel.tsx`
- Modify: `frontend/src/pages/client/InstagramDetailPage.tsx`

**Interfaces:**
- Consumes: `integrationSnapshotApi.getOverview(companyId)` and `refreshInstagram(companyId)`.
- Keeps: `igApi.getReels/getPosts`, whose backend endpoints already return media snapshots.

- [ ] **Step 1: Write failing frontend tests**

Assert that `StatsColumn` renders `snapshot.ig` without calling `igApi.getOverview`. For the detail page, assert that the default one-month preset loads `snapshot.ig`, while the one-week/custom ranges still call the live overview endpoint. Assert that default refresh invokes `refreshInstagram` and preserves media snapshot calls.

- [ ] **Step 2: Verify RED**

Run: `cd frontend && npm run test:ci -- InstagramAnalyticsPanel.test.tsx InstagramDetailPage.test.tsx`

Expected: failures showing the statistics column and default detail view still use live overview requests.

- [ ] **Step 3: Implement minimal snapshot selection**

Change `StatsColumn` to use the integration snapshot query. In the detail page, select the stored overview only for preset index `1`; preserve live requests for index `0` and custom index `2`. Add a visible refresh control and stale/failed snapshot copy while keeping the last successful payload visible.

- [ ] **Step 4: Verify GREEN**

Run: `cd frontend && npm run test:ci -- InstagramAnalyticsPanel.test.tsx InstagramDetailPage.test.tsx`

Expected: both suites pass with zero failures.

### Task 4: Regression and build verification

**Files:**
- Verify all modified files.

- [ ] **Step 1: Run targeted backend tests**

Run: `cd backend && mvn -Dtest=ClientIntegrationSnapshotServiceTest,IntegrationSnapshotSyncServiceTest test`

- [ ] **Step 2: Run targeted frontend tests**

Run: `cd frontend && npm run test:ci -- useGADetailPage.test.tsx GoogleAnalyticsPanel.test.tsx InstagramAnalyticsPanel.test.tsx InstagramDetailPage.test.tsx`

- [ ] **Step 3: Run frontend quality gates**

Run: `cd frontend && npm run lint -- --max-warnings=0`

Run: `cd frontend && npm run build`

- [ ] **Step 4: Run repository diff check**

Run: `git diff --check`

Expected: every command exits `0`; report any unrelated pre-existing failure separately instead of modifying unrelated files.
