<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { auditAlarmInfo, getAlarmInfoById } from '@/http/hkAi-api'
import { getCompanyList } from '@/http/safe-production/company-manage-api'
import {
  getAllDepartByCompanyFn,
  getDepartListSimple,
} from '@/http/safe-production/depart-manage-api'
import { getUsersByRoleFn } from '@/http/safe-production/user-manage-api'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import SafeBookInfo from '@/views/doubleDefense/shandong/safeCheck/components/SafeBookInfo'
import { getAbnormalTable } from './alarmCenter-api.js'

export default {
  name: 'alarmCenter',
  components: {
    CompanyTree,
    SelectTree,
    SafeBookInfo,
  },
  data() {
    return {
      isLoading: false,
      total: 0,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        alarmInfo: '',
        alarmType: '',
        startDate: '',
        endDate: '',
        state: '',
      },
      typeLists: [
        { label: 'AI报警', value: 0 },
        { label: 'DCS报警', value: 1 },
        { label: '安全隐患', value: 2 },
        { label: '设备巡检异常', value: 3 },
      ],
      stateLists: [
        { label: '待审核', value: 0 },
        { label: '处理中', value: 1 },
        { label: '已完成', value: 2 },
      ],
      tableData: [],
      AiDialog: false, // ai报警的审核弹框
      dtForm: {}, // ai报警审核弹框的详情
      dtRules: {
        auditStatus: [{ required: true, message: '请选择结果', trigger: 'change' }],
      },
      dtLoading: false,
      at_dialog: false,
      atForm: {},
      atRules: {
        troubleTypeId: [{ required: true, message: '请选择隐患类型', trigger: 'change' }],
        hiddenDangerLevel: [{ required: true, message: '请选择隐患登记', trigger: 'change' }],
        location: [{ required: true, message: '请输入问题位置', trigger: 'blur' }],
        companyId: [{ required: true, message: '请选择所属公司', trigger: 'change' }],
        belongDepartmentId: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
        rectificationDepartmentId: [
          { required: true, message: '请选择整改部门', trigger: 'change' },
        ],
        rectificationUserId: [{ required: true, message: '请选择整改责任人', trigger: 'change' }],
        rectificationEndDate: [{ required: true, message: '请选择整改期限', trigger: 'blur' }],
      },
      atLoading: false,
      companyList: [], // 所属公司list：所属公司默认为当前人的公司，可以选择其他公司
      departList: [], // 所属部门list
      departList02: [], // 整改部门list：登录用户拥有的部门权限list
      userList: [], // 整改责任人list：整改负责人，可以选当前权限公司所有人
      showInfoDialog: false, // 如果审核之后是问题或隐患，查看详情的弹框
      propData: {}, // 传递给详情页面的数据
    }
  },
  created() {
    this.getPrefix()
    this.getTableData()
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
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data.onlyTreeUse)
        return
      if (data) {
        this.searchData.companyId = data.id
      }
      else {
        this.searchData.companyId = ''
      }
      this.getTableData()
    },
    searchFn() {
      this.searchData.pageNum = 1
      this.getTableData()
    },
    getTableData() {
      this.isLoading = true
      getAbnormalTable(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.total = data.result.total || 0
            this.tableData = data.result.list || []
            this.tableData.forEach((item) => {
              item.processedUsers = item.processedUserNameList.toString()
              for (const i of this.typeLists) {
                if (i.value == item.alarmType) {
                  item.alarmTypeInfo = i.label
                }
              }
              for (const i of this.stateLists) {
                if (i.value == item.state) {
                  item.stateInfo = i.label
                }
              }
            })
          }
          else {
            this.$message.warning(data.message || '获取列表数据失败')
          }
        })
        .catch((err) => {
          console.log(err)
          this.$message.error('获取列表数据出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    // 审核
    auditFn(item) {
      if (item.alarmType === 0) {
        this.AiDialog = true
        getAlarmInfoById(item.bussinessId)
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
      }
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
    // 提交审核(只针对ai报警的误报)
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
            this.AiDialog = false
            this.getTableData()
          }
          else {
            this.$message.error(data.message || '审核失败')
          }
        })
      })
    },
    // 确认审核（只针对 ai报警属实）
    auditAiFn() {
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
              this.AiDialog = false
              this.getTableData()
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
    // 查看详情
    viewFn(item) {
      this.propData = {
        troubleId: item.processingId,
        isDevice: true,
      }
      this.showInfoDialog = true
    },
  },
}
</script>

