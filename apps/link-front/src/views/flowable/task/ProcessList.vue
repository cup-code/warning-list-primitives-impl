<script>
import moment from 'moment'
import defaultImg from '@/assets/flowable/Scheme.png'
import {
  getExtensionActCategoryTreeData,
  getFlowableProcessList,
  getFlowableTaskDef,
} from '@/http/safe-production/flowable-api'

export default {
  data() {
    return {
      defaultImg,
      searchForm: {
        category: '',
        name: '',
      },
      filterText: '',
      dataList: [],
      categoryTreeData: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      isSearchCollapse: false,
      loading: false,
      visible: false,
      dataListSelections: [],
      processPhotoUrl: '',
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            },
          },
        ],
      },
    }
  },
  computed: {
    dataList2() {
      return this.dataList.filter((data) => {
        return data.name.includes(this.searchForm.name)
      })
    },
    userName() {
      return JSON.parse(sessionStorage.getItem('user')).username
    },
  },
  watch: {
    filterText(val) {
      this.$refs.categoryTree.filter(val)
    },
  },
  mounted() {
    this.refreshTree()
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
    // 获取数据列表
    refreshList() {
      this.loading = true
      getFlowableProcessList({
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
    start(row) {
      // 读取流程表单
      const tabTitle = `发起流程【${row.name}】`
      const processTitle = `${this.userName} 在 ${moment(new Date()).format(
        'YYYY-MM-DD HH:mm',
      )} 发起了 [${row.name}]`

      getFlowableTaskDef({
        procDefId: row.id,
        status: 'start',
      }).then(({ data }) => {
        if (data.success) {
          this.$router.push({
            path: '/flowable/task/TaskForm',
            query: {
              procDefId: row.id,
              procDefKey: row.key,
              status: 'start',
              title: tabTitle,
              formType: data.flow.formType,
              formUrl: data.flow.formUrl,
              formTitle: processTitle,
            },
          })
        }
      })
    },
    handleNodeClick(data) {
      this.searchForm.category = data.name
      this.refreshList()
    },
    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.searchForm.category = ''
      this.filterText = ''
      this.$refs.categoryTree.setCurrentKey(null)
      this.refreshList()
    },
  },
}
</script>

<template>
  <div class="processList-task-flowable">
    <div class="processList-left">
      <div class="title">
        <el-input
          v-model="filterText"
          placeholder="分类:请输入关键字过滤"
          size="mini"
          clearable
        />
      </div>

      <div class="scrollbar el-scrollbar">
        <div class="el-scrollbar__wrap">
          <div class="el-scrollbar__view">
            <el-tree
              ref="categoryTree"
              class="filter-tree"
              :data="categoryTreeData"
              :props="{
                value: 'id', // ID字段名
                label: 'name', // 显示名称
                children: 'children', // 子级字段名
              }"
              default-expand-all
              :filter-node-method="filterNode"
              :expand-on-click-node="false"
              node-key="id"
              highlight-current
              @node-click="handleNodeClick"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="processList-right">
      <el-form
        ref="searchForm"
        size="small"
        :inline="true"
        class="query-form"
        :model="searchForm"
        @keyup.enter.native="refreshList()"
        @submit.native.prevent
      >
        <el-form-item
          label="流程名称"
          prop="name"
        >
          <el-input
            v-model="searchForm.name"
            size="mini"
            placeholder="请输入流程名称"
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

      <div
        class="main-con"
        style="overflow: auto"
      >
        <el-row :gutter="12">
          <el-col
            v-for="data in dataList2"
            :key="data.id"
            :span="8"
          >
            <el-card
              class="box-card"
              style="margin-bottom: 10px"
            >
              <!-- <div slot="header" class="clearfix">
                                <span> {{data.category }}</span>
                                <el-button style="float: right; padding: 3px 0" type="text" @click="start(data)">启动</el-button>
                            </div> -->
              <div class="actCard">
                <img
                  :src="defaultImg"
                  style="vertical-align: middle"
                >
                <el-button
                  style="
                    color: #409eff;
                    margin-left: 10px;
                    width: 150px;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                    font-size: 14px;
                  "
                  type="text"
                  @click="start(data)"
                >
                  {{ `${data.name} ${data.version}` }}
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.processList-task-flowable {
  padding: 10px;
  height: calc(100vh - 50px);
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  .processList-left {
    background-color: #fff;
    width: 220px;
    height: 100%;
    padding: 0 10px;
    display: flex;
    flex-direction: column;
    margin-right: 10px;
    .title {
      padding-top: 10px;
    }
    .scrollbar {
      flex: 1;
      .el-scrollbar__wrap {
        overflow: auto !important;
        .filter-tree {
          margin-top: 15px;
          font-size: 14px;
          .el-tree-node__label {
            font-size: 14px;
          }
        }
      }
    }
  }
  .processList-right {
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;

    .query-form {
      background-color: #fff;
      padding-left: 12px;
      padding-top: 12px;
      margin-bottom: 10px;
      .el-form-item {
        margin-bottom: 12px;
      }
      .el-form-item__label {
        font-size: 14px !important;
      }
    }
    .main-con {
      background-color: #fff;
      flex: 1;
      padding: 10px;
    }
  }
}
</style>
