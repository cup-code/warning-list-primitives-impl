/* * @Author: yangjie 应急专家页面新增、修改、查看弹框 * @Date: 2023-03-14 14:55:13 */
<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
// 获取数据字典
import {
  addMaster,
  updateMaster,
} from '@/http/contingency/contingencyMaster.js'
// 应急专家接口路径
export default {
  components: {
    TreeSelect,
  },
  data() {
    return {
      visible: false,
      loading: false,
      colWidth: 12,
      qualificationOptions: {}, // 学历字典信息
      dataRule: {
        companyId: [{ required: true, message: '所属公司不能为空', trigger: 'blur' }],
        fullName: [{ required: true, message: ' 专家姓名不能为空', trigger: 'blur' }],
        phone: [{ required: true, message: '专家电话不能为空', trigger: 'blur' }],
        professionTerritory: [{ required: true, message: '专业领域不能为空', trigger: 'blur' }],
      },
      method: '',
      inputForm: {},
    }
  },
  created() {
    // this.getSystem()
  },
  methods: {
    closeDialog() {
      this.inputForm = {}
      this.$refs.inputForm.resetFields()
    },
    getDepartmentId(value, name) {
      this.inputForm.companyId = value
      this.inputForm.companyName = name
    },
    init(row, method) {
      this.visible = true
      this.method = method
      console.log(row)
      if (row) {
        this.inputForm = Object.assign({}, row)
      }
    },
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          let params, funcFn
          params = Object.assign(this.inputForm, { classify: 0 })
          if (this.method === 'edit') {
            funcFn = updateMaster // 编辑
          }
          else {
            funcFn = addMaster // 新增
          }
          console.log(params)
          funcFn(params)
            .then((data) => {
              if (data.success) {
                this.$message.success(data.message || '提交成功')
                this.$emit('refreshList') // 执行回调函数
                this.visible = false
              }
              else {
                this.$message.warning(data.message || '提交失败')
              }
            })
            .catch(() => {
              this.$message.error('提交失败')
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
  },
}
</script>

<template>
  <el-dialog
    :title="`${method == 'add' ? '新增' : method == 'edit' ? '修改' : '查看'}应急专家`"
    :close-on-click-modal="false"
    width="800px"

    :visible.sync="visible"
    class="normal-dialog"
    @close="closeDialog"
  >
    <el-form
      ref="inputForm"
      v-loading="loading"
      :model="inputForm"
      :rules="dataRule"
      label-width="120px"
      :disabled="method === 'view'"
      @submit.native.prevent
    >
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="所属公司"
            prop="companyId"
          >
            <TreeSelect
              ref="officeTree"
              class="small-box"
              :props="{
                value: 'id', // ID字段名
                label: 'companyName', // 显示名称
                children: 'children', // 子级字段名
              }"
              url="sysCompany/getSubordinateCompany"
              :value="inputForm.companyId"
              :clearable="true"
              :accordion="true"
              @getValue="getDepartmentId"
            />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="专家姓名"
            prop="fullName"
          >
            <el-input v-model="inputForm.fullName" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="专家电话"
            prop="phone"
          >
            <el-input v-model="inputForm.phone" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="学历"
            prop="education"
          >
            <el-select
              v-model="inputForm.education"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in $dictUtils.getDictList('qualificationType')"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
              <!-- <el-option v-for="item in qualificationOptions" :key="item.id" :label="item.text" :value="item.id" /> -->
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="专业领域"
            prop="professionTerritory"
          >
            <el-input v-model="inputForm.professionTerritory" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="专业"
            prop="profession"
          >
            <el-input v-model="inputForm.profession" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-form-item
            label="备注"
            prop="remark"
          >
            <el-input
              v-model="inputForm.remark"
              type="textarea"
              :rows="6"
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
        v-if="method !== 'view'"
        size="small"
        type="primary"
        :loading="loading"
        @click="doSubmit()"
      >确定</el-button>
    </span>
  </el-dialog>
</template>
