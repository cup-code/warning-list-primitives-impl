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
      treeData: [],
      inputForm: {
        id: '',
        name: '',
        kind: {
          id: '',
        },
        remarks: '',
      },
    }
  },
  methods: {
    init(method, id, treeData) {
      this.method = method
      this.inputForm.id = id
      this.treeData = treeData
      if (method === 'add') {
        this.title = `新建车辆`
      }
      else if (method === 'edit') {
        this.title = '修改车辆'
      }
      else if (method === 'view') {
        this.title = '查看车辆'
      }
      this.visible = true
      this.loading = false
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        if (method === 'edit' || method === 'view') {
          // 修改或者查看
          this.loading = true
          this.$http({
            url: `/test/treetable/testCar/queryById?id=${this.inputForm.id}`,
            method: 'get',
          }).then(({ data }) => {
            this.inputForm = this.recover(this.inputForm, data.testCar)
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
            url: `/test/treetable/testCar/save`,
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
              label="品牌"
              prop="name"
              :rules="[]"
            >
              <el-input
                v-model="inputForm.name"
                placeholder="请填写品牌"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="车系"
              prop="kind.id"
              :rules="[]"
            >
              <SelectTree
                ref="kind"
                :props="{
                  value: 'id', // ID字段名
                  label: 'name', // 显示名称
                  children: 'children', // 子级字段名
                }"
                :data="treeData"
                :value="inputForm.kind.id"
                :clearable="true"
                :accordion="true"
                @getValue="
                  value => {
                    inputForm.kind.id = value
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