<template>
  <!--  报警中心页面 -->
  <KyTreeTable v-loading="isLoading">
    <!-- 左侧树 -->
    <CompanyTree
      slot="tree"
      ref="companyTree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <ECard
      slot="search"
      type="search"
    >
      <el-form
        inline
        label-width="100"
        class="fromClass"
      >
        <el-row>
          <el-form-item label="异常信息">
            <el-input
              v-model="searchData.alarmInfo"
              placeholder="输入异常信息"
              clearable
            />
          </el-form-item>
          <el-form-item label="异常类型">
            <el-select
              v-model="searchData.alarmType"
              class="small-box"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="item in typeLists"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchData.state"
              class="small-box"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="item in stateLists"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="异常开始时间">
            <el-date-picker
              v-model="searchData.startDate"
              class="time-box"
              type="datetime"
              clearable
              value-format="yyyy-MM-dd HH:mm:ss"
              format="yyyy-MM-dd HH:mm:ss"
              placeholder="选择开始时间"
            />
          </el-form-item>
          <el-form-item label="异常结束时间">
            <el-date-picker
              v-model="searchData.endDate"
              class="time-box"
              type="datetime"
              clearable
              value-format="yyyy-MM-dd HH:mm:ss"
              format="yyyy-MM-dd HH:mm:ss"
              placeholder="选择开始时间"
            />
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="searchFn"
            >
              查询
            </el-button>
          </el-form-item>
        </el-row>
      </el-form>
    </ECard>

    <!-- 表格 -->
    <ECard slot="table">
      <el-table
        :data="tableData"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        align="center"
        height="90%"
      >
        <el-table-column
          type="index"
          width="50"
          align="center"
          label="序号"
        />
        <el-table-column
          label="所属公司"
          align="center"
          prop="companyName"
        />
        <el-table-column
          label="异常信息"
          align="center"
          prop="alarmInfo"
          min-width="180"
        />
        <el-table-column
          label="异常类型"
          align="center"
          prop="alarmTypeInfo"
          min-width="120"
        />
        <el-table-column
          label="异常时间"
          align="center"
          prop="alarmTime"
          min-width="160"
        />
        <el-table-column
          label="状态"
          align="center"
          prop="stateInfo"
        />
        <el-table-column
          label="处理人"
          align="center"
          prop="processedUsers"
        />
        <el-table-column
          label="完成时间"
          align="center"
          prop="processedTime"
          min-width="160"
        />
        <el-table-column
          label="操作"
          min-width="150"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <!-- <el-button @click="auditFn(scope.row)" type="text" v-if="scope.row.state === 0">审核</el-button> -->
            <!-- 只有在处理中或者已完成并且不是误报的，才能查看详情 -->
            <el-button
              v-if="
                scope.row.state === 1
                  || (scope.row.state === 2 && scope.row.processingId !== scope.row.bussinessId)
                  || scope.row.alarmType === 2
              "
              type="text"
              @click="viewFn(scope.row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <!-- 分页器 -->
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        :current-page.sync="searchData.pageNum"
        :page-sizes="[10, 20, 50]"
        :page-size.sync="searchData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getTableData"
        @current-change="getTableData"
      />
    </ECard>

    <!-- AI报警的审核弹框详情 -->
    <el-dialog
      slot="dialog"
      class="normal-dialog detail-dialog"
      title="报警详情"
      :visible.sync="AiDialog"
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
            <img
              :src="filePrefix + dtForm.pic"
              style="width: 100%"
            >
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
            <el-form-item
              v-if="dtForm.hiddenDangerLevel"
              label="隐患等级:"
            >
              <span>{{
                $dictUtils.getDictLabelById('hiddenDangerLevel', dtForm.hiddenDangerLevel)
              }}</span>
            </el-form-item>
            <!-- auditRes：待审核、误报、属实 -->
            <el-form-item
              label="审核结果:"
              prop="auditRes"
            >
              <el-radio-group
                v-model="dtForm.auditRes"
                :disabled="dtForm.auditStatus !== '待审核'"
                @change="radioFn"
              >
                <el-radio label="误报" />
                <el-radio label="属实" />
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="AiDialog = false">
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
      slot="dialog"
      class="normal-dialog audit-dialog"
      title="审核视频报警记录"
      :visible.sync="at_dialog"
      width="40%"
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
            <el-col :span="24">
              <el-form-item
                label="隐患类型"
                prop="troubleTypeId"
              >
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
            <el-col :span="24">
              <el-form-item
                label="隐患等级"
                prop="hiddenDangerLevel"
              >
                <el-radio-group v-model="atForm.hiddenDangerLevel">
                  <el-radio
                    v-for="item in $dictUtils.getDictList('hiddenDangerLevel')"
                    :key="item.dictCode"
                    :label="item.id"
                  >
                    {{ item.dictName }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item
                label="问题位置"
                prop="location"
              >
                <el-input
                  v-model="atForm.location"
                  placeholder="问题位置"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item
                label="所属公司"
                prop="companyId"
              >
                <SelectTree
                  :props="{
                    value: 'id', // ID字段名
                    label: 'companyName', // 显示名称
                    children: 'children', // 子级字段名
                  }"
                  :list="companyList"
                  :value="atForm.companyId"
                  :clearable="true"
                  :accordion="true"
                  @getValue="
                    value => {
                      getAllDepartByCompany(value)
                    }
                  "
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item
                label="所属部门"
                prop="belongDepartmentId"
              >
                <SelectTree
                  :props="{
                    value: 'id', // ID字段名
                    label: 'departmentName', // 显示名称
                    children: 'children', // 子级字段名
                  }"
                  :list="departList"
                  :value="atForm.belongDepartmentId"
                  :clearable="true"
                  :accordion="true"
                  @getValue="
                    value => {
                      atForm.belongDepartmentId = value
                    }
                  "
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item
                label="问题描述"
                prop="description"
              >
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

        <div>
          <div class="barSty">
            整改信息
          </div>
          <el-row>
            <el-col :span="24">
              <el-form-item
                label="整改部门"
                prop="rectificationDepartmentId"
              >
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
                    value => {
                      atForm.rectificationDepartmentId = value
                    }
                  "
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item
                label="整改责任人"
                prop="rectificationUserId"
              >
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
              <el-form-item
                label="整改期限"
                prop="rectificationEndDate"
              >
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
              <el-form-item
                label="整改意见"
                prop="rectificationOpinions"
              >
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

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="at_dialog = false">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="atLoading"
          @click="auditAiFn"
        >
          确认审核
        </el-button>
      </div>
    </el-dialog>
    <!-- 查看详情的弹窗 -->
    <div slot="dialog">
      <el-dialog
        class="large-dialog"
        :visible.sync="showInfoDialog"
        :close-on-click-modal="false"
      >
        <div
          slot="title"
          class="dialog-header"
        >
          <div class="dialog-title">
            异常详情
          </div>
        </div>
        <SafeBookInfo
          v-if="showInfoDialog"
          v-bind="propData"
        />
      </el-dialog>
    </div>
  </KyTreeTable>
</template>

<style scoped lang="scss">
.small-box {
  width: 100px;
}
.time-box {
  width: 200px;
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
.dialog-header {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .dialog-title {
    font-size: 20px;
    font-weight: bold;
  }
}
</style>
