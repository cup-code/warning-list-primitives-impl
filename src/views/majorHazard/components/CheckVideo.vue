<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { auditAlarmInfo } from '@/http/hkAi-api'
import { getCompanyList } from '@/http/safe-production/company-manage-api'
import {
  getAllDepartByCompanyFn,
  getDepartListSimple,
} from '@/http/safe-production/depart-manage-api'
import { getUsersByRoleFn } from '@/http/safe-production/user-manage-api'

export default {
  components: {
    SelectTree,
  },
  props: {
    // 详情id
    alarmInfoId: {
      type: [Number, String],
      default: '',
    },
    // 审核结果
    auditResult: {
      type: [Number, String],
      default: '',
    },
    // 图片地址
    pic: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      isLoading: false,
      // 规则校验
      formRules: {
        troubleTypeId: [{ required: true, message: '请选择隐患类型', trigger: 'change' }],
        hiddenDangerLevel: [{ required: true, message: '请选择隐患登记', trigger: 'change' }],
        location: [{ required: true, message: '请输入问题位置', trigger: 'blur' }],
        companyId: [{ required: true, message: '请选择所属公司', trigger: 'change' }],
        belongDepartmentId: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
        rectificationDepartmentId: [
          { required: true, message: '请选择整改部门', trigger: 'change' },
        ],
        rectificationUserId: [{ required: true, message: '请选择整改责任人', trigger: 'change' }],
        rectificationEndDate: [{ required: true, message: '请选择整改期限', trigger: 'blur' }],
      },
      // 表单数据
      formData: {
        troubleTypeId: '',
        hiddenDangerLevel: '',
        location: '',
        companyId: '',
        belongDepartmentId: '',
        rectificationDepartmentId: '',
        rectificationUserId: '',
        rectificationEndDate: '',
      },
      companyList: [], // 公司树列表
      departList: [], // 所属部门列表
      checkDepList: [], // 整改部门列表
      userList: [], // 人员列表
    }
  },
  created() {
    this.getParams()
  },
  methods: {
    /* 获取所需数据 */
    getParams() {
      const companyId = this.$store.state.user.user.companyId
      // 获取所属公司的选择列表：所有的公司
      getCompanyList().then((res) => {
        if (res.data.success) {
          this.companyList = res.data.result || []
        }
      })
      // 获取所属部门部门list：当前人公司的所有组织架构
      getAllDepartByCompanyFn(companyId).then((res) => {
        if (res.data.success) {
          this.departList = res.data.result || []
        }
      })
      // 获取整改部门list
      getDepartListSimple().then((res) => {
        if (res.data.success) {
          this.checkDepList = res.data.result || []
        }
      })
      // 获取人员列表 节点类型:0-公司;1-部门;2-岗位;3-用户
      getUsersByRoleFn().then((res) => {
        if (res.data.success) {
          this.userList = res.data.result.filter((item) => {
            return item.type === '3'
          })
        }
      })
    },
    /* 公司选择回调 */
    getAllDepartByCompany(val) {
      this.formData.companyId = val
      this.formData.belongDepartmentId = ''
      if (!val) {
        this.departList = []
      }
      getAllDepartByCompanyFn(val).then((res) => {
        this.departList = res.data.result || []
      })
    },
    /* 点击取消 */
    closeClick() {
      this.$emit('close', false)
    },
    /* 点击确认审核 */
    submitClick() {
      this.$refs.checkForm.validate((valid) => {
        if (!valid)
          return
        this.isLoading = true
        const params = {
          alarmInfoId: this.alarmInfoId,
          auditResult: this.auditResult,
          pic: this.pic,
          ...this.formData,
        }

        auditAlarmInfo(params)
          .then((res) => {
            if (res.data.success) {
              this.$message.success('审核成功!')
              this.$emit('close', true)
            }
            else {
              this.$message.warning(data.message || '审核失败')
            }
          })
          .catch((err) => {
            this.$message.error('审核出错！', err)
          })
          .finally(() => {
            this.isLoading = false
          })
      })
    },
  },
}
</script>

