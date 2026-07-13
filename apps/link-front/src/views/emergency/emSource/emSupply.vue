<script>
import moment from 'moment'
import { emSupplyDel, emSupplyGetByPage } from '@/http/emergency/emsource-api.js'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import CheckRecord from './components/CheckRecord.vue'
import SupplyInfo from './components/SupplyInfo.vue'

export default {
  components: {
    CompanyTree,
    SupplyInfo,
    CheckRecord,
  },
  data() {
    return {
      // 应急详情传递数据
      infoProp: {
        companyData: {}, // 公司树结构
        companyId: '',
        companyName: '',
        isNew: false, // 是否新增
        editable: false, // 是否可编辑
        infoId: undefined, // 详情id
      },
      // 记录保存完毕是否需要刷新table
      isRefresh: false,
      // 纪录传递数据
      recordProp: {
        wplb: '',
        xxfl: '',
        pmdw: '',
        isNew: false, // 是否新增
        infoId: undefined, // 详情id
      },
      isLoading: false,
      total: 0, // 数据总数
      showInfoDialog: false, // 是否打开详情弹窗
      showRecordDialog: false, // 是否打开记录弹窗
      // 搜索数据
      searchData: {
        companyId: '',
        wplb: '',
        condition: '',
        pageNum: 1,
        pageSize: 20,
      },
      // 表格数据
      tableData: [],
      resTypeList: [],
    }
  },
  computed: {
    setDate() {
      return function (timestamp) {
        let date = '-'
        if (timestamp) {
          date = moment(timestamp).format('YYYY/MM/DD')
        }
        return date
      }
    },
    setTypeInfo() {
      return function (typeId, infoId) {
        let name = '--'
        let dictCode = ''
        for (const item of this.resTypeList) {
          if (item.id === typeId) {
            dictCode = item.dictCode
            break
          }
        }
        name = this.$dictUtils.getDictLabelById(dictCode, infoId, '--')
        return name
      }
    },
  },
  created() {
    this.getDataList()
    const dicList = JSON.parse(sessionStorage.getItem('dictList'))
    this.resTypeList = dicList.emergency_resource
  },
  methods: {
    /* 点击公司树的item */
    treeNodeTap(data) {
      if (data) {
        this.searchData.companyId = data.id
        this.infoProp.companyId = data.id
        this.infoProp.companyName = data.name
        this.searchFn() // 再次请求数据
      }
      else {
        delete this.searchData.companyId
      }
    },
    /* 点击查询 */
    searchFn() {
      this.searchData.pageNum = 1
      this.getDataList()
    },
    /* 点击重置 */
    refreshClick() {
      this.searchData = {
        companyId: '',
        wplb: '',
        condition: '',
        pageNum: 1,
        pageSize: 20,
      }
      this.getDataList()
    },
    /* 请求列表数据 */
    getDataList() {
      this.isLoading = true
      emSupplyGetByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list
            this.total = res.data.result.total
          }
          else {
            this.$message.warning(res.data.message || '请求列表数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('请求列表数据出错！', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 新增数据 */
    addClick() {
      const companyData = this.$refs.companyTree.getTreeData()
      this.infoProp.companyData = companyData
      this.infoProp.infoId = undefined
      this.infoProp.isNew = true
      this.infoProp.editable = true
      this.showInfoDialog = true
    },
    /* 查看或修改数据 */
    checkInfoClick(id, editable) {
      const companyData = this.$refs.companyTree.getTreeData()
      this.infoProp.companyData = companyData
      this.infoProp.infoId = id
      this.infoProp.editable = editable
      this.infoProp.isNew = false
      this.showInfoDialog = true
    },
    /* 删除物资数据 */
    delInfoClick(item) {
      this.$confirm(`您确定要删除第${item.$index + 1}条信息吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          emSupplyDel(item.row.id)
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
      this.showInfoDialog = false
      if (isRefresh) {
        this.getDataList()
      }
    },
    /* 刷新物资记录 */
    getRecordData() {
      this.loadingTable = true
      emSupplyRecordGetByPage(this.searchData)
    },
    /* 详情打开记录回调 */
    recordEvt(params) {
      this.isRefresh = true
      this.recordProp = params
      this.showRecordDialog = true
    },
    /* 新增检查记录数据 */
    checkRecordClick(item) {
      this.isRefresh = false
      this.recordProp.wplb = this.$dictUtils.getDictLabelById('emergency_resource', item.wplb, '--')
      this.recordProp.xxfl = this.setTypeInfo(item.wplb, item.xxfl)
      this.recordProp.pmdw = item.pmdw
      this.recordProp.isNew = true
      this.recordProp.infoId = item.id
      this.showRecordDialog = true
    },
    /* 记录保存回调 */
    recordSuccEvt(isRefresh) {
      this.showRecordDialog = false
      this.getDataList()
      if (isRefresh) {
        this.$refs.supplyInfo.getRecordData()
      }
    },
  },
}
</script>

<template>
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
    >
      <el-form-item label="物品类别">
        <el-select
          v-model="searchData.wplb"
          clearable
        >
          <el-option
            v-for="item in resTypeList"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="关键字">
        <el-input
          v-model="searchData.condition"
          class="header-item-data"
          placeholder="品名/地点/负责人/电话"
        />
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
          :disabled="isLoading"
          icon="el-icon-search"
          @click="searchFn"
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
        <!-- <el-button type="success" size="mini" :disabled="isLoading" icon="el-icon-download">excel导入</el-button> -->
        <!-- <el-button type="success" size="mini" :disabled="isLoading" icon="el-icon-upload2">excel导出</el-button> -->
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
        label="应急物品类别"
        align="center"
        min-width="100"
      >
        <template slot-scope="scope">
          <span>{{ $dictUtils.getDictLabelById('emergency_resource', scope.row.wplb, '--') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="详细分类"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ setTypeInfo(scope.row.wplb, scope.row.xxfl) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="品名及单位"
        align="center"
        prop="pmdw"
      />
      <el-table-column
        label="数量"
        align="center"
        prop="sl"
      />
      <el-table-column
        label="存放地点"
        align="center"
        prop="cfdd"
      />
      <el-table-column
        label="负责人"
        align="center"
        prop="fzr"
      />
      <el-table-column
        label="负责人电话"
        align="center"
        prop="fzrdh"
      />
      <el-table-column
        label="最近检查时间"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          <span>{{ setDate(scope.row.jcsj) }}</span>
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
            @click="checkRecordClick(scope.row)"
          >
            检查
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
    <div slot="dialog">
      <el-dialog
        class="normal-dialog"
        :visible.sync="showInfoDialog"
        :close-on-click-modal="false"
        width="800px"
        title="应急物资"
        append-to-body
        top="5vh"
      >
        <SupplyInfo
          v-if="showInfoDialog"
          ref="supplyInfo"
          v-bind="infoProp"
          @succ="infoSuccEvt"
          @record="recordEvt"
        />
      </el-dialog>
      <el-dialog
        class="normal-dialog"
        :visible.sync="showRecordDialog"
        :close-on-click-modal="false"
        width="800px"
        title="应急物资检查记录"
        append-to-body
      >
        <CheckRecord
          v-if="showRecordDialog"
          v-bind="recordProp"
          :isRefresh="isRefresh"
          @succ="recordSuccEvt"
        />
      </el-dialog>
    </div>
  </TreeTable>
</template>
