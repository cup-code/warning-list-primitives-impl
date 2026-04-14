<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import { getExecuteListByPageFn } from '@/http/rewardAssessment/reward'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import ThreeViolation from '@/views/rewardAssessment/threeViolation/dialog/detailForm'
import ContractorTree from './coms/ContractorTree.vue'

export default {
  components: {
    ContractorTree,
    TreeSelect,
    ThreeViolation,
  },
  data() {
    return {
      form: {
        pageNum: 1,
        pageSize: 10,
        contractorExamine: true, // 固定写死true，只查询承包商
        showMore: false,
      },
      loading: false,
      data: [],
      total: 0,
      staList: [
        { dictName: '待考核', dictCode: 1 },
        { dictName: '拒绝考核', dictCode: 2 },
        { dictName: '同意考核', dictCode: 3 },
      ],
      departList: [],
      hideLeft: false,
      treeWidth: '240px',
      conWidth: 'calc(100% - 240px)',
    }
  },
  async created() {
    this.getDataList()
    const departRes = await getDepartListSimple() // 获取当前用户所拥有的部门
    this.departList = departRes.data.result || []
  },
  methods: {
    async getDataList() {
      const { data } = await getExecuteListByPageFn(this.form)
      this.loading = false
      if (data.code == 200) {
        this.data = data.result.list || []
        this.total = data.result.total
      }
      else {
        this.$message.error(data.message || '查询失败')
        this.data = []
        this.total = 0
      }
    },
    // 重置
    resetFn() {
      this.form = {
        pageNum: 1,
        pageSize: 10,
        contractorExamine: true, // 固定写死true，只查询承包商
        showMore: false,
      }
      this.$refs.contrTree.clearSel()
      this.getDataList()
    },
    pageSizeFn(v) {
      this.form.pageNum = 1
      this.form.pageSize = v
      this.getDataList()
    },
    pageCurFn(v) {
      this.form.pageNum = v
      this.getDataList()
    },
    treeNodeTap(data) {
      if (data) {
        this.form.examineDepartmentId = data.id
      }
      else {
        delete this.form.examineDepartmentId
      }
      this.getDataList()
    },
    toggleMore() {
      this.form.showMore = !this.form.showMore
    },
    // 查看
    clickFn(method, id) {
      this.$refs.threeViolation.init(method, id)
    },
    // 切换左侧菜单的收起与展现
    toggleLeftFn() {
      this.hideLeft = !this.hideLeft
      if (this.hideLeft) {
        this.treeWidth = '0%'
        this.conWidth = '100%'
      }
      else {
        this.treeWidth = '240px'
        this.conWidth = 'calc(100% - 240px)'
      }
    },
  },
}
</script>

