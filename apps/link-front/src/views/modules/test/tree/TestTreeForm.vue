<script>
import SelectTree from '@/components/mjTreeSelect/mjTreeSelect.vue'

export default {
  components: {
    SelectTree,
  },
  data() {
    return {
      window,
      title: '',
      method: '',
      visible: false,
      loading: false,
      inputForm: {
        id: '',
        name: '',
        sort: '',
        parent: {
          id: '',
        },
        remarks: '',
      },
    }
  },
  methods: {
    init(method, obj) {
      this.method = method
      this.inputForm.id = obj.id
      if (method === 'add') {
        this.title = '新建组织机构'
      }
      else if (method === 'addChild') {
        this.title = '添加下级组织机构'
      }
      else if (method === 'edit') {
        this.title = '修改组织机构'
      }
      else if (method === 'view') {
        this.title = '查看组织机构'
      }
      this.visible = true
      this.loading = false
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        this.inputForm.parent.id = obj.parent.id
        this.inputForm.parent.name = obj.parent.name
        if (method === 'edit' || method === 'view') {
          // 修改或者查看
          this.loading = true
          this.$http({
            url: `/test/tree/testTree/queryById?id=${this.inputForm.id}`,
            method: 'get',
          }).then(({ data }) => {
            this.inputForm = this.recover(this.inputForm, data.testTree)
            this.loading = false
          })
        }
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          this.$http({
            url: `/test/tree/testTree/save`,
            method: 'post',
            data: this.inputForm,
          }).then(({ data }) => {
            this.loading = false
            if (data && data.success) {
              this.visible = false
              this.$message.success(data.msg)
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
  <div>
    <el-dialog
      :title="title"
      :close-on-click-modal="false"

      :visible.sync="visible"
    >
      <el-form
        ref="inputForm"
        v-loading="loading"
        size="small"
        :model="inputForm"
        :class="method === 'view' ? 'readonly' : ''"
        :disabled="method === 'view'"
        label-width="120px"
      >
        <el-row :gutter="15">
          <el-col :span="12">
            <el-form-item
              label="名称"
              prop="name"
              :rules="[{ required: true, message: '名称不能为空', trigger: 'blur' }]"
            >
              <el-input
                v-model="inputForm.name"
                placeholder="请填写名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="排序"
              prop="sort"
              :rules="[
                { required: true, message: '排序不能为空', trigger: 'blur' },
                { validator: validator.isNumber, trigger: 'blur' },
              ]"
            >
              <el-input
                v-model="inputForm.sort"
                placeholder="请填写排序"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="父级编号"
              prop="parent.id"
              :rules="[]"
            >
              <SelectTree
                v-if="visible"
                ref="parent"
                :props="{
                  value: 'id', // ID字段名
                  label: 'name', // 显示名称
                  children: 'children', // 子级字段名
                }"
                :url="`/test/tree/testTree/treeData?extId=${inputForm.id}`"
                :value="inputForm.parent.id"
                :clearable="true"
                :accordion="true"
                @getValue="
                  value => {
                    inputForm.parent.id = value
                  }
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="备注信息"
              prop="remarks"
              :rules="[]"
            >
              <el-input
                v-model="inputForm.remarks"
                type="textarea"
                placeholder="请填写备注信息"
              />
            </el-form-item>
          </el-col>
        </el-row>
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
          v-if="method != 'view'"
          v-noMoreClick
          size="small"
          type="primary"
          @click="doSubmit()"
        >确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
