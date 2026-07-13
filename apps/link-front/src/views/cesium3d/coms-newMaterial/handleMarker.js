import * as turf from '@turf/turf'
// 真趣_处理标记
function zq_handleMarker(jsmapLib) {
  if (!jsmapLib) {
    throw new Error('jsmap library is required')
  }
  this.jsmap = jsmapLib

  this.imagePath = './source/anhuan3d/' // 图标公共路径
  this.personLayerVisiable = false // 是否显示人员图层
  this.personMarkerList = [] // 保存人员标记(用于更新，移除)
  this.currBuildArea = undefined // 建筑区域

  // 当前人员轨迹标记--运动对象
  this.trackMarker = undefined // 当前轨迹
  // 人员轨迹 位置和时间戳
  this.trackPositions = []
  this.isTrack = false // false 取消实时跟踪 、 true 正在实时跟踪；

  // 时间戳保留小数点    开始位置和时间可以是任何位置 主要是播放/暂停，更新起始的位置。
  this.startPosTime = undefined
  // 开始位置索引： 用于拖动控制 加减累计。
  this.startIndex = 0
  this.totalTime = 0 // 总时间长度
  this.trackIndex = 1 // 开始的位置
  this.trackSpeed = 1
  this.trackIsPlay = false
  this.personTrackList = [] // 人员轨迹（文字图标、路径、点）
  this.height = 5.5 // 米 地面高度 4.2-5米

  // markerImage图层 摄像头
  this.imageMarkLayerCamera = null
  // markerImage图层 危险源
  this.imageMarkLayerDanger = undefined

  // 重要危险源
  this.imageMarkerLayerImportantDanger = undefined

  //  风险区域 -box 盒子 室内
  this.boxIndoorLayer = undefined
  // 室内盒子文字
  this.boxIndoorTextLayer = undefined
  // 室外风险区域 -box  盒子 室外
  this.boxOutdoorLayer = undefined
  // 盒子文字
  this.boxOutDoorTextLayer = undefined

  //  风险区域 - 染色
  this.dyeingKeyLayer = undefined

  // tex 设备名称
  this.labelMarkerLayer = undefined

  // 消防管理 消防设备
  this.smokeMarkerLayer = undefined
  // this.tempteratureMarkerLayer = undefined;
  // this.gasFlammableMarkerLayer = undefined;
  // this.fireDoorMarkerLayer = undefined;

  // 作业安全
  // 电子围栏
  this.lineLayer = undefined
  this.polygonLayer = undefined
  // 特殊作业
  this.specialOperationLayer = undefined
  // 职业病因素区域
  this.occupationDiseaseLayer = undefined
  // 职业病因素区域文字
  this.occupationLayerText = undefined

  // 所有图形
  this.allShapes = undefined
  // 所有建筑图标
  this.buildMarkerMap = undefined

  // 弹窗
  this.popMark = undefined

  // 读取缓存数据字典
  // let dictList = JSON.parse(sessionStorage.getItem('dictList')).specialWork_workType;
  // console.log('数据字典：:',dictList);

  // 特殊作业类型 dictCode  dictCode: "36"，dictName: "69-可燃气体"
  const specialWorkTypeList = [
    { dictCode: 1001, dictName: '动火安全作业' },
    { dictCode: 1002, dictName: '受限空间安全作业' },
    { dictCode: 1003, dictName: '登高安全作业' },
    { dictCode: 1004, dictName: '临时用电安全作业' },
    { dictCode: 1005, dictName: '断路安全作业' },
    { dictCode: 1006, dictName: '动土安全作业' },
    { dictCode: 1007, dictName: '吊装安全作业' },
    { dictCode: 1008, dictName: '盲板抽堵安全作业' },
    { dictCode: 1009, dictName: '通用作业' },
  ]

  // let firePointType = this.$dictUtils.getDictList('fire_point'); 无法获取
  /*
    {dictCode: '1', dictName: '02-点型感温'}
    {dictCode: '3', dictName: '03-点型感烟'}
    {dictCode: '6', dictName: '06-光束感烟'}
    {dictCode: '21', dictName: '26-卷帘门中'}
    {dictCode: '36', dictName: '69-可燃气体'}
    */
  const firePointType = []
  JSON.parse(sessionStorage.getItem('dictList')).fire_point.forEach((item) => {
    firePointType.push({ dictCode: item.dictCode, dictName: item.dictName })
  })

  // 图形标记默认配置
  this.shapeConfigDefault = [
    {
      id: 'bs_text001',
      english: 'Text',
      chinese: '文字',
      type: 'text',
      shapeType: 'text',
      color: '#ffffff',
      outlineColor: '#000000',
      outlineWidth: 4,
      display: { min: 0, max: 600 },
    },
    // 危险源
    {
      id: 'bs_icon001',
      english: 'Icon',
      chinese: '图标',
      // ! 识别业务类型 danger-origin
      type: 'danger-origin',
      shapeType: 'icon',
      display: { min: 0, max: 600 },
      image: 'danger01.png',
    },

    // 消防管理
    // <1> 可燃气体 fire36.png , 烟感 fire3.png, 温感 fire1.png, 防火卷帘门  fire21.png
    {
      id: 'xf_icon001',
      english: 'Icon',
      chinese: '图标',
      // ! 识别业务类型 danger-origin
      type: 'fire-device', // 消防设备
      childTypeList: firePointType, // 消防设备包含子类
      shapeType: 'icon',
      display: { min: 0, max: 1000 },
      image: 'fire3.png', // 默认为烟感
    },

    // 作业安全：（电子围栏） 特殊作用类兴 过于多： 采用子分类 9种作业类型 childTypeList
    //  <1> 动火作业
    {
      id: 'operate_01',
      english: 'Icon',
      chinese: '图标',
      type: 'specialWork',
      childTypeList: specialWorkTypeList,
      shapeType: 'icon',
      display: { min: 0, max: 600 },
      image: 'fire_operate.png',
    },

    // 线
    {
      // 共有参数
      id: 'polyline01',
      english: 'Line',
      chinese: '线',
      type: 'electronic-fence', // 电子围栏
      shapeType: 'polyline',
      display: { min: 0, max: 1200 },
      // 自身参数
      floorId: 1, // 楼层ID,默认1
      width: 2, // 线宽
      color: '#3cff2e', // 填充颜色，默认 //蓝色'#0e03ff' //绿色#3cff2e //黄色 #ffe906
      strokeColor: '#f2ff50', // 边线颜色, 默认'#fff'
      strokeWidth: 1, // 边线宽度, 默认2,
      lineType: 'FILL', // 线类型 见JSLineType枚举类，默认JSLineType.FILL
      smooth: true, // 是否平滑 默认true
      show: true, // 是否显示，默认true
      allowPicking: true, // 是否允许点击
    },
  ]

  return this
}

