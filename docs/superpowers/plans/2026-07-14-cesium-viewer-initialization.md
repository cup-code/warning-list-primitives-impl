# Cesium Viewer Initialization Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the Cesium default-view initialization race so missing, late, or malformed viewpoint data never causes `setCurrView` to read `center` from `undefined`.

**Architecture:** Extract viewpoint mapping and SDK flight validation into a small ESM module that can be tested without mounting the JSMap-coupled Vue component. Make `BaseMap.vue` await the viewpoint request before loading JSMap, isolate viewpoint-request failures from map-resource failures, and delegate every view change to the validated helper.

**Tech Stack:** Vue 2 Options API, JavaScript ESM, JSMap/Cesium SDK, Node.js `node:test`, pnpm 10.14.0, Rsbuild

## Global Constraints

- Do not change the viewpoint API, backend data, or the `isDefault` selection rule.
- Do not promote the first non-default viewpoint to a default viewpoint.
- Do not modify Cesium/JSMap layers, roaming, personnel positioning, or unrelated map behavior.
- Do not modify the external original-source directory.
- Do not add dependencies or a Vue mounting test framework.
- Preserve the existing `flyToPosition` coordinates, `360 - rotate`, tilt, range, and 1500ms duration for valid viewpoints.
- A missing list, missing default viewpoint, request failure, or non-finite flight value must leave the map at the SDK's current view without throwing.

---

## File Structure

- Create `apps/link-front/src/views/cesium3d/coms-newMaterial/viewerOption.js`: pure viewpoint-list mapping and guarded JSMap flight functions.
- Modify `apps/link-front/src/views/cesium3d/coms-newMaterial/BaseMap.vue`: await viewpoint configuration, keep its error boundary separate from JSMap loading, and delegate viewpoint changes.
- Create `scripts/migration/cesium-viewer-initialization.test.mjs`: executable helper tests plus source-contract tests for the Vue lifecycle ordering.
- Create `docs/migration/cesium-viewer-initialization-verification.md`: record the exact regression, full-suite, build, and local-server checks performed.

### Task 1: Add Tested Viewpoint Mapping and Safe Flight Boundary

**Files:**
- Create: `scripts/migration/cesium-viewer-initialization.test.mjs`
- Create: `apps/link-front/src/views/cesium3d/coms-newMaterial/viewerOption.js`

**Interfaces:**
- Consumes: raw viewpoint API items and the existing JSMap `mainMap.flyToPosition(position, options)` method.
- Produces: `buildViewerOptions(list, buildId): ViewerOption[]` and `flyToViewerOption(mainMap, option): boolean`.

- [ ] **Step 1: Write the failing pure-logic regression tests**

Create `scripts/migration/cesium-viewer-initialization.test.mjs` with:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  buildViewerOptions,
  flyToViewerOption,
} from "../../apps/link-front/src/views/cesium3d/coms-newMaterial/viewerOption.js";

test("buildViewerOptions filters the current building and sorts the default first", () => {
  const options = buildViewerOptions(
    [
      {
        id: "other-building",
        buildId: "building-b",
        viewName: "other",
        isDefault: true,
        longitude: "1",
        latitude: "2",
        height: "3",
        distance: "4",
        rotation: "5",
        inclination: "6",
      },
      {
        id: "view-2d",
        buildId: "building-a",
        viewName: "top",
        isDefault: false,
        longitude: "10",
        latitude: "20",
        height: "30",
        distance: "40",
        rotation: "50",
        inclination: "60",
      },
      {
        id: "view-3d",
        buildId: "building-a",
        viewName: "default",
        isDefault: true,
        longitude: "100",
        latitude: "200",
        height: "300",
        distance: "400",
        rotation: "45",
        inclination: "55",
      },
    ],
    "building-a"
  );

  assert.deepEqual(options, [
    {
      id: "view-3d",
      name: "default",
      isDefault: true,
      center: {
        center: { x: 100, y: 200, z: 300 },
        distance: 400,
        rotate: 45,
        tilt: 55,
      },
    },
    {
      id: "view-2d",
      name: "top",
      isDefault: false,
      center: {
        center: { x: 10, y: 20, z: 30 },
        distance: 40,
        rotate: 50,
        tilt: 60,
      },
    },
  ]);
});

test("buildViewerOptions treats a missing API list as empty", () => {
  assert.deepEqual(buildViewerOptions(undefined, "building-a"), []);
});

