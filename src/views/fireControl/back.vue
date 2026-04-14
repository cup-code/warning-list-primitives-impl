<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import {
  fireBackTransfer,
  fireControlReceipt,
  getBackInfoById,
  getBackList,
  uploadFileList,
} from '@/http/fireControl-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import { getUsersByDepartIdFn } from '@/http/safe-production/user-manage-api'
import FileUpload from '@/views/common-ui/FileUpload'
import PersonPick from './components/PersonPick'

export default {
  components: { FileUpload, PersonPick, SelectTree },
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
      departList: [],
      statList: [
        { dictCode: 1, dictName: '已回执' },
        { dictCode: 0, dictName: '未回执' },
      ],
      ynList: [
        { dictCode: 1, dictName: '是' },
        { dictCode: 0, dictName: '否' },
      ],

      dialog: false,
      editable: true,
      editForm: {
        workOrder: {},
        receipt: {},
        receiptFiles: [],
      },
      editRules: {},
      editLoading: false,

      fileProp: {
        editable: this.editable,
        oldFileList: [],
        fileLimit: 9,
      },
      temporaryFiles: {},

      dialog_turn: false,
      userList: [],
      turnForm: {},
      turnRules: {},
    }
  },
  watch: {
    dialog_turn(v) {
      if (v && this.userList.length === 0) {
        getUsersByDepartIdFn(this.editForm.workOrder.department).then(({ data }) => {
          this.userList = data.result || []
        })
      }
    },
  },
  async created() {
    if (this.$route.params.workOrderCode) {
      this.form.workOrderCode = this.$route.params.workOrderCode
    }
    this.getDataList()
    const departRes = await getDepartListSimple() // 获取当前用户所拥有的部门
    this.departList = departRes.data.result || []
  },
  methods: {
    async getDataList() {
      this.loading = true
      const { data } = await getBackList(this.form)
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
    /* 文件上传 */
    async uploadFile(type, id, file) {
      const upFileData = {
        files: file,
        entityId: id,
        businessName: 'fireControl',
        categoryName: `${type}`,
      }
      const uploadFileResult = await uploadFileList(upFileData)
      if (!uploadFileResult.data.success) {
        this.$message.warning(data.message || '文件上传失败')
      }
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
    // 重置
    resetFn() {
      this.form = {
        pageNum: 1,
        pageSize: 10,
        showMore: false,
      }
      this.getDataList()
    },
    // 查看
    seeFn(v) {
      this.editable = false
      getBackInfoById(v.todoTaskId).then(({ data }) => {
        if (data.code === 200) {
          this.editForm = JSON.parse(JSON.stringify(data.result))
          this.dialog = true
          if (this.editForm.receiptFiles.length !== 0) {
            this.fileProp.oldFileList = this.editForm.receiptFiles
          }
          else {
            this.fileProp.oldFileList = []
          }
        }
      })
    },
    // 回执
    editFn(v) {
      this.editable = true
      getBackInfoById(v.todoTaskId).then(({ data }) => {
        if (data.code === 200) {
          this.editForm = JSON.parse(JSON.stringify(data.result))
          this.dialog = true
          if (this.editForm.receiptFiles.length !== 0) {
            this.fileProp.oldFileList = this.editForm.receiptFiles
          }
          else {
            this.fileProp.oldFileList = []
          }
        }
      })
    },
    // 文件回调
    uploadEvt(fileList, fileType) {
      this.temporaryFiles[fileType] = fileList
    },
    // 回执
    backFn() {
      const id = this.editForm.workOrder.workOrderCode
      this.uploadFile('workOrderBack', id, this.temporaryFiles.workOrderBack)
      const receipt = this.editForm.receipt
      const params = {
        description: receipt.description,
        disposalMeasures: receipt.disposalMeasures,
        remark: receipt.remark,
        todoTaskId: receipt.todoTaskId,
        workOrderReceiptType: receipt.workOrderReceiptType,
      }
      fireControlReceipt(params).then(({ data }) => {
        if (data.code === 200) {
          this.dialog = false
          this.getDataList()
        }
        else {
          this.$message.error(data.message || '回执失败')
        }
      })
    },
    // 转办
    turnFn() {
      this.dialog_turn = true
    },
    // 确认转办
    turnDone() {
      this.turnForm.todoTaskId = this.editForm.receipt.todoTaskId

      fireBackTransfer(this.turnForm).then(({ data }) => {
        if (data.code === 200) {
          this.$message.success(data.message || '转办成功')
          this.dialog_turn = false
          this.dialog = false
          this.getDataList()
        }
        else {
          this.$message.error(data.message || '转办失败')
        }
      })
    },
    // 选择人员
    userFn(v) {
      this.turnForm.transferToUserFullName = this.userList.find(item => item.id === v).fullName
    },
    // 关闭人员选择
    closePickEvt() {
      this.dialog_turn = false
    },
    toggleMore() {
      this.form.showMore = !this.form.showMore
    },
  },
}
</script>

<template>
  <div class="backSheet-fireControl">
    <div class="rightCon">
      <!-- 查询条件 -->
      <el-form
        :model="form"
        label-width="60px"
        class="searchForm"
      >
        <el-row>
          <el-col :span="6">
            <el-form-item
              label="工单编号"
              prop="workOrderCode"
            >
              <el-input
                v-model="form.workOrderCode"
                placeholder="工单编号"
              />
            </el-form-item>
          </el-col>
          <el-col
            :span="6"
            style="padding-left: 10px"
          >
            <el-form-item
              label="所属部门"
              prop="department"
            >
              <SelectTree
                :props="{
                  value: 'id', // ID字段名
                  label: 'departmentName', // 显示名称
                  children: 'children', // 子级字段名
                }"
                :list="departList"
                :value="form.department"
                :clearable="true"
                :accordion="true"
                @getValue="
                  value => {
                    form.department = value
                  }
                "
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="6"
            style="padding-left: 10px"
          >
            <el-form-item
              label="回执状态"
              prop="receiptStatus"
            >
              <el-select
                v-model="form.receiptStatus"
                placeholder="回执状态"
                style="width: 100%"
              >
                <el-option
                  v-for="item in statList"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="6"
            style="padding-left: 10px"
          >
            <el-form-item
              label="工单回执类型"
              prop="workOrderType"
              label-width="86px"
            >
              <el-select
                v-model="form.workOrderType"
                placeholder="工单回执类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('back_type')"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictName"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 按钮 -->
          <el-col
            :span="10"
            style="padding-left: 10px; margin-bottom: 18px"
          >
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="getDataList"
            >
              查询
            </el-button>
            <el-button
              icon="el-icon-refresh-right"
              @click="resetFn"
            >
              重置
            </el-button>
            <el-button
              type="text"
              style="margin-left: 8px"
              @click="toggleMore"
            >
              {{ form.showMore == true ? '收起' : '高级筛选' }}
              <i :class="form.showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
            </el-button>
          </el-col>
        </el-row>
      </el-form>

      <div class="main-box">
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
            label="工单编号"
            prop="workOrderCode"
            align="center"
          />
          <el-table-column
            label="工单日期"
            prop="createdTime"
            align="center"
          />
          <el-table-column
            label="报警时间"
            prop="alarmTime"
            align="center"
          />
          <el-table-column
            label="报警编码"
            prop="alarmCode"
            align="center"
          />
          <el-table-column
            label="报警位置"
            prop="alarmPosition"
            align="center"
          />
          <el-table-column
            label="报警信息"
            prop="g"
            align="center"
          />
          <el-table-column
            label="消防控制室是否报警"
            prop="alarmTag"
            align="center"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.alarmTag ? '是' : '否' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="回执状态"
            prop="receiptStatus"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag
                v-if="scope.row.receiptStatus"
                size="mini"
                type="success"
              >
                已回执
              </el-tag>
              <el-tag
                v-else
                size="mini"
                type="danger"
              >
                未回执
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="处理人"
            prop="processorUserName"
            align="center"
          />
          <el-table-column
            label="处理措施"
            prop="disposalMeasures"
            align="center"
          />
          <el-table-column
            label="处理完成时间"
            prop="processingTime"
            align="center"
          />
          <el-table-column
            align="center"
            fixed="right"
            label="操作"
            width="120"
          >
            <template slot-scope="scope">
              <el-button
                v-if="!scope.row.receiptStatus"
                type="text"
                @click="editFn(scope.row)"
              >
                回执
              </el-button>
              <el-button
                type="text"
                @click="seeFn(scope.row)"
              >
                查看
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

    <!-- 工单回执 -->
    <el-dialog
      class="normal-dialog edit-dialog"
      title="工单回执"
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
            <el-form-item
              label="工单单号"
              prop="workOrderCode"
            >
              <el-input
                v-model="editForm.workOrder.workOrderCode"
                placeholder="工单单号"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="创建日期"
              prop="createdTime"
            >
              <el-date-picker
                v-model="editForm.workOrder.createdTime"
                style="width: 100%"
                type="datetime"
                placeholder="创建日期"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="报警位置"
              prop="alarmPosition"
            >
              <el-input
                v-model="editForm.workOrder.alarmPosition"
                placeholder="报警位置"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="报警时间"
              prop="alarmTime"
            >
              <el-date-picker
                v-model="editForm.workOrder.alarmTime"
                style="width: 100%"
                type="datetime"
                placeholder="报警时间"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="报警编码"
              prop="alarmCode"
            >
              <el-input
                v-model="editForm.workOrder.alarmCode"
                placeholder="报警编码"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="值班人"
              prop="caretakerUserName"
            >
              <el-input
                v-model="editForm.workOrder.caretakerUserName"
                placeholder="值班人"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="消防控制室是否报警"
              prop="alarmTag"
            >
              <el-select
                v-model="editForm.workOrder.alarmTag"
                placeholder="消防控制室是否报警"
                style="width: 100%"
                disabled
              >
                <el-option
                  v-for="item in ynList"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="报警设备类型"
              prop="alarmType"
            >
              <el-input
                v-model="editForm.workOrder.alarmType"
                placeholder="报警设备类型"
                disabled
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item
              label="处置措施"
              prop="disposalMeasures"
            >
              <el-input
                v-model="editForm.receipt.disposalMeasures"
                type="textarea"
                :rows="6"
                placeholder="处置措施"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="备注"
              prop="remark"
            >
              <el-input
                v-model="editForm.receipt.remark"
                type="textarea"
                :rows="6"
                placeholder="备注"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="处理人"
              prop="processorUserName"
            >
              <el-input
                v-model="editForm.receipt.processorUserName"
                placeholder="处理人"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="处理完成时间"
              prop="processingTime"
            >
              <el-date-picker
                v-model="editForm.receipt.processingTime"
                style="width: 100%"
                type="datetime"
                placeholder="处理完成时间"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="工单类型"
              prop="workOrderReceiptType"
            >
              <el-radio-group v-model="editForm.receipt.workOrderReceiptType">
                <el-radio
                  v-for="item in $dictUtils.getDictList('back_type')"
                  :key="item.dictCode"
                  :label="item.dictName"
                />
                <!-- <el-radio label="误报" />
                                <el-radio label="故障维修" />
                                <el-radio label="事故" />
                                <el-radio label="其他" /> -->
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="类型说明"
              prop="description"
            >
              <el-input
                v-model="editForm.receipt.description"
                type="textarea"
                :rows="6"
                placeholder="类型说明"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="上传照片"
              prop="temporaryFiles"
            >
              <FileUpload
                v-bind="fileProp"
                fileType="workOrderBack"
                :editable="editable"
                @upload="uploadEvt"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialog = false">
          取消
        </el-button>
        <el-button
          v-show="editable"
          type="success"
          @click="turnFn"
        >
          转办
        </el-button>
        <el-button
          v-show="editable"
          type="primary"
          :loading="editLoading"
          @click="backFn"
        >
          回执
        </el-button>
      </div>
    </el-dialog>

    <!-- 转办弹窗 -->
    <el-dialog
      class="normal-dialog edit-dialog"
      title="工单转办"
      :visible.sync="dialog_turn"
      width="40%"
    >
      <!-- <PersonPick v-if="dialog_turn" isSingle @close="closePickEvt" /> -->
      <el-form
        ref="turnForm"
        :model="turnForm"
        :rules="turnRules"
        label-width="85px"
        size="mini"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item
              label="指定转办人员"
              prop="transferToUserId"
            >
              <el-select
                v-model="turnForm.transferToUserId"
                placeholder="请选择"
                style="width: 100%"
                filterable
                @change="userFn"
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
          <el-col :span="24">
            <el-form-item
              label="转办理由"
              prop="transferReason"
            >
              <el-input
                v-model="turnForm.transferReason"
                type="textarea"
                :rows="6"
                placeholder="转办理由"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialog_turn = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="turnDone"
        >
          确认转办
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.backSheet-fireControl {
  height: calc(100vh - 50px);
  padding: 10px;
  background: #f3f7f9;
  display: flex;
  .leftCon {
    width: 200px;
    height: 100%;
    .leftTree .el-card {
      display: flex;
      flex-direction: column;
    }
  }
  .rightCon {
    flex: 1;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
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
