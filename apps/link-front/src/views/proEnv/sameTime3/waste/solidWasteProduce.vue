<script>
import moment from 'moment'
import {
  threeTimeSolidWasteProdByPage,
  threeTimeSolidWasteProdDel,
} from '@/http/pro-env/time3solid-api.js'
import SolidProdInfo from './components/SolidProdInfo.vue'

export default {
  components: {
    SolidProdInfo,
  },
  data() {
    return {
      dialogTitle: '',
      propData: {},
      isLoading: false,
      total: 0, // 数据总数
      showChangeDialog: false, // 是否打开详情弹窗
      // 搜索数据
      searchData: {
        type: '',
        name: '',
        produceDept: '',
        pageNum: 1,
        pageSize: 20,
      },
      wasteType: [], // 废物种类
      wasteName: [], // 废物名称
      prodDeptList: [], // 产生部门
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
    this.prodDeptList = dicList.prod_dept
  },
  methods: {
    /* 请求列表数据 */
    getDataList() {
      this.isLoading = true
      threeTimeSolidWasteProdByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list
            this.total = res.data.result.total
          }
          else {
            this.$message.warning(res.data.message || '请求固废数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('请求固废数据出错！', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 新增固废数据 */
    openChangeClick() {
      this.dialogTitle = '新增固废产生'
      this.propData = {
        isNew: true,
        editable: true,
      }
      this.showChangeDialog = true
    },
    /* 查看或修改固废数据 */
    checkInfoClick(infoId, editable) {
      this.dialogTitle = '固废产生详情'
      this.propData = {
        infoId,
        editable,
        isNew: false,
      }
      this.showChangeDialog = true
    },
    /* 删除固废数据 */
    delInfoClick(item) {
      this.$confirm(`您确定要删除第${item.$index + 1}条信息吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          threeTimeSolidWasteProdDel(item.row.id)
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
      <el-form-item label="废物种类">
        <el-select
          v-model="searchData.type"
          placeholder="请选择废物种类"
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
      <el-form-item label="废物名称">
        <el-select
          v-model="searchData.name"
          placeholder="请选择废物名称"
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
      <el-form-item label="产生部门">
        <el-select
          v-model="searchData.produceDept"
          placeholder="请选择产生部门"
          clearable
        >
          <el-option
            v-for="item in prodDeptList"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
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
          @click="openChangeClick"
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
        label="产生时间"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          <span>{{ setDate(scope.row.createdTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="废物分类"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ $dictUtils.getDictLabelById('waste_type', scope.row.type, '--') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="废物名称"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ $dictUtils.getDictLabelById('waste_name', scope.row.name, '--') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="num"
        label="数量"
        align="center"
      />
      <el-table-column
        prop="unit"
        label="单位"
        align="center"
      />
      <el-table-column
        prop="source"
        label="来源"
        align="center"
      />
      <el-table-column
        label="产生部门"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ $dictUtils.getDictLabelById('prod_dept', scope.row.produceDept, '--') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="经办人"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ $dictUtils.getDictLabelById('prod_person', scope.row.dutyPerson, '--') }}</span>
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
      <el-dialog
        class="normal-dialog"
        :visible.sync="showChangeDialog"
        :close-on-click-modal="false"
        width="800px"
        :title="dialogTitle"
      >
        <SolidProdInfo
          v-if="showChangeDialog"
          v-bind="propData"
          @succ="infoSuccEvt"
        />
      </el-dialog>
    </div>
  </SearchTable>
</template>
