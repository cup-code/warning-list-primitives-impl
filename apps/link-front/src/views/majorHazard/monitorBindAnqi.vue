<script>
import {
  mhsBindCamera,
  mhsBindCameraSave,
  mhsBindInfo,
} from '@/http/major-hazard/dangerSourceAnqi-api'
import { getPointGroup, pointGroupSave } from '@/http/major-hazard/monitorBind-api.js'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import BindCamera from './components/bindCamera'
import BindPoint from './components/bindPoint'

export default {
  name: 'MonitorBind',
  components: {
    CompanyTree,
    BindPoint,
    BindCamera,
  },
  data() {
    return {
      isLoading: false,
      total: 0,
      hazardTypeList: [
        { dictCode: 1, dictName: '重大危险源' },
        { dictCode: 2, dictName: '重要危险源' },
      ],
      searchData: {
        pageNum: 1,
        pageSize: 10,
        companyId: '',
        majorHazardName: '',
      },
      tableData: [],
      visibleFrom: false,
      dialogTitle: '',
      fromData: {},
      oldList: [], // 打开前已选的数据
      userData: {},
    }
  },
  created() {
    this.userData = JSON.parse(sessionStorage.getItem('user'))
    this.searchData.companyId = this.userData.companyId
    this.getTableData()
  },
  methods: {
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data && data.onlyTreeUse)
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
    /* 点击重置 */
    refreshClick() {
      this.searchData = {
        pageNum: 1,
        pageSize: 10,
        companyId: this.userData.companyId,
      }
      this.$refs.companyTree.refreshTree()
    },
    /* 获取列表 */
    getTableData() {
      this.isLoading = true
      this.tableData = []
      mhsBindInfo(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.total = data.result.total || 0
            this.tableData = data.result.list || []
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
    // 打开表单弹窗
    changeFn(infoData, type) {
      this.fromData = infoData
      let params = this.fromData.id
      let getOldList = function () {}
      if (type) {
        this.dialogTitle = '绑定测点'
        getOldList = getPointGroup
      }
      else {
        this.oldList = []
        params = {
          companyId: infoData.companyId,
          hazardId: infoData.id,
          hazardType: infoData.hazardType,
        }
        this.dialogTitle = '绑定摄像头'
        getOldList = mhsBindCamera
      }
      getOldList(params)
        .then(({ data }) => {
          if (data.success) {
            this.oldList = data.result || []
            // this.$message.success('获取已有信息成功')
          }
          else {
            this.$message.warning(data.message || '获取已有信息失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取已有信息出错', err)
        })
        .finally(() => {
          this.visibleFrom = true
        })
    },
    /* 保存表单弹窗 */
    closePoint(pickList) {
      if (pickList && this.fromData) {
        const pointLsitSave = {
          companyId: this.fromData.companyId,
          groupName: this.fromData.majorHazardName,
          id: this.fromData.id,
          sort: 0,
          pointsList: [],
          hazardType: this.fromData.hazardType,
        }
        pickList.forEach((item) => {
          pointLsitSave.pointsList.push({
            ioId: item.ioId,
            sort: 0,
          })
        })
        pointGroupSave(pointLsitSave)
          .then(({ data }) => {
            if (data.success) {
              this.visibleFrom = false
              this.$message.success('保存测点信息成功')
              this.getTableData()
            }
            else {
              this.$message.warning(data.message || '保存测点信息失败')
            }
          })
          .catch((err) => {
            console.log(err)
            this.$message.error('保存测点信息出错', err)
          })
      }
      else {
        this.visibleFrom = false
      }
    },
    closeHkA(pickList) {
      if (pickList && this.fromData) {
        const cameraLsitSave = []
        pickList.forEach((item) => {
          cameraLsitSave.push({
            cameraId: item.cameraId,
            companyName: this.fromData.companyName,
            companyId: this.fromData.companyId,
            hazardId: this.fromData.id,
          })
        })
        mhsBindCameraSave(cameraLsitSave)
          .then(({ data }) => {
            if (data.success) {
              this.visibleFrom = false
              this.$message.success('保存摄像头信息成功')
              this.getTableData()
            }
            else {
              this.$message.warning(data.message || '保存摄像头信息失败')
            }
          })
          .catch((err) => {
            console.log(err)
            this.$message.error('保存摄像头信息出错', err)
          })
      }
      else {
        this.visibleFrom = false
      }
    },
  },
}
</script>

<template>
  <!-- 监测绑定页面 -->
  <TreeTable v-loading="isLoading">
    <!-- 左侧树 -->
    <CompanyTree
      slot="tree"
      ref="companyTree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
      label-width="100"
      class="fromClass"
    >
      <el-row>
        <el-form-item label="危险源名称">
          <el-input
            v-model="searchData.majorHazardName"
            placeholder="危险源名称"
          />
        </el-form-item>
        <el-form-item label="危险源类型">
          <el-select
            v-model="searchData.hazardType"
            placeholder="危险源类型"
            clearable
          >
            <el-option
              v-for="item in hazardTypeList"
              :key="item.dictCode"
              :label="item.dictName"
              :value="item.dictCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="searchFn()"
          >
            查询
          </el-button>
          <el-button
            size="mini"
            icon="el-icon-refresh-right"
            @click="refreshClick"
          >
            重置
          </el-button>
        </el-form-item>
      </el-row>
    </el-form>

    <!-- 表格 -->
    <el-table
      slot="table"
      :data="tableData"
      :header-cell-style="{ background: '#f5f5f5' }"
      align="center"
      height="100%"
      :border="true"
      class="customer-table"
    >
      <el-table-column
        type="index"
        width="50"
        align="center"
        label="序号"
      />
      <el-table-column
        label="公司"
        align="center"
        prop="companyName"
      />
      <el-table-column
        label="责任部门"
        align="center"
        prop="departmentName"
      />
      <el-table-column
        label="危险源类型"
        align="center"
        prop="hazardType"
      >
        <template slot-scope="scope">
          <span>{{
            scope.row.hazardType == 1 ? '重大危险源' : scope.row.hazardType == 2 ? '重要危险源' : ''
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="危险源名称"
        align="center"
        prop="majorHazardName"
      />
      <el-table-column
        label="监测点数量"
        align="center"
        prop="pointCounts"
      />
      <el-table-column
        label="摄像头数量"
        align="center"
        prop="cameraCounts"
      />
      <el-table-column
        label="操作"
        min-width="160"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="changeFn(scope.row, true)"
          >
            绑定测点
          </el-button>
          <el-button
            type="text"
            @click="changeFn(scope.row, false)"
          >
            绑定摄像头
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      slot="page"
      :current-page.sync="searchData.pageNum"
      :page-sizes="[10, 20, 50]"
      :page-size.sync="searchData.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="getTableData"
      @current-change="getTableData"
    />
    <!-- 表单弹窗 -->
    <el-dialog
      slot="dialog"
      class="normal-dialog"
      :title="dialogTitle"
      :close-on-click-modal="false"

      width="850px"
      :visible.sync="visibleFrom"
    >
      <BindPoint
        v-if="visibleFrom && dialogTitle == '绑定测点'"
        :oldList="oldList"
        @close="closePoint"
      />
      <BindCamera
        v-if="visibleFrom && dialogTitle == '绑定摄像头'"
        :oldList="oldList"
        :companyId="fromData.companyId"
        @close="closeHkA"
      />
    </el-dialog>
  </TreeTable>
</template>

<style scoped></style>
