/* * @Author: wangyang * @Date: 2023-03-22 11:51:10 * @Last Modified by: wangyang * @Last Modified
time: 2023-03-22 18:15:50 */
<script>
import { setTimeout } from 'timers'
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import {
  confirmApplication,
  getByEntityId,
  getChangeReviewDetail,
  uploadFileList,
} from '@/http/changeManagement/changeManagement-api'
import {
  getAllDepartByCompanyFn,
  getAllUsersByTenant,
} from '@/http/safe-production/depart-manage-api'
import { getSubordinateCompany } from '@/http/user-api.js'
import FileUpload from '@/views/common-ui/FileUpload.vue'

export default {
  name: '',
  components: {
    SelectTree,
    FileUpload,
  },
  props: {
    id: {
      type: String,
      default: '',
    },
    method: {
      type: String,
      default: '',
    },
    recordData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      isLoading: false,
      isShow: false,
      dataRule: {
        companyId: [{ required: true, message: '公司不能为空', trigger: 'change' }],
        departmentId: [{ required: true, message: '请选择申请部门', trigger: 'change' }],
        changeType: [{ required: true, message: '请选择变更类型', trigger: 'change' }],
        projectName: [{ required: true, message: '项目名称不能为空', trigger: 'change' }],
        dutyPerson: [{ required: true, message: '项目责任人不能为空', trigger: 'change' }],
        fourProperties: [{ required: true, message: '请选择四新性质', trigger: 'change' }],
        changeLevel: [{ required: true, message: '请选择变更层级', trigger: 'change' }],
        assessPerson: [{ required: true, message: '请选择评审人', trigger: 'change' }],
      },
      // 选择列表数据
      corporationList: [], // 公司列表
      departmentList: [], // 部门列表
      changeTypeList: [], // 变更类型
      fourNewPropertiesList: [
        {
          name: '新技术',
          value: 1,
        },
        {
          name: '新工艺',
          value: 2,
        },
        {
          name: '新材料',
          value: 3,
        },
        {
          name: '新设备',
          value: 4,
        },
      ],
      changeLevelList: [
        {
          name: '部门级',
          value: 1,
        },
        {
          name: '工厂级',
          value: 2,
        },
        {
          name: '集团级',
          value: 3,
        },
      ],
      applicantList: [], // 评审人列表
      applicantListShow: [], // 展示评审人列表
      // From表单数据
      inputForm: {
        applyRef: '',
        companyId: '', // 公司id
        companyName: '', // 公司名称
        departmentId: '', // 申请部门Id
        departmentName: '', // 部门名称
        projectName: '', // 项目名称
        dutyPerson: '', // 项目责任人
        changeType: '工艺', // 变更类型
        fourProperties: 1, // 四新性质
        changeLevel: 1, // 变更层级
        assessPerson: [], // 评审人
        investMoney: '', // 投资
        remark: '', // 备注
        hazardAssessment: '', // 危险性评价
      },

      startStopTime: '',
      entityId: '',
      // 文件上传组件传参
      fileProp: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
        deleteFront: true,
        editable: this.method === 'add',
      },
      filesList: [],
      tableData: [], // 表单数据
      todoTaskId: '',
      todoTaskId: '',
      approvalData: {
        approvalComments: '',
        id: '',
        todoTaskId: '',
      },
    }
  },
  watch: {},
  created() {
    this.changeTypeList = JSON.parse(sessionStorage.getItem('dictList')).CHANGE_TYPE

    if (this.method !== 'add') {
      setTimeout(() => {
        if (this.method == 'reviewView' || this.method == 'review') {
          this.getChangeReviewDetail()
        }
        else {
          const obj = JSON.parse(JSON.stringify(this.recordData))
          if (obj.reviewDetailsVO.changeApplyVO.companyId) {
            this.getAllDepartByCompanyFn(obj.reviewDetailsVO.changeApplyVO.companyId)
          }
          setTimeout(() => {
            this.inputForm = obj.reviewDetailsVO.changeApplyVO
            if (this.inputForm) {
              this.filterUserList()
              this.getByEntityId()
            }
          }, 200)
        }
      }, 800)
    }
    else {
      const user = this.$store.state.user.user
      Promise.all([getSubordinateCompany(), getAllDepartByCompanyFn(user.companyId)]).then((res) => {
        this.corporationList = res[0].data.result || []
        this.departmentList = res[1].data.result || []
        setTimeout(() => {
          this.getPersonLogin()
        }, 100)
      })
    }
    this.getApplicantList()
    this.getSubordinateCompany()
  },
  methods: {
    // 通过四新评审-查看 获取申请基本信息
    getChangeReviewDetail() {
      getChangeReviewDetail(this.id).then(({ data }) => {
        if (data.success) {
          this.inputForm = data.result.changeApplyVO
          this.getByEntityId()
          this.filterUserList()
        }
      })
    },
    // 获取公司列表
    getSubordinateCompany() {
      getSubordinateCompany().then(({ data }) => {
        if (data.success) {
          this.corporationList = data.result || []
          if (this.method == 'reviewView' || this.method == 'review') {
            const querys = this.$route.query
            for (const key of this.corporationList) {
              if (key.companyName == querys.companyName) {
                this.getAllDepartByCompanyFn(key.id)
              }
            }
          }
        }
      })
    },
    // 通过公司查部门
    getAllDepartByCompanyFn(companyId) {
      getAllDepartByCompanyFn(companyId).then(({ data }) => {
        if (data.success) {
          this.departmentList = data.result || []
        }
        else {
          this.$message.warning(data.message || '获取部门列表数据失败')
        }
      })
    },
    // 获取评审人
    getApplicantList() {
      const tenantId = this.$store.state.user.user.tenantId
      getAllUsersByTenant(tenantId)
        .then(({ data }) => {
          if (data.success) {
            this.applicantList = data.result || []
            this.filterUserList()
          }
          else {
            this.$message.warning(data.message || '获取申请人列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取申请人列表失败', err)
        })
    },
    // 获取当前登录人
    getPersonLogin() {
      const user = this.$store.state.user.user
      this.inputForm.companyId = user.companyId
      this.inputForm.companyName = user.companyName

      this.inputForm.departmentId = user.departmentId
      this.inputForm.departmentName = user.departmentName
    },

    filterUserList(val) {
      if (!val) {
        // 列表中展示的人员
        this.applicantListShow = this.applicantList.slice(0, 10) // 如果之前设置了人员，需要把设置的人员信息加入展示列表中，为了回显

        if (this.inputForm.dutyPerson) {
          const dutyPersonUser = this.applicantList.find((item) => {
            return item.id === this.inputForm.dutyPerson
          })
          if (!this.applicantListShow.includes(dutyPersonUser)) {
            this.applicantListShow.push(dutyPersonUser)
          }
        }

        if (this.inputForm.assessPerson) {
          for (const key of this.inputForm.assessPerson) {
            if (key) {
              const assessorId = this.applicantList.find((item) => {
                return item.id === key
              })
              if (!this.applicantListShow.includes(assessorId)) {
                this.applicantListShow.push(assessorId)
              }
            }
          }
        }
      }
      else {
        const result = this.applicantList.filter((item) => {
          return item.fullName.includes(val)
        }) // 存储符合条件的下拉选项
        this.applicantListShow = result.slice(0, 10) // 只取前10个
      }
    },
    confirmSelection(type, e) {
      switch (type) {
        case '项目负责人':
          this.applicantList.filter((item) => {
            if (e == item.id) {
              this.inputForm.dutyPerson = item.id
            }
          })
          break
        case '评审人':
          this.applicantList.filter((item) => {
            if (e == item.id) {
              this.inputForm.assessPerson[0] = item.id
            }
          })
          break
        case '工厂评审人':
          this.applicantList.filter((item) => {
            if (e == item.id) {
              this.inputForm.assessPerson[1] = item.id
            }
          })
          break
        case '公司评审人':
          this.applicantList.filter((item) => {
            if (e == item.id) {
              this.inputForm.assessPerson[2] = item.id
            }
          })
          break
      }
    },
    // 获取公司id
    getApplicantCorporationName(value) {
      this.inputForm.companyId = value
      this.corporationList.filter((item) => {
        if (value === item.id) {
          this.inputForm.companyName = item.companyName
        }
      })
      this.getAllDepartByCompanyFn(this.inputForm.companyId)
    },
    // 获取申请部门名称
    getApplicantDeptName(val) {
      if (val) {
        this.inputForm.departmentId = val
        this.departmentList.filter((item) => {
          if (val == item.id) {
            this.inputForm.departmentName = item.departmentName
          }
        })
      }
    },

    // 提交表单数据
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          this.$confirm('确认申请将无法修改信息,确认修改?', '提示', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
          })
            .then(() => {
              confirmApplication(this.inputForm)
                .then(({ data }) => {
                  if (data.success) {
                    this.$message.success('提交成功')
                    this.entityId = data.message || ''
                    if (this.entityId) {
                      this.uploadFile()
                    }
                    this.jumpOut()
                  }
                  else {
                    this.$message.warning(data.message || '提交失败')
                  }
                })
                .finally(() => {
                  this.isLoading = false
                })
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
    /* 跳出 */
    jumpOut() {
      this.$router.back()
    },
    getPersonnelList() {
      this.filterUserList()
    },
    /* 文件上传回调 */
    uploadEvt(fileList) {
      this.filesList = this.fdeWeight(fileList)
    },
    // 上传附件去重
    fdeWeight(arr) {
      for (let i = 0; i < arr.length - 1; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          if (arr[i].name == arr[j].name) {
            this.$message.error('请勿重复提交')
            arr.splice(j, 1)
            // 因为数组长度减小1，所以直接 j++ 会漏掉一个元素，所以要 j--
            j--
          }
        }
      }
      return arr
    },
    /* 文件上传 */
    uploadFile() {
      const upFileData = {
        files: this.filesList,
        entityId: this.entityId,
        businessName: 'change_request',
        categoryName: 'application_attachment',
      }
      this.isLoading = true
      uploadFileList(upFileData)
        .then(({ data }) => {
          if (data.success) {
          }
          else {
            this.$message.warning(data.message || '文件上传失败')
          }
        })
        .catch((err) => {
          this.$message.error('文件上传出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    // 获取上传附件
    getByEntityId() {
      getByEntityId(this.inputForm.id).then(({ data }) => {
        this.fileProp.oldFileList = data.result.map((res) => {
          return {
            attachmentName: res.originalName,
            filePath: res.urlPath,
          }
        })
      })
    },
  },
}
</script>

<template>
  <div class="fromClass">
    <el-form
      ref="inputForm"
      v-loading="isLoading"
      :inline="true"
      class="form-box"
      :model="inputForm"
      :rules="dataRule"
      label-width="100px"
      @submit.native.prevent
    >
      <div style="display: flex; align-items: center; justify-content: space-between">
        <h3 class="title-box">
          基本信息
        </h3>
        <span>
          <el-button
            v-show="method == 'add'"
            type="primary"
            :loading="isLoading"
            :disabled="method != 'add'"
            icon="el-icon-check"
            @click="doSubmit()"
          >提交</el-button>
          <el-button
            icon="el-icon-refresh-right"
            @click="jumpOut()"
          >退出</el-button>
        </span>
      </div>
      <div id="basicInformationBox">
        <el-form-item
          label="变更编号"
          prop="applyRef"
        >
          <el-input
            v-model="inputForm.applyRef"
            class="big-box"
            :rows="5"
            disabled
          />
        </el-form-item>
        <el-form-item
          label="公司"
          prop="companyId"
        >
          <SelectTree
            class="small-box"
            :props="{
              value: 'id', // ID字段名
              label: 'companyName', // 显示名称
              children: 'children', // 子级字段名
            }"
            :list="corporationList"
            :value="inputForm.companyId"
            :clearable="true"
            :accordion="true"
            :disabled="method != 'add'"
            @getValue="
              value => {
                getApplicantCorporationName(value)
              }
            "
          />
        </el-form-item>
        <el-form-item
          label="申请部门"
          prop="departmentId"
        >
          <SelectTree
            class="small-box"
            :props="{
              value: 'id', // ID字段名
              label: 'departmentName', // 显示名称
              children: 'children', // 子级字段名
            }"
            :list="departmentList"
            :value="inputForm.departmentId"
            :clearable="true"
            :accordion="true"
            :disabled="method != 'add'"
            @getValue="
              value => {
                getApplicantDeptName(value)
              }
            "
          />
        </el-form-item>
        <el-form-item
          label="项目名称"
          prop="projectName"
        >
          <el-input
            v-model="inputForm.projectName"
            class="big-box"
            placeholder="请输入项目名称"
            :disabled="method != 'add'"
          />
        </el-form-item>
        <div>
          <el-form-item
            label="项目负责人"
            prop="dutyPerson"
          >
            <el-select
              v-model="inputForm.dutyPerson"
              class="small-box"
              placeholder="请选择项目负责人"
              clearable
              filterable
              :filter-method="filterUserList"
              :disabled="method != 'add'"
              @focus="getPersonnelList"
            >
              <el-option
                v-for="item in applicantListShow"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              >
                <span style="float: left">{{ item.fullName }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{
                  item.departmentName
                }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </div>

        <el-form-item
          label="变更类型"
          prop="changeType"
        >
          <el-radio-group
            v-model="inputForm.changeType"
            :disabled="method != 'add'"
          >
            <el-radio
              v-for="item in changeTypeList"
              :key="item.value"
              :label="item.dictName"
            >
              {{ item.dictName }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <div>
          <el-form-item
            label="四新性质"
            prop="fourProperties"
          >
            <el-radio-group
              v-model="inputForm.fourProperties"
              :disabled="method != 'add'"
            >
              <el-radio
                v-for="item in fourNewPropertiesList"
                :key="item.value"
                :label="item.value"
              >
                {{ item.name }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
        <el-form-item
          label="变更层级"
          prop="changeLevel"
          style="width: 800px"
        >
          <el-radio-group
            v-model="inputForm.changeLevel"
            :disabled="method != 'add'"
          >
            <el-radio
              v-for="item in changeLevelList"
              :key="item.value"
              :label="item.value"
            >
              {{ item.name }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="评审人"
          prop="assessPerson[0]"
        >
          <el-select
            v-model="inputForm.assessPerson[0]"
            class="small-box"
            placeholder="请输入评审人"
            clearable
            filterable
            :filter-method="filterUserList"
            :disabled="method != 'add'"
            @focus="getPersonnelList"
          >
            <el-option
              v-for="item in applicantListShow"
              :key="item.id"
              :label="item.fullName"
              :value="item.id"
            >
              <span style="float: left">{{ item.fullName }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{
                item.departmentName
              }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="inputForm.changeLevel == 2 || inputForm.changeLevel == 3"
          label="工厂评审人"
        >
          <el-select
            v-model="inputForm.assessPerson[1]"
            class="small-box"
            placeholder="请输入工厂评审人"
            clearable
            filterable
            :filter-method="filterUserList"
            :disabled="method != 'add'"
            @focus="getPersonnelList"
          >
            <el-option
              v-for="item in applicantListShow"
              :key="item.id"
              :label="item.fullName"
              :value="item.id"
            >
              <span style="float: left">{{ item.fullName }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{
                item.departmentName
              }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="inputForm.changeLevel == 3"
          label="公司评审人"
        >
          <el-select
            v-model="inputForm.assessPerson[2]"
            class="small-box"
            placeholder="请输入公司评审人"
            clearable
            filterable
            :filter-method="filterUserList"
            :disabled="method != 'add'"
            @focus="getPersonnelList"
          >
            <el-option
              v-for="item in applicantListShow"
              :key="item.id"
              :label="item.fullName"
              :value="item.id"
            >
              <span style="float: left">{{ item.fullName }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{
                item.departmentName
              }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <div>
          <el-form-item
            label="投资"
            prop="investMoney"
          >
            <el-input
              v-model="inputForm.investMoney"
              class="small-box"
              placeholder="请输入投资金额"
              :disabled="method != 'add'"
            />
            <span>万元</span>
          </el-form-item>
        </div>
        <el-form-item
          label="备注"
          prop="remark"
        >
          <el-input
            v-model="inputForm.remark"
            class="big-box"
            type="textarea"
            :rows="4"
            :disabled="method != 'add'"
          />
        </el-form-item>
        <el-form-item
          label="重大危险性评价"
          prop="hazardAppraise"
        >
          <el-input
            v-model="inputForm.hazardAppraise"
            class="big-box"
            type="textarea"
            :rows="4"
            :disabled="method != 'add'"
          />
        </el-form-item>
        <el-form-item
          label="申请附件"
          style="width: 690px"
        >
          <FileUpload
            v-bind="fileProp"
            @upload="uploadEvt"
          />
        </el-form-item>
        <!-- <template>
          <h3 class="title-box">人员变更详情</h3>
          <el-form-item label="被变更人" prop="applicantUserFullName">
            <el-select
              class="big-box"
              v-model="inputForm.applicantUserFullName"
              placeholder="请输入被变更人"
              filterable
              :filter-method="filterUserList"
              :disabled="method != 'add'"
              @change="confirmSelection('被变更人', $event)"
            >
              <el-option v-for="(item, index) in applicantListShow" :key="index" :label="item.fullName" :value="item.id"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="当前所属部门">
            <el-input class="small-box" v-model="inputForm.applicantDeptName"></el-input>
          </el-form-item>
          <el-form-item label="新部门" prop="newdepartmentId">
            <SelectTree
              class="small-box"
              :props="{
                value: 'id', // ID字段名
                label: 'departmentName', // 显示名称
                children: 'children' // 子级字段名
              }"
              :list="departmentList"
              :value="inputForm.newdepartmentId"
              :clearable="true"
              :accordion="true"
              :disabled="method != 'add'"
              @getValue="
                (value) => {
                  getApplicantDeptName(value)
                }
              "
            />
          </el-form-item>
          <el-form-item label="当前角色">
            <el-input class="small-box" v-model="inputForm.applicantDeptName"></el-input>
          </el-form-item>
          <el-form-item label="新角色" prop="newdepartmentId">
            <SelectTree
              class="small-box"
              :props="{
                value: 'id', // ID字段名
                label: 'departmentName', // 显示名称
                children: 'children' // 子级字段名
              }"
              :list="departmentList"
              :value="inputForm.newdepartmentId"
              :clearable="true"
              :accordion="true"
              :disabled="method != 'add'"
              @getValue="
                (value) => {
                  getApplicantDeptName(value)
                }
              "
            />
          </el-form-item>
          <el-form-item label="当前岗位">
            <el-input class="small-box" v-model="inputForm.applicantDeptName"></el-input>
          </el-form-item>
          <el-form-item label="新岗位" prop="newdepartmentId">
            <SelectTree
              class="small-box"
              :props="{
                value: 'id', // ID字段名
                label: 'departmentName', // 显示名称
                children: 'children' // 子级字段名
              }"
              :list="departmentList"
              :value="inputForm.newdepartmentId"
              :clearable="true"
              :accordion="true"
              :disabled="method != 'add'"
              @getValue="
                (value) => {
                  getApplicantDeptName(value)
                }
              "
            />
          </el-form-item>
          <el-form-item label="当前职业病">
            <el-input class="small-box" v-model="inputForm.applicantDeptName"></el-input>
          </el-form-item>
          <el-form-item label="新职业病" >
            <SelectTree
              class="small-box"
              :props="{
                value: 'id', // ID字段名
                label: 'departmentName', // 显示名称
                children: 'children' // 子级字段名
              }"
              :list="departmentList"
              :value="inputForm.newdepartmentId"
              :clearable="true"
              :accordion="true"
              :disabled="method != 'add'"
              @getValue="
                (value) => {
                  getApplicantDeptName(value)
                }
              "
            />
          </el-form-item>
          <el-form-item label="新岗位教育培训" >
            <el-table :data="tableData" row-key="sort"  :header-cell-style="{ background:'var(--ky-head-color)'}" align="center" style="margin-left: 5px;width: 1000px;">
            <el-table-column label="序号" type="index" width="50" align="center" />
            <el-table-column label="内容类型" align="center" prop="checkType" width="150">
            </el-table-column>
            <el-table-column label="选课方式" align="center" prop="checkSituation" width="220">
            </el-table-column>
            <el-table-column label="内容类别" align="center" prop="rectificationMeasures" width="220">
            </el-table-column>
            <el-table-column label="内容名称" align="center" prop="responsibleUnit" width="150">
            </el-table-column>
            <el-table-column label="形式" align="center" prop="checkTime" width="200">
            </el-table-column>
            <el-table-column label="课时" align="center" prop="checkUser" width="150">
            </el-table-column>
            <el-table-column label="频率" align="center" prop="rectificationResult" width="150">
            </el-table-column>
            <el-table-column label="评估方式" align="center" prop="rectificationTime" width="200">
            </el-table-column>
            <el-table-column label="关联试卷" align="center" prop="personInCharge" width="150">
            </el-table-column>
          </el-table>
          </el-form-item>
          <el-form-item label="教育培训相关附件" style="width: 690px">
          <FileUpload v-bind="fileProp" @upload="uploadEvt" />
        </el-form-item>
        <el-form-item label="重新签署安全目标责任书" style="width: 690px">
          <FileUpload v-bind="fileProp" @upload="uploadEvt" />
        </el-form-item>
        <el-form-item label="签署备注" prop="changeReason">
          <el-input class="big-box" type="textarea" :rows="4" v-model="inputForm.changeReason" :disabled="method != 'add'"> </el-input>
        </el-form-item>
        </template> -->
      </div>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
.fromClass {
  .form-box {
    width: 80%;
  }
  .title-box {
    width: 70%;
    text-indent: 2em;
    position: relative;
  }
  .title-box::before {
    content: '';
    width: 4px;
    height: 20px;
    background: #409eff;
    position: absolute;
    left: 20px;
  }
  .small-box {
    width: 280px;
  }
  .big-box {
    width: 670px;
  }
}
.mini-box {
  width: 200px !important;
}
</style>
