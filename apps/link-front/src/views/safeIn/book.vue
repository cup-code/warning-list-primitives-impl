<script>
import { cloneDeep } from 'lodash'
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { upLoadImg } from '@/http/manage-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import {
  deleteSafeRecordById,
  getSafeRecordPage,
  getSafeTypeAll,
  importRecord,
  saveSafeRecord,
} from '@/http/safeIn-api'
import AllDepartmentTree from '@/views/common-ui/AllDepartmentTree.vue'
import { getAuthToken } from '@/utils/tab-session'
import FileUpload from '@/views/common-ui/FileUpload'
import PickPeople from '@/views/common-ui/PickPeople'

export default {
  components: {
    AllDepartmentTree,
    SelectTree,
    FileUpload,
    PickPeople,
  },
  data() {
    return {
      form: {
        pageNum: 1,
        pageSize: 10,
        showMore: false,
      },
      loading: false,
      data: [],
      total: 0,

      editForm: {},
      editRules: {},
      title: '新增项目费用',
      dialog: false,
      editLoading: false,
      editable: true,
      fileProp: {
        editable: this.editable,
        oldFileList: [],
        fileLimit: 9,
        deleteFront: true,
      },
      oldFiles: [], // 再次编辑时，需要记录之前上传的附件
      newFiles: [], // 再次编辑时，需要记录新上传的附件
      hideLeft: false,
      treeWidth: '240px',
      conWidth: 'calc(100% - 240px)',
      typeList: [],
      showPeopleDialog: false,
      peopleProp: {}, // 选择人员组件传递信息
      dataUploadParams: {
        header: {
          Authorization: getAuthToken(),
          clientChannel: 'WEB',
        },
        accept: [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
      },
      departList: [],
    }
  },
  async created() {
    this.getDataList()
    this.getTypeList()
    const departRes = await getDepartListSimple() // 获取当前用户所拥有的部门
    this.departList = (departRes.data.result || []).filter((item) => {
      return item.departmentType === 'DEPARTMENT'
    })
  },
  methods: {
    async getDataList() {
      this.loading = true
      const { data } = await getSafeRecordPage(this.form)
      this.loading = false
      if (data.code == 200) {
        this.data = data.result.list || []
        this.total = data.result.total
      }
      else {
        this.$message.error(data.message || '查询失败')
        this.data = []
        this.total = 0
      }
    },
    async getTypeList() {
      const { data } = await getSafeTypeAll()
      if (data.code == 200) {
        this.typeList = data.result || []
      }
    },
    // 重置
    resetFn() {
      this.form = {
        pageNum: 1,
        pageSize: 10,
        showMore: false,
      }
      this.$refs.companyTree.refreshTree()
    },
    pageSizeFn(v) {
      this.form.pageNum = 1
      this.form.pageSize = v
      this.getDataList()
    },
    pageCurFn(v) {
      this.form.pageNum = v
      this.getDataList()
    },
    treeNodeTap(data) {
      if (data) {
        this.form.departmentId = data.id
      }
      else {
        delete this.form.departmentId
      }
      this.getDataList()
    },
    toggleMore() {
      this.form.showMore = !this.form.showMore
    },
    addFn() {
      this.editable = true
      this.editForm = {
        filePath: [],
      }
      this.fileProp.oldFileList = []
      this.oldFiles = []
      this.newFiles = []
      this.title = '新增项目费用'
      this.dialog = true
    },
    // 保存
    saveFn() {
      this.$refs.editForm.validate((valid) => {
        if (!valid)
          return
        this.editLoading = true
        this.editForm.filePath = this.oldFiles.concat(this.newFiles)
        saveSafeRecord(this.editForm)
          .then(({ data }) => {
            this.editLoading = false
            if (data.code === 200) {
              this.$message.success(data.message || '保存成功')
              this.dialog = false
              this.getDataList()
            }
            else {
              this.$message.error(data.message || '保存失败')
            }
          })
          .catch((err) => {
            this.editLoading = false
          })
      })
    },
    // 文件回调
    uploadEvt(fileList, fileType) {
      if (fileList.length) {
        upLoadImg(fileList[fileList.length - 1], fileType).then(({ data }) => {
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
    // 切换左侧菜单的收起与展现
    toggleLeftFn() {
      this.hideLeft = !this.hideLeft
      if (this.hideLeft) {
        this.treeWidth = '0%'
        this.conWidth = '100%'
      }
      else {
        this.treeWidth = '240px'
        this.conWidth = 'calc(100% - 240px)'
      }
    },
    tranFn(v) {
      const tar = this.typeList.find(item => item.id === v)
      if (tar) {
        return tar.typeName || '-'
      }
      else {
        return ''
      }
    },
    depChange(id, name) {
      // this.editForm.departmentId = id;
      // this.editForm.departmentName = name;
      try {
        this.departList.forEach((item) => {
          if (item.id === id) {
            this.editForm.departmentName = item.departmentName
            throw '已找到'
          }
        })
      }
      catch (err) {}
    },
    // 选择负责人员
    choosePeople() {
      this.peopleProp.oldPickData = {
        id: this.editForm.directorId || '',
        fullName: this.editForm.directorName || '',
      }
      this.peopleProp.isSingle = true
      this.peopleProp.listType = 'company'
      this.showPeopleDialog = true
    },
    // 选择提醒人之后的回调
    closePeopleEvt(params) {
      if (params) {
        this.editForm.directorId = params.data.id
        this.editForm.directorName = params.data.fullName
      }
      this.showPeopleDialog = false
    },
    seeFn(v) {
      this.editable = false
      this.editForm = JSON.parse(JSON.stringify(v))
      if (this.editForm.filePath && this.editForm.filePath.length) {
        this.fileProp.oldFileList = this.editForm.filePath.map((item) => {
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
      this.oldFiles = cloneDeep(this.editForm.filePath) || []
      this.newFiles = []
      this.title = '查看项目费用'
      this.dialog = true
    },
    editFn(v) {
      this.editable = true
      this.editForm = JSON.parse(JSON.stringify(v))
      if (this.editForm.filePath && this.editForm.filePath.length) {
        this.fileProp.oldFileList = this.editForm.filePath.map((item) => {
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
      this.oldFiles = cloneDeep(this.editForm.filePath) || []
      this.newFiles = []
      this.title = '编辑项目费用'
      this.dialog = true
    },
    delFn(v) {
      this.$confirm(`您确认要删除${v.itemName}?`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          deleteSafeRecordById(v.id)
            .then(({ data }) => {
              if (data.code === 200) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(msg || '删除失败')
              }
            })
            .catch((err) => {
              this.$message.error('删除失败')
            })
        })
        .catch(() => {})
    },
    // 下载导入模板
    downloadDataImportTemplateClick() {
      this.$utils.download('/excel/getImportTemplate/safetyInvestmentRecordImport', null)
    },
    // 上传前验证
    onBeforeUpload(file) {
      const me = this
      const isValid = me.dataUploadParams.accept.includes(file.type)
      if (!isValid) {
        this.$message.error('选择的模板文件类型不正确')
      }
      return isValid
    },
    // 上传
    uploadDataImportTemplateClick(data) {
      const params = {
        file: data.file,
      }
      importRecord(params)
        .then(({ data }) => {
          if (data.success) {
            this.$message.success('导入成功')
            this.getDataList()
          }
          else {
            if (data.code === 500) {
              this.$message.warning('请检查字段，如有下拉选项请点击选择！')
            }
            else {
              this.$message.warning(data.message || '导入失败')
            }
          }
        })
        .catch((err) => {
          this.$message.error('导入出错', err)
        })
    },
  },
}
</script>

<template>
  <div class="book-safeIn">
    <div class="leftCon" :style="`width: ${treeWidth}`">
      <AllDepartmentTree
        slot="tree"
        ref="companyTree"
        :hasResponsible="false"
        @treeNodeTap="treeNodeTap"
      />
      <div class="toggle-btn" @click="toggleLeftFn">
        {{ hideLeft ? "展开" : "隐藏" }}
      </div>
    </div>
    <div class="rightCon" :style="`width: ${conWidth}`">
      <!-- 查询条件 -->
      <el-form
        :model="form"
        label-width="60px"
        class="searchForm"
      >
        <el-row>
          <el-col :span="8">
            <el-form-item label="开始时间">
              <el-date-picker
                v-model="form.startDate"
                placeholder="开始时间"
                style="width: 100%"
                type="date"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8" style="padding-left: 10px">
            <el-form-item label="结束时间">
              <el-date-picker
                v-model="form.endDate"
                placeholder="结束时间"
                style="width: 100%"
                type="date"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="8"
            style="padding-left: 10px"
          >
            <el-form-item label="选择科目">
              <SelectTree
                :props="{
                  value: 'id', // ID字段名
                  label: 'typeName', // 显示名称
                  children: 'children', // 子级字段名
                }"
                :list="typeList"
                :value="form.safetyInvestmentTypeId"
                :clearable="false"
                :accordion="true"
                @getValue="(value) => (form.safetyInvestmentTypeId = value)"
              />
            </el-form-item>
          </el-col>
          <el-col v-if="form.showMore" :span="8">
            <el-form-item label="项目名称">
              <el-input v-model="form.itemName" placeholder="项目名称" />
            </el-form-item>
          </el-col>

          <!-- 按钮 -->
          <el-col :span="8" style="padding-left: 10px; margin-bottom: 18px">
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="getDataList"
            >
              查询
            </el-button>
            <el-button icon="el-icon-refresh-right" @click="resetFn">
              重置
            </el-button>
            <el-button
              type="text"
              style="margin-left: 8px"
              @click="toggleMore"
            >
              {{ form.showMore == true ? "收起" : "高级筛选" }}
              <i :class="form.showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
            </el-button>
          </el-col>
        </el-row>
      </el-form>
      <div class="main-box">
        <!-- 功能区域 -->
        <div>
          <el-button
            type="primary"
            icon="el-icon-plus"
            plain
            @click="addFn"
          >
            新增
          </el-button>
          <el-dropdown style="margin: 0 10px">
            <el-button
              type="success"
              icon="el-icon-upload2"
              plain
            >
              导入
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <el-button
                  type="success"
                  icon="el-icon-download"
                  plain
                  @click="downloadDataImportTemplateClick"
                >
                  下载数据模板
                </el-button>
              </el-dropdown-item>

              <el-dropdown-item>
                <el-upload
                  ref="fileUpload"
                  action="#"
                  name="file"
                  :headers="dataUploadParams.header"
                  :limit="1"
                  :accept="dataUploadParams.accept.toString()"
                  :http-request="uploadDataImportTemplateClick"
                  :before-upload="onBeforeUpload"
                  :show-file-list="false"
                  :auto-upload="true"
                >
                  <el-button
                    type="success"
                    icon="el-icon-upload2"
                    plain
                  >
                    导入模板数据
                  </el-button>
                </el-upload>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <!-- 表格 -->
        <el-table
          v-loading="loading"
          :data="data"
          style="width: 100%"
          size="mini"
          :header-cell-style="{ background: '#f5f5f5' }"
          height="100%"
          :border="true"
          class="customer-table"
        >
          <el-table-column
            label="序号"
            type="index"
            align="center"
          />
          <el-table-column
            label="费用生产日期"
            prop="expenseDate"
            align="center"
            width="100"
          />
          <el-table-column
            label="项目名称"
            prop="itemName"
            align="center"
          />
          <el-table-column
            label="安全投入科目"
            prop="investmentTypeId"
            align="center"
            width="100"
          >
            <template slot-scope="scope">
              {{ tranFn(scope.row.investmentTypeId) }}
            </template>
          </el-table-column>
          <el-table-column
            label="金额(元)"
            prop="itemAmount"
            align="center"
          >
            <!-- <template slot-scope="scope">
                            {{scope.row.itemAmount * 10000}}
                        </template> -->
          </el-table-column>
          <el-table-column
            label="负责部门"
            prop="departmentName"
            align="center"
          />
          <el-table-column
            label="负责人"
            prop="directorName"
            align="center"
          />
          <el-table-column
            align="center"
            fixed="right"
            label="操作"
            width="120"
          >
            <template slot-scope="scope">
              <el-button type="text" @click="seeFn(scope.row)">
                查看
              </el-button>
              <el-button
                type="text"
                style="color: var(--ky-warning)"
                @click="editFn(scope.row)"
              >
                修改
              </el-button>
              <el-button
                type="text"
                style="color: var(--ky-danger)"
                @click="delFn(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
          :current-page.sync="form.pageNum"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="form.pageSize"
          layout="total, prev, pager, next, jumper, sizes"
          :total="total"
          @size-change="pageSizeFn"
          @current-change="pageCurFn"
        />
      </div>
    </div>

    <el-dialog
      class="normal-dialog edit-dialog"
      :title="title"
      :visible.sync="dialog"
      width="70%"
    >
      <el-form
        ref="editForm"
        :model="editForm"
        :rules="editRules"
        label-width="85px"
        size="mini"
        :disabled="!editable"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="项目标题" prop="itemName">
              <el-input v-model="editForm.itemName" placeholder="项目标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安全投入科目" prop="investmentTypeId">
              <SelectTree
                :props="{
                  value: 'id', // ID字段名
                  label: 'typeName', // 显示名称
                  children: 'children', // 子级字段名
                }"
                :list="typeList"
                :value="editForm.investmentTypeId"
                :label="tranFn(editForm.investmentTypeId)"
                :clearable="false"
                :accordion="true"
                @getValue="(value) => (editForm.investmentTypeId = value)"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="负责单位"
              prop="departmentId"
              :rules="{
                required: true,
                message: '负责单位不能为空',
                trigger: 'blur',
              }"
            >
              <!-- <SelectTree
                                :props="{
                                    value: 'id', // ID字段名
                                    label: 'departmentName', // 显示名称
                                    children: 'children' // 子级字段名
                                }"
                                :url="`sysDepartment/getSimpleTree`"
                                :value="editForm.departmentId"
                                :clearable="true"
                                :accordion="true"
                                @getValue="depChange"
                            /> -->
              <el-select
                v-model="editForm.departmentId"
                placeholder="请选择"
                filterable
                style="width: 100%"
                @change="depChange"
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
          <el-col :span="12">
            <el-form-item label="项目金额" prop="itemAmount">
              <el-input-number
                v-model="editForm.itemAmount"
                controls-position="right"
                :min="0"
                style="width: 70%"
              />
              (元)
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="费用产生日期" prop="expenseDate">
              <el-date-picker
                v-model="editForm.expenseDate"
                style="width: 100%"
                type="date"
                placeholder="费用产生日期"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人员" prop="directorName">
              <el-input
                v-model="editForm.directorName"
                readonly
                @focus="choosePeople"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="计划附件" prop="filePath">
              <FileUpload
                v-if="dialog"
                v-bind="fileProp"
                fileType="SAFETY_INVESTMENT"
                @upload="uploadEvt"
                @delSucc="delDocPath"
                @delNewUpload="delNewFiles"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remarks">
              <el-input
                v-model="editForm.remarks"
                type="textarea"
                :rows="6"
                placeholder="备注"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog = false">
          {{ editable ? "取消" : "关闭" }}
        </el-button>
        <el-button
          v-show="editable"
          type="primary"
          :loading="editLoading"
          @click="saveFn"
        >
          保存
        </el-button>
      </div>
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

<style lang="scss" scoped>
.book-safeIn {
  height: calc(100vh - 50px);
  background: #f3f7f9;
  display: flex;
  position: relative;
  .leftCon {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    padding: 10px;
    padding-right: 0px;
    .leftTree {
      height: 100%;
    }
    .leftTree .el-card {
      display: flex;
      flex-direction: column;
    }
    .toggle-btn {
      z-index: 1;
      position: absolute;
      top: 50%;
      left: 100%;
      cursor: pointer;
      user-select: none;
      background: rgba($color: #000000, $alpha: 0.1);
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      padding: 5px;
    }
  }
  .rightCon {
    position: absolute;
    top: 0;
    right: 0;
    flex: 1;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 10px;
    .searchForm {
      margin-bottom: 10px;
      padding: 18px 8px 0 10px;
      background: #fff;
    }
    .main-box {
      background: #fff;
      flex: 1;
      overflow: hidden;
      padding: 10px;
      display: flex;
      flex-direction: column;

      .el-table {
        flex: 1;
        margin: 10px 0;
        .el-button + .el-button {
          margin-left: 5px;
        }
      }
      .el-pagination {
        text-align: right;
        padding: 0;
        .el-pagination__sizes {
          margin-right: 0;
          .el-input {
            margin-right: 0;
          }
        }
      }
    }
  }
}

.normal-dialog.edit-dialog {
  .el-dialog__header {
    min-height: 46px;
    .el-dialog__title {
      font-size: 16px;
      &::before {
        height: 20px;
      }
    }
  }
  .el-dialog__footer {
    padding: 8px 20px;
    border-top: 1px solid #e8e8e8;
    .dialog-footer {
      height: 30px;
    }
  }
}
</style>
