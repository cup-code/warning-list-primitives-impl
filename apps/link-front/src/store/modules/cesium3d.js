import { getInspectionItemsDetail,getInspectionPlanDetail } from "@/http/inspection/inspection-items-api.js";
import { getInspectionPointDetail } from "@/http/inspection/inspection-point-api.js";
import {
  cameraList,
} from "@/http/videoWarning/warning-api";
const state = {
  list: [], // 计划列表数据
  currentStep: {}, // 当前位置
  isShowRoutes: true, // 是否显示巡检点列表
  // 当前位置检测是否完成
  currentStepIsComplete: false,
  pointInfo: {}, // 当前位置巡检点信息
  inspectionItems: [], // 当前位置巡检项的详情技能
  inspectionItemsInfo: {}, // 当前位置巡检项信息
  cameraInfo: {}, // 当前摄像头信息
  nonProcessInfo: {}, // 当前非工艺点信息

  defaultVideoInfo: [
  { streamUrl:
    "http://47.94.44.213:8001/lss/download?path=/alarm-videos/251113160907273663160.mp4"},
    {  streamUrl:
      "http://47.94.44.213:8001/lss/download?path=/alarm-videos/251113235213927374846.mp4"},
      { streamUrl:
        "http://47.94.44.213:8001/lss/download?path=/alarm-videos/251114150811064348562.mp4"}
  ], // 默认视频信息
}

const mutations = {
  SET_PLAN_LIST: (state, planList) => {
    state.list = planList // 设置当前计划的巡检点列表
  },
  SET_CURRENT_STEP: (state, step) => {
    state.currentStep = step // 设置当前位置
  },
  SET_CURRENT_STEP_IS_COMPLETE: (state, isComplete) => {
    state.currentStepIsComplete = isComplete // 设置当前位置检测是否完成
  },
  SET_POINT_INFO: (state, pointInfo) => {
    state.pointInfo = pointInfo // 设置当前巡检列表中某一巡检点的详情信息
  },
  SET_INSPECTION_ITEMS: (state, inspectionItems) => {
    state.inspectionItems = inspectionItems // 设置当前巡检点中巡检项的详情信息
  },
  SET_CAMERAINFO: (state, cameraInfo) => {
    state.cameraInfo = cameraInfo // 设置当前摄像头信息
  },
  SET_NON_PROCESS_INFO: (state, nonProcessInfo) => {
    state.nonProcessInfo = nonProcessInfo // 设置当前非工艺点信息
  },
  SET_IS_SHOW_ROUTES: (state, isShowRoutes) => {
    state.isShowRoutes = isShowRoutes // 设置是否显示巡检点列表
  },
}

const actions = {
  async setPlanList({ commit }, planId) {
    const inspectionPointList = await getInspectionPlanDetail(planId) // 调取接口获取当前计划的巡检点列表
    let pointList = []
    if (inspectionPointList.data?.success) {
      pointList = inspectionPointList.data.result.inspectPlaces
    }
    commit('SET_PLAN_LIST', pointList)
    const firstStep
      = Array.isArray(pointList) && pointList.length ? pointList[0] : {}
    commit('SET_CURRENT_STEP', firstStep)
    commit('SET_CURRENT_STEP_IS_COMPLETE', false)
  },
  setCurrentStep({ commit }, step) {
    commit('SET_CURRENT_STEP', step)
  },
  async getPointInfo({ commit }, placeId) {
    const inspectionPointList = await getInspectionPointDetail(placeId) // 调取接口获取当前巡检列表中某一巡检点的详情信息
    if (inspectionPointList.data?.success) {
      commit('SET_POINT_INFO', inspectionPointList.data.result)
    }
  },
  async getInspectionItems({ commit }, { id, index }) {
    const inspectionItems = await getInspectionItemsDetail(id) // 调取接口获取当前巡检点中巡检项的详情信息
    if (inspectionItems.data?.success) {
      const info = await cameraList({cameraName: inspectionItems.data.result.cameraName,isPages:false,pageNum:1,pageSize:1})
      if(info.data.success){
        const result = info.data.result.list[0]
        console.log(state.defaultVideoInfo[index],'state.defaultVideoInfo[index]')
        commit('SET_CAMERAINFO',result)
      }
      // getCameraVideo(inspectionItems.data.result.cameraName)
      commit('SET_INSPECTION_ITEMS',inspectionItems.data.result)
    }
  },


}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
