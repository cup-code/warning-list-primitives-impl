<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { getPaging } from '@/http/specialEquipment/management-api'

export default {
  name: 'checkedSpecialEquipmentList',
  components: {
    SelectTree,
  },
  props: {
    /**
     * 公司唯一编号
     */
    companyId: String,
    /**
     * 是否显示搜索框
     */
    isShowSearch: Boolean,
    /**
     * 是否启用操作列
     */
    isEnableOperateColumn: Boolean,
  },
  data() {
    return {
      queryForm: {
        pageNum: 1,
        pageSize: 10,
        keywords: '',
        departmentId: '',
      },
      isLoading: false,
      tableData: [],
      tableTotal: 0,
      selectedList: [],
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    /**
     * 部门选择完成后回调
     * @param id 部门编号
     * @param name 部门名称
     * @param item 选中项
     */
    departmentSelectedCallback(id, name, item) {
      const me = this
      me.queryForm.departmentId = id
      me.$refs.departmentTreeDropDownList.closeSelect()
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
            me.tableTotal = res.result.total
            this.$nextTick(() => {
              this.setRowSelection()
            })
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
    // 设置选中状态
    setRowSelection() {
      this.tableData.forEach((row) => {
        if (
          this.selectedList.find((item) => {
            return item.id === row.id
          })
        ) {
          this.$refs.checkedSpecialEquipmentTable.toggleRowSelection(row, true)
        }
        else {
          this.$refs.checkedSpecialEquipmentTable.toggleRowSelection(row, false)
        }
      })
    },
    /**
     * 查询按钮单击
     */
    searchClick() {
      this.queryForm.pageNum = 1
      this.getTableData()
    },
    /**
     * 重置按钮单击
     */
    searchReset() {
      const me = this
      me.$refs.queryForm.resetFields()
      me.$refs.departmentTreeDropDownList.clearHandle()
      this.searchClick()
    },
    /**
     * 数据表格行选择
     * @param selection 所有已选中行数组
     * @param row 当前行
     */
    tableRowSelect(selection, row) {
      const me = this
      const isChecked = selection.length && selection.includes(row)
      if (isChecked) {
        if (!me.selectedList.find(item => row.id === item.id)) {
          me.selectedList.push(row)
        }
      }
      else {
        if (me.selectedList.find(item => row.id === item.id)) {
          me.selectedList = me.selectedList.filter((value, index, arr) => value.id !== row.id)
        }
      }
    },
    /**
     * 数据表格全选
     * @param selection
     */
    tableRowAllSelect(selection) {
      const arrayUnion = (array1, array2) => {
        const map = new Map()
        for (const item of array1.concat(array2)) {
          if (!map.has(item.id)) {
            map.set(item.id, item)
          }
        }
        return [...map.values()]
      }
      const arrayDifference = (array1, array2) => {
        return array1.reduce((res, cur) => {
          if (array2.every(item => item.id !== cur.id)) {
            res.push(cur)
          }
          return res
        }, [])
      }
      const me = this
      const isChecked = selection.length

      if (isChecked) {
        me.selectedList = arrayUnion(me.selectedList, selection)
      }
      else {
        me.selectedList = arrayDifference(me.selectedList, me.tableData)
      }
    },
    /**
     * 移除按钮单击
     * @param id 记录主键
     */
    removeClick(id) {
      this.tableData = this.tableData.filter((value, index, arr) => value.id !== id)
    },
    /**
     * 移除已选择的项
     * @param row 行数据
     */
    removeTagClick(row) {
      const me = this
      if (me.selectedList.includes(row)) {
        me.selectedList = me.selectedList.filter((value, index, arr) => value.id !== row.id)
      }
      this.setRowSelection()
    },
    /**
     * 获取全部选中的数据
     */
    getAllSelectedData() {
      return this.selectedList
    },
    setSelectedList(list = []) {
      this.selectedList = [].concat(list)
      this.setRowSelection()
    },
  },
}
</script>

<template>
  <el-container style="height: 550px">
    <el-header v-if="isShowSearch">
      <el-form
        ref="queryForm"
        label-width="80px"
        :model="queryForm"
      >
        <el-row>
          <el-col :span="9">
            <el-form-item
              prop="keywords"
              label="关键字"
            >
              <el-col :span="20">
                <el-input
                  v-model="queryForm.keywords"
                  placeholder="名称/资产号/设备号/规格型号"
                />
              </el-col>
            </el-form-item>
          </el-col>

          <el-col :span="9">
            <el-form-item
              prop="departmentId"
              label="所属部门"
            >
              <el-col :span="20">
                <SelectTree
                  ref="departmentTreeDropDownList"
                  :props="{
                    value: 'id', // ID字段名
                    label: 'departmentName', // 显示名称
                    children: 'children', // 子级字段名
                  }"
                  :url="companyId ? `sysDepartment/companyDepartment/${companyId}` : ''"
                  :value="queryForm.departmentId"
                  :clearable="true"
                  :accordion="true"
                  @getValue="departmentSelectedCallback"
                />
              </el-col>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-button
              type="primary"
              icon="el-icon-search"
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
          </el-col>
        </el-row>
      </el-form>
    </el-header>

    <el-container>
      <el-main>
        <el-table
          ref="checkedSpecialEquipmentTable"
          :data="tableData"
          :header-cell-style="{ background: '#f5f5f5' }"
          height="90%"
          row-key="id"
          highlight-current-row
          @select="tableRowSelect"
          @select-all="tableRowAllSelect"
        >
          <el-table-column
            align="center"
            label="序号"
            min-width="50"
            type="index"
          />
          <el-table-column
            v-if="isShowSearch"
            align="center"
            label="选择"
            min-width="50"
            type="selection"
          />
          <el-table-column
            label="所属部门"
            align="center"
            prop="departmentName"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="所属岗位"
            align="center"
            prop="workPostName"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="设备类型"
            align="center"
            prop="equipmentType"
            :show-overflow-tooltip="true"
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
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="资产号"
            align="center"
            prop="equipmentAssetCode"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="设备号"
            align="center"
            prop="equipmentUniqueCode"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="规格型号"
            align="center"
            prop="equipmentModel"
            :show-overflow-tooltip="true"
          />
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
            v-if="isEnableOperateColumn"
            label="操作"
            align="center"
            width="80"
            fixed="right"
          >
            <template #default="scope">
              <el-button
                type="text"
                style="color: var(--ky-danger)"
                @click="removeClick(scope.row.id)"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="isShowSearch"
          :disabled="isLoading"
          :current-page.sync="queryForm.pageNum"
          :page-sizes="[10, 20, 50]"
          background
          :page-size.sync="queryForm.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableTotal"
          style="text-align: center"
          @size-change="getTableData"
          @current-change="getTableData"
        />
      </el-main>

      <el-aside
        v-if="isShowSearch"
        style="width: 180px"
      >
        <el-card style="margin-left: 10px">
          <div
            slot="header"
            class="clearfix"
          >
            <span>已选择项</span>
          </div>

          <div>
            <el-row
              v-for="(item, index) in selectedList"
              :key="item.id"
            >
              <el-tag
                closable
                size="medium"
                style="margin: 2px 0"
                @close="removeTagClick(item)"
              >
                {{
                  item.equipmentName
                    + (item.equipmentUniqueCode ? `[${item.equipmentUniqueCode}]` : '')
                }}
              </el-tag>
            </el-row>
          </div>
        </el-card>
      </el-aside>
    </el-container>
  </el-container>
</template>

<style scoped lang="scss"></style>
