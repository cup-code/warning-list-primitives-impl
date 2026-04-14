<script>
import { getSafeCheckTableByPage } from '@/http/defense/shandong/safeCheck-api'

export default {
  data() {
    return {
      isLoading: false,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        fuzzyQuery: '',
      },
      total: 0,
      tableData: [],
      curPick: '', // 选中的表id
    }
  },
  created() {
    this.searchClick()
  },
  methods: {
    /* 查询表格数据 */
    searchClick() {
      getSafeCheckTableByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.total = res.data.result.total
            this.tableData = res.data.result.list
          }
          else {
            this.$message.warning(res.data.message || '请求表格数据失败')
          }
        })
        .catch((err) => {
          this.$message.warning('请求表格数据出错：', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    queryClick() {
      this.searchData.pageNum = 1
      this.searchClick()
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', null)
    },
    /* 点击保存 */
    submitClick() {
      this.$emit('close', this.curPick)
    },
  },
}
</script>

<template>
  <div class="pick-bg">
    <div class="dialog-info">
      <!-- 搜索栏 -->
      <el-form
        inline
        label-width="80"
      >
        <el-form-item label="关键字">
          <el-input
            v-model="searchData.fuzzyQuery"
            placeholder="检查表名称"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="queryClick"
          >
            查询
          </el-button>
        </el-form-item>
      </el-form>
      <!-- 表格 -->
      <el-table
        :data="tableData"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column
          label=""
          align="center"
          width="50"
        >
          <template slot-scope="scope">
            <el-radio
              v-model="curPick"
              :label="scope.row"
            >
              {{ '' }}
            </el-radio>
          </template>
        </el-table-column>
        <el-table-column
          type="index"
          width="50"
          align="center"
          label="序号"
        />
        <el-table-column
          label="检查表名称"
          align="center"
          prop="checkScheduleName"
        />
        <el-table-column
          label="检查表类型"
          align="center"
          prop="checkScheduleType"
        />
        <el-table-column
          label="责任组织"
          align="center"
          prop="responsibilityDepartmentName"
        />
        <el-table-column
          label="创建时间"
          align="center"
        >
          <template slot-scope="scope">
            {{ scope.row.createdTime }}
          </template>
        </el-table-column>
        <el-table-column
          label="创建人"
          align="center"
          prop="createdBy"
        />
      </el-table>
      <!-- 分页器 -->
      <el-pagination
        slot="page"
        style="margin: 0 20px 0 0; text-align: right"
        :current-page.sync="searchData.pageNum"
        :page-size.sync="searchData.pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, prev, pager, next, jumper, sizes"
        :total="total"
        @current-change="searchClick"
        @size-change="searchClick"
      />
    </div>
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 20px 0 0"
        @click="cancelClick"
      >
        取消
      </el-button>
      <el-button
        size="medium"
        type="primary"
        :disabled="curPick == ''"
        @click="submitClick"
      >
        确认保存
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pick-bg {
  height: 100%;
}
</style>
