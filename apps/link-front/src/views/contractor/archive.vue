<script>
import { archiveQuery } from '@/http/contractor-api'
import AllDepartmentTree from '@/views/common-ui/AllDepartmentTree.vue'

export default {
  components: {
    AllDepartmentTree,
  },
  data() {
    return {
      form: {
        pageNum: 1,
        pageSize: 10,
        showMore: false,
      },
      loading: false,
      data: [],
      total: 0,
      daStaList: [
        { dictCode: 0, dictName: '失效' },
        { dictCode: 1, dictName: '有效' },
        { dictCode: 2, dictName: '即将失效' },
        { dictCode: 3, dictName: '到期未审' },
        { dictCode: 4, dictName: '即将复审' },
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
      const { data } = await archiveQuery(this.form)
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
        this.form.competentDepartmentId = data.id
      }
      else {
        delete this.form.competentDepartmentId
      }
      this.getDataList()
    },
    toggleMore() {
      this.form.showMore = !this.form.showMore
    },
    // 确定档案状态回显
    findDa(code) {
      if (!code && code !== 0)
        return
      const tar = this.daStaList.find(item => item.dictCode == code)
      return tar.dictName
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
  <div class="archive-contractor">
    <div
      class="leftCon"
      :style="`width: ${treeWidth}`"
    >
      <AllDepartmentTree
        slot="tree"
        ref="companyTree"
        :hasResponsible="false"
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
        label-width="72px"
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
                placeholder="承包商名称/档案名称"
              />
            </el-form-item>
          </el-col>
          <el-col
            :span="6"
            style="padding-left: 10px"
          >
            <el-form-item label="承包商类型">
              <el-select
                v-model="form.contractorType"
                placeholder="承包商类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('contractor_type')"
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
            <el-form-item label="档案类型">
              <el-select
                v-model="form.archivesType"
                placeholder="档案类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('archive_type')"
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
          >
            <el-form-item label="档案状态">
              <el-select
                v-model="form.archivesStatus"
                placeholder="档案状态"
                style="width: 100%"
              >
                <el-option
                  v-for="item in daStaList"
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
            label="承包商名称"
            prop="contractorName"
            align="center"
            width="90"
          />
          <!-- <el-table-column label="所属部门" prop="belongDepartmentName" align='center' /> -->
          <el-table-column
            label="主管部门"
            prop="competentDepartmentName"
            align="center"
          />
          <el-table-column
            label="承包商类型"
            prop="contractorType"
            align="center"
            width="90"
          >
            <template slot-scope="scope">
              <span>{{
                $dictUtils.getDictLabel('contractor_type', scope.row.contractorType)
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="档案类型"
            prop="archivesType"
            align="center"
          >
            <template slot-scope="scope">
              <span>{{ $dictUtils.getDictLabel('archive_type', scope.row.archivesType) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="档案名称"
            prop="archivesName"
            align="center"
          />
          <el-table-column
            label="档案编号"
            prop="archivesCode"
            align="center"
          />
          <el-table-column
            label="有效时间"
            prop="h"
            align="center"
            width="300"
          >
            <template slot-scope="scope">
              <span>{{ `${scope.row.archivesStartTime} 至 ${scope.row.archivesEndTime}` }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="档案状态"
            prop="archivesStatus"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag
                size="mini"
                :type="
                  scope.row.archivesStatus == 0
                    ? 'danger'
                    : scope.row.archivesStatus == 1
                      ? 'success'
                      : 'warning'
                "
              >
                {{ findDa(scope.row.archivesStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="附件"
            prop="fileName"
            align="center"
            width="150"
          />
          <el-table-column
            label="添加时间"
            prop="createdTime"
            align="center"
            width="150"
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
.archive-contractor {
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
    .leftTree {
      height: 100%;
    }
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
