/* * @Author: xiaorui 三违考核详情弹框 * @Date: 2023-03-16 14:44:38 * @Last Modified by:
xiaorui * @Last Modified time: 2023-11-02 18:39:17 */
<script>
import { cloneDeep } from 'lodash'
import SelectTree from '@/components/treeSelect/treeSelect'
import { getFiledDocListFn } from '@/http/file-manager/document-api'
import { upLoadImg } from '@/http/manage-api'
import {
  approveRecordFn,
  editExamineDetailFn,
  getExamineDetailFn,
  getMyIncentiveLevelFn,
  saveThreeViolationFn,
} from '@/http/rewardAssessment/reward'
import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api'
import { getContractorInfoFn } from '@/http/safe-production/user-manage-api'
import { showFileWindow } from '@/utils/checkFile.js'
import FileUpload from '@/views/common-ui/FileUpload'

export default {
  components: {
    SelectTree,
    FileUpload,
  },
  data() {
    return {
      visible: false,
      loading: false,
      colWidth: 12,
      title: '三违考核',
      method: '',
      docList: [], // 考核依据文档列表
      levelList: [], // 考核级别list
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
        assessDate: '', // 考核日期
        itemDTOList: [], // 被考核人员列表
        assessTotalAmount: 0, // 考核金额汇总
        assessLevel: '', // 考核级别
        assessDepNames: '', // 考核执行部门name集合，不需要传后台
        assessType: '', // 考核类型
        assessBasis: [], // 考核依据文档
        basisDes: '', // 考核依据描述
        factDes: '', // 事实描述
        illustrate: '', // 情况说明
        filePath: [], // 附件路径
        agree: '', // 审批结果
        comments: '', // 审批意见
      },
      departList: [], // 租户下所有部门列表
      initiatorList: [], // 发起人列表，新增时为当前登录人员。
      initiatorDepList: [], // 发起人部门列表，新增时为当前登录人员部门
      fileProp: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 3, // 最大文件上传数量
        deleteFront: true,
        editable: true,
      },
      oldFiles: [], // 再次编辑时，需要记录之前上传的附件
      newFiles: [], // 再次编辑时，需要记录新上传的附件
      dataRule: {
        assessDate: [{ required: true, message: '请选择考核日期', trigger: 'change' }],
        assessLevel: [{ required: true, message: '请选择考核级别', trigger: 'change' }],
        assessType: [{ required: true, message: '请选择考核类型', trigger: 'change' }],
        assessBasis: [
          { required: true, message: '请选择考核依据文档', trigger: 'change' },
        ],
        basisDes: [{ required: true, message: '请输入考核依据描述', trigger: 'blur' }],
        factDes: [{ required: true, message: '请输入事实描述', trigger: 'blur' }],
        illustrate: [{ required: true, message: '请输入整改情况说明', trigger: 'blur' }],
      },
      assessStatus: '', // 判断是否是可编辑状态，为0的时候可编辑依据文档和整改说明
      showPeopleDialog: false, // 选择责任人弹框是否显示
      peopleProp: {}, // 选择人员组件传递信息
    }
  },
  created() {
    const userData = JSON.parse(sessionStorage.getItem('user'))
    Promise.all([
      getAllDepartByCompanyFn(userData.companyId),
      getFiledDocListFn(),
      getMyIncentiveLevelFn(),
    ])
      .then((res) => {
        this.departList = res[0].data.result || []
        this.docList = (res[1].data.result || []).map((item) => {
          return {
            docId: item.docId,
            docName: item.docName,
            docPath: item.docPath,
          }
        })
        // 获取当前登录用户可选的考核/激励级别
        this.levelList = res[2].data.result || []
      })
      .catch((err) => {
        // this.$message.error('获取列表失败')
      })
  },
  methods: {
    showFileWindow,
    init(method, id, assessStatus) {
      this.method = method
      this.visible = true
      const userData = JSON.parse(sessionStorage.getItem('user'))
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        if (method === 'add') {
          this.title = '新增三违考核'
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
          this.inputForm.filePath = []
          this.oldFiles = []
          this.newFiles = []
        }
        else if (method === 'view' || method === 'edit' || method === 'review') {
          // console.log(assessStatus)
          this.assessStatus = assessStatus
          this.fileProp.editable = false
          this.assessItemId = id // 保存考核项id，审批和修改的时候需要传给后台
          getExamineDetailFn(id).then(({ data }) => {
            if (data.result.filePath && data.result.filePath.length) {
              this.fileProp.oldFileList = data.result.filePath.map((item) => {
                return {
                  originalName: item,
                  attachmentName: item,
                  filePath: item,
                }
              })
            }
            else {
              this.fileProp.oldFileList = []
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
            data.result.assessDepNames = data.result.itemVO.executeDepartmentName
            data.result.itemDTOList = [data.result.itemVO]
            // 赋值审批结果
            data.result.agree
              = data.result.itemVO.assessStatus === 1
                ? ''
                : data.result.itemVO.assessStatus !== 2
            // 赋值审批意见
            data.result.comments = data.result.itemVO.assessComments || ''
            this.inputForm = this.recover(this.inputForm, data.result)
            // console.log(this.inputForm)
            this.oldFiles = cloneDeep(this.inputForm.filePath) || []
            this.newFiles = []
          })
          if (method === 'review') {
            this.title = '审批三违考核'
          }
          else {
            this.title = method === 'view' ? '查看三违考核' : '修改三违考核'
          }
        }
      })
    },
    // 添加被考核人
    addAssessPerson() {
      this.inputForm.itemDTOList.push({
        examineUserId: '', // 被考核人
        examineUserName: '', // 被考核人name
        examineDepartmentId: '', // 被考核人所属部门
        examineDepartmentName: '', // 被考核人所属部门name
        assessObject: '', // 考核对象类型
        thirdPartId: '', // 三方单位
        isContractor: '', // 是否承包商
        assessCategory: '', // 考核类别
        assessAmount: '', // 考核金额
        deductAmount: '', // 扣除金额
        executeDepartmentId: '', // 执行部门id
        executeDepartmentName: '', // 执行部门name
        approverId: '', // 审批人id
      })
    },
    // 删除被考核人
    deleteAssessPerson(index) {
      this.inputForm.itemDTOList.splice(index, 1)
      this.inputForm.assessDepNames = this.inputForm.itemDTOList
        .map((item) => {
          return item.executeDepartmentName
        })
        .join(',')
    },
    // 选择被考核人
    choosePeople(row) {
      this.currentRow = row
      this.peopleProp.oldPickData = {
        id: row.examineUserId || '',
        fullName: row.examineUserName || '',
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
    // 获取被考核人的部门
    getItemDep(currentUser) {
      this.currentRow.examineUserId = currentUser.id
      this.currentRow.examineUserName = currentUser.fullName
      // 如果被考核人是承包商类型的。需要请求接口拿到考核部门和负责人
      if (currentUser.userType === 'contractor') {
        getContractorInfoFn(currentUser.departmentId).then(({ data }) => {
          // 按照pingcode上AQJM-767要求，被考核人单位展示部门类型的组织架构
          this.currentRow.examineDepartmentId = data.result.competentDepartmentId
          this.currentRow.examineDepartmentName = data.result.competentDepartmentName
          this.currentRow.executeDepartmentId = data.result.competentDepartmentId
          this.currentRow.executeDepartmentName = data.result.competentDepartmentName
          this.currentRow.approverId = data.result.competentDepartmentHeadId
          this.currentRow.assessObject = 2
          this.currentRow.thirdPartId = currentUser.departmentId
          this.currentRow.isContractor = true
          // 设置考核执行部门输入框的内容
          this.inputForm.assessDepNames = this.inputForm.itemDTOList
            .map((item) => {
              return item.executeDepartmentName
            })
            .join(',')
        })
      }
      else {
        // 按照pingcode上AQJM-767要求，被考核人单位展示部门类型的组织架构
        this.currentRow.examineDepartmentId = currentUser.departTypeDepartId
        this.currentRow.examineDepartmentName = currentUser.departTypeDepartName
        // 执行部门为所属部门级组织架构的id
        this.currentRow.executeDepartmentId = currentUser.departTypeDepartId
        this.currentRow.executeDepartmentName = currentUser.departTypeDepartName
        // 审批人为所属部门级组织架构的主负责人用户id
        this.currentRow.approverId = currentUser.departTypeMainHeaderId
        this.currentRow.assessObject = 1
        this.currentRow.isContractor = false // 默认不为承包商
        // 设置考核执行部门输入框的内容
        this.inputForm.assessDepNames = this.inputForm.itemDTOList
          .map((item) => {
            return item.executeDepartmentName
          })
          .join(',')
      }
    },
    // 考核对象为内部人员时，清空三方单位信息
    // objectChange(val, row) {
    //   if (val === 1) {
    //     row.thirdPartId = ''
    //     row.thirdPartName = ''
    //     row.isContractor = false
    //   }
    // },
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
    // 表单提交
    doSubmit() {
      const isEveryItem = this.inputForm.itemDTOList.every((item) => {
        return (
          item.examineUserId
          && item.assessObject
          && item.assessCategory
          && typeof item.isContractor === 'boolean'
        )
      })
      if (!isEveryItem) {
        this.$message.warning('请完善被考核人信息')
        return
      }
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          this.inputForm.filePath = this.oldFiles.concat(this.newFiles)
          const {
            id,
            initiatorId,
            initiatorDepId,
            assessDate,
            itemDTOList,
            assessTotalAmount,
            assessLevel,
            assessType,
            assessBasis,
            basisDes,
            factDes,
            illustrate,
            filePath,
            agree,
            comments,
          } = this.inputForm
          // 可选最高考核级别,后台需要
          const topAssessLevel = this.levelList[0].code
          let params = {}
          let funcFn
          if (this.method === 'add') {
            params = {
              id,
              initiatorId,
              initiatorDepId,
              assessDate,
              itemDTOList,
              assessTotalAmount,
              assessLevel,
              assessType,
              assessBasis,
              basisDes,
              factDes,
              illustrate,
              filePath,
              topAssessLevel,
            }
            funcFn = saveThreeViolationFn
          }
          else if (this.method === 'edit') {
            params = itemDTOList[0]
            params = Object.assign(params, {
              topAssessLevel,
              id: this.assessItemId,
              assessBasis,
              basisDes,
              illustrate,
            })
            funcFn = editExamineDetailFn
          }
          else if (this.method === 'review') {
            params = { id: this.assessItemId, agree, comments, type: 1 }
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
          <el-form-item label="发起人" prop="initiatorId">
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
          <el-form-item label="发起人部门" prop="initiatorDepId">
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
          <el-form-item label="考核日期" prop="assessDate">
            <el-date-picker
              v-model="inputForm.assessDate"
              type="date"
              placeholder="选择考核日期"
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
        style="margin-bottom: 10px"
        @click="addAssessPerson"
      >
        添加被考核人员
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
          label="被考核人姓名"
          min-width="130"
        >
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.examineUserName"
              style="width: 100px"
              readonly
              :disabled="method !== 'add'"
              @focus="choosePeople(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="被考核人单位"
          min-width="160"
        >
          <template slot-scope="scope">
            <el-input v-model="scope.row.examineDepartmentName" disabled />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="考核对象"
          min-width="130"
        >
          <template slot-scope="scope">
            <el-select
              v-model="scope.row.assessObject"
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
          label="考核类别"
          min-width="100"
        >
          <template slot-scope="scope">
            <el-select
              v-model="scope.row.assessCategory"
              placeholder="请选择"
              filterable
              style="width: 100%"
              :disabled="method === 'review'"
            >
              <el-option
                v-for="item in $dictUtils.getDictList('assess_category')"
                :key="item.id"
                :label="item.dictName"
                :value="+item.dictCode"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="考核金额"
          min-width="110"
        >
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.assessAmount"
              controls-position="right"
              :min="0"
              style="width: 100px"
              :disabled="method === 'review'"
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="扣除风险金额"
          min-width="110"
        >
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.deductAmount"
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
              @click="deleteAssessPerson(scope.$index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- <el-row>
        <el-col :span='colWidth'>
          <el-form-item label="考核金额(汇总)" prop="assessTotalAmount">
            <el-input-number v-model="inputForm.assessTotalAmount" controls-position="right" :min="0" style="width: 150px;"></el-input-number>
          </el-form-item>
        </el-col>
      </el-row> -->
      <el-row>
        <el-col :span="colWidth">
          <el-form-item label="考核级别" prop="assessLevel">
            <el-select
              v-model="inputForm.assessLevel"
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
          <el-form-item label="考核类型" prop="assessType">
            <el-select
              v-model="inputForm.assessType"
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
        <el-form-item label="考核执行部门" prop="assessDepNames">
          <el-input v-model="inputForm.assessDepNames" disabled />
        </el-form-item>
      </el-row>
      <el-form-item label="考核依据文档" prop="assessBasis">
        <el-select
          v-model="inputForm.assessBasis"
          placeholder="请选择"
          filterable
          multiple
          style="width: 100%"
          value-key="docId"
          :disabled="method !== 'add' && assessStatus !== 0"
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
        v-if="inputForm.assessBasis && inputForm.assessBasis.length"
        label="查看文档"
      >
        <el-link
          v-for="item in inputForm.assessBasis"
          :key="item.docId"
          type="primary"
          style="margin-right: 10px"
          @click="showFileWindow(item.docPath)"
        >
          {{ item.docName }}
        </el-link>
      </el-form-item>
      <el-form-item label="考核依据描述" prop="basisDes">
        <el-input
          v-model="inputForm.basisDes"
          type="textarea"
          :rows="2"
          placeholder="请输入考核依据描述"
          :disabled="method !== 'add' && assessStatus !== 0"
        />
      </el-form-item>
      <el-form-item label="事实描述" prop="factDes">
        <el-input
          v-model="inputForm.factDes"
          type="textarea"
          :rows="2"
          placeholder="请输入事实描述"
          :disabled="method !== 'add'"
        />
      </el-form-item>
      <el-form-item label="整改情况说明" prop="illustrate">
        <el-input
          v-model="inputForm.illustrate"
          type="textarea"
          :rows="2"
          placeholder="请输入整改情况说明"
          :disabled="method !== 'add' && assessStatus !== 0"
        />
      </el-form-item>
      <el-form-item
        label="附件"
        style="width: 700px"
        prop="filePath"
      >
        <FileUpload
          v-if="visible"
          v-bind="fileProp"
          @upload="uploadEvt"
          @delSucc="delDocPath"
          @delNewUpload="delNewFiles"
        />
      </el-form-item>
      <el-form-item
        v-if="method === 'view' || method === 'review'"
        label="审批结果"
        prop="agree"
      >
        <el-radio-group v-model="inputForm.agree" :disabled="method !== 'review'">
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
    <span slot="footer" class="dialog-footer">
      <el-button
        size="small"
        style="margin: 0 10px 0 0"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        v-if="method !== 'view'"
        v-noMoreClick
        size="small"
        type="primary"
        @click="doSubmit()"
      >确定</el-button>
    </span>
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
