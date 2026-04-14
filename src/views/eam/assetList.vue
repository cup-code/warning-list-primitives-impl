<!-- 新的设备管理页面，之前叫资产管理 -->
<script>
import { cloneDeep } from 'lodash'
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import {
  deleteDeviceFn,
  getAllDeviceTypeFn,
  getDeviceByPageFn,
  getStateCountFn,
} from '@/http/dev_new/manage-api'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'

export default {
  components: {
    SelectTree,
    OwnDeparmentTree,
  },
  data: () => ({
    loadingTable: false,
    tableData: [],
    total: 0,
    sForm: {
      pageNum: 1,
      pageSize: 10,
      departmentId: '',
      assetDeviceName: '',
      model: '',
      assetState: '',
      assetTypeId: '',
    },
    typeList: [], // 设备类型list
    statusOptions: [], // 状态集合
  }),
  computed: {},
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.getDeviceTypeList()
      this.getDataList()
    },
    searchFn() {
      this.sForm.pageNum = 1
      this.getDataList()
    },
    // 添加设备
    addFn() {
      this.$router.push({
        path: `/detail/asset/${null}/add`,
      })
    },
    // 编辑设备
    editFn(v) {
      this.$router.push({
        path: `/detail/asset/${v.id}/edit`,
      })
    },
    // 查看设备
    viewFn(v) {
      this.$router.push({
        path: `/detail/asset/${v.id}/view`,
      })
    },
    // 删除
    delFn(v) {
      this.$confirm(`您确认要删除设备 ${v.assetName} ?`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loadingTable = true
          deleteDeviceFn(v.id)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(data.message || '删除失败')
                this.loadingTable = false
              }
            })
            .catch(() => {
              this.$message.error('删除失败')
              this.loadingTable = false
            })
        })
        .catch(() => {})
    },
    // 点击部门树的item
    treeNodeTap(v) {
      // 记录部门 id
      if (v.onlyTreeUse)
        return
      this.sForm.pageNum = 1
      this.sForm.departmentId = v.id
      this.getDataList()
    },
    getDataList() {
      // 查询设备
      this.loadingTable = true
      // 获取设备列表的时候需要深拷贝，因为状态为全部的时候，调接口的时候需要删除状态的key
      const arr = [getDeviceByPageFn(cloneDeep(this.sForm)), getStateCountFn(this.sForm)]
      Promise.all(arr)
        .then((res) => {
          this.loadingTable = false
          const deviceList = res[0].data // 设备列表的数据
          const stateList = res[1].data // 状态列表的数据
          if (deviceList.success) {
            this.tableData = deviceList.result.list || []
            this.total = deviceList.result.total
          }
          else {
            this.$message.error(deviceList.message || '查询设备失败')
          }
          if (stateList.success) {
            let totalCount = 0
            stateList.result.forEach((item) => {
              totalCount += item.count
            })
            this.statusOptions = [
              {
                state: '全部',
                count: totalCount,
              },
            ].concat(stateList.result || [])
          }
          else {
            this.$message.error(stateList.message || '查询状态失败')
          }
        })
        .catch(() => {
          this.loadingTable = false
          this.$message.error('查询失败')
        })
    },
    // 获取设备类型list
    getDeviceTypeList() {
      getAllDeviceTypeFn().then(({ data }) => {
        this.typeList = data.result || []
      })
    },
    // 点击状态tag
    statusChange(state) {
      this.sForm.assetState = state === this.sForm.assetState ? '' : state // 如果未选中则选中，如果已选中则置空
      this.searchFn()
    },
    getColor(v) {
      if (v === -1 || v > 12) {
        return 'white'
      }
      else if (v === 0) {
        return '#FF4F58'
      }
      else if (v > 0 && v <= 12) {
        return '#ff9900'
      }
    },
    getExpireMonthLabel(v) {
      if (v === -1) {
        return '--'
      }
      else if (v === 0) {
        return '到报废期限'
      }
      else {
        return `${v}个月`
      }
    },
    resetSearch() {
      this.sForm.assetDeviceName = ''
      this.sForm.model = ''
      this.sForm.assetTypeId = ''
      this.init()
    },
  },
}
</script>

