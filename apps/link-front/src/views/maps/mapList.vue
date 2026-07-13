<script>
import {
  addMap,
  deleteMap,
  editMap,
  getMap,
} from '@/http/map/manage-api'

export default {
  data: () => ({
    statusList: [
      { label: '上架', value: 0 },
      { label: '下架', value: 1 },
    ],
    loadingTable: false, // 表格loading
    tableData: [], // 表格数据
    searchData: {
      // 搜索条件
      pageNum: 1,
      pageSize: 10,
      name: '',
      status: '',
    },
    MoreButton: [
      {
        type: 'text',
        icon: 'edit',
        size: 'mini',
        props: 'set',
        text: '设置',
        disabled: false,
      },
      {
        type: 'text',
        icon: 'delete',
        size: 'mini',
        props: 'delete',
        text: '删除',
        disabled: false,
      },
    ],
    total: 0, // 数据总条数
    drawerEdit: false, // 添加编辑抽屉开关
    drawerTitle: '', // 抽屉标题
    formData: {}, // 提交数据
    loadingSubmit: false, // 提交loading
  }),
  created() {
    this.getDataList()
  },
  methods: {
    /* 获取表格数据 */
    getDataList() {
      this.loadingTable = true
      getMap(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list || []
            this.total = res.data.result.total
          }
          else {
            this.$message.error(res.data.message || '查询地图失败')
          }
        })
        .catch((err) => {
          this.$message.error('查询地图出错', err)
        })
        .finally(() => {
          this.loadingTable = false
        })
    },
    /* 新建地图 */
    addClick() {
      this.formData = {}
      this.drawerTitle = '新建地图'
      this.drawerEdit = true
    },
    /* 编辑地图 */
    editClick(item) {
      this.formData = JSON.parse(JSON.stringify(item))
      this.drawerTitle = '编辑地图'
      this.drawerEdit = true
    },
    /* 删除地图 */
    delClick(item) {
      this.$confirm(`您确认要删除 ${item.name}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loadingTable = true
          deleteMap(item.id)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(res.data.message || '删除失败!')
              }
            })
            .catch((err) => {
              this.$message.error('删除出错!', err)
            })
            .finally(() => {
              this.loadingTable = false
            })
        })
        .catch(() => {})
    },
    /* 编辑地图内容 */
    toEditor(item) {
      this.$router.push({
        path: `/detail/mapEdit/${item.id}`,
      })
    },
    /* 运行地图 */
    toRun(item) {
      this.$router.push({
        path: `/detail/mapView/${item.id}`,
      })
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.ruleForm.validate((valid) => {
        if (!valid)
          return
        this.loadingSubmit = true
        let submitFunc = editMap
        if (this.drawerTitle === '新建地图')
          submitFunc = addMap
        submitFunc(this.formData)
          .then((res) => {
            if (res.data.success) {
              this.$message.success(res.data.message || '提交成功')
              this.getDataList()
              this.drawerEdit = false
            }
            else {
              this.$message.error(res.data.message || '提交失败')
            }
          })
          .catch((err) => {
            this.$message.error('提交出错', err)
          })
          .finally(() => {
            this.loadingSubmit = false
          })
      })
    },
    resetButton() {
      this.searchData.name = ''
      this.getDataList()
    },
  },
}
</script>

<template>
  <KyTreeTable ref="treeTable" :isShowLeft="false">
    <!-- 按钮 -->
    <ECard slot="search" noneBottom>
      <el-input
        v-model="searchData.name"
        style="width: 150px; margin: 0 10px 0 0"
        size="mini"
        placeholder="地图名称"
      />
      <!-- <el-select style="width:150px;margin:0 10px 0 0;" v-model="searchData.status" placeholder="地图状态">
                    <el-option v-for="item in statusList" clearable
                        :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select> -->
      <el-button
        style="margin: 0 10px 0 0"
        type="primary"
        icon="el-icon-search"
        size="mini"
        @click="getDataList"
      >
        查询
      </el-button>
      <el-button
        class="reset"
        icon="el-icon-refresh-right"
        @click="resetButton"
      >
        重置
      </el-button>
    </ECard>
    <!-- <el-row class="map-header">
      <el-col :span="24"> </el-col>
    </el-row> -->
    <!-- <div class="auxiliary-button"></div> -->
    <!-- 表格 -->

    <ECard slot="table">
      <div class="card-cell">
        <el-button
          size="mini"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="addClick"
        >
          新建地图
        </el-button>
      </div>

      <el-table
        v-loading="loadingTable"
        class="group-table"
        :data="tableData"
        size="small"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column
          label="名称"
          prop="name"
          align="center"
        />
        <el-table-column
          label="描述"
          prop="remarks"
          align="center"
        />
        <!-- <el-table-column label="状态" align='center'>
                        <template slot-scope="scope">
                            <span>{{scope.row.status==0?"上架":"下架"}}</span>
                        </template>
                    </el-table-column> -->
        <el-table-column
          label="操作"
          width="250"
          align="center"
        >
          <template slot-scope="scope">
            <EButton
              size="mini"
              icon="plot"
              type="text"
              @click="toEditor(scope.row)"
            >
              绘制
            </EButton>
            <EButton
              size="mini"
              icon="running"
              type="text"
              @click="toRun(scope.row)"
            >
              运行
            </EButton>
            <!-- <el-button size="mini" type="success" @click="editClick(scope.row)">设置</el-button>
            <el-button size="mini" type="danger" @click="delClick(scope.row)">删除</el-button> -->

            <EMoreButton
              icon="more"
              text="更多"
              :list="MoreButton"
              @set="editClick(scope.row)"
              @delete="delClick(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <!-- 页码 -->
    <ECard slot="page" type="footer">
      <el-pagination
        style="text-align: right"
        :current-page.sync="searchData.pageNum"
        :page-size.sync="searchData.pageSize"
        background
        layout="total, prev, pager, next, jumper"
        :total="total"
        @current-change="getDataList"
      />
    </ECard>

    <!-- 添加/编辑 抽屉 -->
    <el-drawer
      slot="dialog"
      :visible.sync="drawerEdit"
      :with-header="false"
      class="drawer-add"
    >
      <div class="drawer-title">
        {{ drawerTitle }}
      </div>
      <el-divider />
      <div class="drawer-con">
        <el-form
          ref="ruleForm"
          :model="formData"
          label-width="85px"
          size="mini"
        >
          <el-form-item label="地图名称" prop="name">
            <el-input v-model="formData.name" />
          </el-form-item>
          <el-form-item label="地图描述" prop="remarks">
            <el-input v-model="formData.remarks" />
          </el-form-item>
        </el-form>
        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            :loading="loadingSubmit"
            @click="submitClick"
          >
            提交
          </el-button>
        </div>
      </div>
    </el-drawer>
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.page-container {
  .map-header {
    background: #ffffff;
    padding: 10px;
  }
  .mid-con {
    padding: 1vh 10px;
    background: #ffffff;
    .group-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
  .hmi-dialog .el-dialog {
    display: flex;
    flex-direction: column;
    .el-dialog__header {
      .el-dialog__headerbtn {
        top: 10px;
        right: 10px;
        .el-dialog__close {
          font-size: 20px;
          font-weight: bold;
        }
      }
    }
    .el-dialog__body {
      flex: 1;
      padding: 0;
      padding-top: 10px;
    }
  }
  .drawer-add {
    .group-item {
      .el-form-item__content {
        display: flex;
        .el-select {
          flex: 1;
          padding-right: 8px;
        }
      }
    }
  }
  .group-dialog {
    .el-dialog__body {
      padding: 20px;
    }
  }
}
.auxiliary-button {
  width: 100%;
  margin-top: 10px;
  padding-left: 10px;
  background: #ffffff;
  box-sizing: border-box;
  line-height: 48px;
}
</style>
