<script>
import ImageSelect from '@/components/ImageSelect'
import { getApprovalRecord } from '@/http/specialOperation/specialWork-api.js'

export default {
  components: {
    ImageSelect,
  },
  props: {
    // 作业票类型
    workTicketType: {
      type: Number,
      default: 1001,
    },
    // 作业票票号
    jobNumber: {
      type: String,
      default: '',
    },
    // 特殊作业id
    sid: {
      type: [String, Number],
      default: '',
    },
    // 审批类型
    approvalType: {
      type: [String, Number],
      default: '',
    },
  },
  data() {
    return {
      taskType: '审批',
      taskName: '',
      workData: [],
    }
  },
  computed: {
    setTaskName() {
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
    this.getPrefix() // 获取图片/文件前缀
    setTimeout(() => {
      this.taskName = this.setTaskName(this.workTicketType) + this.jobNumber
      this.getApprovalRecord()
    }, 300)
  },
  methods: {
    getApprovalRecord() {
      getApprovalRecord(this.sid).then(({ data }) => {
        this.workData = data.result || []
      })
    },
  },
}
</script>

<template>
  <div class="handle">
    <el-form
      label-width="100px"
      disabled
    >
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="作业票编号"
            prop=""
          >
            <el-input
              v-model="jobNumber"
              class="small-box"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="任务类型">
            <el-input v-model="taskType" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="任务名称">
            <el-input v-model="taskName" />
          </el-form-item>
        </el-col>
      </el-row>
      <template>
        <h3 v-if="workData.filter(item => item.processNo != 2).length">
          部门审批(安全员)
        </h3>
        <div
          v-for="(departmentTtem, departmentIndex) in workData.filter(item => item.processNo != 2)"
          :key="departmentIndex"
        >
          <el-form-item label="审批意见">
            <el-input
              v-model="departmentTtem.opinion"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
          <el-row>
            <el-col :span="12">
              <el-form-item label="审批情况">
                <el-radio-group v-model="departmentTtem.agree">
                  <el-radio :label="false">
                    不同意
                  </el-radio>
                  <el-radio :label="true">
                    同意
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="审批日期"
                prop="workEndDate"
              >
                <el-input v-model="departmentTtem.createdTime" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="审批人签字">
            <ImageSelect
              :signUrl="
                departmentTtem.signImagePath ? filePrefix + departmentTtem.signImagePath : ''
              "
              width="250px"
              height="100px"
              disabled
            />
          </el-form-item>
        </div>
        <h3 v-if="workData.filter(item => item.processNo != 1).length">
          部门审批(部门负责人)
        </h3>
        <div
          v-for="(departmentItems, departmentIndexs) in workData.filter(
            item => item.processNo != 1,
          )"
          :key="departmentIndexs"
        >
          <el-form-item label="审批意见">
            <el-input
              v-model="departmentItems.opinion"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
          <el-row>
            <el-col :span="12">
              <el-form-item label="审批情况">
                <el-radio-group v-model="departmentItems.agree">
                  <el-radio :label="false">
                    不同意
                  </el-radio>
                  <el-radio :label="true">
                    同意
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="审批日期"
                prop="workEndDate"
              >
                <el-input v-model="departmentItems.createdTime" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="审批人签字">
            <ImageSelect
              :signUrl="
                departmentItems.signImagePath ? filePrefix + departmentItems.signImagePath : ''
              "
              width="250px"
              height="100px"
              disabled
            />
          </el-form-item>
        </div>
      </template>
      <template v-if="approvalType == 2 || approvalType == 3">
        <h3>工厂审批</h3>
        <div
          v-for="(factoryItem, factoryIndex) in workData"
          :key="factoryIndex"
        >
          <el-form-item label="审批意见">
            <el-input
              v-model="factoryItem.opinion"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
          <el-row>
            <el-col :span="12">
              <el-form-item label="审批情况">
                <el-radio-group v-model="factoryItem.agree">
                  <el-radio :label="false">
                    不同意
                  </el-radio>
                  <el-radio :label="true">
                    同意
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="审批日期"
                prop="workEndDate"
              >
                <el-input v-model="factoryItem.createdTime" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="审批人签字">
            <ImageSelect
              :signUrl="factoryItem.signImagePath ? filePrefix + factoryItem.signImagePath : ''"
              width="250px"
              height="100px"
              disabled
            />
          </el-form-item>
        </div>
      </template>
      <template v-if="approvalType == 3">
        <h3>公司审批</h3>
        <div
          v-for="(companyItem, companyIndex) in workData"
          :key="companyIndex"
        >
          <el-form-item label="审批意见">
            <el-input
              v-model="companyItem.opinion"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
          <el-row>
            <el-col :span="12">
              <el-form-item label="审批情况">
                <el-radio-group v-model="companyItem.agree">
                  <el-radio :label="false">
                    不同意
                  </el-radio>
                  <el-radio :label="true">
                    同意
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="审批日期"
                prop="workEndDate"
              >
                <el-input v-model="companyItem.createdTime" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="审批人签字">
            <ImageSelect
              :signUrl="companyItem.signImagePath ? filePrefix + companyItem.signImagePath : ''"
              width="250px"
              height="100px"
              disabled
            />
          </el-form-item>
        </div>
      </template>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.handle {
  cursor: no-drop;
}
h3 {
  height: 50px;
  line-height: 50px;
  border-bottom: 1px solid #bbbbbb;
  position: relative;
  text-indent: 15px;
}
h3::after {
  content: '';
  width: 4px;
  height: 24px;
  background: #409eff;
  position: absolute;
  left: 0px;
  top: 14px;
}
</style>
