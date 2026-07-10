<script>
import ProjectDetail from '@/components/Detail/eam/ProjectDetail'
import { getPlanAssetsAndItems } from '@/http/eam-api'
import { formatDate } from '@/utils'

export default {
  components: {
    ProjectDetail,
  },
  data: () => ({
    planInfo: {},
    planAssets: [], // 计划下的所有资产以及资产的项目
    cur_tab: '', // 当前选中的标签
  }),
  created() {
    this.planInfo = JSON.parse(decodeURIComponent(this.$route.query.planInfo))
    this.getDataList()
  },
  methods: {
    formatDate,
    getDataList() {
      getPlanAssetsAndItems(this.planInfo.id)
        .then((res) => {
          const resD = res.data
          const msg = resD.message

          if (resD.success === true) {
            this.planAssets = resD.result || []
          }
          else {
            this.$message.error(msg || '查询计划项目失败')
          }
        })
        .catch((err) => {
          this.$message.error('查询计划项目失败')
        })
    },
    changeFn() {
      this.getDataList()
    },
    backFn() {
      this.$router.back(-1)
    },

    // 标签页的点击事件
    tabFn(v) {},
  },
}
</script>

<template>
  <div class="checkProject-detail">
    <el-card
      class="top-card"
      shadow="hover"
    >
      <div class="card-title">
        巡检信息
      </div>
      <el-row
        class="card-con"
        type="flex"
        align="middle"
      >
        <el-col :span="5">
          <div>
            <span>巡检名称:</span>
            <span>{{ planInfo.name }}</span>
          </div>
          <div>
            <span>巡检周期:</span>
            <span>{{ planInfo.cycle }}</span>
          </div>
          <div>
            <span>周期单位:</span>
            <span v-if="planInfo.cycleUnit === 'DAY'">天</span>
            <span v-if="planInfo.cycleUnit === 'MONTH'">月</span>
          </div>
        </el-col>
        <el-col :span="5">
          <div>
            <span>开始日期:</span>
            <span>{{ formatDate(planInfo.startDate, 'YYYY-MM-DD') }}</span>
          </div>
          <div>
            <span>结束日期:</span>
            <span>{{ formatDate(planInfo.endDate, 'YYYY-MM-DD') }}</span>
          </div>
          <div>
            <span>首次巡检:</span>
            <span>{{ formatDate(planInfo.firstDate, 'YYYY-MM-DD') }}</span>
          </div>
        </el-col>
        <el-col
          :span="5"
          class="only-two"
        >
          <div style="display: flex; align-items: center">
            <span>备注:</span>
            <span style="flex: 1; overflow: auto; white-space: nowrap">{{ planInfo.remarks }}</span>
          </div>
        </el-col>
        <el-col
          :span="4"
          style="text-align: right"
        >
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-arrow-left"
            @click="backFn"
          >
            返回
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-tabs
      v-model="cur_tab"
      type="border-card"
      @tab-click="tabFn"
    >
      <el-tab-pane
        v-for="(item, key) in planAssets"
        :key="key"
        :label="item.assetsName"
      >
        <!-- 这里的v-if可以实现，只加载当前选中的标签下的组件 -->
        <keep-alive>
          <project-detail
            v-if="key == cur_tab"
            :plan="planInfo"
            :assetDt="item"
          />
        </keep-alive>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.checkProject-detail {
  padding: 10px;
  position: relative;
  .top-card {
    margin-bottom: 2vh;
    .el-card__body {
      padding: 0;
      .card-title {
        background: #f5f7fa;
        padding: 10px;
        font-size: 14px;
      }
      .card-con {
        padding: 10px 20px;
        height: 63px;
        box-sizing: content-box;
        .el-col {
          & > div {
            padding: 4px 0;
            & > span:first-child {
              padding-right: 10px;
              font-weight: bold;
              font-size: 13px;
            }
          }
          &.only-two {
            height: 100%;
            display: flex;
            flex-direction: column;
          }
        }
      }
    }
  }
}
</style>
