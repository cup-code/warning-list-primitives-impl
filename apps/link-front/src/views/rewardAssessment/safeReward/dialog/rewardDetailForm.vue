/* * @Author: xiaorui 安全奖励新增、审核弹框 * @Date: 2023-03-28 15:50:50 * @Last Modified by:
xiaorui * @Last Modified time: 2023-11-02 18:47:09 */
<script>
import SelectTree from '@/components/treeSelect/treeSelect'
import { getFiledDocListFn } from '@/http/file-manager/document-api'
import { upLoadImg } from '@/http/manage-api'
import {
  approveRecordFn,
  editSafeRewardDetailFn,
  getMyIncentiveLevelFn,
  getSafeRewardDetailFn,
  saveSafeRewardFn,
} from '@/http/rewardAssessment/reward'
import {
  getAllDepartByCompanyFn,
  getAllUsersByCompany,
} from '@/http/safe-production/depart-manage-api'
import { getContractorInfoFn } from '@/http/safe-production/user-manage-api'
import { showFileWindow } from '@/utils/checkFile.js'
import FileUpload from '@/views/common-ui/FileUpload'
import ChoosePeopleData from './choosePeopleData'

export default {
  components: {
    SelectTree,
    FileUpload,
    ChoosePeopleData,
  },
  data() {
    return {
      visible: false,
      loading: false,
      colWidth: 12,
      title: '安全奖励',
      method: '',
      personList: [], // 所有人员列表
      docList: [], // 奖励依据文档列表
      levelList: [], // 奖励级别list
      isContractorList: [
        {
          label: '是',
          value: true,
        },
        {
          label: '否',
          value: false,
        },
      ],
      inputForm: {
        id: '',
        initiatorId: '', // 发起人id
        initiatorDepId: '', // 发起人部门id
        rewardDate: '', // 奖励日期
        itemDTOList: [], // 被奖励人员列表
        rewardTotalAmount: 0, // 奖励金额汇总
        rewardLevel: '', // 奖励级别
        rewardDepNames: '', // 奖励执行部门name集合，不需要传后台
        rewardType: '', // 奖励类型
        rewardBasis: [], // 奖励依据文档
        basisDes: '', // 奖励依据描述
        factDes: '', // 事实描述
        illustrate: '', // 情况说明
        filePath: '', // 附件路径
        agree: '', // 审批结果
        comments: '', // 审批意见
      },
      departList: [], // 租户下所有部门列表
      initiatorList: [], // 发起人列表，新增时为当前登录人员。
      initiatorDepList: [], // 发起人部门列表，新增时为当前登录人员部门
      fileProp: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 1, // 最大文件上传数量
        deleteFront: true,
        editable: true,
      },
      dataRule: {
        rewardDate: [{ required: true, message: '请选择奖励日期', trigger: 'change' }],
        rewardLevel: [{ required: true, message: '请选择奖励级别', trigger: 'change' }],
        rewardType: [{ required: true, message: '请选择奖励类型', trigger: 'change' }],
        rewardBasis: [{ required: true, message: '请选择奖励依据文档', trigger: 'change' }],
        basisDes: [{ required: true, message: '请输入奖励依据描述', trigger: 'blur' }],
        factDes: [{ required: true, message: '请输入事实描述', trigger: 'blur' }],
        illustrate: [{ required: true, message: '请输入整改情况说明', trigger: 'blur' }],
      },
      showPeopleDialog: false, // 选择责任人弹框是否显示
      peopleProp: {}, // 选择人员组件传递信息
    }
  },
  created() {
    const userData = JSON.parse(sessionStorage.getItem('user'))
    Promise.all([
      getAllDepartByCompanyFn(userData.companyId),
      getAllUsersByCompany(userData.companyId),
      getFiledDocListFn(),
      getMyIncentiveLevelFn(),
    ])
      .then((res) => {
        this.departList = res[0].data.result || []
        this.personList = res[1].data.result || []
        this.docList = (res[2].data.result || []).map((item) => {
          return {
            docId: item.docId,
            docName: item.docName,
            docPath: item.docPath,
          }
        })
        // 获取当前登录用户可选的奖励/激励级别
        this.levelList = res[3].data.result || []
      })
      .catch((err) => {
        // this.$message.error('获取列表失败')
      })
  },
  methods: {
    showFileWindow,
    init(method, id) {
      this.method = method
      this.visible = true
      const userData = JSON.parse(sessionStorage.getItem('user'))
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        if (method === 'add') {
          this.title = '新增安全奖励'
          this.fileProp.oldFileList = []
          this.fileProp.editable = true
          this.initiatorList = [
            {
              id: userData.id,
              fullName: userData.fullName,
            },
          ]
          this.initiatorDepList = [
            {
              id: userData.departTypeDepartId,
              departmentName: userData.departTypeDepartName,
            },
          ]
          this.inputForm.id = ''
          this.inputForm.itemDTOList = []
          // 发起人默认为当前登录人
          this.inputForm.initiatorId = userData.id
          this.inputForm.initiatorDepId = userData.departTypeDepartId
        }
        else if (method === 'view' || method === 'edit' || method === 'review') {
          this.fileProp.editable = false
          this.rewardItemId = id // 保存奖励项id，审批和修改的时候需要传给后台
          getSafeRewardDetailFn(id).then(({ data }) => {
            if (data.result.filePath) {
              this.fileProp.oldFileList = [
                {
                  originalName: data.result.filePath,
                  attachmentName: data.result.filePath,
                  filePath: data.result.filePath,
                },
              ]
            }
            this.initiatorList = [
              {
                id: data.result.initiatorId,
                fullName: data.result.initiatorUserName,
              },
            ]
            this.initiatorDepList = [
              {
                id: data.result.initiatorDepId,
                departmentName: data.result.initiatorDepName,
              },
            ]
            data.result.rewardDepNames = data.result.itemVO.executeDepartmentName
            data.result.itemDTOList = [data.result.itemVO]
            // 赋值审批结果
            data.result.agree
              = data.result.itemVO.rewardStatus === 1
                ? ''
                : data.result.itemVO.rewardStatus !== 2
            // 赋值审批意见
            data.result.comments = data.result.itemVO.rewardComments || ''
            this.inputForm = this.recover(this.inputForm, data.result)
          })
          if (method === 'review') {
            this.title = '审批安全奖励'
          }
          else {
            this.title = method === 'view' ? '查看安全奖励' : '修改安全奖励'
          }
        }
      })
    },
    // 添加被奖励人
    addRewardPerson() {
      this.inputForm.itemDTOList.push({
        rewardUserId: '', // 被奖励人id
        rewardUserName: '', // 被奖励人name
        rewardDepartmentId: '', // 被奖励人所属部门
        rewardDepartmentName: '', // 被奖励人所属部门name
        rewardObject: '', // 奖励对象类型
        thirdPartId: '', // 三方单位
        isContractor: '', // 是否承包商
        rewardCategory: '', // 奖励类别
        rewardAmount: '', // 奖励金额
        executeDepartmentId: '', // 执行部门id
        executeDepartmentName: '', // 执行部门name
        approverId: '', // 审批人id
      })
    },
    // 引用安全随手拍数据
    choosePeople() {
      this.$refs.choosePeopleData.init()
    },
    // 提交引用随手拍数据
    submitChoosePeople(res) {
      const peopleData = res.data
      peopleData.forEach((item) => {
        const currentPeople
          = this.personList.find((person) => {
            return person.id === item.checkUserId
          }) || {}
        // 如果被考核人是承包商类型的。需要请求接口拿到考核部门和负责人
        if (currentPeople.userType === 'contractor') {
          getContractorInfoFn(currentPeople.departmentId).then(({ data }) => {
            this.inputForm.itemDTOList.push({
              rewardUserId: currentPeople.id, // 被奖励人id
              rewardUserName: currentPeople.fullName, // 被奖励人name
              rewardDepartmentId: data.result.competentDepartmentId, // 被奖励人所属部门
              rewardDepartmentName: data.result.competentDepartmentName, // 被奖励人所属部门name
              rewardObject: 2, // 奖励对象类型
              thirdPartId: currentPeople.departmentId, // 三方单位
              isContractor: true, // 是否承包商
              rewardCategory: 4, // 奖励类别
              rewardAmount: '', // 奖励金额
              executeDepartmentId: data.result.competentDepartmentId, // 执行部门id
              executeDepartmentName: data.result.competentDepartmentName, // 执行部门name
              approverId: data.result.competentDepartmentHeadId, // 审批人id
            })
            // 设置考核执行部门输入框的内容
            this.inputForm.rewardDepNames = this.inputForm.itemDTOList
              .map((item) => {
                return item.executeDepartmentName
              })
              .join(',')
          })
        }
        else {
          this.inputForm.itemDTOList.push({
            rewardUserId: currentPeople.id, // 被奖励人id
            rewardUserName: currentPeople.fullName, // 被奖励人name
            rewardDepartmentId: currentPeople.departTypeDepartId, // 被奖励人所属部门
            rewardDepartmentName: currentPeople.departTypeDepartName, // 被奖励人所属部门name
            rewardObject: 1, // 奖励对象类型
            thirdPartId: '', // 三方单位
            isContractor: false, // 是否承包商
            rewardCategory: 4, // 奖励类别
            rewardAmount: '', // 奖励金额
            executeDepartmentId: currentPeople.departTypeDepartId, // 执行部门id
            executeDepartmentName: currentPeople.departTypeDepartName, // 执行部门name
            approverId: currentPeople.departTypeMainHeaderId, // 审批人id
          })
          this.inputForm.rewardDepNames = this.inputForm.itemDTOList
            .map((item) => {
              return item.executeDepartmentName
            })
            .join(',')
        }
      })
    },
    // 删除被奖励人
    deleteRewardPerson(index) {
      this.inputForm.itemDTOList.splice(index, 1)
      this.inputForm.rewardDepNames = this.inputForm.itemDTOList
        .map((item) => {
          return item.executeDepartmentName
        })
        .join(',')
    },
    // 选择被奖励人
    pickPeople(row) {
      this.currentRow = row
      this.peopleProp.oldPickData = {
        id: row.rewardUserId || '',
        fullName: row.rewardUserName || '',
      }
      this.peopleProp.isSingle = true
      this.peopleProp.listType = 'company'
      this.showPeopleDialog = true
    },
    // 选择责任人之后的回调
    closePeopleEvt(params) {
      if (params) {
        this.getItemDep(params.data)
      }
      this.showPeopleDialog = false
    },
    // 获取被奖励人的部门
    getItemDep(currentUser) {
      this.currentRow.rewardUserId = currentUser.id
      this.currentRow.rewardUserName = currentUser.fullName
      // 如果被考核人是承包商类型的。需要请求接口拿到考核部门和负责人
      if (currentUser.userType === 'contractor') {
        getContractorInfoFn(currentUser.departmentId).then(({ data }) => {
          this.currentRow.rewardDepartmentId = data.result.competentDepartmentId
          this.currentRow.rewardDepartmentName = data.result.competentDepartmentName
          this.currentRow.executeDepartmentId = data.result.competentDepartmentId
          this.currentRow.executeDepartmentName = data.result.competentDepartmentName
          this.currentRow.approverId = data.result.competentDepartmentHeadId
          this.currentRow.rewardObject = 2
          this.currentRow.thirdPartId = currentUser.departmentId
          this.currentRow.isContractor = true
          // 设置考核执行部门输入框的内容
          this.inputForm.rewardDepNames = this.inputForm.itemDTOList
            .map((item) => {
              return item.executeDepartmentName
            })
            .join(',')
        })
      }
      else {
        // 按照pingcode上AQJM-767要求，被奖励人单位展示部门类型的组织架构
        this.currentRow.rewardDepartmentId = currentUser.departTypeDepartId
        this.currentRow.rewardDepartmentName = currentUser.departTypeDepartName
        // 执行部门为所属部门级组织架构的id
        this.currentRow.executeDepartmentId = currentUser.departTypeDepartId
        this.currentRow.executeDepartmentName = currentUser.departTypeDepartName
        // 审批人为所属部门级组织架构的主负责人用户id
        this.currentRow.approverId = currentUser.departTypeMainHeaderId
        this.currentRow.rewardObject = 1
        this.currentRow.isContractor = false // 默认不为承包商
        // 设置考核执行部门输入框的内容
        this.inputForm.rewardDepNames = this.inputForm.itemDTOList
          .map((item) => {
            return item.executeDepartmentName
          })
          .join(',')
      }
    },
    // 设置三方单位的id和name
    setThirdPartId(id, name, row) {
      if (id) {
        row.thirdPartId = id
        row.thirdPartName = name
      }
    },
    uploadEvt(fileList) {
      if (fileList.length) {
        upLoadImg(fileList[fileList.length - 1], 'DOC_PATH').then(({ data }) => {
          if (data.success) {
            this.inputForm.filePath = data.result
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.inputForm.filePath = ''
      }
    },
    // 删除附件
    delDocPath() {
      this.inputForm.filePath = ''
    },
    // 表单提交
    doSubmit() {
      // return
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          const {
            id,
            initiatorId,
            initiatorDepId,
            rewardDate,
            itemDTOList,
            rewardTotalAmount,
            rewardLevel,
            rewardType,
            rewardBasis,
            basisDes,
            factDes,
            illustrate,
            filePath,
            agree,
            comments,
          } = this.inputForm
          // 可选最高奖励级别,后台需要
          const topRewardLevel = this.levelList[0].code
          let params = {}
          let funcFn
          if (this.method === 'add') {
            params = {
              id,
              initiatorId,
              initiatorDepId,
              rewardDate,
              itemDTOList,
              rewardTotalAmount,
              rewardLevel,
              rewardType,
              rewardBasis,
              basisDes,
              factDes,
              illustrate,
              filePath,
              topRewardLevel,
            }
            funcFn = saveSafeRewardFn
          }
          else if (this.method === 'edit') {
            params = itemDTOList[0]
            params = Object.assign(params, {
              topRewardLevel,
              id: this.rewardItemId,
            })
            funcFn = editSafeRewardDetailFn
          }
          else if (this.method === 'review') {
            params = { id: this.rewardItemId, agree, comments, type: 2 }
            funcFn = approveRecordFn
          }
          funcFn(params)
            .then(({ data }) => {
              if (data && data.success) {
                this.$message.success(data.message || '保存成功')
                this.visible = false
                this.$emit('refreshDataList')
              }
              else {
                this.$message.warning(data.message || '保存失败')
              }
            })
            .catch((err) => {
              this.$message.error('保存失败')
            })
            .finally(() => {
              this.loading = false
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
  <el-dialog
    :title="title"
    :close-on-click-modal="false"
    :append-to-body="true"

    :visible.sync="visible"
    class="normal-dialog"
    width="800px"
    @close="closeFn"
  >
    <el-form
      ref="inputForm"
      v-loading="loading"
      :model="inputForm"
      :rules="dataRule"
      label-width="120px"
      :disabled="method === 'view'"
      @submit.native.prevent
    >
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="发起人"
            prop="initiatorId"
          >
            <el-select
              v-model="inputForm.initiatorId"
              placeholder="请选择"
              style="width: 100%"
              disabled
            >
              <el-option
                v-for="item in initiatorList"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="发起人部门"
            prop="initiatorDepId"
          >
            <el-select
              v-model="inputForm.initiatorDepId"
              placeholder="请选择"
              style="width: 100%"
              disabled
            >
              <el-option
                v-for="item in initiatorDepList"
                :key="item.id"
                :label="item.departmentName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="奖励日期"
            prop="rewardDate"
          >
            <el-date-picker
              v-model="inputForm.rewardDate"
              type="date"
              placeholder="选择奖励日期"
              value-format="yyyy-MM-dd"
              style="width: 100%"
              :disabled="method !== 'add'"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-button
        v-if="method === 'add'"
        icon="el-icon-plus"
        type="primary"
        plain
        style="margin: 0 10px 10px 0"
        @click="addRewardPerson"
      >
        添加被奖励人员
      </el-button>
      <el-button
        v-if="method === 'add'"
        icon="el-icon-plus"
        type="primary"
        plain
        style="margin-bottom: 10px"
        @click="choosePeople"
      >
        引用安全随手拍数据
      </el-button>
      <el-table
        :data="inputForm.itemDTOList"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        style="margin-bottom: 10px"
      >
        <el-table-column
          label="序号"
          type="index"
          width="50"
        />
        <el-table-column
          align="center"
          label="被奖励人姓名"
          min-width="130"
        >
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.rewardUserName"
              style="width: 100px"
              readonly
              :disabled="method !== 'add'"
              @focus="pickPeople(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="被奖励人单位"
          min-width="160"
        >
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.rewardDepartmentName"
              disabled
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="奖励对象"
          min-width="130"
        >
          <template slot-scope="scope">
            <el-select
              v-model="scope.row.rewardObject"
              filterable
              clearable
              style="width: 120px"
              disabled
            >
              <el-option
                v-for="item in $dictUtils.getDictList('assess_object')"
                :key="item.id"
                :label="item.dictName"
                :value="+item.dictCode"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="三方单位名称"
          min-width="160"
        >
          <template slot-scope="scope">
            <SelectTree
              style="width: 150px"
              :list="departList"
              :props="{
                value: 'id',
                label: 'departmentName',
                children: 'children',
              }"
              :value="scope.row.thirdPartId"
              :label="scope.row.thirdPartName"
              disabled
              @getValue="(val, name) => setThirdPartId(val, name, scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="是否承包商"
          min-width="100"
        >
          <template slot-scope="scope">
            <el-select
              v-model="scope.row.isContractor"
              filterable
              clearable
              disabled
            >
              <el-option
                v-for="item in isContractorList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="奖励类别"
          min-width="100"
        >
          <template slot-scope="scope">
            <el-select
              v-model="scope.row.rewardCategory"
              placeholder="请选择"
              filterable
              style="width: 100%"
              :disabled="method === 'review'"
            >
              <el-option
                v-for="item in $dictUtils.getDictList('reward_category')"
                :key="item.id"
                :label="item.dictName"
                :value="+item.dictCode"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="奖励金额"
          min-width="110"
        >
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.rewardAmount"
              controls-position="right"
              :min="0"
              style="width: 100px"
              :disabled="method === 'review'"
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="method === 'add'"
          label="操作"
          align="center"
          width="100"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              style="color: var(--ky-danger)"
              type="text"
              @click="deleteRewardPerson(scope.$index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- <el-row>
        <el-col :span='colWidth'>
          <el-form-item label="奖励金额(汇总)" prop="rewardTotalAmount">
            <el-input-number v-model="inputForm.rewardTotalAmount" controls-position="right" :min="0" style="width: 150px;"></el-input-number>
          </el-form-item>
        </el-col>
      </el-row> -->
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="奖励级别"
            prop="rewardLevel"
          >
            <el-select
              v-model="inputForm.rewardLevel"
              placeholder="请选择"
              filterable
              style="width: 100%"
              :disabled="method !== 'add'"
            >
              <el-option
                v-for="item in levelList"
                :key="item.code"
                :label="item.desc"
                :value="item.code"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="奖励类型"
            prop="rewardType"
          >
            <el-select
              v-model="inputForm.rewardType"
              placeholder="请选择"
              filterable
              style="width: 100%"
              :disabled="method !== 'add'"
            >
              <el-option
                v-for="item in $dictUtils.getDictList('assess_type')"
                :key="item.id"
                :label="item.dictName"
                :value="+item.dictCode"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item
          label="奖励执行部门"
          prop="rewardDepNames"
        >
          <el-input
            v-model="inputForm.rewardDepNames"
            disabled
          />
        </el-form-item>
      </el-row>
      <el-form-item
        label="奖励依据文档"
        prop="rewardBasis"
      >
        <el-select
          v-model="inputForm.rewardBasis"
          placeholder="请选择"
          filterable
          multiple
          style="width: 100%"
          value-key="docId"
          :disabled="method !== 'add'"
        >
          <el-option
            v-for="item in docList"
            :key="item.docId"
            :label="item.docName"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="inputForm.rewardBasis.length"
        label="查看文档"
      >
        <el-link
          v-for="item in inputForm.rewardBasis"
          :key="item.docId"
          type="primary"
          @click="showFileWindow(item.docPath)"
        >
          {{ item.docName }}
        </el-link>
      </el-form-item>
      <el-form-item
        label="奖励依据描述"
        prop="basisDes"
      >
        <el-input
          v-model="inputForm.basisDes"
          type="textarea"
          :rows="2"
          placeholder="请输入奖励依据描述"
          :disabled="method !== 'add'"
        />
      </el-form-item>
      <el-form-item
        label="事实描述"
        prop="factDes"
      >
        <el-input
          v-model="inputForm.factDes"
          type="textarea"
          :rows="2"
          placeholder="请输入事实描述"
          :disabled="method !== 'add'"
        />
      </el-form-item>
      <el-form-item
        label="整改情况说明"
        prop="illustrate"
      >
        <el-input
          v-model="inputForm.illustrate"
          type="textarea"
          :rows="2"
          placeholder="请输入整改情况说明"
          :disabled="method !== 'add'"
        />
      </el-form-item>
      <el-form-item
        label="附件"
        style="width: 500px"
        prop="filePath"
      >
        <FileUpload
          v-if="visible"
          v-bind="fileProp"
          @upload="uploadEvt"
          @delSucc="delDocPath"
        />
      </el-form-item>
      <el-form-item
        v-if="method === 'view' || method === 'review'"
        label="审批结果"
        prop="agree"
      >
        <el-radio-group
          v-model="inputForm.agree"
          :disabled="method !== 'review'"
        >
          <el-radio :label="true">
            同意
          </el-radio>
          <el-radio :label="false">
            拒绝
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        v-if="method === 'view' || method === 'review'"
        label="审批意见"
        prop="comments"
      >
        <el-input
          v-model="inputForm.comments"
          type="textarea"
          :rows="2"
          placeholder="请输入审批意见"
          :disabled="method !== 'review'"
        />
      </el-form-item>
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
        v-noMoreClick
        size="small"
        type="primary"
        @click="doSubmit()"
      >确定</el-button>
    </span>
    <choose-people-data
      ref="choosePeopleData"
      :personList="personList"
      :departList="departList"
      @submitChoosePeople="submitChoosePeople"
    />
    <el-dialog
      class="fixed-dialog"
      title="选择人员"
      :visible.sync="showPeopleDialog"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <KyPickPeople
        v-if="showPeopleDialog"
        v-bind="peopleProp"
        @close="closePeopleEvt"
      />
    </el-dialog>
  </el-dialog>
</template>
