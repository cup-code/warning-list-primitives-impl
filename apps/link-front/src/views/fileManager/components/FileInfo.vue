<script>
import {
  docKnowledgeBaseAdd,
  docKnowledgeBaseFileDel,
  docKnowledgeBaseGetById,
  docKnowledgeBaseGetReviewAll,
  docKnowledgeBaseUpdate,
} from '@/http/file-manager/fileDoc-api.js'
import { docKnowledgeTypeTreeGetByType } from '@/http/file-manager/fileTree-api.js'
import { showFileWindow } from '@/utils/checkFile.js'

export default {
  props: {
    editable: {
      type: Boolean,
      default: false,
    },
    infoId: {
      type: [String, Number],
      default: null,
    },
  },
  data() {
    return {
      isLoading: false,
      loadingPerson: false,
      accept: [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'application/pdf',
        'application/msword',
        'application/vnd.ms-excel',
        'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      changeData: { files: [] }, // 修改/新增的数据
      fileLimit: 9, // 最大上传数量
      showFiles: [],
      personList: [], // 评审人列表
      typeList: [], // 类型列表
      showTypeName: '', // 展示的名称
    }
  },
  created() {
    if (this.infoId) {
      this.getInfoData()
    }
    this.getDataList()
  },
  methods: {
    /* 获取详情数据 */
    getInfoData() {
      this.isLoading = true
      docKnowledgeBaseGetById(this.infoId)
        .then((res) => {
          if (res.data.success) {
            const resObj = res.data.result
            this.showTypeName = resObj.type.name
            this.showFiles = res.data.result.accessorys
            this.changeData = {
              title: resObj.title,
              typeId: resObj.type.id,
              typeLevel: resObj.type.level,
              issuedDept: resObj.issuedDept,
              issuedNumber: resObj.issuedNumber,
              executeTime: resObj.executeTime ? new Date(resObj.executeTime).getTime() : '',
              reviseTime: resObj.reviseTime ? new Date(resObj.reviseTime).getTime() : '',
              reviewPersonId: resObj.reviewPerson.id,
              versionNumber: resObj.versionNumber,
              remark: resObj.remark,
              files: [],
            }
          }
          else {
            this.$message.warning(res.data.message || '获取详情失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取详情出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 查看文件内容 */
    showFileClick(url) {
      showFileWindow(url)
    },
    /* 获取评审人列表、类型列表 */
    getDataList() {
      this.loadingPerson = true
      docKnowledgeBaseGetReviewAll()
        .then((res) => {
          if (res.data.success) {
            this.personList = res.data.result
          }
          else {
            this.$message.warning(res.data.message || '获取评审人列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取评审人列表出错', err)
        })
        .finally(() => {
          this.loadingPerson = false
        })
      docKnowledgeTypeTreeGetByType()
        .then((res) => {
          if (res.data.success) {
            this.typeList = res.data.result
          }
          else {
            this.$message.warning(res.data.message || '获取类型列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取类型列表出错', err)
        })
    },
    /* 类型下拉列表点击 */
    tableTreeNodeTap(data) {
      this.changeData.typeId = data.id
      this.changeData.typeLevel = data.level
      this.showTypeName = data.name
      this.$refs.tableTypeSelect.blur()
    },
    /* 移除完成回调 */
    handleRemove(file, fileList) {
      this.changeData.files = fileList
    },
    /* 限制上传数量 */
    handleExceed() {
      this.$message.warning(`最多上传 ${this.fileLimit} 个文件！`)
    },
    /* 上传事件 */
    uploadEvt(data) {
      return new Promise((resolve, reject) => {
        if (!this.accept.includes(data.file.type)) {
          this.$message.warning('只能上传png/jpg/jpeg格式的图片、excel或word')
          reject()
        }
        else {
          this.changeData.files.push(data.file)
          resolve()
        }
      })
    },
    /* 删除已上传附件 */
    deleteFileClick(item, index) {
      this.$confirm(`您确定要删除文件<${item.originalName}>吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          docKnowledgeBaseFileDel(item)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('删除成功')
                this.showFiles.splice(index, 1)
              }
              else {
                this.$message.warning(res.data.message || '删除失败')
              }
            })
            .finally(() => {
              this.isLoading = false
            })
        })
        .catch(() => {})
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.fileForm.validate((valid) => {
        if (valid) {
          let submitFunc = docKnowledgeBaseAdd
          if (this.infoId) {
            submitFunc = docKnowledgeBaseUpdate
            this.changeData.id = this.infoId
          }
          this.isLoading = true
          submitFunc(this.changeData)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('保存成功')
                this.$emit('close', true)
              }
              else {
                this.$message.warning(res.data.message || '保存失败')
              }
            })
            .catch((err) => {
              this.$message.error('保存出错', err)
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
  },
}
</script>

<template>
  <div
    v-loading="isLoading"
    class="file-info"
  >
    <el-form
      ref="fileForm"
      inline
      label-width="100px"
      style="width: 750px"
      :model="changeData"
      :disabled="!editable"
    >
      <el-form-item
        label="文档标题"
        prop="title"
        :rules="[{ required: true, message: '请输入文档标题', trigger: 'blur' }]"
      >
        <el-input
          v-model="changeData.title"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="文档类别"
        prop="typeId"
        :rules="[{ required: true, message: '请选择文档类别', trigger: 'blur' }]"
      >
        <el-select
          ref="tableTypeSelect"
          v-model="changeData.typeId"
          style="width: 250px"
        >
          <el-option
            :value="changeData.typeId"
            :label="showTypeName"
          >
            <el-tree
              :data="typeList"
              :props="{ children: 'children', label: 'name' }"
              highlight-current
              :expand-on-click-node="false"
              node-key="id"
              check-strictly
              @node-click="tableTreeNodeTap"
            />
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="发布单位">
        <el-input
          v-model="changeData.issuedDept"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item label="发布文号">
        <el-input
          v-model="changeData.issuedNumber"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item label="实施日期">
        <el-date-picker
          v-model="changeData.executeTime"
          type="date"
          value-format="timestamp"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item label="修订日期">
        <el-date-picker
          v-model="changeData.reviseTime"
          type="date"
          value-format="timestamp"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="评审人"
        prop="reviewPersonId"
        :rules="[{ required: true, message: '请选择评审人', trigger: 'change' }]"
      >
        <!-- <div class="person-box">
          <el-input v-model="changeData.reviewPersonId" disabled />
          <el-button type="primary" class="person-box-btn" v-loading="loadingPerson">人员选择</el-button>
        </div> -->
        <el-select
          v-model="changeData.reviewPersonId"
          style="width: 250px"
          filterable
        >
          <el-option
            v-for="item in personList"
            :key="item.id"
            :value="item.id"
            :label="item.fullName"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="版本号">
        <el-input
          v-model="changeData.versionNumber"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="changeData.remark"
          type="textarea"
          resize="none"
          :rows="4"
          style="width: 610px"
        />
      </el-form-item>
      <el-form-item label="上传文件">
        <div class="file-box">
          <!-- 已上传文件列表 -->
          <div
            v-if="showFiles.length > 0"
            class="filelist-box"
          >
            <div>已上传：</div>
            <div
              v-for="(item, index) in showFiles"
              :key="item.id"
              class="filelist-item"
            >
              <div class="filelist-item-left">
                <i class="el-icon-document" />
                <span>{{ item.originalName }}</span>
                <i
                  class="el-icon-search"
                  style="margin-left: 130px"
                  @click="showFileClick(item.urlPath)"
                />
              </div>
              <i
                v-show="editable"
                class="el-icon-close filelist-item-right"
                @click="deleteFileClick(item, index)"
              />
            </div>
          </div>
          <!-- 继续上传 -->
          <el-upload
            v-if="editable"
            class="file-upload"
            :accept="accept.toString()"
            action="#"
            multiple
            :limit="fileLimit - showFiles.length"
            :disabled="showFiles.length >= 5"
            :on-remove="handleRemove"
            :on-exceed="handleExceed"
            :http-request="uploadEvt"
            :file-list="changeData.files"
          >
            <el-button
              type="primary"
              size="mini"
            >
              上传
            </el-button>
          </el-upload>
        </div>
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button
        size="medium"
        @click="cancelClick"
      >
        取消
      </el-button>
      <el-button
        v-if="editable"
        type="primary"
        size="medium"
        @click="submitClick"
      >
        提交
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.file-info {
  display: flex;
  flex-direction: column;
  align-items: center;

  .person-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 250px;

    .person-box-btn {
      margin: 0 0 0 5px;
      width: 80px;
    }
  }

  .file-box {
    min-height: 100px;
    min-width: 250px;
    // padding: 10px;
    // box-shadow: 0 0 4px 0 rgba(45, 45, 45, 0.2);
    // border: 1px solid lightgray;
    // 上传文件
    .file-upload {
      margin: 5px 0 0 0;
    }

    .filelist-box {
      display: flex;
      flex-direction: column;

      .filelist-item {
        display: flex;
        justify-content: space-between;
        user-select: none;
        height: 25px;

        &:hover {
          background: #f5f7fa;

          .filelist-item-right {
            display: block;
          }
        }

        .filelist-item-left {
          i {
            margin: 0 5px 0 5px;
          }
        }

        .filelist-item-right {
          display: none;
          margin-right: 10px;
          cursor: pointer;
          height: 25px;
          width: 25px;
          line-height: 25px;
          text-align: center;
          color: #409eff;
        }
      }
    }
  }
}
</style>
