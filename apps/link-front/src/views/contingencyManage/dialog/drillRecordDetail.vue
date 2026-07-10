/* * @Author: yangjie 演练记录新增、修改、查看弹框 * closeDialog@Date: 2023-03-14 14:55:13 */
<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import UserSelectDia from '@/components/userSelect/UserSelectDialog'
import {
  addDrillRecord,
  deleteProblem,
  getByIdDrillRecord,
  updateDrillRecord,
} from '@/http/contingency/drillRecord.js' // 演练记录接口路径
import { upLoadImg } from '@/http/manage-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import { showFileWindow } from '@/utils/checkFile.js'
import FileUpload from '@/views/common-ui/FileUpload'
import PickEmPlan from '../common/PickEmPlan.vue' // 选择应急预案
import PickRePlan from '../common/PickRePlan.vue' // 选择演练计划
import ContingencyProblems from '../dialog/contingencyProblems.vue'

export default {
  components: {
    TreeSelect,
    FileUpload,
    PickEmPlan,
    PickRePlan,
    ContingencyProblems,
    UserSelectDia,
  },
  data() {
    return {
      visible: false,
      loading: false,
      colWidth: 12,
      drillRecordTypeOptions: [], // 演练状态
      departList: [], // 部门列表
      showEmPlanDialog: false, // 是否选择应急预案
      showRePlanDialog: false, // 是否选择演练计划
      RePlanList: [], // 演练计划选择数组
      showProblemDialog: false, // 问题与不足弹框
      isShow: false,
      inputFormCheck: {
        rectifyStatus: '',
        rectifyNow: '',
        rectifyEvidence: '',
        accessory: '',
      },
      dataRule: {
        drillTime: [
          {
            required: true,
            message: '演练时间不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        drillState: [{ required: true, message: '演练状态不能为空', trigger: 'change' }],
        drillSite: [
          {
            required: true,
            message: '演练地点不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        companyId: [
          {
            required: true,
            message: '所属公司不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        dutyDept: [
          {
            required: true,
            message: '所属部门不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        drillWay: [
          {
            required: true,
            message: '演练方式不能为空',
            leaderNametrigger: 'blur',
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
        personNumber: [
          {
            required: true,
            message: '人员数量不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        drillPlanId: [{ required: true, message: '演练计划不能为空', trigger: 'change' }],
        drillItem: [
          {
            required: true,
            message: '应急预案不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        drillContent: [
          {
            required: true,
            message: '演练内容不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        picture: [
          {
            required: true,
            message: '上传附件不能为空',
            leaderNametrigger: 'blur',
          },
        ],
      },
      tableData: [],
      method: '',
      inputForm: {
        id: null,
        companyId: null, // 所属公司
        dutyDept: null, // 所属部门
        drillState: null, // 演练状态
        drillSite: null, // 演练地点
        personNumber: '', // 人员数量
        drillContent: null, // 演练内容
        drillWay: null, // 演练方式
        drillTime: null, // 演练时间
        drillItem: null, // 应急预案
        drillObject: [],
        drillPlanId: '', // 演练计划id
        drillPlanName: '', // 演练计划名称
        picture: '',
      },
      // 上传附件参数
      accessory: {
        editable: true,
        deleteFront: true,
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
      },
      // 演练照片参数
      picture: {
        editable: true,
        deleteFront: true,
        accept: [
          'image/png',
          'image/jpg',
          'image/jpeg',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        noticMsg: 'png/jpg/jpeg/pdf/word',
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
      },
      dutyPersonName: '',
      dutyPersonList: [],
      reviews: {
        person: [],
        materials: '',
        defend: '',
        organization: '',
        divWork: '',
        anticipation: '',
        isReport: '',
        fireAction: '',
        medicalRescue: '',
        governCooperation: '',
      },
      IsShow: false,
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

    Promise.all([getDepartListSimple()])
      .then((res) => {
        this.departList = res[0].data.result || []
      })
      .catch((err) => {
        this.$message.error('获取列表失败')
      })
    // this.getSystem()
  },
  methods: {
    showFileWindow,
    closeRePlanTag(index) {
      this.RePlanList.splice(index, 1)
      this.inputForm.drillPlanId = ''
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
      this.inputForm.personNumber = String(Selections.length)
    },
    // 清空表单数据
    closeDialog() {
      this.dutyPersonName = ''
      this.dutyPersonList = []
      this.accessory.oldFileList = []
      this.picture.oldFileList = []
      this.RePlanList = [] // 演练计划选择数组
      this.tableData = []
      this.$refs.inputForm.resetFields()
      this.reviews = this.$options.data().reviews
      if (this.method == 'check') {
        this.$refs.inputFormCheck.resetFields()
      }
    },
    toDetailClick(row, method, index) {
      this.$refs.ContingencyProblems.init(row, method, index)
    },
    // 问题与不足弹框回调
    searchFn(params) {
      if (params.index == null) {
        // 新增添加一条数据
        this.tableData.unshift(params)
      }
      else {
        // 编辑替换当前数据
        this.tableData.splice(params.index, 1, params)
      }
    },
    // 问题与不足列表删除
    delFn(row, index) {
      deleteProblem(row.id).then((res) => {
        if (res.success) {
          this.tableData.splice(index, 1)
        }
      })
    },
    getDepartmentId(value, name) {
      this.inputForm.companyId = value
      this.inputForm.companyName = name
    },
    /* 关闭演练计划回调 */
    closeRePlanEvt(result) {
      if (result) {
        this.RePlanList = result.data
      }
      if (this.RePlanList.length) {
        this.inputForm.drillItem = this.RePlanList[0].drillItem
        this.inputForm.emergencyPlanId = this.RePlanList[0].emergencyPlanId
        this.inputForm.drillPlanId = this.RePlanList[0].id
        this.inputForm.drillPlanName = this.RePlanList[0].name
      }
      this.showRePlanDialog = false
    },
    init(row, method) {
      this.visible = true
      this.method = method
      if (this.method == 'check') {
        this.dataRule.rectifyStatus = [
          { required: true, message: '整改后状态不能为空', trigger: 'blur' },
        ]
        this.dataRule.rectifyNow = [
          { required: true, message: '实际整改时间不能为空', trigger: 'blur' },
        ]
        this.dataRule.rectifyEvidence = [
          { required: true, message: '整改后证据不能为空', trigger: 'blur' },
        ]
      }
      if (row) {
        this.getByIdDrillRecordFn(row.id)
        if (row.picture) {
          this.picture.oldFileList = [
            {
              originalName: row.picture,
              attachmentName: row.picture,
              filePath: row.picture,
            },
          ]
        }
      }
      else {
        this.inputForm.id = null
      }
      this.$nextTick(() => {
        this.$refs.table.doLayout() // 解决表格错位
      })
    },
    getByIdDrillRecordFn(id) {
      getByIdDrillRecord(id).then((data) => {
        this.inputForm = {
          id: data.result.id,
          companyId: data.result.companyId, // 所属公司
          dutyDept: data.result.dutyDept, // 所属部门
          drillItem: data.result.drillItem, // 应急预案
          drillState: data.result.drillState, // 演练状态
          drillSite: data.result.drillSite, // 演练地点
          personNumber: String(data.result.personNumber), // 人员数量
          drillContent: data.result.drillContent, // 演练内容
          drillWay: data.result.drillWay, // 演练方式
          drillTime: data.result.drillTime, // 演练时间
          drillPlanId: data.result.drillPlanId, // 演练计划
          drillObject: data.result.drillObject && JSON.parse(data.result.drillObject), // 实际参演对象
          picture: data.result.picture,
        }
        // this.inputForm.dutyDept = this.userData.departTypeDepartId;
        // this.inputForm.dutyDeptName = this.userData.departTypeDepartName;
        // 实际参演对象回填
        if (this.inputForm.drillObject) {
          const dutyPersonName = []
          this.inputForm.drillObject.forEach((item) => {
            dutyPersonName.push(item.fullName)
          })
          this.dutyPersonName = dutyPersonName.toString()
        }
        // 演练计划选择数据回填
        if (data.result.drillPlanId) {
          this.RePlanList = [
            {
              id: data.result.drillPlanId,
              name: data.result.drillPlanName || '',
            },
          ]
        }
        // 演练效果评审回填
        if (data.result.reviews) {
          for (const key in data.result.reviews) {
            if (key === 'person') {
              this.reviews[key] = this.StrChangeArr(data.result.reviews[key])
            }
            else {
              this.reviews[key] = data.result.reviews[key]
            }
          }
        }
        // tableb表格数据回填
        this.tableData = data.result.problems
        // 上传文件回填
        if (data.result.accessory) {
          this.accessory.oldFileList = [
            {
              originalName: data.result.accessory,
              attachmentName: data.result.accessory,
              filePath: data.result.accessory,
            },
          ]
        }
        // if (data.result.picture) {
        //   this.picture.oldFileList = [
        //     {
        //       originalName: data.result.picture,
        //       attachmentName: data.result.picture,
        //       filePath: data.result.picture
        //     }
        //   ]
        // }
      })
    },
    /* 文件上传回调 */
    uploadEvt(fileList, type) {
      if (fileList.length) {
        upLoadImg(fileList[0], 'DOC_PATH').then(({ data }) => {
          if (data.success) {
            this.inputForm[type] = data.result
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.inputForm[type] = ''
      }
    },
    // 删除附件
    delDocPath() {
      this.inputForm.picture = ''
    },
    delDocPath1() {
      this.inputFormCheck.accessory = ''
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
          this.loading = true
          let params, funcFn
          params = Object.assign(this.inputForm, { reviews: this.reviews })
          params = JSON.parse(JSON.stringify(params))
          // 演练对象
          params.drillObject = JSON.stringify(params.drillObject)
          // 多选
          //   for (let key in params.reviews) {
          //     params.reviews[key] = this.ArrChangeStr(params.reviews[key])
          //   }
          params.reviews.person = this.ArrChangeStr(params.reviews.person)
          params.problems = this.tableData
          params.personNumber = Number(params.personNumber)

          if (this.method === 'check') {
            this.$refs.inputFormCheck.validate((valid) => {
              if (valid) {
                params = Object.assign(params, this.inputFormCheck)
                funcFn = updateDrillRecord // 编辑
              }
              else {
                this.loading = false
                return false
              }
            })
          }
          else if (this.method == 'edit') {
            funcFn = updateDrillRecord // 编辑
          }
          else {
            funcFn = addDrillRecord // 新增
          }
          funcFn
          && funcFn(params)
            .then((data) => {
              if (data.success) {
                this.visible = false
                this.$message.success(data.message || '提交成功')
                this.$emit('refreshList')
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
  },
}
</script>

<template>
  <el-dialog
    :title="`${method == 'add' ? '新增' : method == 'edit' ? '修改' : '查看'}演练记录`"
    :close-on-click-modal="false"
    width="800px"

    :visible.sync="visible"
    class="normal-dialog"
    @close="closeDialog"
  >
    <el-form
      ref="inputForm"
      v-loading="loading"
      :model="inputForm"
      :rules="dataRule"
      label-width="120px"
      :disabled="method === 'view' || method === 'check'"
      @submit.native.prevent
    >
      <div class="cell-title">
        演练记录详情
      </div>
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
              @getValue="getDepartmentId"
            />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="所属部门"
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
            label="演练地点"
            prop="drillSite"
          >
            <el-input v-model="inputForm.drillSite" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
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
                v-for="item in $dictUtils.getDictList('drillWay')"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="人员数量"
            prop="personNumber"
          >
            <el-input
              v-model="inputForm.personNumber"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-form-item
            label="实际参演对象"
            prop="drillObject"
          >
            <el-input
              v-model="dutyPersonName"
              class="big-row"
              readonly
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
            label="演练计划"
            prop="drillPlanId"
          >
            <div class="pick-box">
              <div class="box-left">
                <el-button
                  class="pick-btn"
                  type="primary"
                  size="mini"
                  @click="showRePlanDialog = true"
                >
                  选择
                </el-button>
              </div>
              <div class="box-right">
                <el-tag
                  v-for="(item, index) in RePlanList"
                  :key="item.id"
                  class="pick-item"
                  closable
                  @close="closeRePlanTag(index)"
                >
                  {{ item.name }}
                </el-tag>
              </div>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="应急预案"
            prop="drillItem"
          >
            <el-input
              v-model="inputForm.drillItem"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col>
          <el-form-item
            label="演练内容"
            prop="drillContent"
          >
            <el-input
              v-model="inputForm.drillContent"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <div class="cell-title">
        演练效果评审
      </div>

      <div class="cell-subTitle">
        人员到位情况
      </div>
      <el-checkbox-group v-model="reviews.person">
        <el-checkbox label="迅速准确" />
        <el-checkbox label="基本按时到位" />
        <el-checkbox label="个别人员不到位" />
        <el-checkbox label="重点部位人员不到位" />
        <el-checkbox label="职责明确，操作熟练" />
        <el-checkbox label="职责明确，操作不熟练" />
        <el-checkbox label="职责不明，操作不熟练" />
      </el-checkbox-group>

      <div class="cell-subTitle">
        物资到位情况
      </div>
      <div class="sub-cell">
        <span> 现场物资：</span>
        <el-radio-group v-model="reviews.materials">
          <el-radio label="现场物资充分有效" />
          <el-radio label="现场准备不充分" />
          <el-radio label="现场物资严重缺乏" />
        </el-radio-group>
      </div>

      <div class="sub-cell">
        <span> 个人防护：</span>
        <el-radio-group v-model="reviews.defend">
          <el-radio label="全部人员防护到位" />
          <el-radio label="个别人员防护不到位" />
          <el-radio label="大部分人员防护不到位" />
        </el-radio-group>
      </div>

      <div class="cell-subTitle">
        协调组织情况
      </div>
      <div class="sub-cell">
        <span> 整体组织：</span>
        <el-radio-group v-model="reviews.organization">
          <el-radio label="准确、高效" />
          <el-radio label="协调基本顺利，能满足要求" />
          <el-radio label="效率低，有待改进" />
        </el-radio-group>
      </div>

      <div class="sub-cell">
        <span> 抢险组分工：</span>
        <el-radio-group v-model="reviews.divWork">
          <el-radio label="合理、高效" />
          <el-radio label="基本合理，能完成任务" />
          <el-radio label="效率低，没有完成任务" />
        </el-radio-group>
      </div>

      <div class="cell-subTitle">
        实战效果评价
      </div>
      <el-radio-group
        v-model="reviews.anticipation"
        class="shizhanGroup"
      >
        <el-radio label="达到预期目标" />
        <el-radio label="基本达到目的，部分环节有待改进" />
        <el-radio label="没有达到目标，须重新演练" />
        <el-radio label="其他" />
      </el-radio-group>

      <div class="cell-subTitle">
        外部支援部门和协作有效性
      </div>
      <div class="sub-cell">
        <span> 报告上级：</span>
        <el-radio-group v-model="reviews.isReport">
          <el-radio label="报告及时" />
          <el-radio label="联系不上" />
        </el-radio-group>
      </div>

      <div class="sub-cell">
        <span> 消防部门：</span>
        <el-radio-group v-model="reviews.fireAction">
          <el-radio label="按要求协作" />
          <el-radio label="行动迟缓" />
        </el-radio-group>
      </div>

      <div class="sub-cell">
        <span> 医疗救援部门：</span>
        <el-radio-group v-model="reviews.medicalRescue">
          <el-radio label="按要求协作" />
          <el-radio label="行动迟缓" />
        </el-radio-group>
      </div>

      <div class="sub-cell">
        <span> 周边政府撤离配合：</span>
        <el-radio-group v-model="reviews.governCooperation">
          <el-radio label="按要求配合" />
          <el-radio label="不配合" />
        </el-radio-group>
      </div>

      <el-form-item
        label="记录附件"
        prop="picture"
        label-width="80px"
        class="record-file"
      >
        <FileUpload
          v-if="visible"
          v-bind="picture"
          @upload="uploadEvt($event, 'picture')"
          @delSucc="delDocPath"
        />
      </el-form-item>

      <el-button
        size="small"
        type="primary"
        style="margin-bottom: 10px"
        @click="toDetailClick(null, 'add')"
      >
        添加存在问题
      </el-button>
    </el-form>
    <!-- 表格 -->
    <div style="height: 400px">
      <el-table
        slot="table"
        ref="table"
        v-loading="loading"
        :data="tableData"
        size="mini"
        height="100%"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column
          label="序号"
          type="index"
          width="50"
        />
        <el-table-column
          label="存在问题"
          prop="dangerDescription"
          align="center"
          width="260"
        />
        <el-table-column
          label="计划整改时间"
          prop="rectifyTime"
          align="center"
        />
        <el-table-column
          label="整改责任人"
          prop="rectifyPerson"
          align="center"
        />
        <el-table-column
          label="附件"
          align="center"
          prop="filePath"
          min-width="100"
        >
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.filePath"
              type="text"
              @click="showFileWindow(scope.row.filePath)"
            >
              查看
            </el-button>
            <el-tag v-else>
              无
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              v-if="method !== 'view'"
              type="text"
              style="color: var(--ky-danger)"
              size="mini"
              @click="delFn(scope.row, scope.$index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-form
      v-if="method == 'check'"
      ref="inputFormCheck"
      v-loading="loading"
      :model="inputFormCheck"
      :rules="dataRule"
      label-width="120px"
      class="hide-box"
    >
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="整改后状态"
            prop="rectifyStatus"
          >
            <el-select
              v-model="inputFormCheck.rectifyStatus"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in $dictUtils.getDictList('rectification_Status')"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="实际整改时间"
            prop="rectifyNow"
          >
            <el-date-picker
              v-model="inputFormCheck.rectifyNow"
              value-format="yyyy-MM-dd hh:mm:ss"
              style="width: 100%"
              type="date"
              placeholder="选择日期"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-form-item
            label="整改后证据"
            prop="rectifyEvidence"
          >
            <el-input
              v-model="inputFormCheck.rectifyEvidence"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="上传证据">
        <FileUpload
          v-if="visible"
          v-bind="accessory"
          @upload="uploadEvt($event, 'accessory')"
          @delSucc="delDocPath1"
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
        @click="doSubmit"
      >确定</el-button>
    </span>
    <!-- 演练计划弹窗 -->
    <el-dialog
      class="normal-dialog"
      :visible.sync="showRePlanDialog"
      :close-on-click-modal="false"
      width="800px"
      title="演练计划"
      append-to-body
    >
      <PickRePlan
        v-if="showRePlanDialog"
        :oldPickList="RePlanList"
        @close="closeRePlanEvt"
      />
    </el-dialog>
    <!-- 问题与不足弹窗 -->
    <contingency-problems
      ref="ContingencyProblems"
      @refreshList="searchFn"
    />
    <!-- 参演对象弹窗 -->
    <UserSelectDia
      ref="UserSelectDialog"
      :selectData="dutyPersonList"
      @doSubmit="userIdSubmit"
    />
  </el-dialog>
</template>

<style scoped lang="scss">
.cell-title {
  line-height: 30px;
  border-bottom: 1px solid #ccc;
  margin-bottom: 20px;
}

.cell-title::before {
  display: inline-block;
  content: '';
  margin: 0 10px 0 0;
  width: 4px;
  height: 10px;
  background-color: #409eff;
}

.cell-subTitle {
  color: #409eff;
  font-size: 12px;
  height: 28px;
  line-height: 28px;
  margin-top: 20px;
}
.shizhanGroup {
  ::v-deep .el-radio__label {
    font-size: 12px;
  }
}

::v-deep .el-checkbox__label {
  font-size: 12px;
  margin-bottom: 5px;
}

.sub-cell {
  font-size: 12px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  ::v-deep .el-radio__label {
    font-size: 12px;
  }

  span {
    display: inline-block;
    padding-right: 16px;
  }
}
::v-deep .record-file {
  margin-top: 30px;
  .el-form-item__label {
    text-align: left;
  }
}

.hide-box {
  margin-top: 10px;
}
</style>
