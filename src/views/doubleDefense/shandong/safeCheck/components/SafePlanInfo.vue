<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import {
  getSafeCheckTableByTableId,
  safeCheckPlanInfoById,
  safeCheckPlanSave,
} from '@/http/defense/shandong/safeCheck-api.js'
import PickPeople from '@/views/common-ui/PickPeople.vue'
import { SafePlanData } from '../classData/safePlan'
import PickCycleDate from './comps/PickCycleDate.vue'
import PickSafeTable from './comps/PickSafeTable.vue'

export default {
  components: {
    PickCycleDate,
    PickPeople,
    PickSafeTable,
    TreeSelect,
  },
  props: {
    /* 是否可编辑 */
    editable: {
      type: Boolean,
      default: false,
    },
    /* 详情id */
    infoId: {
      type: [String, Number],
      default: null,
    },
    /* 公司信息 */
    // companyData: {
    //   type: Array,
    //   default() {
    //     return []
    //   }
    // }
  },
  data() {
    return {
      isLoading: false,
      loadingTable: false,
      dateProp: {}, // 选择日期组件传递信息
      peopleProp: {}, // 选择人员组件传递信息
      showDateDialog: false, // 设置周期弹窗
      showPeopleDialog: false, // 选择人员弹窗
      showTableDialog: false, // 选择检查表弹窗
      changeData: {},
      checkTypeList: [], // 计划类型下拉列表
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7
        },
      },
    }
  },
  created() {
    const dicList = JSON.parse(sessionStorage.getItem('dictList'))
    this.checkTypeList = dicList.safeCheck_type
    if (this.infoId) {
      this.getInfoData()
    }
    else {
      this.changeData = new SafePlanData()
    }
  },
  methods: {
    /* 获取详情数据 */
    getInfoData() {
      this.isLoading = true
      safeCheckPlanInfoById(this.infoId)
        .then((res) => {
          if (res.data.success) {
            this.changeData = new SafePlanData(res.data.result)
          }
          else {
            this.$message.warning(res.data.message || '获取详情失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取详情出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 设置周期 */
    setCycleDateClick() {
      this.dateProp = {
        cycleYear: this.changeData.cycleYear,
        cycleUnit: this.changeData.cycleUnit,
        cycleFrequency: this.changeData.cycleFrequency,
        cycleRule: this.changeData.cycleRule,
        durationDays: this.changeData.durationDays,
      }
      this.showDateDialog = true
    },
    /* 选择公司回调 */
    // companyChangeEvt(id, name) {
    //   this.changeData.companyId = id ? id : ''
    //   this.changeData.companyName = name ? name : ''
    //   this.$refs['companySelect'].closeSelect()
    // },
    /* 点击选择人员 */
    pickPeopleClick(mark) {
      this.peopleProp.oldPickList = this.changeData.setPeopleBack(mark)
      this.peopleProp.mark = mark
      this.peopleProp.listType = 'company'
      this.showPeopleDialog = true
    },
    /* 选择检查表 */
    pickTableClick() {
      this.showTableDialog = true
    },
    /* 选择周期弹窗回调 */
    closeDateEvt(params) {
      if (params) {
        this.changeData.setCycleDate(params)
      }
      this.showDateDialog = false
    },
    /* 选择人员弹窗回调 */
    closePeopleEvt(params) {
      if (params) {
        this.changeData.setPeople(params.data, params.mark)
      }
      this.showPeopleDialog = false
    },
    /* 选择检查表弹窗回调 */
    closeTableEvt(curPick) {
      if (curPick) {
        this.loadingTable = true
        this.changeData.departmentId = curPick.responsibilityDepartment
        this.changeData.departmentName = curPick.responsibilityDepartmentName
        getSafeCheckTableByTableId(curPick.id)
          .then((res) => {
            if (res.data.success) {
              this.changeData.checkContentList = res.data.result
            }
            else {
              this.$message.warning(res.data.message || '获取检查内容表失败')
            }
          })
          .catch((err) => {
            this.$message.error('获取检查内容表出错', err)
          })
          .finally(() => {
            this.loadingTable = false
          })
      }
      this.showTableDialog = false
    },
    /* 移除人员回调 */
    removePeople(index, type) {
      switch (type) {
        case 'notic':
          this.changeData.remindUserList.splice(index, 1)
          break
        case 'check':
          this.changeData.checkUserList.splice(index, 1)
          break
        default:
          console.log('移除人员类型错误', type)
      }
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击确认保存 */
    submitClick() {
      console.log(this.changeData.cycleYear)
      // return
      this.$refs.checkPlanForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          safeCheckPlanSave(this.changeData)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('保存成功')
                this.$emit('getDataFX', this.changeData.checkPlanName)
                this.$emit('close', true)
              }
              else {
                this.$message.warning(res.data.message || '保存失败')
              }
            })
            .catch((err) => {
              this.$message.error('保存出错', err)
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
  },
}
</script>

<template>
  <div
    v-loading="isLoading"
    class="checkPlan-info"
  >
    <!-- 表单 -->
    <el-form
      ref="checkPlanForm"
      class="dialog-info"
      :model="changeData"
      inline
      :disabled="!editable"
      label-width="80px"
    >
      <el-form-item
        label="计划编号"
        prop="checkPlanCode"
      >
        <el-input
          v-model="changeData.checkPlanCode"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="计划名称"
        prop="checkPlanName"
        :rules="[{ required: true, message: '请输入计划名称', trigger: 'blur' }]"
      >
        <el-input
          v-model="changeData.checkPlanName"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="计划类型"
        prop="checkPlanType"
        :rules="[{ required: true, message: '请选择计划类型', trigger: 'change' }]"
      >
        <el-select
          v-model="changeData.checkPlanType"
          style="width: 250px"
        >
          <el-option
            v-for="item in checkTypeList"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="检查地点"
        prop="checkLocation"
        :rules="[{ required: true, message: '请输入检查地点', trigger: 'blur' }]"
      >
        <el-input
          v-model="changeData.checkLocation"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="检查专业"
        prop="checkPlanCategory"
        :rules="[{ required: true, message: '请选择检查专业', trigger: 'change' }]"
      >
        <el-radio-group v-model="changeData.checkPlanCategory">
          <el-radio
            v-for="item in $dictUtils.getDictList('check_plan_category')"
            :key="item.id"
            :label="+item.dictCode"
          >
            {{ item.dictName }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- <el-form-item label="所属公司" prop="companyId" :rules="[{ required: true, message: '请选择所属公司', trigger: 'change' }]">
        <TreeSelect
          style="width: 250px"
          ref="companySelect"
          :list="companyData"
          :props="{
            value: 'id',
            label: 'companyName',
            children: 'children'
          }"
          :value="changeData.companyId"
          :label="changeData.companyName"
          @getValue="companyChangeEvt"
        />
      </el-form-item> -->
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="changeData.remark"
          type="textarea"
          resize="none"
          :rows="4"
          style="width: 780px"
        />
      </el-form-item>
      <el-form-item
        label="检查频率"
        prop="frequencyType"
        :rules="[{ required: true, message: '请选择检查频率', trigger: 'change' }]"
      >
        <div style="width: 200px">
          <el-radio-group v-model="changeData.frequencyType">
            <el-radio :label="1">
              临时
            </el-radio>
            <el-radio :label="2">
              周期
            </el-radio>
          </el-radio-group>
        </div>
      </el-form-item>
      <!-- 临时 -->
      <template v-if="changeData.frequencyType == 1">
        <el-form-item
          label="检查日期"
          prop="planStartDateTime"
          :rules="[
            {
              required: true,
              message: '请选择检查开始日期',
              trigger: 'change',
            },
          ]"
        >
          <el-date-picker
            v-model="changeData.planStartDateTime"
            type="datetime"
            value-format="timestamp"
            placeholder="开始时间"
            :picker-options="pickerOptions"
          />
          <span style="margin: 0 0 0 10px">至</span>
        </el-form-item>
        <el-form-item
          label=""
          prop="planEndDateTime"
          :rules="[
            {
              required: true,
              message: '请选择检查结束日期',
              trigger: 'change',
            },
            {
              type: 'number',
              min: changeData.planStartDateTime,
              message: '不得晚于开始时间',
              trigger: 'change',
            },
          ]"
        >
          <el-date-picker
            v-model="changeData.planEndDateTime"
            type="datetime"
            value-format="timestamp"
            placeholder="结束时间"
            :picker-options="pickerOptions"
          />
        </el-form-item>
      </template>
      <!-- 周期 -->
      <template v-if="changeData.frequencyType == 2">
        <el-form-item
          label="检查日期"
          prop="cycleYear"
          :rules="[{ required: true, message: '请设置周期', trigger: 'blur' }]"
        >
          <el-button
            type="primary"
            @click="setCycleDateClick"
          >
            设置周期
          </el-button>
        </el-form-item>
      </template>
      <el-form-item
        label="检查级别"
        prop="controlHierarchy"
        :rules="[{ required: true, message: '请选择检查级别', trigger: 'change' }]"
      >
        <el-radio-group v-model="changeData.controlHierarchy">
          <el-radio
            v-for="item in $dictUtils.getDictList('control_level')"
            :key="item.id"
            :label="item.dictCode"
            :disabled="item.dictCode == '5'"
          >
            {{ item.dictName }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="异常提醒">
        <div
          class="pick-box"
          style="width: 780px"
        >
          <el-button
            type="primary"
            @click="pickPeopleClick('notic')"
          >
            选择人员
          </el-button>
          <el-tag
            v-for="(item, index) in changeData.remindUserList"
            :key="item.userId"
            class="pick-box-tag"
            :closable="editable"
            @close="removePeople(index, 'notic')"
          >
            {{ item.userFullName }}
          </el-tag>
        </div>
      </el-form-item>
      <el-form-item
        label="检查人员"
        prop="checkUserList"
        :rules="[{ required: true, message: '请选择人员', trigger: 'change' }]"
      >
        <div
          class="pick-box"
          style="width: 780px"
        >
          <el-button
            type="primary"
            @click="pickPeopleClick('check')"
          >
            选择人员
          </el-button>
          <el-tag
            v-for="(item, index) in changeData.checkUserList"
            :key="item.userId"
            class="pick-box-tag"
            :closable="editable"
            @close="removePeople(index, 'check')"
          >
            {{ item.userFullName }}
          </el-tag>
        </div>
      </el-form-item>
      <el-form-item
        label="检查表"
        prop="checkContentList"
        :rules="[{ required: true, message: '请选择检查表', trigger: 'change' }]"
      >
        <div class="form-box">
          <el-button
            v-if="editable"
            type="primary"
            style="margin: 0 0 10px 0"
            :disabled="loadingTable"
            @click="pickTableClick"
          >
            选择检查表
          </el-button>
          <!-- 表格 -->
          <el-table
            v-loading="loadingTable"
            style="width: 780px"
            :data="changeData.checkContentList"
            :header-cell-style="{ borderLeft: 'none', borderRight: 'none' }"
            align="center"
          >
            <el-table-column
              label="序号"
              align="center"
              type="index"
              width="50"
            />
            <el-table-column
              label="检查内容"
              align="center"
              prop="checkContent"
            />
            <el-table-column
              label="检查依据"
              align="center"
              prop="checkBasis"
            />
            <el-table-column
              label="建议等级"
              align="center"
              prop="recommendedLevel"
            >
              <template slot-scope="scope">
                <span>{{
                  $dictUtils.getDictLabelById('suggest_level', scope.row.recommendedLevel, '--')
                }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>
    </el-form>
    <!-- 底部按钮 -->
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 10px 0 0"
        @click="cancelClick"
      >
        取消
      </el-button>
      <el-button
        v-if="editable"
        size="medium"
        type="primary"
        @click="submitClick"
      >
        确认保存
      </el-button>
    </div>
    <!-- 设置日期弹窗 -->
    <el-dialog
      class="normal-dialog"
      title="设置周期"
      :visible.sync="showDateDialog"
      width="800px"
      append-to-body
      :close-on-click-modal="false"
    >
      <PickCycleDate
        v-if="showDateDialog"
        v-bind="dateProp"
        @close="closeDateEvt"
      />
    </el-dialog>
    <!-- 选择人员弹窗 -->
    <el-dialog
      class="fixed-dialog"
      title="选择人员"
      :visible.sync="showPeopleDialog"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <PickPeople
        v-if="showPeopleDialog"
        v-bind="peopleProp"
        @close="closePeopleEvt"
      />
    </el-dialog>
    <!-- 选择检查表弹窗 -->
    <el-dialog
      class="fixed-dialog"
      title="选择检查表"
      :visible.sync="showTableDialog"
      width="800px"
      append-to-body
      :close-on-click-modal="false"
    >
      <PickSafeTable
        v-if="showTableDialog"
        @close="closeTableEvt"
      />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.checkPlan-info {
  height: 100%;

  .pick-box {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    .pick-box-tag {
      margin: 0 0 0 5px;
    }
  }

  .form-box {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }
}
</style>
