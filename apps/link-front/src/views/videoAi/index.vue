<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import {
  auditAlarmInfo,
  getAlarmInfoById,
  getHkAlarmList,
  getHkCameraList,
} from '@/http/hkAi-api'
import { getCompanyList } from '@/http/safe-production/company-manage-api'
import {
  getAllDepartByCompanyFn,
  getDepartListSimple,
} from '@/http/safe-production/depart-manage-api'
import { getUsersByRoleFn } from '@/http/safe-production/user-manage-api'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import SafeBookInfo from '@/views/doubleDefense/shandong/safeCheck/components/SafeBookInfo'
import WarningInfo from './components/warningInfo.vue'

export default {
  components: {
    CompanyTree,
    SelectTree,
    WarningInfo,
    SafeBookInfo,
  },
  data() {
    return {
      form: {
        pageNum: 1,
        pageSize: 12,
        showMore: false,
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
      showDetail: false,
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
      hideLeft: false,
      treeWidth: '240px',
      conWidth: 'calc(100% - 240px)',
    }
  },
  created() {
    this.getPrefix()
    this.getDataList()
    this.getCameraList()

    this.companyId = this.$store.state.user.user.companyId
    // 获取所属公司的选择列表：所有的公司
    getCompanyList().then(({ data }) => {
      this.companyList = data.result || []
    })
    // 获取所属部门部门list：当前人公司的所有组织架构
    getAllDepartByCompanyFn(this.companyId).then(({ data }) => {
      this.departList = (data.result || []).filter((item) => {
        return item.departmentType === 'DEPARTMENT'
      })
    })
    // 获取整改部门list
    getDepartListSimple().then(({ data }) => {
      this.departList02 = (data.result || []).filter((item) => {
        return item.departmentType === 'DEPARTMENT'
      })
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
      const { data } = await getHkAlarmList(this.form)
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
    async getCameraList() {
      const { data } = await getHkCameraList({ pageNum: 1, pageSize: 1000 })
      if (data.code === 200) {
        this.camList = data.result.list || []
      }
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

      setTimeout(() => {
        this.$refs.treeTable.setTableHeight()
      }, 200)
    },
    // 重置
    resetFn() {
      this.form = {
        pageNum: 1,
        pageSize: 12,
        showMore: false,
        companyId: this.form.companyId || '',
      }
      this.getDataList()
    },
    itemTap(item) {
      this.showDetail = true
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
            this.showDetail = false
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
      }
      else {
        delete this.form.companyId
      }
      this.getDataList()
    },
    camFn(val) {
      const tar = this.camList.find(c => c.id == val)
      this.form.camIp = (tar && tar.camIp) || ''
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
              this.showDetail = false
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
        this.departList = (data.result || []).filter((item) => {
          return item.departmentType === 'DEPARTMENT'
        })
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
      this.form.pageNum = 1
      this.form.pageSize = 12
      this.getDataList()
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
  <KyTreeTable ref="treeTable">
    <!-- <div> -->
    <CompanyTree slot="tree" @treeNodeTap="treeNodeTap" />

    <!-- 查询条件 -->
    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <el-form
        :model="form"
        size="mini"
        inline
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

        <el-form-item label="截止时间" prop="endDate">
          <el-date-picker
            v-model="form.endDate"
            style="width: 100%"
            placeholder="截止时间"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            clearable
          />
        </el-form-item>

        <el-form-item v-if="form.showMore" label="摄像头">
          <el-select
            v-model="form.camId"
            placeholder="摄像头"
            filterable
            style="width: 100%"
            @change="camFn"
          >
            <el-option
              v-for="item in camList"
              :key="item.id"
              :label="item.camName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.showMore" label="告警类型">
          <el-select
            v-model="form.aiAlarmType"
            placeholder="告警类型"
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

        <el-form-item v-if="form.showMore" label="审核结果">
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

        <el-form-item v-if="form.showMore" label="审核状态">
          <el-select
            v-model="form.auditStatus"
            placeholder="审核状态"
            style="width: 100%"
          >
            <el-option
              v-for="item in statusList"
              :key="item.name"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>

        <!-- 按钮 -->
        <el-form-item>
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
        </el-form-item>
      </el-form>
    </ECard>

    <!-- 内容 -->
    <ECard slot="table">
      <div class="flex overflow-y-scroll flex-wrap">
        <WarningInfo
          v-for="item in data"
          :key="item.id"
          :item="item"
          @click="itemTap(item)"
        />
      </div>
    </ECard>
    <!-- 分页 -->
    <ECard slot="page" type="footer">
      <el-pagination
        style="text-align: right"
        :current-page.sync="form.pageNum"
        :page-sizes="[12, 24, 48, 96]"
        :page-size="form.pageSize"
        layout="total, prev, pager, next, jumper, sizes"
        :total="total"
        :background="true"
        @size-change="pageSizeFn"
        @current-change="pageCurFn"
      />
    </ECard>

    <div slot="dialog">
      <!-- 报警详情 -->
      <el-dialog
        v-max-dialog
        class="normal-dialog detail-dialog diy"
        title="报警详情"
        :visible.sync="showDetail"
        append-to-body
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
                  $dictUtils.getDictLabelById(
                    "hiddenDangerLevel",
                    dtForm.hiddenDangerLevel,
                  )
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
          <el-button @click="showDetail = false">
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
              <el-col :span="24">
                <el-form-item label="隐患等级" prop="hiddenDangerLevel">
                  <el-radio-group v-model="atForm.hiddenDangerLevel">
                    <el-radio
                      v-for="item in $dictUtils.getDictList('hiddenDangerLevel')"
                      :key="item.dictCode"
                      :label="item.dictCode"
                    >
                      {{ item.dictName }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="问题位置" prop="location">
                  <el-input v-model="atForm.location" placeholder="问题位置" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="所属公司" prop="companyId">
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
                      (value) => {
                        getAllDepartByCompany(value);
                      }
                    "
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="所属部门" prop="belongDepartmentId">
                  <!-- <SelectTree
                                    :props="{
                                        value: 'id',             // ID字段名
                                        label: 'departmentName',         // 显示名称
                                        children: 'children'    // 子级字段名
                                    }"
                                    :list="departList"
                                    :value="atForm.belongDepartmentId"
                                    :clearable="true"
                                    :accordion="true"
                                    @getValue="(value) => {atForm.belongDepartmentId = value}"
                                /> -->
                  <el-select
                    v-model="atForm.belongDepartmentId"
                    placeholder="请选择"
                    filterable
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

          <div>
            <div class="barSty">
              整改信息
            </div>
            <el-row>
              <el-col :span="24">
                <el-form-item label="整改部门" prop="rectificationDepartmentId">
                  <!-- <SelectTree
                                    :props="{
                                        value: 'id',             // ID字段名
                                        label: 'departmentName',         // 显示名称
                                        children: 'children'    // 子级字段名
                                    }"
                                    :list="departList02"
                                    :value="atForm.rectificationDepartmentId"
                                    :clearable="true"
                                    :accordion="true"
                                    @getValue="(value) => {atForm.rectificationDepartmentId = value}"
                                /> -->
                  <el-select
                    v-model="atForm.rectificationDepartmentId"
                    placeholder="请选择"
                    filterable
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in departList02"
                      :key="item.id"
                      :label="item.departmentName"
                      :value="item.id"
                    />
                  </el-select>
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
  </KyTreeTable>
</template>

<style lang="scss" scope>
.item-col {
  display: flex;
  flex-wrap: wrap;
}
.page-container {
  .item-col {
    display: flex;
    flex-wrap: wrap;
    .item {
      height: 90px;
      display: flex;
      margin-right: 10px;

      .image {
        width: 100px;
        height: 100px;
      }
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
  .leftCon {
    // position: absolute;
    // top: 0;
    // left: 0;
    // height: 100%;
    // padding: 10px;
    // padding-right: 0px;
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
    // position: absolute;
    // top: 0;
    // right: 0;
    // flex: 1;
    // overflow: hidden;
    // height: 100%;
    // display: flex;
    // flex-direction: column;
    // padding: 10px;
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
      .el-row {
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
.normal-dialog.diy {
  .el-dialog {
    max-height: none;
  }
  .el-dialog__header {
    position: relative;
  }
  .el-dialog__headerbtn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    &.el-dialog__minmax {
      right: 45px !important;
    }
  }
}
</style>
