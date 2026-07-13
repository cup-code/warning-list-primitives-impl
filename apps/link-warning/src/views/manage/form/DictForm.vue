<script>
import { getTenantDictListMap, saveDict } from '@/http/safe-production/dict-manage-api'

export default {
  name: 'DictForm',
  data() {
    return {
      visible: false,
      loading: false,
      method: '',
      title: '新增',
      inputForm: {
        id: '', // id
        parentId: '',
        dictName: '',
        dictCode: '',
        remarks: '', // 备注
        sort: 0,
      },
      dataRule: {
        dictName: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        dictCode: [{ required: true, message: 'Code不能为空', trigger: 'blur' }],
      },
      tenantCode: JSON.parse(sessionStorage.getItem('user')).tenantCode,
    }
  },
  methods: {
    init(method, obj, row) {
      this.visible = true
      this.method = method
      this.inputForm.id = obj.id
      this.inputForm.parentId = obj.parent.id

      this.title
        = method === 'add'
          ? '新增'
          : method === 'addChild'
            ? '添加下级'
            : method === 'edit'
              ? '修改'
              : '查看'

      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        if (this.inputForm.id) {
          this.inputForm = this.recover(this.inputForm, row)
        }
      })
    },
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          saveDict(this.inputForm, this.tenantCode)
            .then(({ data }) => {
              this.loading = false
              if (data?.success) {
                this.$message.success(data.message)
                this.visible = false
                this.$emit('refreshDataList')
                return getTenantDictListMap() // 更新session里保存的dictlist
              }
              else {
                this.$message.error(data.message)
              }
            })
            .then(({ data }) => {
              const key = 'dictList'
              if (data.success) {
                sessionStorage.setItem(key, JSON.stringify(data.result || '[]'))
              }
            })
        }
      })
    },
  },
}
</script>

<template>
  <div>
    <el-dialog
      :title="title"
      :visible.sync="visible"
      :close-on-click-modal="false"

      class="normal-dialog"
    >
      <el-form
        ref="inputForm"
        v-loading="loading"
        :model="inputForm"
        :rules="dataRule"
        :disabled="method === 'view'"
        :class="method === 'view' ? 'readonly' : ''"
        label-width="100px"
        size="small"
        @submit.native.prevent
      >
        <el-form-item
          label="名称"
          prop="dictName"
        >
          <el-input
            v-model="inputForm.dictName"
            placeholder="请输入名称"
          />
        </el-form-item>
        <el-form-item
          label="Code"
          prop="dictCode"
        >
          <el-input v-model="inputForm.dictCode" />
        </el-form-item>
        <el-form-item
          label="备注"
          prop="remarks"
        >
          <el-input v-model="inputForm.remarks" />
        </el-form-item>
        <el-form-item
          label="排序号"
          prop="sort"
        >
          <el-input-number
            v-model="inputForm.sort"
            :min="0"
            :step="1"
            controls-position="right"
            label="排序号"
          />
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          size="small"
          @click="visible = false"
        >
          关闭
        </el-button>
        <el-button
          v-if="method !== 'view'"
          size="small"
          type="primary"
          @click="doSubmit()"
        >
          确定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
