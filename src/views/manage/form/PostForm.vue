<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api'
import { getExtendJobInfo, saveExtendFn } from '@/http/safe-production/post-manage-api'
import { getSubordinateCompany } from '@/http/user-api.js'

export default {
  components: {
    SelectTree,
  },
  data() {
    // 验证所需证书的函数
    const validateCertificateType = (rule, value, callback) => {
      // 当活是否持证上岗为true且证书的数组为空，抛出错误，反之通过校验
      if (this.inputForm.needCertificate && this.inputForm.certificateType.length == 0) {
        callback(new Error('请选择所需证照'))
      }
      else {
        callback()
      }
    }
    return {
      visible: false,
      loading: false,
      method: '',
      title: '新增',
      inputForm: {
        companyId: '',
        departmentId: '',
        externalPlatformId: '',
        id: '', // id
        postName: '',
        needCertificate: true,
        certificateType: [],
        remarks: '', // 备注
        sortOrder: 99,
      },
      options: [
        {
          label: '是',
          value: true,
        },
        {
          label: '否',
          value: false,
        },
      ],
      departmentList: [],
      corporationList: [],
      permitList: [],
      dataRule: {
        postName: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        departmentId: [{ required: true, message: '所属部门不能为空', trigger: 'blur' }],
        needCertificate: [{ required: true, message: '是否持证上岗不能为空', trigger: 'blur' }],
        certificateType: [{ validator: validateCertificateType }],
      },
    }
  },
  created() {
    this.getSubordinateCompany()
    this.permitList = JSON.parse(sessionStorage.getItem('dictList')).zzlb
  },
  methods: {
    // 获取公司列表
    getSubordinateCompany() {
      getSubordinateCompany()
        .then(({ data }) => {
          if (data.success) {
            this.corporationList = data.result || []
          }
        })
        .catch((err) => {
          this.$message.error(err)
        })
    },
    // 通过公司查部门
    getAllDepartByCompany(companyId) {
      getAllDepartByCompanyFn(companyId)
        .then(({ data }) => {
          if (data.success) {
            this.departmentList = data.result || []
          }
        })
        .catch((err) => {
          this.$message.error(err)
        })
    },

    // 获取公司id
    getApplicantCorporationName(value) {
      this.inputForm.companyId = value
      this.getAllDepartByCompany(this.inputForm.companyId)
    },
    // 获取部门id
    getApplicantDeptName(value) {
      this.inputForm.departmentId = value
    },
    // 获取岗位扩展信息
    getExtendJobInfo() {
      getExtendJobInfo(this.inputForm.id)
        .then(({ data }) => {
          if (data.success) {
            this.inputForm = Object.assign({}, this.inputForm, data.result)
          }
        })
        .catch((err) => {
          this.$message.error(err)
        })
    },
    async init(method, id, row) {
      this.method = method
      this.inputForm.id = id
      if (method === 'add') {
        this.title = `新增岗位`
      }
      else if (method === 'edit') {
        this.title = '修改岗位'
      }
      else if (method === 'view') {
        this.title = '查看岗位'
      }
      this.visible = true
      this.$nextTick(async () => {
        this.$refs.inputForm.resetFields()
        if (this.inputForm.id) {
          const res = await getAllDepartByCompanyFn(row.companyId)
          this.departmentList = res.data.result
          this.$nextTick(() => {
            this.inputForm = this.recover(this.inputForm, row)
            this.getExtendJobInfo()
          })
        }
        else {
          this.inputForm.companyId = this.$store.state.user.user.companyId
          this.inputForm.departmentId = ''
          if (this.inputForm.companyId) {
            this.getAllDepartByCompany(this.inputForm.companyId)
          }
        }
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          saveExtendFn(this.inputForm).then(({ data }) => {
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
        size="small"
        :model="inputForm"
        :class="method === 'view' ? 'readonly' : ''"
        :disabled="method === 'view'"
        :rules="dataRule"
        label-width="110px"
        @submit.native.prevent
      >
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="所属公司"
              prop="companyId"
            >
              <SelectTree
                :props="{
                  value: 'id', // ID字段名
                  label: 'companyName', // 显示名称
                  children: 'children', // 子级字段名
                }"
                :list="corporationList"
                :value="inputForm.companyId"
                :clearable="true"
                :accordion="true"
                @getValue="
                  value => {
                    getApplicantCorporationName(value)
                  }
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="责任组织"
              prop="departmentId"
            >
              <SelectTree
                :props="{
                  value: 'id', // ID字段名
                  label: 'departmentName', // 显示名称
                  children: 'children', // 子级字段名
                }"
                :list="departmentList"
                :value="inputForm.departmentId"
                :clearable="true"
                :accordion="true"
                @getValue="
                  value => {
                    getApplicantDeptName(value)
                  }
                "
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="岗位名称"
              prop="postName"
            >
              <el-input
                v-model="inputForm.postName"
                clearable
                :rows="2"
                placeholder="请输入名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="排序号"
              prop="sortOrder"
            >
              <el-input-number
                v-model="inputForm.sortOrder"
                style="width: 100%"
                :step="1"
                controls-position="right"
                :min="0"
                label="排序号"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="是否持证上岗"
              prop="needCertificate"
            >
              <el-select
                v-model="inputForm.needCertificate"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="所需证照"
              prop="certificateType"
            >
              <el-select
                v-model="inputForm.certificateType"
                placeholder="请选择"
                style="width: 100%"
                multiple
                clearable
              >
                <el-option
                  v-for="item in permitList"
                  :key="item.value"
                  :label="item.dictName"
                  :value="item.dictName"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item
              label="岗位描述"
              prop="remarks"
            >
              <el-input
                v-model="inputForm.remarks"
                class="big-box"
                type="textarea"
                :rows="5"
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
::v-deep .el-dialog__body {
  padding-left: 0 !important;
}
</style>
