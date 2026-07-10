# Link Monorepo Design

## 1. Objective

Create a new, independent Monorepo in `link-shared` while leaving the existing
`link-front_new` and `link-warning` projects unchanged.

The new repository must:

- Produce two independently deployable applications.
- Keep one authoritative copy of shared warning-domain code.
- Preserve the relevant Git history of both source projects.
- Include the current working-tree content of both source projects, including
  uncommitted changes.
- Allow shared source changes to be consumed immediately during local
  development without publishing an npm package.

## 2. Source Projects

| Source | Git layout | New location |
| --- | --- | --- |
| `link-front_new` | Subdirectory of `/Users/jxz/project/new/front/project` | `apps/link-front` |
| `link-warning` | Independent Git repository | `apps/link-warning` |

Both source directories are read-only inputs during migration. The migration
must not edit, move, delete, clean, reset, or commit files in either source.

## 3. Target Structure

```text
link-shared/
|-- apps/
|   |-- link-front/
|   `-- link-warning/
|-- packages/
|   |-- warning-feature/
|   |-- shared-core/
|   `-- shared-ui/
|-- docs/
|-- package.json
|-- pnpm-workspace.yaml
`-- pnpm-lock.yaml
```

Responsibilities:

- `apps/link-front`: full product entry point, routes, runtime configuration,
  public assets, and product-only features.
- `apps/link-warning`: warning product entry point, routes, runtime
  configuration, public assets, and product-only features.
- `packages/warning-feature`: authoritative warning-domain pages, components,
  APIs, and domain logic used by both applications.
- `packages/shared-core`: framework-independent or broadly reusable request,
  storage, permission, and utility code.
- `packages/shared-ui`: reusable Vue 2 components and shared presentation code.

The dependency direction is one-way:

```text
apps/link-front   --\
                    +--> warning-feature --> shared-core/shared-ui
apps/link-warning --/
```

Packages must never import from `apps`. ESLint boundaries will enforce this.

## 4. Workspace And Package Management

Use pnpm workspaces. Do not add Nx, Turborepo, or another task orchestrator in
the initial migration.

The root workspace provides these commands:

```text
pnpm dev:front
pnpm dev:warning
pnpm build:front
pnpm build:warning
pnpm build
pnpm lint
pnpm test
```

Each application retains its own Rsbuild configuration and produces a distinct
deployment artifact:

```text
dist/link-front/
dist/link-warning/
```

Workspace packages expose source code directly to Rsbuild so edits support hot
reload without a separate package publication or prebuild step.

## 5. Git History Migration

History migration is performed without modifying the source repositories.

1. Clone the parent repository containing `link-front_new` into a temporary
   directory.
2. Run `git subtree split --prefix=link-front_new` in the temporary clone to
   isolate the relevant history.
3. Import the split history beneath `apps/link-front` in the new repository.
4. Import the complete `link-warning` history beneath `apps/link-warning`.
5. Overlay the current source working trees onto those application directories.
6. Exclude `.git`, `node_modules`, `dist`, build caches, and `.DS_Store` files.
7. Commit the working-tree overlays and Monorepo structure in the new repository.

This yields reachable source history plus a snapshot containing current
uncommitted changes. The migration process must compare copied file manifests
against the inputs before beginning shared-code extraction.

## 6. Shared-Code Migration

The current projects cannot be deduplicated by blindly copying files. Of the
477 source files in `link-warning`, 470 have matching relative paths in
`link-front_new`, but 148 of those files currently differ.

Migration proceeds incrementally:

1. Establish both applications in the workspace without changing behavior.
2. Verify that both applications install and build from their copied sources.
3. Classify the 148 differing files as accidental drift, product-specific
   behavior, or parameterizable shared behavior.
4. Move clearly bounded warning-domain code, including
   `ForewarningManagement` and `videoWarning`, into `warning-feature`.
5. Move genuinely reusable infrastructure and UI code into `shared-core` and
   `shared-ui` only when both consumers have the same contract.
6. Remove duplicated application copies only after both applications consume
   and verify the workspace version.

Code with substantial product-specific branches remains in the corresponding
application. Deduplication is not a goal when it weakens module boundaries.

## 7. Host Integration

Shared warning code must not assume one application's router, Vuex store,
request client, permissions, or runtime configuration. Applications provide
these dependencies through an explicit integration contract, conceptually:

```js
createWarningFeature({
  request,
  store,
  router,
  permissions,
  runtimeConfig,
})
```

The concrete Vue 2 integration may use plugin installation, providers, or
factory functions, but the contract must remain explicit and testable.

Application aliases such as `@/` may only refer to the consuming application.
Workspace packages use package-relative imports or declared workspace package
names and must not depend on an application's directory layout.

## 8. Verification

Verification is performed at three levels:

- Package tests cover shared utilities, integration contracts, and warning
  domain logic.
- Application tests cover entry points, routes, permissions, and runtime
  configuration.
- CI runs lint, tests, `build:front`, and `build:warning` for every shared-code
  change.

Before freezing the old projects, compare the old and new applications for:

- Route availability and access control.
- Warning list, detail, export, and video-warning workflows.
- Runtime environment and public configuration loading.
- Static asset resolution and deployment base paths.
- Production build completion and artifact structure.

## 9. Failure Handling And Rollback

The old projects remain operational throughout migration. A failed import,
build, or module extraction is rolled back only inside the new repository.

Shared-code migration uses small commits by module boundary. If a shared
extraction causes a regression, revert that extraction commit and keep the
application-local copies until the contract is corrected.

The old repositories are frozen only after both new artifacts pass the agreed
verification suite. Deleting or archiving old projects is outside this design.

## 10. Completion Criteria

The migration is complete when:

- Both source histories are reachable from the new repository.
- Current working-tree content is represented in the new applications.
- The old source directories remain byte-for-byte unchanged by the migration.
- `pnpm build:front` and `pnpm build:warning` succeed.
- Both applications use the same `warning-feature` source for the agreed warning
  modules.
- CI verifies both applications whenever a shared package changes.
