<script>
import {
  getCameraHazardByCompany,
  getCameraListByHazard,
  getHkAlarmList,
} from '@/http/hkAi-api'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import VideoWatchInfo from './components/VideoWatchInfo.vue'

export default {
  components: {
    CompanyTree,
    VideoWatchInfo,
  },
  data() {
    return {
      isLoading: false,
      showInfoDialog: false, // 详情弹窗
      propData: {}, // 弹窗传参
      searchData: {
        pageNum: 1,
        pageSize: 20,
        source: '',
        camId: '',
        auditRes: '',
        startDate: '',
        endDate: '',
      },
      tableData: [],
      total: 0,
      // 重大危险源列表
      sourceList: [],
      // 摄像头列表
      camList: [],
      // 审核结果列表
      resList: [{ name: '待审核' }, { name: '误报' }, { name: '属实' }],
    }
  },
  computed: {
    setTag() {
      return function (status) {
        let tagType = ''
        switch (status) {
          case '待审核':
            tagType = 'warning'
            break
          case '已验收':
            tagType = 'success'
            break
          case '误报':
            tagType = 'info'
            break
          default:
            tagType = 'danger'
        }
        return tagType
      }
    },
  },
  created() {
    this.getPrefix()
  },
  methods: {
    /* 点击搜索 */
    searchClick() {
      // 必须选择公司
      if (!this.searchData.companyId) {
        this.$message.warning('请选择公司!')
        return
      }
      this.$refs.searchForm.validate((valid) => {
        if (valid) {
          let camIds = this.camList.map(item => item.key).join(',')
          if (this.searchData.camId) {
            camIds = this.searchData.camId
          }
          const params = {
            pageNum: this.searchData.pageNum,
            pageSize: this.searchData.pageSize,
            companyId: this.searchData.companyId,
            camIds,
            auditRes: this.searchData.auditRes,
            startDate: this.searchData.startDate,
            endDate: this.searchData.endDate,
          }
          this.isLoading = true
          getHkAlarmList(params)
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
        }
      })
    },
    /* 点击树的item */
    treeNodeTap(data) {
      if (data) {
        this.searchData.companyId = data.id
        this.searchData.source = ''
        this.searchData.camId = ''
        this.sourceList = []
        this.camList = []
        this.getHazardList()
      }
    },
    /* 获取重大危险源列表 */
    getHazardList() {
      getCameraHazardByCompany(this.searchData.companyId)
        .then((res) => {
          if (res.data.success) {
            this.sourceList = res.data.result || []
            this.searchData.source = ''
          }
          else {
            this.$message.warning(res.data.message || '获取重大危险源列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取重大危险源列表出错', err)
        })
    },
    /* 重大危险源选择回调 */
    sourceChangeEvt(val) {
      getCameraListByHazard(this.searchData.companyId, val)
        .then((res) => {
          if (res.data.success) {
            this.camList = res.data.result || []
          }
          else {
            this.$message.warning(res.data.message || '获取摄像头列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取摄像头列表出错', err)
        })
    },
    /* 点击列表项目展示详情 */
    itemClick(item) {
      const treeComp = this.$refs.companyTree
      const companyList = treeComp.getTreeData(1)
      this.propData = {
        infoData: JSON.parse(JSON.stringify(item)),
        companyList,
      }
      this.showInfoDialog = true
    },
    /* 弹窗关闭回调 */
    closeDialogEvt(isRefresh) {
      if (isRefresh) {
        this.searchClick()
      }
      this.showInfoDialog = false
    },
  },
}
</script>

<template>
  <!-- 视频监测 -->
  <TreeTable v-loading="isLoading">
    <!-- 左侧树 -->
    <CompanyTree
      ref="companyTree"
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      ref="searchForm"
      inline
      :model="searchData"
    >
      <el-form-item
        label="重大危险源"
        prop="source"
        :rules="{
          requred: true,
          message: '请选择重大危险源',
          trigger: 'change',
        }"
      >
        <el-select
          v-model="searchData.source"
          placeholder="重大危险源"
          clearable
          @change="sourceChangeEvt"
        >
          <el-option
            v-for="item in sourceList"
            :key="item.key"
            :label="item.value"
            :value="item.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="摄像头">
        <el-select
          v-model="searchData.camId"
          placeholder="摄像头"
          clearable
        >
          <el-option
            v-for="item in camList"
            :key="item.key"
            :label="item.value"
            :value="item.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="审核结果">
        <el-select
          v-model="searchData.auditRes"
          placeholder="审核结果"
          clearable
        >
          <el-option
            v-for="item in resList"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="开始时间">
        <el-date-picker
          v-model="searchData.startDate"
          style="width: 94%"
          placeholder="开始时间"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
          clearable
        />
      </el-form-item>
      <el-form-item label="截止时间">
        <el-date-picker
          v-model="searchData.endDate"
          style="width: 94%"
          placeholder="截止时间"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <!-- <el-button type="primary" size="mini" @click="refreshClick" icon="el-icon-refresh-right">重置</el-button> -->
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-search"
          @click="searchClick"
        >
          查询
        </el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-row
      slot="table"
      class="table-box"
    >
      <el-col
        v-for="item in tableData"
        :key="item.id"
        :span="8"
        class="info-box"
      >
        <div
          class="info-item"
          @click="itemClick(item)"
        >
          <el-popover
            placement="bottom"
            trigger="hover"
            class="info-img-box"
          >
            <img
              :src="filePrefix + item.pic"
              style="height: 150px"
            >
            <img
              slot="reference"
              class="item-img"
              :src="filePrefix + item.pic"
            >
          </el-popover>
          <div class="item-right">
            <div>
              <el-tag :type="setTag(item.auditStatus)">
                {{ item.auditStatus }}
              </el-tag>
            </div>
            <div>
              <i class="el-icon-time" />
              <span>{{ item.createdTime }}</span>
            </div>
            <div>
              <i class="el-icon-location-outline" />
              <span>{{ item.camName }}</span>
            </div>
            <div>
              <i class="el-icon-warning-outline" />
              <span>{{ item.alarmInfo }}</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
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
        title="报警详情"
        :visible.sync="showInfoDialog"
        width="50%"
        append-to-body
        :close-on-click-modal="false"
      >
        <VideoWatchInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </TreeTable>
</template>

<style lang="scss" scoped>
.table-box {
  height: 100%;
  overflow-y: auto;

  .info-box {
    margin: 0 0 20px 0;

    .info-item {
      cursor: pointer;
      height: 100px;
      display: flex;
      margin: 0 10px 0 0;
      .info-img-box {
        width: 50%;
        height: 100%;
        .item-img {
          width: 100%;
          height: 100%;
        }
      }
      .item-right {
        width: 50%;
        padding-left: 10px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
    }
  }
}
</style>