<template>
  <div class="three-contractor">
    <div
      class="leftCon"
      :style="`width: ${treeWidth}`"
    >
      <ContractorTree
        ref="contrTree"
        @treeNodeTap="treeNodeTap"
      />
      <div
        class="toggle-btn"
        @click="toggleLeftFn"
      >
        {{ hideLeft ? '展开' : '隐藏' }}
      </div>
    </div>
    <div
      class="rightCon"
      :style="`width: ${conWidth}`"
    >
      <!-- 查询条件 -->
      <el-form
        :model="form"
        label-width="60px"
        class="searchForm"
      >
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="关键词"
              label-width="50px"
            >
              <el-input
                v-model="form.examineUserName"
                placeholder="被考核人员"
              />
            </el-form-item>
          </el-col>
          <el-col
            :span="8"
            style="padding-left: 10px"
          >
            <el-form-item label="考核类型">
              <el-select
                v-model="form.assessType"
                placeholder="考核类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('assess_type')"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="8"
            style="padding-left: 10px"
          >
            <el-form-item label="考核类别">
              <el-select
                v-model="form.assessCategory"
                placeholder="考核类别"
                style="width: 100%"
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('assess_category')"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="8"
          >
            <el-form-item
              label="考核执行部门"
              label-width="90px"
            >
              <TreeSelect
                ref="treeSelect"
                style="width: 100%"
                :list="departList"
                :props="{
                  value: 'id',
                  label: 'departmentName',
                  children: 'children',
                }"
                :value="form.departmentId"
                @getValue="
                  value => {
                    form.departmentId = value
                  }
                "
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="8"
            style="padding-left: 10px"
          >
            <el-form-item label="考核级别">
              <el-select
                v-model="form.assessLevel"
                placeholder="考核级别"
                style="width: 100%"
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('assess_level')"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="8"
            style="padding-left: 10px"
          >
            <el-form-item
              label="考核执行部门意见"
              label-width="110px"
            >
              <el-select
                v-model="form.assessStatus"
                placeholder="考核执行部门意见"
                style="width: 100%"
              >
                <el-option
                  v-for="item in staList"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 按钮 -->
          <el-col
            :span="8"
            style="padding-left: 10px; margin-bottom: 12px"
          >
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="getDataList"
            >
              查询
            </el-button>
            <el-button
              icon="el-icon-refresh-right"
              @click="resetFn"
            >
              重置
            </el-button>
            <el-button
              type="text"
              style="margin-left: 8px"
              @click="toggleMore"
            >
              {{ form.showMore == true ? '收起' : '高级筛选' }}
              <i :class="form.showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
            </el-button>
          </el-col>
        </el-row>
      </el-form>

      <div class="main-box">
        <!-- 表格 -->
        <el-table
          v-loading="loading"
          :data="data"
          style="width: 100%"
          size="mini"
          :header-cell-style="{ background: '#f5f5f5' }"
          height="100%"
          :border="true"
          class="customer-table"
        >
          <el-table-column
            label="序号"
            type="index"
            align="center"
          />
          <el-table-column
            label="日期"
            prop="assessDate"
            align="center"
          />
          <el-table-column
            label="发起人"
            prop="initiatorUserName"
            align="center"
          />
          <el-table-column
            label="发起人部门"
            prop="initiatorDepName"
            align="center"
          />
          <el-table-column
            label="考核类型"
            prop="assessType"
            align="center"
          >
            <template slot-scope="scope">
              {{ $dictUtils.getDictLabel('assess_type', scope.row.assessType) }}
            </template>
          </el-table-column>
          <el-table-column
            label="考核类别"
            prop="assessCategory"
            align="center"
          >
            <template slot-scope="scope">
              {{ $dictUtils.getDictLabel('assess_category', scope.row.assessCategory) }}
            </template>
          </el-table-column>
          <el-table-column
            label="被考核承包商"
            prop="examineDepartmentName"
            align="center"
            width="100"
          />
          <el-table-column
            label="被考核人姓名"
            prop="examineUserName"
            align="center"
            width="100"
          />
          <el-table-column
            label="考核级别"
            prop="assessLevel"
            align="center"
          >
            <template slot-scope="scope">
              {{ $dictUtils.getDictLabel('assess_level', scope.row.assessLevel) }}
            </template>
          </el-table-column>
          <el-table-column
            label="考核金额"
            prop="assessTotalAmount"
            align="center"
          />
          <el-table-column
            label="事实描述"
            prop="factDes"
            align="center"
          />
          <el-table-column
            label="考核执行部门"
            prop="executeDepartmentName"
            align="center"
            width="100"
          />
          <el-table-column
            label="考核执行部门意见"
            prop="assessStatus"
            align="center"
            width="120"
          >
            <template slot-scope="scope">
              {{
                scope.row.assessStatus == 1
                  ? '待考核'
                  : scope.row.assessStatus == 2
                    ? '拒绝考核'
                    : scope.row.assessStatus == 3
                      ? '同意考核'
                      : ''
              }}
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            fixed="right"
            label="操作"
            width="120"
          >
            <template slot-scope="scope">
              <el-button
                v-if="hasBtnPermission('contractor_three_view')"
                type="text"
                @click="clickFn('view', scope.row.id)"
              >
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
          :current-page.sync="form.pageNum"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="form.pageSize"
          layout="total, prev, pager, next, jumper, sizes"
          :total="total"
          @size-change="pageSizeFn"
          @current-change="pageCurFn"
        />
      </div>
    </div>

    <three-violation
      ref="threeViolation"
      @refreshDataList="getDataList"
    />
  </div>
</template>

<style lang="scss" scoped>
.three-contractor {
  height: calc(100vh - 50px);
  background: #f3f7f9;
  display: flex;
  position: relative;
  .leftCon {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    padding: 10px;
    padding-right: 0px;
    .leftTree .el-card {
      display: flex;
      flex-direction: column;
    }
    .toggle-btn {
      z-index: 1;
      position: absolute;
      top: 50%;
      left: 100%;
      cursor: pointer;
      user-select: none;
      background: rgba($color: #000000, $alpha: 0.1);
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      padding: 5px;
    }
  }
  .rightCon {
    position: absolute;
    top: 0;
    right: 0;
    flex: 1;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 10px;
    .searchForm {
      margin-bottom: 10px;
      padding: 18px 8px 0 10px;
      background: #fff;
    }
    .main-box {
      background: #fff;
      flex: 1;
      overflow: hidden;
      padding: 10px;
      display: flex;
      flex-direction: column;

      .el-table {
        flex: 1;
        margin: 10px 0;
        .el-button + .el-button {
          margin-left: 5px;
        }
      }
      .el-pagination {
        text-align: right;
        padding: 0;
        .el-pagination__sizes {
          margin-right: 0;
          .el-input {
            margin-right: 0;
          }
        }
      }
    }
  }
}
</style>