// 室内人员 id
zq_handleMarker.prototype.areaPerson = function (positions, areaKey) {
  const personList = []
  for (let i = 0; i < this.personMarkerList.length; i++) {
    // 坐标是否在区域内
    const point = turf.point([
      this.personMarkerList[i].position.x,
      this.personMarkerList[i].position.y,
    ])
    const polyArray = positions.map((pos) => {
      return [pos.x, pos.y]
    })
    const poly = turf.polygon([polyArray])

    if (turf.booleanPointInPolygon(point, poly)) {
      // 区域内
      personList.push({
        dept: this.personMarkerList[i].getProperties().get('dept'),
        busType: this.personMarkerList[i].getProperties().get('busType'),
        name: this.personMarkerList[i].getProperties().get('name'),
        id: this.personMarkerList[i].getProperties().get('cardCode'),
        floorId: this.personMarkerList[i].floorId,
        userId: this.personMarkerList[i].getProperties().get('userId'),
        userType: this.personMarkerList[i].getProperties().get('userType'),
        userPost: this.personMarkerList[i].getProperties().get('userPost'),
        cardCode: this.personMarkerList[i].getProperties().get('cardCode'),
      })
      // 设置标记属性 区域id
      this.personMarkerList[i].getProperties().set('area', areaKey)
      // 标记为室内
      this.personMarkerList[i].getProperties().set('outdoor', false)
    }
  }
  return personList
}

