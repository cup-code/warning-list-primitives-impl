<!-- 特种设备周报模板详细信息 -->
<script>
import SelectTree from '@/components/treeSelect/treeSelect'
import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api'
import { saveWeeklyReportTemplate } from '@/http/specialEquipment/weeklyReport-api'
import { recoverNotNull } from '@/utils/fmUtils'
import PickPeople from '@/views/common-ui/PickPeople'
import CheckedSpecialEquipmentList from '@/views/specialEquipment/weeklyReport/components/checkedSpecialEquipmentList'

export default {
  name: 'specialEquipmentWeeklyReportTemplateDetail',
  components: {
    SelectTree,
    PickPeople,
    CheckedSpecialEquipmentList,
  },
  data() {
    const validateEquipmentList = (rule, value, callback) => {
      if (value.length === 0) {
        return callback(new Error('特种设备清单不能为空'))
      }
      callback()
    }

    return {
      labelPosition: 'right',
      colWidth: 12,
      colItemWidth: 10,
      companyTreeData: [],
      dataRecord: null,
      opType: '',
      reportWriterOptions: [],
      inputForm: {
        id: '',
        companyId: '',
        departmentId: '',
        departmentName: '',
        templateTitle: '',
        templateStatus: 0,
        reportWriter: [],
        equipmentList: [],
      },
      inputFormRule: {
        companyId: [{ required: true, message: '所属企业不能为空', trigger: 'change' }],
        departmentId: [{ required: true, message: '所属部门不能为空', trigger: 'change' }],
        templateTitle: [{ required: true, message: '模板标题不能为空', trigger: 'blur' }],
        reportWriter: [{ required: true, message: '填报人不能为空', trigger: 'change' }],
        equipmentList: [{ required: true, trigger: 'blur', validator: validateEquipmentList }],
      },
      isLoading: false,
      isDialogVisible: false,
      isDialogLoading: false,
      queryForm: {
        pageNum: 1,
        pageSize: 10,
        companyId: '',
        departmentId: '',
      },
      tableData: [],
      total: 0,
      showPeopleDialog: false, // 选择人员弹框是否显示
      peopleProp: {}, // 选择人员组件传递信息
      departmentList: [],
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    /**
     * 初始化
     */
    init() {
      const me = this
      const params = me.$route.params

      if (params.companyTreeData) {
        const treeData = JSON.parse(params.companyTreeData)
        if (Object.keys(treeData).length !== 0) {
          me.companyTreeData = treeData
        }
      }
      if (params.dataRecord) {
        me.dataRecord = params.dataRecord
      }
      if (params.opType) {
        me.opType = params.opType
      }

      if (me.dataRecord) {
        this.getAllDepartByCompany(me.dataRecord.companyId)
        this.$nextTick(() => {
          recoverNotNull(me.inputForm, me.dataRecord)
        })
      }
      else {
        const companyId = this.$store.state.user.user.companyId
        this.getAllDepartByCompany(companyId)
        this.$nextTick(() => {
          this.inputForm.companyId = companyId
        })
      }
    },
    /**
     * 返回按钮单击
     */
    backClick() {
      this.$router.go(-1)
    },
    /**
     * 公司选择完回调
     * @param value
     * @param title
     * @param data
     */
    companySelectedCallback(value, title, data) {
      const me = this
      me.inputForm.companyId = value
      this.inputForm.departmentId = ''
      this.inputForm.reportWriter = []
      this.getAllDepartByCompany(value)
      me.$refs.companyTree.closeSelect()
    },
    /**
     * 部门选择完回调
     * @param value
     * @param title
     * @param data
     */
    departmentSelectedCallback(value) {
      this.inputForm.departmentId = value
      const currentDepart
        = this.departmentList.find((item) => {
          return item.id === value
        }) || {}
      this.inputForm.departmentName = currentDepart.departmentName
      this.inputForm.reportWriter = []
    },
    // 选择填报人员
    pickPeopleClick() {
      if (!this.inputForm.departmentId) {
        this.$message.warning('请先选择责任组织')
        return
      }
      this.peopleProp.oldPickList = this.inputForm.reportWriter
      this.peopleProp.departmentId = this.inputForm.departmentId
      this.showPeopleDialog = true
    },
    /* 选择人员弹窗回调 */
    closePeopleEvt(res) {
      if (res) {
        const params = res.data
        if (params) {
          this.inputForm.reportWriter = params.map((item) => {
            return {
              id: item.id,
              fullName: item.fullName,
            }
          })
        }
      }
      this.showPeopleDialog = false
    },
    /* 移除人员回调 */
    removePeople(index) {
      this.inputForm.reportWriter.splice(index, 1)
    },
    // 移除设备
    removeClick(id) {
      this.inputForm.equipmentList = this.inputForm.equipmentList.filter(item => item.id !== id)
    },
    /**
     * 保存按钮单击
     */
    saveClick() {
      const me = this
      me.$refs.inputForm.validate((valid) => {
        if (valid) {
          me.isLoading = true
          saveWeeklyReportTemplate(me.inputForm)
            .then((r) => {
              const res = r.data
              if (res.success) {
                me.$message.success(res.message)
              }
              else {
                me.$message.warning(res.message)
              }
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
    /**
     * 获取分页表格数据
     */
    getTableData() {
      const me = this
      // me.isLoading = true
      me.tableData = []
    },
    /**
     * 弹窗按钮单击
     */
    dialogPopupClick() {
      const me = this
      me.$refs.inputForm.validateField('companyId', (error) => {
        me.isDialogVisible = !error
        this.$nextTick(() => {
          this.$refs.dialogCheckedSpecialEquipmentList.setSelectedList(
            this.inputForm.equipmentList || [],
          )
        })
      })
    },
    /**
     * 弹窗保存按钮单击
     */
    dialogSaveClick() {
      const me = this
      const $checkedSpecialEquipmentList = me.$refs.checkedSpecialEquipmentList
      const $dialogCheckedSpecialEquipmentList = me.$refs.dialogCheckedSpecialEquipmentList
      me.inputForm.equipmentList = $dialogCheckedSpecialEquipmentList.getAllSelectedData()
      me.isDialogVisible = false
      me.$refs.inputForm.validateField('equipmentList')
    },
    // 通过公司查部门
    getAllDepartByCompany(companyId) {
      getAllDepartByCompanyFn(companyId)
        .then(({ data }) => {
          if (data.success) {
            this.departmentList = (data.result || []).filter((item) => {
              return item.departmentType === 'DEPARTMENT'
            })
          }
        })
        .catch((err) => {
          this.$message.error(err)
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
        <span style="font-size: medium; font-weight: bold">特种设备周报模板设置</span>
        <el-button
          style="float: right; margin-left: 10px"
          @click="backClick"
        >
          返回
        </el-button>
        <el-button
          v-if="opType !== 'look'"
          style="float: right"
          type="primary"
          @click="saveClick"
        >
          保存
        </el-button>
      </div>

      <div>
        <el-form
          ref="inputForm"
          :rules="inputFormRule"
          :model="inputForm"
          :label-position="labelPosition"
          label-width="150px"
          :disabled="opType === 'look'"
        >
          <el-row>
            <el-col :span="colWidth">
              <el-form-item
                label="所属企业"
                prop="companyId"
              >
                <el-col :span="colItemWidth">
                  <SelectTree
                    ref="companyTree"
                    :props="{
                      value: 'id', // ID字段名
                      label: 'companyName', // 显示名称
                      children: 'childrenCompany', // 子级字段名
                    }"
                    :data="companyTreeData"
                    :value="inputForm.companyId"
                    :accordion="true"
                    @getValue="companySelectedCallback"
                  />
                </el-col>
              </el-form-item>
            </el-col>

            <el-col :span="colWidth">
              <el-form-item
                label="所属部门"
                prop="departmentId"
              >
                <el-col :span="colItemWidth">
                  <el-select
                    v-model="inputForm.departmentId"
                    placeholder="请选择"
                    filterable
                    style="width: 100%"
                    @change="departmentSelectedCallback"
                  >
                    <el-option
                      v-for="item in departmentList"
                      :key="item.id"
                      :label="item.departmentName"
                      :value="item.id"
                    />
                  </el-select>
                </el-col>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="colWidth">
              <el-form-item
                label="模板标题"
                prop="templateTitle"
              >
                <el-col :span="20">
                  <el-input
                    v-model="inputForm.templateTitle"
                    placeholder=""
                  />
                </el-col>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="colWidth">
              <el-form-item
                label="填报人"
                prop="reportWriter"
              >
                <div
                  class="pick-box"
                  style="width: 780px"
                >
                  <el-button
                    type="primary"
                    @click="pickPeopleClick()"
                  >
                    选择人员
                  </el-button>
                  <el-tag
                    v-for="(item, index) in inputForm.reportWriter"
                    :key="item.id"
                    class="pick-box-tag"
                    :closable="opType !== 'look'"
                    @close="removePeople(index)"
                  >
                    {{ item.fullName }}
                  </el-tag>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="colWidth">
              <el-form-item
                label="特种设备清单"
                prop="equipmentList"
              >
                <el-col :span="10">
                  <el-button
                    type="primary"
                    icon="el-icon-document-checked"
                    @click="dialogPopupClick"
                  >
                    选择特种设备
                  </el-button>
                </el-col>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-table
                :data="inputForm.equipmentList"
                :header-cell-style="{ background: '#f5f5f5' }"
                height="400px"
                highlight-current-row
              >
                <el-table-column
                  align="center"
                  label="序号"
                  min-width="50"
                  type="index"
                />
                <el-table-column
                  label="所属部门"
                  align="center"
                  prop="departmentName"
                  :show-overflow-tooltip="true"
                />
                <el-table-column
                  label="所属岗位"
                  align="center"
                  prop="workPostName"
                  :show-overflow-tooltip="true"
                />
                <el-table-column
                  label="设备类型"
                  align="center"
                  prop="equipmentType"
                  :show-overflow-tooltip="true"
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
                  :show-overflow-tooltip="true"
                />
                <el-table-column
                  label="资产号"
                  align="center"
                  prop="equipmentAssetCode"
                  :show-overflow-tooltip="true"
                />
                <el-table-column
                  label="设备号"
                  align="center"
                  prop="equipmentUniqueCode"
                  :show-overflow-tooltip="true"
                />
                <el-table-column
                  label="规格型号"
                  align="center"
                  prop="equipmentModel"
                  :show-overflow-tooltip="true"
                />
                <el-table-column
                  label="设备状态"
                  align="center"
                  prop="equipmentStatus"
                >
                  <template #default="scope">
                    <el-tag
                      v-if="scope.row.equipmentStatus === 0"
                      type="info"
                      size="medium"
                    >
                      待注册
                    </el-tag>
                    <el-tag
                      v-if="scope.row.equipmentStatus === 1"
                      type="success"
                      size="medium"
                    >
                      在用
                    </el-tag>
                    <el-tag
                      v-if="scope.row.equipmentStatus === 2"
                      type="danger"
                      size="medium"
                    >
                      报废
                    </el-tag>
                    <el-tag
                      v-if="scope.row.equipmentStatus === 3"
                      type="warning"
                      size="medium"
                    >
                      停用
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  label="操作"
                  align="center"
                  width="80"
                  fixed="right"
                >
                  <template #default="scope">
                    <el-button
                      type="text"
                      style="color: var(--ky-danger)"
                      @click="removeClick(scope.row.id)"
                    >
                      移除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-card>

    <el-dialog
      title="选择特种设备"
      class="normal-dialog"
      :visible.sync="isDialogVisible"
      width="90%"
      append-to-body
      :close-on-click-modal="false"
      top="5vh"
    >
      <CheckedSpecialEquipmentList
        ref="dialogCheckedSpecialEquipmentList"
        :company-id="inputForm.companyId"
        :is-show-search="true"
        :is-enable-operate-column="false"
      />

      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="isDialogVisible = false">关 闭</el-button>
        <el-button
          type="primary"
          @click="dialogSaveClick"
        >确 认</el-button>
      </span>
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
  </div>
</template>

<style lang="scss" scoped>
.pick-box {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  .pick-box-tag {
    margin: 0 0 0 5px;
  }
}
</style>
