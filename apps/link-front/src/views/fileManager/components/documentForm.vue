/* * @Author: xiaorui 文档管理台账的弹框 * @Date: 2023-01-09 15:23:54 * @Last Modified by: xiaorui *
@Last Modified time: 2023-11-02 18:41:44 */
<script>
import SelectTree from '@/components/treeSelect/treeSelect'
import {
  docCodeIsExistFn,
  editDocInfoFn,
  getNewReviewListByDocIdFn,
  reviseDocInfoFn,
  saveDocInfoFn,
} from '@/http/file-manager/document-api'
import { upLoadImg } from '@/http/manage-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import { formatDate } from '@/utils/index'
import FileUpload from '@/views/common-ui/FileUpload'

export default {
  components: {
    SelectTree,
    FileUpload,
  },
  props: {
    docTagList: Array,
    documentTypeList: Array,
  },
  data() {
    const validateDocCode = (rule, value, callback) => {
      docCodeIsExistFn(value).then(({ data }) => {
        if (data.result) {
          callback(new Error('该编码已存在'))
        }
        else {
          callback()
        }
      })
    }
    return {
      visible: false,
      loading: false,
      colWidth: 12,
      title: '文档文件',
      method: '',
      inputForm: {
        docId: '',
        docName: '',
        docCode: '',
        departmentId: '',
        authorId: '',
        reviserId: '', // 修订人员
        docType: '',
        applyDepartmentIds: [],
        docTagIds: [],
        creationDate: '',
        reviseDate: '',
        docRemarks: '',
        docPath: '',
      },
      departList: [], // 部门列表
      userList: [], // 人员列表，新增时为当前登录人员。
      fileProp: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 1, // 最大文件上传数量
        deleteFront: true,
        editable: true,
      },
      dataRule: {
        docName: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        docCode: [
          { required: true, message: '编号不能为空', trigger: 'blur' },
          { required: true, trigger: 'blur', validator: validateDocCode },
        ],
        docType: [{ required: true, message: '类型不能为空', trigger: 'change' }],
        applyDepartmentIds: [{ required: true, message: '请选择适用部门', trigger: 'change' }],
        docPath: [{ required: true, message: '请上传附件', trigger: 'change' }],
      },
      tableData: [], // 修改文档信息时的评审会签记录
    }
  },
  created() {
    getDepartListSimple().then(({ data }) => {
      this.departList = (data.result || []).filter((item) => {
        return item.departmentType === 'DEPARTMENT'
      })
    })
  },
  methods: {
    init(method, obj) {
      this.method = method
      this.visible = true
      const userData = JSON.parse(sessionStorage.getItem('user'))
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        if (method === 'add') {
          this.title = '新增文档文件'
          this.fileProp.oldFileList = []
          this.fileProp.editable = true
          this.inputForm.creationDate = formatDate(new Date())
          this.userList = [
            {
              id: userData.id,
              fullName: userData.fullName,
            },
          ]
          this.inputForm.authorId = userData.id
        }
        else if (method === 'view' || method === 'edit' || method === 'revise') {
          this.fileProp.oldFileList = [
            {
              originalName: obj.docPath,
              attachmentName: obj.docPath,
              filePath: obj.docPath,
            },
          ]
          this.inputForm = this.recover(this.inputForm, obj)
          if (method === 'revise') {
            this.title = '修订文档文件'
            this.userList = [
              {
                id: userData.id,
                fullName: userData.fullName,
              },
            ]
            this.inputForm.reviserId = userData.id
            this.inputForm.reviseDate = formatDate(new Date())
          }
          else {
            this.title = method === 'view' ? '查看文档文件' : '修改会签文件'
            this.userList = [
              {
                id: obj.authorId,
                fullName: obj.authorName,
              },
            ]
          }
          if (method === 'edit' || method === 'revise') {
            this.dataRule.docCode[1].required = false
            this.dataRule.docCode[1].validator = null
            this.fileProp.editable = true
            if (method === 'edit') {
              this.getNewReviewListByDocId(obj.docId)
            }
          }
          else {
            this.fileProp.editable = false
          }
        }
      })
    },
    setDocTag(value) {
      if (value) {
        this.inputForm.docTagIds = value.split(',')
      }
      else {
        this.inputForm.docTagIds = []
      }
    },
    uploadEvt(fileList) {
      if (fileList.length) {
        upLoadImg(fileList[0], 'DOC_PATH').then(({ data }) => {
          if (data.success) {
            this.inputForm.docPath = data.result
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.inputForm.docPath = ''
      }
    },
    // 删除附件
    delDocPath() {
      this.inputForm.docPath = ''
    },
    // 查询指定文档最新的评审会签纪录
    getNewReviewListByDocId(docId) {
      getNewReviewListByDocIdFn(docId).then(({ data }) => {
        this.tableData = data.result || []
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          const {
            docId,
            docName,
            docCode,
            departmentId,
            authorId,
            reviserId,
            docType,
            applyDepartmentIds,
            docTagIds,
            creationDate,
            docRemarks,
            docPath,
          } = this.inputForm
          let params = {}
          let funcFn
          if (this.method === 'add') {
            params = {
              docName,
              docCode,
              departmentId,
              authorId,
              docType,
              applyDepartmentIds,
              docTagIds,
              creationDate,
              docRemarks,
              docPath,
            }
            funcFn = saveDocInfoFn
          }
          else if (this.method === 'edit') {
            params = { docId, docName, docTagIds, docRemarks, docPath }
            funcFn = editDocInfoFn
          }
          else if (this.method === 'revise') {
            params = {
              docId,
              docName,
              docTagIds,
              docRemarks,
              docPath,
              reviserId,
            }
            funcFn = reviseDocInfoFn
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

    :visible.sync="visible"
    class="normal-dialog"
    @close="closeFn"
  >
    <el-form
      ref="inputForm"
      v-loading="loading"
      :model="inputForm"
      :rules="dataRule"
      label-width="100px"
      :disabled="method === 'view'"
      @submit.native.prevent
    >
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="文件名称"
            prop="docName"
          >
            <el-input v-model="inputForm.docName" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="文件编号"
            prop="docCode"
          >
            <el-input
              v-model="inputForm.docCode"
              :disabled="method !== 'add'"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="文件归属部门"
            prop="departmentId"
          >
            <el-select
              v-model="inputForm.departmentId"
              placeholder="请选择"
              filterable
              style="width: 100%"
              :disabled="method !== 'add'"
            >
              <el-option
                v-for="item in departList"
                :key="item.id"
                :label="item.departmentName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            v-if="method !== 'revise'"
            label="填写人员"
            prop="authorId"
          >
            <el-select
              v-model="inputForm.authorId"
              placeholder="请选择"
              style="width: 100%"
              disabled
            >
              <el-option
                v-for="item in userList"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-else
            label="修订人员"
            prop="reviserId"
          >
            <el-select
              v-model="inputForm.reviserId"
              placeholder="请选择"
              style="width: 100%"
              disabled
            >
              <el-option
                v-for="item in userList"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        label="文档类型"
        prop="docType"
      >
        <el-select
          v-model="inputForm.docType"
          placeholder="请选择"
          style="width: 100%"
          clearable
          :disabled="method !== 'add'"
        >
          <el-option
            v-for="item in documentTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <br>
      <el-form-item
        label="文档标签"
        prop="docTagIds"
      >
        <SelectTree
          ref="officeTree"
          :props="{
            value: 'id', // ID字段名
            label: 'tagName', // 显示名称
            children: 'children', // 子级字段名
          }"
          :list="docTagList"
          :value="inputForm.docTagIds.join(',')"
          :clearable="true"
          :accordion="true"
          :showCheckbox="true"
          style="width: 100%"
          @getValue="setDocTag"
        />
      </el-form-item>
      <br>
      <el-form-item
        label="适用部门"
        prop="applyDepartmentIds"
      >
        <el-select
          v-model="inputForm.applyDepartmentIds"
          placeholder="请选择"
          filterable
          style="width: 100%"
          :disabled="method !== 'add'"
          multiple
        >
          <el-option
            v-for="item in departList"
            :key="item.id"
            :label="item.departmentName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <br>
      <el-form-item
        v-if="method !== 'revise'"
        label="填报时间"
        prop="creationDate"
      >
        <el-date-picker
          v-model="inputForm.creationDate"
          type="datetime"
          placeholder="选择填报时间"
          value-format="yyyy-MM-dd HH:mm:ss"
        />
      </el-form-item>
      <el-form-item
        v-else
        label="修订时间"
        prop="reviseDate"
      >
        <el-date-picker
          v-model="inputForm.reviseDate"
          disabled
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
        />
      </el-form-item>
      <el-form-item
        label="文档备注"
        prop="docRemarks"
      >
        <el-input
          v-model="inputForm.docRemarks"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
        />
      </el-form-item>
      <el-form-item
        label="文档附件"
        style="width: 500px"
        prop="docPath"
      >
        <FileUpload
          v-if="visible"
          v-bind="fileProp"
          @upload="uploadEvt"
          @delSucc="delDocPath"
        />
      </el-form-item>
    </el-form>
    <template v-if="method === 'edit'">
      <div class="review-list-title">
        评审会签记录
      </div>
      <el-table
        :data="tableData"
        :header-cell-style="{ background: '#f5f5f5' }"
        align="center"
        :height="300"
      >
        <el-table-column
          label="文档/文件名称"
          align="center"
          prop="docName"
          min-width="100"
        />
        <el-table-column
          label="文档编号"
          align="center"
          prop="docCode"
          min-width="100"
        />
        <el-table-column
          label="会签时间"
          align="center"
          prop="reviewDate"
          min-width="100"
        />
        <el-table-column
          label="会签人"
          align="center"
          prop="reviewerName"
          min-width="100"
        />
        <el-table-column
          label="会签状态"
          align="center"
          prop="reviewState"
          min-width="100"
        >
          <template slot-scope="props">
            <el-tag
              v-if="props.row.reviewState === -1"
              type="info"
            >
              等待上一步评审完成
            </el-tag>
            <el-tag
              v-if="props.row.reviewState === 0"
              type="warning"
            >
              未评审
            </el-tag>
            <el-tag
              v-if="props.row.reviewState === 1"
              type="danger"
            >
              拒绝
            </el-tag>
            <el-tag
              v-if="props.row.reviewState === 2"
              type="success"
            >
              通过
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="会签意见"
          align="center"
          prop="reviewOpinion"
          min-width="150"
        />
      </el-table>
    </template>
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
</template>

<style lang="scss" scoped>
.review-list-title {
  font-weight: bolder;
  position: relative;
  text-indent: 12px;
  margin-bottom: 12px;
}
.review-list-title::before {
  content: '';
  width: 6px;
  height: 14px;
  background: #11c8e5;
  position: absolute;
  left: 0;
}
</style>
