<!-- 计量设备页面 -->
<script>
import { getAuthToken } from '@/utils/tab-session'
import {
  deleteSpecialEquipmentFn,
  getMeteringEquipmentList,
  importMeasuringEquipment,
} from '@/http/specialEquipment/management-api'
import OwnDepartmentTree from '@/views/common-ui/OwnDeparmentTree.vue'
import MeteringEquipmentDialog from './components/meteringEquipmentDialog'

export default {
  name: 'specialEquipmentList',
  components: {
    OwnDepartmentTree,
    MeteringEquipmentDialog,
  },
  data() {
    return {
      isLoading: false,
      queryForm: {
        pageNum: 1,
        pageSize: 10,
      },
      tableData: [],
      utensilTypeOptions: [],
      total: 0,
      departmentTreeData: [],
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
      visibleForm: false,
      dialogTitle: '',
      dialogMethod: '',
      formData: {},
      // allNum: 0
    }
  },

  created() {
    this.getTableData()
  },
  methods: {
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

    // 获取表格数据
    getTableData(name) {
      this.isLoading = true
      getMeteringEquipmentList(this.queryForm)
        .then(({ data }) => {
          if (data.success) {
            const applianceTypelist = this.$dictUtils.getDictList('appliance_name')
            this.utensilTypeOptions = applianceTypelist.map((res) => {
              return {
                label: res.dictName,
                count: 0,
              }
            })
            // this.allNum = 0
            for (const key in data.result.groupByName) {
              this.utensilTypeOptions.forEach((val) => {
                if (key === val.label) {
                  val.count = data.result.groupByName[key]
                }
              })
            }
            this.utensilTypeOptions.unshift({
              label: '全部',
              count: data.result.total,
            })
            this.total = data.result.total
            this.tableData = data.result.list || []
            if (name && typeof name !== 'number') {
              this.tableData = this.tableData.filter((res) => {
                return name === res.utensilName
              })
            }
          }
          else {
            this.$message.warning(data.message || '获取列表数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表数据出错', err)
        })
        .finally(() => {
          this.isLoading = false
          // this.$refs.fileUpload.clearFiles()
        })
    },

    /**
     * 查询按钮点击
     */
    searchClick() {
      this.queryForm.pageNum = 1
      this.queryForm.pageSize = 10
      this.getTableData()
    },
    /**
     * 重置按钮单击
     */
    searchReset() {
      this.queryForm.pageNum = 1
      this.queryForm.queryKey = ''
      this.queryForm.departmentId = ''
      this.queryForm.companyId = ''
      this.queryForm.utensilName = ''
      this.queryForm.remainingDays = ''
      this.getTableData()
    },

    // 打开表单弹窗(添加、查看、修改)
    changeFn(type, infoData) {
      this.visibleForm = true
      this.dialogMethod = type
      switch (type) {
        case 'add':
          this.dialogTitle = '新增计量设备'
          this.formData = {}
          break
        case 'edit':
          this.dialogTitle = '修改计量设备'
          this.formData = infoData
          break
        case 'view':
          this.dialogTitle = '查看计量设备'
          this.formData = infoData
          break
      }
    },
    /* 保存表单弹窗关闭成功回调 */
    infoSuccEvt(isRefresh) {
      this.visibleForm = false
      if (isRefresh) {
        this.queryForm.pageNum = 1
        this.queryForm.pageSize = 10
        this.getTableData()
      }
    },
    typeChange(name) {
      if (name === '全部') {
        this.searchReset()
      }
      else {
        this.queryForm.utensilName = name
        this.getTableData(name)
      }
    },

    /**
     * 删除按钮单击
     * @param id 主键
     */
    delFn(id) {
      const me = this
      me.$confirm(`您确定要删除本条数据？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        me.isLoading = true
        deleteSpecialEquipmentFn(id)
          .then(({ data }) => {
            if (data.success) {
              me.$message.success(data.message)
              me.getTableData()
            }
          })
          .catch((e) => {
            me.$message.error(`数据删除异常：${e}`)
          })
          .finally(() => {
            me.isLoading = false
          })
      })
    },
    // 导入
    downloadDataImportTemplateClick() {
      this.$utils.download('/excel/getImportTemplate/MeteringManage', null)
    },
    uploadDataImportTemplateClick(data) {
      const params = {
        file: data.file,
      }
      this.isLoading = true
      importMeasuringEquipment(params)
        .then(({ data }) => {
          if (data.success) {
            this.$message.success('导入成功')
            this.getTableData()
          }
          else {
            this.$message.warning(data.message || '导入失败')
          }
        })
        .catch((err) => {
          this.$message.error('导入出错', err)
        })
        .finally(() => {
          this.isLoading = false
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
  },
}
</script>

<template>
  <TreeTable class="specialEquipmentContainer">
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
        prop="queryKey"
        label="关键字"
      >
        <el-input
          v-model="queryForm.queryKey"
          placeholder="名称/规格型号/出厂编号/使用地点"
          style="width: 300px"
          clearable
        />
      </el-form-item>
      <el-form-item
        prop="remainingDays"
        label="距离下次检验剩余(天)"
        label-width="140px"
      >
        <el-input
          v-model="queryForm.remainingDays"
          class="editNum"
          type="number"
          placeholder="请输入"
          clearable
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
          :loading="isLoading"
          @click="searchReset()"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <div slot="auxiliary">
      <el-button
        v-if="hasBtnPermission('special_equipment_metering_add')"
        icon="el-icon-plus"
        type="primary"
        plain
        @click="changeFn('add')"
      >
        新增
      </el-button>
      <el-dropdown
        v-if="hasBtnPermission('special_equipment_metering_import')"
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
    <div slot="auxiliary">
      <el-button
        v-for="(item, index) in utensilTypeOptions"
        :key="index"
        style="margin-top: 5px"
        plain
        type="primary"
        @click="typeChange(item.label)"
      >
        {{ item.label }}
        {{ `(${item.count})` }}
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table
      slot="table"
      ref="specialEquipmentTable"
      :loading="isLoading"
      :data="tableData"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
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
        label="公司"
        align="center"
        prop="companyName"
      />
      <el-table-column
        label="部门"
        align="center"
        prop="departmentName"
      />
      <el-table-column
        label="器具名称"
        align="center"
        prop="utensilName"
      />
      <el-table-column
        label="规格型号"
        align="center"
        prop="equipmentModel"
      />
      <el-table-column
        label="出厂编号"
        align="center"
        prop="factoryNumber"
      />
      <el-table-column
        label="内部编号"
        align="center"
        prop="internalNumber"
      />
      <el-table-column
        label="使用地点"
        align="center"
        prop="usePlace"
      />
      <el-table-column
        label="责任人"
        align="center"
        prop="responsiblePersonName"
      />
      <el-table-column
        label="上次检定日期"
        align="center"
        prop="lastVerificationDate"
        min-width="150"
      />
      <el-table-column
        label="有效期至"
        align="center"
        prop="effectiveDate"
        min-width="150"
      />
      <el-table-column
        label="距离下次检验（天）"
        align="center"
        prop="nextDays"
        min-width="150"
      >
        <template #default="scope">
          <span v-if="scope.row.nextDays >= 0"> {{ scope.row.nextDays }}</span>
          <el-tag
            v-if="scope.row.nextDays < 0"
            type="danger"
            size="medium"
          >
            已过期 {{ Math.abs(scope.row.nextDays) }} 天
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="160"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            v-if="hasBtnPermission('special_equipment_metering_view')"
            type="text"
            @click="changeFn('view', scope.row)"
          >
            查看
          </el-button>
          <el-button
            v-if="hasBtnPermission('special_equipment_metering_modify')"
            style="color: var(--ky-warning)"
            type="text"
            @click="changeFn('edit', scope.row)"
          >
            修改
          </el-button>
          <el-button
            v-if="hasBtnPermission('special_equipment_metering_delete')"
            type="text"
            style="color: var(--ky-danger)"
            @click="delFn(scope.row.id)"
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

    <!-- 弹窗 -->
    <div slot="dialog">
      <!-- 详情 -->
      <el-dialog
        slot="dialog"
        class="normal-dialog"
        :title="dialogTitle"
        :close-on-click-modal="false"

        width="700px"
        :visible.sync="visibleForm"
      >
        <MeteringEquipmentDialog
          v-if="visibleForm"
          :Method="dialogMethod"
          :FromData="formData"
          @DialogClose="infoSuccEvt"
        />
      </el-dialog>
    </div>
  </TreeTable>
</template>

<style scoped lang="scss">
::v-deep .bg-header {
  padding-left: 0 !important;
}
.editNum {
  ::v-deep input::-webkit-outer-spin-button,
  ::v-deep input::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  ::v-deep input[type='number'] {
    -moz-appearance: textfield;
  }
}
</style>
