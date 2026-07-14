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
