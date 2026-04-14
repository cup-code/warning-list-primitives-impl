<script>
import { getById } from '@/http/specialEquipment/management-api'
import AttachmentList from '@/views/specialEquipment/management/attachmentList.vue'
import BasicInfo from '@/views/specialEquipment/management/components/basicInfo.vue'
import ManufacturerInfo from '@/views/specialEquipment/management/components/manufacturerInfo.vue'
import ParamsInfo from '@/views/specialEquipment/management/components/paramsInfo.vue'
import InspectionPlanList from '@/views/specialEquipment/management/inspectionPlanList.vue'
import InspectionRecordList from '@/views/specialEquipment/management/inspectionRecordList.vue'
import PointDataList from '@/views/specialEquipment/management/pointDataList.vue'

export default {
  components: {
    BasicInfo,
    ParamsInfo,
    ManufacturerInfo,
    InspectionPlanList,
    InspectionRecordList,
    PointDataList,
    AttachmentList,
  },
  data() {
    return {
      tabPosition: 'left',
      companyTreeData: [],
      basicDataRecord: null,
      opType: '',
      did: '', // 特种设备id
    }
  },
  created() {
    const me = this
    const params = me.$route.params
    if (params.id) {
      this.did = params.id
      getById(params.id)
        .then((r) => {
          const res = r.data
          if (res.success) {
            me.basicDataRecord = res.result
          }
        })
        .catch((e) => {
          me.$message.error(`根据主键查询查询异常：${e}`)
        })
    }
    if (params.opType) {
      me.opType = params.opType
    }
  },
  methods: {
    /**
     * 返回按钮单击
     */
    backClick() {
      this.$router.go(-1)
    },
    /**
     * 选项卡切换
     * @param activeIndex 当前激活的选项卡索引
     * @param prevIndex 之前的选项卡索引
     */
    tabChange(activeIndex, prevIndex) {
      const tabsIndex = ['1', '2', '3', '4', '5', '6']
      if (tabsIndex.includes(activeIndex) && !this.did) {
        this.$message.warning('请先填写完成基本信息')
        return false
      }
      return true
    },
    /**
     * 设备类型选择发生改变时的处理函数
     * @param val 当前选中的值
     */
    equipmentTypeChangeHandler(val) {
      this.$refs.paramsInfo.activeEquipmentParamsForm(val)
    },
  },
}
</script>

<template>
  <div class="contentArea">
    <el-card class="box-card">
      <div
        slot="header"
        class="clearfix"
      >
        <span style="font-size: medium; font-weight: bold">特种设备信息管理</span>
        <el-button
          style="float: right"
          @click="backClick"
        >
          返回
        </el-button>
      </div>

      <div>
        <el-tabs
          :tab-position="tabPosition"
          :before-leave="tabChange"
        >
          <el-tab-pane label="基本信息">
            <BasicInfo
              :data-record="basicDataRecord"
              :op-type="opType"
              :did.sync="did"
              @equipmentTypeChange="equipmentTypeChangeHandler"
            />
          </el-tab-pane>

          <el-tab-pane label="相关参数">
            <ParamsInfo
              ref="paramsInfo"
              :data-record="basicDataRecord"
              :op-type="opType"
              :did.sync="did"
            />
          </el-tab-pane>

          <el-tab-pane label="制造投用信息">
            <ManufacturerInfo
              :data-record="basicDataRecord"
              :op-type="opType"
              :did.sync="did"
            />
          </el-tab-pane>

          <el-tab-pane label="检验计划">
            <InspectionPlanList
              :did.sync="did"
              :method="opType"
            />
          </el-tab-pane>

          <el-tab-pane label="检验记录">
            <InspectionRecordList
              :did.sync="did"
              :method="opType"
            />
          </el-tab-pane>

          <!-- <el-tab-pane label='检验到期提醒设置'>检验信息</el-tab-pane> -->

          <el-tab-pane label="数采点位信息">
            <PointDataList
              :did.sync="did"
              :method="opType"
            />
          </el-tab-pane>

          <el-tab-pane label="相关附件">
            <AttachmentList
              :did.sync="did"
              :method="opType"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.special-equipment-title {
  font-weight: bolder;
  position: relative;
  text-indent: 12px;
  margin-bottom: 12px;
}
.special-equipment-title::before {
  content: '';
  width: 6px;
  height: 14px;
  background: #11c8e5;
  position: absolute;
  left: 0;
}
</style>
