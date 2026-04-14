<!-- 特种设备信息列表页面 -->
<script>
import { getAuthToken } from '@/utils/tab-session'
import {
  deleteById,
  getPaging,
  importBasicInfoRecord,
} from '@/http/specialEquipment/management-api'
import OwnDepartmentTree from '@/views/common-ui/OwnDeparmentTree.vue'

export default {
  name: 'specialEquipmentList',
  components: {
    OwnDepartmentTree,
  },
  data() {
    return {
      showMore: false,
      isLoading: false,
      queryForm: {
        pageNum: 1,
        pageSize: 10,
        keywords: '',
        equipmentType: '',
        companyId: '',
        departmentId: '',
      },
      tableData: [],
      total: 0,
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
    this.searchClick()
  },
  methods: {
    /* 点击显示/隐藏更多 */
    showMoreClick(isShow) {
      this.showMore = isShow
      this.$nextTick(() => {
        this.$refs.treeTable.setTableHeight()
      })
    },
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
      getPaging(me.queryForm)
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
      this.queryForm.pageNum = 1
      this.getTableData()
    },
    /**
     * 重置按钮单击
     */
    searchReset() {
      this.queryForm.keywords = ''
      this.queryForm.equipmentType = ''
      this.queryForm.equipmentStatus = ''
      this.queryForm.remainingDays = ''
      this.$refs.departmentTree.refreshTree()
    },
    /**
     * 编辑按钮单击（含新增、修改、查看）
     * @param rowData 行数据对象
     * @param opType 操作类别
     */
    editClick(rowData, opType) {
      const me = this
      me.$router.push({
        name: 'specialEquipmentDetail',
        params: {
          id: rowData ? rowData.id : null,
          opType,
        },
      })
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
        deleteById(id)
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
     * 数据导入模板下载按钮单击
     */
    downloadDataImportTemplateClick() {
      this.$utils.download('/excel/getImportTemplate/SpecialEquipmentBasicRecord', null)
    },
    /**
     * 数据导入模板上传按钮单击
     */
    uploadDataImportTemplateClick(param) {
      const me = this
      me.isLoading = true
      importBasicInfoRecord({
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
  },
}
</script>

<template>
  <TreeTable
    ref="treeTable"
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
        prop="keywords"
        label="关键字"
      >
        <el-input
          v-model="queryForm.keywords"
          placeholder="名称/资产号/出厂编号/规格型号"
          style="width: 300px"
          clearable
        />
      </el-form-item>
      <el-form-item
        prop="equipmentType"
        label="设备类型"
      >
        <el-select
          v-model="queryForm.equipmentType"
          placeholder="请选择"
          filterable
          clearable
          style="width: 160px"
        >
          <el-option
            v-for="item in $dictUtils.getDictList('special_equipment_type')"
            :key="item.id"
            :label="item.dictName"
            :value="item.dictCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        prop="equipmentStatus"
        label="设备状态"
      >
        <el-select
          v-model="queryForm.equipmentStatus"
          placeholder="请选择"
          filterable
          clearable
          style="width: 160px"
        >
          <el-option
            v-for="item in $dictUtils.getDictList('special_equipment_status')"
            :key="item.id"
            :label="item.dictName"
            :value="item.dictCode"
          />
        </el-select>
      </el-form-item>
      <template v-if="showMore">
        <el-form-item
          prop="remainingDays"
          label="距离下次检验(天)"
          label-width="130px"
        >
          <el-input
            v-model="queryForm.remainingDays"
            style="width: 100px"
            clearable
          />
        </el-form-item>
      </template>
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
      <el-form-item v-if="!showMore">
        <el-button
          type="text"
          icon="el-icon-arrow-down"
          style="color: var(--ky-primary)"
          @click="showMoreClick(true)"
        >
          高级筛选
        </el-button>
      </el-form-item>
      <el-form-item v-else>
        <el-button
          type="text"
          icon="el-icon-arrow-up"
          style="color: var(--ky-primary)"
          @click="showMoreClick(false)"
        >
          收起
        </el-button>
      </el-form-item>
    </el-form>

    <div slot="auxiliary">
      <el-button
        v-if="hasBtnPermission('special_equipment_list_add')"
        icon="el-icon-plus"
        type="primary"
        plain
        @click="editClick(null, 'add')"
      >
        新增
      </el-button>
      <el-dropdown
        v-if="hasBtnPermission('special_equipment_list_import')"
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
        label="所属部门"
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
          <span>{{
            $dictUtils.getDictLabel('special_equipment_type', scope.row.equipmentType, '--')
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="设备名称"
        align="center"
        prop="equipmentName"
      />
      <el-table-column
        label="资产号"
        align="center"
        prop="equipmentAssetCode"
      />
      <el-table-column
        label="出厂编号"
        align="center"
        prop="equipmentSerialNumber"
      />
      <el-table-column
        label="规格型号"
        align="center"
        prop="equipmentModel"
      />
      <el-table-column
        label="上次检验日期"
        align="center"
        prop="inspectionLastDate"
        min-width="100"
      />
      <el-table-column
        label="下次检验日期"
        align="center"
        prop="inspectionNextDate"
        min-width="100"
      />
      <el-table-column
        label="距离下次检验（天）"
        align="center"
        prop="remainingDays"
        min-width="150"
      >
        <template #default="scope">
          <span v-if="scope.row.remainingDays > 0"> {{ scope.row.remainingDays }}</span>
          <span v-if="scope.row.remainingDays === 0">已到期</span>
          <el-tag
            v-if="scope.row.remainingDays < 0"
            type="danger"
            size="medium"
          >
            已过期 {{ Math.abs(scope.row.remainingDays) }} 天
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="设备状态"
        align="center"
        prop="equipmentStatus"
      >
        <template #default="scope">
          <el-tag
            v-if="scope.row.equipmentStatus === 0"
            type="info"
            size="medium"
          >
            待注册
          </el-tag>
          <el-tag
            v-if="scope.row.equipmentStatus === 1"
            type="success"
            size="medium"
          >
            在用
          </el-tag>
          <el-tag
            v-if="scope.row.equipmentStatus === 2"
            type="danger"
            size="medium"
          >
            报废
          </el-tag>
          <el-tag
            v-if="scope.row.equipmentStatus === 3"
            type="warning"
            size="medium"
          >
            停用
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
            v-if="hasBtnPermission('special_equipment_list_view')"
            type="text"
            @click="editClick(scope.row, 'look')"
          >
            查看
          </el-button>
          <el-button
            v-if="hasBtnPermission('special_equipment_list_modify')"
            type="text"
            style="color: var(--ky-warning)"
            @click="editClick(scope.row, 'edit')"
          >
            编辑
          </el-button>
          <el-button
            v-if="hasBtnPermission('special_equipment_list_delete')"
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
  </TreeTable>
</template>
