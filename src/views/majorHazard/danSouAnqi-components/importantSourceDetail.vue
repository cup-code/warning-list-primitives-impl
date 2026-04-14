<script>
import ControlRecord from './ControlRecord'
import ControlTask from './ControlTask'
import InformationDetails from './important/InformationDetails'
import RiskControl from './RiskControl'
import RiskEvent from './RiskEvent'

export default {
  name: 'dangerSourceDetail',
  components: {
    InformationDetails,
    RiskEvent,
    RiskControl,
    ControlTask,
    ControlRecord,
  },
  data() {
    return {
      pageUpload: true,
      menuData: [
        {
          index: '1',
          label: '基本信息',
          componentName: 'InformationDetails',
        },
        {
          index: '2',
          label: '风险事件',
          componentName: 'RiskEvent',
        },
        {
          index: '3',
          label: '风险分级管控',
          componentName: 'RiskControl',
        },
        {
          index: '4',
          label: '管控措施巡查任务',
          componentName: 'ControlTask',
        },
        {
          index: '5',
          label: '管控措施巡查记录',
          componentName: 'ControlRecord',
        },
      ],
      componentData: {
        label: '基本信息',
        is: 'InformationDetails',
        method: '',
        formData: {
          id: '',
        },
      },
    }
  },
  created() {
    const { id, method } = this.$route.params
    this.componentData.method = method
    if (method !== 'add') {
      this.componentData.formData.id = id
    }
  },
  methods: {
    selectComponents(index) {
      if (!this.componentData.formData.id) {
        this.$message.warning('请先保存基本信息！')
      }
      else {
        this.componentData.label = this.menuData[index - 1].label
        this.componentData.is = this.menuData[index - 1].componentName
      }
    },
    // 子组件基本信息保存
    doInformationSubmit() {
      this.$refs.information.doInformationSubmit()
    },
    // 子组件基本信息保存完成之后，拿到它的id用来打开其他el-menu项
    updateData(data) {
      if (data == undefined) {
        this.backFn()
      }
      this.componentData.formData = data
      this.componentData.formData.id = data.id
    },
    /* 关闭页面 */
    backFn() {
      this.$router.back(-1)
    },
  },
}
</script>

<template>
  <div class="detail-importantSource-anqi">
    <el-container class="main-box">
      <el-aside width="150px">
        <el-menu
          default-active="1"
          class="el-menu-vertical-demo"
          @select="selectComponents"
        >
          <el-menu-item
            v-for="item in menuData"
            :key="item.index"
            :index="item.index"
          >
            <span slot="title">{{ item.label }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header class="dialog-header">
          <div style="display: flex; align-items: center">
            <div class="header-icon" />
            <span>{{ componentData.label }}</span>
          </div>
          <div style="margin-right: 75px">
            <el-button
              v-if="componentData.method !== 'view' && componentData.is === 'InformationDetails'"
              v-noMoreClick
              class="submit-button"
              type="primary"
              @click="doInformationSubmit()"
            >
              保存
            </el-button>
            <el-button @click="backFn()">
              关闭
            </el-button>
          </div>
        </el-header>
        <el-main
          :key="pageUpload"
          style="position: relative"
        >
          <keep-alive>
            <component
              v-bind="componentData"
              :is="componentData.is"
              ref="information"
              @succSubmit="updateData"
            />
          </keep-alive>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped lang="scss">
.detail-importantSource-anqi {
  height: calc(100vh - 50px);
  .main-box {
    height: 100%;
    overflow: hidden;
    .el-aside {
      .el-menu {
        height: 100%;
      }
    }
    .el-container {
      .el-main {
        padding: 20px 10px;
      }
    }
  }
}
.dialog-header {
  min-height: 56px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 18px;
  border-bottom: 1px solid #eee;
  justify-content: space-between;

  .header-icon {
    display: inline-block;
    content: '';
    margin: 0 10px 0 0;
    width: 4px;
    height: 24px;
    background-color: #409eff;
  }
}
</style>
