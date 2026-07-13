<script>
import { cloneDeep } from 'lodash'
import ImageSelect from '@/components/ImageSelect'
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { selectCompany } from '@/http/GeneralQuery.js'
import { upLoadImg } from '@/http/manage-api'
import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api'
import {
  getScreenListFn,
  getUserDetailFn,
  saveUserDetailFn,
} from '@/http/safe-production/user-manage-api'
import { getSubordinateCompany } from '@/http/user-api'
import FileUpload from '@/views/common-ui/FileUpload'
import {
  sexList,
  statusList,
  supervisorList,
  userTypeList,
} from './const'
import ChooseOaUser from './dialog/chooseOaUser'
import ChoosePost from './dialog/choosePost'
import ChooseQywxUser from './dialog/chooseQywxUser'
import ChooseRole from './dialog/chooseRole'

export default {
  components: {
    ImageSelect,
    FileUpload,
    SelectTree,
    ChoosePost,
    ChooseOaUser,
    ChooseQywxUser,
    ChooseRole,
  },
  props: {
    method: String,
    id: String,
  },
  data() {
    return {
      loading: false,
      receiveAlarmLevels: [],
      dataRule: {
        'baseInfo.companyId': [
          { required: true, message: '请选择所属企业', trigger: 'change' },
        ],
        'baseInfo.departmentId': [
          { required: true, message: '请选择所属企业', trigger: 'change' },
        ],
        'baseInfo.fullName': [{ required: true, message: '请选择姓名', trigger: 'blur' }],
        'baseInfo.username': [
          { required: true, message: '请输入用户名', trigger: 'blur' },
        ],
        'baseInfo.password': [{ required: true, message: '请输入密码', trigger: 'blur' }],
        'baseInfo.status': [
          { required: true, message: '请选择人员状态', trigger: 'change' },
        ],
        'platformInfo.safetyRiskFund': [
          { required: true, message: '请输入安全风险金', trigger: 'change' },
        ],
        'platformInfo.gridmanType': [
          { required: true, message: '请选择网格监督人员', trigger: 'change' },
        ],
        'platformInfo.roleList': [
          { required: true, message: '请选择角色', trigger: 'change' },
        ],
        'personalInfo.mobile': [
          { required: true, message: '请填写联系电话', trigger: 'blur' },
        ],
      },
      warningPushLevelList: [
        { label: '一级预警', value: '1' },
        { label: '二级预警', value: '2' },
        { label: '三级预警', value: '3' },
        { label: '四级预警', value: '4' },
      ],
      inputForm: {
        // 基本信息
        baseInfo: {
          id: '',
          companyId: '',
          departmentId: '',
          departmentName: '',
          fullName: '',
          username: '',
          photo: '',
          password: '',
          jobNumber: '',
          status: '1',
          userType: '',
          workPost: '',
          workPostName: '',
          postList: [], // 扩展岗位
          responsibilityAgreement: [], // 安全生产责任书
        },
        // 平台信息
        platformInfo: {
          locationPlatformUserId: '', // 定位平台用户id
          locationCardNo: '', // 定位卡号
          externalPlatformId: '', // OA平台id
          externalPlatformName: '', // OA平台用户name
          qywxUserId: '', // 企业微信用户id
          qywxUserName: '', // 企业微信用户name
          safetyRiskFund: 100, // 安全风险金，默认为100
          gridmanType: 0, // 网格管理属性，默认无-0，网格员-1，网格长-2，网格监督员-3，包保领导-4
          afterLoginMenu: '', // 开屏页配置
          medicalExaminationNo: '', // 体检档案编号
          roleList: [], // 角色信息
        },
        // 个人信息
        personalInfo: {
          birthday: '', // 出生日期
          politicalAttribute: '', // 政治面貌
          sex: '', // 性别
          ethnicGroup: '', // 民族
          certificateType: '', // 证件类型
          certificateNo: '', // 证件号码
          mobile: '', // 手机号
          officeTelephone: '', // 办公电话
          email: '', // 邮箱
          healthStatus: '', // 健康状况
          domicile: '', // 户籍所在地
          address: '', // 通讯地址
          postalCode: '', // 邮编
        },
        // 学历信息
        educationInfo: {
          educationalBackground: '', // 学历
          highestEducation: '', // 最高学位
          lastGraduatedCollege: '', // 最后毕业院校
          professional: '', // 专业
        },
        // 工作信息
        workInfo: {
          joinTime: '', // 入职时间
          workTime: '', // 参加工作时间
          workYears: '', // 工龄
          title: '', // 职称（技能等级）
          workType: '', // 工种（职务）
          jobResponsibilities: '', // 岗位职责
          workExperience: '', // 工作经历
        },
      },
      statusList,
      userTypeList,
      supervisorList,
      sexList,
      companyList: [],
      departmentList: [],
      showPostDialog: false, // 岗位选择弹框
      postProp: {}, // 选择岗位传递的属性
      fileProp: {
        // 安全生产责任书
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
        deleteFront: true,
        editable: true,
      },
      oldFiles: [], // 再次编辑时，需要记录之前上传的附件
      newFiles: [], // 再次编辑时，需要记录新上传的附件
      locationPlatformUserList: [], // 定位卡列表
      selectRiskArea: { busId: '', busIdType: 'COMPANY_ID' }, // 获取定位卡列表需要传的参数
      showOaDialog: false, // OA用户选择弹框
      oaProp: {}, // 选择OA用户传递的属性
      showQywxDialog: false, // 企业微信用户选择弹框
      qywxProp: {}, // 选择企业微信用户传递的属性
      screenList: [], // 开屏页list
      showRoleDialog: false, // 角色选择弹框
      roleProp: {}, // 选择角色传递的属性
    }
  },
  created() {
    this.getPrefix() // 获取图片/文件前缀
    this.getCompanyList()
    if (this.id) {
      this.getUserDetail(this.id)
    }
  },

  methods: {
    handleReceiveAlarmLevelsChange(val) {
      this.receiveAlarmLevels = val
    },
    // 获取用户详情
    getUserDetail(id) {
      getUserDetailFn(id).then(({ data }) => {
        if (data.success) {
          const companyId = data.result.baseInfo.companyId
          this.selectRiskArea.busId = companyId
          Promise.all([
            getAllDepartByCompanyFn(companyId),
            selectCompany(this.selectRiskArea),
            getScreenListFn(companyId),
          ]).then((res) => {
            // console.log(res)
            this.departmentList = this.setTreeData(res[0].data.result || [])
            this.locationPlatformUserList = res[1].data.result || []
            this.screenList = (res[2].data.result || []).filter((item) => {
              return item.businessType == 1 && item.vueComponent
            })

            this.inputForm = this.recover(this.inputForm, data.result)
            const responsibilityAgreement
              = this.inputForm.baseInfo.responsibilityAgreement || []
            this.receiveAlarmLevels
              = (data.result.platformInfo?.receiveAlarmLevels
                && data.result.platformInfo?.receiveAlarmLevels?.split(','))
              || []

            if (responsibilityAgreement.length) {
              this.fileProp.oldFileList = responsibilityAgreement.map((item) => {
                return {
                  originalName: item,
                  attachmentName: item,
                  filePath: item,
                }
              })
              this.fileProp.editable = this.method !== 'view'
              this.oldFiles = cloneDeep(responsibilityAgreement)
            }
            else {
              this.fileProp.oldFileList = []
            }
          })
          // this.inputForm = this.recover(this.inputForm, data.result)
          // this.setCompanyId(this.inputForm.baseInfo.companyId)
        }
        else {
          this.$message.warning(data.message || '获取用户详情失败')
        }
      })
    },
    // 获取公司列表
    getCompanyList() {
      getSubordinateCompany().then(({ data }) => {
        this.companyList = data.result || []
      })
    },
    // 选择所属企业之后的回调
    setCompanyId(val) {
      this.inputForm.baseInfo.companyId = val
      // 根据公司id获取公司下的组织架构
      this.getAllDepartByCompany(val)
      // 根据公司id获取定位卡列表
      this.getLocationPlatformUserList(val)
      // 根据公司id获取开屏页列表
      this.getScreenList(val)
    },
    // 选择组织架构之后的回调
    setDepartmentId(val) {
      this.inputForm.baseInfo.departmentId = val
    },
    // 根据公司id获取公司下的组织架构
    getAllDepartByCompany(companyId) {
      getAllDepartByCompanyFn(companyId).then(({ data }) => {
        this.departmentList = this.setTreeData(data.result || [])
      })
    },
    /* 图片选择回调 */
    fileChangeEvt(file) {
      if (file) {
        upLoadImg(file, 'USER_ICON_PATH').then(({ data }) => {
          if (data.success) {
            this.inputForm.baseInfo.photo = data.result
          }
          else {
            this.$message.warning(data.message || '上传失败')
          }
        })
      }
      else {
        this.inputForm.baseInfo.photo = ''
      }
    },
    // 选择岗位
    choosePost(isSingle) {
      if (!this.inputForm.baseInfo.companyId) {
        this.$message.warning('请先选择所属企业！')
        return
      }
      if (isSingle) {
        this.postProp.oldPickData = {
          id: this.inputForm.baseInfo.workPost || '',
          postName: this.inputForm.baseInfo.workPostName || '',
        }
      }
      else {
        this.postProp.oldPickList = this.inputForm.baseInfo.postList.map((item) => {
          return {
            id: item.postId,
            postName: item.postName,
          }
        })
      }
      this.postProp.departmentList = this.departmentList
      this.postProp.isSingle = isSingle
      this.showPostDialog = true
    },
    // 选择岗位之后的回调
    closePostEvt(params) {
      if (params) {
        if (this.postProp.isSingle) {
          this.inputForm.baseInfo.workPost = params.data.id
          this.inputForm.baseInfo.workPostName = params.data.postName
        }
        else {
          this.inputForm.baseInfo.postList = params.data.map((item) => {
            return {
              postId: item.id,
              postName: item.postName,
            }
          })
        }
      }
      this.showPostDialog = false
    },
    /* 移除岗位回调 */
    removePost(index) {
      this.inputForm.baseInfo.postList.splice(index, 1)
    },
    // 上传安全生产责任书
    uploadEvt(fileList) {
      if (fileList.length) {
        upLoadImg(fileList[fileList.length - 1], 'USER_CERTIFICATE').then(({ data }) => {
          if (data.success) {
            this.$message.success('上传成功')
            this.newFiles.push(data.result)
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.newFiles = []
      }
    },
    // 删除新上传的附件
    delNewFiles(index) {
      this.newFiles.splice(index, 1)
    },
    // 再次编辑的时候删除之前上传的附件
    delDocPath(index) {
      this.oldFiles.splice(index, 1)
    },
    // 获取定位卡列表
    getLocationPlatformUserList(companyId) {
      this.selectRiskArea.busId = companyId
      selectCompany(this.selectRiskArea).then(({ data }) => {
        this.locationPlatformUserList = data.result || []
      })
    },
    // 选择定位卡之后设置定位卡号
    setlocationCardNo(val) {
      if (val) {
        this.inputForm.platformInfo.locationCardNo = (
          this.locationPlatformUserList.find((item) => {
            return item.id === val
          }) || {}
        ).sn
      }
      else {
        this.inputForm.platformInfo.locationCardNo = ''
      }
    },
    // 选择OA用户
    chooseOaUser() {
      if (!this.inputForm.baseInfo.companyId) {
        this.$message.warning('请先选择所属企业！')
        return
      }
      this.oaProp.oldPickData = {
        userid: this.inputForm.platformInfo.externalPlatformId || '',
        lastname: this.inputForm.platformInfo.externalPlatformName || '',
      }
      this.oaProp.companyId = this.inputForm.baseInfo.companyId
      this.oaProp.isSingle = true
      this.showOaDialog = true
    },
    // 选择oa用户之后的回调
    closeOaEvt(params) {
      if (params) {
        this.inputForm.platformInfo.externalPlatformId = params.data.userid
        this.inputForm.platformInfo.externalPlatformName = params.data.lastname
      }
      this.showOaDialog = false
    },
    // 选择企业微信用户
    chooseQywxUser() {
      if (!this.inputForm.baseInfo.companyId) {
        this.$message.warning('请先选择所属企业！')
        return
      }
      this.qywxProp.oldPickData = {
        userid: this.inputForm.platformInfo.qywxUserId || '',
        name: this.inputForm.platformInfo.qywxUserName || '',
      }
      this.qywxProp.isSingle = true
      this.showQywxDialog = true
    },
    // 选择企业微信用户之后的回调
    closeQywxEvt(params) {
      if (params) {
        this.inputForm.platformInfo.qywxUserId = params.data.userid
        this.inputForm.platformInfo.qywxUserName = params.data.name
      }
      this.showQywxDialog = false
    },
    // 根据公司id获取公司下的开屏页列表
    getScreenList(companyId) {
      getScreenListFn(companyId).then(({ data }) => {
        if (data.result && data.result.length) {
          // 过滤出类型为开屏页的并且设置了vueComponent的
          this.screenList = data.result.filter((item) => {
            return item.businessType == 1 && item.vueComponent
          })
        }
        else {
          this.screenList = []
        }
      })
    },
    // 选择角色
    chooseRole() {
      if (!this.inputForm.baseInfo.companyId) {
        this.$message.warning('请先选择所属企业！')
        return
      }
      this.roleProp.oldPickList = (this.inputForm.platformInfo.roleList || []).map(
        (item) => {
          return {
            id: item.roleId,
            roleName: item.roleName,
          }
        },
      )
      this.roleProp.companyId = this.inputForm.baseInfo.companyId
      this.roleProp.isSingle = false
      this.showRoleDialog = true
    },
    // 选择角色之后的回调
    closeRoleEvt(params) {
      if (params) {
        this.inputForm.platformInfo.roleList = params.data.map((item) => {
          return {
            roleId: item.id,
            roleName: item.roleName,
          }
        })
      }
      this.showRoleDialog = false
    },
    // 移除角色
    removeRole(index) {
      this.inputForm.platformInfo.roleList.splice(index, 1)
    },
    submitBaseInfo() {
      this.inputForm.platformInfo.receiveAlarmLevels
        = this.receiveAlarmLevels?.join(',') || ''
      this.$refs.baseInfoForm.validate((valid) => {
        if (valid) {
          this.loading = true
          this.inputForm.baseInfo.responsibilityAgreement = this.oldFiles.concat(
            this.newFiles,
          )
          saveUserDetailFn(this.inputForm)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('保存成功')
              }
              else {
                this.$message.warning(res.data.message || '保存失败')
              }
            })
            .catch((err) => {
              this.$message.error('保存出错', err)
            })
            .finally(() => {
              this.loading = false
              this.$emit('submitFinish')
            })
        }
        else {
          this.$emit('submitFinish')
        }
      })
    },
  },
}
</script>

