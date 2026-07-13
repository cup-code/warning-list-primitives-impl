<script>
import { getTenantUserPermissionMenu, saveTenantCommonMenu } from '@/http/user-api.js'
import { setTreeData } from '@/utils'

export default {
  data() {
    return {
      treeData: [], // 选择树相关数据
      routerData: [], // 路由数据
      treeProps: {
        value: 'id',
        label: 'menuName',
        children: 'children',
      },
      selectNodeList: [], // 当前选中的tree节点列表
      commonFuncMaxNum: 10, // 常用功能最大数量
      commonFuncList: [], // 常用功能列表
      loadingTree: false,
      loadingFunc: false,
      showSetMenuDialog: false,
    }
  },
  created() {
    this.getCommonMenu()
  },
  methods: {
    /* 打开设置常用功能菜单 */
    showSetClick() {
      this.showSetMenuDialog = true
    },
    /* 获取常用功能列表 */
    getCommonMenu() {
      this.loadingFunc = true
      getTenantUserPermissionMenu()
        .then((res) => {
          if (res.data.success) {
            const resDataList = res.data.result.permissions || []
            this.routerData = resDataList.filter(item => item.menuType != 3)
            this.treeData = setTreeData(this.routerData)
            this.filterData()
          }
          else {
            this.$message.warning(res.data.message || '获取常用功能列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取常用功能列表出错', err)
        })
        .finally(() => {
          this.loadingFunc = false
        })
    },
    /* 提交tree选择，保存常用功能 */
    saveCommonFuncClick() {
      const nodeList = this.$refs.treeCommonFunc.getCheckedNodes()
      this.selectNodeList = []
      for (const item of nodeList) {
        if (item.vueComponent) {
          this.selectNodeList.push(item.id)
        }
      }
      if (this.selectNodeList.length > this.commonFuncMaxNum) {
        this.$message.warning(`最多勾选${this.commonFuncMaxNum}个常用功能！`)
        return
      }
      this.loadingTree = true
      saveTenantCommonMenu(this.selectNodeList)
        .then((res) => {
          if (res.data.success) {
            this.$message.success('保存成功')
            this.showSetMenuDialog = false
            this.getCommonMenu()
          }
          else {
            this.$message.warning(res.data.message || '保存失败')
          }
        })
        .catch((err) => {
          this.$message.error('保存出错', err)
        })
        .finally(() => {
          this.loadingTree = false
        })
    },
    /* 筛选数据中被选中的节点 */
    filterData() {
      this.selectNodeList = []
      this.commonFuncList = []
      for (const item of this.routerData) {
        if (item.isCommon) {
          this.selectNodeList.push(item.id)
          item.path = item.path = item.menuType === '0' ? `/${item.englishName}` : item.englishName
          this.commonFuncList.push(item)
        }
      }
    },
    /* 点击常用功能按钮跳转 */
    funcItemClick(name) {
      this.$router.push({ name })
    },
  },
}
</script>

<template>
  <div v-loading="loadingFunc">
    <div class="item-img" />
    <div class="item-header">
      <span>常用功能</span>
      <i
        class="el-icon-s-tools"
        @click="showSetClick"
      />
    </div>
    <div class="daily-func">
      <div
        v-for="item in commonFuncList"
        :key="item.id"
        class="func-item"
        @click="funcItemClick(item.englishName)"
      >
        <i :class="item.icon" />
        <span>{{ item.menuName }}</span>
      </div>
      <div class="func-after" />
    </div>
    <!-- 常用功能设置弹窗 -->
    <el-dialog
      title="设置常用功能"
      :visible.sync="showSetMenuDialog"
      width="80%"
    >
      <div
        v-if="showSetMenuDialog"
        v-loading="loadingTree"
      >
        <el-tree
          id="tree-option"
          ref="treeCommonFunc"
          :data="treeData"
          :show-checkbox="true"
          :props="treeProps"
          node-key="id"
          :default-checked-keys="selectNodeList"
        />
      </div>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          :disabled="loadingTree"
          @click="showSetMenuDialog = false"
        >取 消</el-button>
        <el-button
          type="primary"
          :disabled="loadingTree"
          @click="saveCommonFuncClick"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.item-img {
  width: 7px;
  height: 23px;
  background-color: rgba($color: #1195f9, $alpha: 0.8);
  border-radius: 20px;
  margin: 1px 3px 4px 3px;
  float: left;
}

.daily-func {
  height: calc(100% - 26px);
  overflow-y: auto;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  // align-items: center;
  // padding: 10px;
  justify-content: flex-start;

  .func-item {
    width: 100px;
    height: 100px;
    margin: 10px;
    box-shadow: 0 0 4px 0 rgba(45, 45, 45, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    user-select: none;
    cursor: pointer;

    i {
      font-size: 60px;
    }
  }

  .func-item:hover {
    color: #409eff;
    box-shadow: 0 0 4px 0 rgba(4, 238, 247, 0.5);
  }

  .func-after {
    content: '';
    flex: 1;
  }
}
</style>
