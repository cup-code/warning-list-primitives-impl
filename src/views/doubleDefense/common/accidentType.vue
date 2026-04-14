<script>
import {
  delAccType,
  getAccTypeList,
  saveAccType,
} from '@/http/defense/accType-api'

export default {
  data() {
    return {
      // 搜索请求数据
      searchData: {
        fuzzyQuery: '',
        pageNum: 1,
        pageSize: 10,
      },
      total: 0, // 请求数据总数
      // 表格数据
      tableData: [],
      loadingTable: false, // 表格loading
      loadingDialog: false, // 弹窗loading
      // 表格单行数据
      editForm: {},
      showEditDialog: false, // 是否显示编辑弹窗
    }
  },
  created() {
    this.searchClick()
  },
  methods: {
    /* 点击搜索 */
    queryClick() {
      this.searchData.pageNum = 1
      this.searchClick()
    },
    /* 搜索事故类型 */
    searchClick() {
      this.loadingTable = true
      getAccTypeList(this.searchData)
        .then((res) => {
          if (res.data.code == 200) {
            this.tableData = res.data.result.list
            this.total = res.data.result.total
          }
          else {
            this.$message.warning(res.data.message)
          }
        })
        .catch((err) => {
          this.$message.warning('请求搜索事故类型失败', err)
        })
        .finally(() => {
          this.loadingTable = false
        })
    },
    /* 点击新增 */
    addClick() {
      this.editForm = { sort: 0 }
      this.showEditDialog = true
    },
    /* 点击编辑行 */
    editClick(data) {
      // 放入数据
      this.editForm = data
      this.showEditDialog = true
    },
    /* 点击删除行 */
    delClick(item) {
      this.$confirm(`您确定要删除第${item.$index + 1}条信息吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loadingTable = true
          delAccType(item.row.id)
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
              this.loadingTable = false
            })
        })
        .catch(() => {})
    },
    /* 点击提交编辑内容 */
    editSubmitClick() {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.loadingDialog = true
          // 提交内容代码
          saveAccType(this.editForm)
            .then((res) => {
              if (res.data.code == 200) {
                this.showEditDialog = false
                this.searchClick()
              }
              else {
                this.$message.warning(res.data.message)
              }
            })
            .catch((err) => {
              this.$message.warning(res.data.message || err)
            })
            .finally(() => {
              this.loadingDialog = false
            })
        }
      })
    },
  },
}
</script>

<template>
  <!-- 事故类型 -->
  <SearchTable>
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
    >
      <el-form-item label="关键字">
        <el-input
          v-model="searchData.fuzzyQuery"
          placeholder="事故类型名称"
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
          v-if="hasBtnPermission('accident_type_add')"
          type="primary"
          size="mini"
          icon="el-icon-plus"
          plain
          @click="addClick"
        >
          新增
        </el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table
      slot="table"
      v-loading="loadingTable"
      height="100%"
      :data="tableData"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      :border="true"
      class="customer-table"
    >
      <el-table-column
        label="事故类型编码"
        prop="accidentTypeCode"
        align="center"
        width="100"
      />
      <el-table-column
        label="事故类型名称"
        prop="accidentTypeName"
        align="center"
        width="150"
      />
      <el-table-column
        label="应急措施"
        align="left"
      >
        <template slot-scope="scope">
          <RichText :des="scope.row.emergencyMeasures" />
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="180"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            v-if="hasBtnPermission('accident_type_modify')"
            type="text"
            size="mini"
            @click="editClick(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            v-if="hasBtnPermission('accident_type_delete')"
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
      :current-page.sync="searchData.pageNum"
      :page-size.sync="searchData.pageSize"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="searchClick"
      @current-change="searchClick"
    />
    <!-- 弹窗 -->
    <div slot="dialog">
      <el-dialog
        class="normal-dialog"
        title="企业事故类型"
        :visible.sync="showEditDialog"
        width="80%"
        destroy-on-close
        :modal-append-to-body="false"
        :close-on-click-modal="false"
      >
        <el-form
          ref="editForm"
          v-loading="loadingDialog"
          :model="editForm"
          label-width="120px"
        >
          <el-form-item
            label="事故类型编码"
            prop="accidentTypeCode"
            :rules="{
              required: true,
              message: '请填写事故类型编码',
              trigger: 'blur',
            }"
          >
            <el-input
              v-model="editForm.accidentTypeCode"
              size="medium"
              type="number"
            />
          </el-form-item>
          <el-form-item
            label="事故类型名称"
            prop="accidentTypeName"
            :rules="{
              required: true,
              message: '请填写事故类型名称',
              trigger: 'blur',
            }"
          >
            <el-input
              v-model="editForm.accidentTypeName"
              size="medium"
            />
          </el-form-item>
          <el-form-item
            label="事故类型排序"
            prop="sort"
            :rules="{
              required: true,
              message: '请填写事故类型排序',
              trigger: 'blur',
            }"
          >
            <el-input
              v-model="editForm.sort"
              size="medium"
              type="number"
            />
          </el-form-item>
          <el-form-item
            label="应急处置措施"
            prop="emergencyMeasures"
            :rules="{
              required: true,
              message: '请填写应急处置措施',
              trigger: 'blur',
            }"
          >
            <el-input
              v-model="editForm.emergencyMeasures"
              size="medium"
              type="textarea"
              :rows="5"
            />
          </el-form-item>
        </el-form>
        <div class="dialog-footer">
          <el-button
            size="medium"
            :disabled="loadingDialog"
            @click="showEditDialog = false"
          >
            取 消
          </el-button>
          <el-button
            size="medium"
            type="primary"
            :disabled="loadingDialog"
            @click="editSubmitClick"
          >
            确 定
          </el-button>
        </div>
      </el-dialog>
    </div>
  </SearchTable>
</template>
