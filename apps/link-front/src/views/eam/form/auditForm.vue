/* * @Author: xiaorui 异常记录审核的弹框 * @Date: 2022-05-20 14:52:01 * @Last Modified by: xiaorui *
@Last Modified time: 2022-08-10 18:46:51 */
<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { submitAuditFn } from '@/http/dev_new/inspection-api'
import { getCompanyList } from '@/http/safe-production/company-manage-api'
import {
  getAllDepartByCompanyFn,
  getDepartListSimple,
} from '@/http/safe-production/depart-manage-api'
import { getUsersByRoleFn } from '@/http/safe-production/user-manage-api'
import PickPeople from '@/views/common-ui/PickPeople.vue'

export default {
  components: {
    PickPeople,
    SelectTree,
  },
  data() {
    return {
      visible: false,
      loading: false,
      peopleProp: {},
      showPeopleDialog: false,
      baseInfo: {
        planName: '',
        executeUsername: '',
        postName: '',
        executeDate: '',
      },
      inputForm: {
        executeRecordId: '',
        auditResult: '0', // 审核结果.误报:0;问题:1;安全隐患:2;直接处理:3
        companyId: '', // 所属公司id
        belongDepartmentId: '', // 所属部门id
        description: '', // 问题或隐患描述
        hiddenDangerLevel: '', // 隐患等级,数据字典
        location: '', // 问题或隐患位置
        rectificationDepartmentId: '', // 整改部门id
        rectificationUserId: '', // 整改责任人id
        rectificationUserName: '', // 整改责任人名称
        rectificationEndDate: '', // 整改期限
        rectificationOpinions: '', // 整改意见
        dealMeasure: '', // 处置措施
        workOrderType: '', // 工单类型
      },
      dataRule: {
        companyId: [{ required: true, message: '所属公司不能为空', trigger: 'change' }],
        belongDepartmentId: [{ required: true, message: '所属部门不能为空', trigger: 'change' }],
        location: [{ required: true, message: '位置不能为空', trigger: 'blur' }],
        hiddenDangerLevel: [{ required: true, message: '隐患等级不能为空', trigger: 'change' }],
        rectificationDepartmentId: [
          { required: true, message: '整改部门不能为空', trigger: 'change' },
        ],
        rectificationUserId: [{ required: true, message: '整改责任人不能为空', trigger: 'change' }],
        rectificationEndDate: [{ required: true, message: '整改期限不能为空', trigger: 'change' }],
        dealMeasure: [{ required: true, message: '处置措施不能为空', trigger: 'blur' }],
        workOrderType: [{ required: true, message: '工单类型不能为空', trigger: 'change' }],
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now()
        },
      },
      companyList: [], // 所属公司list：所属公司默认为当前人的公司，可以选择其他公司
      departList: [], // 所属部门list
      departList02: [], // 整改部门list：登录用户拥有的部门权限list
      userList: [], // 整改责任人list：整改负责人，可以选当前权限公司所有人
    }
  },
  created() {
    this.companyId = this.$store.state.user.user.companyId
    // 获取所属公司的选择列表：所有的公司
    getCompanyList().then(({ data }) => {
      this.companyList = data.result || []
    })
    // 获取所属部门部门list：当前人公司的所有组织架构
    getAllDepartByCompanyFn(this.companyId).then(({ data }) => {
      this.departList = data.result || []
    })
    // 获取整改部门list
    getDepartListSimple().then(({ data }) => {
      this.departList02 = data.result || []
    })
    getUsersByRoleFn().then(({ data }) => {
      // 节点类型:0-公司;1-部门;2-岗位;3-用户
      this.userList = data.result.filter((item) => {
        return item.type === '3'
      })
    })
    this.levelList = this.$dictUtils.getDictList('hiddenDangerLevel').filter((item) => {
      return item.dictCode !== '6'
    })
    // 如果是问题类型的，需要获取到数组字典里隐患等级中-问题的code
    this.issueId = (
      this.$dictUtils.getDictList('hiddenDangerLevel').find((item) => {
        return item.dictCode === '6'
      }) || {}
    ).dictCode
  },
  methods: {
    init(obj) {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.inputForm.clearValidate()
        this.inputForm = {
          executeRecordId: obj.executeRecordId,
          auditResult: '0', // 审核结果.误报:0;问题:1;安全隐患:2;直接处理:3
          companyId: this.companyId, // 所属公司id
          belongDepartmentId: '', // 所属部门id
          description: '', // 问题或隐患描述
          hiddenDangerLevel: '', // 隐患等级,数据字典
          location: '', // 问题或隐患位置
          rectificationDepartmentId: '', // 整改部门id
          rectificationUserId: '', // 整改责任人id
          rectificationEndDate: '', // 整改期限
          rectificationOpinions: '', // 整改意见
        }
        this.baseInfo = this.recover(this.baseInfo, obj)
      })
    },
    getAllDepartByCompany(val) {
      this.inputForm.companyId = val
      if (!val) {
        this.departList = []
      }
      getAllDepartByCompanyFn(val).then(({ data }) => {
        this.departList = data.result || []
      })
      // 获取整改部门list
      getDepartListSimple().then(({ data }) => {
        this.departList02 = data.result || []
      })
      getUsersByRoleFn().then(({ data }) => {
        // 节点类型:0-公司;1-部门;2-岗位;3-用户
        this.userList = data.result.filter((item) => {
          return item.type === '3'
        })
      })
      this.levelList = this.$dictUtils.getDictList('hiddenDangerLevel').filter((item) => {
        return item.dictCode !== '6'
      })
      // 如果是问题类型的，需要获取到数组字典里隐患等级中-问题的code
      this.issueId = (
        this.$dictUtils.getDictList('hiddenDangerLevel').find((item) => {
          return item.dictCode === '6'
        }) || {}
      ).dictCode
    },
    // 选择人员
    onSelect() {
      this.peopleProp.oldPickData = {
        id: this.inputForm.rectificationUserId || '',
        fullName: this.inputForm.rectificationUserName || '',
      }
      this.peopleProp.isSingle = true
      this.peopleProp.listType = 'role'
      this.peopleProp.withoutChildrenDepartment = true
      this.showPeopleDialog = true
    },
    // 已选人员
    closePeopleEvt(e) {
      if (e) {
        this.inputForm.rectificationUserId = e.data.id
        this.inputForm.rectificationUserName = e.data.fullName
      }
      this.showPeopleDialog = false
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          // 如果类型是问题，则隐患等级需加上数据字典中‘问题’的id
          if (this.inputForm.auditResult === '1') {
            this.inputForm.hiddenDangerLevel = this.issueId
          }
          submitAuditFn(this.inputForm).then(({ data }) => {
            this.loading = false
            if (data && data.success) {
              this.$message.success(data.message)
              this.visible = false
              this.$emit('refreshDataList')
            }
            else {
              this.$message.error(data.message || '提交失败')
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
      title="审核设备巡检异常记录"
      :close-on-click-modal="false"
      width="700px"

      :visible.sync="visible"
      class="normal-dialog"
    >
      <el-form
        ref="inputForm"
        v-loading="loading"
        inline
        :model="inputForm"
        :rules="dataRule"
        label-width="80px"
        @submit.native.prevent
      >
        <el-form-item label="计划名称">
          <el-input
            v-model="baseInfo.planName"
            disabled
          />
        </el-form-item>
        <el-form-item label="巡检岗位">
          <el-input
            v-model="baseInfo.postName"
            disabled
          />
        </el-form-item>
        <el-form-item label="巡检人员">
          <el-input
            v-model="baseInfo.executeUsername"
            disabled
          />
        </el-form-item>
        <el-form-item label="异常时间">
          <el-input
            v-model="baseInfo.executeDate"
            disabled
          />
        </el-form-item>
        <el-form-item
          label="审核结果"
          prop="auditResult"
        >
          <el-radio-group v-model="inputForm.auditResult">
            <el-radio-button label="0">
              误报
            </el-radio-button>
            <el-radio-button label="1">
              问题
            </el-radio-button>
            <el-radio-button label="2">
              安全隐患
            </el-radio-button>
            <el-radio-button label="3">
              直接处理
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <br>
        <el-form-item
          v-if="inputForm.auditResult === '1' || inputForm.auditResult === '2'"
          label="问题位置"
          prop="location"
        >
          <el-input v-model="inputForm.location" />
        </el-form-item>
        <el-form-item
          v-if="inputForm.auditResult === '2'"
          label="隐患等级"
          prop="hiddenDangerLevel"
        >
          <el-radio-group v-model="inputForm.hiddenDangerLevel">
            <el-radio
              v-for="item in levelList"
              :key="item.dictCode"
              :label="item.dictCode"
            >
              {{ item.dictName }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="inputForm.auditResult === '1' || inputForm.auditResult === '2'"
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
            :value="inputForm.companyId"
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
          v-if="inputForm.auditResult === '1' || inputForm.auditResult === '2'"
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
            :value="inputForm.belongDepartmentId"
            :clearable="true"
            :accordion="true"
            @getValue="
              value => {
                inputForm.belongDepartmentId = value
              }
            "
          />
        </el-form-item>
        <el-form-item
          v-if="inputForm.auditResult === '1' || inputForm.auditResult === '2'"
          label="问题描述"
          prop="description"
        >
          <el-input
            v-model="inputForm.description"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            style="width: 400px"
          />
        </el-form-item>
        <el-form-item
          v-if="inputForm.auditResult === '1' || inputForm.auditResult === '2'"
          label="整改部门"
          prop="rectificationDepartmentId"
        >
          <SelectTree
            :props="{
              value: 'id', // ID字段名
              label: 'departmentName', // 显示名称
              children: 'children', // 子级字段名
            }"
            :list="departList02"
            :value="inputForm.rectificationDepartmentId"
            :clearable="true"
            :accordion="true"
            @getValue="
              value => {
                inputForm.rectificationDepartmentId = value
              }
            "
          />
        </el-form-item>

        <el-form-item
          v-if="inputForm.auditResult === '1' || inputForm.auditResult === '2'"
          label="整改责任人"
        >
          <el-input
            v-model="inputForm.rectificationUserName"
            placeholder="请选择人员"
            readonly
            @focus="onSelect"
          />
        </el-form-item>
        <el-form-item
          v-if="inputForm.auditResult === '1' || inputForm.auditResult === '2'"
          label="整改期限"
          prop="rectificationEndDate"
        >
          <el-date-picker
            v-model="inputForm.rectificationEndDate"
            type="date"
            :picker-options="pickerOptions"
            placeholder="选择整改期限"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item
          v-if="inputForm.auditResult === '1' || inputForm.auditResult === '2'"
          label="整改意见"
          prop="rectificationOpinions"
        >
          <el-input
            v-model="inputForm.rectificationOpinions"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            style="width: 400px"
          />
        </el-form-item>
        <el-form-item
          v-if="inputForm.auditResult === '3'"
          label="工单类型"
          prop="workOrderType"
        >
          <el-radio-group v-model="inputForm.workOrderType">
            <el-radio
              v-for="item in $dictUtils.getDictList('back_type')"
              :key="item.dictCode"
              :label="item.dictName"
            />
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="inputForm.auditResult === '3'"
          label="处置措施"
          prop="dealMeasure"
        >
          <el-input
            v-model="inputForm.dealMeasure"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            style="width: 400px"
          />
        </el-form-item>
      </el-form>
      <el-tag type="warning">
        提示：审核后将无法进行修改，请确认后保存
      </el-tag>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          size="small"
          @click="visible = false"
        >关闭</el-button>
        <el-button
          size="small"
          type="primary"
          :loading="loading"
          @click="doSubmit()"
        >确定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      class="fixed-dialog"
      title="选择人员"
      :visible.sync="showPeopleDialog"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <PickPeople
        v-if="showPeopleDialog"
        v-bind="peopleProp"
        @close="closePeopleEvt"
      />
    </el-dialog>
  </div>
</template>
