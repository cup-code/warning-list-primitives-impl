<script>
import { getAccTypeListAll, getApprovalRecord } from '@/http/specialOperation/specialWork-api.js'
import SafetyMeasures from '@/views/specialOperation/components/comps/safetyMeasures'
import { TicketTypeList } from '@/views/specialOperation/config/constant.js'

export default {
  components: {
    SafetyMeasures,
  },
  props: {
    workData: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      approveList: [],
      identifyList: [],
      TicketTypeList,
      departmentLevel: [],
      companyLevel: [],
    }
  },
  computed: {
    /* 安全交底人、接受交底人数据 */
    getPersonSign() {
      return function (key, type) {
        let des = ''
        for (const item of this.workData.approvalByEachUnit || []) {
          if (item.key == key) {
            des = item[type]
            break
          }
        }
        return des
      }
    },
    /* 翻译常量文字 */
    setConstant() {
      return function (value, constList) {
        let des = '-'
        for (const item of constList) {
          if (item.value == value) {
            des = item.label
            break
          }
        }
        return des
      }
    },
  },
  created() {
    if (this.workData && this.workData.id) {
      this.getApprovalRecordFn(this.workData.id)
      this.getAccTypeListAllFn()
    }
    this.getPrefix()
  },
  methods: {
    getApprovalRecordFn(id) {
      getApprovalRecord(id).then(({ data }) => {
        if (data.success) {
          this.approveList = data.result || []
          this.departmentLevel = this.approveList.filter(item => item.processNo == 1)
          this.companyLevel = this.approveList.filter(item => item.processNo == 2)
        }
      })
    },
    getAccTypeListAllFn() {
      getAccTypeListAll().then(({ data }) => {
        if (data.success) {
          data.result.forEach((item) => {
            this.workData.hazardIdentification.forEach((val) => {
              if (val === item.id) {
                this.identifyList.push(item.accidentTypeName)
              }
            })
          })
        }
      })
    },
  },
}
</script>

