<script>
import moment from 'moment'
import { getAccTypeListAll } from '@/http/defense/accType-api'
import { accReportDel, accReportGetByPage } from '@/http/emergency/accident-api.js'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import { ACC_TYPE_LIST, STATUS_LIST } from './constant'
import ReportInfo from './ReportInfo.vue'

export default {
  components: {
    CompanyTree,
    ReportInfo,
  },
  data() {
    return {
      evtTypeList: [], // 事件类型下拉列表
      statusList: STATUS_LIST, // 状态下拉列表
      accTypeList: ACC_TYPE_LIST, // 事故类别下拉列表
      isLoading: false,
      searchData: {
        pageNum: 1,
        pageSize: 20,
      },
      tableData: [],
      total: 0,
      dialogTitle: '上报事故',
      showInfoDialog: false,
      // 详情组件传参
      propData: {},
    }
  },
  computed: {
    setDate() {
      return function (timestamp) {
        let date = '-'
        if (timestamp) {
          date = moment(timestamp).format('YYYY/MM/DD HH:mm:ss')
        }
        return date
      }
    },
    setState() {
      return function (state) {
        let result = { label: '', tag: '' }
        for (const item of this.statusList) {
          if (item.value == state) {
            result = item
            break
          }
        }
        return result
      }
    },
    setAccType() {
      return function (type) {
        let des = ''
        for (const item of this.accTypeList) {
          if (item.value == type) {
            des = item.label
            break
          }
        }
        return des
      }
    },
    setEvtType() {
      return function (id) {
        let des = '--'
        for (const item of this.evtTypeList) {
          if (item.id == id) {
            des = item.accidentTypeName
            break
          }
        }
        return des
      }
    },
  },
  created() {
    this.searchClick()
    // 获取所有事故类型
    getAccTypeListAll()
      .then((res) => {
        if (res.data.success) {
          this.evtTypeList = res.data.result
        }
        else {
          this.$message.warning(res.data.message || '获取事故类型列表失败')
        }
      })
      .catch((err) => {
        this.$message.error('获取事故类型列表出错', err)
      })
  },
  methods: {
    /* 点击搜索 */
    queryClick() {
      this.searchData.pageNum = 1
      this.searchClick()
    },
    /* 点击重置 */
    refreshClick() {
      this.searchData = {
        pageNum: 1,
        pageSize: 20,
      }
      this.$refs.leftTree.refreshTree()
    },
    /* 点击搜索 */
    searchClick() {
      this.isLoading = true
      accReportGetByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list
            this.total = res.data.result.total
          }
          else {
            this.$message.warning(res.data.message || '获取列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 点击左侧树的item */
    treeNodeTap(data) {
      if (data) {
        this.searchData.companyId = data.id
      }
      else {
        delete this.searchData.companyId
      }
      this.queryClick()
    },
    /* 点击新增 */
    addClick() {
      this.dialogTitle = '上报事故'
      this.propData = { editable: true, evtTypeList: this.evtTypeList }
      this.showInfoDialog = true
    },
    /* 点击编辑 */
    editClick(infoId, editable) {
      this.dialogTitle = '事故详情'
      this.propData = { infoId, editable, evtTypeList: this.evtTypeList }
      this.showInfoDialog = true
    },
    /* 点击删除 */
    delClick(item) {
      this.$confirm(`您确定要删除第${item.$index + 1}条信息吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          accReportDel(item.row.id)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('删除成功！')
                this.searchClick()
              }
              else {
                this.$message.warning(res.data.message || '删除失败')
              }
            })
            .finally(() => {
              this.isLoading = false
            })
        })
        .catch(() => {})
    },
    /* 关闭弹窗事件 */
    closeDialogEvt(isRefresh) {
      this.showInfoDialog = false
      if (isRefresh) {
        this.searchClick()
      }
    },
  },
}
</script>

<template>
  <!-- 事故上报 -->
  <TreeTable v-loading="isLoading">
    <!-- 左侧树 -->
    <CompanyTree
      slot="tree"
      ref="leftTree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <ECard
      slot="search"
      noneBottom
    >
      <el-form inline>
        <el-form-item label="关键字">
          <el-input
            v-model="searchData.keyWords"
            placeholder="事件名称/内容"
          />
        </el-form-item>
        <el-form-item label="事件类型">
          <el-select
            v-model="searchData.eventTypeId"
            placeholder="全部"
            clearable
          >
            <el-option
              v-for="item in evtTypeList"
              :key="item.id"
              :label="item.accidentTypeName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchData.eventState"
            placeholder="全部"
            clearable
          >
            <el-option
              v-for="item in statusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="事故类别">
          <el-select
            v-model="searchData.incidentType"
            placeholder="全部"
            clearable
          >
            <el-option
              v-for="item in accTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-refresh-right"
            @click="refreshClick"
          >
            重置
          </el-button>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-search"
            @click="queryClick"
          >
            查询
          </el-button>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-plus"
            @click="addClick"
          >
            新增
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <ECard slot="table">
      <!-- 表格 -->
      <el-table
        height="100%"
        :data="tableData"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        align="center"
      >
        <el-table-column
          label="序号"
          align="center"
          type="index"
        />
        <el-table-column
          label="事件名称"
          align="center"
          prop="eventName"
        />
        <el-table-column
          label="事件类型"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ setEvtType(scope.row.eventTypeId) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="事件内容"
          align="center"
          prop="content"
        />
        <el-table-column
          label="事件地点"
          align="center"
          prop="occurSite"
        />
        <el-table-column
          label="事件时间"
          align="center"
          width="130"
        >
          <template slot-scope="scope">
            <span>{{ setDate(scope.row.occurTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="事件状态"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag :type="setState(scope.row.eventState).tag">
              {{
                setState(scope.row.eventState).label
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="上报人"
          align="center"
          prop="reportUserName"
        />
        <el-table-column
          label="事故类别"
          align="center"
          prop="incidentTypeDesc"
        >
          <template slot-scope="scope">
            <span>{{ setAccType(scope.row.incidentType) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="150"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="mini"
              @click="editClick(scope.row.id, false)"
            >
              查看
            </el-button>
            <el-button
              type="text"
              size="mini"
              @click="editClick(scope.row.id, true)"
            >
              编辑
            </el-button>
            <el-button
              type="text"
              size="mini"
              style="color: var(--ky-danger)"
              @click="delClick(scope)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <ECard
      slot="page"
      type="footer"
    >
      <!-- 分页器 -->
      <el-pagination
        :disabled="isLoading"
        style="margin: 0 20px 0 0"
        :current-page.sync="searchData.pageNum"
        :page-size.sync="searchData.pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, prev, pager, next, jumper, sizes"
        :total="total"
        @current-change="searchClick"
        @size-change="searchClick"
      />
    </ECard>
    <!-- 弹窗 -->
    <div slot="dialog">
      <!-- width="950px" -->
      <el-dialog
        class="normal-dialog"
        :title="dialogTitle"
        :visible.sync="showInfoDialog"
        append-to-body
        :close-on-click-modal="false"
      >
        <ReportInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </TreeTable>
</template>
