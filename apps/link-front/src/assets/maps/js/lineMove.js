// 直线点运动
import * as THREE from 'three/build/three.module.js'

function LineMove(group, id, positions, moveObj) {
  // 转成点位数组
  const posArray = []
  positions.forEach((vector) => {
    posArray.push(vector.x)
    posArray.push(vector.y)
    posArray.push(vector.z)
  })
  if (posArray.length % 3 !== 0) {
    console.error('错误，posArray元素个数非3的整数倍！', posArray.length)
    return
  }
  // 锚点几何体
  /*     let pointsBufferGeometry = new THREE.BufferGeometry();
        pointsBufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(posArray, 3));
        let pointsMaterial = new THREE.PointsMaterial({ color: 0xffff00, size: 10 });
        let points = new THREE.Points(pointsBufferGeometry, pointsMaterial);
        group.add(points); */

  // ----每段百分比---
  // 每段距离
  const distanceArray = []
  const distanceAddArray = []
  let totalDistance = 0 // 每段距离，每段累加距离，总结距离

  for (let index = 0; index < positions.length - 1; index++) {
    distanceArray.push(positions[index].distanceTo(positions[index + 1]))
  }
  // 总距离
  totalDistance = distanceArray.reduce((tmpNum, item) => {
    return tmpNum + item
  })
  // 每段距离累计分段
  distanceAddArray.push(0) // 从0开始
  distanceAddArray.push(distanceArray[0])
  distanceArray.reduce((temp, item) => {
    distanceAddArray.push(temp + item)
    return temp + item
  })
  // 计算每段百分比
  distanceAddArray.forEach((value, index) => {
    distanceAddArray[index] = value / totalDistance
  })

  // value
  this.lastDirection = new THREE.Vector3() // 上一次方向 ???没有初始化
  this.currentPercent = 0 // 当前百分比
  this.turnFactor = 0
  this.obj = null
  this.percentTime = new Date().getTime() // 当前时间（1970年1月1号到现在所积累的毫秒总数）

  // const
  this.id = id
  this.positions = positions // vector3   数组
  this.percentArray = distanceAddArray // 每段百分比
  this.moveObj = moveObj
  this.speed = 0.0002 // 控制运动速度 0.0005
  this.turnSpeedFactor = 0.001 // 转向速度因子

  return this
}

// update 是否旋转、 位置、方向、
LineMove.prototype.countPoints = function (percent) {
  const { positions, percentArray } = this
  let currIndex = 0 // 当前位置
  let nextIndex = 0 // 下个位置
  let isTurn = false // 是否旋转

  // 是否转向
  for (let i = 0; i < percentArray.length; i++) {
    if (percent >= percentArray[i] && percent < percentArray[i + 1]) {
      currIndex = i
      nextIndex = i + 1
      if (percent === percentArray[i]) {
        isTurn = true
      }
    }
  }

  // 计算朝向
  const targetDirection = new THREE.Vector3().subVectors(positions[nextIndex], positions[currIndex])
  const saveDirection = this.lastDirection
  if (
    this.lastDirection.x != targetDirection.x
    || this.lastDirection.y != targetDirection.y
    || this.lastDirection.z != targetDirection.z
  ) {
    // console.info('当前朝向以上一次朝向不相等');
    isTurn = true
  }
  this.lastDirection = targetDirection

  const directionTemp = new THREE.Vector3()
  directionTemp.copy(targetDirection)
  // 两个向量夹角
  directionTemp.cross(saveDirection)
  // console.log("夹角：", directionTemp);

  // 计算位置---百分比插件
  // 当前段百分比因子 = （当前百分比-当前段起点百分比）/（当前段结束点百分比-当前段起点百分比）
  const factor
    = (percent - percentArray[currIndex]) / (percentArray[nextIndex] - percentArray[currIndex])
  // 插值位置= 开始点、结束点 、百分比
  const currPos = new THREE.Vector3()
  currPos.lerpVectors(positions[currIndex], positions[nextIndex], factor)

  return {
    currPos,
    isTurn,
    direction: targetDirection,
    saveDirection,
  }
}

// 参数，运动对象，暂停/开始  重新开始  停止  /反向
LineMove.prototype.moveUpdate = function (runAndPause, reset, stop) {
  const {
    moveObj,
    speed,
    turnSpeedFactor,
  } = this // 常量可以

  if (runAndPause) {
    // 旋转加移动
    if (this.obj != null && this.obj.isTurn) {
      if (this.turnFactor == 0) {
        this.percentTime = new Date().getTime() // 开始时间
        this.turnFactor += 0.000000001
      }
      else {
        const nowTime = new Date().getTime() // 当前时间
        const timePass = nowTime - this.percentTime // 时间差
        this.percentTime = nowTime // 保存时间
        this.turnFactor += turnSpeedFactor * timePass // 累计旋转因子

        // 完成旋转
        if (this.turnFactor > 1) {
          this.turnFactor = 0
          this.currentPercent += speed
          this.obj = this.countPoints(this.currentPercent)
        }
        else {
          // 继续旋转

          // 修改朝向
          const runDirection = new THREE.Vector3()
          runDirection.lerpVectors(this.obj.saveDirection, this.obj.direction, this.turnFactor)
          const look = new THREE.Vector3()
          look.add(this.obj.currPos)
          // 当前位置加+插值方向
          look.add(runDirection)
          moveObj.lookAt(look)

          // ???后增加改良
          this.obj = this.countPoints(this.currentPercent)
        }
      }
    }
    else {
      // 非旋转 /值移动

      this.obj = this.countPoints(this.currentPercent)
      const position = this.obj.currPos
      moveObj.position.set(position.x, position.y, position.z)
      // 不需要旋转
      if (!this.obj.isTurn) {
        const look = position.add(this.obj.direction)
        moveObj.lookAt(look)
      }
      this.currentPercent += speed
    }

    // 循环运动
    if (this.currentPercent >= 1) {
      this.currentPercent = 0
    }
  }
}

export default LineMove
