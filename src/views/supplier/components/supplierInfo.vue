<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import { addSupplierCost } from '@/http/Supplier/Supplier-api.js'
import { ANALYSIS, STATUS_LIST } from '../constant'

export default {
  components: {
    TreeSelect,
  },
  props: {
    // 是否可编辑
    editable: {
      type: Boolean,
      default: true,
    },
    // 详情数据
    info: {
      type: Object,
      default() {
        return {}
      },
    },
    // 所属公司树数据
    companyData: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      isLoading: false,
      // 编辑的数据
      changeData: {},
      supplierTypeItem: ANALYSIS, // 供应商类型
      supplierStatuItem: STATUS_LIST, // 供应商状态
    }
  },
  created() {
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.getInfoData()
  },
  methods: {
    /* 获取详情数据 */
    getInfoData() {
      // 查看或修改
      if (this.info.id) {
        this.changeData = this.info
      }
      // 新增
      else {
        this.changeData = {
          companyId: '',
          companyName: '',
        }
      }
    },
    /* 下拉列表选择回调 */
    depChangeEvt(id, name) {
      this.changeData.companyId = id || ''
      this.changeData.companyName = name || ''
      this.$refs.treeSelect.closeSelect()
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.areaForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          addSupplierCost(this.changeData)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('保存成功')
                this.$emit('close', true)
              }
              else {
                this.$message.warning(res.data.message || '保存失败')
              }
            })
            .catch((err) => {
              this.$message.error('保存出错', err)
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
  },
}
</script>

<template>
  <div v-loading="isLoading">
    <el-form
      ref="areaForm"
      :model="changeData"
      label-width="120px"
      style="width: 800px"
      inline
      :disabled="!editable"
    >
      <el-form-item
        label="公司名称"
        prop="companyId"
        :rules="[{ required: true, message: '请选择事件类型', trigger: 'change' }]"
      >
        <TreeSelect
          ref="treeSelect"
          style="width: 250px"
          :data="companyData"
          :props="{
            value: 'id',
            label: 'companyName',
            children: 'childrenCompany',
          }"
          :value="changeData.companyId"
          :label="changeData.companyName"
          @getValue="depChangeEvt"
        />
      </el-form-item>
      <el-form-item
        label="供应商名称"
        prop="supplierName"
        :rules="[{ required: true, message: '请填写', trigger: 'change' }]"
      >
        <el-input
          v-model="changeData.supplierName"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="地址"
        prop="supplierAddress"
        :rules="[{ required: true, message: '请填写', trigger: 'change' }]"
      >
        <el-input
          v-model="changeData.supplierAddress"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="供应商法人"
        prop="supplierLegalPerson"
        :rules="[{ required: true, message: '请填写', trigger: 'change' }]"
      >
        <el-input
          v-model="changeData.supplierLegalPerson"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="法人电话"
        prop="supplierLegalPersonPhone"
        :rules="[
          { required: false, message: '请填写', trigger: 'change' },
          {
            pattern: /^(13[0-9]|14[01,4-9]|15[0-3,5-9]|16[5-7]|17[0135678]|18[0-9]|19[189])\d{8}$/,
            message: ' 请输入正确手机号/电话号',
            trigger: 'blur',
          },
        ]"
      >
        <el-input
          v-model="changeData.supplierLegalPersonPhone"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="安全负责人"
        prop="safetyDirector"
        :rules="[{ required: true, message: '请填写', trigger: 'change' }]"
      >
        <el-input
          v-model="changeData.safetyDirector"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="安全负责人电话"
        prop="safetyDirectorPhone"
        :rules="[
          { required: false, message: '请填写', trigger: 'change' },
          {
            pattern: /^(13[0-9]|14[01,4-9]|15[0-3,5-9]|16[5-7]|17[0135678]|18[0-9]|19[189])\d{8}$/,
            message: ' 请输入正确手机号/电话号',
            trigger: 'blur',
          },
        ]"
      >
        <el-input
          v-model="changeData.safetyDirectorPhone"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="供应商类型"
        prop="supplierType"
        :rules="{ required: true, message: '请选择', trigger: 'change' }"
      >
        <el-select
          v-model="changeData.supplierType"
          clearable
          style="width: 250px"
        >
          <el-option
            v-for="item in allDic.SupplierManagement_Type"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="供应商状态"
        prop="supplierStatus"
        :rules="{ required: true, message: '请选择', trigger: 'change' }"
      >
        <el-select
          v-model="changeData.supplierStatus"
          clearable
          style="width: 250px"
        >
          <el-option
            v-for="item in supplierStatuItem"
            :key="item.label"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="统一社会信用代码"
        prop="socialCode"
        :rules="[{ required: true, message: '请填写', trigger: 'change' }]"
      >
        <el-input
          v-model="changeData.socialCode"
          style="width: 250px"
        />
      </el-form-item>
      <!-- <el-form-item label="供应商资质证书" prop="checkTargets" :rules="[{ required: true, message: '请填写', trigger: 'change' }]">
        <el-input v-model="changeData.checkTargets" style="width: 250px" />
      </el-form-item> -->
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="changeData.remark"
          type="textarea"
          resize="none"
          :rows="4"
          style="width: 630px"
        />
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 20px 0 0"
        type="primary"
        plain
        @click="cancelClick"
      >
        取消
      </el-button>
      <el-button
        v-if="editable"
        size="medium"
        type="primary"
        @click="submitClick"
      >
        确认保存
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tips-box {
  width: 710px;
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
  border: 1px solid #e6a23c;
  border-radius: 5px;
  padding: 5px;
  font-size: 14px;
  i {
    margin: 0 10px 0 0;
  }
}
.collapse-icon {
  height: 20px;
  width: 6px;
  background: rgb(26, 26, 245);
}
.report-radio {
  .el-radio__label {
    font-size: 14px !important;
    padding-left: 5px !important;
  }
}
</style>
