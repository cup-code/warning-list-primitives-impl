/* * @Author: xiaorui 新增、查看目标配置详情弹框 * @Date: 2023-04-27 10:27:49 * @Last Modified by:
xiaorui * @Last Modified time: 2023-12-18 10:56:32 */
<script>
import SelectTree from '@/components/treeSelect/treeSelect'
import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api'
import { getPostByDepartmentId } from '@/http/safe-production/post-manage-api'
import {
  getTargetConfigDetailFn,
  saveTargetConfigFn,
} from '@/http/safeProductionTarget/safe-production-target-api'
import { getSubordinateCompany } from '@/http/user-api'
import ChooseTargetDialog from './chooseTargetDialog'

export default {
  components: {
    SelectTree,
    ChooseTargetDialog,
  },
  data() {
    return {
      visible: false,
      loading: false,
      method: '',
      title: '新增',
      inputForm: {
        id: '',
        companyId: '', // 公司id
        deptId: '', // 部门id
        postId: '', // 岗位id
        examItemList: [], // 目标配置项
        remark: '', // 备注
      },
      departmentList: [],
      companyList: [],
      postList: [],
      dataRule: {
        companyId: [{ required: true, message: '所属公司不能为空', trigger: 'change' }],
        deptId: [{ required: true, message: '所属部门不能为空', trigger: 'change' }],
        postId: [{ required: true, message: '岗位不能为空', trigger: 'change' }],
      },
    }
  },
  created() {
    this.getSubordinateCompany()
  },
  methods: {
    // 获取公司列表
    getSubordinateCompany() {
      getSubordinateCompany().then(({ data }) => {
        if (data.success) {
          this.companyList = data.result || []
        }
      })
    },
    // 通过公司查组织架构
    getAllDepartByCompany(companyId) {
      getAllDepartByCompanyFn(companyId).then(({ data }) => {
        if (data.success) {
          this.departmentList = data.result || []
        }
      })
    },

    // 获取公司id
    getApplicantCorporationName(value) {
      this.inputForm.companyId = value
      this.inputForm.deptId = ''
      this.inputForm.postId = ''
      if (value) {
        this.getAllDepartByCompany(value)
      }
    },
    // 获取部门id
    getApplicantDeptName(value) {
      this.inputForm.deptId = value
      this.inputForm.postId = ''
      if (value) {
        getPostByDepartmentId(value, true).then(({ data }) => {
          this.postList = data.result || []
        })
      }
    },
    async init(method, row = {}) {
      this.visible = true
      this.method = method
      this.inputForm.id = row.id || ''
      if (method === 'add') {
        this.title = `新建考核目标`
      }
      else if (method === 'edit') {
        this.title = '修改考核目标'
      }
      else if (method === 'view') {
        this.title = '查看考核目标'
      }
      this.$nextTick(async () => {
        this.$refs.inputForm.resetFields()
        if (this.inputForm.id) {
          this.loading = true
          const depRes = await getAllDepartByCompanyFn(row.companyId)
          this.departmentList = depRes.data.result || []
          const postRes = await getPostByDepartmentId(row.deptId, true)
          this.postList = postRes.data.result || []
          getTargetConfigDetailFn(this.inputForm.id)
            .then(({ data }) => {
              if (data && data.success) {
                this.inputForm = this.recover(this.inputForm, data.result)
              }
              else {
                this.$message.warning(data.message || '获取详情失败')
              }
            })
            .catch(() => {
              this.$message.error('获取详情失败')
            })
            .finally(() => {
              this.loading = false
            })
        }
        else {
          this.inputForm.companyId = this.$store.state.user.user.companyId
          this.inputForm.examItemList = []
          this.inputForm.deptId = ''
          if (this.inputForm.companyId) {
            this.getAllDepartByCompany(this.inputForm.companyId)
          }
        }
      })
    },
    // 添加自定义目标项
    addClick() {
      this.inputForm.examItemList.push({
        code: null,
        type: 1,
        name: '',
      })
    },
    // 选择考核目标
    chooseClick() {
      // 传值type为0的考核项
      const choosedTarget = this.inputForm.examItemList.filter((item) => {
        return item.type === 0
      })
      this.$refs.chooseTargetDialog.init(choosedTarget)
    },
    // 选择目标之后的回调
    setChooseTarget(val) {
      const customTarget = this.inputForm.examItemList.filter((item) => {
        return item.type === 1
      })
      this.inputForm.examItemList = val.concat(customTarget)
    },
    // 删除目标项
    deleteClick(index) {
      this.inputForm.examItemList.splice(index, 1)
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          saveTargetConfigFn(this.inputForm)
            .then(({ data }) => {
              if (data && data.success) {
                this.$message.success(data.message)
                this.visible = false
                this.$emit('refreshDataList')
              }
              else {
                this.$message.warning(data.message || '保存失败！')
              }
            })
            .catch(() => {
              this.$message.error('保存失败！')
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
    :title="title"
    :close-on-click-modal="false"

    :visible.sync="visible"
    class="normal-dialog"
    :append-to-body="true"
  >
    <el-form
      ref="inputForm"
      v-loading="loading"
      :model="inputForm"
      :disabled="method === 'view'"
      :rules="dataRule"
      label-width="100px"
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
              :list="companyList"
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
            prop="deptId"
          >
            <SelectTree
              :props="{
                value: 'id', // ID字段名
                label: 'departmentName', // 显示名称
                children: 'children', // 子级字段名
              }"
              :list="departmentList"
              :value="inputForm.deptId"
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
      <el-form-item
        label="岗位"
        prop="postId"
      >
        <el-select
          v-model="inputForm.postId"
          placeholder="请选择"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="item in postList"
            :key="item.id"
            :label="item.postName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="inputForm.remark"
          type="textarea"
          :rows="2"
        />
      </el-form-item>
      <el-button
        v-if="method !== 'view'"
        icon="el-icon-plus"
        type="primary"
        plain
        style="margin: 0 10px 10px 0"
        @click="chooseClick"
      >
        选择考核目标
      </el-button>
      <el-button
        v-if="method !== 'view'"
        icon="el-icon-plus"
        type="primary"
        plain
        style="margin-bottom: 10px"
        @click="addClick"
      >
        新增自定义考核目标
      </el-button>
      <el-table
        :data="inputForm.examItemList"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        highlight-current-row
      >
        <el-table-column
          label="序号"
          type="index"
          width="50"
        />
        <el-table-column
          align="center"
          label="考核目标"
          min-width="130"
        >
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.name"
              type="textarea"
              :rows="3"
              :disabled="scope.row.type === 0"
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="method !== 'view'"
          label="操作"
          align="center"
          width="100"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              style="color: var(--ky-danger)"
              type="text"
              @click="deleteClick(scope.$index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        style="margin: 0 10px 0 0"
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
    <choose-target-dialog
      ref="chooseTargetDialog"
      @setChooseTarget="setChooseTarget"
    />
  </el-dialog>
</template>
