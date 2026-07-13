/* * @Author: xiaorui 巡检标准管理页面 * @Date: 2022-04-20 11:53:35 * @Last Modified by: xiaorui *
@Last Modified time: 2022-08-09 17:00:30 */
<!-- 巡检标准管理页面 -->
<script>
import {
  deleteInspectionContentFn,
  deleteInspectionPartFn,
  getInspectionStandardListByPageFn,
} from '@/http/dev_new/inspection-api'
import DeviceTree from '@/views/common-ui/DeviceTree'
import InspectionContentForm from './form/inspectionContentForm'
import InspectionPartForm from './form/inspectionPartForm'

export default {
  components: {
    DeviceTree,
    InspectionPartForm,
    InspectionContentForm,
  },
  data() {
    return {
      isLoading: false,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        departmentId: '',
        deviceId: '',
        deviceName: '',
        positionName: '',
      },
      moreButton: [
        {
          type: 'text',
          props: 'edit',
          icon: 'edit',
          size: 'mini',
          text: '编辑',
          disabled: false,
        },
        {
          type: 'text',
          props: 'delete',
          icon: 'delete',
          size: 'mini',
          text: '删除',
          disabled: false,
        },
      ],
      tableData: [],
      total: 0,
      expandRows: [], // 保存当前的展开行
      expandKeys: [], // 保存当前的展开行的id
    }
  },
  computed: {
    getMoreButton() {
      return function () {
        return this.moreButton.filter(
          item =>
            (this.hasBtnPermission('inspection_standard_modify') && item.props === 'edit')
            || (this.hasBtnPermission('inspection_standard_delete') && item.props === 'delete'),
        )
      }
    },
  },
  created() {
    this.getTableData()
  },
  methods: {
    // 获取表格数据
    getTableData() {
      this.isLoading = true
      getInspectionStandardListByPageFn(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result.list || []
            this.total = data.result.total || 0
            this.$nextTick(() => {
              this.setExpandRows() // 设置当前展开行
            })
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
        })
    },
    // 点击查询按钮
    searchFn() {
      this.searchData.pageNum = 1
      this.getTableData()
    },
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data.nodeType === 'device') {
        this.searchData.deviceId = data.id
        this.searchData.departmentId = ''
        this.searchData.deviceName = '' // 如果点击了左侧树的设备。则搜索条件中的设备名称置空
        this.deviceName = data.name
      }
      else {
        this.searchData.departmentId = data.id
        this.searchData.deviceId = ''
        this.deviceName = ''
      }
      this.getTableData()
    },
    /* 点击添加巡检部位 */
    addClick() {
      if (!this.searchData.deviceId) {
        this.$message.error('请先选择设备')
        return
      }
      this.$refs.inspectionPartForm.init(
        'add',
        { id: '' },
        this.searchData.deviceId,
        this.deviceName,
      )
    },
    /* 点击编辑巡检部位 */
    editPartFn(v) {
      this.$refs.inspectionPartForm.init('edit', v, this.searchData.deviceId, v.assetDeviceName)
    },
    // 查看巡检部位
    viewPartFn(v) {
      this.$refs.inspectionPartForm.init('view', v, this.searchData.deviceId, v.assetDeviceName)
    },
    /* 点击删除巡检部位 */
    delPart(item) {
      this.$confirm(`您确定要删除${item.positionName}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          deleteInspectionPartFn(item.id)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('删除成功！')
                this.getTableData()
              }
              else {
                this.$message.warning(data.message || '删除失败')
              }
            })
            .finally(() => {
              this.isLoading = false
            })
        })
        .catch(() => {})
    },
    // 把巡检方式保存的code转为label
    getLabel(valArr) {
      const labelArr = []
      valArr.forEach((item) => {
        const label = this.$dictUtils.getDictLabel('inspection_methods', item)
        labelArr.push(label)
      })
      return labelArr
    },
    // 新增巡检内容
    addInspectionContent(row) {
      this.$refs.inspectionContentForm.init('add', { partId: row.id })
    },
    // 查看巡检内容
    viewContentFn(row) {
      this.$refs.inspectionContentForm.init('view', row)
    },
    // 编辑巡检内容
    editContentFn(row) {
      this.$refs.inspectionContentForm.init('edit', row)
    },
    // 点击删除巡检内容
    delContent(item) {
      this.$confirm(`您确定要删除${item.contentName}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          deleteInspectionContentFn(item.id)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('删除成功！')
                this.getTableData()
              }
              else {
                this.$message.warning(data.message || '删除失败')
              }
            })
            .finally(() => {
              this.isLoading = false
            })
        })
        .catch(() => {})
    },
    // 获取当前的展开行，用于刷新数据时保持展开行状态
    getExpandRows(row, expandRows) {
      this.expandRows = expandRows
    },
    // 设置当前的展开行
    setExpandRows() {
      this.expandKeys = this.expandRows.map(row => row.id)
    },
    resetSearch() {
      this.searchData.deviceName = ''
      this.searchData.positionName = ''
      this.getTableData()
    },
  },
}
</script>

