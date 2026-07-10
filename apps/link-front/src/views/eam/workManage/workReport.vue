<script>
import { deleteWork, getWorkList } from '@/http/workmanage/work-api'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import AddWork from './components/addWork.vue'
import CFilter from './components/CFilter.vue'
import CTable from './components/CTable.vue'
import CTabs from './components/CTabs.vue'
import DealDialog from './components/dealDialog.vue'

import info from './components/tableInfo'

export default {
  name: 'workReport',
  components: {
    CompanyTree,
    CTable,
    CFilter,
    AddWork,
    OwnDeparmentTree,
    DealDialog,
    CTabs,
  },
  data() {
    return {
      searchData: {
        pageNum: 1,
        pageSize: 10,
      },
      showAddwork: false,
      showDeal: false,
      isDetail: false,
      total: 0,
      hideLeft: false,
      formInline: { workOrderNum: '', workOrderType: '', workTime: [] },
      tableData: [],
      workType: '1',
      list: info.list,
      tabsList: info.tabsList,
      fliterList: info.fliterList || [],
      isLoading: false,
      tableLoading: false,
      dialogInfo: {},
      dealInfo: {},
    }
  },
  mounted() {
    this.getDataList()
    this.getFileList()
  },

  methods: {
    getFileList() {
      console.log(this.$dictUtils.getDictList('back_type'), 9)
      this.fliterList[1].options = this.$dictUtils
        .getDictList('back_type')
        .map((itme) => {
          return {
            label: itme.dictName,
            value: itme.dictName,
          }
        })
    },
    onDetail(item) {
      this.isDetail = true
      this.showAddwork = true
      this.dialogInfo = item
    },

    onSearch(info) {
      this.getDataList(info)
    },
    onDeal(item) {
      this.showDeal = true
      this.dealInfo = item
    },
    getDataList(info) {
      this.tableLoading = true

      console.log(info)
      try {
        this.tableLoading = false
        const param = { ...this.searchData, ...info }

        getWorkList(param)
          .then((result) => {
            const { data } = result

            if (data.success) {
              this.tableData = data.result.list
              this.total = data.result.total
            }
          })
          .catch(() => {})
      }
      catch (e) {
        console.log(e)
      }
    },
    // 切换工单列表
    onChange(e) {
      this.workType = e
      this.getDataList()
    },
    pageSizeFn(v) {
      this.searchData.pageNum = 1
      this.searchData.pageSize = v
      this.getDataList()
    },
    pageCurFn(v) {
      this.searchData.pageNum = v
      this.getDataList()
    },
    onDelete(e) {
      // 删除工单
      this.$confirm(`您确认要删除吗?`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          deleteWork(e.id)
            .then((res) => {
              const { data } = res
              if (data.success) {
                this.$message.success(`删除成功`)
                this.getDataList()
              }
            })
            .catch((err) => {
              console.log(err)
            })
        })
        .catch(() => {})
    },

    onSuccessFresh() {
      this.getDataList()
    },

    onAdd() {
      this.showAddwork = true
    },
    treeNodeTap(e) {
      this.getDataList({ departmentId: e.id })
    },
  },
}
</script>

<template>
  <TreeTable v-loading="isLoading">
    <!-- 左侧树 -->
    <!-- <CompanyTree title="所有客户" slot="tree" @treeNodeTap="treeNodeTap" ref="companyTree" /> -->
    <OwnDeparmentTree slot="tree" @treeNodeTap="treeNodeTap" />
    <ECard
      slot="search"
      customStyle="margin-bottom:0px"
      type="search"
    >
      <CFilter
        :list="fliterList"
        :formInline.sync="formInline"
        @search="onSearch"
      />
    </ECard>

    <ECard slot="table">
      <div class="card-cell">
        <EButton
          type="primary"
          plain
          btnIcon="el-icon-plus"
          @click="onAdd"
        >
          新建工单
        </EButton>
      </div>
      <!-- <CTabs :tabsList="tabsList" @change="onChange" /> -->
      <CTable
        v-slot="props"
        :tableData="tableData"
        :list="list"
        :loading="tableLoading"
      >
        <!-- <div v-show="workType === '1'"> -->

        <EButton
          type="text"
          icon="check"
          @click="onDetail(props.info)"
        >
          详情
        </EButton>
        <EButton
          v-if="props.info.orderStatus !== '已完成'"
          type="text"
          icon="deal"
          @click="onDeal(props.info)"
        >
          处理
        </EButton>
        <EButton
          type="text"
          icon="delete"
          @click="onDelete(props.info)"
        >
          删除
        </EButton>
        <!-- </div> -->
        <!-- <div v-show="workType === '2'">
          <EButton type="text">详情</EButton>
          <EButton type="text">撤回</EButton>
          <EButton type="text">重新提交</EButton>
        </div>
        <div v-show="workType === '3'">
          <EButton type="text">详情</EButton>
        </div> -->
      </CTable>
    </ECard>

    <ECard slot="page" type="footer">
      <el-pagination
        style="text-align: right"
        background
        :current-page="searchData.pageNum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="searchData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="pageSizeFn"
        @current-change="pageCurFn"
      />
    </ECard>

    <div slot="dialog">
      <AddWork
        :visibleDialog.sync="showAddwork"
        :isDetail.sync="isDetail"
        :dialogInfo="dialogInfo"
        @confirm="onSuccessFresh"
      />
      <DealDialog
        :visible.sync="showDeal"
        :dialogInfos="dealInfo"
        @confirm="onSuccessFresh"
      />
    </div>
  </TreeTable>
</template>

<style lang="scss" scoped>
.page-container-sidebar {
  height: calc(100vh - 73px);
}
.toggle-btn {
  z-index: 1;
  position: absolute;
  top: 50%;
  left: 100%;
  cursor: pointer;
  user-select: none;
  background: rgba($color: #000000, $alpha: 0.1);
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  padding: 5px;
}
</style>
