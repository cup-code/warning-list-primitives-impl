<script>
import ImageSelect from '@/components/ImageSelect'
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { upLoadImg } from '@/http/manage-api'
import { addQualificationFn } from '@/http/safe-production/qualification-manage-api'

export default {
  components: {
    SelectTree,
    ImageSelect,
  },
  data() {
    return {
      title: '新增',
      visible: false,
      loading: false,
      method: '',
      inputForm: {
        id: '',
        companyId: '', // 所属公司
        certificateNo: '', // 证书编号
        certificatePath: '', // 证书保存相对路径
        expirationDate: '', // 有效期止,格式:yyyy-MM-dd
        issuingAuthority: '', // 发证机构
        issuingDate: '', // 发证日期,格式:yyyy-MM-dd
        qualificationLevel: '', // 证照等级
        qualificationName: '', // 资格证照名称
        remarks: '', // 备注
      },
      dataRule: {
        companyId: [{ required: true, message: '所属企业不能为空', trigger: 'change' }],
        expirationDate: [{ required: true, message: '请选择有效期', trigger: 'change' }],
        issuingDate: [{ required: true, message: '请选择发证日期', trigger: 'change' }],
        issuingAuthority: [{ required: true, message: '发证机构不能为空', trigger: 'blur' }],
        qualificationName: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
      },
    }
  },
  created() {
    this.getPrefix()
  },
  methods: {
    init(method, obj) {
      this.method = method
      this.inputForm.id = obj.id
      this.inputForm.certificatePath = '' // 因为这个是通过v-if控制的，所以不能初始化为空，需手动赋值空
      this.visible = true
      if (method === 'add') {
        this.title = '新增企业资质'
      }
      else if (method === 'edit') {
        this.title = '编辑企业资质'
      }
      else if (method === 'view') {
        this.title = '查看企业资质'
      }
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields() // 只会重置表单输入的内容，不会重置id
        this.inputForm.companyId = this.$store.state.user.user.companyId // 如果是新增，默认公司为当前用户所属公司
        if (obj.id) {
          this.inputForm = this.recover(this.inputForm, obj)
        }
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          addQualificationFn(this.inputForm).then(({ data }) => {
            this.loading = false
            if (data && data.success) {
              this.$message.success(data.message)
              this.visible = false
              this.$emit('refreshDataList')
            }
            else {
              this.$message.error(data.message)
            }
          })
        }
      })
    },
    /* 图片选择回调 */
    fileChangeEvt(file) {
      if (file) {
        upLoadImg(file, 'COMPANY_BUSINESS_LICENSE_PATH').then(({ data }) => {
          if (data.success) {
            this.inputForm.certificatePath = data.result
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.inputForm.certificatePath = ''
      }
    },
  },
}
</script>

<template>
  <div>
    <el-dialog
      :title="title"
      :close-on-click-modal="false"

      width="60%"
      :visible.sync="visible"
      class="normal-dialog"
    >
      <el-form
        ref="inputForm"
        v-loading="loading"
        size="small"
        :inline="true"
        :model="inputForm"
        :rules="dataRule"
        label-width="100px"
        :class="method === 'view' ? 'readonly' : ''"
        :disabled="method === 'view'"
        @submit.native.prevent
      >
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="所属公司"
              prop="companyId"
            >
              <SelectTree
                ref="officeTree"
                :props="{
                  value: 'id', // ID字段名
                  label: 'companyName', // 显示名称
                  children: 'children', // 子级字段名
                }"
                url="sysCompany/getSubordinateCompany"
                :value="inputForm.companyId"
                :clearable="true"
                :accordion="true"
                @getValue="
                  value => {
                    inputForm.companyId = value
                  }
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="资质证照名称"
              prop="qualificationName"
            >
              <el-input v-model="inputForm.qualificationName" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="证照等级"
              prop="qualificationLevel"
            >
              <el-input v-model="inputForm.qualificationLevel" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="编号"
              prop="certificateNo"
            >
              <el-input v-model="inputForm.certificateNo" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="发证单位"
              prop="issuingAuthority"
            >
              <el-input v-model="inputForm.issuingAuthority" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="发证日期"
              prop="issuingDate"
            >
              <el-date-picker
                v-model="inputForm.issuingDate"
                type="date"
                placeholder="选择发证日期"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="有效日期"
              prop="expirationDate"
            >
              <el-date-picker
                v-model="inputForm.expirationDate"
                type="date"
                placeholder="选择有效日期"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item
              label="备注"
              prop="remarks"
            >
              <el-input
                v-model="inputForm.remarks"
                type="textarea"
                :rows="2"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="附件"
              prop="certificatePath"
            >
              <ImageSelect
                v-if="visible"
                :signUrl="inputForm.certificatePath ? filePrefix + inputForm.certificatePath : ''"
                width="100px"
                height="100px"
                @fileChange="fileChangeEvt"
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
  </div>
</template>

<style lang="scss" scoped>
.qualification-form ::v-deep {
  .el-dialog {
    margin-top: 10px !important;
    display: flex;
    flex-direction: column;
    height: 95%;
  }
  .el-dialog__body {
    padding: 5px 10px;
    overflow: auto;
  }
}
</style>
