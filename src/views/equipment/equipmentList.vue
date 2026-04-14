<!-- 设备清单列表页面 -->
<script>
import {
  deleteEquipmentRecord,
  downloadEquipmentRecordTemplateFile,
  importEquipmentRecord,
  queryEquipmentRecord,
} from '@/http/equipment/records-api'
import OwnDepartmentTree from '@/views/common-ui/OwnDeparmentTree.vue'
import EquipmentRecordsForm from '@/views/equipment/components/equipmentForm.vue'
import { getAuthToken } from '@/utils/tab-session'

export default {
  name: 'equipmentList',
  components: {
    EquipmentRecordsForm,
    OwnDepartmentTree,
  },
  data() {
    return {
      isLoading: false,
      formDialogVisible: false,
      formDialogTitle: '',
      queryForm: {
        pageNum: 1,
        pageSize: 10,
        companyId: '',
        departmentId: '',
        equipmentName: '',
        equipmentType: '',
        equipmentUniqueCode: '',
        equipmentModel: '',
      },
      equipmentTypeOptions: [],
      tableData: [],
      total: 0,
      rowData: {},
      interlockTypeData: [],
      opType: '',
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
    }
  },
  created() {
    const me = this
    me.equipmentTypeOptions = me.$dictUtils.getDictList('equipment_type') || []
    me.interlockTypeData = me.$dictUtils.getDictList('interlock_type') || []
    me.searchClick()
  },
  methods: {
    downloadEquipmentRecordTemplateFile,
    /**
     * 树节点点击
     * @param data
     */
    treeNodeTap(data) {
      const me = this
      if (data) {
        me.queryForm.departmentId = data.id
        me.queryForm.companyId = data.companyId
      }
      else {
        me.queryForm.departmentId = ''
        me.queryForm.companyId = ''
      }
      me.searchClick()
    },
    /**
     * 获取分页表格数据
     */
    getTableData() {
      const me = this
      me.isLoading = true
      queryEquipmentRecord(me.queryForm)
        .then((r) => {
          const res = r.data
          if (res.success) {
            me.tableData = res.result.list
            me.total = res.result.total
            return
          }
          me.$message.warning(r.message || '获取列表数据失败')
        })
        .catch((e) => {
          me.$message.error(`数据查询异常：${e}`)
        })
        .finally(() => {
          me.isLoading = false
        })
    },
    /**
     * 查询按钮点击
     */
    searchClick() {
      const me = this
      me.queryForm.pageNum = 1
      me.getTableData()
    },
    /**
     * 重置按钮单击
     */
    searchReset() {
      const me = this
      me.$refs.queryForm.resetFields()
      me.$refs.departmentTree.refreshTree()
    },
    /**
     * 设备类型下拉列选项改变
     */
    equipmentTypeChange() {
      this.searchClick()
    },
    /**
     * 编辑按钮单击（含新增、修改、查看）
     * @param rowData 行数据对象
     * @param opType 操作类别
     */
    editClick(rowData, opType) {
      const me = this
      me.opType = opType
      switch (opType) {
        case 'add':
          me.formDialogTitle = '新增设备清单'
          rowData = {}
          break
        case 'edit':
          me.formDialogTitle = '修改设备清单'
          break
        default:
          me.formDialogTitle = '查看设备清单'
          break
      }
      me.rowData = rowData
      me.formDialogVisible = true
    },
    /**
     * 删除按钮单击
     * @param id 主键
     */
    deleteClick(id) {
      const me = this
      me.$confirm(`您确定要删除本条数据？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        me.isLoading = true
        deleteEquipmentRecord(id)
          .then((r) => {
            const res = r.data
            if (res.success) {
              me.$message.success(res.message)
              me.getTableData()
              return
            }
            me.$message.warning(res.message)
          })
          .catch((e) => {
            me.$message.error(`数据删除异常：${e}`)
          })
          .finally(() => {
            me.isLoading = false
          })
      })
    },
    /**
     * 数据导入模板上传按钮单击
     */
    uploadDataImportTemplateClick(param) {
      const me = this
      me.isLoading = true
      importEquipmentRecord({
        file: param.file,
      })
        .then((r) => {
          const res = r.data
          if (res.result) {
            me.$message.success('数据导入成功')
            me.searchClick()
            return
          }
          me.$message.warning('数据导入失败')
        })
        .catch((e) => {
          me.$message.error(`数据导入异常：${e}`)
        })
        .finally(() => {
          me.isLoading = false
          me.$refs.fileUpload.clearFiles()
        })
    },
    /**
     * 上传前验证
     */
    onBeforeUpload(file) {
      const me = this
      const isValid = me.dataUploadParams.accept.includes(file.type)
      if (!isValid) {
        this.$message.error('选择的模板文件类型不正确')
      }
      return isValid
    },
    /**
     * 弹窗保存按钮单击
     * @param ref 弹窗内组件的ref
     */
    dialogSaveBtnClick(ref) {
      const me = this
      me.$refs[ref].save(() => {
        me.searchClick()
        me.formDialogVisible = false
      })
    },
    /**
     * 弹窗关闭按钮单击
     */
    dialogCloseBtnClick() {
      this.formDialogVisible = false
    },
  },
}
</script>

<template>
  <TreeTable
    v-loading="isLoading"
    class="specialEquipmentContainer"
  >
    <OwnDepartmentTree
      slot="tree"
      ref="departmentTree"
      title="责任部门"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      ref="queryForm"
      label-width="70px"
      :inline="true"
      :model="queryForm"
    >
      <el-form-item
        prop="equipmentName"
        label="设备名称"
      >
        <el-input
          v-model="queryForm.equipmentName"
          placeholder=""
        />
      </el-form-item>

      <el-form-item
        prop="equipmentType"
        label="设备类型"
      >
        <el-select
          v-model="queryForm.equipmentType"
          placeholder=""
          style="width: 120px"
          @change="searchClick"
        >
          <el-option
            v-for="item in equipmentTypeOptions"
            :key="item.id"
            :label="item.dictName"
            :value="item.dictCode"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        prop="equipmentUniqueCode"
        label="出厂编号"
      >
        <el-input
          v-model="queryForm.equipmentUniqueCode"
          placeholder=""
        />
      </el-form-item>

      <el-form-item
        prop="equipmentModel"
        label="规格型号"
      >
        <el-input
          v-model="queryForm.equipmentModel"
          placeholder=""
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          :loading="isLoading"
          @click="searchClick"
        >
          查询
        </el-button>
        <el-button
          class="reset"
          icon="el-icon-refresh-right"
          @click="searchReset()"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <div slot="auxiliary">
      <el-button
        v-if="hasBtnPermission('equipment_list_add')"
        icon="el-icon-plus"
        type="primary"
        plain
        @click="editClick(null, 'add')"
      >
        新增
      </el-button>
      <el-dropdown
        v-if="hasBtnPermission('equipment_list_import')"
        style="margin: 0 10px"
      >
        <el-button
          type="primary"
          icon="el-icon-upload2"
          plain
        >
          数据导入
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <el-button
              type="success"
              icon="el-icon-download"
              plain
              @click="downloadEquipmentRecordTemplateFile"
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
      slot="table"
      ref="specialEquipmentTable"
      :data="tableData"
      :header-cell-style="{ background: '#f5f5f5' }"
      height="100%"
      row-key="id"
      highlight-current-row
      :border="true"
      class="customer-table"
    >
      <el-table-column
        align="center"
        label="序号"
        min-width="50"
        type="index"
      />
      <el-table-column
        label="责任部门"
        align="center"
        prop="departmentName"
      />
      <el-table-column
        label="设备区域"
        align="center"
        prop="workPostName"
      />
      <el-table-column
        label="设备类型"
        align="center"
        prop="equipmentType"
      >
        <template #default="scope">
          <span>
            {{
              equipmentTypeOptions.find((v, i, o) => scope.row.equipmentType === v.dictCode).dictName
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="设备名称"
        align="center"
        prop="equipmentName"
      />
      <el-table-column
        label="出厂编号"
        align="center"
        prop="equipmentUniqueCode"
      />
      <el-table-column
        label="规格型号"
        align="center"
        prop="equipmentModel"
      />
      <el-table-column
        label="设备厂家"
        align="center"
        prop="factoryName"
      />
      <el-table-column
        label="操作"
        align="center"
        width="160"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            v-if="hasBtnPermission('equipment_list_view')"
            type="text"
            @click="editClick(scope.row, 'look')"
          >
            查看
          </el-button>
          <el-button
            v-if="hasBtnPermission('equipment_list_modify')"
            type="text"
            style="color: var(--ky-warning)"
            @click="editClick(scope.row, 'edit')"
          >
            编辑
          </el-button>
          <el-button
            v-if="hasBtnPermission('equipment_list_delete')"
            type="text"
            style="color: var(--ky-danger)"
            @click="deleteClick(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      slot="page"
      :current-page.sync="queryForm.pageNum"
      :page-sizes="[10, 20, 50]"
      background
      :page-size.sync="queryForm.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="getTableData"
      @current-change="getTableData"
    />

    <el-dialog
      slot="dialog"
      :title="formDialogTitle"
      class="normal-dialog"
      :visible.sync="formDialogVisible"
      width="55%"
      append-to-body
      :close-on-click-modal="false"
      top="5vh"
    >
      <EquipmentRecordsForm
        ref="equipmentRecordForm"
        :equipment-type-data="equipmentTypeOptions"
        :interlock-type-data="interlockTypeData"
        :data-record="rowData"
        :op-type="opType"
      />

      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          style="margin: 0 10px 0 0"
          @click="dialogCloseBtnClick"
        >关 闭</el-button>
        <el-button
          v-if="opType !== 'look'"
          type="primary"
          @click="dialogSaveBtnClick('equipmentRecordForm')"
        >保 存</el-button>
      </span>
    </el-dialog>
  </TreeTable>
</template>

<style scoped></style>
