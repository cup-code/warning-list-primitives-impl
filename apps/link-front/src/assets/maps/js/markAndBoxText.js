// 2021.1.14
import * as THREE from 'three/build/three.module.js'

const MarkText = {
  // ---name , icon , text---
  iconType: {
    info: 'info', // 信息
    entrance: 'men',
    city: 'xiezilou', // 写字楼
    parking: 'parking', // 停车
    rubbish: 'rubbish', // 垃圾箱
    smoke: 'smoke', // 烟感
    water: 'water', // 水质
    LiquidLevel: 'LiquidLevel', // 液位
    LoRa: 'lora', // LoRa基站
    lighting: 'lighting', // 路灯
    camera: 'cam_circle', // 视频
    guard: 'guard', // 门禁
    GPS: 'gps', // gps定位
    shop: 'gouwu',
    bank: 'jinrong', // 金融
    wenshidu: 'wenshidu', // 温湿度
    restaurant: 'meishi', // 美食
  },
  loadMarkUp: false, // 用于导入时更新一次
  loadMark(loader, data, group) {
    const id = data.id
    const name = data.name
    let icon = null
    const pos = data.pos
    // color = data['marker-color'] ? hexToRgba(data['marker-color'], null) : new THREE.Color(0XFFFFFF),
    let desc
    let dataType
    let area
    let dataInfo
    let length
    // 遍历对象键值
    for (const [key, value] of Object.entries(this.iconType)) {
      if (data['marker-symbol'] == key) {
        icon = value
      }
    }

    const spriteScale = 6 // 3.5原始 100
    if (icon == null) {
      const texts = []
      texts.push(name)
      const spriteText = createMarkText(id, null, pos, texts.join('\n'), spriteScale)
      group.add(spriteText)
    }
    else {
      // 图标和文字 ，图标
      loader.load(
        // 加载一个资源
        // 资源URL
        `./3D/${icon}.png`,
        // onLoad回调
        (texture) => {
          // name==undefined
          if (name == undefined || name == '') {
            const spriteIcon = createMark(id, texture.image, pos, spriteScale)
            group.add(spriteIcon)
          }
          else {
            // in this example we create the material when the texture is loaded
            const texts = []
            texts.push(name) // image  //isouterHTML
            const spriteMarkText = createMarkText(
              id,
              texture.image,
              pos,
              texts.join('\n'),
              spriteScale,
            )
            group.add(spriteMarkText)
          }

          this.loadMarkUp = true
        },
        undefined,
        // 目前暂不支持onProgress的回调
        /*                 (xhr) => {
                                    console.log("----xhr------", xhr);
                                    if (xhr.lengthComputable) {
                                        var percentComplete = (xhr.loaded / xhr.total) * 100
                                        var progress = Math.round(percentComplete, 2)
                                        console.log('----mark:---' + progress + '% downloaded：')
                                    }
                                }, */
        // onError回调
        (error) => {
          console.error('An error happened.')
        },
      )
    }
  },
}

