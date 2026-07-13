<script>
const BaseInfo = () => import('@/components/Detail/eam/BaseInfo')
const TechnicalParam = () => import('@/components/Detail/eam/technicalParam')
const Mountings = () => import('@/components/Detail/eam/mountings')
const DataPoint = () => import('@/components/Detail/eam/DataPoint')
// import BaseInfo from '@/components/Detail/eam/BaseInfo'
export default {
  components: {
    BaseInfo,
    TechnicalParam,
    Mountings,
    DataPoint,
  },
  data: () => ({
    activeIndex: '1',
    method: '', // 判断是增加还是修改
    did: '', // 设备id
    tabList: [
      { label: '设备信息', name: '1' },
      { label: '技术参数', name: '2' },
      { label: '辅机配件', name: '3' },
      { label: '数据测点', name: '4' },
    ],
  }),
  created() {
    this.did = this.$route.params.did
    this.method = this.$route.params.method
  },
  methods: {
    changeIndex(tab, event) {
      console.log(tab, event)
      // this.activeIndex = idx
    },
  },
}
</script>

<template>
  <KyTreeTable
    ref="treeTable"
    :isShowLeft="false"
  >
    <ECard
      slot="table"
      customStyle="overflow: hidden;margin:0px;padding:10px 16px"
    >
      <el-tabs
        v-model="activeIndex"
        @tab-click="changeIndex"
      >
        <el-tab-pane
          v-for="(item, index) in tabList"
          :key="index"
          :label="item.label"
          :name="item.name"
        />
      </el-tabs>
      <!-- <el-menu default-active="1" style="height: 100%" @select="changeIndex">
        <el-menu-item index="1">
          <span slot="title">设备信息</span>
        </el-menu-item>
        <el-menu-item index="2">
          <span slot="title">技术参数</span>
        </el-menu-item>
        <el-menu-item index="3">
          <span slot="title">辅机配件</span>
        </el-menu-item>
        <el-menu-item index="4">
          <span slot="title">数据测点</span>
        </el-menu-item>
      </el-menu> -->
      <div style="height: 100%; width: 100%; overflow: auto; scrollbar-width: none">
        <base-info
          v-show="activeIndex === '1'"
          :did.sync="did"
          :method="method"
        />
        <technical-param
          v-show="activeIndex === '2'"
          :did.sync="did"
          :method="method"
        />
        <mountings
          v-show="activeIndex === '3'"
          :did.sync="did"
          :method="method"
        />
        <data-point
          v-show="activeIndex === '4'"
          :did.sync="did"
          :method="method"
        />
      </div>
    </ECard>
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.asset-detail ::v-deep {
  .el-menu-item {
    height: 30px;
    line-height: 30px;
    margin-top: 3px;
  }
}
</style>
