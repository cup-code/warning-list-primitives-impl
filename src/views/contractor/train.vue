<script>
import { getContractorEdu } from '@/http/contractor-api'
import ContractorTree from './coms/ContractorTree.vue'

export default {
  components: {
    ContractorTree,
  },
  data() {
    return {
      form: {
        pageNum: 1,
        pageSize: 10,
        studyType: 1, // 1. 在线培训； 2. 在校考试
        showMore: false,
      },
      loading: false,
      data: [],
      total: 0,
      conTypeList: [
        { dictCode: '课件', dictName: '课件' },
        { dictCode: '课程', dictName: '课程' },
        { dictCode: '试题', dictName: '试题' },
        { dictCode: '试卷', dictName: '试卷' },
      ],
      hideLeft: false,
      treeWidth: '240px',
      conWidth: 'calc(100% - 240px)',
    }
  },
  created() {
    this.getDataList()
  },
  methods: {
    async getDataList() {
      const { data } = await getContractorEdu(this.form)
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
        studyType: 1,
        showMore: false,
      }
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
        this.form.departmentId = data.id
      }
      else {
        delete this.form.departmentId
      }
      this.getDataList()
    },
    toggleMore() {
      this.form.showMore = !this.form.showMore
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
  <div class="train-contractor">
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
          <el-col :span="6">
            <el-form-item
              label="关键词"
              label-width="50px"
            >
              <el-input
                v-model="form.keywords"
                placeholder="培训任务名称/任务来源名称/关联考试任务名称/所属承包商/姓名"
              />
            </el-form-item>
          </el-col>
          <el-col
            :span="6"
            style="padding-left: 10px"
          >
            <el-form-item
              label="任务来源分类"
              label-width="90px"
            >
              <el-select
                v-model="form.sourceType"
                placeholder="任务来源分类"
                style="width: 100%"
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('rwlyfl')"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="6"
            style="padding-left: 10px"
          >
            <el-form-item label="内容分类">
              <el-select
                v-model="form.contentType"
                placeholder="内容分类"
                style="width: 100%"
              >
                <el-option
                  v-for="item in conTypeList"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="6"
            style="padding-left: 10px"
          >
            <el-form-item label="培训状态">
              <el-select
                v-model="form.trainStatus"
                placeholder="培训状态"
                style="width: 100%"
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('xxzt')"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="6"
            style="padding-left: 10px"
          >
            <el-form-item label="考试结果">
              <el-select
                v-model="form.examResult"
                placeholder="考试结果"
                style="width: 100%"
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('ksjg')"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 按钮 -->
          <el-col
            :span="12"
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
            label="所属承包商"
            prop="contractorName"
            align="center"
            width="90"
          />
          <el-table-column
            label="姓名"
            prop="username"
            align="center"
          />
          <el-table-column
            label="任务来源分类"
            prop="sourceType"
            align="center"
            width="95"
          />
          <el-table-column
            label="任务来源名称"
            prop="sourceName"
            align="center"
            width="95"
          />
          <el-table-column
            label="内容类型"
            prop="contentType"
            align="center"
          />
          <el-table-column
            label="培训任务名称"
            prop="contentName"
            align="center"
            width="95"
          />
          <el-table-column
            label="关联考试任务名称"
            prop="examTaskName"
            align="center"
            width="120"
          />
          <el-table-column
            label="计划时间"
            align="center"
          >
            <template slot-scope="scope">
              {{ `${scope.row.taskStartTime} 至 ${scope.row.taskEndTime}` }}
            </template>
          </el-table-column>
          <el-table-column
            label="培训状态"
            prop="trainStatus"
            align="center"
          />
          <el-table-column
            label="计划时长(分)"
            prop="needLearnDuration"
            align="center"
          />
          <el-table-column
            label="已学习(分)"
            prop="passLearnDuration"
            align="center"
            width="100"
          />
          <el-table-column
            label="满分"
            prop="totalScore"
            align="center"
          />
          <el-table-column
            label="及格分"
            prop="passScore"
            align="center"
          />
          <el-table-column
            label="得分"
            prop="userScore"
            align="center"
          />
          <el-table-column
            label="考试结果"
            prop="examResult"
            align="center"
          />
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
  </div>
</template>

<style lang="scss" scoped>
.train-contractor {
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