function createMark(id, img, pos, scale) {
  const iconSize = 32 // 0 / 32

  let context = document.createElement('canvas').getContext('2d')
  const canvas = document.createElement('canvas')
  canvas.width = iconSize
  canvas.height = iconSize
  // 设置样式并绘制文字
  context = canvas.getContext('2d')
  // 对缩放的图片使用 imageSmoothingQuality 属性。
  context.imageSmoothingQuality = 'high' // 用于设置图像平滑度的属性。
  context.drawImage(img, 0, 0, iconSize, iconSize)
  // generate sprite
  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  // ---***---初始化状态 返回sprite
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  })
  const sprite = new THREE.Sprite(spriteMaterial)
  const [x, y, z] = pos
  sprite.center.y = 0
  sprite.position.set(x, y + 0.5, z)
  sprite.scale.set(canvas.width / scale, canvas.height / scale, 1)
  sprite.name = id
  return sprite
}
// 图标文字，图标，文字
function createMarkText(id, img, pos, text, scale) {
  let iconSize = 32 // 0 / 32
  if (img == null) {
    iconSize = 0
  }
  const fontSize = 18 // 18
  const textSpacing = 2
  const padding = 2 // 首尾间距
  const triangleWidth = 24
  // let triangleHeight = 12

  // 设置样式并计算文字宽度和高度
  // let canvas = map.image;
  let context = document.createElement('canvas').getContext('2d')
  const canvas = document.createElement('canvas')
  context.font = `${fontSize}px Microsoft YaHei` // 注意空格

  // 计算文字宽
  const arrText = text.split('') // 空格间距
  const width = context.measureText(text).width + textSpacing * (arrText.length - 1)

  const width2 = makePowerOfTwo(Math.max(width, triangleWidth) + padding * 2)
  const height2 = makePowerOfTwo(fontSize + padding * 3)
  canvas.width = width2
  canvas.height = height2 + iconSize

  // 设置样式并绘制文字
  context = canvas.getContext('2d')
  // 对缩放的图片使用 imageSmoothingQuality 属性。
  context.imageSmoothingQuality = 'high' // 用于设置图像平滑度的属性。
  context.textBaseline = 'hanging' // 属性设置或返回在绘制文本时的当前文本基线。
  context.lineWidth = 2 // 前线条的宽度
  // context.textAlign = 'center'

  const halfWidth = width2 / 2
  // 绘制图标
  if (img != null) {
    // 没有图标
    context.drawImage(img, halfWidth - iconSize / 2, 0, iconSize, iconSize)
  }
  // 描边文字
  context.font = `${fontSize}px Microsoft YaHei` // 注意空格
  context.lineWidth = 1.2
  context.strokeStyle = '#ffffff' // 描边颜色

  // 文字
  // context.fillText(text,x,y,maxWidth); //最大宽度
  // context.fillText(text, halfWidth, padding + iconSize) //绘制文字  ？？有间距问题(使用扩展方法)

  // 开始逐字绘制
  context.fillStyle = '#ffffff' // 文字颜色
  context.textAlign = 'left' // 临时修改为文本左对齐
  // 计算起始间距  padding
  let posX = (width2 - width) / 2
  arrText.forEach((singleText) => {
    const textWidth = context.measureText(singleText).width
    context.strokeText(singleText, posX, padding + iconSize) // 绘制描边文字
    context.fillText(singleText, posX, padding + iconSize) // 文字
    // 确定下一个字符的横坐标
    posX = posX + textWidth + textSpacing
  })
  context.textAlign = 'center'

  // generate sprite
  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  // ---***---初始化状态 返回sprite
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  })

  const sprite = new THREE.Sprite(spriteMaterial)
  const [x, y, z] = pos
  sprite.center.y = 0
  sprite.position.set(x, y + 0.5, z)
  sprite.scale.set(canvas.width / scale, canvas.height / scale, 1)
  sprite.name = id
  return sprite
}

// canvas 内部扩展方法
CanvasRenderingContext2D.prototype.letterSpacingText = function (text, x, y, letterSpacing) {
  const context = this
  const canvas = context.canvas

  if (!letterSpacing && canvas) {
    letterSpacing = Number.parseFloat(window.getComputedStyle(canvas).letterSpacing)
  }
  if (!letterSpacing) {
    return this.fillText(text, x, y)
  }

  const arrText = text.split('')
  const align = context.textAlign || 'left'
  // 这里仅考虑水平排列
  const originWidth = context.measureText(text).width
  // 应用letterSpacing占据宽度
  const actualWidth = originWidth + letterSpacing * (arrText.length - 1)
  // 根据水平对齐方式确定第一个字符的坐标
  if (align == 'center') {
    x = x - actualWidth / 2
  }
  else if (align == 'right') {
    x = x - actualWidth
  }

  // 临时修改为文本左对齐
  context.textAlign = 'left'
  // 开始逐字绘制
  arrText.forEach((letter) => {
    const letterWidth = context.measureText(letter).width
    context.fillText(letter, x, y)
    // 确定下一个字符的横坐标
    x = x + letterWidth + letterSpacing
  })
  // 对齐方式还原
  context.textAlign = align
  console.log('--ww-canvas---', context)
}

function makePowerOfTwo(num) {
  /**
   * 扩大到2的整数倍
   * @param {number} num 数字
   * @returns {number} 数字
   */
  let result = 1
  while (result < num) {
    result *= 2
  }
  return result
}