<template>
  <el-form
    ref="baseInfoForm"
    v-loading="loading"
    :model="inputForm"
    :rules="dataRule"
    label-width="100px"
    :disabled="method === 'view'"
    style="width: 1000px"
    @submit.native.prevent
  >
    <h3 class="subTitle">
      基本信息
    </h3>
    <div class="photoArea">
      <div style="width: 50%">
        <el-form-item label="所属企业" prop="baseInfo.companyId">
          <SelectTree
            :props="{
              value: 'id', // ID字段名
              label: 'companyName', // 显示名称
              children: 'children', // 子级字段名
            }"
            :list="companyList"
            :value="inputForm.baseInfo.companyId"
            :clearable="true"
            :accordion="true"
            @getValue="setCompanyId"
          />
        </el-form-item>
        <el-form-item label="组织架构" prop="baseInfo.departmentId">
          <SelectTree
            :props="{
              value: 'id', // ID字段名
              label: 'departmentName', // 显示名称
              children: 'children', // 子级字段名
            }"
            :data="departmentList"
            :label="inputForm.baseInfo.departmentName"
            :value="inputForm.baseInfo.departmentId"
            :clearable="true"
            :accordion="true"
            @getValue="setDepartmentId"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="baseInfo.fullName">
          <el-input v-model="inputForm.baseInfo.fullName" />
        </el-form-item>
        <el-form-item label="用户名" prop="baseInfo.username">
          <el-input v-model="inputForm.baseInfo.username" />
        </el-form-item>
      </div>
      <div>
        <el-form-item label="照片" prop="baseInfo.photo">
          <ImageSelect
            :signUrl="
              inputForm.baseInfo.photo ? filePrefix + inputForm.baseInfo.photo : ''
            "
            width="160px"
            height="160px"
            :disabled="method === 'view'"
            @fileChange="fileChangeEvt"
          />
        </el-form-item>
      </div>
    </div>
    <el-row>
      <el-col v-if="method === 'add'" :span="12">
        <el-form-item label="密码" prop="baseInfo.password">
          <el-input
            v-model="inputForm.baseInfo.password"
            type="password"
            autocomplete="new-password"
            show-password
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="人员状态" prop="baseInfo.status">
          <el-select v-model="inputForm.baseInfo.status" style="width: 100%" filterable>
            <el-option
              v-for="item in statusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="人员类型" prop="baseInfo.userType">
          <el-select v-model="inputForm.baseInfo.userType" style="width: 100%" filterable>
            <el-option
              v-for="item in userTypeList"
              :key="item.code"
              :label="item.label"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="工号" prop="baseInfo.jobNumber">
          <el-input v-model="inputForm.baseInfo.jobNumber" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="岗位" prop="baseInfo.workPostName">
          <el-input
            v-model="inputForm.baseInfo.workPostName"
            readonly
            @focus="choosePost(true)"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="扩展岗位">
          <div>
            <el-button type="primary" @click="choosePost(false)">
              选择岗位
            </el-button>
            <el-tag
              v-for="(item, index) in inputForm.baseInfo.postList"
              :key="item.postId"
              :closable="method !== 'view'"
              @close="removePost(index)"
            >
              {{ item.postName }}
            </el-tag>
          </div>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-form-item label="安全生产责任书" prop="baseInfo.responsibilityAgreement">
        <FileUpload
          v-bind="fileProp"
          @upload="uploadEvt"
          @delSucc="delDocPath"
          @delNewUpload="delNewFiles"
        />
      </el-form-item>
    </el-row>
    <h3 class="subTitle">
      平台信息
    </h3>
    <el-row>
      <el-col :span="12">
        <el-form-item label="绑定定位卡" prop="platformInfo.locationPlatformUserId">
          <el-select
            v-model="inputForm.platformInfo.locationPlatformUserId"
            style="width: 100%"
            filterable
            clearable
            @change="setlocationCardNo"
          >
            <el-option
              v-for="item in locationPlatformUserList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="定位卡号" prop="platformInfo.locationCardNo">
          <el-input v-model="inputForm.platformInfo.locationCardNo" disabled />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="绑定OA用户" prop="platformInfo.externalPlatformName">
          <el-input
            v-model="inputForm.platformInfo.externalPlatformName"
            readonly
            @focus="chooseOaUser()"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="安全风险金" prop="platformInfo.safetyRiskFund">
          <el-input-number
            v-model="inputForm.platformInfo.safetyRiskFund"
            controls-position="right"
            :min="0"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="企业微信" prop="platformInfo.qywxUserName">
          <el-input
            v-model="inputForm.platformInfo.qywxUserName"
            readonly
            @focus="chooseQywxUser()"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="网格监督人员" prop="platformInfo.gridmanType">
          <el-select
            v-model="inputForm.platformInfo.gridmanType"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="item in supervisorList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="开屏页配置" prop="platformInfo.afterLoginMenu">
          <el-select
            v-model="inputForm.platformInfo.afterLoginMenu"
            style="width: 100%"
            filterable
            clearable
          >
            <el-option
              v-for="(item, index) in screenList"
              :key="index"
              :label="item.menuName"
              :value="item.vueComponent"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="体检档案编号" prop="platformInfo.medicalExaminationNo">
          <el-input v-model="inputForm.platformInfo.medicalExaminationNo" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="预警推送等级" prop="platformInfo.receiveAlarmLevels">
          <el-select
            v-model="receiveAlarmLevels"
            style="width: 100%"
            filterable
            clearable
            placeholder="请选择"
            multiple
            @change="handleReceiveAlarmLevelsChange"
          >
            <el-option
              v-for="item in warningPushLevelList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-form-item label="角色信息" prop="platformInfo.roleList">
        <div>
          <el-button type="primary" @click="chooseRole()">
            选择角色
          </el-button>
          <el-tag
            v-for="(item, index) in inputForm.platformInfo.roleList"
            :key="item.id"
            :closable="method !== 'view'"
            @close="removeRole(index)"
          >
            {{ item.roleName }}
          </el-tag>
        </div>
      </el-form-item>
    </el-row>

    <h3 class="subTitle">
      个人信息
    </h3>
    <el-row>
      <el-col :span="12">
        <el-form-item label="出生日期" prop="personalInfo.birthday">
          <el-date-picker
            v-model="inputForm.personalInfo.birthday"
            type="date"
            placeholder="选择出生日期"
            value-format="yyyy-MM-dd"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="政治面貌" prop="personalInfo.politicalAttribute">
          <el-select
            v-model="inputForm.personalInfo.politicalAttribute"
            placeholder="请选择"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="item in $dictUtils.getDictList('politics_status')"
              :key="item.id"
              :label="item.dictName"
              :value="+item.dictCode"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="性别" prop="personalInfo.sex">
          <el-select
            v-model="inputForm.personalInfo.sex"
            style="width: 100%"
            filterable
            clearable
          >
            <el-option
              v-for="(item, index) in sexList"
              :key="index"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="民族" prop="personalInfo.ethnicGroup">
          <el-select
            v-model="inputForm.personalInfo.ethnicGroup"
            placeholder="请选择"
            filterable
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="item in $dictUtils.getDictList('nation_list')"
              :key="item.id"
              :label="item.dictName"
              :value="+item.dictCode"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="证件类型" prop="personalInfo.certificateType">
          <el-select
            v-model="inputForm.personalInfo.certificateType"
            placeholder="请选择"
            filterable
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="item in $dictUtils.getDictList('certificate_type_list')"
              :key="item.id"
              :label="item.dictName"
              :value="+item.dictCode"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="证件号码" prop="personalInfo.certificateNo">
          <el-input v-model="inputForm.personalInfo.certificateNo" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="联系电话" prop="personalInfo.mobile">
          <el-input v-model="inputForm.personalInfo.mobile" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="办公电话" prop="personalInfo.officeTelephone">
          <el-input v-model="inputForm.personalInfo.officeTelephone" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="邮箱" prop="personalInfo.email">
          <el-input v-model="inputForm.personalInfo.email" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="健康状况" prop="personalInfo.healthStatus">
          <el-select
            v-model="inputForm.personalInfo.healthStatus"
            placeholder="请选择"
            filterable
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="item in $dictUtils.getDictList('health_status_list')"
              :key="item.id"
              :label="item.dictName"
              :value="+item.dictCode"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="户籍所在地" prop="personalInfo.domicile">
          <el-input v-model="inputForm.personalInfo.domicile" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="通讯地址" prop="personalInfo.address">
          <el-input v-model="inputForm.personalInfo.address" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="邮编" prop="personalInfo.postalCode">
          <el-input v-model="inputForm.personalInfo.postalCode" />
        </el-form-item>
      </el-col>
    </el-row>
    <h3 class="subTitle">
      学历信息
    </h3>
    <el-row>
      <el-col :span="12">
        <el-form-item label="学历" prop="educationInfo.educationalBackground">
          <el-select
            v-model="inputForm.educationInfo.educationalBackground"
            placeholder="请选择"
            filterable
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="item in $dictUtils.getDictList('educational_background')"
              :key="item.id"
              :label="item.dictName"
              :value="+item.dictCode"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="最高学位" prop="educationInfo.highestEducation">
          <el-input v-model="inputForm.educationInfo.highestEducation" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="最后毕业院校" prop="educationInfo.lastGraduatedCollege">
          <el-input v-model="inputForm.educationInfo.lastGraduatedCollege" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="专业" prop="educationInfo.professional">
          <el-input v-model="inputForm.educationInfo.professional" />
        </el-form-item>
      </el-col>
    </el-row>
    <h3 class="subTitle">
      工作信息
    </h3>
    <el-row>
      <el-col :span="12">
        <el-form-item label="入职日期" prop="workInfo.joinTime">
          <el-date-picker
            v-model="inputForm.workInfo.joinTime"
            type="date"
            placeholder="选择入职日期"
            value-format="yyyy-MM-dd"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="参加工作时间" prop="workInfo.workTime">
          <el-date-picker
            v-model="inputForm.workInfo.workTime"
            type="date"
            placeholder="选择入职日期"
            value-format="yyyy-MM-dd"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="工龄" prop="workInfo.workYears">
          <el-input-number
            v-model="inputForm.workInfo.workYears"
            controls-position="right"
            :min="0"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="职称/技能等级" prop="workInfo.title">
          <el-input v-model="inputForm.workInfo.title" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="职务" prop="workInfo.workType">
          <el-input v-model="inputForm.workInfo.workType" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-form-item label="岗位职责" prop="workInfo.jobResponsibilities">
        <el-input
          v-model="inputForm.workInfo.jobResponsibilities"
          type="textarea"
          :rows="3"
        />
      </el-form-item>
    </el-row>
    <el-row>
      <el-form-item label="工作经历" prop="workInfo.workExperience">
        <el-input
          v-model="inputForm.workInfo.workExperience"
          type="textarea"
          :rows="3"
        />
      </el-form-item>
    </el-row>
    <el-dialog
      class="fixed-dialog"
      title="选择岗位"
      :visible.sync="showPostDialog"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <ChoosePost v-if="showPostDialog" v-bind="postProp" @close="closePostEvt" />
    </el-dialog>
    <el-dialog
      class="fixed-dialog"
      title="OA用户选择"
      :visible.sync="showOaDialog"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <ChooseOaUser v-if="showOaDialog" v-bind="oaProp" @close="closeOaEvt" />
    </el-dialog>
    <el-dialog
      class="fixed-dialog"
      title="企业微信用户选择"
      :visible.sync="showQywxDialog"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <ChooseQywxUser v-if="showQywxDialog" v-bind="qywxProp" @close="closeQywxEvt" />
    </el-dialog>
    <el-dialog
      class="fixed-dialog"
      title="角色选择"
      :visible.sync="showRoleDialog"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <ChooseRole v-if="showRoleDialog" v-bind="roleProp" @close="closeRoleEvt" />
    </el-dialog>
  </el-form>
</template>

<style lang="scss" scoped>
.subTitle {
  text-indent: 2em;
  position: relative;
  line-height: 30px;
}

.subTitle::before {
  content: "";
  width: 4px;
  height: 20px;
  background: #409eff;
  position: absolute;
  left: 10px;
  top: 5px;
}

.photoArea {
  width: 100%;
  display: flex;
}
</style>