test("flyToViewerOption skips missing and malformed viewpoints", () => {
  const calls = [];
  const mainMap = {
    flyToPosition(...args) {
      calls.push(args);
    },
  };

  assert.equal(flyToViewerOption(mainMap, undefined), false);
  assert.equal(flyToViewerOption(mainMap, { center: {} }), false);
  assert.equal(
    flyToViewerOption(mainMap, {
      center: {
        center: { x: Number.NaN, y: 2, z: 3 },
        rotate: 4,
        tilt: 5,
        distance: 6,
      },
    }),
    false
  );
  assert.equal(flyToViewerOption(null, { center: {} }), false);
  assert.deepEqual(calls, []);
});

test("flyToViewerOption preserves the existing valid flight arguments", () => {
  const calls = [];
  const mainMap = {
    flyToPosition(...args) {
      calls.push(args);
    },
  };
  const option = {
    id: "view-3d",
    center: {
      center: { x: 100, y: 200, z: 300 },
      rotate: 45,
      tilt: 55,
      distance: 400,
    },
  };

  assert.equal(flyToViewerOption(mainMap, option), true);
  assert.deepEqual(calls, [
    [
      { x: 100, y: 200, z: 300 },
      {
        duration: 1500,
        offset: { rotate: 315, tilt: 55, range: 400 },
      },
    ],
  ]);
});
```

- [ ] **Step 2: Run the focused test to verify RED**

Run:

```bash
node --test scripts/migration/cesium-viewer-initialization.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `viewerOption.js`, proving the production boundary does not exist yet.

- [ ] **Step 3: Implement the minimal pure-logic module**

Create `apps/link-front/src/views/cesium3d/coms-newMaterial/viewerOption.js` with:

```js
export function buildViewerOptions(list, buildId) {
  return (Array.isArray(list) ? list : [])
    .filter((item) => item.buildId == buildId)
    .map((item) => ({
      id: item.id,
      name: item.viewName,
      isDefault: item.isDefault,
      center: {
        center: {
          x: Number(item.longitude),
          y: Number(item.latitude),
          z: Number(item.height),
        },
        distance: Number(item.distance),
        rotate: Number(item.rotation),
        tilt: Number(item.inclination),
      },
    }))
    .sort((a, b) => (b.isDefault === true) - (a.isDefault === true));
}

export function flyToViewerOption(mainMap, option) {
  const viewCenter = option?.center;
  const center = viewCenter?.center;
  const flightValues = [
    center?.x,
    center?.y,
    center?.z,
    viewCenter?.rotate,
    viewCenter?.tilt,
    viewCenter?.distance,
  ];

  if (
    typeof mainMap?.flyToPosition !== "function" ||
    flightValues.some((value) => !Number.isFinite(value))
  ) {
    return false;
  }

  mainMap.flyToPosition(
    { x: center.x, y: center.y, z: center.z },
    {
      duration: 1500,
      offset: {
        rotate: 360 - viewCenter.rotate,
        tilt: viewCenter.tilt,
        range: viewCenter.distance,
      },
    }
  );
  return true;
}
```

- [ ] **Step 4: Run the focused test to verify GREEN**

Run:

```bash
node --test scripts/migration/cesium-viewer-initialization.test.mjs
```

Expected: PASS for all four tests with no warnings or errors.

- [ ] **Step 5: Commit the pure-logic boundary**

```bash
git add apps/link-front/src/views/cesium3d/coms-newMaterial/viewerOption.js scripts/migration/cesium-viewer-initialization.test.mjs
git commit -m "fix: guard Cesium viewer flight options"
```

### Task 2: Serialize Viewpoint and Map Initialization

**Files:**
- Modify: `scripts/migration/cesium-viewer-initialization.test.mjs`
- Modify: `apps/link-front/src/views/cesium3d/coms-newMaterial/BaseMap.vue:1-278`
- Modify: `apps/link-front/src/views/cesium3d/coms-newMaterial/BaseMap.vue:2556-2570`

**Interfaces:**
- Consumes: `buildViewerOptions(list, buildId)` and `flyToViewerOption(mainMap, option)` from Task 1; `getViewPointList(params): Promise<{data}>`; existing `loadJsmap()` and `initMap()`.
- Produces: `getViewerOptions(): Promise<ViewerOption[]>` and `setCurrView(option): boolean`; `mounted` waits for the former before loading JSMap.

- [ ] **Step 1: Add failing lifecycle and delegation contract tests**

Append the following to `scripts/migration/cesium-viewer-initialization.test.mjs`:

