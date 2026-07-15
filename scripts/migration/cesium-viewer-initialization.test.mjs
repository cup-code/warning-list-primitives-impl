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
    /try\s*{\s*await this\.getViewerOptions\(\);\s*}\s*catch \(error\)\s*{[\s\S]*?console\.error\("视角配置加载失败:", error\);[\s\S]*?}\s*if \(this\.isDestroy\) \{\s*return;\s*}\s*try\s*{\s*await loadJsmap\(\);/s
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

test("BaseMap stops async initialization when the component is destroyed", () => {
  assert.match(
    baseMapSource,
    /await this\.getViewerOptions\(\);[\s\S]*?if \(this\.isDestroy\) \{\s*return;\s*\}[\s\S]*?await loadJsmap\(\);\s*if \(this\.isDestroy\) \{\s*unloadJsmap\(\);\s*return;\s*\}[\s\S]*?this\.initMap\(\);[\s\S]*?catch \(error\) \{\s*if \(!this\.isDestroy\) \{[\s\S]*?this\.\$message\.error\("地图资源加载失败，请刷新页面重试"\);\s*\}\s*\}\s*if \(this\.isDestroy\) \{\s*return;\s*\}\s*\/\/ 监听点击详情\s*window\.showPath =/s
  );
});