// 是否越界
zq_handleMarker.prototype.crossBorder = function (personMarkerList) {
  // electronic-fence
  // 电子围栏
  for (let i = 0; i < this.allShapes.length; i++) {
    if (this.allShapes[i].getProperties().get('type') === 'electronic-fence') {
      // console.log('position:',this.allShapes[i].position);
      const bindCards = this.allShapes[i].getProperties().get('bindCards')
      bindCards.forEach((cardId) => {
        if (cardId != '') {
          // 绑定人员数量  bindCards.length
          let personCount = 0
          for (let j = 0; j < personMarkerList.length; j++) {
            // console.log('id:',personMarkerList[j].getProperties().get('id'));
            if (personMarkerList[j].getProperties().get('id') === cardId) {
              const name = personMarkerList[j].getProperties().get('name')
              personCount++

              // 坐标是否在区域内
              const point = turf.point([
                personMarkerList[j].position.x,
                personMarkerList[j].position.y,
              ])
              const polyArray = []
              // 注意：polyArray 首尾坐标要一致
              this.allShapes[i].position._points.forEach((position) => {
                polyArray.push([position.x, position.y])
              })

              const poly = turf.polygon([polyArray])
              // 区域内 绿色#3cff2e  区域外 黄色 #ffe906
              if (turf.booleanPointInPolygon(point, poly)) {
                // 区域内
                if (personCount === bindCards.length) {
                  // 所有人员在区域内
                  this.allShapes[i].color = '#3cff2e'
                }
              }
              else {
                // console.log('不在区域内:',name);
                // 不在区域内
                this.allShapes[i].color = '#ffe906'
              }
              break
            }
          }
        }
      })
    }
  }
}

// 楼内建筑人数

// 添加标注:(图像+文字) 人员/车辆
zq_handleMarker.prototype.addIconTextMarker = function (Opention) {
  const {
    type,
    id,
    text,
    timestamp,
    position,
    floorId,
    image,
    depthTest,
    data,
    show,
    busType,
  } = Opention
  const iconTextMarker = new this.jsmap.JSIconTextMarker({
    id,
    position, // 坐标
    floorId, // 楼层id 1,2,3
    image, // 图片路径 './source/anhuan3d//workers01.png',
    text, // 文字
    font: 'bold 12px sans-serif', // 字体
    fontColor: '#ffffff', // 文字颜色
    imageHeight: 32, // 图片高度
    imageWidth: 32, // 图片宽度
    fontStrokeColor: '#1f0fdd', // 字体描边颜色
    fontStrokeWidth: 1, // 字体描边宽度
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // 背景色颜色
    backgroundRadius: 1, // 背景圆角
    backgroundStrokeColor: 'rgba(0, 0, 0, 0.3)', // 背景边线颜色
    backgroundStrokeWidth: 1, // 背景边线宽度
    allowPicking: true, // 是否允许点击
    displayCondition: new this.jsmap.JSDisplayCondition(0.0, 1500), // 可见范围
    depthTest, // 是否深度检测
    offset: this.jsmap.JSControlPosition.CENTER_BOTTOM,
    iconTextType: this.jsmap.JSIconTextType.TOPTEXT_BOTTOMICON,
    show, // 是否显示
    judgeInOrOutDoor: true,
    properties: {
      busType, // 1.人， 2.车  3.摄像头
      type,
      id,
      area: '100', // 默认 100 室外 区域键 area key
      outdoor: true, // 默认为室外
      name: data.busName,
      online: true, // true在线, false离线
      update: false, // true 已更新，false 未更新
      ...data,
    },
  })
  return iconTextMarker
}

