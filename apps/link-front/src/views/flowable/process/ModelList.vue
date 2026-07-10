<script>
// import ModelForm from './ModelForm'
import SelfBpmn from '@/components/SelfBpmn'
import {
  exportBpmnXml,
  flowableModelCopy,
  flowableModelDelete,
  flowableModelDeploy,
  flowableProcessUpdateActive,
  flowableProcessUpdateSuspend,
  getExtensionActCategoryTreeData,
  getFlowableModelList,
} from '@/http/safe-production/flowable-api'

import CategoryForm from './CategoryForm'

export default {
  components: {
    SelfBpmn,
    // ModelForm,
    CategoryForm,
  },
  data() {
    return {
      searchForm: {
        filterText: '',
      },
      filterText: '',
      selectCategoryName: '',
      categoryTreeData: [],
      dataList: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      visible: false,
      dataListSelections: [],
      processPhotoUrl: '',
      visible_df: false,
      moreButton: [
        {
          type: 'text',
          icon: 'edit',
          size: 'mini',
          text: '激活',
          disabled: false,
        },
        {
          type: 'text',
          icon: 'edit',
          size: 'mini',
          text: '挂起',
          disabled: false,
        },
        { type: 'text', icon: '', size: 'mini', text: '导出', disabled: false },
        {
          type: 'text',
          icon: 'el-icon-copy-document',
          size: 'mini',
          text: '复制',
          disabled: false,
        },
        {
          type: 'text',
          icon: 'delete',
          size: 'mini',
          text: '删除',
          disabled: false,
        },
      ],
    }
  },
  computed: {
    getButton() {
      return function (scope) {
        return this.moreButton.map((item) => {})
      }
    },
  },
  watch: {
    filterText(val) {
      this.$refs.categoryTree.filter(val)
    },
  },

  mounted() {
    this.refreshList()
  },
  methods: {
    filterNode(value, data) {
      if (!value)
        return true
      return data.name.includes(value)
    },
    // 获取树数据
    refreshTree() {
      getExtensionActCategoryTreeData().then(({ data }) => {
        this.categoryTreeData = data.treeData
      })
    },
    handleNodeClick(data) {
      this.searchForm.category = data.id
      this.selectCategoryName = `已选类型: ${data.name}`
      this.refreshList()
    },
    // 获取数据列表
    refreshList() {
      this.loading = true
      getFlowableModelList({
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        ...this.searchForm,
      })
        .then(({ data }) => {
          if (data && data.success) {
            this.dataList = data.page.list
            this.total = data.page.count
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 每页数
    sizeChangeHandle(val) {
      this.pageSize = val
      this.pageNo = 1
      this.refreshList()
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageNo = val
      this.refreshList()
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val
    },
    design(row) {
      this.visible_df = true
      this.$nextTick(() => {
        this.$refs.selfBpmn
        && this.$refs.selfBpmn.init(row.id, row.procDef.category)
      })
    },
    design2(row) {
      window.open(
        `${process.env.VUE_APP_SERVER_URL}/static/modler/index.html#/editor/${row.id}`,
      )
    },
    exportXML(row) {
      // window.open(`${process.env.VUE_APP_SERVER_URL}/flowable/model/rest/models/${row.id}/bpmn20?version=` + new Date().getTime())
      // let url = `${process.env.NODE_ENV == 'development' ? window.g.BASE_URL_DEV : window.g.BASE_URL_PRO}flowable/model/rest/models/${row.id}/bpmn20?version=${new Date().getTime()}`
      // window.open(url)
      exportBpmnXml(row.id)
    },
    // 部署
    deploy(row) {
      this.$confirm(`确认要发布流程吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        const category = row.procDef.category ? row.procDef.category : '未分类'

        flowableModelDeploy({
          id: row.id,
          category,
        }).then(({ data }) => {
          if (data && data.success) {
            this.$message.success({
              dangerouslyUseHTMLString: true,
              message: data.msg,
            })
            this.refreshList()
          }
        })
      })
    },
    // 新增
    add() {
      this.visible_df = true
      this.$nextTick(() => {
        this.$refs.selfBpmn.init()
      })
    },
    // 删除
    del(id) {
      const ids
        = id
          || this.dataListSelections
            .map((item) => {
              return item.id
            })
            .join(',')
      this.$confirm(
        `确定删除该流程吗?删除流程会级联删除已经存在的实例与历史数据，且不可恢复，请谨慎操作!`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        },
      ).then(() => {
        this.loading = true
        flowableModelDelete(ids)
          .then(({ data }) => {
            if (data && data.success) {
              this.$message.success(data.msg)
              this.refreshList()
            }
          })
          .finally(() => {
            this.loading = false
          })
      })
    },
    // 复制
    copy(id) {
      this.$confirm(`确定复制该流程吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true
        flowableModelCopy({ id })
          .then(({ data }) => {
            if (data && data.success) {
              this.$message.success(data.msg)
              this.refreshList()
            }
          })
          .finally(() => {
            this.loading = false
          })
      })
    },
    suspend(row) {
      this.$confirm(`确认要挂起该流程吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        flowableProcessUpdateSuspend(row.id).then(({ data }) => {
          if (data && data.success) {
            this.$message.success({
              dangerouslyUseHTMLString: true,
              message: data.msg,
            })
            this.refreshList()
          }
        })
      })
    },
    active(row) {
      this.$confirm(`确定要激活码?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        flowableProcessUpdateActive(row.id).then(({ data }) => {
          if (data && data.success) {
            this.$message.success({
              dangerouslyUseHTMLString: true,
              message: data.msg,
            })
            this.refreshList()
          }
        })
      })
    },
    setCategory() {
      const row = this.dataListSelections[0]
      if (row.procDef.id) {
        this.$refs.categoryForm.init(row.procDef.id, row.procDef.category)
      }
      else {
        this.$message.error('未发布的流程不能设置分类，请先发布流程')
      }
    },
    resetSearch() {
      this.searchForm.category = ''
      this.selectCategoryName = ''
      this.$refs.searchForm.resetFields()
      this.$nextTick(() => {
        this.refreshList()
      })
    },
  },
}
</script>

<template>
  <KyTreeTable :isShowLeft="false">
    <ECard
      slot="search"
      type="search"
      noneBottom
    >
      <el-form
        ref="searchForm"
        size="small"
        :inline="true"
        class="query-form"
        :model="searchForm"
        @keyup.enter.native="refreshList()"
        @submit.native.prevent
      >
        <el-form-item label="模型名称" prop="filterText">
          <el-input
            v-model="searchForm.filterText"
            size="small"
            placeholder="请输入关键词"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-search"
            @click="refreshList()"
          >
            查询
          </el-button>
          <el-button
            size="mini"
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
          size="mini"
          icon="el-icon-plus"
          @click="add()"
        >
          新建
        </el-button>
        <EButton
          plain
          type="danger"
          size="mini"
          icon="delete"
          :disabled="dataListSelections.length <= 0"
          @click="del()"
        >
          删除
        </EButton>
        <EButton
          plain
          type="success"
          size="mini"
          :disabled="dataListSelections.length != 1"
          @click="setCategory()"
        >
          设置分类
        </EButton>
        <el-button-group class="pull-right">
          <el-tooltip
            class="item"
            effect="dark"
            content="刷新"
            placement="top"
          >
            <el-button
              type="default"
              size="mini"
              icon="el-icon-refresh"
              @click="refreshList"
            />
          </el-tooltip>
        </el-button-group>
      </div>

      <el-table
        v-loading="loading"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        :data="dataList"
        size="mini"
        class="table"
        @selection-change="selectionChangeHandle"
      >
        <el-table-column
          type="selection"
          header-align="center"
          align="center"
          width="50"
        />
        <el-table-column
          prop="name"
          show-overflow-tooltip
          label="流程名称"
        />
        <el-table-column
          prop="key"
          show-overflow-tooltip
          label="流程KEY"
        />
        <el-table-column prop="procDef.category" label="分类" />
        <el-table-column prop="version" label="流程版本">
          <template slot-scope="scope">
            <el-tag>{{ scope.row.procDef.version || "0" }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="流程状态">
          <template slot-scope="scope">
            <el-tag
              :type="
                scope.row.procDef.suspended === false
                  ? 'success'
                  : scope.row.procDef.suspended === undefined
                    ? 'primary'
                    : 'danger'
              "
            >
              {{
                scope.row.procDef.suspended === false
                  ? "已发布"
                  : scope.row.procDef.suspended === undefined
                    ? "草稿"
                    : "已挂起"
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="lastUpdated"
          show-overflow-tooltip
          label="更新时间"
        >
          <template slot-scope="scope">
            {{ scope.row.lastUpdated }}
          </template>
        </el-table-column>
        <el-table-column
          :key="Math.random()"
          fixed="right"
          header-align="center"
          align="center"
          width="250"
          label="操作"
        >
          <template slot-scope="scope">
            <EButton
              type="text"
              icon="edit"
              size="mini"
              @click="design(scope.row)"
            >
              设计
            </EButton>
            <EButton
              type="text"
              icon="running"
              size="mini"
              @click="deploy(scope.row)"
            >
              发布
            </EButton>
            <!-- <EMoreButton
              icon="more"
              text="更多"
              :list="getButton(scope.row)"
            ></EMoreButton> -->
            <el-dropdown size="mini" style="margin-left: 10px">
              <el-button type="text" size="mini">
                更多<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="scope.row.procDef.suspended === true">
                  <el-button
                    type="text"
                    size="small"
                    @click="active(scope.row.procDef)"
                  >
                    激活
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item v-if="scope.row.procDef.suspended === false">
                  <el-button
                    type="text"
                    size="small"
                    @click="suspend(scope.row.procDef)"
                  >
                    挂起
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button
                    type="text"
                    size="small"
                    @click="exportXML(scope.row)"
                  >
                    导出
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button
                    type="text"
                    size="small"
                    @click="copy(scope.row.id)"
                  >
                    复制
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button
                    type="text"
                    size="small"
                    @click="del(scope.row.id)"
                  >
                    删除
                  </el-button>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <ECard slot="page" type="footer">
      <el-pagination
        style="text-align: right"
        :current-page="pageNo"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="sizeChangeHandle"
        @current-change="currentChangeHandle"
      />
    </ECard>

    <template slot="dialog">
      <el-dialog
        title="查看进度"
        :close-on-click-modal="true"
        :visible.sync="visible"
        height="600px"
      >
        <iframe
          :src="processPhotoUrl"
          frameborder="0"
          scrolling="auto"
          width="100%"
          height="600px"
        />
      </el-dialog>

      <!-- 流程设计 弹框 -->
      <el-dialog
        v-if="visible_df"
        class="large-dialog"
        title="流程设计"
        width="70%"
        :close-on-click-modal="false"
        :visible.sync="visible_df"
      >
        <self-bpmn ref="selfBpmn" @refreshList="refreshList" />
      </el-dialog>

      <!-- 设置分类 弹窗 -->
      <category-form ref="categoryForm" @refreshList="refreshList" />
    </template>
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.page-container {
  //   padding: 10px;
  //   height: calc(100vh - 50px);
  //   box-sizing: border-box;
  //   display: flex;
  //   flex-direction: column;
  //   .query-form {
  //     .el-form-item {
  //       margin-bottom: 12px;
  //     }
  //     .el-form-item__label {
  //       font-size: 14px !important;
  //     }
  //   }
  .main-con {
    box-shadow: 0 0 12px 2px rgba(0, 0, 0, 0.1);
    flex: 1;
    padding: 10px;
    .pull-right {
      float: right;
    }
    .el-table {
      margin-top: 10px;
      margin-bottom: 10px;
      border-top: 1px solid #ebeef5;
      .el-table__header {
        thead tr {
          background-color: #f6f7fa;
          font-weight: 400;
          th {
            background-color: #f6f7fa;
            font-weight: 400;
          }
        }
      }
    }
    .el-pagination {
      text-align: right;
    }
  }
}
.selfBpmn-dialog {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 2vh;
  .el-dialog {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .el-dialog__header {
      border-bottom: 1px solid #e8e8e8;
      i.el-dialog__close {
        font-weight: bold;
        color: #000;
        &:hover {
          color: red;
        }
      }
    }
    .el-dialog__body {
      flex: 1;
      overflow: auto;
      padding: 0;
    }
  }
}
</style>