<template>
  <div v-loading="isLoading">
    <el-form
      ref="checkForm"
      :model="formData"
      :rules="formRules"
      label-width="85px"
      size="mini"
    >
      <div class="barSty">
        隐患信息
      </div>
      <el-form-item
        label="隐患类型"
        prop="troubleTypeId"
      >
        <el-select
          v-model="formData.troubleTypeId"
          placeholder="请选择"
          style="width: 100%"
        >
          <el-option
            v-for="item in $dictUtils.getDictList('troubleType_yhlx')"
            :key="item.dictCode"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="隐患等级"
        prop="hiddenDangerLevel"
      >
        <el-radio-group v-model="formData.hiddenDangerLevel">
          <el-radio
            v-for="item in $dictUtils.getDictList('hiddenDangerLevel')"
            :key="item.dictCode"
            :label="item.id"
          >
            {{ item.dictName }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="问题位置"
        prop="location"
      >
        <el-input
          v-model="formData.location"
          placeholder="问题位置"
        />
      </el-form-item>
      <el-form-item
        label="所属公司"
        prop="companyId"
      >
        <SelectTree
          :props="{
            value: 'id', // ID字段名
            label: 'companyName', // 显示名称
            children: 'children', // 子级字段名
          }"
          :list="companyList"
          :value="formData.companyId"
          :clearable="true"
          :accordion="true"
          @getValue="
            value => {
              getAllDepartByCompany(value)
            }
          "
        />
      </el-form-item>
      <el-form-item
        label="所属部门"
        prop="belongDepartmentId"
      >
        <SelectTree
          :props="{
            value: 'id', // ID字段名
            label: 'departmentName', // 显示名称
            children: 'children', // 子级字段名
          }"
          :list="departList"
          :value="formData.belongDepartmentId"
          :clearable="true"
          :accordion="true"
          @getValue="
            value => {
              formData.belongDepartmentId = value
            }
          "
        />
      </el-form-item>
      <el-form-item
        label="问题描述"
        prop="description"
      >
        <el-input
          v-model="formData.description"
          placeholder="问题描述"
          type="textarea"
          :rows="6"
        />
      </el-form-item>
      <div class="barSty">
        整改信息
      </div>
      <el-form-item
        label="整改部门"
        prop="rectificationDepartmentId"
      >
        <SelectTree
          :props="{
            value: 'id', // ID字段名
            label: 'departmentName', // 显示名称
            children: 'children', // 子级字段名
          }"
          :list="checkDepList"
          :value="formData.rectificationDepartmentId"
          :clearable="true"
          :accordion="true"
          @getValue="
            value => {
              formData.rectificationDepartmentId = value
            }
          "
        />
      </el-form-item>
      <el-form-item
        label="整改责任人"
        prop="rectificationUserId"
      >
        <el-select
          v-model="formData.rectificationUserId"
          placeholder="请选择"
          style="width: 100%"
          filterable
        >
          <el-option
            v-for="item in userList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="整改期限"
        prop="rectificationEndDate"
      >
        <el-date-picker
          v-model="formData.rectificationEndDate"
          type="date"
          placeholder="整改期限"
          style="width: 100%"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>

      <el-form-item
        label="整改意见"
        prop="rectificationOpinions"
      >
        <el-input
          v-model="formData.rectificationOpinions"
          placeholder="整改意见"
          type="textarea"
          :rows="6"
        />
      </el-form-item>
      <el-form-item>
        <TipBox des="提示：审核后，将无法进行修改，请确认后再保存" />
      </el-form-item>
    </el-form>

    <div class="dialog-footer">
      <el-button @click="closeClick">
        取消
      </el-button>
      <el-button
        type="primary"
        @click="submitClick"
      >
        确认审核
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
