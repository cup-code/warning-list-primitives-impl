<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import {
  contractorAddOrUpdate,
  contractorById,
  contractorDelete,
  contractorPageQuery,
  getContractorNotice,
  problemById,
  reauditApply,
  reauditDone,
  updateContractorNotice,
  uploadFileList,
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
      cbStaList: [
        { dictCode: 0, dictName: '合格承包商' },
        { dictCode: 1, dictName: '准承包商' },
        { dictCode: 2, dictName: '不合格承包商' },
      ],
      zsStaList: [
        { dictCode: 0, dictName: '失效' },
        { dictCode: 1, dictName: '有效' },
        { dictCode: 2, dictName: '即将失效' },
        { dictCode: 3, dictName: '到期未审' },
        { dictCode: 4, dictName: '即将复审' },
      ],
      curTab: 'ziZhi',
      tempObj: {
        ziZhi: [],
        jianAn: [],
        baoXian: [],
        heTong: [],
        anQuan: [],
      },
      editForm: {},
      editRules: {
        contractorName: [{ required: true, message: '请输入承包商名称', trigger: 'blur' }],
        contractorAddress: [{ required: true, message: '请输入地址', trigger: 'blur' }],
        contractorCorporation: [{ required: true, message: '请输入承包商法人', trigger: 'blur' }],
        contractorCorporationPhone: [
          { required: true, message: '请输入法人电话', trigger: 'blur' },
        ],
        safetyDirector: [{ required: true, message: '请输入安全负责人', trigger: 'blur' }],
        safetyDirectorPhone: [{ required: true, message: '请输入负责人电话', trigger: 'blur' }],
        socialCode: [
          {
            required: true,
            message: '请输入统一社会信用代码',
            trigger: 'blur',
          },
        ],
        bookingsDesc: [{ required: true, message: '请输入红黄牌原因', trigger: 'blur' }],
        businessScope: [{ required: true, message: '请输入业务范围', trigger: 'blur' }],
        contractorType: [{ required: true, message: '请选择承包商类型', trigger: 'change' }],
        thirdPartyFlag: [
          {
            required: true,
            message: '请选择是否第三方机构',
            trigger: 'change',
          },
        ],
        competentDepartmentId: [{ required: true, message: '请选择主管部门', trigger: 'change' }],
        residentFlag: [{ required: true, message: '请选择是否常驻', trigger: 'change' }],
        bookingsStatus: [{ required: true, message: '请选择红黄牌', trigger: 'change' }],
      },
      title: '新增承包商信息',
      dialog: false,
      editLoading: false,
      editable: true,
      dialog_rm: false,
      rmForm: {},
      rmRules: {},
      dialog_ch: false,

      checkForm: {},
      checkRules: {},
      isCheck: false, // false: 申请复核； true: 复核
      load_ch: false,

      showPeopleDialog: false,
      peopleProp: {}, // 选择人员组件传递信息
      ntTypeList: [{ dictCode: '企业微信', dictName: '企业微信' }],
      hideLeft: false,
      treeWidth: '240px',
      conWidth: 'calc(100% - 240px)',
      departList: [], // 部门列表
    }
  },
  created() {
    this.getDataList()
    getDepartListSimple().then(({ data }) => {
      this.departList = (data.result || []).filter(
        item =>
          item.departmentType === 'DEPARTMENT'
          || item.departmentType === 'COMPANY'
          || item.departmentType === 'FACTORY',
      )
    })
  },
  methods: {
    async getDataList() {
      const { data } = await contractorPageQuery(this.form)
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
      this.editable = true
      this.editForm = {}
      ;(this.tempObj = {
        ziZhi: [],
        jianAn: [],
        baoXian: [],
        heTong: [],
        anQuan: [],
      }),
      (this.title = '新增承包商信息')
      this.dialog = true
    },
    async seeFn(v) {
      const { data } = await contractorById(v.id)
      this.editForm = data.result
      this.title = '查看承包商信息'
      this.editable = false
      this.dialog = true

      // 回显子表格
      this.initSubTable()
    },
    async editFn(v) {
      const { data } = await contractorById(v.id)
      this.editForm = data.result
      this.title = '编辑承包商信息'
      this.editable = true
      this.dialog = true

      // 回显子表格
      this.initSubTable()
    },
    addSub(type) {
      const item = {
        contractorQualificationType: type, // 证书类型
        contractorQualificationName: '', // 证书名称
        contractorQualificationCode: '', // 证书编号
        contractorQualificationStartTime: '', // 有效开始时间
        contractorQualificationEndTime: '', // 有效截止时间
        contractorQualificationReviewTime: '', // 复审时间
        qualificationStatus: '', // 证书状态（0：失效，1：有效，2：即将失效，3：到期未审，4：即将复审）
        contractorQualificationFileName: '', // 附件名称
        contractorQualificationFilePath: '', // 附件地址
      }
      if (type === 'jianAn') {
        item.contractorConstructionRole = '' // 建安证人员角色
        item.contractorConstructionUsername = '' // 建安证人员姓名
        item.specialityFlag = '' // 建安证是否专职（0否，1是）
      }
      this.tempObj[type].push(item)
    },
    delSub(type, idx) {
      this.tempObj[type].splice(idx, 1)
    },
    delFn(v) {
      this.$confirm(`您确认要删除 ${v.contractorName}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          contractorDelete(v.id)
            .then(({ data }) => {
              if (data.success === true) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(data.message || '删除失败!')
              }
            })
            .catch((err) => {
              this.$message.error('删除失败!')
            })
        })
        .catch(() => {})
    },
    // 申请复核、复核
    async checkFn(v, flag) {
      // flag： false为申请复核； true为复核
      this.editForm = v
      this.editable = false
      this.isCheck = flag
      this.dialog_ch = true

      const { data } = await problemById(v.id)
      this.checkForm = data.result
    },
    // 申请复核、复核 保存
    checkDone() {
      this.$refs.checkForm.validate((valid) => {
        if (!valid)
          return
        this.load_ch = true

        let params

        // 申请复核
        if (!this.isCheck) {
          params = {
            contractorInfoId: this.checkForm.contractorInfoVO.id, // 承包商id
            otherReason: this.checkForm.otherReason,
            otherPlan: this.checkForm.otherPlan,
            applyDesc: this.checkForm.applyDesc,
            filePath: this.checkForm.filePath,
          }
          reauditApply(params).then(({ data }) => {
            this.load_ch = false
            if (data.code === 200) {
              this.$message.success(data.message || '申请复核成功')
              this.dialog_ch = false
              this.getDataList()
            }
            else {
              this.$message.error(data.message || '申请复核失败')
            }
          })
        }
        else {
          // 复核
          params = {
            contractorInfoId: this.checkForm.contractorInfoVO.id, // 承包商id
            bookingsStatus: this.checkForm.bookingsStatus,
            reauditDesc: this.checkForm.reauditDesc,
          }
          reauditDone(params).then(({ data }) => {
            this.load_ch = false
            if (data.code === 200) {
              this.$message.success(data.message || '申请复核成功')
              this.dialog_ch = false
              this.getDataList()
            }
            else {
              this.$message.error(data.message || '申请复核失败')
            }
          })
        }
      })
    },
    // 保存
    saveFn() {
      this.$refs.editForm.validate((valid) => {
        if (!valid)
          return
        this.editLoading = true

        const list = []
        Object.keys(this.tempObj).forEach((k) => {
          this.tempObj[k].forEach((item) => {
            list.push(item)
          })
        })
        this.editForm.contractorInfoQualificationList = list

        contractorAddOrUpdate(this.editForm).then(({ data }) => {
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
    // 文件回调
    uploadEvt(fileList, type, idx) {
      const upFileData = {
        files: fileList,
        entityId: +new Date(),
        businessName: 'contrator',
        categoryName: type,
      }
      uploadFileList(upFileData)
        .then(({ data }) => {
          if (data.success) {
            this.tempObj[type][idx].contractorQualificationFileName = data.result[0].fileName
            this.tempObj[type][idx].contractorQualificationFilePath = data.result[0].filePath
          }
          else {
            this.$message.warning(data.message || '文件上传失败')
          }
        })
        .catch((err) => {
          this.$message.error('文件上传出错', err)
        })
    },
    uploadOther(fileList, type) {
      const upFileData = {
        files: fileList,
        entityId: +new Date(),
        businessName: 'contrator',
        categoryName: type,
      }
      uploadFileList(upFileData)
        .then(({ data }) => {
          if (data.success) {
            this.checkForm.filePath = data.result[0].filePath
          }
          else {
            this.$message.warning(data.message || '文件上传失败')
          }
        })
        .catch((err) => {
          console.log('*** err: ', err)
          this.$message.error('文件上传出错', err)
        })
    },
    // 从后台来的文件的 删除回调（新上传的文件删除不会调用这个方法）
    fileDel(type, idx) {
      this.tempObj[type][idx].oldFileList = [] // 清空oldFileList
      // 清空回传给后台接口的数据
      this.tempObj[type][idx].contractorQualificationFileName = ''
      this.tempObj[type][idx].contractorQualificationFilePath = ''
    },
    tabClick() {},
    // 设置提醒
    remindFn() {
      getContractorNotice().then(({ data }) => {
        if (data.code === 200) {
          this.rmForm = data.result || {}
        }
      })
      this.dialog_rm = true
    },
    // 确定证书回显
    findZs(code) {
      if (!code && code !== 0)
        return
      return this.zsStaList.find(item => item.dictCode == code).dictName
    },
    // 回显子表格
    initSubTable() {
      this.tempObj = {
        ziZhi: [],
        jianAn: [],
        baoXian: [],
        heTong: [],
        anQuan: [],
      }
      const tar = this.editForm.contractorInfoQualificationList

      tar.forEach((item) => {
        if (!this.tempObj[item.contractorQualificationType]) {
          this.tempObj[item.contractorQualificationType] = []
        }
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
    // 选择提醒人
    choosePeople() {
      this.peopleProp.oldPickData = {
        id: this.rmForm.userId || '',
        fullName: this.rmForm.username || '',
      }
      this.peopleProp.isSingle = true
      this.peopleProp.listType = 'company'
      this.showPeopleDialog = true
    },
    // 选择提醒人之后的回调
    closePeopleEvt(params) {
      if (params) {
        this.rmForm.userId = params.data.id
        this.rmForm.username = params.data.fullName
      }
      this.showPeopleDialog = false
    },
    remindDone() {
      this.$refs.rmForm.validate((valid) => {
        if (!valid)
          return

        updateContractorNotice(this.rmForm).then(({ data }) => {
          if (data.code === 200) {
            this.$message.success(data.message || '设置提醒成功')
            this.dialog_rm = false
          }
          else {
            this.$message.error(data.message || '设置提醒失败')
          }
        })
      })
    },
    effectTimeFn(v, row) {
      if (v) {
        const now = +new Date()
        const tar = +new Date(v)
        if (tar >= now) {
          row.qualificationStatus = 1
        }
        else {
          row.qualificationStatus = 0
        }
      }
      else {
        row.qualificationStatus = ''
      }
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
    openFn() {
      this.$nextTick(() => {
        this.$refs.editForm.clearValidate()
      })
    },
    departFn(id) {
      this.$set(this.editForm, 'competentDepartmentId', id)
    },
  },
}
</script>

<template>
  <div class="info-contractor">
    <div
      class="leftCon"
      :style="`width: ${treeWidth}`"
    >
      <!-- 左侧树 隐藏掉承包商节点；使用disappear实现 -->
      <AllDepartmentTree
        slot="tree"
        ref="companyTree"
        :hasResponsible="false"
        disappear="CONTRACTOR"
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
            <el-form-item label="承包商名称">
              <el-input
                v-model="form.contractorName"
                placeholder="承包商名称"
              />
            </el-form-item>
          </el-col>
          <el-col
            :span="6"
            style="padding-left: 10px"
          >
            <el-form-item label="承包商类型">
              <el-select
                v-model="form.contractorType"
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
          <el-col
            v-if="form.showMore"
            :span="6"
            style="padding-left: 10px"
          >
            <el-form-item label="承包商状态">
              <el-select
                v-model="form.contractorStatus"
                placeholder="承包商状态"
                style="width: 100%"
              >
                <el-option
                  v-for="item in cbStaList"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="6"
            style="padding-left: 10px"
          >
            <el-form-item
              label="证书状态"
              label-width="60px"
            >
              <el-select
                v-model="form.certificateStatus"
                placeholder="证书状态"
                style="width: 100%"
              >
                <el-option
                  v-for="item in zsStaList"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 按钮 -->
          <el-col
            :span="12"
            style="padding-left: 10px; margin-bottom: 18px"
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
            <el-button
              type="text"
              style="margin-left: 8px"
              @click="toggleMore"
            >
              {{ form.showMore == true ? '收起' : '高级筛选' }}
              <i :class="form.showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
            </el-button>
          </el-col>
        </el-row>
      </el-form>
      <div class="main-box">
        <!-- 功能区域 -->
        <div>
          <el-button
            v-if="hasBtnPermission('contractor_info_add')"
            type="primary"
            icon="el-icon-plus"
            plain
            @click="addFn"
          >
            新增
          </el-button>
          <el-button
            v-if="hasBtnPermission('contractor_info_remind')"
            type="warning"
            plain
            @click="remindFn"
          >
            设置提醒
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
            prop="contractorName"
            align="center"
            width="90"
          />
          <!-- <el-table-column label="所属部门" prop="belongDepartmentName" align="center" /> -->
          <el-table-column
            label="主管部门"
            prop="competentDepartmentName"
            align="center"
          />
          <el-table-column
            label="地址"
            prop="contractorAddress"
            align="center"
          />
          <el-table-column
            label="负责人"
            prop="safetyDirector"
            align="center"
          />
          <el-table-column
            label="负责人联系电话"
            prop="safetyDirectorPhone"
            align="center"
            width="110"
          />
          <el-table-column
            label="承包商类型"
            prop="contractorType"
            align="center"
            width="90"
          >
            <template slot-scope="scope">
              <span>{{
                $dictUtils.getDictLabel('contractor_type', scope.row.contractorType)
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="承包商审核状态"
            prop="contractorStatus"
            align="center"
            width="110"
          >
            <template slot-scope="scope">
              <el-tag
                v-if="scope.row.contractorStatus == 0"
                size="mini"
                type="success"
              >
                合格承包商
              </el-tag>
              <el-tag
                v-if="scope.row.contractorStatus == 1"
                size="mini"
                type="warning"
              >
                准承包商
              </el-tag>
              <el-tag
                v-if="scope.row.contractorStatus == 2"
                size="mini"
                type="danger"
              >
                不合格承包商
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="证书状态"
            prop="certificateStatus"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag
                size="mini"
                :type="
                  scope.row.certificateStatus == 0
                    ? 'danger'
                    : scope.row.certificateStatus == 1
                      ? 'success'
                      : 'warning'
                "
              >
                {{ findZs(scope.row.certificateStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="红黄牌"
            prop="bookingsStatus"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag
                v-if="scope.row.bookingsStatus == 0"
                size="mini"
                type="danger"
              >
                红牌
              </el-tag>
              <el-tag
                v-if="scope.row.bookingsStatus == 1"
                size="mini"
                type="success"
              >
                绿牌
              </el-tag>
              <el-tag
                v-if="scope.row.bookingsStatus == 2"
                size="mini"
                type="warning"
              >
                黄牌
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="创建时间"
            prop="createdTime"
            align="center"
          />
          <el-table-column
            align="center"
            fixed="right"
            label="操作"
            width="120"
          >
            <template slot-scope="scope">
              <el-button
                v-if="
                  hasBtnPermission('contractor_info_applyReaudit') && scope.row.showApplyReaudit
                "
                type="text"
                @click="checkFn(scope.row, false)"
              >
                申请复核
              </el-button>
              <el-button
                v-if="hasBtnPermission('contractor_info_reaudit') && scope.row.showReaudit"
                type="text"
                @click="checkFn(scope.row, true)"
              >
                复核
              </el-button>
              <el-button
                v-if="hasBtnPermission('contractor_info_view')"
                type="text"
                @click="seeFn(scope.row)"
              >
                查看
              </el-button>
              <el-button
                v-if="hasBtnPermission('contractor_info_modify')"
                type="text"
                style="color: var(--ky-warning)"
                @click="editFn(scope.row)"
              >
                修改
              </el-button>
              <el-button
                v-if="hasBtnPermission('contractor_info_delete')"
                type="text"
                style="color: var(--ky-danger)"
                @click="delFn(scope.row)"
              >
                删除
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
      @open="openFn"
    >
      <el-form
        ref="editForm"
        :model="editForm"
        :rules="editRules"
        label-width="120px"
        size="mini"
        :disabled="!editable"
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
              <!-- <SelectTree
                                :props="{
                                    value: 'id', // ID字段名
                                    label: 'departmentName', // 显示名称
                                    children: 'children' // 子级字段名
                                }"
                                url="/sysDepartment/getSimpleTree"
                                :value="editForm.competentDepartmentId"
                                :clearable="true"
                                :accordion="true"
                                @getValue="departFn"
                            /> -->
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
                @getValue="departFn"
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
          <el-col
            v-if="editForm.bookingsStatus === 0 || editForm.bookingsStatus === 2"
            :span="24"
          >
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
            <el-tabs
              v-model="curTab"
              @tab-click="tabClick"
            >
              <!-- 资质证书 -->
              <el-tab-pane
                label="资质证书"
                name="ziZhi"
              >
                <div>
                  <el-button
                    type="primary"
                    plain
                    @click="addSub('ziZhi')"
                  >
                    添加资质证照
                  </el-button>
                </div>
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
                    label="有效开始时间"
                    prop="contractorQualificationStartTime"
                    align="center"
                    width="250"
                  >
                    <template slot-scope="scope">
                      <el-date-picker
                        v-model="scope.row.contractorQualificationStartTime"
                        style="width: 100%"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="有效结束时间"
                    prop="contractorQualificationEndTime"
                    align="center"
                    width="250"
                  >
                    <template slot-scope="scope">
                      <el-date-picker
                        v-model="scope.row.contractorQualificationEndTime"
                        style="width: 100%"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        @change="$event => effectTimeFn($event, scope.row)"
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
                        :isDel="editable"
                        uploadDes=""
                        :fileLimit="1"
                        :oldFileList="scope.row.oldFileList"
                        @upload="uploadEvt($event, 'ziZhi', scope.$index)"
                        @delSucc="fileDel('ziZhi', scope.$index)"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    align="center"
                    fixed="right"
                    label="操作"
                    width="120"
                  >
                    <template slot-scope="scope">
                      <el-button
                        type="text"
                        style="color: var(--ky-danger)"
                        @click="delSub('ziZhi', scope.$index)"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>

              <!-- 建安证 -->
              <el-tab-pane
                label="建安证"
                name="jianAn"
              >
                <div>
                  <el-button
                    type="primary"
                    plain
                    @click="addSub('jianAn')"
                  >
                    添加建安证
                  </el-button>
                </div>
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
                    label="有效开始时间"
                    prop="contractorQualificationStartTime"
                    align="center"
                    width="250"
                  >
                    <template slot-scope="scope">
                      <el-date-picker
                        v-model="scope.row.contractorQualificationStartTime"
                        style="width: 100%"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="有效结束时间"
                    prop="contractorQualificationEndTime"
                    align="center"
                    width="250"
                  >
                    <template slot-scope="scope">
                      <el-date-picker
                        v-model="scope.row.contractorQualificationEndTime"
                        style="width: 100%"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        @change="$event => effectTimeFn($event, scope.row)"
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
                        :isDel="editable"
                        uploadDes=""
                        :fileLimit="1"
                        :oldFileList="scope.row.oldFileList"
                        @upload="uploadEvt($event, 'jianAn', scope.$index)"
                        @delSucc="fileDel('jianAn', scope.$index)"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    align="center"
                    fixed="right"
                    label="操作"
                    width="120"
                  >
                    <template slot-scope="scope">
                      <el-button
                        type="text"
                        style="color: var(--ky-danger)"
                        @click="delSub('jianAn', scope.$index)"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>

              <!-- 保险 -->
              <el-tab-pane
                label="保险"
                name="baoXian"
              >
                <div>
                  <el-button
                    type="primary"
                    plain
                    @click="addSub('baoXian')"
                  >
                    添加保险
                  </el-button>
                </div>
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
                    label="有效开始时间"
                    prop="contractorQualificationStartTime"
                    align="center"
                    width="250"
                  >
                    <template slot-scope="scope">
                      <el-date-picker
                        v-model="scope.row.contractorQualificationStartTime"
                        style="width: 100%"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="有效结束时间"
                    prop="contractorQualificationEndTime"
                    align="center"
                    width="250"
                  >
                    <template slot-scope="scope">
                      <el-date-picker
                        v-model="scope.row.contractorQualificationEndTime"
                        style="width: 100%"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        @change="$event => effectTimeFn($event, scope.row)"
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
                        :isDel="editable"
                        uploadDes=""
                        :fileLimit="1"
                        :oldFileList="scope.row.oldFileList"
                        @upload="uploadEvt($event, 'baoXian', scope.$index)"
                        @delSucc="fileDel('baoXian', scope.$index)"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    align="center"
                    fixed="right"
                    label="操作"
                    width="120"
                  >
                    <template slot-scope="scope">
                      <el-button
                        type="text"
                        style="color: var(--ky-danger)"
                        @click="delSub('baoXian', scope.$index)"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>

              <!-- 合同 -->
              <el-tab-pane
                label="合同"
                name="heTong"
              >
                <div>
                  <el-button
                    type="primary"
                    plain
                    @click="addSub('heTong')"
                  >
                    添加合同
                  </el-button>
                </div>
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
                    label="有效开始时间"
                    prop="contractorQualificationStartTime"
                    align="center"
                    width="250"
                  >
                    <template slot-scope="scope">
                      <el-date-picker
                        v-model="scope.row.contractorQualificationStartTime"
                        style="width: 100%"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="有效结束时间"
                    prop="contractorQualificationEndTime"
                    align="center"
                    width="250"
                  >
                    <template slot-scope="scope">
                      <el-date-picker
                        v-model="scope.row.contractorQualificationEndTime"
                        style="width: 100%"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        @change="$event => effectTimeFn($event, scope.row)"
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
                        :isDel="editable"
                        uploadDes=""
                        :fileLimit="1"
                        :oldFileList="scope.row.oldFileList"
                        @upload="uploadEvt($event, 'heTong', scope.$index)"
                        @delSucc="fileDel('heTong', scope.$index)"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    align="center"
                    fixed="right"
                    label="操作"
                    width="120"
                  >
                    <template slot-scope="scope">
                      <el-button
                        type="text"
                        style="color: var(--ky-danger)"
                        @click="delSub('heTong', scope.$index)"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>

              <!-- 安全协议 -->
              <el-tab-pane
                label="安全协议"
                name="anQuan"
              >
                <div>
                  <el-button
                    type="primary"
                    plain
                    @click="addSub('anQuan')"
                  >
                    添加安全协议
                  </el-button>
                </div>
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
                  >
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.contractorQualificationCode" />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="有效开始时间"
                    prop="contractorQualificationStartTime"
                    align="center"
                    width="250"
                  >
                    <template slot-scope="scope">
                      <el-date-picker
                        v-model="scope.row.contractorQualificationStartTime"
                        style="width: 100%"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="有效结束时间"
                    prop="contractorQualificationEndTime"
                    align="center"
                    width="250"
                  >
                    <template slot-scope="scope">
                      <el-date-picker
                        v-model="scope.row.contractorQualificationEndTime"
                        style="width: 100%"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        @change="$event => effectTimeFn($event, scope.row)"
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
                        :isDel="editable"
                        uploadDes=""
                        :fileLimit="1"
                        :oldFileList="scope.row.oldFileList"
                        @upload="uploadEvt($event, 'anQuan', scope.$index)"
                        @delSucc="fileDel('anQuan', scope.$index)"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    align="center"
                    fixed="right"
                    label="操作"
                    width="120"
                  >
                    <template slot-scope="scope">
                      <el-button
                        type="text"
                        style="color: var(--ky-danger)"
                        @click="delSub('anQuan', scope.$index)"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
      </el-form>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialog = false">
          {{ editable ? '取消' : '关闭' }}
        </el-button>
        <el-button
          v-show="editable"
          type="primary"
          :loading="editLoading"
          @click="saveFn"
        >
          保存
        </el-button>
      </div>
    </el-dialog>

    <!-- 申请复核、复核 弹窗 -->
    <el-dialog
      class="normal-dialog edit-dialog"
      :title="isCheck ? '复核' : '申请复核'"
      :visible.sync="dialog_ch"
      width="70%"
    >
      <el-form
        :model="editForm"
        label-width="120px"
        size="mini"
        :disabled="!editable"
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
                url="/sysDepartment/getSimpleTree"
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
        </el-row>
      </el-form>

      <el-form
        ref="checkForm"
        :model="checkForm"
        :rules="checkRules"
        label-width="80px"
        size="mini"
      >
        <!-- 存在问题 -->
        <div>
          <div class="barSty">
            存在问题
          </div>
          <!-- 证照类 -->
          <div class="mb10">
            <span class="title-sty">证照类</span>
            <el-table
              :data="checkForm.existProblemList"
              style="width: 100%"
              border
              size="mini"
              :header-cell-style="{ background: '#f5f5f5' }"
              height="100%"
            >
              <el-table-column
                label="序号"
                type="index"
                align="center"
              />
              <el-table-column
                label="问题类型"
                prop="contractorQualificationType"
                align="center"
              >
                <template slot-scope="scope">
                  <span>{{
                    $dictUtils.getDictLabel('archive_type', scope.row.contractorQualificationType)
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column
                label="承包商资质证书"
                prop="contractorQualificationName"
                align="center"
                width="110"
              />
              <el-table-column
                label="资质证书编号"
                prop="contractorQualificationCode"
                align="center"
                width="100"
              />
              <el-table-column
                label="有效时间"
                prop=""
                align="center"
              />
              <el-table-column
                label="证书状态"
                prop="qualificationStatus"
                align="center"
              >
                <template slot-scope="scope">
                  <el-tag
                    v-if="scope.row.qualificationStatus == 0"
                    size="mini"
                    type="danger"
                  >
                    失效
                  </el-tag>
                  <el-tag
                    v-if="scope.row.qualificationStatus == 1"
                    size="mini"
                    type="success"
                  >
                    有效
                  </el-tag>
                  <el-tag
                    v-if="scope.row.qualificationStatus == 2"
                    size="mini"
                    type="warning"
                  >
                    即将失效
                  </el-tag>
                  <el-tag
                    v-if="scope.row.qualificationStatus == 3"
                    size="mini"
                    type="warning"
                  >
                    到期未审
                  </el-tag>
                  <el-tag
                    v-if="scope.row.qualificationStatus == 4"
                    size="mini"
                    type="warning"
                  >
                    即将复审
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                label="附件"
                prop="contractorQualificationFileName"
                align="center"
              />
            </el-table>
          </div>

          <!-- 三违考核 -->
          <div class="mb10">
            <span class="title-sty">三违考核</span>
            <el-table
              :data="checkForm.existIncentiveList"
              style="width: 100%"
              border
              size="mini"
              :header-cell-style="{ background: '#f5f5f5' }"
              height="100%"
            >
              <el-table-column
                label="序号"
                type="index"
                align="center"
              />
              <el-table-column
                label="日期"
                prop="assessDate"
                align="center"
              />
              <el-table-column
                label="发起人"
                prop="initiatorUserName"
                align="center"
              />
              <el-table-column
                label="发起人部门"
                prop="initiatorDepName"
                align="center"
                width="90"
              />
              <el-table-column
                label="考核类型"
                prop="assessType"
                align="center"
              />
              <el-table-column
                label="考核类别"
                prop="assessCategory"
                align="center"
              />
              <el-table-column
                label="被考核单位"
                prop="examineDepartmentName"
                align="center"
                width="90"
              />
              <el-table-column
                label="被考核人姓名"
                prop="examineUserName"
                align="center"
                width="100"
              />
              <el-table-column
                label="考核级别"
                prop="assessLevel"
                align="center"
              />
              <el-table-column
                label="考核金额"
                prop="assessTotalAmount"
                align="center"
              />
              <el-table-column
                label="事实描述"
                prop="factDes"
                align="center"
              />
              <el-table-column
                label="考核执行部门"
                prop="executeDepartmentName"
                align="center"
                width="100"
              />
              <el-table-column
                label="考核执行部门意见"
                prop=""
                align="center"
                width="120"
              />
              <el-table-column
                align="center"
                fixed="right"
                label="操作"
                width="60"
              >
                <template slot-scope="scope">
                  <el-button type="text">
                    查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 其他类原因 -->
          <el-row>
            <el-col :span="24">
              <el-form-item
                label="其他类原因"
                prop="otherReason"
              >
                <el-input
                  v-model="checkForm.otherReason"
                  type="textarea"
                  :rows="6"
                  placeholder="其他类原因"
                  :disabled="isCheck"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 整改问题 -->
        <div>
          <div class="barSty">
            整改问题
          </div>
          <!-- 证照类 -->
          <div class="mb10">
            <span class="title-sty">证照类</span>
            <el-table
              :data="checkForm.rectifyProblemList"
              style="width: 100%"
              border
              size="mini"
              :header-cell-style="{ background: '#f5f5f5' }"
              height="100%"
            >
              <el-table-column
                label="序号"
                type="index"
                align="center"
              />
              <el-table-column
                label="问题类型"
                prop="contractorQualificationType"
                align="center"
              >
                <template slot-scope="scope">
                  <span>{{
                    $dictUtils.getDictLabel('archive_type', scope.row.contractorQualificationType)
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column
                label="承包商资质证书"
                prop="contractorQualificationName"
                align="center"
                width="110"
              />
              <el-table-column
                label="资质证书编号"
                prop="contractorQualificationCode"
                align="center"
                width="100"
              />
              <el-table-column
                label="有效时间"
                prop=""
                align="center"
              />
              <el-table-column
                label="证书状态"
                prop="qualificationStatus"
                align="center"
              >
                <template slot-scope="scope">
                  <el-tag
                    v-if="scope.row.qualificationStatus == 0"
                    size="mini"
                    type="danger"
                  >
                    失效
                  </el-tag>
                  <el-tag
                    v-if="scope.row.qualificationStatus == 1"
                    size="mini"
                    type="success"
                  >
                    有效
                  </el-tag>
                  <el-tag
                    v-if="scope.row.qualificationStatus == 2"
                    size="mini"
                    type="warning"
                  >
                    即将失效
                  </el-tag>
                  <el-tag
                    v-if="scope.row.qualificationStatus == 3"
                    size="mini"
                    type="warning"
                  >
                    到期未审
                  </el-tag>
                  <el-tag
                    v-if="scope.row.qualificationStatus == 4"
                    size="mini"
                    type="warning"
                  >
                    即将复审
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                label="附件"
                prop="contractorQualificationFileName"
                align="center"
              />
            </el-table>
          </div>

          <!-- 三违考核 -->
          <div class="mb10">
            <span class="title-sty">三违考核</span>
            <el-table
              :data="checkForm.rectifyIncentiveList"
              style="width: 100%"
              border
              size="mini"
              :header-cell-style="{ background: '#f5f5f5' }"
              height="100%"
            >
              <el-table-column
                label="序号"
                type="index"
                align="center"
              />
              <el-table-column
                label="日期"
                prop="assessDate"
                align="center"
              />
              <el-table-column
                label="发起人"
                prop="initiatorUserName"
                align="center"
              />
              <el-table-column
                label="发起人部门"
                prop="initiatorDepName"
                align="center"
                width="90"
              />
              <el-table-column
                label="考核类型"
                prop="assessType"
                align="center"
              />
              <el-table-column
                label="考核类别"
                prop="assessCategory"
                align="center"
              />
              <el-table-column
                label="被考核单位"
                prop="examineDepartmentName"
                align="center"
                width="90"
              />
              <el-table-column
                label="被考核人姓名"
                prop="examineUserName"
                align="center"
                width="100"
              />
              <el-table-column
                label="考核级别"
                prop="assessLevel"
                align="center"
              />
              <el-table-column
                label="考核金额"
                prop="assessTotalAmount"
                align="center"
              />
              <el-table-column
                label="事实描述"
                prop="factDes"
                align="center"
              />
              <el-table-column
                label="考核执行部门"
                prop="executeDepartmentName"
                align="center"
                width="100"
              />
              <el-table-column
                label="考核执行部门意见"
                prop=""
                align="center"
                width="120"
              />
              <el-table-column
                align="center"
                fixed="right"
                label="操作"
                width="60"
              >
                <template slot-scope="scope">
                  <el-button type="text">
                    查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 其他类整改方案 -->
          <el-row>
            <el-col :span="24">
              <el-form-item
                label="其他类整改方案"
                prop="otherPlan"
                label-width="100px"
              >
                <el-input
                  v-model="checkForm.otherPlan"
                  type="textarea"
                  :rows="6"
                  placeholder="其他类整改方案"
                  :disabled="isCheck"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item
                label="上传附件"
                prop="filePath"
              >
                <FileUpload
                  :oldFileList="[]"
                  fileType="audit"
                  @upload="uploadOther($event, 'other')"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 申请复核 -->
        <div>
          <div class="barSty">
            申请复核
          </div>
          <el-row>
            <el-col :span="24">
              <el-form-item
                label="申请复核"
                prop="applyDesc"
              >
                <el-input
                  v-model="checkForm.applyDesc"
                  type="textarea"
                  :rows="6"
                  placeholder="申请复核"
                  :disabled="isCheck"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 复核 -->
        <div v-if="isCheck">
          <div class="barSty">
            复核
          </div>
          <el-row>
            <el-col :span="24">
              <el-form-item
                label="复核"
                prop="bookingsStatus"
              >
                <el-radio-group v-model="checkForm.bookingsStatus">
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
                label="复核备注"
                prop="reauditDesc"
              >
                <el-input
                  v-model="checkForm.reauditDesc"
                  type="textarea"
                  :rows="6"
                  placeholder="复核备注"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialog_ch = false">
          关闭
        </el-button>
        <el-button
          type="primary"
          :loading="load_ch"
          @click="checkDone"
        >
          保存
        </el-button>
      </div>
    </el-dialog>

    <!-- 设置提醒 弹窗 -->
    <el-dialog
      class="normal-dialog edit-dialog"
      title="设置提醒"
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
              label="提醒天数"
              prop="noticeDay"
              :rules="{
                required: true,
                message: '提醒天数不能为空',
                trigger: 'blur',
              }"
            >
              <el-input
                v-model="rmForm.noticeDay"
                placeholder="失效前多少天进行提醒"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="提醒人"
              prop="username"
            >
              <el-input
                v-model="rmForm.username"
                readonly
                @focus="choosePeople"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="提醒方式"
              prop="type"
            >
              <el-select
                v-model="rmForm.type"
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
.info-contractor {
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
    margin-bottom: 10px;
    &::before {
      display: inline-block;
      content: '';
      margin-right: 6px;
      width: 5px;
      height: 14px;
      background-color: #409eff;
    }
  }
  .mb10 {
    margin-bottom: 20px;
    .title-sty {
      display: inline-block;
      font-size: 12px;
      margin-bottom: 10px;
    }
  }
}
</style>
