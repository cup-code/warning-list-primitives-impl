<script>
import moment from 'moment'
import {
  threeTimeRiskWasteInputByPage,
  threeTimeRiskWasteInputDel,
} from '@/http/pro-env/time3danger-api.js'
import DangerInInfo from './components/DangerInInfo.vue'
import DangerOutInfo from './components/DangerOutInfo.vue'

export default {
  components: {
    DangerInInfo,
    DangerOutInfo,
  },
  data() {
    return {
      dialogTitleIn: '',
      inPropData: {},
      outPropData: {},
      isLoading: false,
      total: 0, // 数据总数
      showChangeDialog: false, // 是否打开详情弹窗
      showOutputDialog: false, // 是否打开出库弹窗
      // 搜索数据
      searchData: {
        type: '',
        name: '',
        keepingDept: '',
        keepingSiteOrSource: '',
        pageNum: 1,
        pageSize: 20,
      },
      wasteType: [], // 废物种类
      wasteName: [], // 废物名称
      keepDeptList: [], // 贮存部门
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
      threeTimeRiskWasteInputByPage(this.searchData)
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
      this.dialogTitleIn = '新增危废入库'
      this.inPropData = {
        isNew: true,
        editable: true,
      }
      this.showChangeDialog = true
    },
    /* 查看或修改数据 */
    checkInfoClick(infoId, editable) {
      this.dialogTitleIn = '危废入库详情'
      this.inPropData = {
        infoId,
        editable,
        isNew: false,
      }
      this.showChangeDialog = true
    },
    /* 出库 */
    outputClick(item) {
      this.outPropData = {
        isNew: true,
        editable: true,
        shareData: item,
      }
      this.showOutputDialog = true
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
          threeTimeRiskWasteInputDel(item.row.id)
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
    /* 出库回调 */
    outSuccEvt() {
      this.showOutputDialog = false
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
      <el-form-item label="关键字">
        <el-input
          v-model="searchData.keepingSiteOrSource"
          placeholder="贮存位置或危废来源"
          clearable
        />
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
          <span>{{ setDate(scope.row.putTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="source"
        label="危废来源"
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
        label="入库数量"
        align="center"
      />
      <el-table-column
        prop="unit"
        label="单位"
        align="center"
      />
      <el-table-column
        prop="cacheNum"
        label="暂存量"
        align="center"
      />
      <el-table-column
        prop="keepingSite"
        label="贮存位置"
        align="center"
      />
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
        label="操作"
        align="center"
        width="200"
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
            @click="outputClick(scope.row)"
          >
            出库
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
      <!-- 入库弹窗 -->
      <el-dialog
        class="normal-dialog"
        :visible.sync="showChangeDialog"
        :close-on-click-modal="false"
        width="800px"
        :title="dialogTitleIn"
      >
        <DangerInInfo
          v-if="showChangeDialog"
          v-bind="inPropData"
          @succ="infoSuccEvt"
        />
      </el-dialog>
      <!-- 出库弹窗 -->
      <el-dialog
        class="normal-dialog"
        :visible.sync="showOutputDialog"
        :close-on-click-modal="false"
        width="800px"
        title="新增危废出库"
      >
        <DangerOutInfo
          v-if="showOutputDialog"
          v-bind="outPropData"
          @succ="outSuccEvt"
        />
      </el-dialog>
    </div>
  </SearchTable>
</template>
