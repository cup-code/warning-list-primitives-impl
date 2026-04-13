<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { getExpandDepartment, saveCompanyExt } from '@/http/companyConfig/companyConfig-api.js'
import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api'

export default {
  components: {
    SelectTree,
  },
  props: {
    companyId: {
      type: String,
      default: '',
    },
    itemCode: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      loading: false,
      departmentList: [], // 部门列表
      departmentId: '',
    }
  },
  created() {
    this.getAllDepartByCompanyFn()
  },
  methods: {
    getAllDepartByCompanyFn() {
      getAllDepartByCompanyFn(this.companyId).then(({ data }) => {
        if (data.success) {
          this.departmentList = data.result || []
          this.getExpandDepartment()
        }
        else {
          this.$message.warning(data.message || '获取部门列表数据失败')
        }
      })
    },
    getApplicantDeptName(value) {
      this.departmentId = value
    },
    // 获取指定公司下指定扩展类型的部门
    getExpandDepartment() {
      getExpandDepartment(this.companyId, 1).then(({ data }) => {
        this.departmentId = data.result.departmentId || ''
      })
    },
    saveRemainConfig() {
      if (!this.departmentId) {
        this.$message.warning('请选择绑定的安全部门')
        return
      }
      this.loading = true
      const params = {
        companyId: this.companyId,
        departmentId: this.departmentId,
        departmentType: 1,
      }
      saveCompanyExt(params)
        .then(({ data }) => {
          if (data.success) {
            this.$message.success(data.message || '保存成功')
          }
          else {
            this.$message.warning(data.message || '保存失败')
          }
        })
        .catch(() => {
          this.$message.error('保存出错')
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
}
</script>

<template>
  <el-form
    ref="remainConfig"
    label-width="100px"
  >
    <el-form-item label="绑定安全部门">
      <SelectTree
        class="small-box"
        :props="{
          value: 'id', // ID字段名
          label: 'departmentName', // 显示名称
          children: 'children', // 子级字段名
        }"
        :list="departmentList"
        :value="departmentId"
        :clearable="true"
        :accordion="true"
        style="width: 350px"
        @getValue="
          value => {
            getApplicantDeptName(value)
          }
        "
      />
    </el-form-item>
    <div class="button">
      <el-button
        type="primary"
        :loading="loading"
        @click="saveRemainConfig"
      >
        保存
      </el-button>
    </div>
  </el-form>
</template>

<style lang="scss" scoped>
.button {
  margin: 10px 0 0 150px;
}
</style>
