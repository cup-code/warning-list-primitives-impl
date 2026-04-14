/* * @Author: zhangbosen 首页代办 -- 应急预案审核 * @Date: 2023-11-28 */
<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import {
  addPlan,
  getByIdPlan,
  updatePlan,
} from '@/http/contingency/contingencyPlan.js' // 应急预案接口路径
import { upLoadImg } from '@/http/manage-api'
import {
  getAllUsersByCompany,
  getAllUsersByTenant,
  getDepartListSimple,
} from '@/http/safe-production/depart-manage-api'
import FileUpload from '@/views/common-ui/FileUpload'
import PickGroup from '../common/PickGroup.vue' // 应急队伍页面
import PickProficient from '../common/PickProficient.vue' // 应急专家页面
import PickSupply from '../common/PickSupply.vue'
// 应急物资页面
export default {
  components: {
    TreeSelect,
    FileUpload,
    PickSupply,
    PickGroup,
    PickProficient,
  },
  data() {
    return {
      visible: false,
      loading: false,
      colWidth: 12,
      departList: [], // 部门列表
      personList: [], // 所有的人员列表
      personListShow: [], // 页面中展示的人员列表
      userList: [], // 队员姓名列表
      teamTypeOptions: {}, // 队伍类型字典信息
      showGoodsDialog: false, // 应急物资弹窗
      showGroupDialog: false, // 应急队伍弹窗
      showProficientDialog: false, // 应急专家弹窗
      dataRule: {
        planName: [
          {
            required: true,
            message: '应急预案名称不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        level: [
          {
            required: true,
            message: '层级不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        depId: [
          {
            required: true,
            message: '所属部门不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        planType: [
          {
            required: true,
            message: '应急预案不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        accidentType: [
          {
            required: true,
            message: '事故类型不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        filingNumber: [
          {
            required: true,
            message: '备案号不能为空',
            leaderNametrigger: 'change',
          },
        ],
        person: [
          {
            required: true,
            message: '指挥长不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        phone: [
          {
            required: true,
            message: '指挥长电话不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        team: [
          {
            type: 'array',
            required: true,
            message: '请至少选择一个应急队伍',
            trigger: 'change',
          },
        ],
        isAgree: [],
        isReport: [],
      },
      inputFormCheck: {
        remark: '',
        isAgree: '同意',
        isReport: '否',
      },

      tableData: [],
      method: '',
      inputForm: {
        planName: '',
        level: '',
        planType: '',
        accidentType: '',
        filingNumber: '',
        person: '',
        phone: '',
        measure: '',
        isFiling: true, // 是否已备案
        personTow: [{}], // 副指挥长
        personOther: [{}], // 其他成员
        planDept: [{ deptName: '' }], // 参与单位数组
        team: [],
        depId: '',
      },
      fileProp: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 1, // 最大文件上传数量
        deleteFront: true,
        editable: true,
      },
      levelOptions: [], // 层级字典数据
      reasonTypeOptions: [], // 事故类型字典数据
      planTypeOptions: [], // 预案类型字典
      listDataOne: [], // 副指挥长行新增数据
    }
  },
  created() {
    const userData = JSON.parse(sessionStorage.getItem('user'))
    const companyId = this.$store.state.user.user.companyId
    Promise.all([
      getDepartListSimple(),
      getAllUsersByTenant(userData.tenantId),
      getAllUsersByCompany(companyId),
    ])
      .then((res) => {
        // this.departList = res[0].data.result || []
        this.departList = (res[0].data.result || []).filter(
          item =>
            item.departmentType === 'DEPARTMENT'
            || item.departmentType === 'COMPANY'
            || item.departmentType === 'FACTORY',
        )

        this.personList = res[1].data.result || []
        this.userList = res[2].data.result || []
        this.filterUserList()
      })
      .catch((err) => {
        this.$message.error('获取列表失败')
      })
  },
  methods: {
    closeDialog() {
      this.fileProp.oldFileList = []
      Object.assign(this.inputForm, this.$options.data().inputForm)
      Object.assign(this.inputFormCheck, this.$options.data().inputFormCheck)
      this.$refs.inputForm.resetFields()
      if (this.method == 'check') {
        this.$refs.inputFormCheck.resetFields()
      }
    },
    /* 关闭物资选择回调 */
    closeSupplyEvt(result) {
      if (result) {
        this.inputForm.materials = result.data
      }
      this.showGoodsDialog = false
    },
    /* 关闭队伍选择回调 */
    closeGroupEvt(result) {
      if (result) {
        this.inputForm.team = result.data
      }
      this.showGroupDialog = false
    },
    /* 关闭专家选择回调 */
    closeProficientEvt(result) {
      if (result) {
        this.inputForm.expert = result.data
      }
      this.showProficientDialog = false
    },
    /* 部门下拉列表选择回调 */
    depChangeEvt(id, name) {
      this.inputForm.depId = id || ''
      this.inputForm.depName = name || ''
      this.$refs.treeSelect.closeSelect()
    },
    // 点击新增行按钮
    addRowBtn(fieldname) {
      this.inputForm[fieldname].push({
        name: '',
        phone: '',
        key: Date.now(),
      })
    },
    removeRowBtn(item, fieldname) {
      const index = this.inputForm[fieldname].indexOf(item)
      if (index !== -1) {
        this.inputForm[fieldname].splice(index, 1)
      }
    },
    // 过滤人员列表，解决数据量过大时卡顿的问题
    filterUserList(val) {
      if (!val) {
        // 列表中展示的人员
        this.personListShow = this.personList.slice(0, 20)
        // 如果之前设置了人员，需要把设置的人员信息加入展示列表中，为了回显
        if (this.inputForm.leaderName) {
          const currentResponsibilityUser = this.personList.find((item) => {
            return item.id === this.inputForm.leaderName
          })
          if (!this.personListShow.includes(currentResponsibilityUser)) {
            this.personListShow.push(currentResponsibilityUser)
          }
        }
      }
      else {
        const result = this.personList.filter((item) => {
          return item.fullName.includes(val)
        }) // 存储符合条件的下拉选项
        this.personListShow = result.slice(0, 20) // 只取前10个
      }
    },
    init(row, method) {
      this.visible = true
      this.method = method
      if (this.method == 'check') {
        this.todoId = row.todoTaskId
        this.dataRule.isAgree = [{ required: true, message: '审核结果不能为空', trigger: 'blur' }]
        this.dataRule.isReport = [
          { required: true, message: '是否上报集团不能为空', trigger: 'blur' },
        ]
      }
      this.getByIdPlanFn(row.mainId)
    },
    getByIdPlanFn(id) {
      getByIdPlan(id).then((data) => {
        if (!data.result)
          return
        if (data.result.docPath) {
          this.fileProp.oldFileList = [
            {
              originalName: data.result.docPath,
              attachmentName: data.result.docPath,
              filePath: data.result.docPath,
            },
          ]
        }

        this.inputForm = {
          id: data.result.id,
          accidentType: data.result.accidentType,
          depId: data.result.depId,
          filingNumber: data.result.filingNumber,
          flowCore: data.result.flowCore,
          isFiling: data.result.isFiling,
          level: data.result.level,
          measure: data.result.measure,
          person: data.result.person,
          phone: data.result.phone,
          planName: data.result.planName,
          planType: data.result.planType,
          docPath: data.result.docPath,
          personTow: data.result.personTow && JSON.parse(data.result.personTow), // 副指挥长
          personOther: data.result.personOther && JSON.parse(data.result.personOther), // 其他成员
          planDept: data.result.planDept && JSON.parse(data.result.planDept), // 参与单位数组
          team: data.result.team && JSON.parse(data.result.team), // 应急队伍数组
          materials: data.result.materials && JSON.parse(data.result.materials), // 应急物资数组
          expert: data.result.expert && JSON.parse(data.result.expert), // 应急专家数组
          isShowReport: data.result.isShowReport,
        }
        this.inputFormCheck.createdTime = data.result.createdTime
        this.inputFormCheck.createdBy = data.result.createdBy
        this.inputFormCheck.updatedBy = data.result.updatedBy
        this.inputFormCheck.updatedTime = data.result.updatedTime
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
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          let params, funcFn
          params = Object.assign({}, this.inputForm)
          if (this.method === 'check') {
            this.$refs.inputFormCheck.validate((valid) => {
              if (valid) {
                params = Object.assign(params, this.inputFormCheck)
                params.todoId = this.todoId
                // if(!this.inputForm.isShowReport){
                //   delete params.isReport
                // }
                params.flowLink = window.location.href
                funcFn = updatePlan // 编辑
              }
              else {
                this.loading = false
                return false
              }
            })
          }
          else if (this.method === 'edit') {
            funcFn = updatePlan // 编辑
          }
          else {
            funcFn = addPlan // 新增
          }
          params.personTow = JSON.stringify(params.personTow)
          params.personOther = JSON.stringify(params.personOther)
          params.planDept = JSON.stringify(params.planDept)
          params.materials = JSON.stringify(params.materials)
          params.expert = JSON.stringify(params.expert)
          params.team = JSON.stringify(params.team)
          funcFn
          && funcFn(params)
            .then((data) => {
              if (data.success) {
                this.$message.success(data.message || '提交成功')
                this.$emit('refreshList') // 执行回调函数
                this.visible = false
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
    :title="`${
      method == 'add' ? '新增' : method == 'edit' ? '修改' : method == 'view' ? '查看' : '审核'
    }应急预案`"
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
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="应急预案名称"
            prop="planName"
          >
            <el-input v-model="inputForm.planName" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="层级"
            prop="level"
          >
            <el-select
              v-model="inputForm.level"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in $dictUtils.getDictList('levelType')"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
              <!-- <el-option v-for="item in levelOptions" :key="item.id" :label="item.text" :value="item.id" /> -->
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="所属部门"
            prop="depId"
          >
            <TreeSelect
              ref="treeSelect"
              style="width: 100%"
              :list="departList"
              :props="{
                value: 'id',
                label: 'departmentName',
                children: 'children',
              }"
              :value="inputForm.depId"
              :label="inputForm.responsibilityDeptName"
              @getValue="depChangeEvt"
            />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="应急预案类型"
            prop="planType"
          >
            <el-select
              v-model="inputForm.planType"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in $dictUtils.getDictList('planType')"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
              <!-- <el-option v-for="item in planTypeOptions" :key="item.id" :label="item.text" :value="item.id" /> -->
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="事故类型"
            prop="accidentType"
          >
            <el-select
              v-model="inputForm.accidentType"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in $dictUtils.getDictList('reasonType')"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
              <!-- <el-option v-for="item in reasonTypeOptions" :key="item.id" :label="item.text" :value="item.id" /> -->
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="是否已备案"
            :prop="!inputForm.isFiling ? 'isFiling' : 'filingNumber'"
          >
            <el-switch
              v-model="inputForm.isFiling"
              style="width: 20%"
            />
            <el-input
              v-model="inputForm.filingNumber"
              style="width: 80%"
              placeholder="请输入备案号"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="指挥长"
            prop="person"
          >
            <el-input v-model="inputForm.person" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="指挥长电话"
            prop="phone"
          >
            <el-input v-model="inputForm.phone" />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 副指挥长 -->
      <el-row
        v-for="(item, index) in inputForm.personTow"
        :key="item.key"
      >
        <el-col :span="colWidth">
          <el-form-item label="副指挥长">
            <el-input v-model="item.name" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-input
            v-model="item.phone"
            placeholder="副指挥长电话"
            style="width: 75%; margin: 0 5%"
          />
          <el-button
            v-if="index == 0"
            size="small"
            type="primary"
            style="width: 50px"
            @click="addRowBtn('personTow')"
          >
            新增
          </el-button>
          <el-button
            v-else
            size="small"
            style="width: 50px"
            @click="removeRowBtn(item, 'personTow')"
          >
            删除
          </el-button>
        </el-col>
      </el-row>
      <!-- 其他成员 -->
      <el-row
        v-for="(item, index) in inputForm.personOther"
        :key="item.key"
      >
        <el-col :span="colWidth">
          <el-form-item label="其他成员">
            <el-input v-model="item.name" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-input
            v-model="item.phone"
            placeholder="其他成员电话"
            style="width: 75%; margin: 0 5%"
          />
          <el-button
            v-if="index == 0"
            size="small"
            type="primary"
            style="width: 50px"
            @click="addRowBtn('personOther')"
          >
            新增
          </el-button>
          <el-button
            v-else
            size="small"
            style="width: 50px"
            @click="removeRowBtn(item, 'personOther')"
          >
            删除
          </el-button>
        </el-col>
      </el-row>
      <!-- 参与单位 -->
      <el-row
        v-for="(item, index) in inputForm.planDept"
        :key="item.key"
      >
        <el-form-item
          label="参与单位"
          :prop="`planDept.${index}.deptName`"
          :rules="{
            required: true,
            message: '参与单位不能为空',
            trigger: 'blur',
          }"
        >
          <el-input
            v-model="item.deptName"
            placeholder="参与单位"
            style="width: 28%"
          />
          <el-input
            v-model="item.principal"
            placeholder="参与单位负责人"
            style="width: 28%; margin: 0 2%"
          />
          <el-input
            v-model="item.principalPhone"
            placeholder="其他成员电话"
            style="width: 28%; margin-right: 20px"
          />
          <el-button
            v-if="index == 0"
            size="small"
            type="primary"
            style="width: 50px"
            @click="addRowBtn('planDept')"
          >
            新增
          </el-button>
          <el-button
            v-else
            size="small"
            style="width: 50px"
            @click="removeRowBtn(item, 'planDept')"
          >
            删除
          </el-button>
        </el-form-item>
      </el-row>
      <el-row>
        <el-col>
          <el-form-item
            label="处置措施"
            prop="measure"
          >
            <el-input
              v-model="inputForm.measure"
              type="textarea"
              :rows="3"
            />
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
        <el-form-item label="应急物资">
          <div class="pick-box">
            <div class="box-left">
              <el-button
                class="pick-btn"
                type="primary"
                size="mini"
                @click="showGoodsDialog = true"
              >
                选择物资
              </el-button>
            </div>
            <div class="box-right">
              <el-tag
                v-for="(item, index) in inputForm.materials"
                :key="item.id"
                class="pick-item"
                closable
                @close="inputForm.materials.splice(index, 1)"
              >
                {{ item.name }}
              </el-tag>
            </div>
          </div>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item
          label="应急队伍"
          prop="team"
        >
          <div class="pick-box">
            <div class="box-left">
              <el-button
                class="pick-btn"
                type="primary"
                size="mini"
                @click="showGroupDialog = true"
              >
                选择队伍
              </el-button>
            </div>
            <div class="box-right">
              <el-tag
                v-for="(item, index) in inputForm.team"
                :key="item.id"
                class="pick-item"
                closable
                @close="inputForm.team.splice(index, 1)"
              >
                {{ item.name }}
              </el-tag>
            </div>
          </div>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="应急专家">
          <div class="pick-box">
            <div class="box-left">
              <el-button
                class="pick-btn"
                type="primary"
                size="mini"
                @click="showProficientDialog = true"
              >
                选择专家
              </el-button>
            </div>
            <div class="box-right">
              <el-tag
                v-for="(item, index) in inputForm.expert"
                :key="item.id"
                class="pick-item"
                closable
                @close="inputForm.expert.splice(index, 1)"
              >
                {{ item.name }}
              </el-tag>
            </div>
          </div>
        </el-form-item>
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
        label="处理意见"
        prop="remark"
      >
        <el-input
          v-model="inputFormCheck.remark"
          type="textarea"
          placeholder="请输入内容"
          maxlength="30"
        />
      </el-form-item>
      <el-form-item
        label="审核结果"
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
        v-if="inputForm.isShowReport"
        label="是否上报集团"
        prop="isReport"
      >
        <el-radio-group v-model="inputFormCheck.isReport">
          <el-radio label="是">
            是
          </el-radio>
          <el-radio label="否">
            否
          </el-radio>
        </el-radio-group>
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
    <!-- 弹窗 -->
    <el-dialog
      class="normal-dialog"
      :visible.sync="showGoodsDialog"
      :close-on-click-modal="false"
      width="800px"
      title="应急物资"
      append-to-body
    >
      <PickSupply
        v-if="showGoodsDialog"
        :oldPickList="inputForm.materials"
        @close="closeSupplyEvt"
      />
    </el-dialog>
    <el-dialog
      class="normal-dialog"
      :visible.sync="showGroupDialog"
      :close-on-click-modal="false"
      width="800px"
      title="应急队伍"
      append-to-body
    >
      <PickGroup
        v-if="showGroupDialog"
        :oldPickList="inputForm.team"
        @close="closeGroupEvt"
      />
    </el-dialog>
    <el-dialog
      class="normal-dialog"
      :visible.sync="showProficientDialog"
      :close-on-click-modal="false"
      width="800px"
      title="应急专家"
      append-to-body
    >
      <PickProficient
        v-if="showProficientDialog"
        :oldPickList="inputForm.expert"
        @close="closeProficientEvt"
      />
    </el-dialog>
  </el-dialog>
</template>