```js
const baseMapSource = readFileSync(
  new URL(
    "../../apps/link-front/src/views/cesium3d/coms-newMaterial/BaseMap.vue",
    import.meta.url
  ),
  "utf8"
);

test("BaseMap awaits viewpoint configuration before loading JSMap", () => {
  const createdStart = baseMapSource.indexOf("  created() {");
  const mountedStart = baseMapSource.indexOf("  async mounted() {");
  const createdSource = baseMapSource.slice(createdStart, mountedStart);
  const awaitViewerIndex = baseMapSource.indexOf("await this.getViewerOptions();");
  const loadJsmapIndex = baseMapSource.indexOf("await loadJsmap();");

  assert.doesNotMatch(createdSource, /this\.getViewerOptions\(\)/);
  assert.ok(awaitViewerIndex > mountedStart);
  assert.ok(awaitViewerIndex < loadJsmapIndex);
});

test("BaseMap isolates viewpoint failures from JSMap failures", () => {
  assert.match(
    baseMapSource,
    /try\s*{\s*await this\.getViewerOptions\(\);\s*}\s*catch \(error\)\s*{\s*console\.error\("视角配置加载失败:", error\);\s*}\s*try\s*{\s*await loadJsmap\(\);/s
  );
});

test("BaseMap returns the viewpoint request and safely maps a missing list", () => {
  assert.match(
    baseMapSource,
    /getViewerOptions\(\)\s*{\s*return getViewPointList\(/s
  );
  assert.match(
    baseMapSource,
    /buildViewerOptions\(data\?\.code === 200 \? data\?\.result\?\.list : \[\], this\.buildId\)/
  );
});

test("BaseMap delegates every view change to the guarded flight helper", () => {
  assert.match(
    baseMapSource,
    /setCurrView\(option\)\s*{\s*if \(!flyToViewerOption\(this\.mainMap, option\)\)\s*{\s*return false;\s*}\s*this\.currViewerId = option\.id;\s*return true;\s*}/s
  );
  assert.doesNotMatch(baseMapSource, /const \{ center \} = option\.center/);
});
```

- [ ] **Step 2: Run the focused test to verify RED**

Run:

```bash
node --test scripts/migration/cesium-viewer-initialization.test.mjs
```

Expected: the four Task 1 helper tests PASS and the four new `BaseMap` contract tests FAIL because `created` still fires the request, `mounted` does not await it, and `setCurrView` still dereferences `option.center` directly.

- [ ] **Step 3: Import the pure helpers and move the request into the mounted wait chain**

In `BaseMap.vue`, add this import beside the other relative imports:

```js
import {
  buildViewerOptions,
  flyToViewerOption,
} from "./viewerOption.js";
```

Change the end of `created` and the start of `mounted` to:

```js
  created() {
    // this.loadingInstance = Loading.service({
    //   lock: true,
    //   text: "拼命加载中...",
    //   spinner: "el-icon-loading",
    //   background: "rgba(0, 0, 0, 0.8)",
    // });
    this.firePointType = this.$dictUtils.getDictList("fire_point");
  },

  async mounted() {
    // 调用成功
    // 获取 2d/3d 视图

    this.isDestroy = false;
    // this.companyId = this.$store.state.user.user.companyId;
    // 人员定位
    try {
      await this.getViewerOptions();
    } catch (error) {
      console.error("视角配置加载失败:", error);
    }

    try {
      await loadJsmap();
      handleMarker = new zq_handleMarker(window.jsmap);
      // 人员定位
      this.initMap();
    } catch (error) {
      console.error("❌ jsmap 加载失败:", error);
      this.$message.error("地图资源加载失败，请刷新页面重试");
    }
```

- [ ] **Step 4: Return the request Promise and use the safe list mapper**

Replace `getViewerOptions` with:

```js
    getViewerOptions() {
      return getViewPointList({
        pageNum: 1,
        pageSize: 10000,
        isPage: false,
      }).then(({ data }) => {
        this.viewerOptions = buildViewerOptions(
          data?.code === 200 ? data?.result?.list : [],
          this.buildId
        );
        this.view3d = this.viewerOptions.find(
          (option) => option.isDefault === true
        );
        this.view2d_top = this.viewerOptions.find(
          (option) => option.isDefault === false
        );
        this.currViewerId = this.view3d?.id;
        return this.viewerOptions;
      });
    },
```

- [ ] **Step 5: Delegate `setCurrView` to the safe flight helper**

Replace `setCurrView` with:

```js
    setCurrView(option) {
      if (!flyToViewerOption(this.mainMap, option)) {
        return false;
      }
      this.currViewerId = option.id;
      return true;
    },
```

This single guard covers both fixed-delay `loadComplete` calls and the navigation-triggered call without changing their timing or business behavior.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run:

```bash
node --test scripts/migration/cesium-viewer-initialization.test.mjs
```