// 循环更新数据；人员位置、移除数据的、新增加人员
zq_handleMarker.prototype.updatePerson = function (dataList, duration) {

  // 所有人员标记为未更新
  for (let i = this.personMarkerList.length - 1; i >= 0; i--) {
    this.personMarkerList[i].getProperties().set('update', false)
    if (dataList.length === 0) {
      this.personMarkerList[i].show = false
    }
  }
  // 不显示人员时和没数据  不做更新操作
  if (!this.personLayerVisiable || dataList.length === 0) {
    return
  }

  // 更新的人员数据是否存在 ，不存在时创建人员标记
  let isExistPerson = false
  // 记录新加入的人员信息 索引, 创建新的人员标记
  const ceratePersonIndexArray = []

  for (let i = 0; i < dataList.length; i++) {
    isExistPerson = false
    for (let j = 0; j < this.personMarkerList.length; j++) {
      if (this.personMarkerList[j].id === dataList[i].cardCode) {
        // 1.更新在线人员-动态位置
        if (!this.isTrack) {
          this.personMarkerList[j].show = true
        }
        const position = {
          x: dataList[i].longitude,
          y: dataList[i].latitude,
          z: 2 || this.height,
        }
        this.upPersonMarkerAnimate(this.personMarkerList[j], position, duration)
        this.personMarkerList[j].getProperties().set('update', true)
        isExistPerson = true
      }
    }
    if (!isExistPerson) {
      // 3.标记需要创建的- 新加入的在线人员
      ceratePersonIndexArray.push(i)
    }
  }

  // 移除离线人员
  for (let i = this.personMarkerList.length - 1; i >= 0; i--) {
    if (!this.personMarkerList[i].getProperties().get('update')) {
      // 移除一个人员标记
      zhenqu_map.removeMarker(this.personMarkerList[i])
      this.personMarkerList.splice(i, 1)
    }
  }

  // 创建
  for (let h = 0; h < ceratePersonIndexArray.length; h++) {
    // 创建一个人员
    const index = ceratePersonIndexArray[h]
    const opention = {
      busType: dataList[index].busType,
      type: 'person',
      text: dataList[index].busName || dataList[index].cardCode,
      id: dataList[index].cardCode,
      // 10位的是秒,默认13位的毫秒
      timestamp: dataList[index].timestamp, // 时间戳  毫秒转换成秒，去除小数点
      position: {
        x: dataList[index].longitude,
        y: dataList[index].latitude,
        z:2 || this.height,
      },
      floorId: typeof dataList[index].floorNum === "string" && dataList[index].floorNum.startsWith("B")
            ? dataList[index].floorNum.replace(/^B/, "-")
            : dataList[index].floorNum,
      image:
        dataList[index].busType === 1
          ? `${this.imagePath}workers01.png`
          : `${this.imagePath}car01.png`,
      judgeInOrOutDoor: true,
      depthTest: true,
      show: true,
      data: {
        ...dataList[index],
        name: dataList[index].busName,
        id: dataList[index].cardCode,
      },
    }
    const iconText = this.addIconTextMarker(opention)
    this.personMarkerList.push(iconText)
    zhenqu_map.addMarker(iconText)
  }
}
// 更新位置:(图像+文字) 人员/车辆
zq_handleMarker.prototype.upPersonMarkerAnimate = function (marker, position, duration) {
  if (marker.id != undefined) {
    window.zhenqu_map.updateMarkerPosition(marker, {
      position,
      animate: {
        duration,
        begin: () => {
          // marker.getProperties().set('update',false);
        },
        complete: () => {
          // console.log('complete');
          // 修改属性 update : false  ,等待下一次更新写入 true
        },
        update: (pos) => {
          // 显示更新路径
          // line2.trace(pos)
        },
      },
    })
  }
}
  // 模拟人员位置动画
  ; (zq_handleMarker.prototype.simulationMarkerAnimate = function (map, marker) {
    // 0-2 之间整数
    const positions = groupPosition[Math.round(Math.random() * (0 - 2) + 2)]
    const duration = Math.random() * (3000 - 9000) + 9000 // 3-9秒
    const timeout = {
      // 16位长度 随机id
      id: Math.random().toString(36).substr(2, 10) + Math.random().toString(36).substr(2, 6),
      array: [],
    }
    timeoutList.push(timeout)
    for (let i = 0; i < positions.length; i++) {
      timeout.array[i] = setTimeout(() => {
        // 是否显示人员
        // 销毁
        if (map.show && marker.id != undefined) {
          map.updateMarkerPosition(marker, {
            position: positions[i],
            animate: {
              duration,
              begin: () => { },
              complete: () => {
                for (let j = 0; j < timeout.array.length; j++) {
                  if (timeout.array[j] != undefined) {
                    clearTimeout(timeout.array[j])
                  }
                }
                // 移除上次timeout
                for (let d = timeoutList.length - 1; d >= 0; d--) {
                  if (timeout.id === timeoutList[d].id) {
                    timeoutList.splice(d, 1)
                  }
                }
                timeout.array = []
                // 继续循环动画
                this.simulationMarkerAnimate(map, marker)
              },
              update: (pos) => { },
            },
          })
        }
      }, i * duration)
    }
  }),
    // 添加标注: 点
    (zq_handleMarker.prototype.addPoint = function (opention) {
      const {
        id,
        position,
        floor,
        color,
        isDepth,
        judgeInOrOutDoor
      } = opention
      const pointMarker = new this.jsmap.JSPointMarker({
        id,
        color,
        size: 10, // 尺寸
        position: new this.jsmap.JSPoint(position.x, position.y, position.z), // 坐标
        floorId: floor, // 楼层id,默认为1（地面）
        outlineColor: '#ffffff', // 边线颜色
        outlineWidth: 2, // 边线宽
        depthTest: isDepth, // 是否开启深度检测
        judgeInOrOutDoor: judgeInOrOutDoor ,
        show: true, // 是否显示
        allowPicking: true, // 是否允许点击
        displayCondition: new this.jsmap.JSDisplayCondition(0.0, 1000), // 可见范围
        properties: {
          type: undefined,
          id,
        },
      })
      return pointMarker
    }),
    //  消防点位  图标 + 文字
    (zq_handleMarker.prototype.addIconText = function (Opention) {
      const {
        type,
        id,
        text,
        position,
        floorId,
        image,
        judgeInOrOutDoor,
      } = Opention
      const iconTextMarker = new this.jsmap.JSIconTextMarker({
        id,
        position, // 坐标
        floorId, // 楼层id 1,2,3
        image, // 图片路径 './source/anhuan3d//workers01.png',
        text, // 文字
        font: 'bold 12px sans-serif', // 字体
        fontColor: '#ffffff', // 文字颜色
        imageHeight: 32, // 图片高度
        imageWidth: 32, // 图片宽度
        fontStrokeColor: '#1f0fdd', // 字体描边颜色
        fontStrokeWidth: 1, // 字体描边宽度
        backgroundColor: 'rgba(0, 0, 0, 0.3)', // 背景色颜色
        backgroundRadius: 1, // 背景圆角
        backgroundStrokeColor: 'rgba(0, 0, 0, 0.3)', // 背景边线颜色
        backgroundStrokeWidth: 1, // 背景边线宽度
        allowPicking: true, // 是否允许点击
        displayCondition: new this.jsmap.JSDisplayCondition(0.0, 1000), // 可见范围
        depthTest: false, // 是否开启深度检测
        judgeInOrOutDoor: judgeInOrOutDoor || false, //  true 进行室内外判断，false 以室外处理，
        properties: {
          type,
          id,
          name: text,
        },
      })
      return iconTextMarker
    })

