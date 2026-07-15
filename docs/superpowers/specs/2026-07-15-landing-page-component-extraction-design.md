# Landing Page Component Extraction Design

## Goal

Reduce `frontend/src/pages/LandingPage.tsx` from a large monolithic page to a small composition root without changing the rendered landing page, navigation behavior, authentication routing, interactions, or contact form behavior.

## Architecture

Landing-specific code will live under `frontend/src/features/landing/` so it follows the repository's existing feature-oriented structure.

- `ui/` contains one component per visible page section.
- `model/landingData.ts` contains static section data shared by the UI components.
- `LandingPage.tsx` retains page-level navigation/authentication coordination and renders the sections in their existing order.

## Component Boundaries

- `LandingHeader`: desktop/mobile navigation and menu state.
- `HeroSection`: hero copy, decorative dashboard plane, and primary actions.
- `AboutSection`: about copy and timeline interaction.
- `WorkflowSection`: three-step workflow presentation.
- `ServicesSection`: service list and active-service interaction.
- `ApprovalSection`: approval-flow presentation.
- `BenefitsSection`: real product benefits currently shown in the brand section.
- `FaqSection`: FAQ data and open-item state.
- `CtaSection`: final portal call to action.
- `ContactSection`: contact form fields, submission, validation feedback, and API request.
- `LandingFooter`: footer navigation and legal links.

Small decorative elements used by only one section remain private to that section. Shared static data moves to `model/landingData.ts` only when more than one component needs it or keeping it beside JSX would obscure the section.

## State and Data Flow

Interactive state stays as close as possible to its owner:

- Mobile menu state belongs to `LandingHeader`.
- About timeline state belongs to `AboutSection`.
- Active service state belongs to `ServicesSection`.
- Open FAQ state belongs to `FaqSection`.
- Contact fields and submission state belong to `ContactSection`.

Authentication and route decisions remain coordinated by `LandingPage.tsx`. Components receive small callback props for login, portal, and CTA actions instead of importing page-level routing concerns throughout the feature.

## Compatibility

The extraction must preserve:

- Existing section IDs and anchor navigation.
- Existing visible text and styling classes.
- Authenticated versus unauthenticated button behavior.
- Contact form request payload and visible success/error feedback.
- Current responsive behavior and section order.

No backend, API contract, or visual redesign is included.

## Testing and Verification

The existing landing-page test remains the behavioral guardrail. Before extraction, add a structural test that expects the new section components to be present through stable section landmarks and observe it fail while the monolith remains. After extraction, run:

1. Targeted landing-page tests.
2. Frontend lint.
3. TypeScript/Vite production build.
4. `git diff --check`.

## Success Criteria

- `LandingPage.tsx` becomes a short composition file, targeted at fewer than 100 lines.
- Each visible section has a focused component file.
- No duplicated data or unnecessary cross-section props are introduced.
- Existing landing-page tests, lint, and production build pass unchanged except for the added structural coverage.
