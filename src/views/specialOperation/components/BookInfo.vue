<script>
import { getWorkDetail } from '@/http/specialOperation/specialWork-api.js'
import PublicForm from './workForm/publicForm.vue'
import BasicInfo from './workModule/basicInfo.vue'
import EducationTraining from './workModule/educationTraining.vue'
import GasAnalysis from './workModule/gasAnalysis.vue'
import SafetyDisclosure from './workModule/safetyDisclosure.vue'
import SafetyMeasure from './workModule/safetyMeasure.vue'

export default {
  components: {
    BasicInfo,
    EducationTraining,
    GasAnalysis,
    SafetyDisclosure,
    SafetyMeasure,
    PublicForm,
  },
  props: {
    // 特殊作业id
    sid: {
      type: [String, Number],
      default: '',
    },
  },
  data() {
    return {
      isLoading: false,
      // logo: require('../../../../public/source/images/stanley.png'),
      logo: undefined,
      curType: 1, // 当前选中的选项卡
      // 选项卡数据
      tabList: [
        { name: '基础信息', value: 1 },
        { name: '安全交底', value: 2 },
        { name: '首次气体分析', value: 3 },
        { name: '安全措施确认', value: 4 },
        { name: '教育培训', value: 5 },
        { name: '作业票', value: 6 },
      ],
      // 打印参数
      printData: {
        id: 'printBox',
        popTitle: '特种作业票',
        headerStyle: 'font-width:600',
      },
      // 作业票数据
      workData: {},
    }
  },
  computed: {
    setWorkType() {
      return function (val) {
        let msg = ''
        switch (Number.parseInt(val)) {
          case 1001:
            msg = '动火作业'
            break
          case 1002:
            msg = '有限空间作业'
            break
          case 1003:
            msg = '高空作业'
            break
          case 1004:
            msg = '临时用电作业'
            break
          case 1005:
            msg = '断路作业'
            break
          case 1006:
            msg = '动土作业'
            break
          case 1007:
            msg = '吊装作业'
            break
          case 1008:
            msg = '盲板抽堵作业'
            break
          case 1009:
            msg = '通用作业'
            break
        }

        return msg
      }
    },
  },
  created() {
    this.getWorkDetail()
  },
  methods: {
    // 获取详情
    getWorkDetail() {
      getWorkDetail(this.sid).then(({ data }) => {
        if (data.success) {
          this.workData = data.result || {}
          if (!this.workData.doGasAnalysis) {
            this.tabList = this.tabList.filter((res) => {
              return res.value != 3
            })
          }
        }
      })
    },
    /* 点击选项卡 */
    tabClick(type) {
      this.curType = type
    },
    close() {
      this.$emit('close')
    },
  },
}
</script>

<template>
  <!-- 特殊作业台账详情 -->
  <div
    v-loading="isLoading"
    class="book-info"
  >
    <div class="dialog-info">
      <!-- 选项卡 -->
      <div class="tab-box">
        <div
          v-for="item in tabList"
          :key="item.value"
          class="tab-item"
          :class="{ active: curType == item.value }"
          @click="tabClick(item.value)"
        >
          {{ item.name }}
        </div>
      </div>
      <!-- 表格 -->
      <div
        id="printBox"
        class="form-box"
      >
        <div
          v-if="curType == 6"
          class="small-title"
        >
          <div>作业类型:{{ setWorkType(workData.workTicketType) }}</div>
          <div>作业票编号:{{ workData.jobNumber }}</div>
        </div>
        <!-- <el-image style="width: 100px" :src="logo" :preview-src-list="[logo]" /> -->
        <BasicInfo
          v-if="curType == 1"
          class="form-item"
          :workData="workData"
        />
        <SafetyDisclosure
          v-if="curType == 2"
          class="form-item"
          :workData="workData"
        />
        <GasAnalysis
          v-if="curType == 3"
          class="form-item"
          :workData="workData"
        />
        <SafetyMeasure
          v-if="curType == 4"
          class="form-item"
          :workData="workData"
        />
        <EducationTraining
          v-if="curType == 5"
          class="form-item"
          :workData="workData"
        />
        <PublicForm
          v-if="curType == 6"
          class="form-item"
          style="margin-top: 5px"
          :workData="workData"
        />
      </div>
    </div>
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 20px 0 0"
        @click="close"
      >
        返回
      </el-button>
      <el-button
        v-if="curType == 6"
        v-print="printData"
        size="medium"
        type="success"
      >
        打印
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.book-info {
  height: 100%;
  .tab-box {
    display: flex;
    align-items: flex-start;
    padding: 5px 0 0 10px;
    height: 45px;
    box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.2);
    .tab-item {
      height: 30px;
      line-height: 30px;
      padding: 0 10px;
      margin: 0 15px 0 0;
      border-radius: 4px;
      user-select: none;
      cursor: pointer;
    }
    .active {
      background: #409eff;
      color: white;
    }
  }
  .form-box {
    height: calc(100% - 45px);
    overflow-y: auto;
    border: 1px solid #bbbbbb;
    .form-item {
      margin: 20px 20px;
    }
  }
}
::v-deep .el-form {
  padding: 10px;
}
.small-title {
  display: flex;
  justify-content: space-between;
  text-indent: 20px;
  font-weight: 600;
  margin-top: 5px;
  padding-right: 20px;
}
</style>