// Mark sclae
const MarkScale = {
  spriteScale: 6, // 缩放因子 0.5
  perspectivePos: new THREE.Vector2(0, 0, 0), // 模拟透视相机的位置  正交相机Y 80

  // is scale view
  scaleSize: 0,

  initail(orthoCamPosY) {
    this.perspectivePos.y = orthoCamPosY
  },

  //  //is scale view
  isUpdateScale(viewModel, controls) {
    // is scale view
    let isScaleView = false
    // view model 3D
    if (viewModel == '3D') {
      if (controls.object.position.distanceTo(controls.target) != this.scaleSize) {
        this.scaleSize = controls.object.position.distanceTo(controls.target)
        isScaleView = true
      }
      else {
        isScaleView = false
      }
    }
    else {
      // view model 2D
      if (controls.object.zoom != this.scaleSize) {
        this.scaleSize = controls.object.zoom
        isScaleView = true
      }
      else {
        isScaleView = false
      }
    }
    return isScaleView
  },

  updateScale(spriteArray, camera, viewModel, controls) {
    if (spriteArray.length < 1) {
      return
    }
    for (let i = 0; i < spriteArray.length; i++) {
      if (spriteArray[i].name != 'null') {
        const sprite = spriteArray[i]
        const canvas = sprite.material.map.image
        const position = sprite.position
        if (canvas) {
          const poiRect = { w: canvas.width, h: canvas.height }
          const scale = this.getPoiScale(position, poiRect, camera, viewModel, controls)
          sprite.scale.set(scale[0] * this.spriteScale, scale[1] * this.spriteScale, 1)
        }

        // sprite.visible = visible;
        let visible = true // 是否显示
        let isCollsion = true // 是否碰撞
        const visibleMargin = 2 // 调整间距15
        for (let j = 0; j < i; j++) {
          if (!canvas) {
            // if img is undefined (the img has not loaded)
            visible = false
            break
          }
          // rect -1
          const spritePos = this.threeToScreen(sprite, camera)
          const rect1 = {
            x: spritePos.x - canvas.width / 2,
            y: spritePos.y - canvas.height, // 坐标在底部
            width: canvas.width + visibleMargin, // 间距
            height: canvas.height + visibleMargin, // 间距
          }

          // rect -2
          const sprite2 = spriteArray[j]
          const sprite2pos = this.threeToScreen(sprite2, camera)
          const canvas2 = sprite2.material.map.image
          const rect2 = {
            x: sprite2pos.x - canvas2.width / 2,
            y: sprite2pos.y - canvas2.height, // sprite h中心在底部
            width: canvas2.width + visibleMargin,
            height: canvas2.height + visibleMargin,
          }
          isCollsion = this.isCollsionWithRect(rect1, rect2)
          if (sprite2.visible && isCollsion) {
            // console.log("---有碰撞---");
            visible = false
            break
          }
          else {
            visible = true
          }
        }
        sprite.visible = visible
      }
    }
  },

  // 更新文字
  getPoiScale(position, poiRect, camera, viewModel, controls) {
    if (!position)
      return
    let distance = camera.position.distanceTo(position)
    if (viewModel == '2D') {
      // ??  解决正交相机没有移动位置
      // 得到一个垂直方向
      const posY = position ? position.y : controls.target.y
      const eyeDirection = new THREE.Vector3(0, camera.position.y, 0)
        .clone()
        .sub(new THREE.Vector3(0, posY, 0))
        .normalize()
      // 模拟一个透视摄影机位置  //controls target.y+ Y 缩放//限制在2000 //双击可以改变 target         //2000
      this.perspectivePos = new THREE.Vector3(0, posY, 0)
        .clone()
        .add(eyeDirection.multiplyScalar(800 / camera.zoom))
      distance = this.perspectivePos.distanceTo(new THREE.Vector3(0, posY, 0)) // 200接近位置缩放效果
    }

    const fov = viewModel == '3D' ? camera.fov : 55
    const top = Math.tan(((fov / 2) * Math.PI) / 180) * distance * 0.1 // 0.4
    // var meterPerPixel = 2*top/container.clientHeight;  //window.innerHeight
    const meterPerPixel = (2.4 * top) / window.innerHeight // var meterPerPixel = 2*top/window.innerHeight;

    const scaleX = poiRect.w * meterPerPixel
    const scaleY = poiRect.h * meterPerPixel
    return [scaleX, scaleY, 1.0]
  },

  // three世界坐标转为屏幕坐标
  threeToScreen(obj, camera) {
    let vector = new THREE.Vector3()
    vector = vector.setFromMatrixPosition(obj.matrixWorld).project(camera)
    // var halfWidth = window.innerWidth / 2;
    // var halfHeight = window.innerHeight / 2;
    const result = {
      // x: Math.round(vector.x * halfWidth + halfWidth),
      // y: Math.round(-vector.y * halfHeight + halfHeight),
      x: Math.round(((vector.x + 1) / 2) * window.innerWidth),
      y: Math.round((-(vector.y - 1) / 2) * window.innerHeight),
      width: '20',
      height: '20',
    }
    return result
  },
  // 检测标注碰撞
  isCollsionWithRect(b1, b2) {
    const x1 = b1.x
    const y1 = b1.y
    const w1 = b1.width
    const h1 = b1.height
    const x2 = b2.x
    const y2 = b2.y
    const w2 = b2.width
    const h2 = b2.height
    if (x1 >= x2 && x1 >= x2 + w2) {
      return false
    }
    else if (x1 <= x2 && x1 + w1 <= x2) {
      return false
    }
    else if (y1 >= y2 && y1 >= y2 + h2) {
      return false
    }
    else if (y1 <= y2 && y1 + h1 <= y2) {
      return false
    }
    else {
      return true // 有碰撞
    }
  },
}
// box tetxt
function MarkBox(data) {}

export {
  MarkBox,
  MarkScale,
  MarkText,
}
