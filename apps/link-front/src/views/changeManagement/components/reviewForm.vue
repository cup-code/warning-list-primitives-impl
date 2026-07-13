<script>
import {
  deleteCheckQuestion,
  deleteHazardAnalyse,
  getByEntityId,
  getChangeReviewDetail,
  saveProblemRectification,
  saveReviewFinish,
  uploadFileList,
} from '@/http/changeManagement/changeManagement-api'
import { getAllUsersByTenant } from '@/http/safe-production/depart-manage-api'
import FileUpload from '@/views/common-ui/FileUpload.vue'
import PickPeople from '@/views/common-ui/PickPeople.vue'
import ReviewContentForm from './reviewContentForm'

export default {
  name: '',
  components: {
    PickPeople,
    FileUpload,
    ReviewContentForm,
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
      showPeopleDialog: false,
      dataRule: {
        checkPersons: [{ required: true, message: '请选择验收人员', trigger: 'change' }],
      },
      peopleProp: {}, // 选择人员组件传递信息
      applicantList: [], // 申请人列表
      applicantListShow: [], // 展示申请人列表
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
      rectificationStatusList: [
        {
          lable: '未整改',
          value: 0,
        },
        {
          lable: '已整改',
          value: 1,
        },
        {
          lable: '逾期未整改',
          value: 2,
        },
        {
          lable: '逾期已整改',
          value: 3,
        },
      ], // 整改状态列表

      // From表单数据
      inputForm: {
        applyRef: '',
        projectName: '',
        fourProperties: 0,
        departmentName: '',
        reviewTime: '',

        applyId: '',
        checkPersons: [],
        checkQuestionDTOS: [],
        fourProject: '',
        hazardAnalyseDTOS: [],
        id: '',
        reviewConclusion: '',
        supplier: '',
        technologyDepartment: '',
        useUsk: '',
        files: [],
      },
      hazardAnalysisTableData: [],
      approveTableData: [],
      // 文件上传组件传参
      fileProp: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
        deleteFront: true,
        editable: this.method === 'review',
      },
      companyId: '',
    }
  },
  watch: {},
  created() {
    if (this.method !== 'add') {
      setTimeout(() => {
        if (this.method == 'reviewView' || this.method == 'review') {
          const query = this.$route.query
          this.inputForm = { ...this.inputForm, ...query }
          this.inputForm.fourProperties = Number(query.fourProperties)
          this.getChangeReviewDetail()
          this.getByEntityId(this.inputForm.id)
          this.getApplicantList()
        }
        else {
          const obj = JSON.parse(JSON.stringify(this.recordData))
          this.inputForm = obj.reviewDetailsVO
          const objData = {
            applyRef: obj.reviewDetailsVO.changeApplyVO.applyRef,
            projectName: obj.reviewDetailsVO.changeApplyVO.projectName,
            fourProperties: obj.reviewDetailsVO.changeApplyVO.fourProperties,
            departmentName: obj.reviewDetailsVO.changeApplyVO.departmentName,
            reviewTime: obj.reviewDetailsVO.reviewTime || '',
          }
          this.inputForm = { ...this.inputForm, ...objData }
          this.approveTableData = this.inputForm.checkQuestionVOS
          this.hazardAnalysisTableData = this.inputForm.hazardAnalyseVOS
          this.getByEntityId(this.inputForm.id)
          this.getApplicantList()
        }
      }, 700)
    }
  },
  methods: {
    // 获取四新评审详情
    getChangeReviewDetail() {
      getChangeReviewDetail(this.inputForm.id).then(({ data }) => {
        if (data.success) {
          this.inputForm = Object.assign({}, this.inputForm, data.result)
          this.hazardAnalysisTableData = data.result.hazardAnalyseVOS || []
          this.approveTableData = data.result.checkQuestionVOS || []
          this.companyId = data.result.changeApplyVO.companyId
        }
      })
    },
    // 获取申请人
    getApplicantList() {
      const tenantId = this.$store.state.user.user.tenantId
      getAllUsersByTenant(tenantId).then(({ data }) => {
        if (data.success) {
          this.applicantList = data.result || []
          if (this.applicantList.length) {
            this.filterUserList()
          }
        }
        else {
          this.$message.warning(data.message || '获取申请人列表失败')
        }
      })
    },
    // 新增问题
    addQuestion(type) {
      if (type == 1) {
        this.hazardAnalysisTableData.push({
          controlMeasure: '',
          hazardAnalyse: '',
          companyId: this.companyId,
          reviewId: this.inputForm.id,
        })
      }
      else {
        this.approveTableData.push({
          askRectifyTime: '',
          checkQuestion: '',
          realityRectifyTime: '',
          rectifyIdea: '',
          rectifyPerson: '',
          companyId: this.companyId,
          rectifyPersonName: '',
          rectifyStatus: 0,
          businessCategory: 0,
          reviewId: this.inputForm.id,
        })
      }
    },
    delFn(index, data, type) {
      this.$confirm('确认删除?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        if (type == 1) {
          this.hazardAnalysisTableData.splice(index, 1)
          if (data.id) {
            deleteHazardAnalyse(data.id).then(({ data }) => {
              if (data.success) {
                this.$message.warning(data.message)
              }
            })
          }
        }
        else {
          this.approveTableData.splice(index, 1)
          if (data.id) {
            deleteCheckQuestion(data.id).then(({ data }) => {
              if (data.success) {
                this.$message.warning(data.message)
              }
            })
          }
        }
      })
    },
    getPersonnelList() {
      this.filterUserList()
    },
    /* 点击选择人员 */
    pickPeopleClick(mark) {
      this.peopleProp.oldPickList = this.setPeopleBack(mark)
      this.peopleProp.mark = mark
      this.peopleProp.listType = 'company'
      this.showPeopleDialog = true
    },
    /* 选择人员弹窗回调 */
    closePeopleEvt(params) {
      if (params) {
        this.setPeople(params.data, params.mark)
      }
      this.showPeopleDialog = false
    },
    /* 选择人员回显数据 */
    setPeopleBack(type) {
      let oldList = []
      const newList = []
      if (type == 'check') {
        oldList = this.inputForm.checkPersons || []
      }
      for (const item of oldList) {
        const obj = { id: item.id, fullName: item.fullName }
        newList.push(obj)
      }
      return newList
    },
    /* 设置选择的人员 type: check评审人员 */
    setPeople(dataList, type) {
      const oldList = []
      for (const item of dataList) {
        const obj = { id: item.id, fullName: item.fullName }
        oldList.push(obj)
      }
      if (type == 'check') {
        this.inputForm.checkPersons = oldList
      }
    },
    /* 移除人员回调 */
    removePeople(index) {
      this.inputForm.checkPersons.splice(index, 1)
    },

    filterUserList(val) {
      if (!val) {
        // 列表中展示的人员
        this.applicantListShow = this.applicantList.slice(0, 10) // 如果之前设置了人员，需要把设置的人员信息加入展示列表中，为了回显
        if (this.inputForm.checkQuestionVOS) {
          for (const key of this.inputForm.checkQuestionVOS) {
            if (key.rectifyPerson) {
              const rectifyPersonId = this.applicantList.find((item) => {
                return item.id === key.rectifyPerson
              })
              if (!this.applicantListShow.includes(rectifyPersonId)) {
                this.applicantListShow.push(rectifyPersonId)
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
    /* 文件上传回调 */
    uploadEvt(fileList) {
      this.inputForm.files = this.fdeWeight(fileList)
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
    uploadFile(message) {
      const upFileData = {
        files: this.inputForm.files,
        entityId: message,
        businessName: 'change_request',
        categoryName: 'IV_rew_review',
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
    getByEntityId(id) {
      getByEntityId(id).then(({ data }) => {
        this.fileProp.oldFileList = data.result.map((res) => {
          return {
            attachmentName: res.originalName,
            filePath: res.urlPath,
          }
        })
      })
    },
    confirmSelection(type, e, index) {
      switch (type) {
        case '整改人':
          this.applicantList.filter((item) => {
            if (e == item.id) {
              this.approveTableData[index].rectifyPersonName = item.fullName
              this.approveTableData[index].rectifyPerson = item.id
            }
          })
          break
      }
    },
    // 提交问题整改
    saveRectifyReform() {
      if (this.inputForm.checkPersons.length === 0) {
        this.$message.error('请选择验收人员')
        return
      }
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          this.inputForm.checkQuestionDTOS = this.approveTableData
          this.inputForm.hazardAnalyseDTOS = this.hazardAnalysisTableData
          delete this.inputForm.checkQuestionVOS
          delete this.inputForm.hazardAnalyseVOS
          this.inputForm.checkQuestionDTOS.map((res) => {
            res.companyId = this.companyId
          })
          this.inputForm.hazardAnalyseDTOS.map((item) => {
            item.companyId = this.companyId
          })
          saveProblemRectification(this.inputForm)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('提交成功')
                if (data.message && this.fileProp.oldFileList) {
                  this.uploadFile(data.message)
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
        }
      })
    },
    // 评审完毕
    doSubmit() {
      if (this.inputForm.checkPersons.length === 0) {
        this.$message.error('请选择验收人员')
        return
      }
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          this.inputForm.checkQuestionDTOS = this.approveTableData
          this.inputForm.hazardAnalyseDTOS = this.hazardAnalysisTableData
          delete this.inputForm.checkQuestionVOS
          delete this.inputForm.hazardAnalyseVOS
          delete this.inputForm.reviewStatus
          this.inputForm.checkQuestionDTOS.map((res) => {
            res.companyId = this.companyId
          })
          this.inputForm.hazardAnalyseDTOS.map((item) => {
            item.companyId = this.companyId
          })
          saveReviewFinish(this.inputForm)
            .then(({ data }) => {
              if (data.code === 200) {
                this.$message.success('提交成功' || data.message)
                if (data.message) {
                  this.uploadFile(data.message)
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
        }
      })
    },
    /* 跳出 */
    jumpOut() {
      this.$router.back()
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
          四新评审
        </h3>
        <span>
          <el-button
            v-show="method == 'review'"
            type="primary"
            :loading="isLoading"
            icon="el-icon-check"
            @click="doSubmit()"
          >评审完毕</el-button>
          <el-button
            v-show="method == 'review'"
            class="add-button"
            :loading="isLoading"
            icon="el-icon-warning-outline"
            @click="saveRectifyReform()"
          >问题整改</el-button>
          <el-button
            icon="el-icon-refresh-right"
            @click="jumpOut()"
          >退出</el-button>
        </span>
      </div>
      <div id="check-accept-box">
        <el-form-item label="申请编号:">
          <div class="big-box">
            {{ inputForm.applyRef }}
          </div>
        </el-form-item>
        <el-form-item label="项目名称:">
          <div class="big-box">
            {{ inputForm.projectName }}
          </div>
        </el-form-item>
        <el-form-item label="四新性质:">
          <el-radio-group
            v-model="inputForm.fourProperties"
            disabled
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
        <el-form-item label="评审部门:">
          <div class="big-box">
            {{ inputForm.departmentName }}
          </div>
        </el-form-item>
        <el-form-item label="评审时间:">
          <div class="big-box">
            {{ inputForm.reviewTime }}
          </div>
        </el-form-item>
        <el-form-item
          label="四新项目简介"
          prop="fourProject"
        >
          <el-input
            v-model="inputForm.fourProject"
            class="big-box"
            type="textarea"
            :rows="4"
            :disabled="method != 'review'"
          />
        </el-form-item>
        <el-form-item
          label="新材料或新设备供应商"
          prop="supplier"
        >
          <el-input
            v-model="inputForm.supplier"
            class="big-box"
            type="textarea"
            :rows="4"
            :disabled="method != 'review'"
          />
        </el-form-item>
        <el-form-item
          label="新技术或新工艺研发部门"
          prop="technologyDepartment"
        >
          <el-input
            v-model="inputForm.technologyDepartment"
            class="big-box"
            type="textarea"
            :rows="4"
            :disabled="method != 'review'"
          />
        </el-form-item>
        <el-form-item
          label="工艺要求或使用要求"
          prop="useUsk"
        >
          <el-input
            v-model="inputForm.useUsk"
            class="big-box"
            type="textarea"
            :rows="4"
            :disabled="method != 'review'"
          />
        </el-form-item>
        <el-form-item label="危险分析">
          <div
            v-if="method == 'review'"
            style="margin-bottom: 10px"
          >
            <el-button
              class="add-button"
              icon="el-icon-plus"
              @click="addQuestion(1)"
            >
              添加危险分析条目
            </el-button>
          </div>
          <template>
            <el-table
              :data="hazardAnalysisTableData"
              row-key="sort"
              :header-cell-style="{ background: 'var(--ky-head-color)' }"
              align="center"
              style="width: 670px"
            >
              <el-table-column
                label="序号"
                type="index"
                width="50"
                align="center"
              />
              <el-table-column
                label="危险分析"
                align="center"
                prop="hazardAnalyse"
                width="150"
              >
                <template slot-scope="scope">
                  <el-input
                    v-model="scope.row.hazardAnalyse"
                    placeholder="请输入"
                    :disabled="method != 'review'"
                  />
                </template>
              </el-table-column>
              <el-table-column
                label="控制措施"
                align="center"
                prop="controlMeasure"
                width="220"
              >
                <template slot-scope="scope">
                  <el-input
                    v-model="scope.row.controlMeasure"
                    style="width: 200px"
                    placeholder="请输入"
                    :disabled="method != 'review'"
                  />
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                min-width="160"
                align="center"
                fixed="right"
              >
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    :disabled="method != 'review'"
                    style="color: var(--ky-danger)"
                    @click="delFn(scope.$index, scope.row, 1)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-form-item>
        <el-form-item
          label="评审结论"
          prop="reviewConclusion"
        >
          <el-input
            v-model="inputForm.reviewConclusion"
            class="big-box"
            type="textarea"
            :rows="4"
            :disabled="method != 'review'"
          />
        </el-form-item>
        <el-form-item
          label="验收人员"
          prop="checkPersons"
        >
          <div
            class="pick-box"
            style="width: 780px"
          >
            <el-button
              v-if="method == 'review'"
              type="primary"
              @click="pickPeopleClick('check')"
            >
              选择人员
            </el-button>
            <el-tag
              v-for="(item, index) in inputForm.checkPersons"
              :key="item.id"
              class="pick-box-tag"
              :closable="method == 'review'"
              @close="removePeople(index)"
            >
              {{ item.fullName }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item
          label="相关附件"
          style="width: 690px"
        >
          <FileUpload
            v-bind="fileProp"
            @upload="uploadEvt"
          />
        </el-form-item>
        <h3 class="title-box">
          安全评审主要内容参考
        </h3>
        <ReviewContentForm />
        <h3 class="title-box">
          安全评审验收问题
        </h3>
        <div
          v-if="method == 'review'"
          style="text-indent: 2em; margin-bottom: 10px"
        >
          <el-button
            class="add-button"
            icon="el-icon-plus"
            @click="addQuestion(2)"
          >
            添加问题条目
          </el-button>
        </div>
        <template>
          <el-table
            :data="approveTableData"
            row-key="sort"
            :header-cell-style="{ background: 'var(--ky-head-color)' }"
            align="center"
            style="margin-left: 20px"
          >
            <el-table-column
              label="序号"
              type="index"
              width="50"
              align="center"
            />
            <el-table-column
              label="验收问题"
              align="center"
              prop="checkQuestion"
              width="150"
            >
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.checkQuestion"
                  class="required"
                  placeholder="请输入"
                  :disabled="method != 'review'"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="整改意见"
              align="center"
              prop="rectifyIdea"
              width="220"
            >
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.rectifyIdea"
                  style="width: 200px"
                  placeholder="请输入"
                  :disabled="method != 'review'"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="要求整改时间"
              align="center"
              prop="askRectifyTime"
              width="220"
            >
              <template slot-scope="scope">
                <el-date-picker
                  v-model="scope.row.askRectifyTime"
                  style="width: 180px"
                  :disabled="method != 'review'"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                  type="datetime"
                  placeholder="选择要求整改时间"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="整改人"
              align="center"
              prop="rectifyPerson"
              width="220"
            >
              <template slot-scope="scope">
                <el-select
                  v-model="scope.row.rectifyPerson"
                  class="small-box mini-box required"
                  placeholder="请输入整改人"
                  filterable
                  clearable
                  :filter-method="filterUserList"
                  :disabled="method !== 'review'"
                  @change="confirmSelection('整改人', $event, scope.$index)"
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
              </template>
            </el-table-column>
            <el-table-column
              label="整改状态"
              align="center"
              prop="rectifyStatus"
              width="220"
            >
              <template slot-scope="scope">
                <el-select
                  v-model="scope.row.rectifyStatus"
                  placeholder="请选择"
                  filterable
                  :disabled="method != 'review'"
                >
                  <el-option
                    v-for="(item, index) in rectificationStatusList"
                    :key="index"
                    :label="item.lable"
                    :value="item.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column
              label="实际整改时间"
              align="center"
              prop="realityRectifyTime"
              width="220"
            >
              <template slot-scope="scope">
                <el-date-picker
                  v-model="scope.row.realityRectifyTime"
                  style="width: 180px"
                  :disabled="method != 'review'"
                  format="yyyy-MM-dd HH:mm:ss"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  type="datetime"
                  placeholder="选择实际整改时间"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              min-width="160"
              align="center"
              fixed="right"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  :disabled="method != 'review'"
                  style="color: var(--ky-danger)"
                  @click="delFn(scope.$index, scope.row, 2)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
    </el-form>
    <!-- 选择人员弹窗 -->
    <el-dialog
      class="normal-dialog"
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

<style scoped lang="scss">
.fromClass {
  .pick-box {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    .pick-box-tag {
      margin: 0 0 0 5px;
    }
  }
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
.required {
  position: relative;
}
.required::before {
  content: '*';
  font-size: 16px;
  color: red;
  position: absolute;
  top: 0;
  left: -10px;
}
</style>
