<script>
import Action from '@/components/Detail/Rule/Action'
import BaseInfo from '@/components/Detail/Rule/BaseInfo'
import Condition from '@/components/Detail/Rule/Condition'
import Moment from '@/components/Detail/Rule/Moment'
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
      this.$router.back(-1)
    },
    getSimpleDepart() {
      getDepartListSimple().then(({ data }) => {
        this.departList = data.result || []
      })
    },
  },
}
</script>

<template>
  <div class="page-container">
    <ECard customStyle="height:calc(100vh - 90px)">
      <EButton
        type="text"
        size="mini"
        btnIcon="el-icon-d-arrow-left"
        @click="backFn"
      >
        返回
      </EButton>
      <div class="block">
        <el-tabs>
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
    </ECard>
  </div>
</template>

<style lang="scss" scoped>
.block {
  padding: 0 10px;
}
</style>
