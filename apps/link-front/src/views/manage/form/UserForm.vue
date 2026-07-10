<script>
import { getAuthToken } from '@/utils/tab-session'
import ImageSelect from '@/components/ImageSelect'
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { getBaseUrl } from '@/http/common/utils'
import { selectCompany } from '@/http/GeneralQuery.js'
import { getPostByDepartmentId } from '@/http/safe-production/post-manage-api'
import {
  addUser,
  getAllQywxUserFn,
  getAllRolesFn,
  getExtendUserInfo,
  getOaUserList,
  getRolesByUserFn,
  getScreenListFn,
  saveExtendUserInfo,
} from '@/http/safe-production/user-manage-api'
import { SUPERVISOR, USERTYPE } from './user'

export default {
  components: {
    SelectTree,
    ImageSelect,
  },
  props: {
    method: {
      type: String,
      default: '',
    },
    obj: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      showDialog: true, // 表单清空
      visible: false,
      loading: false,
      currentUserInfo: {}, //
      externalPlatFormList: [],
      inputForm: {
        id: '',
        companyId: '', // 所属企业
        departmentId: '', // 组织架构
        fullName: '', // 姓名
        username: '', // 用户名
        mobile: '',
        password: '',
        email: '',
        qywxUserId: '', // 企业微信id
        sex: '男',
        identificationNumber: '',
        workPost: '', // 岗位id
        workName: '', // 岗位名称
        workType: '', // 工种
        workTime: '',
        joinTime: '',
        title: '',
        locationCardNo: '',
        locationPlatformUserId: '',
        jobNumber: '',
        responsibilityAgreement: '',
        photo: '',
        roleIdList: [],
        afterLoginMenu: '', // 用户登录后展示的大屏页面，如果未设置则进入系统
        userType: '', // 用户类型
        externalPlatformId: '', // 用户外部平台id
        companyExternalPlatformId: '', // 公司外部平台id
        departmentExternalPlatformId: '',
        gridmanType: 0,
        safetyRiskFund: null,
        postList: [],
        status: '1', // '0'禁用，1在职，2借调，3离职，4退休
      },
      userTypeList: USERTYPE, // 用户类型
      supervisor: SUPERVISOR, // 监督人员
      dataRule: {
        companyId: [{ required: true, message: '所属企业不能为空', trigger: 'change' }],
        departmentId: [{ required: true, message: '所属部门不能为空', trigger: 'change' }],
        fullName: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
        mobile: [
          { required: false, message: '请输入正确的手机号', trigger: 'blur' },
          {
            validator: this.validator.isMobile,
            trigger: 'blur',
          },
        ],
        username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
        password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
        roleIdList: [{ required: true, message: '请选择所属角色', trigger: 'change' }],
        safetyRiskFund: [{ required: true, message: '安全风险金不能为空', trigger: 'change' }],
        gridmanType: [
          {
            required: true,
            message: '网格监督人员不能为空',
            trigger: 'change',
          },
        ],
      },
      gridmanRoleList: [],
      fileList: [],
      fileList02: [],
      roleOptions: [],
      postOptions: [],
      extendPostList: [],
      extendPostDataList: [],
      hideUpload: false,
      hideUpload02: false,
      header: {
        Authorization: getAuthToken(),
        clientChannel: 'WEB',
      },
      actionUrl: '',
      // 这是用来临时存储模拟用户id接口数据
      LocatingUserId: [],
      selectRiskArea: { busId: '', busIdType: 'COMPANY_ID' }, // 用户管理风险区域新增
      userOptions: [], // 所以的企业微信用户列表
      screenList: [], // 开屏页list
    }
  },
  computed: {
    checkboxDisabled() {
      // 如果不是本公司的角色，则不能编辑
      return (id) => {
        return id !== this.inputForm.companyId
      }
    },
  },
  watch: {
    'inputForm.companyId': {
      handler(n) {
        if (n) {
          this.getAllRoles(n)
        }
      },
      immediate: true,
    },
  },
  created() {
    this.getPrefix()
  },
  mounted() {
    this.init(this.method, this.obj)
    this.getRequestUrl()
    this.getAllQywxUser()
    this.getScreenList()
    if (this.method != 'add') {
      this.getExternalPlatFormList()
    }
  },
  methods: {
    selectCompanyRiskArea(value, title, data) {
      this.inputForm.departmentId = ''
      this.inputForm.externalPlatformId = ''
      this.inputForm.companyExternalPlatformId = data ? data.externalPlatformId : ''
      this.inputForm.companyId = value
      this.selectRiskArea.busId = value
      selectCompany(this.selectRiskArea)
        .then((res) => {
          if (res.data.success) {
            this.LocatingUserId = res.data.result
          }
          else {
            this.$message.warning(res.data.message || '获取列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    selectDepartment(value, title, data) {
      this.inputForm.departmentId = value
      this.getAllPostByCompany(this.inputForm.departmentId)
      if (data) {
        this.inputForm.departmentExternalPlatformId = data.externalPlatformId || ''
        this.getExternalPlatFormList()
      }
    },
    selectWorkPost(item) {
      this.postOptions.forEach((res) => {
        if (item.id === res.id) {
          this.inputForm.workPost = res.id
          this.inputForm.workName = res.postName
        }
      })

      this.extendPostList = this.postOptions.filter((val) => {
        return this.inputForm.workPost != val.id
      })
    },
    selectExtendWorkPost() {
      this.inputForm.postList = this.extendPostDataList.map((item) => {
        return {
          postId: item.id,
          postName: item.postName,
        }
      })
    },
    getExternalPlatFormList() {
      const params = {
        companyId: this.inputForm.companyExternalPlatformId,
        departmentId: this.inputForm.departmentExternalPlatformId,
        postId: this.inputForm.workPost,
      }
      getOaUserList(params)
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
    },
    selectSubItem(event) {
      this.inputForm.locationCardNo = event.sn
      this.inputForm.locationPlatformUserId = event.id
    },
    async getRequestUrl() {
      const baseUrl = await getBaseUrl()
      this.actionUrl = `${baseUrl}sys/uploadFile`
    },
    init(method, obj) {
      this.inputForm.id = obj.id
      this.inputForm.companyExternalPlatformId = obj.companyExternalPlatformId || ''
      this.inputForm.departmentExternalPlatformId = obj.departmentExternalPlatformId || ''
      this.visible = true
      if (method === 'edit') {
        this.currentUserInfo = obj
        this.inputForm.companyId = obj.companyId
        this.selectRiskArea.busId = this.inputForm.companyId
        selectCompany(this.selectRiskArea)
          .then((res) => {
            if (res.data.success) {
              this.LocatingUserId = res.data.result
            }
            else {
              this.$message.warning(res.data.message || '获取列表失败')
            }
          })
          .catch((err) => {
            this.$message.error('获取列表出错', err)
          })
          .finally(() => {
            this.isLoading = false
          })
      }
      else if (method === 'view') {
        this.currentUserInfo = obj
        this.inputForm.companyId = obj.companyId // 先赋值companyId，触发watch事件
      }

      // 处理图片显示
      this.$nextTick(() => {
        this.$refs.inputForm.clearValidate()
        if (this.inputForm.id) {
          if (obj.photo) {
            this.fileList = [
              {
                url: this.filePrefix + obj.photo,
              },
            ]
            this.hideUpload = true
          }
          if (obj.responsibilityAgreement) {
            this.fileList02 = [
              {
                url: this.filePrefix + obj.responsibilityAgreement,
              },
            ]
            this.hideUpload02 = true
          }
        }
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          addUser(this.inputForm)
            .then(({ data }) => {
              this.loading = false
              if (data && data.success) {
                this.$message.success('保存成功')
                this.saveExtendUserInfo(data.result)
                this.visible = false
                this.closeClick(true)
              }
              else {
                this.$message.error(data.message)
              }
            })
            .catch((err) => {
              this.loadingTable = false
              this.$message.error('保存失败', err)
            })
        }
      })
    },
    saveExtendUserInfo(id) {
      const params = {
        gridmanType: Number(this.inputForm.gridmanType),
        id,
        postList: this.inputForm.postList,
        safetyRiskFund: Number(this.inputForm.safetyRiskFund),
      }
      saveExtendUserInfo(params).then(({ data }) => {
        console.log(data)
      })
    },
    // 上传图片
    fileSuccessFn(res, file, fileList) {
      if (res.success) {
        this.fileList = fileList
        this.hideUpload = this.fileList.length >= 1
        this.inputForm.photo = res.result
      }
      else {
        this.$message.error(res.message)
      }
    },
    fileSuccessFn02(res, file, fileList) {
      if (res.success) {
        this.fileList02 = fileList
        this.hideUpload02 = this.fileList02.length >= 1
        this.inputForm.responsibilityAgreement = res.result
      }
      else {
        this.$message.error(res.message)
      }
    },
    // 移除图片
    fileRemoveFn(file) {
      console.log('移除图片')
      const idx = this.fileList.indexOf(file)
      this.fileList.splice(idx, 1)
      this.inputForm.photo = ''
      this.hideUpload = this.fileList.length >= 1
    },
    fileRemoveFn02(file) {
      console.log('移除图片')
      const idx = this.fileList02.indexOf(file)
      this.fileList02.splice(idx, 1)
      this.inputForm.responsibilityAgreement = ''
      this.hideUpload02 = this.fileList02.length >= 1
    },
    // 获取个人权限
    async getAllRoles(companyId) {
      await getAllRolesFn(companyId).then(({ data }) => {
        this.roleOptions = data.result || []
      })
      if (this.method === 'edit' || this.method === 'view') {
        // 通过用户id获取所拥有的角色
        getRolesByUserFn(this.inputForm.id).then(({ data }) => {
          // 先找出用户拥有的不属于本公司的其他角色
          const otherRoles = data.result.filter((item) => {
            return item.companyId !== this.currentUserInfo.companyId
          })
          this.roleOptions = this.roleOptions.concat(otherRoles)
          // 用户所拥有的所有角色
          this.currentUserInfo.roleIdList = data.result.map(item => item.id) || []
          // 如果没有赋值过，再赋值
          if (!this.inputForm.username) {
            this.inputForm = this.recover(this.inputForm, this.currentUserInfo)
            // 获取岗位
            this.getAllPostByCompany(this.inputForm.departmentId)
            setTimeout(() => {
              this.postOptions.forEach((res) => {
                if (this.inputForm.workPost === res.id) {
                  this.inputForm.workName = res.postName
                  this.inputForm.workPost = res.id
                }
              })

              this.extendPostList = this.postOptions.filter((val) => {
                return this.inputForm.workPost != val.id
              })

              if (this.extendPostList && this.extendPostList.length) {
                this.extendPostList.forEach((item) => {
                  this.inputForm.postList.forEach((v) => {
                    if (v.postId === item.id) {
                      this.extendPostDataList.push(item)
                    }
                  })
                })
              }
            }, 500)
            this.getExtendUserInfo(this.inputForm.id)
          }
        })
      }
    },
    // 查询指定部门下的岗位
    getAllPostByCompany(companyId) {
      getPostByDepartmentId(companyId).then(({ data }) => {
        if (data.success) {
          this.postOptions = data.result || []
        }
        else {
          this.$message.error('获取岗位列表失败' || data.message)
        }
      })
    },

    // 获取指定用户的扩展信息
    getExtendUserInfo(userId) {
      getExtendUserInfo(userId).then(({ data }) => {
        this.inputForm.gridmanType = data.result.gridmanType
        this.inputForm.safetyRiskFund = data.result.safetyRiskFund
        this.inputForm.postList = data.result.postList
      })
    },
    // 获取企业微信用户列表
    getAllQywxUser() {
      getAllQywxUserFn().then(({ data }) => {
        if (data.success) {
          this.userOptions = data.result || []
        }
      })
    },
    // 获取开屏页列表
    getScreenList() {
      const companyId = this.$store.state.user.user.companyId
      getScreenListFn(companyId).then(({ data }) => {
        if (data.result && data.result.length) {
          // 过滤出类型为开屏页的并且设置了vueComponent的
          this.screenList = data.result.filter((item) => {
            return item.businessType == 1 && item.vueComponent
          })
        }
        // this.screenList = data.result || []
      })
    },
    /* 关闭弹窗 */
    closeClick(isRefresh = false) {
      this.$emit('succ', isRefresh)
    },
  },
}
</script>

<template>
  <div class="testClass">
    <el-form
      ref="inputForm"
      v-loading="loading"
      :inline="true"
      :visible.sync="visible"
      :model="inputForm"
      :rules="method === 'view' ? {} : dataRule"
      label-width="100px"
      :class="method === 'view' ? 'readonly' : ''"
      :disabled="method === 'view'"
      @submit.native.prevent
    >
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="所属企业"
            prop="companyId"
          >
            <SelectTree
              v-if="visible"
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
              @getValue="selectCompanyRiskArea"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="组织架构"
            prop="departmentId"
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
              :value="inputForm.departmentId"
              :clearable="true"
              :accordion="true"
              @getValue="selectDepartment"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="姓名"
            prop="fullName"
          >
            <el-input v-model="inputForm.fullName" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="用户名"
            prop="username"
          >
            <el-input v-model="inputForm.username" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="手机号码"
            prop="mobile"
          >
            <el-input v-model="inputForm.mobile" />
          </el-form-item>
        </el-col>
        <el-col
          v-if="method === 'add'"
          :span="12"
        >
          <el-form-item
            label="密码"
            prop="password"
          >
            <el-input
              v-model="inputForm.password"
              type="password"
              autocomplete="new-password"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="邮箱"
            prop="email"
          >
            <el-input v-model="inputForm.email" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="企业微信"
            prop="qywxUserId"
          >
            <el-select
              v-model="inputForm.qywxUserId"
              placeholder="请选择"
              clearable
              filterable
            >
              <el-option
                v-for="item in userOptions"
                :key="item.userid"
                :label="item.name"
                :value="item.userid"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="性别"
            prop="sex"
          >
            <el-radio-group v-model="inputForm.sex">
              <!-- <el-radio-button label="公司"></el-radio-button> -->
              <el-radio-button label="男" />
              <el-radio-button label="女" />
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="身份证号"
            prop="identificationNumber"
          >
            <el-input v-model="inputForm.identificationNumber" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="岗位">
            <el-select
              v-model="inputForm.workName"
              placeholder="请选择"
              style="width: 100%"
              value-key="id"
              filterable
              @change="selectWorkPost"
            >
              <el-option
                v-for="item in postOptions"
                :key="item.id"
                :label="item.postName"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="工种"
            prop="workType"
          >
            <el-select
              v-model="inputForm.workType"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in $dictUtils.getDictList('work_type')"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="扩展岗位">
            <el-select
              v-model="extendPostDataList"
              placeholder="请选择"
              style="width: 100%"
              multiple
              value-key="id"
              filterable
              @change="selectExtendWorkPost"
            >
              <el-option
                v-for="item in extendPostList"
                :key="item.id"
                :label="item.postName"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="用户类型"
            prop="userType"
            :rules="{
              required: true,
              message: '请选择用户类型',
              trigger: 'change',
            }"
          >
            <el-select
              v-model="inputForm.userType"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="(item, index) in userTypeList"
                :key="index"
                :label="item.lable"
                :value="item.code"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="登录页面"
            prop="afterLoginMenu"
          >
            <el-select
              v-model="inputForm.afterLoginMenu"
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
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="参加工作时间"
            prop="workTime"
          >
            <el-date-picker
              v-model="inputForm.workTime"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="入职时间"
            prop="joinTime"
          >
            <el-date-picker
              v-model="inputForm.joinTime"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="职称"
            prop="title"
          >
            <el-input v-model="inputForm.title" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="工号"
            prop="jobNumber"
          >
            <el-input v-model="inputForm.jobNumber" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="定位卡号"
            prop="locationCardNo"
          >
            <el-input
              v-model="inputForm.locationCardNo"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="定位平台用户ID"
            prop="locationPlatformUserId	"
          >
            <el-select
              v-model="inputForm.locationPlatformUserId"
              filterable
              clearable
              style="width: 100%"
              @change="selectSubItem"
            >
              <el-option
                v-for="item in LocatingUserId"
                :key="item.id"
                :label="item.name"
                :value="{ name: item.name, id: item.id, sn: item.sn }"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="绑定oa用户"
            prop="externalPlatformId"
          >
            <el-select
              v-model="inputForm.externalPlatformId"
              clearable
              filterable
            >
              <el-option
                v-for="item in externalPlatFormList"
                :key="item.userid"
                :value="item.userid"
                :label="item.lastname"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="安全风险金"
            prop="safetyRiskFund"
          >
            <el-input v-model="inputForm.safetyRiskFund" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="网格监督人员"
            prop="gridmanType"
          >
            <el-select
              v-model="inputForm.gridmanType"
              clearable
              filterable
            >
              <el-option
                v-for="item in supervisor"
                :key="item.code"
                :value="item.code"
                :label="item.lable"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="安全生产责任书"
            prop="responsibilityAgreement"
          >
            <el-upload
              :action="`${actionUrl}?fileType=USER_CERTIFICATE`"
              :headers="header"
              :on-success="fileSuccessFn02"
              list-type="picture-card"
              :file-list="fileList02"
              :show-file-list="false"
              :auto-upload="true"
              :multiple="false"
              :limit="1"
              :class="{ hide: hideUpload02 }"
            >
              <i
                v-if="!fileList02.length"
                class="el-icon-plus"
              />
              <div
                v-if="fileList02.length"
                style="position: relative"
              >
                <div
                  v-if="method !== 'view'"
                  style="width: 150px; height: 150px; position: absolute"
                  @click.stop="fileRemoveFn02"
                >
                  <i class="el-icon-delete icon" />
                </div>
                <img
                  style="width:150px;height:150px;"
                  :src="fileList02[0].url"
                  alt=""
                >
              </div>
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="照片"
            prop="photo"
          >
            <!--            <ImageSelect -->
            <!--              :signUrl="inputForm.certificatePath ? filePrefix + inputForm.certificatePath  : ''" -->
            <!--              width="100px" -->
            <!--              height="100px" -->
            <!--              @fileChange="fileChangeEvt" -->
            <!--              v-if="visible"/> -->
            <el-upload
              :action="`${actionUrl}?fileType=USER_ICON_PATH`"
              :headers="header"
              list-type="picture-card"
              :on-success="fileSuccessFn"
              :auto-upload="true"
              :file-list="fileList"
              :show-file-list="false"
              :limit="1"
              :class="{ hide: hideUpload }"
            >
              <i
                v-if="!fileList.length"
                class="el-icon-plus"
              />
              <div
                v-if="fileList.length"
                style="position: relative"
              >
                <div
                  v-if="method !== 'view'"
                  style="width: 150px; height: 150px; position: absolute"
                  @click.stop="fileRemoveFn"
                >
                  <i class="el-icon-delete icon" />
                </div>
                <img
                  style="width:150px;height:150px;"
                  :src="fileList[0].url"
                  alt=""
                >
              </div>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-radio-group v-model="inputForm.status">
            <el-radio-button label="1">
              在职
            </el-radio-button>
            <el-radio-button label="2">
              借调
            </el-radio-button>
            <el-radio-button label="3">
              离职
            </el-radio-button>
            <el-radio-button label="4">
              退休
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item
          label="角色"
          prop="roleIdList"
        >
          <el-checkbox-group
            v-model="inputForm.roleIdList"
            style="width: 600px"
          >
            <el-checkbox
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.id"
              :disabled="checkboxDisabled(role.companyId)"
            >
              {{ role.roleName }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-row>
    </el-form>
    <span class="dialog-footer">
      <el-button @click="closeClick">关闭</el-button>
      <el-button
        v-if="method !== 'view'"
        v-noMoreClick
        type="primary"
        @click="doSubmit()"
      >确定</el-button>
    </span>
  </div>
</template>

<style></style>
