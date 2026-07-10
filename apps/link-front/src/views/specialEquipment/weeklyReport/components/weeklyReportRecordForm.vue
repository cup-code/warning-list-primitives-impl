<!-- 特种设备周报台账表单 -->
<script>
import moment from 'moment'
import { saveWeeklyReportRecord } from '@/http/specialEquipment/weeklyReport-api'
import PickPeople from '@/views/common-ui/PickPeople.vue'

export default {
  name: 'weeklyReportRecordForm',
  components: {
    PickPeople,
  },
  props: {
    /**
     * 所属记录
     */
    dataRecord: Object,
    /**
     * 模板记录
     */
    templateRecord: Object,
    /**
     * 操作类型
     */
    opType: String,
    /**
     * 是否开始加载
     */
    isLoad: Boolean,
  },
  data() {
    return {
      labelPosition: 'right',
      colWidth: 24,
      colItemWidth: 24,
      isLoading: false,
      templateData: [],
      formData: {},
      inputForm: {
        id: '',
        companyId: '',
        departmentId: '',
        departmentName: '',
        reportTitle: '',
        templateId: '',
        reportContent: [
          {
            equipmentType: '',
            equipmentName: '',
            equipmentUniqueCode: '',
            operators: [],
            situationStatement: '',
            statusEvaluation: '',
          },
        ],
        isEquipmentAdd: '',
        isEquipmentMaintenance: '',
        isEquipmentProblem: '',
        isNextWeekMaintenance: '',
        otherQuestions: '',
      },
      inputFormRule: {
        operators: [{ required: true, message: '操作人员不能为空', trigger: 'change' }],
        situationStatement: [
          {
            required: true,
            message: '本周维修情况说明不能为空',
            trigger: 'blur',
          },
        ],
        statusEvaluation: [
          {
            required: true,
            message: '本周运行状态评价不能为空',
            trigger: 'blur',
          },
        ],
        isEquipmentAdd: [
          {
            required: true,
            message: '有无新增特种、计量设备情况不能为空',
            trigger: 'blur',
          },
        ],
        isEquipmentMaintenance: [
          {
            required: true,
            message: '本周有无重要设备检维修不能为空',
            trigger: 'blur',
          },
        ],
        isEquipmentProblem: [
          {
            required: true,
            message: '设备有无故障状态、带病运行情况不能为空',
            trigger: 'blur',
          },
        ],
        isNextWeekMaintenance: [
          {
            required: true,
            message: '下周有无检维修计划不能为空',
            trigger: 'blur',
          },
        ],
        otherQuestions: [{ required: true, message: '其他问题不能为空', trigger: 'blur' }],
      },
      showPeopleDialog: false, // 选择人员弹框
      peopleProp: {}, // 选择人员组件传递信息
    }
  },
  methods: {
    /**
     * 初始化
     */
    init() {
      const me = this
      if (Object.keys(me.templateRecord).length !== 0) {
        me.formData = me.templateRecordConverter(me.templateRecord)
      }
      else {
        me.formData = me.dataRecord
      }
      this.recover(me.inputForm, me.formData)
    },
    /**
     * 格式化周报标题
     * @param titleTxt 标题文本
     */
    formatReportTitle(titleTxt) {
      return `${titleTxt}（${moment().format('YYYY-MM-DD')}）`
    },
    /**
     * 模板记录转换成周报记录
     * @param data 待转换数据
     */
    templateRecordConverter(data) {
      // console.log(data)
      const me = this
      return {
        companyId: data.companyId,
        departmentId: data.departmentId,
        departmentName: data.departmentName,
        templateId: data.id,
        reportTitle: me.formatReportTitle(data.templateTitle),
        reportContent: data.equipmentList.map((item, index) => {
          return {
            equipmentType: item.equipmentType,
            equipmentName: item.equipmentName,
            equipmentUniqueCode: item.equipmentUniqueCode,
            operators: [],
            situationStatement: '',
            statusEvaluation: '',
          }
        }),
      }
    },
    /**
     * 重置表单项
     */
    resetFields() {
      const me = this
      me.inputForm = me.$options.data().inputForm
      me.$refs.inputForm.resetFields()
    },
    // 选择操作人员
    pickPeopleClick(row) {
      this.currentRow = row
      this.peopleProp.oldPickList = row.operators
      this.peopleProp.listType = 'company'
      // this.peopleProp.departmentId = this.inputForm.departmentId
      this.showPeopleDialog = true
    },
    // 移除操作人员
    removePeople(index, row) {
      row.operators.splice(index, 1)
    },
    // 选择人员后回调
    closePeopleEvt(params) {
      if (params) {
        this.currentRow.operators = params.data.map((item) => {
          return {
            id: item.id,
            fullName: item.fullName,
          }
        })
      }
      this.showPeopleDialog = false
    },
    /**
     * 保存
     * @param successCallback 保存成功后回调
     */
    save(successCallback) {
      const me = this
      me.$refs.inputForm.validate((valid) => {
        if (valid) {
          me.isLoading = true
          saveWeeklyReportRecord(me.inputForm)
            .then((r) => {
              const res = r.data
              if (res.success) {
                me.$message.success(res.message)
                if (typeof successCallback === 'function') {
                  successCallback.call(me)
                }
                return
              }
              me.$message.warning(res.message)
            })
            .catch((e) => {
              me.$message.error(`保存异常：${e}`)
            })
            .finally(() => {
              me.isLoading = false
            })
        }
      })
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
        <span style="font-size: medium; font-weight: bold">{{ inputForm.reportTitle }}</span>
      </div>

      <div class="wrapper">
        <el-form
          ref="inputForm"
          v-loading="isLoading"
          :model="inputForm"
          :rules="inputFormRule"
          :label-position="labelPosition"
          label-width="100px"
          :disabled="opType === 'look'"
        >
          <el-row>
            <el-col :span="colWidth">
              <el-table
                ref="weeklyReportRecordTable"
                :data="inputForm.reportContent"
                :header-cell-style="{ background: '#f5f5f5' }"
                style="margin-bottom: 20px"
                max-height="100%"
                row-key="id"
                highlight-current-row
              >
                <el-table-column
                  align="center"
                  label="序号"
                  min-width="50"
                  type="index"
                />
                <el-table-column
                  label="设备类型"
                  align="center"
                  prop="equipmentType"
                  width="150"
                >
                  <template #default="scope">
                    <span>{{
                      $dictUtils.getDictLabel(
                        'special_equipment_type',
                        scope.row.equipmentType,
                        '--',
                      )
                    }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  label="设备名称"
                  align="center"
                  prop="equipmentName"
                  width="150"
                />
                <el-table-column
                  label="设备编码"
                  align="center"
                  prop="equipmentUniqueCode"
                  width="200"
                />
                <el-table-column
                  label="操作人员"
                  align="center"
                  prop="operators"
                >
                  <template #default="{ row, $index }">
                    <el-form-item
                      :prop="`reportContent.${$index}.operators`"
                      :rules="inputFormRule.operators"
                      label-width="0"
                    >
                      <el-button
                        v-if="opType !== 'look'"
                        type="primary"
                        @click="pickPeopleClick(row)"
                      >
                        选择人员
                      </el-button>
                      <el-tag
                        v-for="(item, index) in inputForm.reportContent[$index].operators"
                        :key="item.id"
                        class="pick-box-tag"
                        :closable="opType !== 'look'"
                        @close="removePeople(index, row)"
                      >
                        {{ item.fullName }}
                      </el-tag>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column
                  label="本周维修情况说明"
                  align="center"
                  prop="situationStatement"
                >
                  <template #default="{ row, $index }">
                    <el-form-item
                      :prop="`reportContent.${$index}.situationStatement`"
                      :rules="inputFormRule.situationStatement"
                      label-width="0"
                    >
                      <el-input
                        v-model="inputForm.reportContent[$index].situationStatement"
                        type="textarea"
                        :rows="2"
                        style="margin-top: 15px"
                        maxlength="200"
                        show-word-limit
                      />
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column
                  label="本周运行状态评价"
                  align="center"
                  prop="statusEvaluation"
                  width="250"
                >
                  <template #default="{ row, $index }">
                    <el-form-item
                      :prop="`reportContent.${$index}.statusEvaluation`"
                      :rules="inputFormRule.statusEvaluation"
                      label-width="0"
                    >
                      <el-input
                        v-model="inputForm.reportContent[$index].statusEvaluation"
                        type="textarea"
                        :rows="2"
                        style="margin-top: 15px"
                        maxlength="200"
                        show-word-limit
                      />
                    </el-form-item>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="colWidth">
              <el-form-item
                label="有无新增特种、计量设备"
                prop="isEquipmentAdd"
              >
                <el-col :span="colItemWidth">
                  <el-input
                    v-model="inputForm.isEquipmentAdd"
                    type="textarea"
                    :rows="5"
                    maxlength="1000"
                    show-word-limit
                  />
                </el-col>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="colWidth">
              <el-form-item
                label="本周有无重要设备检维修"
                prop="isEquipmentMaintenance"
              >
                <el-col :span="colItemWidth">
                  <el-input
                    v-model="inputForm.isEquipmentMaintenance"
                    type="textarea"
                    :rows="5"
                    maxlength="1000"
                    show-word-limit
                  />
                </el-col>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="colWidth">
              <el-form-item
                label="设备有无故障状态、带病运行"
                prop="isEquipmentProblem"
              >
                <el-col :span="colItemWidth">
                  <el-input
                    v-model="inputForm.isEquipmentProblem"
                    type="textarea"
                    :rows="5"
                    maxlength="1000"
                    show-word-limit
                  />
                </el-col>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="colWidth">
              <el-form-item
                label="下周有无检维修计划"
                prop="isNextWeekMaintenance"
              >
                <el-col :span="colItemWidth">
                  <el-input
                    v-model="inputForm.isNextWeekMaintenance"
                    type="textarea"
                    :rows="5"
                    maxlength="1000"
                    show-word-limit
                  />
                </el-col>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="colWidth">
              <el-form-item
                label="其他问题"
                prop="otherQuestions"
              >
                <el-col :span="colItemWidth">
                  <el-input
                    v-model="inputForm.otherQuestions"
                    type="textarea"
                    :rows="5"
                    maxlength="1000"
                    show-word-limit
                  />
                </el-col>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-card>
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
  </div>
</template>
