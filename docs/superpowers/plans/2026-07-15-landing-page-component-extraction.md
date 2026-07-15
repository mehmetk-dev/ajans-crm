# Landing Page Component Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the monolithic landing page into focused feature components while preserving all visible behavior.

**Architecture:** Create section components under `frontend/src/features/landing/ui` and keep local interaction state inside the owning section. Reduce `LandingPage.tsx` to authentication/routing coordination and ordered composition.

**Tech Stack:** React 19, TypeScript, React Router, Framer Motion, Lucide React, Vitest, Testing Library, Tailwind CSS.

## Global Constraints

- Preserve section IDs, copy, CSS classes, DOM order, API payloads, and authenticated routing behavior.
- Do not change backend code or API contracts.
- Keep `LandingPage.tsx` below 100 lines.
- Use the existing landing-page tests as behavioral regression coverage.

---

### Task 1: Add a structural regression guard

**Files:**
- Modify: `frontend/src/pages/LandingPage.test.tsx`

**Interfaces:**
- Consumes: the default `LandingPage` export.
- Produces: a regression assertion covering all stable section landmarks after extraction.

- [ ] **Step 1: Add a failing source-structure test**

Read `LandingPage.tsx` and assert that it imports `LandingHeader`, `HeroSection`, `AboutSection`, `WorkflowSection`, `ServicesSection`, `ApprovalSection`, `BenefitsSection`, `FaqSection`, `CtaSection`, `ContactSection`, and `LandingFooter` from `features/landing/ui`.

- [ ] **Step 2: Verify RED**

Run `env NODE_ENV=test npm run test:ci -- src/pages/LandingPage.test.tsx` from `frontend/`. Expected: the new structural assertion fails because the feature components do not exist in the monolithic page yet.

### Task 2: Extract shared primitives and section components

**Files:**
- Create: `frontend/src/features/landing/ui/ArrowIcon.tsx`
- Create: `frontend/src/features/landing/ui/LandingHeader.tsx`
- Create: `frontend/src/features/landing/ui/HeroSection.tsx`
- Create: `frontend/src/features/landing/ui/AboutSection.tsx`
- Create: `frontend/src/features/landing/ui/WorkflowSection.tsx`
- Create: `frontend/src/features/landing/ui/ServicesSection.tsx`
- Create: `frontend/src/features/landing/ui/ApprovalSection.tsx`
- Create: `frontend/src/features/landing/ui/BenefitsSection.tsx`
- Create: `frontend/src/features/landing/ui/FaqSection.tsx`
- Create: `frontend/src/features/landing/ui/CtaSection.tsx`
- Create: `frontend/src/features/landing/ui/ContactSection.tsx`
- Create: `frontend/src/features/landing/ui/LandingFooter.tsx`
- Create: `frontend/src/features/landing/ui/index.ts`
- Create: `frontend/src/features/landing/model/landingData.ts`

**Interfaces:**
- `LandingHeader({ isAuthenticated, onPortalClick }: { isAuthenticated: boolean; onPortalClick: () => void })`
- `HeroSection({ onPortalClick }: { onPortalClick: () => void })`
- `CtaSection({ onPortalClick }: { onPortalClick: () => void })`
- All other sections have no props and own their interaction state.
- `services` is exported by `landingData.ts` for both services display and contact-form options.

- [ ] **Step 1: Move shared data and icons**

Move the current services array to `landingData.ts`, preserving icon references, titles, and descriptions exactly. Move `ArrowIcon` to its own component.

- [ ] **Step 2: Move each JSX section without visual changes**

Copy each existing section into the matching named component. Move mobile menu, about timeline, active service, FAQ, and contact form state into their owning components.

- [ ] **Step 3: Export the public UI surface**

Create `ui/index.ts` with named exports for all eleven page-level components so `LandingPage.tsx` has one feature import.

### Task 3: Replace the monolith with composition

**Files:**
- Modify: `frontend/src/pages/LandingPage.tsx`

**Interfaces:**
- Consumes: named exports from `../features/landing/ui`.
- Produces: the same default `LandingPage` route component.

- [ ] **Step 1: Keep page-level routing only**

Retain `useAuth`, `useNavigate`, and a single `handlePortalRedirect` callback. Render the decorative page background and the extracted components in their current order.

- [ ] **Step 2: Verify GREEN**

Run `env NODE_ENV=test npm run test:ci -- src/pages/LandingPage.test.tsx` from `frontend/`. Expected: all landing-page tests pass, including contact submission and the structural guard.

### Task 4: Verify the complete refactor

**Files:**
- Verify: `frontend/src/pages/LandingPage.tsx`
- Verify: `frontend/src/features/landing/**/*`

- [ ] **Step 1: Verify size and structure**

Run `wc -l frontend/src/pages/LandingPage.tsx frontend/src/features/landing/ui/*.tsx`. Expected: `LandingPage.tsx` has fewer than 100 lines and each section is in a focused file.

- [ ] **Step 2: Run lint**

Run `npm run lint -- src/pages/LandingPage.tsx src/pages/LandingPage.test.tsx src/features/landing` from `frontend/`. Expected: exit code 0.

- [ ] **Step 3: Run production build**

Run `npm run build` from `frontend/`. Expected: TypeScript and Vite finish with exit code 0.

- [ ] **Step 4: Check patch hygiene**

Run `git diff --check`. Expected: no output and exit code 0.