// 电子围栏 线
zq_handleMarker.prototype.createPolyline = function (opention) {
  const {
    type,
    id,
    name,
    position,
    width,
    floorId,
    color,
    strokeColor,
    strokeWidth,
    lineType,
    state,
    smooth,
    depthTest,
    bindCards,
    allowPicking,
    show,
    display,
  } = opention
  let currLineType = this.jsmap.JSLineType.DASH
  if (lineType === 'TRAIL') {
    currLineType = this.jsmap.JSLineType.TRAIL
  }
  else if (lineType === 'FILL') {
    currLineType = this.jsmap.JSLineType.FILL
  }
  else if (lineType === 'DASH') {
    currLineType = this.jsmap.JSLineType.DASH
  }
  else if (lineType === 'ARROW') {
    currLineType = this.jsmap.JSLineType.ARROW
  }
  else if (lineType === 'GLOW') {
    currLineType = this.jsmap.JSLineType.GLOW
  }

  const lineMarker = new this.jsmap.JSLineMarker({
    id,
    position,
    width: width || 2,
    // 0 默认室外
    floorId: floorId || 1,
    color: color || '#3cff2e', // 绿色#3cff2e  黄色 #ffe906
    strokeColor: strokeColor || '#f2ff50',
    strokeWidth: strokeWidth || 1,
    lineType: currLineType,
    depthTest, // 是否开启深度检测 默认 false 贴到地图 不会被遮挡  true 按实际高度
    allowPicking: allowPicking || true,
    displayCondition: new this.jsmap.JSDisplayCondition(display.min, display.max),
    judgeInOrOutDoor: false, // 室外
    show: show === undefined ? true : show,
    properties: {
      type,
      id,
      state,
      name,
      bindCards,
    },
    // callback: (marker) => { console.log(marker);}
  })
  // window.zhenqu_map.addMarker(lineMarker);
  return lineMarker
}
//  poly 电子围栏
zq_handleMarker.prototype.polygonMarker = function (opention) {
  const {
    type,
    id,
    name,
    position,
    floorId,
    color,
    depthTest,
    display,
    state,
    show,
  } = opention
  const polygonMarker = new this.jsmap.JSPolygonMarker({
    id, // id
    position, // 坐标集合
    floorId, // 楼层id
    // color: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},0.6)`,//填充颜色
    color: '#fb2f3950', // #fb2f39
    strokeColor: '#2bff1d', // 边线颜色
    strokeWidth: 4, // 边线宽度
    depthTest, // 是否开启深度检测 默认 false 贴到地图 不会被遮挡  true 按实际高度
    judgeInOrOutDoor: false,
    displayCondition: new this.jsmap.JSDisplayCondition(display.min, display.max),
    show: show === undefined ? true : show,
    properties: {
      type,
      id,
      name,
      state,
    }, // 属性设置
    // callback: (marker) => {//回调}
  })
  return polygonMarker
}

