/* * @Author: xiaorui 文档管理台账页面 * @Date: 2023-01-06 10:22:48 * @Last Modified by: xiaorui *
@Last Modified time: 2023-11-08 14:24:54 */
<script>
import SelectTree from '@/components/treeSelect/treeSelect'
import { getDocListByPageFn } from '@/http/file-manager/document-api'
import { getAllDocTagFn } from '@/http/file-manager/fileTag-api'
import { showFileWindow } from '@/utils/checkFile.js'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import DocumentForm from './components/documentForm'
import DocumentRecord from './components/documentRecord'
import InvalidForm from './components/invalidForm'

export default {
  components: {
    SelectTree,
    DocumentForm,
    InvalidForm,
    OwnDeparmentTree,
    DocumentRecord,
  },
  data() {
    return {
      isLoading: false,
      total: 0,
      documentTypeList: [
        {
          label: '手册',
          value: 1,
        },
        {
          label: '程序文件/管理制度',
          value: 2,
        },
        {
          label: '操作规范/技术规程',
          value: 3,
        },
        {
          label: '记录',
          value: 4,
        },
      ],
      docTagList: [], // 标签列表
      searchData: {
        pageNum: 1,
        pageSize: 10,
        departmentId: '',
        docName: '',
        docType: '',
        docTagIds: [],
      },
      tableData: [],
    }
  },
  created() {
    this.getTableData()
    this.getAllDocTag()
  },
  methods: {
    showFileWindow,
    // 搜索
    searchFn(type) {
      if (!type) {
        this.searchData = {
          pageSize: 10,
          docTagIds: [],
        }
      }
      this.searchData.pageNum = 1
      this.getTableData()
    },
    // 获取表单数据
    getTableData() {
      this.isLoading = true
      getDocListByPageFn(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result.list || []
            this.total = data.result.total
          }
          else {
            this.$message.warning(data.message || '获取列表数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表数据失败', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    // 获取标签列表
    getAllDocTag() {
      getAllDocTagFn().then(({ data }) => {
        this.docTagList = data.result || []
      })
    },
    setDocTag(value) {
      if (value) {
        this.searchData.docTagIds = value.split(',')
      }
      else {
        this.searchData.docTagIds = []
      }
    },
    treeNodeTap(v) {
      if (v.onlyTreeUse)
        return
      this.searchData.departmentId = v.id
      this.searchFn(true)
    },
    // 查看记录，type为会签、告知、修订
    viewRecord(type, docId) {
      this.$refs.documentRecord.init(type, docId)
    },
    // 新增
    addClick() {
      this.$refs.documentForm.init('add')
    },
    // 修改
    editFn(v) {
      this.$refs.documentForm.init('edit', v)
    },
    // 修订
    reviseFn(v) {
      this.$refs.documentForm.init('revise', v)
    },
    // 查看
    viewFn(v) {
      this.$refs.documentForm.init('view', v)
    },
    // 删除弹窗
    invalidDoc(docId) {
      this.$confirm('您确认要作废此文档' + ' ?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.$refs.invalidForm.init(docId)
        })
        .catch(() => {})
    },
    getLabel(val, list) {
      return this[list].find((item) => {
        return item.value === val
      }).label
    },
  },
}
</script>

<template>
  <TreeTable>
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
      label-width="100"
    >
      <el-row>
        <el-form-item label="文档名称">
          <el-input
            v-model="searchData.docName"
            placeholder="名称或统一编码"
            clearable
          />
        </el-form-item>
        <el-form-item label="文档类型">
          <el-select
            v-model="searchData.docType"
            placeholder="请选择"
            filterable
            clearable
          >
            <el-option
              v-for="item in documentTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="文档标签"
          prop="docTagIds"
        >
          <SelectTree
            ref="officeTree"
            :props="{
              value: 'id',
              label: 'tagName',
              children: 'children',
            }"
            :list="docTagList"
            :value="searchData.docTagIds.join(',')"
            :clearable="true"
            :accordion="true"
            :showCheckbox="true"
            @getValue="setDocTag"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            :loading="isLoading"
            @click="searchFn(true)"
          >
            查询
          </el-button>
          <el-button
            icon="el-icon-refresh-right"
            :loading="isLoading"
            @click="searchFn(false)"
          >
            重置
          </el-button>
        </el-form-item>
      </el-row>
    </el-form>
    <div
      v-if="hasBtnPermission('document_list_add')"
      slot="auxiliary"
    >
      <el-button
        type="primary"
        size="mini"
        icon="el-icon-plus"
        plain
        @click="addClick"
      >
        新增
      </el-button>
    </div>
    <!-- 表格 -->
    <el-table
      slot="table"
      v-loading="isLoading"
      :data="tableData"
      :header-cell-style="{ background: '#f5f5f5' }"
      align="center"
      height="100%"
      highlight-current-row
    >
      <el-table-column
        type="index"
        width="50"
        align="center"
        label="序号"
      />
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
        label="归属部门"
        align="center"
        prop="departmentName"
        min-width="100"
      />
      <el-table-column
        label="文档类型"
        align="center"
        prop="docType"
        min-width="100"
      >
        <template slot-scope="scope">
          {{ getLabel(scope.row.docType, 'documentTypeList') }}
        </template>
      </el-table-column>
      <el-table-column
        label="文档标签"
        align="center"
        prop="docTagNames"
        min-width="150"
      >
        <template slot-scope="scope">
          {{ scope.row.docTagNames.join('、') }}
        </template>
      </el-table-column>
      <el-table-column
        label="填写人员"
        align="center"
        prop="authorName"
        min-width="100"
      />
      <el-table-column
        label="文档状态"
        align="center"
        prop="docState"
        min-width="100"
      >
        <template slot-scope="props">
          <el-tag
            v-if="props.row.docState === 0"
            type="info"
          >
            未审批
          </el-tag>
          <el-tag v-if="props.row.docState === 1">
            审批中
          </el-tag>
          <el-tag
            v-if="props.row.docState === 2"
            type="warning"
          >
            修改中
          </el-tag>
          <el-tag
            v-if="props.row.docState === 3"
            type="warning"
          >
            未归档
          </el-tag>
          <el-tag
            v-if="props.row.docState === 4"
            type="success"
          >
            已归档
          </el-tag>
          <el-tag
            v-if="props.row.docState === 5"
            type="info"
          >
            已修订
          </el-tag>
          <el-tag
            v-if="props.row.docState === 6"
            type="danger"
          >
            已作废
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="文档附件"
        align="center"
        prop="docPath"
        min-width="100"
      >
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.docPath"
            type="text"
            @click="showFileWindow(scope.row.docPath)"
          >
            查看
          </el-button>
          <el-tag v-else>
            无
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="会签记录"
        align="center"
        min-width="100"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="viewRecord('review', scope.row.docId)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="发放告知记录"
        align="center"
        prop="registration"
        min-width="100"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="viewRecord('inform', scope.row.docId)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="修订记录"
        align="center"
        prop="auditResults"
        min-width="100"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="viewRecord('revise', scope.row.docId)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="文档版本"
        align="center"
        prop="versionNo"
        min-width="100"
      >
        <template slot-scope="scope">
          {{ scope.row.versionNo || '--' }}
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
            v-if="hasBtnPermission('document_list_view')"
            type="text"
            @click="viewFn(scope.row)"
          >
            查看
          </el-button>
          <!-- 只有状态为修改中的时候才能修改 -->
          <el-button
            v-if="hasBtnPermission('document_list_modify') && scope.row.docState === 2"
            type="text"
            style="color: var(--ky-warning)"
            @click="editFn(scope.row)"
          >
            修改
          </el-button>
          <!-- 只有已归档的文档可以修订和作废 -->
          <el-button
            v-if="hasBtnPermission('document_list_revise') && scope.row.docState === 4"
            type="text"
            style="color: var(--ky-warning)"
            @click="reviseFn(scope.row)"
          >
            修订
          </el-button>
          <el-button
            v-if="hasBtnPermission('document_list_invalid') && scope.row.docState === 4"
            type="text"
            style="color: var(--ky-danger)"
            @click="invalidDoc(scope.row.docId)"
          >
            作废
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      slot="page"
      :current-page.sync="searchData.pageNum"
      :page-sizes="[10, 20, 50]"
      :page-size.sync="searchData.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="getTableData"
      @current-change="getTableData"
    />
    <!-- 文档信息弹窗 -->
    <document-form
      slot="dialog"
      ref="documentForm"
      :docTagList="docTagList"
      :documentTypeList="documentTypeList"
      @refreshDataList="getTableData"
    />
    <!-- 会签、告知记录弹窗 -->
    <document-record
      slot="dialog"
      ref="documentRecord"
    />
    <!-- 作废文档的弹框 -->
    <invalid-form
      slot="dialog"
      ref="invalidForm"
      @refreshDataList="getTableData"
    />
  </TreeTable>
</template>
