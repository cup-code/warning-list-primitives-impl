//2021.1.10 langangying200@126.com
//import { GUI } from '../../examples/jsm/libs/dat.gui.module.js';
//vue
import * as THREE from 'three/build/three'
;
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js'('three/examples/jsm/libs/stats.module.js')

function LoadGltfMotionModel(groud, loader, roleMotionList, clickArray, pos) {
  // './../examples/models/gltf/Soldier.glb'
  loader.load(
    './maps/data/gltfani/Soldier.glb',
    (gltf) => {
      const model = gltf.scene
      model.traverse((object) => {
        if (object.isMesh) {
          object.castShadow = true
          object.material.transparent = true
          object.material.opacity = 0.5
          if (clickArray != null) {
            clickArray.push(object)
          }
        }
      })
      groud.add(model)
      // 处理多个
      if (Array.isArray(pos[0])) {
        pos.forEach((item, index) => {
          const [x, y, z] = item
          // (expr1) ? (expr2) : (expr3)
          // index == 0 ? model.position.set(x, y, z) : ''
          if (index == 0) {
            model.position.set(x, y, z)
            const roleMotion = new SkinningMotion()
            roleMotion.initial(groud, model, gltf.animations)
            if (roleMotionList != null) {
              roleMotionList.push(roleMotion)
            }
          }
 else {
            // ----第二开始-重新克隆-----
            const motionModle = SkeletonUtils.clone(gltf.scene)
            groud.add(motionModle)
            motionModle.position.set(x, y, z)
            const roleMotion = new SkinningMotion()
            roleMotion.initial(groud, motionModle, gltf.animations)
            if (roleMotionList != null) {
              roleMotionList.push(roleMotion)
            }
          }
        })
      }
 else {
        const [x, y, z] = pos
        model.position.set(x, y, z)
        const roleMotion = new SkinningMotion()
        roleMotion.initial(groud, model, gltf.animations)
        roleMotionList.push(roleMotion)
      }
    },
    (xhr) => {
      if (xhr.lengthComputable) {
        const percentComplete = (xhr.loaded / xhr.total) * 100
        console.log(`${Math.round(percentComplete, 2)  }% downloaded`)
        if (Math.round(percentComplete, 2) >= 100) {
        }
      }
    },
    (err) => {
      console.log('obj loaded error', err)
    },
  )
}

function cloneModel(moel) {}

function SkinningMotion() {
  this.finish = false
  this.mixer = null
  return this
}

SkinningMotion.prototype.initial = function (group, model, animations) {
  // this.idleAction=null;
  // this.walkAction=null;
  // this.runAction=null;//动画
  // let idleWeight=null;
  // let walkWeight=null;
  // let runWeight=null;

  const skeleton = new THREE.SkeletonHelper(model)
  skeleton.visible = false
  group.add(skeleton)
  skeleton
  // const animations = gltf.animations;
  const _mixer = new THREE.AnimationMixer(model)
  const idleAction = _mixer.clipAction(animations[0])
  const walkAction = _mixer.clipAction(animations[3])
  const runAction = _mixer.clipAction(animations[1])
  const actions = [idleAction, walkAction, runAction]

  // 设置动画
  setWeight(idleAction, 0.0)
  setWeight(walkAction, 1.0)
  setWeight(runAction, 0.0)
  actions.forEach((action) => {
    action.play()
  })

  this.mixer = _mixer
  this.finish = true
}

function setWeight(action, weight) {
  action.enabled = true
  action.setEffectiveTimeScale(1)
  action.setEffectiveWeight(weight)
}

// 更新动画
SkinningMotion.prototype.rolesMotionUpdate = function (mixerUpdateDelta) {
  // Get the time elapsed since the last frame, used for mixer update (if not in single step mode)
  // let mixerUpdateDelta = clock.getDelta();
  // Update the animation mixer, the stats panel, and render this frame
  this.mixer.update(mixerUpdateDelta)
}
export { LoadGltfMotionModel, SkinningMotion }
