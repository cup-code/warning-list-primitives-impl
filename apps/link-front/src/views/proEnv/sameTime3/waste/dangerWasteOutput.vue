<script>
import moment from 'moment'
import {
  threeTimeRiskWasteOutputByPage,
  threeTimeRiskWasteOutputDel,
} from '@/http/pro-env/time3danger-api.js'
import DangerOutInfo from './components/DangerOutInfo.vue'

export default {
  components: {
    DangerOutInfo,
  },
  data() {
    return {
      dialogTitle: '',
      propData: {},
      isLoading: false,
      total: 0, // 数据总数
      showChangeDialog: false, // 是否打开弹窗
      // 搜索数据
      searchData: {
        type: '',
        name: '',
        keepingDept: '',
        whereabouts: '',
        pageNum: 1,
        pageSize: 20,
      },
      wasteType: [], // 种类
      wasteName: [], // 名称
      keepDeptList: [], // 部门
      // 表格数据
      tableData: [],
    }
  },
  computed: {
    setDate() {
      return function (timestamp) {
        const date = moment(timestamp).format('YYYY/MM/DD')
        return date
      }
    },
  },
  created() {
    this.getDataList()
    const dicList = JSON.parse(sessionStorage.getItem('dictList'))
    this.wasteType = dicList.waste_type
    this.wasteName = dicList.waste_name
    this.keepDeptList = dicList.keep_dept
  },
  methods: {
    /* 请求列表数据 */
    getDataList() {
      this.isLoading = true
      threeTimeRiskWasteOutputByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list
            this.total = res.data.result.total
          }
          else {
            this.$message.warning(res.data.message || '请求数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('请求数据出错！', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 新增数据 */
    addClick() {
      this.dialogTitle = '新增危废出库'
      this.propData = {
        isNew: true,
        editable: true,
      }
      this.showChangeDialog = true
    },
    /* 查看或修改数据 */
    checkInfoClick(infoId, editable) {
      this.dialogTitle = '危废出库详情'
      this.propData = {
        infoId,
        editable,
        isNew: false,
      }
      this.showChangeDialog = true
    },
    /* 删除数据 */
    delInfoClick(item) {
      this.$confirm(`您确定要删除第${item.$index + 1}条信息吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          threeTimeRiskWasteOutputDel(item.row.id)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('删除成功！')
                this.getDataList()
              }
              else {
                this.$message.warning(res.data.message || '删除失败')
              }
            })
            .catch((err) => {
              this.$message.error('删除出错！', err)
            })
            .finally(() => {
              this.isLoading = false
            })
        })
        .catch(() => {})
    },
    /* 保存成功回调 */
    infoSuccEvt(isRefresh) {
      this.showChangeDialog = false
      if (isRefresh) {
        this.getDataList()
      }
    },
  },
}
</script>

<template>
  <SearchTable v-loading="isLoading">
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
    >
      <el-form-item label="危废种类">
        <el-select
          v-model="searchData.type"
          placeholder="请选择危废种类"
          clearable
        >
          <el-option
            v-for="item in wasteType"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="危废名称">
        <el-select
          v-model="searchData.name"
          placeholder="请选择危废名称"
          clearable
        >
          <el-option
            v-for="item in wasteName"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="贮存部门">
        <el-select
          v-model="searchData.keepingDept"
          placeholder="请选择贮存部门"
          clearable
        >
          <el-option
            v-for="item in keepDeptList"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="危废去向">
        <el-input v-model="searchData.whereabouts" />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          size="mini"
          :disabled="isLoading"
          icon="el-icon-search"
          @click="getDataList"
        >
          查询
        </el-button>
        <el-button
          type="primary"
          size="mini"
          :disabled="isLoading"
          icon="el-icon-plus"
          @click="addClick"
        >
          新增
        </el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table
      slot="table"
      :data="tableData"
      height="100%"
      :header-cell-style="{ borderLeft: 'none', borderRight: 'none' }"
      align="center"
    >
      <el-table-column
        type="index"
        width="50"
        align="center"
      />
      <el-table-column
        label="入库时间"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          <span>{{ setDate(scope.row.outTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="whereabouts"
        label="危废去向"
        align="center"
      />
      <el-table-column
        label="危废分类"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ $dictUtils.getDictLabelById('waste_type', scope.row.type, '--') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="危废名称"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ $dictUtils.getDictLabelById('waste_name', scope.row.name, '--') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="num"
        label="出库数量"
        align="center"
      />
      <el-table-column
        prop="unit"
        label="单位"
        align="center"
      />
      <el-table-column
        label="贮存部门"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ $dictUtils.getDictLabelById('keep_dept', scope.row.keepingDept, '--') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="贮存经办人"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{
            $dictUtils.getDictLabelById('keep_person', scope.row.keepingPerson, '--')
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="运送经办人"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{
            $dictUtils.getDictLabelById('transfer_person', scope.row.transportPerson, '--')
          }}</span>
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
            @click="checkInfoClick(scope.row.id, false)"
          >
            查看
          </el-button>
          <el-button
            type="text"
            size="mini"
            @click="checkInfoClick(scope.row.id, true)"
          >
            修改
          </el-button>
          <el-button
            type="text"
            size="mini"
            style="color: var(--ky-danger)"
            @click="delInfoClick(scope)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      slot="page"
      :disabled="isLoading"
      style="margin: 0 20px 0 0"
      :current-page.sync="searchData.pageNum"
      :page-size.sync="searchData.pageSize"
      :page-sizes="[10, 20, 30, 50]"
      layout="total, prev, pager, next, jumper, sizes"
      :total="total"
      @current-change="getDataList"
      @size-change="getDataList"
    />
    <!-- 弹窗 -->
    <div slot="dialog">
      <!-- 出库弹窗 -->
      <el-dialog
        class="normal-dialog"
        :visible.sync="showChangeDialog"
        :close-on-click-modal="false"
        width="800px"
        :title="dialogTitle"
      >
        <DangerOutInfo
          v-if="showChangeDialog"
          v-bind="propData"
          @succ="infoSuccEvt"
        />
      </el-dialog>
    </div>
  </SearchTable>
</template>
