<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { chemistryIntoAdd } from '@/http/major-hazard/ChemicalIntoBook-api'

export default {
  name: 'ChemicalIntoBookFrom',
  components: { SelectTree },
  props: {
    method: {
      type: String,
      default: '',
    },
    fromData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      loading: false,
      dataRule: {
        companyId: [{ required: true, message: '所属公司不能为空', trigger: 'change' }],
        inNo: [{ required: true, message: '入库编号不能为空', trigger: 'blur' }],
        buyNo: [{ required: true, message: '购买证编号不能为空', trigger: 'blur' }],
        transportNo: [{ required: true, message: '运输证编号不能为空', trigger: 'blur' }],
        storageName: [{ required: true, message: '仓库名称不能为空', trigger: 'change' }],
        chemicalName: [{ required: true, message: '化学品名称不能为空', trigger: 'blur' }],
        inQuantity: [{ required: true, message: '入库数量不能为空', trigger: 'blur' }],
        unit: [{ required: true, message: '单位不能为空', trigger: 'blur' }],
        transportQuantity: [{ required: true, message: '起运数量不能为空', trigger: 'blur' }],
        transportUnit: [{ required: true, message: '起运单位不能为空', trigger: 'blur' }],
        lossQuantity: [{ required: true, message: '损耗数量不能为空', trigger: 'blur' }],
        lossQuantityUnit: [{ required: true, message: '损耗单位不能为空', trigger: 'blur' }],
        salesCompanyName: [{ required: true, message: '销售单位名称不能为空', trigger: 'blur' }],
        salesCompanyCode: [{ required: true, message: '销售信用代码不能为空', trigger: 'blur' }],
        transportCompanyName: [{ required: true, message: '运输单位名称', trigger: 'blur' }],
        transportCompanyCode: [
          { required: true, message: '运输信用代码不能为空', trigger: 'blur' },
        ],
        inDate: [{ required: true, message: '入库日期不能为空', trigger: 'change' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
        createTime: [{ required: true, message: '登记时间不能为空', trigger: 'change' }],
      },
      inputForm: {
        companyId: '',
        companyName: '',
        storageName: '',
        storageRealName: '',
      },
    }
  },
  created() {
    if (this.method !== 'add') {
      this.inputForm = JSON.parse(JSON.stringify(this.fromData))
    }
  },
  methods: {
    getCompanyId(valueId, valueTitle) {
      this.inputForm.companyId = valueId
      this.inputForm.companyName = valueTitle
      this.inputForm.storageName = ''
      this.inputForm.storageRealName = ''
    },
    getStorageName(valueId, valueTitle) {
      this.inputForm.storageName = valueId
      this.inputForm.storageRealName = valueTitle
    },
    // 提交表单数据
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          chemistryIntoAdd(this.inputForm)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('提交成功')
                this.closeClick(true, 'submit')
              }
              else {
                this.$message.warning(data.message || '提交失败')
              }
            })
            .catch((err) => {
              this.$message.error('提交出错', err)
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
    /* 关闭弹窗 */
    closeClick(isRefresh) {
      this.$emit('succ', isRefresh)
    },
  },
}
</script>

<template>
  <div>
    <el-form
      ref="inputForm"
      v-loading="loading"
      :inline="true"
      :model="inputForm"
      label-width="100px"
      :rules="method === 'view' ? {} : dataRule"
      :class="method === 'view' ? 'readonly' : ''"
      :disabled="method === 'view'"
      @submit.native.prevent
    >
      <el-form-item
        label="所属公司"
        prop="companyId"
      >
        <SelectTree
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
          @getValue="getCompanyId"
        />
      </el-form-item>
      <el-form-item
        label="入库编号"
        prop="inNo"
      >
        <el-input
          v-model="inputForm.inNo"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="销售出库编号"
        prop="salesOutNo"
      >
        <el-input
          v-model="inputForm.salesOutNo"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="购买证编号"
        prop="buyNo"
      >
        <el-input
          v-model="inputForm.buyNo"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="运输证编号"
        prop="transportNo"
      >
        <el-input
          v-model="inputForm.transportNo"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="仓库名称"
        prop="storageName"
      >
        <SelectTree
          ref="officeTree"
          class="small-box"
          :props="{
            value: 'id', // ID字段名
            label: 'departmentName', // 显示名称
            children: 'children', // 子级字段名
          }"
          :url="inputForm.companyId ? `sysDepartment/companyDepartment/${inputForm.companyId}` : ''"
          :value="inputForm.storageName"
          :clearable="true"
          :accordion="true"
          @getValue="getStorageName"
        />
      </el-form-item>
      <el-form-item
        label="化学品名称"
        prop="chemicalName"
      >
        <el-input
          v-model="inputForm.chemicalName"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="入库数量"
        prop="inQuantity"
      >
        <el-input
          v-model="inputForm.inQuantity"
          placeholder="请输入"
          clearable
          type="number"
        />
      </el-form-item>
      <el-form-item
        label="单位"
        prop="unit"
      >
        <el-input
          v-model="inputForm.unit"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="起运数量"
        prop="transportQuantity"
      >
        <el-input
          v-model="inputForm.transportQuantity"
          placeholder="请输入"
          clearable
          type="number"
        />
      </el-form-item>
      <el-form-item
        label="起运单位"
        prop="transportUnit"
      >
        <el-input
          v-model="inputForm.transportUnit"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="损耗数量"
        prop="lossQuantity"
      >
        <el-input
          v-model="inputForm.lossQuantity"
          placeholder="请输入"
          clearable
          type="number"
        />
      </el-form-item>
      <el-form-item
        label="损耗单位"
        prop="lossQuantityUnit"
      >
        <el-input
          v-model="inputForm.lossQuantityUnit"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="销售单位名称"
        prop="salesCompanyName"
      >
        <el-input
          v-model="inputForm.salesCompanyName"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="销售信用代码"
        prop="salesCompanyCode"
      >
        <el-input
          v-model="inputForm.salesCompanyCode"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="运输单位名称"
        prop="transportCompanyName"
      >
        <el-input
          v-model="inputForm.transportCompanyName"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="运输信用代码"
        prop="transportCompanyCode"
      >
        <el-input
          v-model="inputForm.transportCompanyCode"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="入库日期"
        prop="inDate"
      >
        <el-date-picker
          v-model="inputForm.inDate"
          value-format="yyyy-MM-DD"
          type="date"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      >
        <el-input
          v-model="inputForm.status"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="登记时间"
        prop="createTime"
      >
        <el-date-picker
          v-model="inputForm.createTime"
          value-format="yyyy-MM-DD hh:mm:ss"
          type="datetime"
          placeholder="选择日期时间"
          clearable
        />
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <span style="float: right">
        <el-button @click="closeClick(false)">关闭</el-button>
        <el-button
          v-if="method !== 'view'"
          v-noMoreClick
          type="primary"
          @click="doSubmit()"
        >确定保存</el-button>
      </span>
    </div>
  </div>
</template>

<style scoped></style>
