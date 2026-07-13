/* * @Author: xiaorui 新的维保标准页面 * @Date: 2022-07-13 11:41:49 * @Last Modified by: xiaorui *
@Last Modified time: 2022-08-09 11:14:37 */
<script>
import {
  deleteMaintenanceFn,
  getMaintenanceStandardListByPageFn,
} from '@/http/dev_new/maintenance-api'
import DeviceTree from '@/views/common-ui/DeviceTree'
import MaintenanceStandardForm from './form/maintenanceStandardForm'

export default {
  components: {
    DeviceTree,
    MaintenanceStandardForm,
  },
  data() {
    return {
      isLoading: false,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        departmentId: '',
        deviceId: '',
        deviceName: '',
        maintenanceContent: '',
      },
      tableData: [],
      total: 0,
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    // 获取表格数据
    getTableData() {
      this.isLoading = true
      getMaintenanceStandardListByPageFn(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result.list || []
            this.total = data.result.total || 0
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
    // 点击查询按钮
    searchFn() {
      this.searchData.pageNum = 1
      this.getTableData()
    },
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data.nodeType === 'device') {
        this.searchData.deviceId = data.id
        this.searchData.departmentId = ''
        this.searchData.deviceName = '' // 如果点击了左侧树的设备。则搜索条件中的设备名称置空
        this.deviceName = data.name
      }
      else {
        this.searchData.departmentId = data.id
        this.searchData.deviceId = ''
        this.deviceName = ''
      }
      this.getTableData()
    },
    /* 点击添加维保标准 */
    addClick() {
      if (!this.searchData.deviceId) {
        this.$message.error('请先选择设备')
        return
      }
      this.$refs.maintenanceStandardForm.init(
        'add',
        { id: '' },
        this.searchData.deviceId,
        this.deviceName,
      )
    },
    // 编辑维保标准
    editStandardFn(v) {
      this.$refs.maintenanceStandardForm.init(
        'edit',
        v,
        this.searchData.deviceId,
        v.assetDeviceName,
      )
    },
    // 查看维保标准
    viewStandardFn(v) {
      this.$refs.maintenanceStandardForm.init(
        'view',
        v,
        this.searchData.deviceId,
        v.assetDeviceName,
      )
    },
    /* 点击删除维保标准 */
    delStandard(item) {
      this.$confirm(`您确定要删除${item.maintenanceContent}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          deleteMaintenanceFn(item.id)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('删除成功！')
                this.getTableData()
              }
              else {
                this.$message.warning(data.message || '删除失败')
              }
            })
            .finally(() => {
              this.isLoading = false
            })
        })
        .catch(() => {})
    },
    // 重置按钮
    resetEvent() {
      this.searchData.deviceName = ''
      this.searchData.maintenanceContent = ''
      this.getTableData()
    },
  },
}
</script>

<template>
  <TreeTable v-loading="isLoading">
    <DeviceTree
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
        <el-form-item
          prop="deviceName"
          label="设备名称"
        >
          <el-input
            v-model="searchData.deviceName"
            placeholder="设备名称"
            clearable
          />
        </el-form-item>
        <el-form-item
          prop="maintenanceContent"
          label="维保内容"
        >
          <el-input
            v-model="searchData.maintenanceContent"
            placeholder="维保内容"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            :loading="isLoading"
            @click="searchFn"
          >
            查询
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            class="reset"
            icon="el-icon-refresh-left"
            @click="resetEvent"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <ECard
      slot="table"
      style="height: 100%"
    >
      <div class="card-cell">
        <el-button
          v-if="hasBtnPermission('maintenance_standard_add')"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="addClick"
        >
          新增
        </el-button>
      </div>

      <!-- 表格 -->
      <el-table
        :data="tableData"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        height="92%"
      >
        <el-table-column
          label="设备"
          align="center"
          prop="assetDeviceName"
        />
        <el-table-column
          label="维保内容"
          align="center"
          prop="maintenanceContent"
        >
          <template slot-scope="scope">
            <span
              class="check"
              @click="viewStandardFn(scope.row)"
            >{{ scope.row.maintenanceContent }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="维保要求"
          align="center"
          prop="maintenanceRequirement"
          min-width="180"
        >
          <template slot-scope="scope">
            <rich-text :des="scope.row.maintenanceRequirement" />
          </template>
        </el-table-column>
        <el-table-column
          label="排序"
          align="center"
          prop="sortOrder"
        />
        <el-table-column
          label="强制拍照"
          align="center"
          prop="mustPhotograph"
        >
          <template slot-scope="scope">
            <el-tag :type="scope.row.mustPhotograph ? 'success' : 'danger'">
              {{
                scope.row.mustPhotograph ? '是' : '否'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="常见故障"
          align="center"
          prop="commonFaults"
          min-width="180"
        >
          <template slot-scope="scope">
            <rich-text :des="scope.row.commonFaults" />
          </template>
        </el-table-column>
        <el-table-column
          label="可能故障原因"
          align="center"
          prop="possibleCause"
          min-width="180"
        >
          <template slot-scope="scope">
            <rich-text :des="scope.row.possibleCause" />
          </template>
        </el-table-column>
        <el-table-column
          label="故障处理方法"
          align="center"
          prop="disposalMethod"
          min-width="180"
        >
          <template slot-scope="scope">
            <rich-text :des="scope.row.disposalMethod" />
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="right"
          width="200"
          fixed="right"
        >
          <template slot-scope="scope">
            <EButton
              type="text"
              icon="check"
              @click="viewStandardFn(scope.row)"
            >
              查看
            </EButton>
            <EButton
              v-if="hasBtnPermission('maintenance_standard_modify')"
              type="text"
              icon="edit"
              @click="editStandardFn(scope.row)"
            >
              编辑
            </EButton>
            <EButton
              v-if="hasBtnPermission('maintenance_standard_delete')"
              type="text"
              icon="delete"
              @click="delStandard(scope.row)"
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

    <!-- 维保标准的弹窗 -->
    <maintenance-standard-form
      slot="dialog"
      ref="maintenanceStandardForm"
      @refreshDataList="getTableData"
    />
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
