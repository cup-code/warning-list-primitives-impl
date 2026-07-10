<script>
import moment from 'moment'
import { certRecheckRecordByPage } from '@/http/base-module/certificateManager-api.js'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree.vue'
import RecheckInfo from './components/RecheckInfo.vue'

export default {
  components: {
    RecheckInfo,
    OwnDeparmentTree,
  },
  data() {
    return {
      propData: {},
      showRecheckInfoDialog: false,
      isLoading: false,
      searchData: {
        pageNum: 1,
        pageSize: 20,
      },
      tableData: [],
      total: 0,
      allDic: {},
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
  },
  created() {
    // 获取字典信息
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.searchClick()
  },
  methods: {
    /* 点击搜索 */
    queryClick() {
      this.searchData.pageNum = 1
      this.searchClick()
    },
    /* 搜索 */
    searchClick() {
      this.isLoading = true
      certRecheckRecordByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list
            this.total = res.data.result.total
          }
          else {
            this.$message.warning(res.data.message || '获取分页列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取分页列表出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data) {
        this.searchData.departmentId = data.id
      }
      else {
        delete this.searchData.departmentId
      }
      this.queryClick()
    },
    /* 关闭详情弹窗事件 */
    recheckInfoDialogEvt(isRefresh) {
      this.showRecheckInfoDialog = false
      if (isRefresh) {
        this.searchClick()
      }
    },
    /* 点击查看/复审 */
    checkInfoClick(infoId, editable) {
      this.propData = {
        infoId,
        editable,
      }
      this.showRecheckInfoDialog = true
    },
    renderState(code) {
      return (
        ((this.allDic || {}).zzzt || []).filter(
          ({ dictCode }) => String(dictCode) === String(code),
        )[0].dictName || ''
      )
    },
  },
}
</script>

<template>
  <KyTreeTable v-loading="isLoading">
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      ref="depTree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
    >
      <el-form-item
        label="姓名"
        label-width="40px"
      >
        <el-input v-model="searchData.fullName" />
      </el-form-item>
      <el-form-item
        label="身份证号"
        label-width="80px"
      >
        <el-input v-model="searchData.identificationNumber" />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-search"
          @click="queryClick"
        >
          查询
        </el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table
      slot="table"
      height="100%"
      :data="tableData"
      :header-cell-style="{ borderLeft: 'none', borderRight: 'none' }"
      align="center"
    >
      <el-table-column
        type="index"
        width="50"
        align="center"
        label="序号"
      />
      <el-table-column
        label="姓名"
        align="center"
        prop="fullName"
      >
        <template slot-scope="scope">
          <span
            class="check"
            @click="checkInfoClick(scope.row.id, false)"
          >{{ scope.row.fullName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="身份证号"
        align="center"
        prop="identificationNumber"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="证照类型"
        prop="licenceTypeName"
        align="center"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="证照名称"
        align="center"
        prop="licenceCateGoryName"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="证照号码"
        align="center"
        prop="licenceNumber"
      />
      <el-table-column
        label="有效开始日期"
        align="center"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          {{ setDate(scope.row.startTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="有效截至日期"
        align="center"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          {{ setDate(scope.row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="证照状态"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ renderState(scope.row.state) }}</span>
          <!-- <el-tag :type="scope.row.state === 0 ? 'success' : 'danger'">{{ scope.row.state === 0 ? '正常' : '过期' }}</el-tag> -->
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="100"
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
          <!-- 过期才能复审 -->
          <el-button
            v-if="scope.row.state !== 5"
            type="text"
            size="mini"
            @click="checkInfoClick(scope.row.id, true)"
          >
            复审
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      slot="page"
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
        title="证照复审"
        :visible.sync="showRecheckInfoDialog"
        width="900px"
        append-to-body
        :close-on-click-modal="false"
      >
        <RecheckInfo
          v-if="showRecheckInfoDialog"
          v-bind="propData"
          @close="recheckInfoDialogEvt"
        />
      </el-dialog>
    </div>
  </KyTreeTable>
</template>
