<script>
export default {
  data: () => ({
    form: {},
    drawer: false,
  }),
  methods: {
    changeFn(v) {
      if (v == 2) {
        this.drawer = true
      }
    },
  },
}
</script>

<template>
  <div class="moment-rule-template">
    <el-form
      ref="form"
      class="base-form"
      :model="form"
      size="mini"
      label-width="80px"
    >
      <el-form-item label="触发时机">
        <el-select
          v-model="form.a"
          placeholder="请选择"
          style="width: 100%"
        >
          <el-option
            label="立即触发"
            value="1"
          />
          <el-option
            label="数据更新时触发"
            value="2"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="执行时间">
        <el-select
          v-model="form.b"
          placeholder="请选择"
          style="width: 100%"
          @change="changeFn"
        >
          <el-option
            label="总是"
            value="1"
          />
          <el-option
            label="指定时间"
            value="2"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary">
          修改
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 添加/编辑 抽屉 -->
    <el-drawer
      :visible.sync="drawer"
      :with-header="false"
      size="60%"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        指定时间
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        cron表达式
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.moment-rule-template {
  .base-form {
    width: 30%;
  }
}
</style>
