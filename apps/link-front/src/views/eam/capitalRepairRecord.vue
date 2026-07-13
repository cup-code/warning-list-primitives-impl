<script>
import { getRepairTable, removeRepairRecord } from '@/http/dev_new/capitalRepair-api'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import CapitalRepairRecordFrom from './form/capitalRepairRecordFrom'

export default {
  components: {
    OwnDeparmentTree,
    CapitalRepairRecordFrom,
  },
  data() {
    return {
      isLoading: false,
      total: 0,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        departmentId: '',
        deviceNameOrCode: '',
        repairContent: '',
        startDate: '',
        endDate: '',
      },
      // 弹框
      dialogTitle: '',
      visibleFrom: false,
      dialogMethod: '',
      tableData: [],
      fromData: {},
      isDisabled: false,
      isShow: false,
      endDatePicker: this.processDate(),
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    searchFn() {
      this.searchData.pageNum = 1
      this.getTableData()
    },
    // 获取表格数据
    getTableData() {
      if (this.searchData.startDate > this.searchData.endDate) {
        this.$message.warning('结束时间不能小于开始时间')
        return
      }
      this.isLoading = true
      getRepairTable(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.total = data.result.total
            this.tableData = data.result.list || []
          }
          else {
            this.$message.warning(data.message || '获取列表数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表数据出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data.onlyTreeUse)
        return
      if (data) {
        this.searchData.departmentId = data.id
      }
      else {
        this.searchData.departmentId = ''
      }
      this.searchFn()
    },
    // 打开表单弹窗(添加、修改)
    changeFn(type, infoData) {
      this.visibleFrom = true
      this.dialogMethod = type
      switch (type) {
        case 'add':
          this.dialogTitle = '新增大修记录'
          this.fromData = {}
          break
        case 'view':
          this.dialogTitle = '查看大修记录'
          this.fromData = infoData
          break
        case 'edit':
          this.dialogTitle = '编辑大修记录'
          this.fromData = infoData
          break
      }
    },
    // 保存表单弹窗关闭成功回调
    infoSuccEvt(isRefresh) {
      this.visibleFrom = false
      if (isRefresh) {
        this.getTableData()
      }
    },
    // 删除弹窗
    delFn(infoData) {
      this.$confirm('您确认要删除此大修记录' + ' ?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.isLoading = true
        removeRepairRecord(infoData.id)
          .then(({ data }) => {
            this.isLoading = false
            if (data.success) {
              this.$message.success('删除成功')
              this.getTableData()
            }
            else {
              this.$message.error(data.message || '删除失败')
            }
          })
          .catch((err) => {
            this.isLoading = false
            this.$message.error('删除失败')
          })
      })
    },
    //  校验结束时间不能大约开始时间
    processDate() {
      const self = this
      return {
        disabledDate(time) {
          if (self.searchData.startDate) {
            // 如果开始时间不为空，则结束时间大于开始时间
            return new Date(self.searchData.startDate).getTime() > time.getTime()
          }
        },
      }
    },
    openUp() {
      this.isShow = true
      setTimeout(() => {
        this.$refs.treeTable.setTableHeight()
      }, 200)
    },
    putAway() {
      this.isShow = false
      setTimeout(() => {
        this.$refs.treeTable.setTableHeight()
      }, 200)
    },
    // 获取创建开始时间
    getStartTime() {
      if (this.searchData.startDate) {
        this.isDisabled = false
      }
    },
    // 获取创建结束时间
    getEndTime(e) {
      if (!this.searchData.startDate) {
        this.isDisabled = true
        this.$message.warning('请先选择开始时间')
      }
    },
    resetSearch() {
      this.searchData.deviceNameOrCode = ''
      this.searchData.repairContent = ''
      this.searchData.startDate = ''
      this.searchData.endDate = ''
      this.getTableData()
    },
  },
}
</script>

<template>
  <!-- 大修记录页面 -->
  <TreeTable
    ref="treeTable"
    v-loading="isLoading"
  >
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />

    <ECard
      slot="search"
      customStyle="margin:0px"
      type="search"
    >
      <el-form
        inline
        label-width="100"
      >
        <el-row>
          <el-form-item label="设备名称或编号">
            <el-input
              v-model="searchData.deviceNameOrCode"
              placeholder="名称或编号"
              clearable
              style="width: 120px"
            />
          </el-form-item>
          <el-form-item label="维修内容">
            <el-input
              v-model="searchData.repairContent"
              placeholder="维修内容"
              clearable
              style="width: 120px"
            />
          </el-form-item>
          <el-form-item
            label="维修开始时间"
            prop="startDate"
          >
            <el-date-picker
              v-model="searchData.startDate"
              style="width: 175px"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="维修开始时间"
              @change="getStartTime"
            />
          </el-form-item>
          <el-form-item
            v-if="isShow"
            label="维修结束时间"
            prop="endDate"
          >
            <el-date-picker
              v-model="searchData.endDate"
              style="width: 175px"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="维修结束时间"
              :disabled="isDisabled"
              :picker-options="endDatePicker"
              @focus="getEndTime"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="searchFn"
            >
              查询
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-button
              class="reset"
              icon="el-icon-refresh-right"
              @click="resetSearch()"
            >
              重置
            </el-button>
          </el-form-item>
          <el-form-item v-if="!isShow">
            <el-button
              type="text"
              icon="el-icon-arrow-down"
              @click="openUp"
            >
              高级筛选
            </el-button>
          </el-form-item>
          <el-form-item v-else>
            <el-button
              type="text"
              icon="el-icon-arrow-up"
              style="color: black"
              @click="putAway"
            >
              收起
            </el-button>
          </el-form-item>
        </el-row>
      </el-form>
    </ECard>

    <ECard
      slot="table"
      style="height: 100%"
    >
      <div class="card-cell">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          @click="changeFn('add')"
        >
          新增
        </el-button>
      </div>
      <el-table
        :data="tableData"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        align="center"
        height="92%"
      >
        <el-table-column
          label="公司"
          align="center"
          prop="companyName"
        />
        <el-table-column
          label="设备"
          align="center"
          prop="assetDeviceName"
        >
          <template slot-scope="scope">
            <span
              class="check"
              @click="changeFn('view', scope.row)"
            >{{ scope.row.assetDeviceName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="设备编号"
          min-width="120"
          align="center"
          prop="assetDeviceCode"
        />
        <el-table-column
          label="部门车间"
          min-width="120"
          align="center"
          prop="departmentName"
        />
        <el-table-column
          label="维修时间"
          min-width="150"
          align="center"
          prop="repairDate"
        />
        <el-table-column
          label="维修负责人"
          min-width="150"
          align="center"
          prop="repairUserName"
        />
        <el-table-column
          label="维修内容"
          min-width="150"
          align="center"
          prop="repairContent"
        />
        <el-table-column
          label="验收人员"
          align="center"
          min-width="150"
          prop="acceptUserNames"
        />
        <el-table-column
          label="维修费用（万元）"
          min-width="150"
          align="center"
          prop="repairCosts"
        />
        <el-table-column
          label="备注"
          align="center"
          prop="remarks"
        />
        <el-table-column
          label="操作"
          min-width="200"
          align="right"
          fixed="right"
        >
          <template slot-scope="scope">
            <EButton
              icon="check"
              type="text"
              @click="changeFn('view', scope.row)"
            >
              查看
            </EButton>
            <EButton
              icon="edit"
              type="text"
              @click="changeFn('edit', scope.row)"
            >
              编辑
            </EButton>
            <EButton
              type="text"
              icon="delete"
              @click="delFn(scope.row)"
            >
              删除
            </EButton>
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        style="text-align: right"
        :current-page.sync="searchData.pageNum"
        :page-sizes="[10, 20, 50]"
        background
        :page-size.sync="searchData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getTableData"
        @current-change="getTableData"
      />
    </ECard>
    <!-- 搜索栏 -->

    <!-- 表格 -->

    <!-- 分页器 -->

    <!-- 表单弹窗 -->
    <el-dialog
      slot="dialog"
      class="normal-dialog"
      :title="dialogTitle"
      :close-on-click-modal="false"

      width="900px"
      :visible.sync="visibleFrom"
    >
      <CapitalRepairRecordFrom
        v-if="visibleFrom"
        :method="dialogMethod"
        :recordData="fromData"
        @succ="infoSuccEvt"
      />
    </el-dialog>
  </TreeTable>
</template>

<style lang="scss" scoped>
.search {
  margin-bottom: 10px;
}
.auxiliary-button {
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
