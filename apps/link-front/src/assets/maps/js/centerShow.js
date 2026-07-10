import * as THREE from 'three/build/three'

const CenterShow = {
  center: new THREE.Vector3(),
  delta: new THREE.Vector3(),
  box: new THREE.Box3(),
  sphere: new THREE.Sphere(),

  // set view center
  focus(controlTarget, camObject, target) {
    const {
      center,
      delta,
      box,
      sphere,
    } = this
    let distance

    // 计算和世界轴对齐的一个对象 Object3D （含其子对象）的包围盒,
    // 计算对象和子对象的世界坐标变换
    box.setFromObject(target)
    if (box.isEmpty() === false) {
      box.getCenter(center) // 返回包围盒中心点
      // console.log("---center转换后的位置----", center);
      distance = box.getBoundingSphere(sphere).radius // 中心到边距距离
    }
    else {
      // Focusing on an Group, AmbientLight, etc
      center.setFromMatrixPosition(target.matrixWorld)
      distance = 0.1
    }

    delta.set(0, 0, 1)
    delta.applyQuaternion(camObject.quaternion)

    delta.multiplyScalar(distance * 4)
    camObject.position.copy(center).add(delta)
    // scope.dispatchEvent( changeEvent );
    controlTarget.copy(center)
  },
}

export { CenterShow }
