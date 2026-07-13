<script>
export default {
  components: {},
  props: {
    workData: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      inputForm: {
        workSite: {},
        workTicketTypeName: '',
      },
      executeJobUsers: [],
    }
  },
  computed: {
    setType() {
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
          default:
            break
        }
        return msg
      }
    },
  },
  created() {
    setTimeout(() => {
      this.inputForm = Object.assign(this.inputForm, this.workData)
      this.executeJobUsers = this.inputForm.executeJobUsers
      this.inputForm.workTicketTypeName = this.setType(this.inputForm.workTicketType)
    }, 300)
  },
  methods: {},
}
</script>

<template>
  <div class="handle">
    <el-form
      ref="inputForm"
      :model="inputForm"
      label-width="100px"
      disabled
    >
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="作业票编号"
            prop="jobNumber"
          >
            <el-input
              v-model="inputForm.jobNumber"
              class="small-box"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="申请单位"
            prop="applyUnitName"
          >
            <el-input v-model="inputForm.applyUnitName" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="申请人"
            prop="applyUserName"
          >
            <el-input v-model="inputForm.applyUserName" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="施工单位">
            <el-input v-model="inputForm.workSite.departmentName" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="作业开始时间"
            prop="workStartDate"
          >
            <el-input v-model="inputForm.workStartDate" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="作业结束时间"
            prop="workEndDate"
          >
            <el-input v-model="inputForm.workEndDate" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="作业地点">
            <el-input v-model="inputForm.workSite.appendPlace" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="作业类型"
            prop="workTicketTypeName"
          >
            <el-input v-model="inputForm.workTicketTypeName" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item
        label="作业内容"
        prop="workInfo"
      >
        <el-input
          v-model="inputForm.workInfo"
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="作业人员">
        <el-table
          :data="executeJobUsers"
          row-key="sort"
          align="center"
          :header-cell-style="{ background: 'var(--ky-head-color)' }"
        >
          <el-table-column
            prop="userName"
            align="center"
            label="姓名"
          />
          <el-table-column
            prop="type"
            align="center"
            label="人员类别"
          />
          <el-table-column
            prop="certificateName"
            align="center"
            label="特种作业证名称"
          />
          <el-table-column
            align="center"
            label="特种作业资格证书号"
          >
            <template slot-scope="scope">
              <span>{{
                scope.row.certificateNo ? scope.row.certificateNo : scope.row.identityNumber
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="healthLevel"
            align="center"
            label="身体状况"
          >
            <template slot-scope="scope">
              <span
                v-if="scope.row.healthLevel == '优秀'"
                class="excellent-box"
              >{{ scope.row.healthLevel }}</span>
              <span
                v-else
                class="good-box"
              >{{ scope.row.healthLevel }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.handle {
  cursor: no-drop;
}
.excellent-box {
  padding: 2px 10px;
  border-radius: 4px;
  color: #3894ff;
  border: 1px solid #3894ff;
  background: #e9f3ff;
}
.good-box {
  padding: 2px 10px;
  border-radius: 4px;
  color: #7ac756;
  border: 1px solid #7ac756;
  background: #eef8e8;
}
</style>
