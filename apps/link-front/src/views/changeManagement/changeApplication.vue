<script>
import { deleteChange, getchangeManagementList } from '@/http/changeManagement/changeManagement-api'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree.vue'

export default {
  components: {
    OwnDeparmentTree,
  },
  data() {
    return {
      isLoading: false,
      showInfoDialog: false,
      searchData: {
        pageNum: 1,
        pageSize: 10,
      },
      propData: {}, // 弹窗传参数据
      tableData: [
        {
          applyUnitName: '公司名称',
          applicationDepartment: '申请部门',
          jobNumber: '项目名称',
          changeCategory: '变更类别',
          workInfo: '四新性质',
          changeLevel: '变更层级',
          workStartDate: '申请人',
          workEndDate: '项目负责人',
          ticketStatus: 50,
          status: '申请中',
          id: 123,
        },
      ], // 表格数据
      total: 0, // 表格数据总数
      statusTypeList: [
        {
          label: '四新审批中',
          value: 0,
        },
        {
          label: '验收中',
          value: 1,
        },
        {
          label: '验收完成',
          value: 2,
        },
        // {
        //   label: '申请中',
        //   value: 1
        // },
        // {
        //   label: '四新评审',
        //   value: 2
        // },
        // {
        //   label: '领导审批',
        //   value: 3
        // },
        // {
        //   label: '验收中',
        //   value: 4
        // },
        // {
        //   label: '变更完成',
        //   value: 5
        // }
      ],
    }
  },
  computed: {
    setChangeLevel() {
      return function (val) {
        let msg = ''
        switch (Number.parseInt(val)) {
          case 1:
            msg = '部门级'
            break
          case 2:
            msg = '工厂级'
            break
          case 3:
            msg = '集团级'
            break
        }
        return msg
      }
    },
    setFourProperties() {
      return function (val) {
        let text = ''
        switch (Number.parseInt(val)) {
          case 1:
            text = '新技术'
            break
          case 2:
            text = '新工艺'
            break
          case 3:
            text = '新材料'
            break
          case 4:
            text = '新设备'
            break
        }
        return text
      }
    },
    setChangeStatus() {
      return function (val) {
        let status = ''
        switch (Number.parseInt(val)) {
          case 0:
            status = '四新评审中'
            break
          case 1:
            status = '验收中'
            break
          case 2:
            status = '验收完成'
            break
        }
        return status
      }
    },
  },
  created() {
    this.searchClick(true)
  },
  methods: {
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
      }
      this.$refs.depTree.refreshTree()
    },
    /* 点击搜索 */
    searchClick() {
      this.isLoading = true
      getchangeManagementList(this.searchData)
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
    //   /* 点击左侧树的item */
    treeNodeTap(data) {
      if (data) {
        this.searchData.departmentId = data.id
      }
      else {
        delete this.searchData.workUnitId
      }
      this.queryClick()
    },
    // 打开表单(添加、查看、修改)
    changeFn(type, infoData) {
      switch (type) {
        case 'view':
          this.$router.push({
            path: `/detail/changeDetail/${infoData.id}/view`,
          })
          break
        case 'checkAccept':
          this.$router.push({
            path: `/detail/changeDetail/${infoData.id}/checkAccept`,
            query: infoData,
          })
          break
        case 'add':
          this.$router.push({
            path: `/detail/changeDetail/${null}/add`,
          })
          break
      }
    },
    // 删除
    delList(item) {
      this.$confirm('确定删除本条数据?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        deleteChange(item.id).then(({ data }) => {
          this.queryClick()
        })
      })
    },
    /* 关闭弹窗事件 */
    closeDialogEvt() {
      this.showInfoDialog = false
    },
  },
}
</script>

<template>
  <!-- 变更申请台账 -->
  <KyTreeTable v-loading="isLoading">
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      ref="depTree"
      title="责任部门"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
    >
      <el-form-item label="关键字">
        <el-input
          v-model="searchData.keyQuery"
          clearable
          placeholder="项目名称/重大危险性评价/评审结论"
          @clear="refreshClick"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="searchData.changeStatus"
          clearable
          @clear="refreshClick"
        >
          <el-option
            v-for="item in statusTypeList"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          />
        </el-select>
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
        <el-button
          class="reset"
          size="mini"
          icon="el-icon-refresh-right"
          @click="refreshClick"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>
    <div slot="auxiliary">
      <el-button
        icon="el-icon-plus"
        type="primary"
        plain
        @click="changeFn('add')"
      >
        新增
      </el-button>
    </div>
    <!-- 表格 -->
    <el-table
      slot="table"
      height="100%"
      :data="tableData"
      :header-cell-style="{ borderLeft: 'none', borderRight: 'none' }"
      align="center"
    >
      <el-table-column
        label="序号"
        align="center"
        type="index"
      />
      <el-table-column
        label="公司"
        align="center"
        prop="companyName"
      />
      <el-table-column
        label="申请部门"
        align="center"
        prop="departmentName"
      />
      <el-table-column
        label="项目名称"
        align="center"
        prop="projectName"
      />
      <el-table-column
        label="变更类别"
        align="center"
        prop="changeType"
      />
      <el-table-column
        label="四新性质"
        align="center"
        prop="fourProperties"
      >
        <template slot-scope="scope">
          <span>{{ setFourProperties(scope.row.fourProperties) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="变更层级"
        align="center"
        prop="changeLevel"
      >
        <template slot-scope="scope">
          <span>{{ setChangeLevel(scope.row.changeLevel) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="申请人"
        align="center"
        prop="createdBy"
        width="130"
      />
      <el-table-column
        label="项目负责人"
        align="center"
        prop="dutyPersonName"
        width="130"
      />
      <el-table-column
        label="投资(万元)"
        align="center"
        prop="investMoney"
      />
      <el-table-column
        label="状态"
        align="center"
        prop="status"
      >
        <template slot-scope="scope">
          <span>{{ setChangeStatus(scope.row.changeStatus) }}</span>
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
            @click="changeFn('view', scope.row)"
          >
            查看
          </el-button>
          <el-button
            v-if="scope.row.changeStatus == 1"
            type="text"
            size="mini"
            style="color: var(--ky-warning)"
            @click="changeFn('checkAccept', scope.row)"
          >
            验收
          </el-button>
          <el-button
            type="text"
            size="mini"
            style="color: var(--ky-danger)"
            @click="delList(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      slot="page"
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
        class="large-dialog"
        title="作业详情"
        :visible.sync="showInfoDialog"
        append-to-body
        :close-on-click-modal="false"
      >
        <BookInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </KyTreeTable>
</template>

<style lang="scss" scoped></style>
