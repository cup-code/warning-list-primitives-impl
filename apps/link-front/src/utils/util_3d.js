function ObjData(group, path, mtlName, objName, meshName) {
  this.path = path
  this.mtlName = mtlName
  this.objName = objName
  this.group = group
  this.meshName = meshName
  return this
}

function MapMarker(id, name, icon, position, desc, dataType, area, dataInfo) {
  this.id = id // 软件随机id
  this.name = name
  this.icon = icon
  this.position = position
  this.desc = desc
  this.dataType = dataType
  this.area = area
  this.dataInfo = dataInfo
  return this
}

function DeviceDataInfo(did, name, type, isOnline, alertData, measureData) {
  this.did = did
  this.name = name
  this.type = type
  this.isOnline = isOnline
  this.alertData = alertData
  this.measureData = measureData
  return this
}
export {
  DeviceDataInfo,
  MapMarker,
  ObjData,
}
