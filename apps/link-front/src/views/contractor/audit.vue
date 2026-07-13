<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import {
  auditAdd,
  auditQuery,
  contractorById,
  getAuditPeriod,
  updateAuditPeriod,
} from '@/http/contractor-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import AllDepartmentTree from '@/views/common-ui/AllDepartmentTree.vue'
import FileUpload from '@/views/common-ui/FileUpload'
import PickPeople from '@/views/common-ui/PickPeople'

export default {
  components: {
    AllDepartmentTree,
    SelectTree,
    FileUpload,
    PickPeople,
  },
  data() {
    return {
      form: {
        pageNum: 1,
        pageSize: 10,
        showMore: false,
      },
      loading: false,
      data: [],
      total: 0,

      editForm: {},
      title: '审核',
      dialog: false,
      editLoading: false,
      dialog_rm: false,
      rmForm: {},
      rmRules: {},
      auditForm: {},
      auditRules: {
        safetyCheckDesc: [{ required: true, message: '请输入安全检查情况', trigger: 'blur' }],
        specialWorkDesc: [{ required: true, message: '请输入特种作业情况', trigger: 'blur' }],
        specialEquipmentDesc: [{ required: true, message: '请输入特种设备情况', trigger: 'blur' }],
        labourInsuranceDesc: [{ required: true, message: '请输入劳保发放情况', trigger: 'blur' }],
        safetySystemDesc: [{ required: true, message: '请输入安全制度建设', trigger: 'blur' }],
        safetyFee: [{ required: true, message: '请输入安全取费使用', trigger: 'blur' }],
        laborContract: [{ required: true, message: '请输入劳动合同', trigger: 'blur' }],
        auditInconformity: [{ required: true, message: '请输入审核不符合项', trigger: 'blur' }],
        compositeConclusion: [{ required: true, message: '请输入综合结论', trigger: 'blur' }],
        auditStatus: [{ required: true, message: '请选择审核结论', trigger: 'change' }],
        bookingsStatus: [{ required: true, message: '请选择红黄牌', trigger: 'change' }],
        auditAddress: [{ required: true, message: '请输入审核地点', trigger: 'blur' }],
      },
      departList: [],
      tempObj: {
        ziZhi: [],
        jianAn: [],
        baoXian: [],
        heTong: [],
        anQuan: [],
      },
      curTab: 'ziZhi',
      zsStaList: [
        { dictCode: 0, dictName: '失效' },
        { dictCode: 1, dictName: '有效' },
        { dictCode: 2, dictName: '即将失效' },
        { dictCode: 3, dictName: '到期未审' },
        { dictCode: 4, dictName: '即将复审' },
      ],
      showPeopleDialog: false,
      peopleProp: {}, // 选择人员组件传递信息
      ntTypeList: [{ dictCode: 1, dictName: '企业微信' }],
      hideLeft: false,
      treeWidth: '240px',
      conWidth: 'calc(100% - 240px)',
    }
  },
  async created() {
    this.getDataList()
    const departRes = await getDepartListSimple() // 获取当前用户所拥有的部门
    this.departList = departRes.data.result || []
  },
  methods: {
    async getDataList() {
      this.loading = true
      const { data } = await auditQuery(this.form)
      this.loading = false
      if (data.code == 200) {
        this.data = data.result.list || []
        this.total = data.result.total
      }
      else {
        this.$message.error(data.message || '查询失败')
        this.data = []
        this.total = 0
      }
    },
    // 重置
    resetFn() {
      this.form = {
        pageNum: 1,
        pageSize: 10,
        showMore: false,
      }
      this.getDataList()
    },
    pageSizeFn(v) {
      this.form.pageNum = 1
      this.form.pageSize = v
      this.getDataList()
    },
    pageCurFn(v) {
      this.form.pageNum = v
      this.getDataList()
    },
    treeNodeTap(data) {
      if (data) {
        this.form.competentDepartmentId = data.id
      }
      else {
        delete this.form.competentDepartmentId
      }
      this.getDataList()
    },
    toggleMore() {
      this.form.showMore = !this.form.showMore
    },
    addFn() {
      this.editForm = {}
      this.title = '审核'
      this.dialog = true
    },
    async auditFn(v) {
      const { data } = await contractorById(v.contractorInfoId)
      this.editForm = data.result
      this.title = '审核'
      this.dialog = true
      // 回显子表格
      this.initSubTable()
    },
    // 回显子表格
    initSubTable() {
      ;(this.tempObj = {}),
      this.editForm.contractorInfoQualificationList.forEach((item) => {
        if (!this.tempObj[item.contractorQualificationType]) {
          this.tempObj[item.contractorQualificationType] = []
        }
        item.startEnd = [
          item.contractorQualificationStartTime,
          item.contractorQualificationEndTime,
        ]
        item.oldFileList = [
          {
            originalName: item.contractorQualificationFileName,
            attachmentName: item.contractorQualificationFileName,
            filePath: item.contractorQualificationFilePath,
          },
        ]
        this.tempObj[item.contractorQualificationType].push(item)
      })
    },
    // 确定证书回显
    findZs(code) {
      if (!code && code !== 0)
        return
      return this.zsStaList.find(item => item.dictCode == code).dictName
    },
    // 保存
    saveFn() {
      this.$refs.auditForm.validate((valid) => {
        if (!valid)
          return
        this.editLoading = true
        this.auditForm.contractorInfoId = this.editForm.id

        auditAdd(this.auditForm).then(({ data }) => {
          this.editLoading = false
          if (data.code === 200) {
            this.$message.success(data.message || '保存成功')
            this.dialog = false
            this.getDataList()
          }
          else {
            this.$message.error(data.message || '保存失败')
          }
        })
      })
    },
    // 设置提醒
    remindFn() {
      getAuditPeriod().then(({ data }) => {
        if (data.code === 200) {
          this.rmForm = data.result
        }
      })
      this.dialog_rm = true
    },
    // 选择提醒人
    choosePeople() {
      this.peopleProp.oldPickData = {
        id: this.rmForm.remindUserId || '',
        fullName: this.rmForm.remindUserName || '',
      }
      this.peopleProp.isSingle = true
      this.peopleProp.listType = 'company'
      this.showPeopleDialog = true
    },
    // 选择提醒人之后的回调
    closePeopleEvt(params) {
      if (params) {
        this.rmForm.remindUserId = params.data.id
        this.rmForm.remindUserName = params.data.fullName
      }
      this.showPeopleDialog = false
    },
    remindDone() {
      this.$refs.rmForm.validate((valid) => {
        if (!valid)
          return

        updateAuditPeriod(this.rmForm).then(({ data }) => {
          if (data.code === 200) {
            this.$message.success(data.message || '设置成功')
            this.dialog_rm = false
          }
          else {
            this.$message.error(data.message || '设置失败')
          }
        })
      })
    },
    // 切换左侧菜单的收起与展现
    toggleLeftFn() {
      this.hideLeft = !this.hideLeft
      if (this.hideLeft) {
        this.treeWidth = '0%'
        this.conWidth = '100%'
      }
      else {
        this.treeWidth = '240px'
        this.conWidth = 'calc(100% - 240px)'
      }
    },
  },
}
</script>

