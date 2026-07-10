<script>
import { synchDbFn } from '@/http/safe-production/genCode/table-list-api'

export default {
  data() {
    return {
      visible: false,
      inputForm: {
        id: '',
        isForce: '1',
      },
    }
  },
  methods: {
    init(id) {
      this.inputForm.id = id
      this.visible = true
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          synchDbFn(this.inputForm.id, this.inputForm.isForce).then(({ data }) => {
            if (data && data.success) {
              this.$message.success(data.message)
              this.visible = false
              this.$emit('refreshDataList')
            }
          })
        }
      })
    },
  },
}
</script>

<template>
  <el-dialog

    title="同步数据库"
    width="400px"
    append-to-body
    :visible.sync="visible"
  >
    <el-form
      ref="inputForm"
      :model="inputForm"
      @submit.native.prevent
    >
      <el-form-item>
        确认要同步数据库吗? 请慎重选择同步方式，强制同步数据库将删除所有数据重新建表!
        <br>
        <el-radio
          v-model="inputForm.isForce"
          label="1"
        >
          普通同步(保留数据)
        </el-radio>
        <el-radio
          v-model="inputForm.isForce"
          label="2"
        >
          强制同步(重新建表)
        </el-radio>
      </el-form-item>
    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        v-noMoreClick
        type="primary"
        size="small"
        @click="doSubmit"
      >确定</el-button>
    </span>
  </el-dialog>
</template>
