<script>
import { flowableTaskBackNodes } from '@/http/safe-production/flowable-api'

export default {
  name: 'TaskBackNodes',
  data() {
    return {
      visible: false,
      backNodes: [],
      backTaskDefKey: '',
    }
  },
  computed: {
    dialogTaskBackNodesInChild: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      },
    },
  },
  methods: {
    init(taskId) {
      this.visible = true
      flowableTaskBackNodes({
        taskId,
      }).then(({ data }) => {
        this.backNodes = data.backNodes
      })
    },
    doConfirm() {
      this.visible = false
      this.$emit('getBackTaskDefKey', this.backTaskDefKey)
    },
  },
}
</script>

<template>
  <el-dialog
    class="dialog-taskBackNodes-components-flowable"
    title="退回任务"
    :close-on-click-modal="false"

    :visible.sync="visible"
    :appendToBody="true"
  >
    <el-select
      v-model="backTaskDefKey"
      style="width: 100%"
      placeholder="请选择驳回节点"
    >
      <el-option
        v-for="item in backNodes"
        :key="item.taskDefKey"
        :label="item.taskName"
        :value="item.taskDefKey"
      />
    </el-select>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="mini"
        icon="el-icon-close"
        @click="visible = false"
      >
        取消
      </el-button>
      <el-button
        size="mini"
        icon="el-icon-check"
        type="primary"
        @click="doConfirm"
      >
        确定
      </el-button>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.dialog-taskBackNodes-components-flowable {
  .el-dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-height: calc(100% - 30px);
    max-width: calc(100% - 30px);
    margin: 0 !important;
    display: flex;
    flex-direction: column;
    .el-dialog__header {
      border-bottom: 1px solid #e8e8e8;
    }
    .el-dialog__body {
      overflow: auto;
    }
    .el-dialog__footer {
      border-top: 1px solid #e8e8e8;
      border-radius: 0 0 4px 4px;
    }
  }
}
</style>
