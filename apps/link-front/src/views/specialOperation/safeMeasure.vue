<script>
import { getSafeMeasureByPage, safeMeasureDel } from '@/http/specialOperation/safeControl-api.js'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import SafeMeasureInfo from './components/safeMeasureInfo.vue'

export default {
  components: {
    CompanyTree,
    SafeMeasureInfo,
  },
  data() {
    return {
      isLoading: false, // 加载
      searchData: {
        // 传递的页码数
        pageNum: 1,
        pageSize: 20,
      },
      allDic: {}, // 字典数据
      propData: {}, // 弹窗绑定数据
      tableData: [], // 表格数据
      total: 0, // 表格数据总数
      showInfoDialog: false, // 是否显示编辑弹窗
      dialogTitle: '', // 弹窗标题
    }
  },
  computed: {
    setWorkType() {
      return function (number) {
        let text = ''
        switch (Number.parseInt(number)) {
          case 1001:
            text = '动火作业'
            break
          case 1002:
            text = '有限空间作业'
            break
          case 1003:
            text = '高空作业'
            break
          case 1004:
            text = '临时用电作业'
            break
          case 1005:
            text = '断路作业'
            break
          case 1006:
            text = '动土作业'
            break
          case 1007:
            text = '吊装作业'
            break
          case 1008:
            text = '盲板抽堵作业'
            break
          case 1009:
            text = '通用作业'
            break
        }
        return text
      }
    },
  },
  created() {
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    console.log('作业票code===', this.allDic)
    // 传一个true过去是为了searchclick只调用一次
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
      this.$refs.companyTree.refreshTree()
    },
    /* 点击搜索 */ // isReqParams是接收传过来的值
    searchClick() {
      this.isLoading = true
      getSafeMeasureByPage(this.searchData)
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
    /* 点击新增 */
    addClick() {
      const companyData = this.$refs.companyTree.getTreeData()
      this.dialogTitle = '新增修改安全措施'
      this.propData = {
        editable: true,
        companyData,
      }
      this.showInfoDialog = true
    },
    // 点击查看修改
    editClick(info, editable) {
      const companyData = this.$refs.companyTree.getTreeData()
      if (editable) {
        this.dialogTitle = '修改安全措施'
      }
      else {
        this.dialogTitle = '查看安全措施'
      }
      this.propData = {
        info: JSON.parse(JSON.stringify(info)),
        companyData,
        editable,
      }
      // 给修改设置属性，在查看中传参false，让查看不能修改
      this.showInfoDialog = true
    },
    /* 点击删除 */
    delClick(item) {
      this.$confirm(`您确定要删除第${item.$index + 1}条信息吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          safeMeasureDel(item.row.id)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('删除成功！')
                this.searchClick()
              }
              else {
                this.$message.warning(res.data.message || '删除失败')
              }
            })
            .finally(() => {
              this.isLoading = false
            })
        })
        .catch(() => {})
    },
    /* 关闭弹窗事件 */
    closeDialogEvt(isRefresh) {
      this.showInfoDialog = false
      if (isRefresh) {
        this.searchClick()
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
      <el-form-item label="作业类型">
        <el-select
          v-model="searchData.jobTypeCode"
          placeholder="作业类型"
          clearable
        >
          <el-option
            v-for="item in allDic.specialWork_workType"
            :key="item.id"
            :label="item.dictName"
            :value="item.dictCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="适用场所">
        <el-input
          v-model="searchData.applySite"
          placeholder="适用场所"
        />
      </el-form-item>
      <el-form-item label="措施内容">
        <el-input
          v-model="searchData.measureContent"
          placeholder="措施内容"
        />
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
          type="primary"
          size="mini"
          icon="el-icon-refresh-right"
          @click="refreshClick"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>
    <div
      slot="auxiliary"
      class="auxiliary-button"
    >
      <el-button
        type="primary"
        size="mini"
        icon="el-icon-plus"
        @click="addClick"
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
        label="类别"
        align="center"
        prop="type"
      />
      <el-table-column
        label="作业类型"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ setWorkType(scope.row.jobTypeCode) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="适用场所"
        align="center"
        prop="applySite"
      />
      <el-table-column
        label="措施内容"
        align="center"
        prop="measureContent"
      />
      <el-table-column
        label="备注"
        align="center"
        prop="remarks"
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
            @click="editClick(scope.row, false)"
          >
            查看
          </el-button>
          <el-button
            type="text"
            size="mini"
            style="color: var(--ky-warning)"
            @click="editClick(scope.row, true)"
          >
            修改
          </el-button>
          <el-button
            type="text"
            size="mini"
            style="color: var(--ky-danger)"
            @click="delClick(scope)"
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
      @current-change="searchClick"
      @size-change="searchClick"
    />
    <!-- 弹窗 -->
    <div slot="dialog">
      <el-dialog
        class="normal-dialog"
        :title="dialogTitle"
        :visible.sync="showInfoDialog"
        width="850px"
        append-to-body
        :close-on-click-modal="false"
        top="5vh"
      >
        <SafeMeasureInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </TreeTable>
</template>

<style scoped>
.auxiliary-button {
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
