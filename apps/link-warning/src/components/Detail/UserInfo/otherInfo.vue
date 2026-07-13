<script>
const CertificateTable = () => import('./table/certificateTable')
const TrainRecordTable = () => import('./table/trainRecordTable')
const ExamRecordTable = () => import('./table/examRecordTable')
const AccidentTable = () => import('./table/accidentTable')
const ThreeViolationTable = () => import('./table/threeViolationTable')
export default {
  components: {
    CertificateTable,
    TrainRecordTable,
    ExamRecordTable,
    AccidentTable,
    ThreeViolationTable,
  },
  props: {
    id: String,
  },
  data() {
    return {
      activeName: 'first',
    }
  },
  methods: {
    handleTabClick() {},
  },
}
</script>

<template>
  <div class="userOtherInfo">
    <el-tabs
      v-model="activeName"
      class="tabs-block"
      tabPosition="left"
      @tab-click="handleTabClick"
    >
      <el-tab-pane
        label="资质证书"
        name="first"
      />
      <el-tab-pane
        label="培训记录"
        name="second"
      />
      <el-tab-pane
        label="考试记录"
        name="third"
      />
      <el-tab-pane
        label="事故工伤"
        name="fourth"
      />
      <el-tab-pane
        label="三违考核"
        name="fifth"
      />
    </el-tabs>
    <certificateTable
      v-if="activeName === 'first'"
      :id="id"
    />
    <trainRecordTable
      v-if="activeName === 'second'"
      :id="id"
    />
    <examRecordTable
      v-if="activeName === 'third'"
      :id="id"
    />
    <accidentTable
      v-if="activeName === 'fourth'"
      :id="id"
    />
    <threeViolationTable
      v-if="activeName === 'fifth'"
      :id="id"
    />
  </div>
</template>

<style lang="scss" scoped>
.userOtherInfo {
  display: flex;

  .tabs-block {
    margin-left: -10px;
    margin-right: 14px;
    height: 90%;
  }
}
</style>
