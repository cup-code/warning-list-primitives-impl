<script>
import { getLevelCtrlById } from '@/http/defense/shandong/riskControl-api.js'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import CtrlForm from './CtrlForm.vue'
import CtrlLeft from './CtrlLeft.vue'

export default {
  components: {
    CtrlLeft,
    CtrlForm,
  },
  props: {
    // 详情id
    infoId: {
      type: [String, Number],
      default: null,
    },
    // 是否可编辑
    editable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isLoading: false,
      allDic: [], // 字典信息
      infoData: {}, // 详情数据
      deptList: [], // 部门下拉列表
      controlHierarchy: '', // 各个管控措施的管控层级引用详情里层级
    }
  },
  created() {
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    if (this.infoId) {
      this.getInfoData()
    }
    else {
      this.$message.error('未获取到详情Id')
    }
    getDepartListSimple()
      .then(({ data }) => {
        this.deptList = data.result || []
      })
      .catch(() => {
        this.$message.error('获取列表失败')
      })
  },
  methods: {
    /* 请求详情数据 */
    getInfoData() {
      this.isLoading = true
      getLevelCtrlById(this.infoId)
        .then((res) => {
          if (res.data.success) {
            this.infoData = res.data.result
            this.controlHierarchy = this.infoData.controlHierarchy || ''
            if (this.infoData.riskControlMeasures && this.infoData.riskControlMeasures.length) {
              this.infoData.riskControlMeasures = this.infoData.riskControlMeasures.filter((item) => {
                return item.controlMeasuresDesc
              })
            }
          }
          else {
            this.$message.warning(res.data.message || '请求详情失败')
          }
        })
        .catch((err) => {
          this.$message.error('请求详情出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 关闭弹窗 */
    cancelClick() {
      this.$emit('close')
    },
  },
}
</script>

<template>
  <div
    v-loading="isLoading"
    style="height: 100%"
  >
    <div class="dialog-info">
      <!-- 左侧风险辨识信息 -->
      <el-card class="left-card">
        <CtrlLeft :infoData="infoData" />
      </el-card>
      <!-- 右侧管控信息 -->
      <el-card class="right-card">
        <el-card
          v-for="(taskData, taskIndex) in infoData.riskControlMeasures"
          :key="`task${taskIndex}`"
          class="card-form"
        >
          <CtrlForm
            :taskIndex="taskIndex"
            :taskData="taskData"
            :eventId="infoData.id"
            :editable="editable"
            :deptList="deptList"
            :controlHierarchy="controlHierarchy"
          />
        </el-card>
      </el-card>
    </div>
    <div class="dialog-footer">
      <el-button
        size="medium"
        @click="cancelClick"
      >
        关 闭
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dialog-info {
  width: 100%;
  display: flex;
  .left-card {
    margin: 0 20px 0 0;
    overflow-y: auto;
  }
  .right-card {
    flex: 1;
    height: 100%;
    overflow-y: auto;
    .card-form {
      margin: 0 0 10px 0;
    }
  }
}
</style>
