<script>
import Action from '@/components/Detail/Rule/Action'
import Condition from '@/components/Detail/Rule/Condition'
import Moment from '@/components/Detail/Rule/Moment'
import BaseInfo from '@/components/Detail/RuleAnqi/BaseInfo'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'

export default {
  components: {
    BaseInfo,
    Condition,
    Moment,
    Action,
  },
  data: () => ({
    rid: '', // 由路由从传递进来的规则id
    departList: [],
  }),
  created() {
    this.rid = this.$route.params.id
    this.getSimpleDepart()
  },
  methods: {
    backFn() {
      // this.$router.back(-1)
      const params = this.$route.params
      delete params.id
      this.$router.push({
        name: 'zywey-zdbjgze',
        params,
      })
    },
    getSimpleDepart() {
      getDepartListSimple().then(({ data }) => {
        this.departList = (data.result || []).filter((item) => {
          return item.departmentType === 'DEPARTMENT'
        })
      })
    },
  },
}
</script>

<template>
  <div class="ruleAnqi-detail">
    <el-button
      type="primary"
      size="mini"
      icon="el-icon-arrow-left"
      style="margin-bottom: 10px"
      @click="backFn"
    >
      返回
    </el-button>
    <el-tabs type="border-card">
      <el-tab-pane label="基础信息配置">
        <base-info
          :rid="rid"
          :departList="departList"
        />
      </el-tab-pane>
      <el-tab-pane label="触发条件配置">
        <condition :rid="rid" />
      </el-tab-pane>
      <!-- <el-tab-pane label="执行时机配置">
              <moment />
          </el-tab-pane> -->
      <el-tab-pane label="执行动作配置">
        <action :rid="rid" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.ruleAnqi-detail {
  padding: 10px;
  position: relative;
}
</style>
