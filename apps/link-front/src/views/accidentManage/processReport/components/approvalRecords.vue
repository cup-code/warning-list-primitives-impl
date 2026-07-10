<!-- @description：addProcess 新增修改处置报告  -->
<!--  @modified By：  -->
<!--  @version: 1.0.0  -->
<script>
// import { getApprovalRecordPage } from '@/http/accidentHandling/accidentHandling.js'
import { approvalRecordPage } from '@//http/accidentManage/investigation'
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import FileUpload from '@/views/common-ui/FileUpload'

export default {
  name: 'addAccident',
  components: {
    FileUpload,
    TreeSelect,
  },
  data() {
    return {
      loading: false,
      isLoading: false,
      tableData: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: '',
      },
      total: 0,
      reasonTypeOptions: [],
      filterUserList: '',
      personListShow: [],
      flag: true,
      colWidth: 12,
      visible: false,
      inputForm: {
        report: [
          {
            leaderName: '',
            leaderPhone: '',
            leader: '',
          },
        ],
      },
      fileProp: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 1, // 最大文件上传数量
        deleteFront: true,
        editable: true,
      },

      dataRule: {
        teamType: [
          {
            required: true,
            message: '事故名称不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        name: [
          {
            required: true,
            message: '事故编号不能为空',
            leaderNametrigger: 'blur',
          },
        ],
      },
    }
  },
  methods: {
    async getList(param) {
      this.isLoading = true
      this.queryParams.id = param.handlingId // reportId
      const data = await approvalRecordPage(this.queryParams)
      this.tableData = data.result.list
      this.total = data.result.total
    },
    closeDialog() {},
  },
}
</script>

<template>
  <el-dialog
    title="事故处置报告审批扭转记录"
    :close-on-click-modal="false"
    width="800px"

    :visible.sync="visible"
    class="normal-dialog"
    @close="closeDialog"
  >
    <!-- 表格 -->
    <el-table
      :data="tableData"
      :header-cell-style="{ borderLeft: 'none', borderRight: 'none' }"
      align="center"
      class="check-table"
    >
      <el-table-column
        label="序号"
        prop="approvalNo"
        align="center"
      />
      <el-table-column
        label="流转时间"
        prop="circulationTime"
        align="center"
        min-width="100px"
      />
      <el-table-column
        label="经办人"
        prop="handler"
        align="center"
        min-width="100px"
      />
      <el-table-column
        label="流程节点"
        prop="processNode"
        align="center"
        min-width="100px"
      />
      <el-table-column
        label="下一经办人"
        prop="nextOperator"
        align="center"
        min-width="100px"
      />
      <el-table-column
        label="下一节点"
        prop="nextNode"
        align="center"
        min-width="100px"
      />
    </el-table>
    <!-- 分页器 -->
    <div class="page-box">
      <el-pagination
        slot="page"
        :disabled="isLoading"
        style="margin: 0 20px 0 0"
        :current-page.sync="queryParams.pageNum"
        :page-size.sync="queryParams.pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, prev, pager, next, jumper, sizes"
        :total="total"
        @current-change="getList"
        @size-change="getList"
      />
    </div>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="visible = false"
      >关闭</el-button>
    </span>
  </el-dialog>
</template>

<style scoped lang="scss">
.title {
  width: 100%;
  height: 56px;
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 18px;
  line-height: 24px;
  color: #303133;
}
.title::before {
  display: inline-block;
  content: '';
  margin: 0 10px 0 0;
  width: 4px;
  height: 24px;
  background-color: #409eff;
}
.theme-default .el-date-editor.el-input,
.theme-default .el-date-editor.el-input__inner {
  width: 267px !important;
}
.box {
  border: 1px solid #dcdfe6;
  height: 50px;
  margin-bottom: 5px;
  .box_row {
    padding-top: 10px;
    span {
      line-height: 30px;
      padding-left: 5px;
    }
  }
}
.box_two {
  border: 1px solid #dcdfe6;
  height: 130px;
  margin-bottom: 5px;
  .box_row {
    padding-top: 10px;
    span {
      line-height: 30px;
      padding-left: 5px;
    }
  }
}
.normal-dialog .dialog-footer {
  justify-content: center !important;
}
.page-box {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.check-table {
  width: 100%;
  height: 100%;
}
</style>
