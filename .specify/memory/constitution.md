<!--
  Sync Impact Report:
  - Version change: N/A (initial) → 1.0.0
  - Modified principles: N/A (first ratification)
  - Added sections: All (initial constitution)
  - Removed sections: None
  - Templates requiring updates:
    ✅ plan-template.md — Constitution Check gate aligns (no changes needed)
    ✅ spec-template.md — Requirements structure compatible (no changes needed)
    ✅ tasks-template.md — Task phases compatible (no changes needed)
    ✅ agent-file-template.md — Active technologies reference compatible
    ✅ checklist-template.md — No constitution references to update
  - Follow-up TODOs: None
-->

# elink (两山智联云) Constitution

## Core Principles

### I. Component-First Architecture

Every feature MUST be built as a self-contained Vue Single File Component (SFC).
Components MUST declare their dependencies explicitly (props, events, injected
services). Shared logic MUST be extracted into composables (Vue 2.7 `setup`) or
mixins — no duplicated business logic across components. Components MUST be
independently renderable in isolation for development and debugging.

### II. API Layer Discipline

All HTTP communication MUST go through the centralized `src/http/` service
layer. Direct `axios` calls in components or views are prohibited. Every API
module MUST handle errors consistently and return normalized response shapes.
Request and response interceptors MUST remain the single point for auth token
injection and global error handling.

### III. State Management Clarity

Vuex store modules MUST have clear domain boundaries — one module per business
domain. Components MUST NOT mutate store state directly; all mutations MUST go
through committed mutations or dispatched actions. Asynchronous logic MUST live
in actions, never in mutations. Large or cross-cutting state SHOULD use
`@tanstack/vue-query` for server-state caching rather than Vuex.

### IV. UI/UX Consistency

All UI MUST use the project design system: Element UI and link-ui as primary
component libraries. Custom components MUST follow the existing visual language
(colors from `src/styles/variables.scss`, spacing from Tailwind utilities).
Inline styles are prohibited for layout or theming. New pages MUST support the
existing theme system (`src/assets/theme/`).

### V. Internationalization by Default

All user-facing text MUST use Vue I18n translation keys ( `src/lang/` ).
Hard-coded Chinese or English strings in templates or JS are prohibited in
production code. New features MUST add translations to `src/lang/en.js` and the
primary locale file. Date/time formatting MUST use the dayjs utility
(`src/utils/dayjs.js`) with locale-aware formats.

## Technology Stack

**Locked choices** (changing these requires a constitution amendment):

| Category       | Choice                  | Version    |
|----------------|-------------------------|------------|
| Framework      | Vue                     | 2.7.16     |
| Build Tool     | Rsbuild                 | ^1.3.22    |
| Bundler        | Rspack                  | 1.4.2      |
| State          | Vuex                    | ^3.6.2     |
| Router         | Vue Router              | ^3.5.4     |
| UI Library     | Element UI + link-ui    | ^2.15 / ^1.0 |
| Table          | VXE Table               | 3.4.15     |
| CSS Framework  | Tailwind CSS            | ^3.4.17    |
| CSS Preprocess | Less + Sass             | ^1.2 / ^1.32 |
| Charts         | ECharts / vue-echarts   | ^4.9 / ^5.0-beta |
| HTTP           | Axios                   | ^1.6       |
| i18n           | Vue I18n                | ^8.28.2    |
| Linting        | ESLint (@antfu/config)  | ^9.28      |
| Node.js        |                         | >=18.17.0  |

**Prohibited**: Adding a new CSS-in-JS library, introducing jQuery, switching
bundler away from Rsbuild/Rspack, or adding a second UI component library
without amendment.

## Development Workflow

1. **Linting**: All code MUST pass `npm run lint` with zero errors before
   commit. `npm run lint:fix` may be used for auto-fixable issues.
2. **Build Verification**: Changes MUST produce a successful production build
   via `npm run build`. No warnings related to new code.
3. **Environment Config**: Feature flags and API endpoints MUST use `.env.*`
   files. Secrets MUST NOT appear in source code or env files committed to the
   repository.
4. **Code Review**: All changes MUST be reviewed before merge. Reviewers MUST
   verify adherence to the five core principles.
5. **Commit Discipline**: Commits MUST be atomic and describe intent. No
   large-batch "misc updates" commits.

## Governance

This constitution is the authoritative source for architectural and process
decisions on the elink project. It supersedes informal conventions.

**Amendment procedure**:
1. Propose amendment with written rationale and impact assessment.
2. Obtain approval from at least one project lead.
3. Update this document with incremented version number.
4. Run consistency propagation across all templates and agent guidance files.

**Versioning policy**:
- MAJOR: Principle removal or redefinition; technology stack change.
- MINOR: New principle or section added; materially expanded guidance.
- PATCH: Clarifications, wording fixes, non-semantic refinements.

**Compliance**: All pull requests and code reviews MUST verify compliance with
the principles above. Complexity that violates principles MUST be justified in
the plan's Complexity Tracking table.

**Version**: 1.0.0 | **Ratified**: 2026-04-13 | **Last Amended**: 2026-04-13
