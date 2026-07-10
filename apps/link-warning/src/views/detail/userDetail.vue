<script>
const BaseInfo = () => import('@/components/Detail/UserInfo/baseInfo')
const OtherInfo = () => import('@/components/Detail/UserInfo/otherInfo')
export default {
  components: {
    BaseInfo,
    OtherInfo,
  },
  data() {
    return {
      loading: false,
      activeName: 'first',
      id: '',
      method: '',
      name: '',
      title: '',
    }
  },
  created() {
    this.id = this.$route.params.id
    this.method = this.$route.params.method
    this.name = this.$route.params.name
    this.backPageNum = this.$route.params.pageNum || 1 // 返回用户列表时，需要说明返回第几页
    this.getTitle()
  },
  methods: {
    getTitle() {
      if (this.method === 'add') {
        this.title = '新增用户信息与一人一档'
      }
      else if (this.method === 'view') {
        this.title = `查看${this.name}的用户信息与一人一档`
      }
      else {
        this.title = `修改${this.name}的用户信息与一人一档`
      }
    },
    backFn() {
      this.$route.params.pageNum = this.backPageNum
      this.$router.back(-1)
    },
    doSubmit() {
      if (this.activeName === 'first') {
        this.loading = true
        this.$refs.baseInfo.submitBaseInfo()
      }
    },
    submitFinish() {
      this.loading = false
    },
  },
}
</script>

<template>
  <div class="page-container">
    <ECard>
      <div
        class="tabArea"
        :style="{ height: method === 'view' ? '16%' : '10%' }"
      >
        <div class="titleArea">
          <EButton
            type="text"
            btnIcon="el-icon-d-arrow-left"
            @click="backFn"
          >
            返回
          </EButton>
          <h2
            class="flex-auto text-center text-lg font-semibold"
            style="margin-bottom: 0"
          >
            {{ title }}
          </h2>
        </div>
        <!-- <div class="titleArea"> -->

        <!-- </div> -->
      </div>
      <div class="contentArea">
        <el-tabs
          v-if="method === 'view'"
          v-model="activeName"
          class="tabs-block"
        >
          <el-tab-pane
            label="基本信息"
            name="first"
          />
          <el-tab-pane
            label="其他业务"
            name="second"
          />
        </el-tabs>
        <div class="content-block">
          <base-info
            v-show="activeName === 'first'"
            :id.sync="id"
            ref="baseInfo"
            :method="method"
            @submitFinish="submitFinish"
          />
          <other-info
            v-show="activeName === 'second'"
            :id.sync="id"
          />
        </div>
      </div>

      <div class="text-center leading-6">
        <EButton
          v-if="method !== 'view'"
          type="primary"
          :loading="loading"
          :disabled="method === 'view'"
          @click="doSubmit"
        >
          保存
        </EButton>
      </div>
    </ECard>
  </div>
</template>

<style lang="scss" scoped>
.page-container {
  .tabArea {
    // padding: 10px;
    .titleArea {
      display: flex;
      align-items: center;
      width: 100%;
      margin-bottom: 10px;
    }
  }

  .contentArea {
    // display: flex;
    // flex: 1;
    overflow-y: auto;

    .tabs-block {
      // width: 120px;
      // margin-left: -16px;
      margin-top: 10px;
      text-align: left;
      // padding: 10px 10px 0;
    }

    .content-block {
      height: 100%;
      // width: calc(100% - 120px);
    }
  }
}
</style>
