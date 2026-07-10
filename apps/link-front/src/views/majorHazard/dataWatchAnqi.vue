<script>
import { getGroupPointByPage } from '@/http/dev/pointGroup-api.js'
import { showFileWindow } from '@/utils/checkFile.js'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import DataWatchInfo from './components/DataWatchInfo.vue'

export default {
  components: {
    CompanyTree,
    DataWatchInfo,
  },
  data() {
    return {
      dialogTitle: '',
      isLoading: false,
      showDialog: false,
      searchData: {
        pageNum: 1,
        pageSize: 20,
        showMore: false,
      },
      propData: {},
      tableData: [],
      total: 0,
      hazardTypeList: [
        { dictCode: 1, dictName: '重大危险源' },
        { dictCode: 2, dictName: '重要危险源' },
      ],
    }
  },
  created() {
    this.searchClick()
  },
  methods: {
    toggleMore() {
      this.searchData.showMore = !this.searchData.showMore
    },
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
        showMore: false,
      }
      this.$refs.companyTree.refreshTree()
    },
    /* 点击搜索 */
    searchClick() {
      this.isLoading = true
      getGroupPointByPage(this.searchData)
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
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data) {
        this.searchData.companyId = data.id
      }
      else {
        delete this.searchData.companyId
      }
      this.queryClick()
    },
    /* 点击实时趋势 */
    realClick(item) {
      this.dialogTitle = '实时趋势'
      this.propData = {
        dataType: 'real',
        deviceCode: item.deviceCode,
        ioCode: item.ioCode,
      }
      this.showDialog = true
    },
    /* 点击历史趋势 */
    historyClick(item) {
      this.dialogTitle = '历史趋势'
      this.propData = {
        dataType: 'history',
        deviceCode: item.deviceCode,
        ioCode: item.ioCode,
      }
      this.showDialog = true
    },
    /* 关闭弹窗事件 */
    closeDialogEvt(isRefresh) {
      this.showDialog = false
      // if (isRefresh) {
      this.searchClick()
      // }
    },
    /* 点击预览说明书 */
    showFileClick(url) {
      showFileWindow(url)
    },
  },
}
</script>

<template>
  <!-- DCS数据监测 -->
  <TreeTable v-loading="isLoading">
    <!-- 左侧树 -->
    <CompanyTree
      ref="companyTree"
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      label-width="60px"
    >
      <el-row>
        <el-col :span="8">
          <el-form-item
            label="危险源名称"
            label-width="72px"
          >
            <el-input
              v-model="searchData.groupName"
              placeholder="危险源名称"
              clearable
            />
          </el-form-item>
        </el-col>

        <el-col
          :span="8"
          style="padding-left: 10px"
        >
          <el-form-item
            label="危险源类型"
            label-width="72px"
          >
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
        </el-col>

        <el-col
          v-if="searchData.showMore"
          :span="8"
          style="padding-left: 10px"
        >
          <el-form-item label="测点名称">
            <el-input
              v-model="searchData.ioName"
              placeholder="测点名称"
            />
          </el-form-item>
        </el-col>

        <el-col
          v-if="searchData.showMore"
          :span="8"
        >
          <el-form-item label="测点编码">
            <el-input
              v-model="searchData.ioCode"
              placeholder="测点编码"
            />
          </el-form-item>
        </el-col>

        <el-col
          :span="8"
          style="padding-left: 10px"
        >
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-search"
            @click="queryClick"
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
          <el-button
            type="text"
            style="margin-left: 8px"
            @click="toggleMore"
          >
            {{ searchData.showMore == true ? '收起' : '高级筛选' }}
            <i :class="searchData.showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <!-- 表格 -->
    <el-table
      slot="table"
      height="100%"
      :data="tableData"
      :header-cell-style="{ borderLeft: 'none', borderRight: 'none' }"
      align="center"
      :border="true"
      class="customer-table"
    >
      <el-table-column
        label="序号"
        align="center"
        type="index"
      />
      <el-table-column
        label="危险源名称"
        align="center"
        prop="groupName"
      />
      <el-table-column
        label="危险源类型"
        align="center"
      >
        <template slot-scope="scope">
          {{
            scope.row.hazardType == 1 ? '重大危险源' : scope.row.hazardType == 2 ? '重要危险源' : ''
          }}
        </template>
      </el-table-column>
      <el-table-column
        label="终端名称"
        align="center"
        prop="deviceName"
      />
      <el-table-column
        label="测点名称"
        align="center"
        prop="ioName"
      />
      <el-table-column
        label="测点编码"
        align="center"
        prop="ioCode"
      />
      <el-table-column
        label="测点值"
        align="center"
        prop="value"
      />
      <el-table-column
        label="测点类型"
        align="center"
        prop="varType"
      />

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
            @click="realClick(scope.row)"
          >
            实时趋势
          </el-button>
          <el-button
            type="text"
            size="mini"
            @click="historyClick(scope.row)"
          >
            历史趋势
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
      @current-change="searchClick"
      @size-change="searchClick"
    />
    <!-- 弹窗 -->
    <div slot="dialog">
      <el-dialog
        class="normal-dialog"
        :title="dialogTitle"
        width="900px"
        top="5vh"
        :visible.sync="showDialog"
        :close-on-click-modal="false"
        @close="closeDialogEvt"
      >
        <DataWatchInfo
          v-if="showDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </TreeTable>
</template>
