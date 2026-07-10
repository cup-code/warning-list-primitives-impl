/* * @Author: xiaorui 文档历史版本列表 * @Date: 2023-01-18 14:32:15 * @Last Modified by: xiaorui *
@Last Modified time: 2023-05-24 14:22:20 */
<script>
import SelectTree from '@/components/treeSelect/treeSelect'
import { getHistoryVerListByPageFn } from '@/http/file-manager/document-api'
import { getAllDocTagFn } from '@/http/file-manager/fileTag-api'
import { showFileWindow } from '@/utils/checkFile.js'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'

export default {
  components: { OwnDeparmentTree, SelectTree },
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
        this.searchData = {}
        this.searchData.pageSize = 10
      }
      this.searchData.pageNum = 1
      this.getTableData()
    },
    // 获取列表数据
    getTableData() {
      this.isLoading = true
      getHistoryVerListByPageFn(this.searchData)
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
    treeNodeTap(v) {
      if (v.onlyTreeUse)
        return
      this.searchData.departmentId = v.id
      this.searchFn(true)
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
        <el-form-item
          label="文档名称"
          prop="docName"
        >
          <el-input
            v-model="searchData.docName"
            placeholder="名称或统一编码"
            clearable
          />
        </el-form-item>
        <el-form-item
          label="文档类型"
          prop="docType"
        >
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
    <!-- 表格 -->
    <el-table
      slot="table"
      v-loading="isLoading"
      :data="tableData"
      :header-cell-style="{ background: '#f5f5f5' }"
      align="center"
      height="100%"
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
        label="文档版本"
        align="center"
        prop="versionNo"
        min-width="100"
      />
      <el-table-column
        label="归档版本文档附件"
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
  </TreeTable>
</template>
