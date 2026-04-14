<script>
import { getChangeDetail } from '@/http/changeManagement/changeManagement-api'
import ChangeForm from '../changeManagement/components/changeForm.vue'
import CheckAccept from '../changeManagement/components/checkAccept.vue'
import ReviewForm from '../changeManagement/components/reviewForm.vue'

export default {
  components: {
    ChangeForm,
    CheckAccept,
    ReviewForm,
  },
  data: () => ({
    method: '', // 判断是增加还是修改
    id: '', // 变更项目id
    activeName: 'first',
    itemCode: 'ChangeForm',
    recordData: {},
    tabrList: [],
    isLoading: false,
    title: '变更申请',
    tabList: [
      { label: '基本信息', name: 'first' },
      { label: '四新评审', name: 'second' },
      { label: '变更验收', name: 'third' },
    ],
  }),
  created() {
    this.id = this.$route.params.id
    this.method = this.$route.params.method

    if (this.id && this.id !== 'null' && this.method !== 'reviewView' && this.method !== 'review') {
      this.getChangeDetail(this.id)
    }
    else {
      this.tabrList = this.tabList
      this.methodType()
    }
  },
  methods: {
    getChangeDetail(id) {
      getChangeDetail(id).then(({ data }) => {
        if (data.success) {
          this.recordData = data.result || {}
          if (this.method != 'add') {
            this.tabrList = this.tabList
            this.methodType()
          }
        }
        else {
          this.$message.error('获取详情失败')
        }
      })
    },
    handleClick(event) {
      switch (Number.parseInt(event.index)) {
        case 0:
          this.itemCode = 'ChangeForm'
          this.title = '基本信息'
          break
        case 1:
          this.itemCode = 'ReviewForm'
          this.title = '四新评审'
          break
        case 2:
          this.itemCode = 'CheckAccept'
          this.title = '变更验收'
          break
      }
    },
    methodType() {
      switch (this.method) {
        case 'add':
          this.itemCode = 'ChangeForm'
          this.title = '申请信息'
          this.tabrList = this.tabrList.splice(0, 1)
          this.activeName = 'first'
          break
        case 'review':
          this.itemCode = 'ReviewForm'
          this.title = '四新评审'
          this.tabrList = this.tabrList.splice(0, 2)
          this.activeName = 'second'
          break
        case 'reviewView':
          this.itemCode = 'ChangeForm'
          this.title = '申请信息'
          this.tabrList = this.tabrList.splice(0, 2)
          this.activeName = 'first'
          break
        case 'checkAccept':
          this.itemCode = 'CheckAccept'
          this.title = '变更验收'
          this.tabrList = this.tabrList.splice(0, 3)
          this.activeName = 'third'
          break
        default:
          break
      }
    },
  },
}
</script>

<template>
  <div class="application-change">
    <div class="top-box">
      <h2 class="dialog-footer">
        {{ title }}
      </h2>
      <el-tabs
        v-model="activeName"
        @tab-click="handleClick"
      >
        <el-tab-pane
          v-for="item in tabrList"
          :key="item.name"
          :label="item.label"
          :name="item.name"
        />
      </el-tabs>
    </div>
    <div class="info">
      <ChangeForm
        v-show="itemCode === 'ChangeForm'"
        :id.sync="id"
        :method="method"
        :recordData="recordData"
      />
      <CheckAccept
        v-show="itemCode === 'CheckAccept'"
        :id.sync="id"
        :method="method"
        :recordData="recordData"
      />
      <ReviewForm
        v-show="itemCode === 'ReviewForm'"
        :id.sync="id"
        :method="method"
        :recordData="recordData"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.application-change {
  position: relative;
  padding: 20px;
  box-sizing: border-box;
  .top-box {
    width: 100%;
    position: absolute;
    top: 0;
    background: #ffffff;
  }
  .info {
    margin-top: 80px;
  }
}
.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: right;
  box-sizing: border-box;
  padding-right: 50px;
  // padding-top: 22px;
}
</style>
