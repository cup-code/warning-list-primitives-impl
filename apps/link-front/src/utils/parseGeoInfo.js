/**
 * geoInfo 解析工具
 *
 * 统一解析巡检点的 geoInfo 字段，支持多种格式：
 *   1. JSON 字符串: '{"longitude": 116.39, "latitude": 39.9, ...}'
 *   2. 对象: { longitude: 116.39, latitude: 39.9, ... }
 *   3. 数组第一项: [{ longitude: 116.39, ... }]
 *   4. 嵌套 info: { info: { longitude: 116.39, ... } }
 *
 * 无效或缺失坐标时返回 null。
 *
 * @param {string|object|null} raw - geoInfo 原始值
 * @returns {{lng:number,lat:number,cityName:string,zoom?:number}|null} 解析结果，无效时为 null
 */
export function parseGeoPayload(raw) {
  if (raw == null || raw === '')
    return null
  let data = raw
  try {
    if (typeof raw === 'string' && raw.trim())
      data = JSON.parse(raw)
  }
  catch (e) {
    console.error('[parseGeoInfo] geoInfo JSON 解析失败:', e)
    return null
  }
  if (Array.isArray(data) && data.length)
    data = data[0]
  if (!data || typeof data !== 'object')
    return null
  const inner = data.info && typeof data.info === 'object' ? data.info : data
  const lngRaw = inner.longitude ?? inner.lng ?? inner.x
  const latRaw = inner.latitude ?? inner.lat ?? inner.y
  if (lngRaw == null || latRaw == null || lngRaw === '' || latRaw === '')
    return null
  const lng = Number(lngRaw)
  const lat = Number(latRaw)
  if (!Number.isFinite(lng) || !Number.isFinite(lat))
    return null
  const zoomRaw = inner.zoom ?? data.zoom
  const zoom = zoomRaw != null ? Number(zoomRaw) : Number.NaN
  return {
    lng,
    lat,
    cityName: inner.cityName || inner.address || data.cityName || data.address || '',
    zoom: Number.isFinite(zoom) ? zoom : undefined,
  }
}