<template>
  <div class="audit-contractor">
    <div
      class="leftCon"
      :style="`width: ${treeWidth}`"
    >
      <AllDepartmentTree
        slot="tree"
        ref="companyTree"
        :hasResponsible="false"
        @treeNodeTap="treeNodeTap"
      />
      <div
        class="toggle-btn"
        @click="toggleLeftFn"
      >
        {{ hideLeft ? '展开' : '隐藏' }}
      </div>
    </div>
    <div
      class="rightCon"
      :style="`width: ${conWidth}`"
    >
      <!-- 查询条件 -->
      <el-form
        :model="form"
        label-width="72px"
        class="searchForm"
      >
        <el-row>
          <el-col :span="6">
            <el-form-item
              label="承包商名称"
              prop="contractorName"
            >
              <el-input
                v-model="form.contractorName"
                placeholder="请输入承包商名称"
              />
            </el-form-item>
          </el-col>

          <!-- 按钮 -->
          <el-col
            :span="12"
            style="padding-left: 10px"
          >
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="getDataList"
            >
              查询
            </el-button>
            <el-button
              icon="el-icon-refresh-right"
              @click="resetFn"
            >
              重置
            </el-button>
          </el-col>
        </el-row>
      </el-form>
      <div class="main-box">
        <!-- 功能区域 -->
        <div>
          <!-- <el-button type="primary" icon="el-icon-plus" plain @click="addFn">新增</el-button> -->
          <el-button
            v-if="hasBtnPermission('contractor_audit_period')"
            type="warning"
            plain
            @click="remindFn"
          >
            设置审核周期
          </el-button>
        </div>
        <!-- 表格 -->
        <el-table
          v-loading="loading"
          :data="data"
          style="width: 100%"
          size="mini"
          :header-cell-style="{ background: '#f5f5f5' }"
          height="100%"
          :border="true"
          class="customer-table"
        >
          <el-table-column
            label="承包商名称"
            prop="contractorInfoName"
            align="center"
            width="90"
          />
          <el-table-column
            label="主管部门"
            prop="competentDepartmentName"
            align="center"
          />
          <el-table-column
            label="审核不符合项"
            prop="auditInconformity"
            align="center"
            width="95"
          />
          <el-table-column
            label="审核地点"
            prop="auditAddress"
            align="center"
          />
          <el-table-column
            label="综合结论"
            prop="compositeConclusion"
            align="center"
          />
          <el-table-column
            label="审核结论"
            prop="auditStatus"
            align="center"
          >
            <template slot-scope="scope">
              <span>{{
                scope.row.auditStatus == 0 ? '合格' : scope.row.auditStatus == 2 ? '不合格' : ''
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            fixed="right"
            label="操作"
            width="90"
          >
            <template slot-scope="scope">
              <el-button
                v-if="hasBtnPermission('contractor_audit_audit')"
                type="text"
                @click="auditFn(scope.row)"
              >
                审核
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
          :current-page.sync="form.pageNum"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="form.pageSize"
          layout="total, prev, pager, next, jumper, sizes"
          :total="total"
          @size-change="pageSizeFn"
          @current-change="pageCurFn"
        />
      </div>
    </div>

    <!-- 新增、编辑 弹窗 -->
    <el-dialog
      class="normal-dialog edit-dialog"
      :title="title"
      :visible.sync="dialog"
      width="70%"
    >
      <el-form
        ref="editForm"
        :model="editForm"
        label-width="120px"
        size="mini"
        disabled
      >
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="承包商名称"
              prop="contractorName"
            >
              <el-input
                v-model="editForm.contractorName"
                placeholder="承包商名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="地址"
              prop="contractorAddress"
            >
              <el-input
                v-model="editForm.contractorAddress"
                placeholder="地址"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="承包商法人"
              prop="contractorCorporation"
            >
              <el-input
                v-model="editForm.contractorCorporation"
                placeholder="承包商法人"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="法人电话"
              prop="contractorCorporationPhone"
            >
              <el-input
                v-model="editForm.contractorCorporationPhone"
                placeholder="法人电话"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="安全负责人"
              prop="safetyDirector"
            >
              <el-input
                v-model="editForm.safetyDirector"
                placeholder="安全负责人"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="负责人电话"
              prop="safetyDirectorPhone"
            >
              <el-input
                v-model="editForm.safetyDirectorPhone"
                placeholder="负责人电话"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="承包商类型"
              prop="contractorType"
            >
              <el-select
                v-model="editForm.contractorType"
                placeholder="承包商类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('contractor_type')"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="统一社会信用代码"
              prop="socialCode"
            >
              <el-input
                v-model="editForm.socialCode"
                placeholder="统一社会信用代码"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="是否三方机构"
              prop="thirdPartyFlag"
            >
              <el-radio-group v-model="editForm.thirdPartyFlag">
                <el-radio :label="1">
                  是
                </el-radio>
                <el-radio :label="0">
                  否
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="主管部门"
              prop="competentDepartmentId"
            >
              <SelectTree
                :props="{
                  value: 'id', // ID字段名
                  label: 'departmentName', // 显示名称
                  children: 'children', // 子级字段名
                }"
                :list="departList"
                :value="editForm.competentDepartmentId"
                :clearable="true"
                :accordion="true"
                @getValue="
                  value => {
                    editForm.competentDepartmentId = value
                  }
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="是否常驻"
              prop="residentFlag"
            >
              <el-radio-group v-model="editForm.residentFlag">
                <el-radio :label="1">
                  是
                </el-radio>
                <el-radio :label="0">
                  否
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="红黄牌"
              prop="bookingsStatus"
            >
              <el-radio-group v-model="editForm.bookingsStatus">
                <el-radio :label="0">
                  红牌
                </el-radio>
                <el-radio :label="1">
                  绿牌
                </el-radio>
                <el-radio :label="2">
                  黄牌
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="红黄牌原因"
              prop="bookingsDesc"
            >
              <el-input
                v-model="editForm.bookingsDesc"
                placeholder="红黄牌原因"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="业务范围"
              prop="businessScope"
            >
              <el-input
                v-model="editForm.businessScope"
                type="textarea"
                :rows="6"
                placeholder="业务范围"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-tabs v-model="curTab">
              <!-- 资质证书 -->
              <el-tab-pane
                label="资质证书"
                name="ziZhi"
              >
                <el-table
                  :data="tempObj.ziZhi"
                  style="width: 100%; margin-top: 10px"
                  border
                  size="mini"
                  :header-cell-style="{ background: '#f5f5f5' }"
                  :height="200"
                >
                  <el-table-column
                    label="承包商资质证书"
                    prop="contractorQualificationName"
                    align="center"
                    width="110"
                  >
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.contractorQualificationName" />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="资质证书编号"
                    prop="contractorQualificationCode"
                    align="center"
                    width="100"
                  >
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.contractorQualificationCode" />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="有效时间"
                    prop="startEnd"
                    align="center"
                    width="250"
                  >
                    <template slot-scope="scope">
                      <el-date-picker
                        v-model="scope.row.startEnd"
                        style="width: 100%"
                        type="datetimerange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        value-format="yyyy-MM-dd HH:mm:ss"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="复审时间"
                    prop="contractorQualificationReviewTime"
                    align="center"
                    width="160"
                  >
                    <template slot-scope="scope">
                      <el-date-picker
                        v-model="scope.row.contractorQualificationReviewTime"
                        style="width: 100%"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="证书状态"
                    prop="qualificationStatus"
                    align="center"
                  >
                    <template slot-scope="scope">
                      <span>{{ findZs(scope.row.qualificationStatus) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="附件"
                    align="center"
                    width="200"
                  >
                    <template slot-scope="scope">
                      <FileUpload
                        class="fujian-info-contractor"
                        deleteFront
                        :isDel="false"
                        uploadDes=""
                        :fileLimit="1"
                        :oldFileList="scope.row.oldFileList"
                      />
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>

              <!-- 建安证 -->
              <el-tab-pane
                label="建安证"
                name="jianAn"
              >
                <el-table
                  :data="tempObj.jianAn"
                  style="width: 100%; margin-top: 10px"
                  border
                  size="mini"
                  :header-cell-style="{ background: '#f5f5f5' }"
                  :height="200"
                >
                  <el-table-column
                    label="建安证"
                    prop="contractorQualificationName"
                    align="center"
                  >
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.contractorQualificationName" />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="建安证编号"
                    prop="contractorQualificationCode"
                    align="center"
                    width="90"
                  >
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.contractorQualificationCode" />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="人员角色"
                    prop="contractorConstructionRole"
                    align="center"
                  >
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.contractorConstructionRole" />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="人员姓名"
                    prop="contractorConstructionUsername"
                    align="center"
                  >
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.contractorConstructionUsername" />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="是否专职"
                    prop="specialityFlag"
                    align="center"
                  >
                    <template slot-scope="scope">
                      <el-checkbox
                        v-model="scope.row.specialityFlag"
                        :true-label="1"
                        :false-label="0"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="有效时间"
                    prop="startEnd"
                    align="center"
                    width="250"
                  >
                    <template slot-scope="scope">
                      <el-date-picker
                        v-model="scope.row.startEnd"
                        style="width: 100%"
                        type="datetimerange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        value-format="yyyy-MM-dd HH:mm:ss"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="复审时间"
                    prop="contractorQualificationReviewTime"
                    align="center"
                    width="160"
                  >
                    <template slot-scope="scope">
                      <el-date-picker
                        v-model="scope.row.contractorQualificationReviewTime"
                        style="width: 100%"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="证书状态"
                    prop="qualificationStatus"
                    align="center"
                  >
                    <template slot-scope="scope">
                      <span>{{ findZs(scope.row.qualificationStatus) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="附件"
                    prop="e"
                    align="center"
                    width="200"
                  >
                    <template slot-scope="scope">
                      <FileUpload
                        class="fujian-info-contractor"
                        deleteFront
                        :isDel="false"
                        uploadDes=""
                        :fileLimit="1"
                        :oldFileList="scope.row.oldFileList"
                      />
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>

              <!-- 保险 -->
              <el-tab-pane
                label="保险"
                name="baoXian"
              >
                <el-table
                  :data="tempObj.baoXian"
                  style="width: 100%; margin-top: 10px"
                  border
                  size="mini"
                  :header-cell-style="{ background: '#f5f5f5' }"
                  :height="200"
                >
                  <el-table-column
                    label="承包商保险"
                    prop="contractorQualificationName"
                    align="center"
                    width="90"
                  >
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.contractorQualificationName" />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="保险编号"
                    prop="contractorQualificationCode"
                    align="center"
                  >
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.contractorQualificationCode" />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="有效时间"
                    prop="startEnd"
                    align="center"
                    width="250"
                  >
                    <template slot-scope="scope">
                      <el-date-picker
                        v-model="scope.row.startEnd"
                        style="width: 100%"
                        type="datetimerange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        value-format="yyyy-MM-dd HH:mm:ss"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="复审时间"
                    prop="contractorQualificationReviewTime"
                    align="center"
                    width="160"
                  >
                    <template slot-scope="scope">
                      <el-date-picker
                        v-model="scope.row.contractorQualificationReviewTime"
                        style="width: 100%"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="保险状态"
                    prop="qualificationStatus"
                    align="center"
                  >
                    <template slot-scope="scope">
                      <span>{{ findZs(scope.row.qualificationStatus) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="附件"
                    prop="e"
                    align="center"
                    width="200"
                  >
                    <template slot-scope="scope">
                      <FileUpload
                        class="fujian-info-contractor"
                        deleteFront
                        :isDel="false"
                        uploadDes=""
                        :fileLimit="1"
                        :oldFileList="scope.row.oldFileList"
                      />
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>

              <!-- 合同 -->
              <el-tab-pane
                label="合同"
                name="heTong"
              >
                <el-table
                  :data="tempObj.heTong"
                  style="width: 100%; margin-top: 10px"
                  border
                  size="mini"
                  :header-cell-style="{ background: '#f5f5f5' }"
                  :height="200"
                >
                  <el-table-column
                    label="承包商合同"
                    prop="contractorQualificationName"
                    align="center"
                    width="90"
                  >
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.contractorQualificationName" />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="合同编号"
                    prop="contractorQualificationCode"
                    align="center"
                  >
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.contractorQualificationCode" />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="有效时间"
                    prop="startEnd"
                    align="center"
                    width="250"
                  >
                    <template slot-scope="scope">
                      <el-date-picker
                        v-model="scope.row.startEnd"
                        style="width: 100%"
                        type="datetimerange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        value-format="yyyy-MM-dd HH:mm:ss"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="复审时间"
                    prop="contractorQualificationReviewTime"
                    align="center"
                    width="160"
                  >
                    <template slot-scope="scope">
                      <el-date-picker
                        v-model="scope.row.contractorQualificationReviewTime"
                        style="width: 100%"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="合同状态"
                    prop="qualificationStatus"
                    align="center"
                  >
                    <template slot-scope="scope">
                      <span>{{ findZs(scope.row.qualificationStatus) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="附件"
                    prop="e"
                    align="center"
                    width="200"
                  >
                    <template slot-scope="scope">
                      <FileUpload
                        class="fujian-info-contractor"
                        deleteFront
                        :isDel="false"
                        uploadDes=""
                        :fileLimit="1"
                        :oldFileList="scope.row.oldFileList"
                      />
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>

              <!-- 安全协议 -->
              <el-tab-pane
                label="安全协议"
                name="anQuan"
              >
                <el-table
                  :data="tempObj.anQuan"
                  style="width: 100%; margin-top: 10px"
                  border
                  size="mini"
                  :header-cell-style="{ background: '#f5f5f5' }"
                  :height="200"
                >
                  <el-table-column
                    label="承包商安全协议"
                    prop="contractorQualificationName"
                    align="center"
                    width="110"
                  >
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.contractorQualificationName" />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="安全协议编号"
                    prop="contractorQualificationCode"
                    align="center"
                    width="100"
                  >
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.contractorQualificationCode" />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="有效时间"
                    prop="startEnd"
                    align="center"
                    width="250"
                  >
                    <template slot-scope="scope">
                      <el-date-picker
                        v-model="scope.row.startEnd"
                        style="width: 100%"
                        type="datetimerange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        value-format="yyyy-MM-dd HH:mm:ss"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="复审时间"
                    prop="contractorQualificationReviewTime"
                    align="center"
                    width="160"
                  >
                    <template slot-scope="scope">
                      <el-date-picker
                        v-model="scope.row.contractorQualificationReviewTime"
                        style="width: 100%"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="安全协议状态"
                    prop="qualificationStatus"
                    align="center"
                    width="100"
                  >
                    <template slot-scope="scope">
                      <span>{{ findZs(scope.row.qualificationStatus) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="附件"
                    prop="e"
                    align="center"
                    width="200"
                  >
                    <template slot-scope="scope">
                      <FileUpload
                        class="fujian-info-contractor"
                        deleteFront
                        :isDel="false"
                        uploadDes=""
                        :fileLimit="1"
                        :oldFileList="scope.row.oldFileList"
                      />
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
      </el-form>

      <el-form
        ref="auditForm"
        :model="auditForm"
        :rules="auditRules"
        label-width="110px"
        size="mini"
      >
        <div class="barSty">
          审核
        </div>
        <el-row>
          <el-col :span="24">
            <el-form-item
              label="安全检查情况"
              prop="safetyCheckDesc"
            >
              <el-input
                v-model="auditForm.safetyCheckDesc"
                placeholder="安全检查情况"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="特种作业情况"
              prop="specialWorkDesc"
            >
              <el-input
                v-model="auditForm.specialWorkDesc"
                placeholder="特种作业情况"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="保险购买情况"
              prop="cc"
            >
              <el-input
                v-model="auditForm.cc"
                placeholder="保险购买情况"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="单位人员资质"
              prop="dd"
            >
              <el-input
                v-model="auditForm.dd"
                placeholder="单位人员资质"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="特种设备情况"
              prop="specialEquipmentDesc"
            >
              <el-input
                v-model="auditForm.specialEquipmentDesc"
                placeholder="特种设备情况"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="劳保发放情况"
              prop="labourInsuranceDesc"
            >
              <el-input
                v-model="auditForm.labourInsuranceDesc"
                placeholder="劳保发放情况"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="安全制度建设"
              prop="safetySystemDesc"
            >
              <el-input
                v-model="auditForm.safetySystemDesc"
                placeholder="安全制度建设"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="安全取费使用"
              prop="safetyFee"
            >
              <el-input
                v-model="auditForm.safetyFee"
                placeholder="安全取费使用"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="劳动合同"
              prop="laborContract"
            >
              <el-input
                v-model="auditForm.laborContract"
                placeholder="劳动合同"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="审核不符合项"
              prop="auditInconformity"
            >
              <el-input
                v-model="auditForm.auditInconformity"
                placeholder="审核不符合项"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="综合结论"
              prop="compositeConclusion"
            >
              <el-input
                v-model="auditForm.compositeConclusion"
                placeholder="综合结论"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="审核结论"
              prop="auditStatus"
            >
              <el-radio-group v-model="auditForm.auditStatus">
                <el-radio :label="0">
                  合格
                </el-radio>
                <el-radio :label="2">
                  不合格
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="红黄牌"
              prop="bookingsStatus"
            >
              <el-radio-group v-model="auditForm.bookingsStatus">
                <el-radio :label="0">
                  红牌
                </el-radio>
                <el-radio :label="1">
                  绿牌
                </el-radio>
                <el-radio :label="2">
                  黄牌
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="审核地点"
              prop="auditAddress"
            >
              <el-input
                v-model="auditForm.auditAddress"
                placeholder="审核地点"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialog = false">
          关闭
        </el-button>
        <el-button
          type="primary"
          :loading="editLoading"
          @click="saveFn"
        >
          保存
        </el-button>
      </div>
    </el-dialog>

    <!-- 设置审核周期 弹窗 -->
    <el-dialog
      class="normal-dialog edit-dialog"
      title="设置审核周期"
      :visible.sync="dialog_rm"
      width="40%"
    >
      <el-form
        ref="rmForm"
        :model="rmForm"
        :rules="rmRules"
        label-width="70px"
        size="mini"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item
              label="审核周期"
              prop="auditDay"
              :rules="{
                required: true,
                message: '审核周期不能为空',
                trigger: 'blur',
              }"
            >
              <el-input
                v-model="rmForm.auditDay"
                placeholder="审核周期"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="提醒人"
              prop="remindUserName"
            >
              <el-input
                v-model="rmForm.remindUserName"
                readonly
                @focus="choosePeople"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="提醒方式"
              prop="remindType"
            >
              <el-select
                v-model="rmForm.remindType"
                placeholder="提醒方式"
                style="width: 100%"
              >
                <el-option
                  v-for="item in ntTypeList"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialog_rm = false">
          关闭
        </el-button>
        <el-button
          type="primary"
          @click="remindDone"
        >
          确定
        </el-button>
      </div>
    </el-dialog>

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
.audit-contractor {
  height: calc(100vh - 50px);
  background: #f3f7f9;
  display: flex;
  position: relative;
  .leftCon {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    padding: 10px;
    padding-right: 0px;
    .leftTree {
      height: 100%;
    }
    .leftTree .el-card {
      display: flex;
      flex-direction: column;
    }
    .toggle-btn {
      z-index: 1;
      position: absolute;
      top: 50%;
      left: 100%;
      cursor: pointer;
      user-select: none;
      background: rgba($color: #000000, $alpha: 0.1);
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      padding: 5px;
    }
  }
  .rightCon {
    position: absolute;
    top: 0;
    right: 0;
    flex: 1;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 10px;
    .searchForm {
      margin-bottom: 10px;
      padding: 18px 8px 0 10px;
      background: #fff;
    }
    .main-box {
      background: #fff;
      flex: 1;
      overflow: hidden;
      padding: 10px;
      display: flex;
      flex-direction: column;

      .el-table {
        flex: 1;
        margin: 10px 0;
        .el-button + .el-button {
          margin-left: 5px;
        }
      }
      .el-pagination {
        text-align: right;
        padding: 0;
        .el-pagination__sizes {
          margin-right: 0;
          .el-input {
            margin-right: 0;
          }
        }
      }
    }
  }
}

.normal-dialog.edit-dialog {
  .el-dialog__header {
    min-height: 46px;
    border-bottom: 1px solid #e8e8e8;
    .el-dialog__title {
      font-size: 16px;
      &::before {
        height: 20px;
      }
    }
  }
  .el-dialog__body {
    padding-bottom: 24px;
    .fujian-info-contractor {
      .file-upload {
        margin: 0;
      }
      // 控制上传按钮居中
      .el-upload {
        margin: 0 auto;
      }
      // 控制文件名字的样式
      .el-upload-list {
        width: 100%;
        .el-upload-list__item {
          text-align: left;
          .el-upload-list__item-name {
            width: 100%;
            padding-right: 20px;
          }
        }
      }
      .el-icon-search,
      .el-icon-download {
        display: none;
      }
      .filelist-item {
        .filelist-item-left {
          overflow: hidden;
          flex: 4;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .filelist-item-right {
          flex: 1;
        }
      }
    }
  }
  .el-dialog__footer {
    padding: 8px 20px;
    border-top: 1px solid #e8e8e8;
    .dialog-footer {
      height: 30px;
    }
  }
  .barSty {
    display: flex;
    align-items: center;
    font-weight: bold;
    margin: 30px 0 10px;
    &::before {
      display: inline-block;
      content: '';
      margin-right: 6px;
      width: 5px;
      height: 14px;
      background-color: #409eff;
    }
  }
}
</style>
