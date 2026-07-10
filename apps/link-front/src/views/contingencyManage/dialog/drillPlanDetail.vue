/* * @Author: yangjie 演练计划新增、修改弹框 * @Date: 2023-03-14 14:55:13 */
<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import UserSelectDia from '@/components/userSelect/UserSelectDialog'
import { queryPlan } from '@/http/contingency/contingencyPlan.js' // 应急预案接口路径
import {
  addDrillPlan,
  getByIdDrillPlan,
  updateDrillPlan,
} from '@/http/contingency/drillPlan.js' // 演练计划接口路径
import { upLoadImg } from '@/http/manage-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api.js'
import { getUserByDeptIdAndStatus } from '@/http/user-api.js'
import { showFileWindow } from '@/utils/checkFile.js'
import FileUpload from '@/views/common-ui/FileUpload'

export default {
  components: {
    TreeSelect,
    FileUpload,
    UserSelectDia,
  },
  data() {
    return {
      visible: false,
      loading: false,
      colWidth: 12,
      departList: [], // 部门列表
      teamTypeOptions: {}, // 队伍类型字典信息
      dataRule: {
        drillName: [{ required: true, message: '计划名称不能为空', trigger: 'blur' }],
        companyId: [{ required: true, message: '所属公司不能为空', trigger: 'blur' }],
        drillRange: [
          {
            required: true,
            message: '演练参与人员范围不能为空',
            trigger: 'blur',
          },
        ],
        drillNumber: [
          {
            required: true,
            message: '演练参与人数不能为空',
            trigger: 'change',
          },
        ],
        drillObject: [
          {
            type: 'array',
            required: true,
            message: '参演对象不能为空',
            trigger: 'change',
          },
        ],
        level: [{ required: true, message: '层级不能为空', trigger: 'blur' }],
        dutyDept: [{ required: true, message: '负责部门不能为空', trigger: 'blur' }],
        drillTime: [{ required: true, message: '演练时间不能为空', trigger: 'blur' }],
        planType: [{ required: true, message: '预案类型不能为空', trigger: 'blur' }],
        emergencyPlanId: [{ required: true, message: '演练依据不能为空', trigger: 'blur' }],
        drillWay: [{ required: true, message: '演练方式不能为空', trigger: 'blur' }],
        isAgree: [],
        agreeMsg: [],
      },
      inputFormCheck: {
        isAgree: '同意',
        agreeMsg: '',
      },
      tableData: [],
      DepartmentTypeList: [],
      method: '',
      saferRules: {},
      inputForm: {
        drillName: '',
        companyId: '',
        drillRange: [],
        drillNumber: '',
        drillObject: [],
        level: '',
        dutyDept: '',
        drillTime: '',
        planType: '',
        drillItem: '', // 应急预案name
        emergencyPlanId: '', // 应急预案id
        drillWay: '',
        remark: '',
      },
      itemScoreList: [],
      fileProp: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 1, // 最大文件上传数量
        deleteFront: true,
        editable: true,
      },
      levelOptions: [], // 层级类型
      drillAccordingOptions: [], // 演练依据
      planTypeOptions: [], // 预案类型
      drilWayOptions: [], // 演练方式
      dutyPersonName: '', // 演练对象input循环的字符串名字
      dutyPersonList: [],
      depList: [],
      drillItemOptions: [],
      userData: {},
    }
  },
  created() {
    const userData = JSON.parse(sessionStorage.getItem('user'))
    this.userData = userData
    this.inputForm.companyId = userData.companyId
    this.inputForm.companyName = userData.companyName
    this.inputForm.dutyDept = userData.departTypeDepartId
    this.inputForm.dutyDeptName = userData.departTypeDepartName
    this.getDepList()
    Promise.all([getDepartListSimple()])
      .then((res) => {
        this.departList = res[0].data.result || []
      })
      .catch((err) => {
        this.$message.error('获取列表失败')
      })
  },
  methods: {
    showFileWindow,
    // 选择预案类型获取演练依据
    changePlanType() {
      this.drillItemOptions = []
      this.inputForm.drillItem = ''
      this.$set(this.inputForm, 'emergencyPlanId', '')
      if (this.inputForm.planType) {
        queryPlan({
          planType: this.inputForm.planType,
          flowCore: '审核通过',
          depId: this.inputForm.dutyDept,
        }).then((res) => {
          if (res.success) {
            this.drillItemOptions = res.result.list || []
          }
        })
      }
    },
    // 按部门id查询部门下所有人员
    getPersonList() {
      this.isLoading = true
      this.inputForm.drillNumber = 0
      this.inputForm.drillObject = []
      this.dutyPersonName = ''
      if (this.inputForm.drillRange) {
        this.inputForm.drillRange.forEach((item) => {
          getUserByDeptIdAndStatus({ deptId: item, userStatusList: [1] })
            .then((res) => {
              if (res.data.success) {
                this.inputForm.drillNumber += res.data.result.length
              }
              else {
                this.$message.warning(res.data.message || '获取负责人列表失败')
              }
            })
            .catch((err) => {
              this.$message.error('获取负责人列表出错', err)
            })
            .finally(() => {
              this.isLoading = false
            })
        })
      }
    },
    // 按公司id查询公司下所有部门
    getDepList() {
      this.isLoading = true
      getAllDepartByCompanyFn(this.inputForm.companyId)
        .then((res) => {
          if (res.data.success) {
            this.depList = res.data.result
          }
          else {
            this.$message.warning(res.data.message || '获取部门列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取部门列表出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    // 参演对象弹窗
    openUserSelectDialog() {
      this.$refs.UserSelectDialog.init()
      this.dutyPersonList = this.inputForm.drillObject
    },
    // 参演对象信息回调
    userIdSubmit(Selections) {
      if (!Selections) {
        return
      }
      const dutyPersonName = []
      Selections.forEach((item) => {
        dutyPersonName.push(item.fullName)
      })
      this.dutyPersonName = dutyPersonName.toString()
      this.inputForm.drillObject = Selections.map((item) => {
        return {
          id: item.id,
          fullName: item.fullName,
        }
      })
      this.inputForm.drillNumber = this.inputForm.drillObject.length
    },
    closeDialog() {
      this.dutyPersonName = ''
      this.dutyPersonList = []
      this.fileProp.oldFileList = []
      this.$refs.inputForm.resetFields()
      if (this.method == 'check') {
        this.$refs.inputFormCheck.resetFields()
      }
    },
    init(row, method) {
      this.visible = true
      this.method = method
      if (this.method == 'check') {
        this.dataRule.isAgree = [{ required: true, message: '审批结果不能为空', trigger: 'blur' }]
        this.dataRule.agreeMsg = [{ required: true, message: '审批意见不能为空', trigger: 'blur' }]
      }
      if (row) {
        if (row.docPath) {
          this.fileProp.oldFileList = [
            {
              originalName: row.docPath,
              attachmentName: row.docPath,
              filePath: row.docPath,
            },
          ]
        }
        this.getByIdDrillPlanFn(row.id)
      }
    },
    getByIdDrillPlanFn(id) {
      getByIdDrillPlan(id).then((data) => {
        this.inputForm = data.result
        // this.inputForm.dutyDept = this.userData.departTypeDepartId;
        // this.inputForm.dutyDeptName = this.userData.departTypeDepartName;

        // 请求应急预案列表接口
        if (this.inputForm.planType) {
          queryPlan({
            planType: this.inputForm.planType,
            flowCore: '审核通过',
            depId: this.inputForm.dutyDept,
          }).then((res) => {
            if (res.success) {
              this.drillItemOptions = res.result.list || []

              // 获取演练依据文档地址
              const eId = this.inputForm.emergencyPlanId
              if (eId) {
                for (let i = 0; i < this.drillItemOptions.length; i++) {
                  if ((this.drillItemOptions[i].id = eId)) {
                    this.inputForm.eDocPath = this.drillItemOptions[i].docPath || ''
                    break
                  }
                }
              }
            }
          })
        }
        this.inputForm.drillObject
        && (this.inputForm.drillObject = JSON.parse(this.inputForm.drillObject))
        // 回显用户名以及用户数据
        const dutyPersonName = []
        this.inputForm.drillObject.forEach((data) => {
          if (data.id) {
            dutyPersonName.push(data.fullName)
          }
        })
        this.inputForm.drillRange = this.StrChangeArr(this.inputForm.drillRange)
        this.dutyPersonList = this.inputForm.drillObject || []
        this.dutyPersonName = dutyPersonName.toString()
      })
    },
    uploadEvt(fileList) {
      if (fileList.length) {
        upLoadImg(fileList[0], 'DOC_PATH').then(({ data }) => {
          if (data.success) {
            this.inputForm.docPath = data.result
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.inputForm.docPath = ''
      }
    },
    // 删除附件
    delDocPath() {
      this.inputForm.docPath = ''
    },
    StrChangeArr(str) {
      let arr = []
      if (str) {
        arr = str.split(';')
      }
      return arr
    },
    ArrChangeStr(arr) {
      let str = ''
      if (arr.length > 0) {
        arr.forEach((item) => {
          str += `${item};`
        })
        str = str.slice(0, -1)
      }
      return str
    },
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          // this.loading = true
          let params, funcFn
          params = Object.assign({}, this.inputForm)
          params.drillObject = JSON.stringify(params.drillObject)
          params.drillNumber = Number(params.drillNumber)
          params.drillRange = this.ArrChangeStr(params.drillRange)
          if (this.method === 'check') {
            this.$refs.inputFormCheck.validate((valid) => {
              if (valid) {
                params = Object.assign(params, this.inputFormCheck)
                funcFn = updateDrillPlan // 编辑
              }
              else {
                this.loading = false
                return false
              }
            })
          }
          else if (this.method === 'edit') {
            funcFn = updateDrillPlan // 编辑
          }
          else {
            funcFn = addDrillPlan // 新增
          }

          funcFn
          && funcFn(params)
            .then((data) => {
              if (data.success) {
                this.$message.success(data.message || '提交成功')
                this.$emit('refreshList') // 执行回调函数
                this.visible = false
                this.$emit('getDataFX', this.inputForm.drillName)
              }
              else {
                this.$message.warning(data.message || '提交失败')
              }
            })
            .catch(() => {
              this.$message.error('提交失败')
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
    // 应急预案change事件
    yuAnFn(v) {
      const tar = this.drillItemOptions.find(item => item.id === v)
      if (tar) {
        this.inputForm.drillItem = tar.planName
        this.inputForm.eDocPath = tar.docPath || ''
      }
      else {
        this.inputForm.drillItem = ''
        this.inputForm.eDocPath = ''
      }
    },
    // 查看所选演练依据的附件
    seeEDoc() {
      if (this.inputForm.eDocPath) {
        this.showFileWindow(this.inputForm.eDocPath)
      }
      else {
        this.$message.warning('未提交附件')
      }
    },
  },
}
</script>

<template>
  <el-dialog
    :title="`${
      method == 'add' ? '新增' : method == 'edit' ? '修改' : method == 'view' ? '查看' : '审核'
    }演练计划`"
    :close-on-click-modal="false"
    width="800px"

    :visible.sync="visible"
    class="normal-dialog"
    append-to-body
    @close="closeDialog"
  >
    <el-form
      ref="inputForm"
      v-loading="loading"
      :disabled="method === 'view' || method === 'check'"
      :model="inputForm"
      :rules="dataRule"
      label-width="120px"
      @submit.native.prevent
    >
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="所属公司"
            prop="companyId"
          >
            <TreeSelect
              ref="officeTree"
              disabled
              class="small-box"
              :props="{
                value: 'id', // ID字段名
                label: 'companyName', // 显示名称
                children: 'children', // 子级字段名
              }"
              url="sysCompany/getSubordinateCompany"
              :value="inputForm.companyId"
              :clearable="true"
              :accordion="true"
            />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="负责部门"
            prop="dutyDept"
          >
            <el-select
              v-model="inputForm.dutyDept"
              disabled
              style="width: 100%"
            >
              <el-option
                v-for="item in departList"
                :key="item.id"
                :label="item.departmentName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col>
          <el-form-item
            label="计划名称"
            prop="drillName"
          >
            <el-input v-model="inputForm.drillName" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="演练参与人员范围"
            prop="drillRange"
          >
            <el-select
              v-model="inputForm.drillRange"
              style="width: 100%"
              multiple
              clearable
              filterable
              allow-create
              default-first-option
              placeholder="请选择演练参与人员范围"
              @change="getPersonList"
            >
              <el-option
                v-for="item in depList"
                :key="item.id"
                :label="item.departmentName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="colWidth">
          <el-form-item
            label="演练参与人数"
            prop="drillNumber"
          >
            <el-input
              v-model="inputForm.drillNumber"
              type="number"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col>
          <el-form-item
            label="演练对象"
            prop="drillObject"
          >
            <el-input
              v-model="dutyPersonName"
              class="big-row"
              readonly
              :disabled="inputForm.drillRange.length > 0 ? false : true"
              placeholder="点击右侧选择"
            >
              <el-button
                slot="append"
                icon="el-icon-search"
                @click="openUserSelectDialog()"
              />
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="演练时间"
            prop="drillTime"
          >
            <el-date-picker
              v-model="inputForm.drillTime"
              value-format="yyyy-MM-dd hh:mm:ss"
              style="width: 100%"
              type="date"
              placeholder="选择日期"
            />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="预案类型"
            prop="planType"
          >
            <el-select
              v-model="inputForm.planType"
              placeholder="请选择"
              style="width: 100%"
              @change="changePlanType"
            >
              <el-option
                v-for="item in $dictUtils.getDictList('planType')"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col
          :span="colWidth"
          class="ylyj"
        >
          <el-form-item
            label="演练依据"
            prop="emergencyPlanId"
          >
            <el-select
              v-model="inputForm.emergencyPlanId"
              placeholder="请选择"
              style="width: 100%"
              @change="yuAnFn"
            >
              <el-option
                v-for="item in drillItemOptions"
                :key="item.id"
                :label="item.planName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-button
            v-if="inputForm.emergencyPlanId"
            type="text"
            class="see-fj"
            @click="seeEDoc"
          >
            查看选择附件
          </el-button>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="演练方式"
            prop="drillWay"
          >
            <el-select
              v-model="inputForm.drillWay"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in $dictUtils.getDictList('drilWay')"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-form-item
          label="上传附件"
          style="width: 500px"
          prop="docPath"
        >
          <FileUpload
            v-if="visible"
            v-bind="fileProp"
            @upload="uploadEvt"
            @delSucc="delDocPath"
          />
        </el-form-item>
      </el-row>

      <el-row>
        <el-col>
          <el-form-item
            label="备注"
            prop="remark"
          >
            <el-input
              v-model="inputForm.remark"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-form
      v-if="method == 'check'"
      ref="inputFormCheck"
      v-loading="loading"
      :model="inputFormCheck"
      :rules="dataRule"
      label-width="120px"
    >
      <el-form-item
        label="审批结果"
        prop="isAgree"
      >
        <el-radio-group v-model="inputFormCheck.isAgree">
          <el-radio label="同意">
            同意
          </el-radio>
          <el-radio label="拒绝">
            拒绝
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        label="审批意见"
        prop="agreeMsg"
      >
        <el-input
          v-model="inputFormCheck.agreeMsg"
          type="textarea"
          placeholder="请输入内容"
          maxlength="30"
        />
      </el-form-item>
    </el-form>

    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        v-if="method !== 'view'"
        size="small"
        type="primary"
        :loading="loading"
        @click="doSubmit()"
      >确定</el-button>
    </span>

    <!-- 参演对象弹窗 -->
    <UserSelectDia
      ref="UserSelectDialog"
      :departmentIds="inputForm.drillRange"
      :selectData="dutyPersonList"
      @doSubmit="userIdSubmit"
    />
  </el-dialog>
</template>

<style lang="scss" scoped>
.ylyj ::v-deep {
  position: relative;
  .el-form-item {
    margin-bottom: 30px;
  }
  .see-fj {
    position: absolute;
    left: 120px;
    bottom: 0;
  }
}
</style>