<template>
  <TreeTable>
    <!-- 左侧树 -->
    <OwnDeparmentTree slot="tree" @treeNodeTap="treeNodeTap" />
    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <el-form
        ref="sForm"
        :inline="true"
        :model="sForm"
        size="mini"
        class="sForm"
        @submit.native.prevent
      >
        <el-form-item prop="assetDeviceName" label="名称">
          <el-input
            v-model="sForm.assetDeviceName"
            placeholder="设备名称"
            clearable
          />
        </el-form-item>
        <el-form-item prop="model" label="型号">
          <el-input
            v-model="sForm.model"
            placeholder="规格型号"
            clearable
          />
        </el-form-item>
        <el-form-item label="类别" prop="assetTypeId">
          <SelectTree
            :props="{
              value: 'id', // ID字段名
              label: 'assetTypeName', // 显示名称
              children: 'children', // 子级字段名
            }"
            :list="typeList"
            :value="sForm.assetTypeId"
            :clearable="true"
            :accordion="true"
            size="mini"
            @getValue="
              (value) => {
                sForm.assetTypeId = value;
              }
            "
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
      </el-form>
    </ECard>
    <ECard slot="table">
      <div class="card-cell">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          @click="addFn"
        >
          新增
        </el-button>
        <EButton
          v-for="(item, index) in statusOptions"
          :key="index"
          size="mini"
          plain
          type="primary"
          :effect="sForm.assetState === item.state ? 'dark' : 'plain'"
          @click="statusChange(item.state)"
        >
          {{ item.state }}
          {{ item.count }}
        </EButton>
      </div>
      <el-table
        ref="table"
        v-loading="loadingTable"
        height="90%"
        :data="tableData"
        size="mini"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column
          label="负责部门"
          prop="departmentName"
          align="center"
          min-width="100"
        />
        <el-table-column
          label="名称"
          prop="assetName"
          align="center"
          min-width="120"
        >
          <template slot-scope="scope">
            <span style="color: var(--ky-primary)" @click="viewFn(scope.row)">{{
              scope.row.assetName
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="类别"
          prop="assetTypeName"
          align="center"
          min-width="120"
        />
        <el-table-column
          label="级别"
          prop="assetLevel"
          align="center"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel("asset_level", scope.row.assetLevel) }}
          </template>
        </el-table-column>
        <el-table-column
          label="重要等级"
          prop="importanceLevel"
          align="center"
          min-width="100"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel("importance_level", scope.row.importanceLevel) }}
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
          prop="assetState"
          align="center"
        />
        <el-table-column
          label="有效期剩余"
          prop="expireMonth"
          align="center"
          min-width="100"
        >
          <template slot-scope="scope">
            <span
              :style="{
                background: getColor(scope.row.expireMonth),
                display: 'block',
                textAlign: 'center',
              }"
            >
              {{ getExpireMonthLabel(scope.row.expireMonth) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="编码"
          prop="assetCode"
          align="center"
        />
        <el-table-column
          label="规格型号"
          prop="model"
          align="center"
          min-width="100"
        />
        <el-table-column
          label="设备负责人"
          prop="assetPrincipalName"
          align="center"
          min-width="100"
        />
        <el-table-column
          label="位号"
          prop="assetNo"
          align="center"
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
              @click="viewFn(scope.row)"
            >
              查看
            </EButton>
            <EButton
              icon="edit"
              type="text"
              @click="editFn(scope.row)"
            >
              编辑
            </EButton>
            <EButton
              icon="delete"
              type="text"
              @click="delFn(scope.row)"
            >
              删除
            </EButton>
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <ECard slot="page" type="footer">
      <el-pagination
        style="text-align: right"
        :current-page.sync="sForm.pageNum"
        :page-sizes="[10, 20, 50]"
        background
        :page-size.sync="sForm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getDataList"
        @current-change="getDataList"
      />
    </ECard>
  </TreeTable>
</template>

<style lang="scss" scoped>
.sForm {
}
.sForm ::v-deep {
  .el-form-item--mini {
    margin-bottom: 10px;
  }
}
.auxiliary-button {
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.tagStyle {
  cursor: pointer;
  border: 1px solid #11c8e5;
  height: 28px;
  line-height: 28px;
  padding: 0 10px;
  border-radius: 3px;
  margin-left: 5px;
  color: #11c8e5;
}
.tagStyle:hover {
  background: #11c8e5;
  color: #ffffff;
}
</style>
