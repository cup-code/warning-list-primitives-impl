<script>
import ImageSelect from '@/components/ImageSelect'
import {
  delSafeSign,
  getSafeSignList,
  saveSafeSign,
} from '@/http/defense/safeSign-api'

export default {
  components: {
    ImageSelect,
  },
  data() {
    return {
      allDic: [], // 字典信息
      // 搜索安全标志
      searchData: {
        pageNum: 1,
        pageSize: 10,
        fuzzyQuery: '',
        signType: '',
      },
      total: 0,
      tableData: [], // 表格数据
      loadingTable: false, // 表格loading
      loadingDialog: false, // 弹窗loading
      editForm: {}, // 编辑表格单行数据
      signUrlBack: '', // 回显图片地址
      showEditDialog: false, // 是否显示编辑弹窗
    }
  },
  created() {
    this.searchClick()
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.getPrefix()
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
      getSafeSignList(this.searchData)
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
          this.$message.warning('请求搜索安全标志失败', err)
        })
        .finally(() => {
          this.loadingTable = false
        })
    },
    /* 点击新增 */
    addClick() {
      this.signUrlBack = ''
      this.editForm = {}
      this.showEditDialog = true
    },
    /* 点击编辑行 */
    editClick(data) {
      // 放入数据
      this.editForm = data
      this.signUrlBack = this.filePrefix + data.signUrl
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
          delSafeSign(item.row.id)
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
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          // 提交内容代码
          this.loadingDialog = true
          saveSafeSign(this.editForm)
            .then((res) => {
              if (res.data.success) {
                this.showEditDialog = false
                this.searchClick()
              }
              else {
                this.$message.warning(res.data.message || '提交失败')
              }
            })
            .catch((err) => {
              this.$message.error('提交出错', err)
            })
            .finally(() => {
              this.loadingDialog = false
            })
        }
      })
    },
    fileChangeEvt(file) {
      this.editForm.file = file
    },
  },
}
</script>

<template>
  <!-- 安全标志 -->
  <KyTreeTable ref="treeTable" :isShowLeft="false">
    <!-- 搜索栏 -->
    <ECard slot="search" noneBottom>
      <el-form inline>
        <el-form-item label="关键字">
          <el-input v-model="searchData.fuzzyQuery" placeholder="名称" />
        </el-form-item>
        <el-form-item label="标志分类">
          <el-select
            v-model="searchData.signType"
            placeholder="全部"
            clearable
          >
            <el-option
              v-for="item in allDic.sign_type"
              :key="item.id"
              :label="item.dictName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="queryClick"
          >
            查询
          </el-button>
          <el-button
            type="primary"
            icon="el-icon-plus"
            @click="addClick"
          >
            新增
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>
    <!-- 表格 -->
    <ECard slot="table">
      <el-table
        height="100%"
        :data="tableData"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column
          label="序号"
          type="index"
          align="center"
          width="50px"
        />
        <el-table-column
          label="标志名称"
          prop="signName"
          align="center"
        />
        <el-table-column label="标志分类" align="center">
          <template slot-scope="scope">
            <span>{{
              $dictUtils.getDictLabelById("sign_type", scope.row.signType, "--")
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="图片"
          prop="signUrl"
          align="center"
        >
          <template slot-scope="scope">
            <el-image
              v-if="scope.row.signUrl"
              :src="filePrefix + scope.row.signUrl"
              style="width: 100px; height: 100px"
            />
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="150"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="mini"
              @click="editClick(scope.row)"
            >
              编辑
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
    </ECard>
    <!-- 分页器 -->
    <el-pagination
      slot="page"
      background
      :page-sizes="[10, 20, 50]"
      :current-page.sync="searchData.pageNum"
      :page-size.sync="searchData.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="searchClick"
      @current-change="searchClick"
    />
    <!-- 弹窗 -->
    <div slot="dialog">
      <el-dialog
        class="normal-dialog"
        title="编辑"
        :visible.sync="showEditDialog"
        destroy-on-close
        :modal-append-to-body="false"
        :close-on-click-modal="false"
      >
        <div v-if="showEditDialog" style="margin: 20px 50px 20px 0">
          <el-form
            ref="ruleForm"
            v-loading="loadingDialog"
            :model="editForm"
            label-width="120px"
          >
            <el-form-item
              label="标志分类"
              prop="signType"
              :rules="{
                required: true,
                message: '请选择标志分类',
                trigger: 'change',
              }"
            >
              <el-select
                v-model="editForm.signType"
                size="medium"
                placeholder="标志分类"
                clearable
              >
                <el-option
                  v-for="item in allDic.sign_type"
                  :key="item.id"
                  :label="item.dictName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              label="标志名称"
              prop="signName"
              :rules="{
                required: true,
                message: '请填写标志名称',
                trigger: 'blur',
              }"
            >
              <el-input v-model="editForm.signName" size="medium" />
            </el-form-item>
            <el-form-item label="图片">
              <ImageSelect :signUrl="signUrlBack" @fileChange="fileChangeEvt" />
            </el-form-item>
            <el-form-item
              label="设置范围及地点"
              prop="signScope"
              :rules="{
                required: true,
                message: '请填写范围或低点',
                trigger: 'blur',
              }"
            >
              <el-input
                v-model="editForm.signScope"
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
        </div>
      </el-dialog>
    </div>
  </KyTreeTable>
</template>
