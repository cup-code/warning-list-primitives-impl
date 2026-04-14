<!--
 * @Author: lide1202@hotmail.com
 * @Date: 2021-3-13 11:04:24
 * @Last Modified by:   lide1202@hotmail.com
 * @Last Modified time: 2021-3-13 11:04:24
 ! -->
<script>
import { reportPageList } from '@/http/anji-report/report'
import Share from '@/views/reportDesign/report/components/share'

export default {
  name: 'Login',
  components: { Share },
  data() {
    return {
      list: [],
      rules: {},
      totalCount: 0,
      totalPage: 0,
      params: {
        reportCode: '',
        reportName: '',
        reportType: 'report_excel',
        pageNumber: 1,
        pageSize: 8,
        order: 'DESC',
        sort: 'updated_time',
      },
      // 分享
      visibleForShareDialog: false,
      reportCodeForShareDialog: '',
      reportNameForShareDialog: '',
    }
  },
  mounted() {},
  created() {
    this.queryByPage()
  },
  methods: {
    // 查询
    search() {
      this.params.pageNumber = 1
      this.queryByPage()
    },
    // 重置
    reset(formName) {
      this.$refs[formName].resetFields()
      this.params.reportName = ''
      this.params.reportCode = ''
      this.params.pageNumber = 1
      this.queryByPage()
    },
    async queryByPage() {
      const res = await reportPageList(this.params)
      if (res.code != '200')
        return
      this.listLoading = true
      this.list = res.data.records
      this.list.forEach((value) => {
        value.reportNameCode = `${value.reportName}[${value.reportCode}]`
      })
      this.totalCount = res.data.total
      this.totalPage = res.data.pages
      this.listLoading = false
    },
    handleSizeChange(val) {
      this.params.pageSize = val
      this.queryByPage()
    },
    handleCurrentChange(val) {
      this.params.pageNumber = val
      this.queryByPage()
    },
    // 分享
    share(val) {
      // excel暂不支持
      this.$message.warning('暂不支持excel报表分享')
      return

      this.reportCodeForShareDialog = val.reportCode
      this.reportNameForShareDialog = val.reportName
      this.visibleForShareDialog = true
    },
  },
}
</script>

<template>
  <div class="main-layout">
    <el-form
      ref="form"
      :model="params"
      :rules="rules"
      label-width="120px"
    >
      <!-- 搜索 -->
      <el-row :gutter="10">
        <el-col
          :xs="24"
          :sm="20"
          :md="12"
          :lg="6"
          :xl="4"
        >
          <el-form-item label="名称">
            <el-input
              v-model="params.reportName"
              size="mini"
              clearable
              placeholder="名称"
              class="filter-item"
            />
          </el-form-item>
        </el-col>
        <el-col
          :xs="24"
          :sm="20"
          :md="12"
          :lg="6"
          :xl="4"
        >
          <el-form-item label="报表编码">
            <el-input
              v-model="params.reportCode"
              size="mini"
              clearable
              placeholder="报表编码"
              class="filter-item"
            />
          </el-form-item>
        </el-col>
        <el-col
          :xs="24"
          :sm="20"
          :md="4"
          :lg="4"
          :xl="4"
        >
          <el-button
            type="primary"
            size="mini"
            @click="search('form')"
          >
            查询
          </el-button>
          <el-button
            type="danger"
            size="mini"
            @click="reset('form')"
          >
            重置
          </el-button>
        </el-col>
      </el-row>
    </el-form>
    <el-row :gutter="20">
      <el-col
        v-for="item in list"
        :key="item.id"
        :span="6"
      >
        <div class="bg">
          <img
            class="bg-img"
            :src="
              item.reportImage == null || item.reportImage == ''
                ? require('../../../assets/anji/images/charts.jpg')
                : item.reportImage
            "
            alt=""
          >
          <div class="content">
            <header>{{ item.reportName }}</header>
            <footer>
              {{ item.updatedTime || item.createdTime }}
              <div class="operation">
                <el-button
                  icon="el-icon-share"
                  class="view"
                  type="text"
                  @click="share(item)"
                />

                <el-button
                  class="view"
                  type="text"
                >
                  <router-link
                    tag="a"
                    target="_blank"
                    :to="{
                      name: 'excelreportViewer',
                      query: { reportCode: item.reportCode },
                    }"
                  >
                    <i class="el-icon-view" />
                  </router-link>
                </el-button>

                <el-button
                  class="edit"
                  type="text"
                >
                  <router-link
                    tag="a"
                    target="_blank"
                    :to="{
                      name: 'excelreportDesigner',
                      query: { reportCode: item.reportCode },
                    }"
                  >
                    <i class="el-icon-edit" />
                  </router-link>
                </el-button>
              </div>
            </footer>
          </div>
        </div>
      </el-col>
    </el-row>
    <div class="block">
      <el-pagination
        :total="totalCount"
        :page-sizes="[8, 20, 50, 100]"
        :page-size="params.pageSize"
        :current-page="params.pageNumber"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <Share
      :visib="visibleForShareDialog"
      :reportCode="reportCodeForShareDialog"
      :reportName="reportNameForShareDialog"
      @handleClose="visibleForShareDialog = false"
    />
  </div>
</template>

<style scoped lang="scss">
.main-layout {
  padding: 20px;
  position: relative;
  height: auto;
  background: #fff;
  header {
    font-size: 24px;
    text-align: center;
    line-height: 80px;
  }
  .bg {
    width: 100%;
    height: 200px;
    position: relative;
    overflow: hidden;
    margin: 10px 0;
    border: 12px solid white;
  }

  .bg .bg-img {
    position: absolute;
    width: 100%;
    height: 100%;
    filter: blur(6px);
    z-index: 2;
  }
  .content {
    width: 100%;
    height: 100%;
    position: absolute;
    color: #fff;
    left: 0;
    top: 0;
    z-index: 3;
  }
  footer {
    width: 100%;
    font-size: 14px;
    padding: 16px;
    line-height: 30px;
    position: absolute;
    z-index: 3;
    bottom: 0;
    .operation {
      float: right;
      .view,
      .edit {
        color: #fff;
        font-size: 14px;
      }
    }
  }
}
</style>
