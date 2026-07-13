<script>
import { getAuthToken } from '@/utils/tab-session'
import {
  getSurveyApprovalList,
  InspectionRecordIMPORT,
  removeHotWork,
} from '@/http/occupationalHealth/sanitation-api'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import HotWorkIDialog from '../components/hotWorkIDialog'

export default {
  name: 'hazardIdentification',
  components: {
    OwnDeparmentTree,
    HotWorkIDialog,
  },
  data() {
    return {
      isLoading: false,
      isShow: true,
      total: 0,
      uploadLimit: {
        header: {
          Authorization: getAuthToken(),
          clientChannel: 'WEB',
        },
        accept: [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
      },
      searchData: {
        pageNum: 1,
        pageSize: 10,
        year: '',
        examineStatus: null,
      },
      planStatusList: [
        {
          label: '待审核',
          value: 0,
        },
        {
          label: '已审核',
          value: 1,
        },
        {
          label: '已驳回',
          value: 2,
        },
      ],

      tableData: [],
      visibleForm: false,
      dialogTitle: '',
      dialogMethod: '',
      formData: {},
    }
  },
  computed: {
    setStatus() {
      return function (val) {
        let msg = ''
        if (val == 0) {
          msg = '待审核'
        }
        else if (val == 1) {
          msg = '已审核'
        }
        else {
          msg = '已驳回'
        }

        return msg
      }
    },
  },
  created() {
    this.getTableData()
  },
  methods: {
    // 导入
    getImportTemplate() {
      this.$utils.download('/excel/getImportTemplate/TemperatureInvestigateRecord', '')
    },
    getImport(data) {
      const params = {
        file: data.file,
      }
      this.isLoading = true
      InspectionRecordIMPORT(params, 'TemperatureInvestigateRecord')
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
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data.onlyTreeUse)
        return
      if (data) {
        this.searchData.departmentId = data.id
      }
      else {
        this.searchData.departmentId = ''
      }
      this.searchFn()
    },
    searchFn() {
      this.searchData.pageNum = 1
      this.getTableData()
    },
    // 获取表格数据
    getTableData() {
      this.isLoading = true
      getSurveyApprovalList(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.total = data.result.total
            this.tableData = data.result.list || []
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
          this.$refs.fileUpload.clearFiles()
        })
    },
    // 打开表单弹窗(添加、查看、修改)
    changeFn(type, infoData) {
      this.visibleForm = true
      this.dialogMethod = type
      switch (type) {
        case 'add':
          this.dialogTitle = '新增高温作业调查记录'
          this.formData = {}
          break
        case 'edit':
          this.dialogTitle = '修改高温作业调查记录'
          this.formData = infoData
          break
        case 'view':
          this.dialogTitle = '查看高温作业调查记录'
          this.formData = infoData
          break
      }
    },
    /* 保存表单弹窗关闭成功回调 */
    infoSuccEvt(isRefresh) {
      this.visibleForm = false
      if (isRefresh) {
        this.getTableData()
      }
    },
    // 删除弹窗
    delFn(v) {
      this.$confirm('确认要删除此条记录' + ' ?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.isLoading = true
        removeHotWork(v.id)
          .then(({ data }) => {
            this.isLoading = false
            if (data.success) {
              this.$message.success('删除成功')
              this.getTableData()
            }
            else {
              this.$message.error(data.message || '删除失败')
            }
          })
          .catch((err) => {
            this.isLoading = false
            this.$message.error('删除失败')
          })
      })
    },
    resetSearch() {
      this.searchData.year = ''
      this.searchData.examineStatus = ''
      this.getTableData()
    },
  },
}
</script>

