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
