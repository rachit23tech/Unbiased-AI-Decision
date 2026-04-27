# Frontend Scaffold Design

## Goal

Create a runnable `Vite + React` frontend scaffold for `Unbiased AI Decision` that matches the project README, supports the core route structure, and provides starter files for incremental prototype development.

## Scope

This design covers only the frontend scaffold for the prototype. It does not implement full styling, live API integration, authentication logic, or production-ready charting behavior. The focus is on creating a clean, runnable structure that the team can build on immediately.

## Chosen Approach

We will build a lean prototype scaffold rather than a UI-heavy or enterprise-style setup. This keeps the app easy to run, quick to extend, and aligned with the hackathon/prototype goal. The scaffold will include the route shells, reusable placeholder components, API and store entry points, and testing setup, but avoid heavy upfront abstraction.

## Architecture

The frontend will be a standalone app under `frontend/` using `Vite` and `React`. The entry point will render a router-backed app with a shared layout for authenticated screens and separate auth pages.

The structure will be organized by responsibility:

- `src/pages/` for route-level screens
- `src/components/` for shared UI pieces
- `src/api/` for request clients and API helpers
- `src/store/` for state containers
- `src/utils/` for constants and helpers
- `tests/` for test setup and smoke coverage

This keeps the scaffold easy to understand while leaving room to grow without reworking the base layout.

## Routing Design

The app will include starter routes for:

- `/login`
- `/register`
- `/dashboard`
- `/upload`
- `/analysis`
- `/reports`
- `/settings`

`/` will redirect to `/dashboard` for now so the app is demo-friendly immediately. Protected-route behavior will not enforce real auth yet, but the route structure will be shaped so auth logic can be inserted later without reorganizing the app.

## Component Design

The scaffold will include lightweight starter components:

- `AppShell` for the shared layout and navigation
- `PageHeader` for consistent page titles and descriptions
- `BiasScoreCard` for dashboard-style metric presentation
- `MetricChart` as a placeholder chart block
- `ShapChart` as a placeholder explainability block
- `FlagBanner` for risk and alert messaging

These components will render clean placeholder content and clear extension points instead of empty files.

## Data Flow

The initial scaffold will use local mock data inside pages and components where needed. `src/api/client.js` will expose a central axios instance, and route pages will be ready to adopt React Query hooks later. `src/store/` will contain starter Zustand store files, but state usage will remain minimal until real flows are added.

## Error Handling

The initial scaffold will provide basic resilience:

- a fallback "Not Found" page for unknown routes
- clearly separated modules so future error boundaries can be added cleanly
- placeholder components that fail softly instead of depending on missing backend data

No advanced error boundary or request retry behavior is needed in the scaffold stage.

## Testing

The scaffold will include:

- `Vitest` config
- a frontend test setup file
- one basic smoke test to confirm the app renders

This ensures the project is ready for incremental test coverage without requiring a large initial suite.

## Files To Create

### Root frontend files

- `frontend/package.json`
- `frontend/vite.config.js`
- `frontend/index.html`
- `frontend/.gitignore`
- `frontend/src/main.jsx`
- `frontend/src/App.jsx`
- `frontend/src/styles.css`

### Pages

- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/pages/Upload.jsx`
- `frontend/src/pages/Analysis.jsx`
- `frontend/src/pages/Reports.jsx`
- `frontend/src/pages/Settings.jsx`
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Register.jsx`
- `frontend/src/pages/NotFound.jsx`

### Components

- `frontend/src/components/AppShell.jsx`
- `frontend/src/components/PageHeader.jsx`
- `frontend/src/components/BiasScoreCard.jsx`
- `frontend/src/components/MetricChart.jsx`
- `frontend/src/components/ShapChart.jsx`
- `frontend/src/components/FlagBanner.jsx`

### API, store, and utils

- `frontend/src/api/client.js`
- `frontend/src/api/analysis.js`
- `frontend/src/store/useAuthStore.js`
- `frontend/src/store/useAnalysisStore.js`
- `frontend/src/utils/constants.js`
- `frontend/src/utils/formatters.js`

### Tests

- `frontend/tests/setup.js`
- `frontend/tests/app.test.jsx`

## Non-Goals

- Full Tailwind or shadcn/ui setup in this step
- Real backend integration
- Real auth guards
- Production design polish
- Real charting implementation

Those can be layered onto the scaffold in the next implementation steps.

## Success Criteria

The scaffold is successful if:

- `frontend/` installs successfully with `npm install`
- the app runs with `npm run dev`
- the route structure works
- each page renders meaningful starter content
- shared components are reusable and easy to extend
- test setup is present and the smoke test is ready to run

## Notes

There is no git repository initialized in the current workspace, so this spec cannot be committed right now. The file is still written in the expected spec location so implementation can proceed once reviewed.
