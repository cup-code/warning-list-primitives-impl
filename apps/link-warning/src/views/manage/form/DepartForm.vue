<script>
import SelectTree from '@/components/treeSelect/treeSelect'
import {
  addDepart,
  getDepListByOaCompanyId,
  saveDepartStaffing,
} from '@/http/safe-production/depart-manage-api'

export default {
  components: {
    SelectTree,
  },
  props: {
    headerOptions: Array,
  },
  data() {
    return {
      visible: false,
      loading: false,
      method: '',
      inputForm: {
        id: '',
        companyId: '', // 所属企业
        departmentType: 'FACTORY', // 部门类型
        parentId: '', // 上级部门
        departmentName: '', // 部门名称
        safetyDuty: '', // 安全职责
        sort: 30,
        enable: true, // 是否启用
        externalPlatformId: '', // 外部平台id
      },
      externalPlatFormList: [], // 外部平台数据列表
      dataRule: {
        companyId: [{ required: true, message: '所属企业不能为空', trigger: 'change' }],
        departmentName: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        parentId: [{ required: true, message: '所属部门不能为空', trigger: 'change' }],
        departmentType: [{ required: true, message: '部门类型不能为空', trigger: 'change' }],
      },
      currentParentbusinessType: [],
      applicantListShow: [],
    }
  },
  mounted() {
    setTimeout(() => {
      this.filterUserList()
    }, 500)
  },
  methods: {
    selectCompany(value, title, data) {
      this.inputForm.companyId = value
      this.inputForm.externalPlatformId = ''
      if (data) {
        const companyExternalPlatformId = data.externalPlatformId || ''
        getDepListByOaCompanyId(companyExternalPlatformId)
          .then(({ data }) => {
            if (data.success) {
              this.externalPlatFormList = data.result
            }
            else {
              this.$message.warning(res.data.message || '获取绑定oa列表失败')
            }
          })
          .catch((err) => {
            this.$message.error('获取绑定oa列表出错', err)
          })
      }
    },
    selectParent(value, title, data) {
      if (!data)
        return
      if (data.departmentType === 'CONTRACTOR') {
        this.inputForm.parentId = ''
        this.$message.warning('承包商类型不可做为上级')
        return
      }
      this.inputForm.parentId = value
      this.currentParentbusinessType
        = data.departmentType === 'COMPANY' ? ['1', '2', '3', '4'] : data.businessTypeList
      this.inputForm.businessTypeList = []
    },
    filterUserList(val) {
      if (!val) {
        // 列表中展示的人员
        this.applicantListShow = this.headerOptions.slice(0, 30) // 如果之前设置了人员，需要把设置的人员信息加入展示列表中，为了回显
      }
      else {
        const result = this.headerOptions.filter((item) => {
          return item.fullName.includes(val)
        }) // 存储符合条件的下拉选项
        this.applicantListShow = result.slice(0, 30) // 只取前30个
      }
    },
    init(method, obj) {
      this.method = method
      this.inputForm.id = obj.id
      this.visible = true
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        if (method === 'addChild') {
          this.inputForm.companyId = obj.parent.companyId
          this.inputForm.parentId = obj.parent.id
          // 如果上级部门是公司类型，则可选所有的业务类型，否则只可选上级部门的业务类型之内的
          this.currentParentbusinessType
            = obj.parent.departmentType === 'COMPANY'
              ? ['1', '2', '3', '4']
              : obj.parent.businessTypeList
        }
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          const userStaffing = []
          // 保存部门扩展信息
          addDepart(this.inputForm).then(({ data }) => {
            this.loading = false
            if (data && data.success) {
              this.$message.success(data.message || '保存成功')
              const param = {
                deptId: data.result,
                userStaffing,
              }
              saveDepartStaffing(param).then(({ data }) => {
                this.visible = false
              })
              this.$emit('refreshDataList')
            }
            else {
              this.$message.warning(data.message || '保存失败')
            }
          })
        }
      })
    },
    closeFn() {
      this.$refs.inputForm.resetFields()
    },
  },
}
</script>

<template>
  <div>
    <el-dialog
      title="新增组织"
      :close-on-click-modal="false"

      :visible.sync="visible"
      class="depart-form normal-dialog"
      @close="closeFn"
    >
      <el-form
        ref="inputForm"
        v-loading="loading"
        size="small"
        :model="inputForm"
        :rules="dataRule"
        label-width="100px"
        @submit.native.prevent
      >
        <el-form-item
          label="所属企业"
          prop="companyId"
        >
          <SelectTree
            v-if="visible"
            :props="{
              value: 'id', // ID字段名
              label: 'companyName', // 显示名称
              children: 'children', // 子级字段名
            }"
            url="sysCompany/getSubordinateCompany"
            :value="inputForm.companyId"
            :clearable="true"
            :accordion="true"
            @getValue="selectCompany"
          />
        </el-form-item>
        <el-form-item
          label="所属类型"
          prop="departmentType"
        >
          <el-radio-group v-model="inputForm.departmentType">
            <el-radio-button
              v-for="item in $dictUtils.getDictList('depart_type')"
              :key="item.id"
              :disabled="item.dictCode === 'COMPANY' || item.dictCode === 'CONTRACTOR'"
              :label="item.dictCode"
            >
              {{ item.dictName }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="上级部门"
          prop="parentId"
        >
          <SelectTree
            v-if="visible"
            ref="officeTree"
            :props="{
              value: 'id', // ID字段名
              label: 'departmentName', // 显示名称
              children: 'children', // 子级字段名
            }"
            :url="
              inputForm.companyId ? `sysDepartment/companyDepartment/${inputForm.companyId}` : ''
            "
            :value="inputForm.parentId"
            :clearable="true"
            :accordion="true"
            @getValue="selectParent"
          />
        </el-form-item>
        <el-form-item
          label="名称"
          prop="departmentName"
        >
          <el-input v-model="inputForm.departmentName" />
        </el-form-item>

        <el-form-item
          label="安全职责"
          prop="safetyDuty"
        >
          <el-input
            v-model="inputForm.safetyDuty"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </el-form-item>
        <el-form-item
          label="绑定oa部门"
          prop="externalPlatformId"
        >
          <el-select
            v-model="inputForm.externalPlatformId"
            clearable
            filterable
          >
            <el-option
              v-for="item in externalPlatFormList"
              :key="item.departmentid"
              :value="item.departmentid"
              :label="item.shortname"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="排序号"
          prop="sort"
        >
          <el-input-number
            v-model="inputForm.sort"
            :step="1"
            controls-position="right"
            :min="0"
            label="排序号"
          />
        </el-form-item>
        <el-form-item
          label="启用"
          prop="enable"
        >
          <el-switch v-model="inputForm.enable" />
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

<style lang="scss">
.depart-form .el-dialog {
  margin-top: 10px !important;
}

.depart-form .el-dialog__body {
  padding: 10px 20px;
}
</style>
