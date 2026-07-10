<script>
import {
  addTemporaryScheduleFn,
  getInspectionPositionByDepartFn,
} from '@/http/dev_new/inspection-api'
import { getUsersByPostFn } from '@/http/safe-production/post-manage-api'
import { loadJsmap } from '@/utils/loadJsmap'

export default {
  props: {
    departmentId: String,
    lineInfo: Array,
  },
  data() {
    return {
      visible: false,
      loading: false,
      inputForm: {
        planId: '',
        taskName: '',
        scheduleStartTime: '',
        scheduleEndTime: '',
        expireHours: 0,
        executeUserIdList: [],
        postId: '',
        remarks: '',
      },
      postList: [], // 岗位列表
      users: [], // 用户列表
      mapServerURL: window.g.MAP_URL, // 地图引用的地址
    }
  },
  methods: {
    drawEnd(info) {},
    async init() {
      await loadJsmap()
      this.visible = true
      this.$nextTick(() => {
        if (!window.map) {
          window.map = new jsmap.JSMap({
            mapType: jsmap.JSMapType.MAP_3D,
            container: 'planLineSet',
            // mapServerURL: 'data/zq_map',
            mapServerURL: this.mapServerURL,
            openingAnimation: false, // 是否开启开场动画，默认true
            showLoading: false, // 是否显示地图加载动画，默认true
            buildingSelected: false, // 是否启用建筑选中，默认true
            selectedEffect: false, // 是否启用选中效果，默认true
          })
          window.map.openMapById('ls-3d')
          map.on('loadComplete', (e) => {
            const drawTool = new jsmap.JSDrawToolControl({
              position: jsmap.JSControlPosition.RIGHT_TOP, // 画图工具在容器中的相对位置，当前为右上
              offset: {
                x: 5,
                y: 5,
              }, // 偏移量
              drawMode: jsmap.JSDrawMode.POLYLINE, // 画图类型POINT:画点  POLYLINE:画线  POLYGON:画面
              // 画图结束的回调，返回所画的面信息
              callback: (feature) => {
                this.drawEnd(feature)
              },
              // 移除相应面的回调，返回相应面信息
              removeCallback: (feature) => {
                // console.log('remove', feature);
              },
              // 编辑相应面的回调，返回相应面信息
              editCallback: (feature) => {
                this.drawEnd(feature)
              },
              // 定位到相应面的回调，返回相应面信息
              // locateCallback: (feature) => {
              //   console.log('locate..', feature);
              // }
            })
            map.addControl(drawTool)
            map.on('mapClickNode', (event) => {
              console.log(event)
            })
            // 通过部门id获取部门下的巡检点
            getInspectionPositionByDepartFn(this.departmentId).then(({ data }) => {
              console.log(data)
              const inspectionPointArr = []
              if (data.success) {
                data.result.forEach((item) => {
                  if (item.areaOnMapInfo) {
                    inspectionPointArr.push(item.areaOnMapInfo)
                  }
                })
                drawTool.addGraphic(inspectionPointArr)
              }
            })
            // 如果有标注巡检点，则在地图上显示
            if (this.lineInfo.length) {
              console.log(this.lineInfo)
              drawTool.addGraphic(this.lineInfo)
            }
          })
        }
      })
    },
    // 查询指定岗位id的用户
    getUsersByPost(postId) {
      getUsersByPostFn(postId).then(({ data }) => {
        this.users = data.result || []
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          addTemporaryScheduleFn(this.inputForm).then(({ data }) => {
            this.loading = false
            if (data && data.success) {
              this.$message.success(data.message)
              this.visible = false
              this.$emit('refreshDataList')
            }
            else {
              this.$message.error(data.message || '提交失败')
            }
          })
        }
      })
    },
    closeDialog() {
      if (window.map) {
        window.map.destroy()
        window.map = null
      }
    },
  },
}
</script>

<template>
  <div>
    <el-dialog
      title="地图规划巡检路线"
      :close-on-click-modal="false"
      width="600px"
      :visible.sync="visible"
      class="normal-dialog"
      @close="closeDialog"
    >
      <div id="planLineSet" />
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="visible = false">关闭</el-button>
        <el-button
          size="small"
          type="primary"
          :loading="loading"
          @click="doSubmit()"
        >确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
#planLineSet {
  height: 400px;
}
</style>