// 添加标记：线
zq_handleMarker.prototype.addLine = function (opention) {
  const {
    positions,
    floorId,
    id,
    isDepth,
    judgeInOrOutDoor
  } = opention
  const lineMarker = new this.jsmap.JSLineMarker({
    id,
    position: positions, // 坐标几何
    width: 6, // 线宽
    floorId, // 楼层id
    color: '#409EFF', // 填充颜色
    strokeColor: '#CD5C5C', // 边线颜色
    strokeWidth: 1, // 边线宽
    lineType: this.jsmap.JSLineType.ARROW, // 线类型 TRAIL=流光, DASH=短划线(虚线)， GLOW=发光，ARROW=箭头  FILL=填充
    depthTest: isDepth, // 是否开启深度检测
    judgeInOrOutDoor,
    properties: {
      type: undefined,
      id,
      test: 0,
    },
  })
  return lineMarker
}

// 风险区域  贴合子标记 染色
zq_handleMarker.prototype.addGroundBox = function (opention) {
  const {
    type,
    id,
    position,
    floorId,
    height,
    stretchHeight,
    color,
    strokeColor,
  } = opention
  const groundBoxMarker = new this.jsmap.JSGroundBoxMarker({
    id,
    position,
    // 0 室外
    floorId: 1,
    color,
    height: 5.4,
    stretchHeight: 10,
    judgeInOrOutDoor: false, // 是否室内外判断，默认true
    properties: {
      type,
      id,
      name: 'box区域',
      currBuildId: undefined,
    },
    // callback: (marker) => {console.log(marker);}
  })
  return groundBoxMarker
}

// 添加标记：盒子
zq_handleMarker.prototype.addRiskBox = function (opention) {
  // 为数组，坐标集合 positins=[new this.jsmap.JSPoint(0,0,0),new this.jsmap.JSPoint(0,0,0)]
  const {
    type,
    id,
    position,
    floorId,
    height,
    stretchHeight,
    color,
    strokeColor,
    currBuildId,
  }
    = opention
  const boxMarker = new this.jsmap.JSBoxMarker({
    id,
    position, // 坐标集合
    floorId, // 楼层id
    color,
    height, // 基底高度
    stretchHeight, // 拉伸高度
    strokeColor,
    allowPicking: true, // 是否允许点击
    displayCondition: new this.jsmap.JSDisplayCondition(0.0, 1500), // 可见范围
    // judgeInOrOutDoor: false,//是否室内外判断，默认true
    properties: {
      type,
      id,
      name: 'box区域',
      currBuildId: currBuildId || undefined,
    },
  })
  return boxMarker
}

