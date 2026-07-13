/* * @Author: yangjie 应急物资页面 * @Date: 2023-03-14 14:55:13 */
<script>
import { deleteGoods, queryGoods } from '@/http/contingency/contingencyGoods.js' // 应急物资接口路径
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import ContingencyGoodsCheck from './dialog/contingencyGoodsCheck'
import ContingencyGoodsDetail from './dialog/contingencyGoodsDetail'

export default {
  components: {
    OwnDeparmentTree,
    ContingencyGoodsDetail,
    ContingencyGoodsCheck,
  },
  data: () => ({
    loading: false,
    tableData: [],
    total: 0,
    sForm: {
      pageNum: 1,
      pageSize: 10,
      departmentId: '',
      category: '', // 物品类别
      keyWords: '', // 关键字
    },
  }),
  created() {
    this.getDataList()
  },
  methods: {
    // 点击部门树的item
    treeNodeTap(v) {
      // 记录部门id
      if (v.onlyTreeUse)
        return
      this.sForm.pageNum = 1
      this.sForm.departmentId = v.id
      this.getDataList()
    },
    getDataList() {
      // 查询记录
      this.loading = true
      queryGoods(this.sForm)
        .then((data) => {
          if (data.success) {
            this.tableData = data.result.list || []
            this.total = data.result.total
          }
          else {
            this.$message.warning(data.message || '查询失败')
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 弹框回调
    searchFn() {
      this.sForm.pageNum = 1
      this.getDataList()
    },
    // 检查、查看、修改、新增
    toDetailClick(row, method) {
      if (method == 'check' || method == 'view') {
        this.$refs.ContingencyTeamCheck.init(row, method)
      }
      else {
        this.$refs.ContingencyTeamDetail.init(row, method)
      }
    },

    // 重置表单数据
    resetEvent() {
      Object.assign(this.sForm, {
        pageNum: 1,
        pageSize: 10,
        departmentId: '',
        category: '', // 物品类别
        keyWords: '', // 关键字
      })
      this.getDataList()
    },
    // 删除数据
    delFn(row) {
      this.$confirm('您确认要删除数据么', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          return deleteGoods(row.id)
        })
        .then((res) => {
          if (res.code == 200) {
            this.getDataList()
            this.$message.success(res.message || '删除成功')
          }
          else {
            this.$message.error(res.message || '删除失败!')
          }
        })
        .catch(() => {})
    },
  },
}
</script>

<template>
  <KyTreeTable ref="treeTable">
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />

    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <!-- 表单 -->
      <el-form
        ref="sForm"
        :inline="true"
        :model="sForm"
        size="mini"
        class="sForm"
        @submit.native.prevent
      >
        <el-form-item
          prop="category"
          label="物资分类"
        >
          <el-select
            v-model="sForm.category"
            clearable
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in $dictUtils.getDictList('em_supply_type')"
              :key="item.id"
              :label="item.dictName"
              :value="item.dictCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          prop="keyWords"
          label="关键字"
        >
          <el-input
            v-model="sForm.keyWords"
            placeholder="关键字"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            :loading="loading"
            @click="searchFn"
          >
            查询
          </el-button>
          <el-button
            class="reset"
            icon="el-icon-refresh-left"
            :loading="loading"
            @click="resetEvent"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <ECard slot="table">
      <div class="card-cell">
        <EButton
          v-if="hasBtnPermission('contingency_goods_add')"
          type="primary"
          size="mini"
          btnIcon="el-icon-plus"
          plain
          @click="toDetailClick(null, 'add')"
        >
          新增
        </EButton>
      </div>
      <!-- 表格 -->
      <el-table
        ref="table"
        v-loading="loading"
        :data="tableData"
        size="mini"
        height="90%"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        :border="false"
        class="customer-table"
      >
        <el-table-column
          label="序号"
          type="index"
          width="50"
        />
        <el-table-column
          label="物资分类"
          prop="category"
          align="center"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel('em_supply_type', scope.row.category) }}
          </template>
        </el-table-column>
        <el-table-column
          label="品名及单位"
          prop="unit"
          align="center"
        />
        <el-table-column
          label="数量"
          prop="number"
          align="center"
        />
        <el-table-column
          label="存放地点"
          prop="place"
          align="center"
        />
        <el-table-column
          label="负责人"
          prop="person"
          align="center"
        />
        <el-table-column
          label="负责人电话"
          prop="phone"
          align="center"
        />
        <el-table-column
          label="最近检查时间"
          prop="lastCheckDate"
          align="center"
        />
        <el-table-column
          label="操作"
          min-width="140"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              v-if="hasBtnPermission('contingency_goods_check')"
              type="text"
              @click="toDetailClick(scope.row, 'check')"
            >
              检查
            </el-button>
            <el-button
              v-if="hasBtnPermission('contingency_goods_view')"
              type="text"
              @click="toDetailClick(scope.row, 'view')"
            >
              查看
            </el-button>
            <el-button
              v-if="hasBtnPermission('contingency_goods_modify')"
              type="text"
              @click="toDetailClick(scope.row, 'edit')"
            >
              修改
            </el-button>
            <el-button
              v-if="hasBtnPermission('contingency_goods_delete')"
              type="text"
              style="color: var(--ky-danger)"
              size="mini"
              @click="delFn(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        :current-page.sync="sForm.pageNum"
        :page-sizes="[10, 20, 50]"
        background
        :page-size.sync="sForm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getDataList"
        @current-change="getDataList"
      />
    </ECard>

    <!-- 新增、编辑、查看弹框 -->
    <contingency-goods-detail
      slot="dialog"
      ref="ContingencyTeamDetail"
      @refreshList="searchFn"
    />
    <!-- 检查、查看检查记录 -->
    <contingency-goods-check
      slot="dialog"
      ref="ContingencyTeamCheck"
      @refreshList="searchFn"
    />
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.sForm ::v-deep {
  .el-form-item--mini {
    margin-bottom: 18px;
  }
}
</style>