<template>
  <TreeTable
    v-loading="isLoading"
    class="inspectionStandardContainer"
  >
    <DeviceTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <ECard
      slot="search"
      customStyle="margin:0px"
      type="search"
    >
      <el-form
        inline
        label-width="100"
      >
        <el-form-item
          prop="deviceName"
          label="设备名称"
        >
          <el-input
            v-model="searchData.deviceName"
            placeholder="设备名称"
            clearable
          />
        </el-form-item>
        <el-form-item
          prop="positionName"
          label="巡检部位"
        >
          <el-input
            v-model="searchData.positionName"
            placeholder="巡检部位"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            :loading="isLoading"
            @click="searchFn"
          >
            查询
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            class="reset"
            icon="el-icon-refresh-right"
            @click="resetSearch()"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <ECard slot="table">
      <div class="card-cell">
        <el-button
          v-if="hasBtnPermission('inspection_standard_add')"
          icon="el-icon-plus"
          type="primary"
          plain
          @click="addClick"
        >
          添加部位
        </el-button>
      </div>
      <!-- 表格 -->
      <el-table
        ref="inspectionTable"
        :data="tableData"
        height="90%"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        row-key="id"
        :expand-row-keys="expandKeys"
        @expand-change="getExpandRows"
      >
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-table
              :data="props.row.contentVOList"
              class="demo-table-expand"
            >
              <el-table-column
                label="编号"
                width="130"
                align="center"
                prop="contentCode"
              />
              <el-table-column
                label="巡检内容"
                min-width="120"
                align="center"
                prop="contentName"
              />
              <el-table-column
                label="排序"
                align="center"
                prop="sortOrder"
              />
              <el-table-column
                label="基准"
                align="left"
                min-width="130"
                prop="inspectionBenchmark"
              />
              <el-table-column
                label="巡检方法"
                align="center"
                prop="inspectionModeList"
                min-width="180"
              >
                <template slot-scope="scope">
                  <el-tag
                    v-for="item in getLabel(scope.row.inspectionModeList)"
                    :key="item"
                    type="success"
                  >
                    {{ item }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                label="数据类别"
                align="center"
                prop="dataType"
              >
                <template slot-scope="scope">
                  <el-tag type="success">
                    {{
                      scope.row.dataType === 'RADIO' ? '单选' : '数值'
                    }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                label="辅助功能"
                align="center"
                min-width="180"
              >
                <template slot-scope="scope">
                  <el-tag
                    v-if="scope.row.mustPhotograph"
                    type="'success"
                  >
                    强拍
                  </el-tag>
                  <el-tag
                    v-if="scope.row.abnormalMustPhotograph"
                    type="'success"
                  >
                    异常强拍
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                align="right"
                width="220"
                fixed="right"
              >
                <template slot-scope="scope">
                  <EButton
                    icon="check"
                    type="text"
                    @click="viewContentFn(scope.row)"
                  >
                    查看
                  </EButton>
                  <EButton
                    v-if="hasBtnPermission('inspection_standard_modify')"
                    icon="edit"
                    type="text"
                    @click="editContentFn(scope.row)"
                  >
                    编辑
                  </EButton>
                  <EButton
                    v-if="hasBtnPermission('inspection_standard_delete')"
                    icon="delete"
                    type="text"
                    @click="delContent(scope.row)"
                  >
                    删除
                  </EButton>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column
          label="编号"
          align="center"
          prop="positionCode"
        />
        <el-table-column
          label="设备名称"
          align="center"
          prop="assetDeviceName"
        >
          <template slot-scope="scope">
            <span
              class="check"
              @click="viewPartFn(scope.row)"
            >{{ scope.row.assetDeviceName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="部位名称"
          align="center"
          prop="positionName"
        />
        <el-table-column
          label="排序"
          align="center"
          prop="sortOrder"
        />
        <el-table-column
          label="状态"
          align="center"
          prop="enable"
        >
          <template slot-scope="scope">
            <el-tag :type="scope.row.enable ? 'success' : 'danger'">
              {{
                scope.row.enable ? '启用' : '停用'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="备注"
          min-width="300"
          align="left"
          prop="remarks"
        />
        <el-table-column
          label="操作"
          align="right"
          width="220"
          fixed="right"
        >
          <template slot-scope="scope">
            <EButton
              icon="check"
              type="text"
              @click="viewPartFn(scope.row)"
            >
              查看
            </EButton>
            <EButton
              v-if="hasBtnPermission('inspection_standard_add')"
              icon="add"
              type="text"
              @click="addInspectionContent(scope.row)"
            >
              新增巡检内容
            </EButton>
            <EMoreButton
              icon="more"
              text="更多"
              :list="getMoreButton(scope.row)"
              @delete="delPart(scope.row)"
              @edit="editPartFn(scope.row)"
            />
            <!-- <EButton icon="edit" type="text" @click="editPartFn(scope.row)" v-if="hasBtnPermission('inspection_standard_modify')">编辑</EButton>
            <EButton icon="delete" type="text" @click="delPart(scope.row)" v-if="hasBtnPermission('inspection_standard_delete')">删除</EButton> -->
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        style="text-align: right"
        :current-page.sync="searchData.pageNum"
        :page-sizes="[10, 20, 50]"
        background
        :page-size.sync="searchData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getTableData"
        @current-change="getTableData"
      />
    </ECard>
    <!-- 巡检部位的弹窗 -->
    <inspection-part-form
      slot="dialog"
      ref="inspectionPartForm"
      @refreshDataList="getTableData"
    />
    <!-- 巡检内容的弹窗 -->
    <inspection-content-form
      slot="dialog"
      ref="inspectionContentForm"
      @refreshDataList="getTableData"
    />
  </TreeTable>
</template>

<style lang="scss" scoped>
.search {
}
.auxiliary-button {
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