// 添加标记：盒子
zq_handleMarker.prototype.addMarkBox = function (opention) {
  // 为数组，坐标集合 positins=[new this.jsmap.JSPoint(0,0,0),new this.jsmap.JSPoint(0,0,0)]
  const {
    type,
    id,
    position,
    floorId,
    height,
    stretchHeight,
    color,
    strokeColor,
    show,
    area,
  }
    = opention
  const boxMarker = new this.jsmap.JSBoxMarker({
    id,
    position, // 坐标集合
    floorId, // 楼层id
    color,
    height, // 基底高度
    stretchHeight, // 拉伸高度
    strokeColor,
    allowPicking: true, // 是否允许点击
    displayCondition: new this.jsmap.JSDisplayCondition(0.0, 1500), // 可见范围
    judgeInOrOutDoor: false, // 是否室内外判断，默认true
    show: !show ? show : true,
    properties: {
      type,
      id,
      name: 'box区域',
      area: area || '',
    },
  })
  return boxMarker
}

// 添加标注:(文字)
zq_handleMarker.prototype.addMarkText = function (opention) {
  const {
    id,
    text,
    position,
    floorId,
    judgeInOrOutDoor,
    show,
    type,
    shapeType,
    color,
    outlineColor,
    outlineWidth,
    display,
  } = opention
  const labelMarker = new this.jsmap.JSLabelMarker({
    id,
    position: new this.jsmap.JSPoint(position.x, position.y, position.z), // 坐标
    text, // 文字
    floorId, // 楼层id
    font: 'bold 12px 微软雅黑', // 字体 12px
    outlineColor, // 文字边框颜色  默认黑色'#000000  深蓝 #00008B
    outlineWidth, // 文字边框宽度 4
    color, // 文字填充颜色'#ffffff'
    // 文字风格，启用描边jsmap.JSLabelStyle.FILL_AND_OUTLINE ,无描边 jsmap.JSLabelStyle.FILL
    labelStyle: this.jsmap.JSLabelStyle.FILL_AND_OUTLINE,
    offset: this.jsmap.JSControlPosition.CENTER_BOTTOM, // 偏移位置
    backgroundColor: 'rgba(113,102,45,0.5)', // 背景颜色
    allowPicking: true, // 是否允许点击
    displayCondition: new this.jsmap.JSDisplayCondition(display.min, display.max), // 可见范围 0,2000
    show, // 是否显示
    showBackground: false, // 是否显示背景
    depthTest: true, // 是否开启深度检测
    judgeInOrOutDoor: judgeInOrOutDoor || false, // 是否室内外判断，默认true
    properties: {
      type,
      shapeType,
      id,
      name: text,
    },
  })
  return labelMarker
}

// 添加标注:图像
zq_handleMarker.prototype.addMarkImage = function (opention) {
  const {
    id,
    position,
    floorId,
    image,
    data,
    type,
    childType,
    judgeInOrOutDoor,
    state,
    show,
  }
    = opention
  const imageMarker = new this.jsmap.JSImageMarker({
    id,
    image,
    position: new this.jsmap.JSPoint(position.x, position.y, position.z), // 坐标位置
    width: 32,
    height: 32,
    floorId, // 默认1  楼层id 无楼层判断，不需要楼层参数
    // 中心 jsmap.JSControlPosition.CENTER
    offset: this.jsmap.JSControlPosition.CENTER_BOTTOM,
    allowPicking: true, // 是否允许点击
    displayCondition: new this.jsmap.JSDisplayCondition(0, 600), // 可见范围
    show: show === undefined ? true : show, // 是否显示
    depthTest: false, // 是否开启深度检测
    judgeInOrOutDoor: judgeInOrOutDoor || false, //  true 进行室内外判断，false 以室外处理，
    properties: {
      type,
      childType,
      id,
      name: data.name,
      state: state || 100,
    },
  })
  return imageMarker
}