Expected: PASS for all eight tests. The test output contains no uncaught `TypeError` and no warnings.

- [ ] **Step 7: Run the front production compile before committing**

Run:

```bash
pnpm run build:front
```

Expected: exit code 0 and a successful Rsbuild production build for `@link/link-front`.

- [ ] **Step 8: Commit the component integration**

```bash
git add apps/link-front/src/views/cesium3d/coms-newMaterial/BaseMap.vue scripts/migration/cesium-viewer-initialization.test.mjs
git commit -m "fix: serialize Cesium viewer initialization"
```

### Task 3: Verify Regression Safety and Both Local Applications

**Files:**
- Create: `docs/migration/cesium-viewer-initialization-verification.md`

**Interfaces:**
- Consumes: the completed Task 1 and Task 2 implementation, root test scripts, both application build scripts, and local development servers.
- Produces: a durable verification record; no production interface changes.

- [ ] **Step 1: Run the complete automated test suite**

Run:

```bash
pnpm test
```

Expected: exit code 0; all migration, audit, and warning-feature tests PASS.

- [ ] **Step 2: Build both applications**

Run:

```bash
pnpm run build
```

Expected: exit code 0; both `@link/link-front` and `@link/link-warning` complete production Rsbuild builds.

- [ ] **Step 3: Check formatting and scope**

Run:

```bash
git diff --check HEAD~2
git status --short
```

Expected: `git diff --check` prints nothing. `git status --short` lists only the untracked verification document once it is created in Step 5; before Step 5 it is clean.

- [ ] **Step 4: Verify both running development servers**

Keep the existing servers on separate ports and check them with:

```bash
curl --fail --silent --show-error --output /dev/null http://localhost:8800/
curl --fail --silent --show-error --output /dev/null http://localhost:8801/
```

Expected: both commands exit 0. Inspect the active server logs after the `BaseMap.vue` hot update; `link-front` reports a successful compile and neither server reports a new compile error.

For a backend-connected runtime check, open the affected 3D page in `link-front` and exercise these states:

1. A building with a valid default view flies to the same coordinates and orientation as before.
2. A building with no default view keeps the SDK current view and prints no `center` TypeError.
3. A failed viewpoint request logs `视角配置加载失败` but the map still initializes.

If the local environment has no backend/session data for a state, record that state as environment-limited rather than claiming it was manually observed; the corresponding automated regression test remains mandatory.

- [ ] **Step 5: Write the verification record with observed results**

After Steps 1-4, create `docs/migration/cesium-viewer-initialization-verification.md` with the commands and the actual observed status. Use this exact structure, writing `PASS` only for commands or runtime states actually observed and `ENVIRONMENT-LIMITED` for unavailable backend-driven states:

```markdown
# Cesium Viewer Initialization Verification

## Automated regression

- `node --test scripts/migration/cesium-viewer-initialization.test.mjs`: PASS
- Missing API list maps to an empty list: PASS
- Missing, nested-center-missing, and non-finite viewpoints skip `flyToPosition`: PASS
- Valid viewpoints preserve the existing SDK flight arguments: PASS
- `BaseMap` waits for viewpoint configuration and isolates request failures: PASS

## Repository verification

- `pnpm test`: PASS
- `pnpm run build`: PASS
- `git diff --check HEAD~2`: PASS

## Local applications

- `http://localhost:8800/` (`link-front`): PASS
- `http://localhost:8801/` (`link-warning`): PASS
- `link-front` hot-update compile: PASS

## Backend-dependent runtime states

- Valid default viewpoint flight: ENVIRONMENT-LIMITED unless manually observed
- Missing default viewpoint keeps the SDK view without a `center` TypeError: ENVIRONMENT-LIMITED unless manually observed
- Viewpoint request failure logs independently while map initialization continues: ENVIRONMENT-LIMITED unless manually observed

## Scope

- No dependencies were added.
- `apps/link-warning` production source was not modified.
- The external original-source directory was not modified.
```

Replace each `ENVIRONMENT-LIMITED unless manually observed` phrase with `PASS` only when that exact state was exercised. Do not change an unavailable state to PASS based solely on compilation.

- [ ] **Step 6: Commit the verification record**

```bash
git add docs/migration/cesium-viewer-initialization-verification.md
git commit -m "docs: verify Cesium viewer initialization fix"
```

- [ ] **Step 7: Perform the final clean-tree check**

Run:

```bash
git status --short
git log -3 --oneline
```

Expected: `git status --short` prints nothing. The three latest commits are the safe-flight helper, serialized component initialization, and verification record commits described above.
