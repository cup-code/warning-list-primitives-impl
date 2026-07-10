/* let SplineObj={

} */

import * as THREE from 'three/build/three'

function SplineObj(group, pathPosition) {
  // console.log("------pathPosition----", JSON.stringify(pathPosition));

  // base spline
  this.id = null
  this.splineGroup = group

  this.splines = {} // **main spline
  this.positions = []
  this.point = new THREE.Vector3()
  this.ARC_SEGMENTS = 100 // 分段200

  // edit spline
  this.splineHelperObj = [] // 帮助对象
  this.splinePointsLength = 0 // 默认线的长度 点为4个
  this.geometry = new THREE.BoxBufferGeometry(0.5, 0.5, 0.5) // 1,1,1
  this.transformControl = null
  this.splines = {}
  this.params = {
    uniform: true,
    tension: 0, // 平滑度  ???移动路径不支持平滑角度
    centripetal: true,
    chordal: true,
    // addPoint: addPoint,
    // removePoint: removePoint,
    // exportSpline: exportSpline
  }

  // crater spline
  /*******
   * Curves
   *********/
  // 样条线长度为四个点，创建四个box 帮助操控对象

  this.positions = pathPosition
  this.positions.length = pathPosition.length

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(this.ARC_SEGMENTS * 3), 3),
  )

  // spline-1  对象添加spline.uniform 并且赋值 splines.uniform = curve;
  const curve = new THREE.CatmullRomCurve3(this.positions)
  curve.curveType = 'catmullrom'
  curve.mesh = new THREE.Line(
    geometry.clone(),
    new THREE.LineBasicMaterial({
      color: 0x0000FF, // 0xff0000红色//绿色0x00ff00, 蓝色0x0000ff //随机Math.random() * 0xffffff
      opacity: 0.35,
    }),
  )
  curve.mesh.visible = this.params.uniform
  curve.mesh.castShadow = true
  this.splines.uniform = curve

  /*
      //spline-2  对象添加splines.centripetal 并且赋值 splines.centripetal = curve
      curve = new THREE.CatmullRomCurve3(this.positions);
      curve.curveType = 'centripetal';
      curve.mesh = new THREE.Line(geometry.clone(), new THREE.LineBasicMaterial({
        color: 0x00ff00,
        opacity: 0.35
      }));
      curve.mesh.visible = this.params.centripetal;
      curve.mesh.castShadow = true;
      this.splines.centripetal = curve;

      //spline-3  对象添加splines.chordal 并且赋值 splines.chordal = curve
      curve = new THREE.CatmullRomCurve3(this.positions);
      curve.curveType = 'chordal';
      curve.mesh = new THREE.Line(geometry.clone(), new THREE.LineBasicMaterial({
        color: 0xff0000,
        opacity: 0.35
      }));
      curve.mesh.visible = this.params.chordal;
      curve.mesh.castShadow = true;
      this.splines.chordal = curve; */

  // 平滑度
  for (const k in this.splines) {
    const spline = this.splines[k]
    spline.tension = this.params.tension
    // spline mesh add to scene group
    this.splineGroup.add(spline.mesh)
  }

  // 更新样条线
  this.updateSplineOutline(this.splines)

  // edit spline
  this.splinePointsLength = pathPosition.length
  if (this.splinePointsLength > 0) {
    for (let i = 0; i < pathPosition.length; i++) {
      const object = this.addSplineObject(pathPosition[i])
      this.splineGroup.add(object)
      this.splineHelperObj.push(object) // 帮助操控对象
    }
  }
}
// add point
/* function addPoint() {

	//添加控制点长度
	splinePointsLength ++;
	//位置保存到数组
	let object=addSplineObject();//随机位置
	scene.add( object );
	splineHelperObj.push( object );//帮助操控对象
	positions.push(object.position);
	//更新样条线
	updateSplineOutline(splines);
} */

SplineObj.prototype.addPoint = function (position, splines) {
  // edit 更新 帮助对象
  this.splinePointsLength++ // 添加控制点长度
  const object = this.addSplineObject(position) // 帮助超控对象
  this.splineGroup.add(object)

  // 添加点 ---更新样条线
  this.positions.push(position)
  this.updateSplineOutline(splines)
}

// update spline
// 更新所有 splines
SplineObj.prototype.updateSplineOutline = function (splines) {
  for (const k in splines) {
    const spline = splines[k]
    const splineMesh = spline.mesh
    const position = splineMesh.geometry.attributes.position
    for (let i = 0; i < this.ARC_SEGMENTS; i++) {
      const t = i / (this.ARC_SEGMENTS - 1)
      spline.getPoint(t, this.point) // ???point
      position.setXYZ(i, this.point.x, this.point.y, this.point.z)
    }
    position.needsUpdate = true // 需要实时更新
  }
}

// edit spline
// add help box object
SplineObj.prototype.addSplineObject = function (position) {
  const material = new THREE.MeshLambertMaterial({
    color: Math.random() * 0xFFFFFF,
  })
  const object = new THREE.Mesh(this.geometry, material)
  if (position) {
    object.position.copy(position)
  }
  else {
    object.position.set(Math.random() * 1000 - 500, Math.random() * 600, Math.random() * 800 - 400)
  }
  object.castShadow = true
  object.receiveShadow = true
  return object
}

export { SplineObj }