// 弹窗
zq_handleMarker.prototype.addPopMark = function (opention) {
  const {
    id,
    position,
    flooId,
    data,
  } = opention
  this.popMark = new this.jsmap.JSPopInfoMarker({
    id,
    floorId: flooId, // 楼层id 3
    position: new this.jsmap.JSPoint(position.x, position.y, position.z), // 坐标
    marginTop: 20, // 向上偏移的像素值
    showCloseButton: true, // 是否显示关闭按钮，默认显示
    displayCondition: new this.jsmap.JSDisplayCondition(0.0, 1000), // 可见范围
    show: true, // 是否显示
    properties: {
      test: 'popinfoTest',
    },
  })
  window.zhenqu_map.addMarker(this.popMark)
  const contentHtml = `
        <table style='font-size:14px;color:#fff;border-collapse:collapse' cellspacing="0" cellpadding="8">
            <tr style='border-bottom: 1px solid #ffffff'>
                <td>id：</td>
                <td align="right">${data.id}</td>
            </tr>
            <tr style='border-bottom: 1px solid #ffffff'>
                <td>名称：</td>
                <td align="right">${data.name}</td>
            </tr>
            <tr style='border-bottom: 1px solid #ffffff'>
                <td onclick="myPath('${[data.id, data.name]}')" id='8888'><a>查看详情<a/></td>
            </tr>
        </table>
    `
  this.content = contentHtml
}

// 点击事件 弹窗
zq_handleMarker.prototype.addOnClick = function (map) {
  map.on('mapClickNode', (event) => {
    // 决定没有地图时报错
    if (event.FID === null || event.FID === undefined)
      return
    // 清除所有弹窗
    window.zhenqu_map.removeAllPopInfoMarker()

    // 添加弹窗内容
    const data = {}
    if (
      event.nodeType.description === 'icontextmaker'
      || event.nodeType.description === 'imagemarker'
    ) {
      // Map 类似遍历
      event.properties.forEach((value, key) => {
        data[key] = value
      })
    }
    else {
      return
    }

    const opention = {
      id: 'pop-marker-01',
      name: data.name,
      position: {
        x: event.x,
        y: event.y,
        z: 0,
      },
      floorId: event.floorId,
      data,
    }

    // 查看详细data.id, data.name
    let trackDiv = `
            <tr style='border-bottom: 1px solid #ffffff'>
                <td onclick="myPath('${[
        data.type,
        data.id,
        data.name,
      ]}')" id='8888'><a>查看详情<a/></td>
            </tr>
        `

    const keys = Object.keys(data)
    if (keys.includes('type')) {
      if (data.type === 'person') {
        // 查看轨迹
        trackDiv = `
                    <tr style='border-bottom: 1px solid #ffffff'>
                        <td onclick="myPath('${[
            data.type,
            data.id,
            data.name,
          ]}')" id='8888'><a>查看轨迹<a/></td>
                    </tr>
                `
      }
    }

    const contentHtml = `
            <table style='font-size:14px;color:#fff;border-collapse:collapse' cellspacing="0" cellpadding="8">
                <tr style='border-bottom: 1px solid #ffffff'>
                    <td>id：</td>
                    <td align="right">${data.id}</td>
                </tr>
                <tr style='border-bottom: 1px solid #ffffff'>
                    <td>名称：</td>
                    <td align="right">${data.name}</td>
                </tr>+${trackDiv}
            </table>
        `

    this.popMark = new this.jsmap.JSPopInfoMarker({
      id: opention.id,
      floorId: opention.floorId, // 楼层id 3
      content: contentHtml,
      position: new this.jsmap.JSPoint(opention.position.x, opention.position.y, opention.position.z), // 坐标
      marginTop: 20, // 向上偏移的像素值
      showCloseButton: true, // 是否显示关闭按钮，默认显示
      displayCondition: new this.jsmap.JSDisplayCondition(0.0, 1000), // 可见范围
      show: true, // 是否显示
      properties: {
        test: 'popinfoTest',
      },
    })

    window.zhenqu_map.addMarker(this.popMark)
  })
}

// 地图控件：指北针、缩放
zq_handleMarker.prototype.addCompass = function (map) {
  // 实例指北针控件
  const compassControl = new this.jsmap.JSCompassControl({
    position: this.jsmap.JSControlPosition.LEFT_TOP,
    offset: {
      x: 0,
      y: 60,
    },
  })
  // 添加指北针
  map.addControl(compassControl)

  // 缩放控件
  const zoomControl = new this.jsmap.JSZoomControl({
    position: this.jsmap.JSControlPosition.LEFT_TOP,
    offset: {
      x: 0,
      y: 0,
    },
  })
  // 添加控件
  map.addControl(zoomControl)
}

export { zq_handleMarker }