<template>
  <TreeTable v-loading="isLoading">
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <el-form
        inline
        label-width="100"
      >
        <el-row>
          <el-form-item
            label="年份"
            prop="year"
          >
            <el-date-picker
              v-model="searchData.year"
              class="small-row"
              style="width: 192px"
              type="year"
              placeholder="选择年份"
            />
          </el-form-item>
          <el-form-item
            label="计划状态"
            prop="examineStatus"
          >
            <el-select
              v-model="searchData.examineStatus"
              class="small-row"
              placeholder="请选择"
              clearable
              @change="$forceUpdate()"
            >
              <el-option
                v-for="item in planStatusList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="searchFn"
            >
              查询
            </el-button>
            <el-button
              class="reset"
              size="mini"
              icon="el-icon-refresh-right"
              @click="resetSearch()"
            >
              重置
            </el-button>
          </el-form-item>
        </el-row>
      </el-form>
    </ECard>
    <ECard slot="table">
      <div class="card-cell">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          @click="changeFn('add')"
        >
          新增
        </el-button>
        <el-button
          plain
          size="mini"
          icon="el-icon-download"
          @click="getImportTemplate"
        >
          模板下载
        </el-button>
        <el-upload
          ref="fileUpload"
          style="display: inline-flex; margin-left: 10px"
          action="#"
          :headers="uploadLimit.header"
          :limit="1"
          :accept="uploadLimit.accept.toString()"
          :http-request="getImport"
          :show-file-list="false"
        >
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-upload"
          >
            Excel导入
          </el-button>
          <div
            slot="tip"
            class="el-upload__tip"
          >
            只允许导入“xls”或“xlsx”格式文件！
          </div>
        </el-upload>
      </div>
      <!-- 表格 -->
      <el-table
        :data="tableData"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        align="center"
        height="92%"
      >
        <el-table-column
          label="年份"
          align="center"
          prop="year"
        />
        <el-table-column
          label="申报日期"
          align="center"
          prop="reportWriterDate"
          min-width="120"
        />
        <el-table-column
          label="申报部门"
          align="center"
          prop="departmentName"
          min-width="120"
        />
        <el-table-column
          label="岗位名称"
          align="center"
        >
          <template slot-scope="scope">
            <span
              v-for="(item, index) in scope.row.workPost"
              :key="item.id"
            >{{ item.postName }}{{ index === scope.row.workPost.length - 1 ? '' : '、' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="高温环境工作人员数量"
          align="center"
          prop="postLimit"
        />
        <el-table-column
          label="岗位最高温度"
          align="center"
          prop="postMaxTemperature"
        />
        <el-table-column
          label="高温环境平均每天持续小时"
          align="center"
          prop="avgHour"
        />
        <el-table-column
          label="当前已采取的降温措施"
          prop="temperatureMeasure"
          align="center"
        />
        <el-table-column
          label="岗位人员"
          align="center"
        >
          <template slot-scope="scope">
            <span
              v-for="(items, indexs) in scope.row.postUser"
              :key="items.id"
            >{{ items.fullName }}{{ indexs === scope.row.postUser.length - 1 ? '' : '、' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="是否需要发放高温津贴"
          align="center"
          prop="isGrantAllowance"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.isGrantAllowance ? '是' : '否' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="计划状态"
          align="center"
          prop="examineStatus"
        >
          <template slot-scope="scope">
            <span>{{ setStatus(scope.row.examineStatus) }}</span>
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
              type="text"
              @click="changeFn('view', scope.row)"
            >
              查看
            </el-button>
            <el-button
              style="color: var(--ky-warning)"
              type="text"
              @click="changeFn('edit', scope.row)"
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
    </ECard>
    <!-- 分页器 -->
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        :current-page.sync="searchData.pageNum"
        :page-sizes="[10, 20, 50]"
        background
        style="padding-top: 10px"
        :page-size.sync="searchData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getTableData"
        @current-change="getTableData"
      />
    </ECard>
    <!-- 表单弹窗 -->
    <el-dialog
      slot="dialog"
      class="normal-dialog"
      :title="dialogTitle"
      :close-on-click-modal="false"

      width="900px"
      :visible.sync="visibleForm"
    >
      <HotWorkIDialog
        v-if="visibleForm"
        :Method="dialogMethod"
        :FromData="formData"
        @DialogClose="infoSuccEvt"
      />
    </el-dialog>
  </TreeTable>
</template>

<style scoped>
.auxiliary-button {
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
