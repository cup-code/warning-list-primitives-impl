<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import {
  auditAlarmInfo,
  auditAlarmInfoList,
  getAlarmInfoById,
  getHkAlarmList,
} from '@/http/hkAi-api'
import {
  getDangerSourceByPage,
  getImportantSourceByPage,
  mhsBindCamera,
} from '@/http/major-hazard/dangerSourceAnqi-api'
import { getCompanyList } from '@/http/safe-production/company-manage-api'
import {
  getAllDepartByCompanyFn,
  getDepartListSimple,
} from '@/http/safe-production/depart-manage-api'
import { getUsersByRoleFn } from '@/http/safe-production/user-manage-api'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import SafeBookInfo from '@/views/doubleDefense/shandong/safeCheck/components/SafeBookInfo'

export default {
  components: {
    CompanyTree,
    SelectTree,
    SafeBookInfo,
  },
  data() {
    return {
      form: {
        pageNum: 1,
        pageSize: 10,
        showMore: false,
        camId: '',
      },
      // 摄像头列表
      camList: [],
      // 审核结果
      resList: [{ name: '待审核' }, { name: '误报' }, { name: '属实' }],
      statusList: [
        { name: '待审核' },
        { name: '误报' },
        { name: '处理中' },
        { name: '已验收' },
      ],
      data: [],
      total: 0,
      dialog: false,
      dtForm: {},
      dtRules: {
        auditStatus: [{ required: true, message: '请选择结果', trigger: 'change' }],
      },
      dtLoading: false,

      at_dialog: false,
      atForm: {},
      atRules: {
        troubleTypeId: [{ required: true, message: '请选择隐患类型', trigger: 'change' }],
        hiddenDangerLevel: [
          { required: true, message: '请选择隐患登记', trigger: 'change' },
        ],
        location: [{ required: true, message: '请输入问题位置', trigger: 'blur' }],
        companyId: [{ required: true, message: '请选择所属公司', trigger: 'change' }],
        belongDepartmentId: [
          { required: true, message: '请选择所属部门', trigger: 'change' },
        ],
        rectificationDepartmentId: [
          { required: true, message: '请选择整改部门', trigger: 'change' },
        ],
        rectificationUserId: [
          { required: true, message: '请选择整改责任人', trigger: 'change' },
        ],
        rectificationEndDate: [
          { required: true, message: '请选择整改期限', trigger: 'blur' },
        ],
      },
      atLoading: false,

      companyList: [], // 所属公司list：所属公司默认为当前人的公司，可以选择其他公司
      departList: [], // 所属部门list
      departList02: [], // 整改部门list：登录用户拥有的部门权限list
      userList: [], // 整改责任人list：整改负责人，可以选当前权限公司所有人

      at_dt_dialog: false, // 报警处理详情弹窗
      propData: {}, // 传递给详情页面的数据
      hazardTypeList: [
        { dictCode: 1, dictName: '重大危险源' },
        { dictCode: 2, dictName: '重要危险源' },
      ],
      hazardList: [], // 重大、重要危险源list
      // 存储重大、重要危险源后台数据list
      hazardMap: {
        danger: [],
        important: [],
      },
      // 是否全选
      isAll: false,
      hideLeft: false,
      treeWidth: '240px',
      conWidth: 'calc(100% - 240px)',
    }
  },
  created() {
    this.getPrefix()

    this.companyId = this.$store.state.user.user.companyId
    // 获取所属公司的选择列表：所有的公司
    getCompanyList().then(({ data }) => {
      this.companyList = data.result || []
    })
    // 获取所属部门部门list：当前人公司的所有组织架构
    getAllDepartByCompanyFn(this.companyId).then(({ data }) => {
      this.departList = data.result || []
    })
    // 获取整改部门list
    getDepartListSimple().then(({ data }) => {
      this.departList02 = data.result || []
    })
    getUsersByRoleFn().then(({ data }) => {
      // 节点类型:0-公司;1-部门;2-岗位;3-用户
      this.userList = data.result.filter((item) => {
        return item.type === '3'
      })
    })
  },
  methods: {
    async getDataList() {
      if (this.form.camId) {
        this.form.camIds = this.form.camId
      }
      const { data } = await getHkAlarmList(this.form)
      if (data.code == 200) {
        this.data = (data.result.list || []).map((item) => {
          item.checked = false
          return item
        })
        this.total = data.result.total
        if (this.data.length === 0) {
          this.$message.error('暂无数据')
        }
      }
      else {
        this.$message.error(data.message || '查询失败')
        this.data = []
        this.total = 0
      }
    },
    async getCameraList(params) {
      const { data } = await mhsBindCamera(params)
      if (data.code === 200) {
        this.camList = data.result || []
        this.form.camIds = this.camList.map(item => item.cameraId).join(',')
      }
      else {
        this.camList = []
        this.form.camIds = ''
      }
      this.form.camId = ''
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
    toggleMore() {
      this.form.showMore = !this.form.showMore
    },
    // 重置
    resetFn() {
      this.form = {
        pageNum: 1,
        pageSize: 10,
        showMore: false,
        companyId: this.form.companyId || '',
        camId: '',
      }
      this.hazardList = []
      this.camList = []

      this.getDataList()
    },
    itemTap(item) {
      this.dialog = true
      getAlarmInfoById(item.id)
        .then(({ data }) => {
          if (data.code === 200 && data.result) {
            this.dtForm = data.result
          }
          else {
            this.dtForm = {}
          }
        })
        .catch((err) => {
          this.dtForm = {}
        })
    },
    // 提交审核(只针对 误报)
    detailFn() {
      this.$refs.dtForm.validate((valid) => {
        if (!valid)
          return
        this.dtLoading = true

        const { id: alarmInfoId, auditRes: auditResult } = this.dtForm
        const params = { alarmInfoId, auditResult }

        auditAlarmInfo(params).then(({ data }) => {
          this.dtLoading = false
          if (data.code === 200) {
            this.dialog = false
            this.getDataList()
          }
          else {
            this.$message.error(data.message || '审核失败')
          }
        })
      })
    },
    treeNodeTap(data) {
      if (data) {
        this.form.companyId = data.id
        this.getMajorHazardList(data.id)
      }
      else {
        delete this.form.companyId
      }
      this.form.hazardType = ''
      this.form.hazardId = ''
      this.form.camIds = ''
      this.form.camId = ''
      this.hazardList = []
      this.camList = []
    },
    // 确认审核（只针对 属实）
    auditFn() {
      this.$refs.atForm.validate((valid) => {
        if (!valid)
          return
        this.atLoading = true

        const {
          id: alarmInfoId,
          auditRes: auditResult,
          pic,
        } = this.dtForm
        const params = { alarmInfoId, auditResult, pic, ...this.atForm }

        auditAlarmInfo(params)
          .then(({ data }) => {
            this.atLoading = false
            if (data.code === 200) {
              this.at_dialog = false
              this.dialog = false
              this.getDataList()
            }
            else {
              this.$message.error(data.message || '审核失败')
            }
          })
          .catch((err) => {
            this.$message.error('审核失败！')
          })
      })
    },
    radioFn(v) {
      if (v === '属实') {
        this.at_dialog = true
        this.atForm = {}
      }
    },
    getAllDepartByCompany(val) {
      this.atForm.companyId = val
      if (!val) {
        this.departList = []
      }
      getAllDepartByCompanyFn(val).then(({ data }) => {
        this.departList = data.result || []
      })
    },
    // 产看详情
    atDetailFn() {
      this.propData = {
        troubleId: this.dtForm.troubleId,
        isDevice: true,
      }

      this.at_dt_dialog = true
    },
    // 查询按钮
    searchFn() {
      // 必须选择公司
      if (!this.form.companyId) {
        this.$message.warning('请选择公司!')
        return
      }
      this.form.pageNum = 1
      this.form.pageSize = 10
      this.getDataList()
    },
    // 危险源类型变化事件
    hazardTypeFn(v) {
      if (v == 1) {
        this.hazardList = this.hazardMap.danger
      }
      else if (v == 2) {
        this.hazardList = this.hazardMap.important
      }
      this.getCameraList({
        companyId: this.form.companyId,
        hazardId: this.form.hazardId,
        hazardType: v,
      })
      this.form.hazardId = ''
    },
    // 危险源变化事件
    hazardFn(v) {
      this.getCameraList({
        companyId: this.form.companyId,
        hazardId: v,
        hazardType: this.form.hazardType,
      })
    },
    // 获取重大、重要危险源list
    getMajorHazardList(companyId) {
      getDangerSourceByPage({
        companyId,
        isPage: false,
        pageNum: 1,
        pageSize: 10,
      }).then(({ data }) => {
        if (data.success) {
          this.hazardMap.danger = data.result.list || []
        }
      })
      getImportantSourceByPage({
        companyId,
        isPage: false,
        pageNum: 1,
        pageSize: 10,
      }).then(({ data }) => {
        if (data.success) {
          this.hazardMap.important = data.result.list || []
        }
      })
    },
    // 全选change
    allFn(v) {
      this.data.forEach((item) => {
        item.checked = v
      })
    },
    // 批量审核
    bulkAudit() {
      const temp = this.data.filter(item => item.checked)
      if (temp.length === 0) {
        this.$message.error('请先勾选要审核的报警！')
        return
      }

      const params = temp.map(item => ({
        alarmInfoId: item.id,
        auditResult: '误报',
      }))
      this.$confirm('确认做误报处理么?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          auditAlarmInfoList(params)
            .then(({ data }) => {
              if (data.success === true) {
                this.$message.success('审核成功')
                this.getDataList()
              }
              else {
                this.$message.error(data.message || '审核失败')
              }
            })
            .catch((err) => {
              this.$message.error('审核失败')
            })
        })
        .catch(() => {})
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
  <div class="videoWatchAnqi-majorHazard">
    <div class="leftCon" :style="`width: ${treeWidth}`">
      <CompanyTree @treeNodeTap="treeNodeTap" />
      <div class="toggle-btn" @click="toggleLeftFn">
        {{ hideLeft ? "展开" : "隐藏" }}
      </div>
    </div>

    <div class="rightCon" :style="`width: ${conWidth}`">
      <!-- 查询条件 -->
      <el-form
        :model="form"
        label-width="60px"
        class="searchForm"
      >
        <el-row>
          <el-col :span="8">
            <el-form-item label="危险源类型" label-width="72px">
              <el-select
                v-model="form.hazardType"
                placeholder="危险源类型"
                style="width: 100%"
                @change="hazardTypeFn"
              >
                <el-option
                  v-for="item in hazardTypeList"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" style="padding-left: 10px">
            <el-form-item label="危险源名称" label-width="72px">
              <el-select
                v-model="form.hazardId"
                placeholder="危险源名称"
                style="width: 100%"
                @change="hazardFn"
              >
                <el-option
                  v-for="item in hazardList"
                  :key="item.id"
                  :label="item.unifyName || item.unitName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="8"
            style="padding-left: 10px"
          >
            <el-form-item label="摄像头">
              <el-select
                v-model="form.camId"
                placeholder="摄像头"
                style="width: 100%"
              >
                <el-option
                  v-for="item in camList"
                  :key="item.id"
                  :label="item.camName"
                  :value="item.cameraId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="form.showMore" :span="8">
            <el-form-item label="审核结果" prop="auditRes">
              <el-select
                v-model="form.auditRes"
                placeholder="审核结果"
                style="width: 100%"
              >
                <el-option
                  v-for="item in resList"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="8"
            style="padding-left: 10px"
          >
            <el-form-item label="报警类型" prop="aiAlarmType">
              <el-select
                v-model="form.aiAlarmType"
                placeholder="报警类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('aiAlarmType')"
                  :key="item.id"
                  :label="item.dictName"
                  :value="item.dictName"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="8"
            style="padding-left: 10px"
          >
            <el-form-item label="开始时间" prop="startDate">
              <el-date-picker
                v-model="form.startDate"
                style="width: 100%"
                placeholder="开始时间"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col v-if="form.showMore" :span="8">
            <el-form-item label="截止时间">
              <el-date-picker
                v-model="form.endDate"
                style="width: 100%"
                placeholder="截止时间"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                clearable
              />
            </el-form-item>
          </el-col>

          <!-- 按钮 -->
          <el-col :span="8" style="padding-left: 10px; margin-bottom: 18px">
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="searchFn"
            >
              查询
            </el-button>
            <el-button icon="el-icon-refresh-right" @click="resetFn">
              重置
            </el-button>
            <el-button
              type="text"
              style="margin-left: 8px"
              @click="toggleMore"
            >
              {{ form.showMore == true ? "收起" : "高级筛选" }}
              <i :class="form.showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
            </el-button>
          </el-col>
        </el-row>
      </el-form>

      <div class="main-box">
        <!-- 功能区域 -->
        <div style="margin-bottom: 10px">
          <el-checkbox
            v-model="isAll"
            class="all-btn"
            @change="allFn"
          >
            全选
          </el-checkbox>
          <el-button
            type="primary"
            plain
            @click="bulkAudit"
          >
            批量审核
          </el-button>
        </div>
        <!-- 内容 -->
        <div class="con">
          <el-row>
            <el-col
              v-for="item in data"
              :key="item.id"
              :span="6"
              class="item-col"
            >
              <div class="item" @click="itemTap(item)">
                <!-- 勾选框 -->
                <div class="sel-box" @click.stop>
                  <el-checkbox v-model="item.checked" />
                </div>

                <el-popover
                  placement="bottom"
                  trigger="hover"
                  popper-class="videoAi-pop"
                >
                  <img :src="filePrefix + item.pic" style="height: 150px">
                  <img slot="reference" :src="filePrefix + item.pic">
                </el-popover>

                <div class="right">
                  <el-tag
                    :type="
                      item.auditStatus === '待审核'
                        ? 'warning'
                        : item.auditStatus === '已验收'
                          ? 'success'
                          : item.auditStatus === '误报'
                            ? 'info'
                            : 'danger'
                    "
                  >
                    {{ item.auditStatus }}
                  </el-tag>
                  <div>
                    <i class="el-icon-time" />
                    <span>{{ item.createdTime }}</span>
                  </div>
                  <div>
                    <i class="el-icon-location-outline" />
                    <span>{{ item.camName }}</span>
                  </div>
                  <div>
                    <i class="el-icon-warning-outline" />
                    <span>{{ item.alarmInfo }}</span>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 分页 -->
        <el-pagination
          style="text-align: right"
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

    <!-- 报警详情 -->
    <el-dialog
      class="normal-dialog detail-dialog"
      title="报警详情"
      :visible.sync="dialog"
      width="50%"
    >
      <el-form
        ref="dtForm"
        :model="dtForm"
        :rules="dtRules"
        label-width="80px"
        size="mini"
      >
        <el-row>
          <el-col :span="14">
            <img :src="filePrefix + dtForm.pic" style="width: 100%">
          </el-col>
          <el-col :span="10">
            <el-form-item label="所属公司:">
              <span>{{ dtForm.companyName }}</span>
            </el-form-item>
            <el-form-item label="抓拍时间:">
              <span>{{ dtForm.createdTime }}</span>
            </el-form-item>
            <el-form-item label="抓拍地点:">
              <span>{{ dtForm.camName }}</span>
            </el-form-item>
            <el-form-item label="抓拍设备:">
              <span>{{ dtForm.camName }}</span>
            </el-form-item>
            <el-form-item label="告警类型:">
              <span>{{ dtForm.aiAlarmType }}</span>
            </el-form-item>
            <el-form-item v-if="dtForm.hiddenDangerLevel" label="隐患等级:">
              <span>{{
                $dictUtils.getDictLabelById("hiddenDangerLevel", dtForm.hiddenDangerLevel)
              }}</span>
            </el-form-item>
            <!-- auditRes：待审核、误报、属实 -->
            <el-form-item label="审核结果:" prop="auditRes">
              <el-radio-group
                v-model="dtForm.auditRes"
                :disabled="dtForm.auditStatus !== '待审核'"
                @change="radioFn"
              >
                <el-radio label="误报" />
                <el-radio label="属实" />
              </el-radio-group>
            </el-form-item>
            <!-- auditStatus：待审核、误报、处理中、已验收 -->
            <el-form-item label="状态:">
              <el-tag
                :type="
                  dtForm.auditStatus === '待审核'
                    ? 'warning'
                    : dtForm.auditStatus === '已验收'
                      ? 'success'
                      : dtForm.auditStatus === '误报'
                        ? 'info'
                        : 'danger'
                "
              >
                {{ dtForm.auditStatus }}
              </el-tag>
            </el-form-item>

            <el-form-item
              v-if="dtForm.auditStatus === '已验收' || dtForm.auditStatus === '处理中'"
              label="详情:"
            >
              <el-button type="text" @click="atDetailFn">
                查看详情
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog = false">
          取消
        </el-button>
        <el-button
          v-show="dtForm.auditStatus === '待审核' && dtForm.auditRes === '误报'"
          type="primary"
          :loading="dtLoading"
          @click="detailFn"
        >
          提交审核
        </el-button>
      </div>
    </el-dialog>

    <!-- 审核弹窗 -->
    <el-dialog
      class="normal-dialog audit-dialog"
      title="审核视频报警记录"
      :visible.sync="at_dialog"
      width="70%"
    >
      <el-form
        ref="atForm"
        :model="atForm"
        :rules="atRules"
        label-width="85px"
        size="mini"
      >
        <div>
          <div class="barSty">
            隐患信息
          </div>
          <el-row>
            <el-col :span="12">
              <el-form-item label="隐患类型" prop="troubleTypeId">
                <el-select
                  v-model="atForm.troubleTypeId"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in $dictUtils.getDictList('troubleType_yhlx')"
                    :key="item.dictCode"
                    :label="item.dictName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="报警类别" prop="aiAlarmType">
                <el-select
                  v-model="atForm.aiAlarmType"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in $dictUtils.getDictList('aiAlarmType')"
                    :key="item.id"
                    :label="item.dictName"
                    :value="item.dictCode"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="问题位置">
                <el-input v-model="dtForm.location" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="所属公司">
                <el-input v-model="dtForm.companyName" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="所属部门">
                <el-input v-model="dtForm.b" disabled />
              </el-form-item>
            </el-col>
            <el-col v-if="atForm.aiAlarmType == 1" :span="12">
              <el-form-item label="隐患等级" prop="hiddenDangerLevel">
                <el-radio-group v-model="atForm.hiddenDangerLevel">
                  <el-radio-button
                    v-for="item in $dictUtils.getDictList('hiddenDangerLevel')"
                    :key="item.dictCode"
                    :label="item.dictCode"
                  >
                    {{ item.dictName }}
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col v-if="atForm.aiAlarmType == 2" :span="12">
              <el-form-item label="负责人">
                <el-input v-model="dtForm.a" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="问题描述" prop="description">
                <el-input
                  v-model="atForm.description"
                  placeholder="问题描述"
                  type="textarea"
                  :rows="6"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div v-if="atForm.aiAlarmType == 1">
          <div class="barSty">
            整改信息
          </div>
          <el-row>
            <el-col :span="24">
              <el-form-item label="整改部门" prop="rectificationDepartmentId">
                <SelectTree
                  :props="{
                    value: 'id', // ID字段名
                    label: 'departmentName', // 显示名称
                    children: 'children', // 子级字段名
                  }"
                  :list="departList02"
                  :value="atForm.rectificationDepartmentId"
                  :clearable="true"
                  :accordion="true"
                  @getValue="
                    (value) => {
                      atForm.rectificationDepartmentId = value;
                    }
                  "
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="整改责任人" prop="rectificationUserId">
                <el-select
                  v-model="atForm.rectificationUserId"
                  placeholder="请选择"
                  style="width: 100%"
                  filterable
                >
                  <el-option
                    v-for="item in userList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="整改期限" prop="rectificationEndDate">
                <el-date-picker
                  v-model="atForm.rectificationEndDate"
                  type="date"
                  placeholder="整改期限"
                  style="width: 100%"
                  value-format="yyyy-MM-dd"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="整改意见" prop="rectificationOpinions">
                <el-input
                  v-model="atForm.rectificationOpinions"
                  placeholder="整改意见"
                  type="textarea"
                  :rows="6"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>

      <div style="margin-top: -10px; margin-bottom: 10px">
        <el-alert
          title="提示：审核后，将无法进行修改，请确认后再保存"
          type="warning"
          show-icon
          :closable="false"
        />
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="at_dialog = false">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="atLoading"
          @click="auditFn"
        >
          确认审核
        </el-button>
      </div>
    </el-dialog>

    <!-- 报警处理详情 弹窗 -->
    <el-dialog
      class="normal-dialog audit-dialog"
      title="异常详情"
      :visible.sync="at_dt_dialog"
      width="60%"
    >
      <SafeBookInfo v-if="at_dt_dialog" v-bind="propData" />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.videoWatchAnqi-majorHazard {
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
      height: 100% !important;
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
      .con {
        flex: 1;
        overflow: auto;
        margin-bottom: 10px;
        border-bottom: 1px solid #ebeef5;
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
  .el-form {
    margin-bottom: 10px;
  }
  .item-col {
    margin-bottom: 20px;
    .item {
      position: relative;
      height: 90px;
      display: flex;
      margin-right: 10px;
      cursor: pointer;
      & > span {
        width: 50%;
        .el-popover__reference-wrapper {
          display: block;
          width: 100%;
          height: 100%;
          img {
            width: 100%;
            height: 100%;
          }
        }
      }
      .right {
        width: 50%;
        padding-left: 10px;

        & > div {
          padding-top: 6px;
          line-height: 16px;
          display: flex;
          align-items: center;
          i {
            font-weight: bold;
            margin-right: 4px;
          }
          span {
            overflow: auto;
            white-space: nowrap;
            // chrome浏览器隐藏滚动条
            &::-webkit-scrollbar {
              display: none;
            }
            // 火狐浏览器的滚动条隐藏
            scrollbar-width: none;
          }
        }
      }
    }
  }
  .sel-box {
    position: absolute;
    top: 0;
    left: 0;
  }
  .all-btn {
    .el-checkbox__label {
      padding-left: 6px;
      padding-right: 10px;
    }
  }
}
.videoAi-pop {
  border: none;
  background: #000;
}

.normal-dialog.detail-dialog,
.normal-dialog.audit-dialog {
  .el-dialog__header {
    min-height: 46px;
    .el-dialog__title {
      font-size: 16px;
      &::before {
        height: 20px;
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
}
.normal-dialog.detail-dialog {
  .el-form-item {
    margin-bottom: 6px;
  }
}
.normal-dialog.audit-dialog {
  .barSty {
    display: flex;
    align-items: center;
    font-weight: bold;
    margin-bottom: 10px;
    &::before {
      display: inline-block;
      content: "";
      margin-right: 6px;
      width: 5px;
      height: 14px;
      background-color: #409eff;
    }
  }
}
</style>