<template>
  <!-- 作业证 -->
  <div
    v-if="workData.id"
    class="record-bg"
  >
    <el-row
      class="table-box"
      type="flex"
    >
      <el-col
        class="table-item item-title"
        :span="4"
      >
        申请单位
      </el-col>
      <el-col
        class="table-item"
        :span="4"
      >
        {{ workData.applyUnitName }}
      </el-col>
      <el-col
        class="table-item item-title"
        :span="4"
      >
        施工单位
      </el-col>
      <el-col
        class="table-item"
        :span="4"
      >
        {{ workData.workUnitName }}
      </el-col>
      <el-col
        class="table-item item-title"
        :span="4"
      >
        作业时间
      </el-col>
      <el-col
        class="table-item"
        :span="4"
      >
        <span>{{ workData.workStartDate }}至{{ workData.workEndDate }}</span>
      </el-col>
    </el-row>
    <el-row
      class="table-box"
      type="flex"
    >
      <el-col
        class="table-item left-align"
        :span="24"
      >
        <div class="item-title">
          主要作业内容:
        </div>
        <div style="margin-top: 10px">
          <span class="line">{{ workData.workSite.departmentName }}</span>
          (部门)
          <span class="line">{{ workData.workSite.appendPlace }}</span> (部位)
          计划实施危险作业，作业内容为 <span class="line">{{ workData.workInfo }}</span>。
        </div>
      </el-col>
    </el-row>
    <el-row
      class="table-box"
      type="flex"
    >
      <el-col
        class="table-item item-title"
        :span="4"
      >
        风险分析:
      </el-col>
      <el-col
        class="table-item"
        :span="20"
      >
        <span
          v-for="(item, index) in identifyList"
          :key="item"
        >{{ item }}{{ index === identifyList.length - 1 ? '' : '、' }}</span>
      </el-col>
    </el-row>
    <el-row
      class="table-box"
      type="flex"
    >
      <el-col
        class="table-item item-title"
        :span="4"
      >
        作业人员姓名
      </el-col>
      <el-col
        class="table-item item-title"
        :span="3"
      >
        人员类别
      </el-col>
      <el-col
        class="table-item item-title"
        :span="4"
      >
        特种作业类型
      </el-col>
      <el-col
        class="table-item item-title"
        :span="4"
      >
        特种作业资格证名称
      </el-col>
      <el-col
        class="table-item item-title"
        :span="5"
      >
        特种作业资格证号
      </el-col>
      <el-col
        class="table-item item-title"
        :span="4"
      >
        身体状况
      </el-col>
    </el-row>
    <el-row
      v-for="(item, index) in workData.executeJobUsers"
      :key="index"
      class="table-box"
      type="flex"
    >
      <el-col
        class="table-item"
        :span="4"
      >
        {{ item.userName }}
      </el-col>
      <el-col
        class="table-item"
        :span="3"
      >
        {{ item.type }}
      </el-col>
      <el-col
        class="table-item"
        :span="4"
      >
        {{ setConstant(workData.workTicketType, TicketTypeList) }}
      </el-col>
      <el-col
        class="table-item"
        :span="4"
      >
        {{ item.certificateName }}
      </el-col>
      <el-col
        class="table-item"
        :span="5"
      >
        {{ item.certificateNo ? item.certificateNo : item.identityNumber }}
      </el-col>
      <el-col
        class="table-item"
        :span="4"
      >
        {{ item.healthLevel }}
      </el-col>
    </el-row>

    <!-- 安全措施、 -->
    <SafetyMeasures
      :workData="workData"
      :workType="workData.workTicketType"
      :typeList="['otherWork', 'riskMarks', 'safeMeasure']"
    />

    <!-- 审批人签字 -->
    <el-row
      class="table-box"
      type="flex"
    >
      <el-col
        class="table-item item-title"
        :span="4"
      >
        现场指挥人
      </el-col>
      <el-col
        class="table-item"
        :span="8"
      >
        <!-- <el-image
          class="sign-img"
          v-if="approveList && approveList.length"
          :src="filePrefix + approveList[0].signImagePath"
          :preview-src-list="[filePrefix + approveList[0].signImagePath]"
        /> -->
      </el-col>
      <el-col
        class="table-item item-title"
        :span="4"
      >
        现场监护人
      </el-col>
      <el-col
        class="table-item"
        :span="8"
      >
        <!-- <el-image
          class="sign-img"
          v-if="approveList && approveList.length == 2"
          :src="filePrefix + approveList[1].signImagePath"
          :preview-src-list="[filePrefix + approveList[1].signImagePath]"
        /> -->
      </el-col>
    </el-row>
    <el-row
      class="table-box"
      type="flex"
    >
      <el-col
        class="table-item item-title"
        :span="4"
      >
        部门级审核
      </el-col>
      <el-col
        class="table-item"
        :span="8"
        style="display: flex; justify-content: space-around"
      >
        <div
          v-for="(item, index) in departmentLevel"
          :key="index"
        >
          <el-image
            v-if="departmentLevel.length"
            class="sign-img"
            :src="filePrefix + item.signImagePath"
            :preview-src-list="[filePrefix + item.signImagePath]"
          />
          <p>日期:{{ item.signTime }}</p>
        </div>
      </el-col>
      <el-col
        class="table-item item-title"
        :span="4"
      >
        公司级审核
      </el-col>
      <el-col
        class="table-item"
        :span="8"
      >
        <div
          v-for="(items, indexs) in companyLevel"
          :key="indexs"
        >
          <el-image
            v-if="companyLevel.length"
            class="sign-img"
            :src="filePrefix + items.signImagePath"
            :preview-src-list="[filePrefix + items.signImagePath]"
          />
          <p>日期:{{ items.signTime }}</p>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.record-bg {
  @import '../comps/index.scss';
  border-top: 1px solid lightgray;
  border-left: 1px solid lightgray;
}
.left-align {
  display: block !important;
  text-indent: 10px;
  align-items: start !important;
  justify-content: left !important;
}
.line {
  text-decoration: underline;
}
</style>
