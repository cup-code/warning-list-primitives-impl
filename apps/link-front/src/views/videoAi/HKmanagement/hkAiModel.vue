<script>
import { deleteHKModel, getHKModelList } from '@/http/hkAi-api'

import AddModelDialog from '../components/addModelDialog.vue'
import SearchItem from '../components/searchItem.vue'

export default {
  components: {
    SearchItem,
    AddModelDialog,
  },
  data() {
    return {
      buttonList: [
        { text: '查看', id: 'check', type: 'primary' },
        { text: '编辑', id: 'edit', type: 'warning' },
        { text: '删除', id: 'delete', type: 'danger' },
      ],
      dialogForm: {
        mpId: '',
        mpName: '',
        target: '',
        modelId: '',
        labelId: '',
        labelName: '',
        propType: '',
      },
      searchInfo: {},
      loading: true,
      dataList: [],
      pageNo: 1,
      pageSize: 5,
      total: 0,
      showAddDialog: false,
      isDisabled: false,
    }
  },
  created() {
    this.getDataList()
  },
  methods: {
    onSearch(info) {
      this.searchInfo = info
      this.getDataList(info)
    },

    onAddConfirm() {
      this.getDataList()
    },

    pageSizeFn(v) {
      this.pageNo = 1
      this.pageSize = v
      this.getDataList(this.searchInfo)
    },

    pageCurFn(v) {
      this.pageNo = v
      this.getDataList(this.searchInfo)
    },

    onDelete(info = {}) {
      this.$confirm(`您确认要删除 ${info.mpName}` || '—— ——', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        deleteHKModel(info.id)
          .then((res) => {
            if (res.data.success) {
              this.$message.success('删除成功！')
              this.getDataList()
            }
            console.log(res, 'res')
          })
          .catch((error) => {})
      })
    },

    onRegister(info) {
      registerDevice(info)
        .then((res) => {
          if (res.data.success) {
            this.$message.success('删除成功！')
            this.getDataList()
          }
        })
        .catch()
    },

    onClick(ids, info) {
      const {
        id,
        mpId,
        mpName,
        target,
        modelId,
        labelId,
        labelName,
        propType,
      } = info

      switch (ids) {
        case 'delete':
          this.onDelete(info)
          break
        case 'edit':
          this.showAddDialog = true
          this.dialogForm = {
            id,
            mpId,
            mpName,
            target,
            modelId,
            labelId,
            labelName,
            propType,
          }
          break
        case 'check':
          this.isDisabled = true
          this.showAddDialog = true
          this.dialogForm = info
          break
      }
    },

    addFn() {
      this.showAddDialog = true
    },

    getDataList(info = {}) {
      const param = {
        pageSize: this.pageSize,
        pageNum: this.pageNo,
      }

      if (this.searchInfo.name) {
        param.mpName = this.searchInfo.name
      }

      getHKModelList(param)
        .then((res) => {
          const { data } = res
          if (data.success) {
            this.dataList = data.result.list || []

            const {
              total,
              pageNum,
              pageSize,
            } = data.result
            this.total = total || 0
            this.pageNo = pageNum
            this.pageSzie = pageSize
          }

          this.loading = false
        })
        .catch((err) => {
          this.loading = false
        })
    },
  },
}
</script>

<template>
  <KyTreeTable
    ref="treeTable"
    :isShowLeft="false"
  >
    <!-- 查询条件 -->
    <ECard
      slot="search"
      noneBottom
    >
      <SearchItem @search="onSearch" />
    </ECard>
    <ECard slot="table">
      <div class="card-cell">
        <EButton
          type="primary"
          btnIcon="el-icon-plus"
          plain
          @click="addFn"
        >
          新增
        </EButton>
      </div>

      <el-table
        v-loading="loading"
        :data="dataList"
        style="width: 100%"
        size="mini"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column
          label="模型id"
          prop="mpId"
          align="left"
        />
        <el-table-column
          label="模型名称"
          prop="mpName"
          align="center"
        />
        <el-table-column
          label="目标类别"
          prop="target"
          align="center"
        />
        <el-table-column
          label="目标id"
          prop="modelId"
          align="center"
        />
        <el-table-column
          label="标签id"
          prop="labelId"
          align="center"
        />
        <el-table-column
          label="标签名称"
          prop="labelName"
          align="center"
        />
        <el-table-column
          label="属性类型"
          prop="propType"
          align="center"
        />
        <el-table-column
          label="操作"
          align="right"
        >
          <template slot-scope="scope">
            <el-button
              v-for="(item, index) in buttonList"
              :key="index"
              type="text"
              :style="`color:var(--ky-${item.type})`"
              @click="onClick(item.id, scope.row)"
            >
              {{ item.text }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <!-- 分页 -->
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        :current-page.sync="pageNo"
        :page-sizes="[5, 10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, prev, pager, next, jumper, sizes"
        :total="total"
        @size-change="pageSizeFn"
        @current-change="pageCurFn"
      />
    </ECard>

    <template slot="dialog">
      <AddModelDialog
        :disabled.sync="isDisabled"
        :forms.sync="dialogForm"
        :dialogVisible.sync="showAddDialog"
        title="新增模型"
        @confirm="onAddConfirm"
      />
    </template>
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.page-container {
  padding: 20px;

  .page-cell {
    padding: 14px 10px;
    background-color: #ffffff;
    margin-bottom: 12px;
    width: 100%;
    height: 100%;

    .button--add {
      margin-bottom: 20px;
    }

    &--footer {
      padding: 14px 10px;
      background-color: #ffffff;
      margin-bottom: 12px;
      text-align: right;
    }
  }
}
</style>
