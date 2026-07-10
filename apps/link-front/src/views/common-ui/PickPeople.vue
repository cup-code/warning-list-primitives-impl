<script>
import {
  getAllDepartByCompanyFn,
  getAllDepartByDepartFn,
  getDepartListSimple,
} from '@/http/safe-production/depart-manage-api'
import {
  getCompanyUserListByPageFn,
  getUserList,
  getUserListByRoleFn,
} from '@/http/safe-production/user-manage-api'

export default {
  props: {
    /* mark标记，emit结果时会一并传回 */
    mark: {
      type: [Number, String],
      default: '',
    },
    /* 是否单选 */
    isSingle: {
      type: Boolean,
      default: false,
    },
    // 当人员列表来源获取系统人员时，可接收部门id查询指定部门下的人员
    departmentId: {
      type: String,
      default: (JSON.parse(sessionStorage.getItem('user')) || {}).departmentId,
    },
    // 当人员列表来源获取公司人员时，可接收公司id查询指定公司下的人员
    companyId: {
      type: String,
      default: (JSON.parse(sessionStorage.getItem('user')) || {}).companyId,
    },
    /* 打开前已选的数据 - 多选 */
    oldPickList: {
      type: Array,
      default() {
        return []
      },
    },
    /* 打开前已选的数据 - 单选 */
    oldPickData: {
      type: Object,
      default() {
        return {}
      },
    },
    // 人员列表来源，默认为获取系统人员。值为’role，说明是获取登录用户所属角色拥有的组织架构权限下的所有人员；值为company，说明是获取登录用户所属公司下的所有人员
    listType: {
      type: String,
      default() {
        return 'system'
      },
    },
    showLicence: {
      // 是否显示内审员证照
      type: Boolean,
      default: false,
    },
    // 只查询当前部门 默认false
    withoutChildrenDepartment: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isLoading: false,
      total: 0,
      userStatusList: [
        {
          label: '禁用',
          value: '0',
        },
        {
          label: '在职',
          value: '1',
        },
        {
          label: '借调',
          value: '2',
        },
        {
          label: '离职',
          value: '3',
        },
        {
          label: '退休',
          value: '4',
        },
      ],
      searchData: {
        pageNum: 1,
        pageSize: 10,
        withoutChildrenDepartment: this.withoutChildrenDepartment,
        userStatusList: ['1'],
      },
      filterText: '',
      departmentList: [], // 左侧树的数据
      tableData: [],
      pickList: [], // 选中的数据，多选
      pickData: {}, // 选中的数据，单选
    }
  },
  computed: {
    setPickClass() {
      return function (id) {
        let isExsit = false
        for (const item of this.pickList) {
          if (item.id === id) {
            isExsit = true
            break
          }
        }
        return isExsit
      }
    },
  },
  watch: {
    filterText(val) {
      this.$refs.officeTree.filter(val)
    },
  },
  created() {
    this.getLeftTree()
    this.searchClick()
    if (this.isSingle) {
      this.pickData = JSON.parse(JSON.stringify(this.oldPickData))
    }
    else {
      this.pickList = JSON.parse(JSON.stringify(this.oldPickList))
    }
  },
  methods: {
    /* 点击搜索 */
    queryClick() {
      this.searchData.pageNum = 1
      this.searchClick()
    },
    // 重置
    handleResetForm() {
      this.$refs.sarchForm.resetFields()
      this.$refs.officeTree.setCurrentKey(null)
      this.searchData = {
        pageNum: 1,
        pageSize: 10,
        withoutChildrenDepartment: this.withoutChildrenDepartment,
      }
      this.queryClick()
    },
    getLeftTree() {
      let func = ''
      if (this.listType === 'system') {
        func = getAllDepartByDepartFn
        this.companyOrDepartId
          = this.departmentId
            || (JSON.parse(sessionStorage.getItem('user')) || {}).departmentId
      }
      else if (this.listType === 'role') {
        func = getDepartListSimple
      }
      else if (this.listType === 'company' || this.listType === 'contractor') {
        func = getAllDepartByCompanyFn
        this.companyOrDepartId
          = this.companyId || (JSON.parse(sessionStorage.getItem('user')) || {}).companyId
      }
      func(this.companyOrDepartId).then(({ data }) => {
        if (this.listType === 'contractor') {
          data.result = (data.result || []).filter(
            item => item.departmentType === 'CONTRACTOR',
          )
          this.departmentList = this.setContractorTreeData(data.result || [])
        }
        else {
          this.departmentList = this.setTreeData(data.result || [])
        }
      })
    },
    // 专门用来转化 承包商树
    setContractorTreeData(source) {
      const cloneData = JSON.parse(JSON.stringify(source))
      cloneData.sort((a, b) => {
        return a.sort - b.sort
      })
      return cloneData.filter((father) => {
        const branchArr = cloneData.filter(child => father.id == child.parentId)
        branchArr.length > 0 ? (father.children = branchArr) : ''
        return branchArr.length > 0 // 返回第一层
      })
    },
    /* 搜索 */
    searchClick() {
      this.isLoading = true
      let func = ''
      if (this.listType === 'system') {
        if (!this.searchData.departmentId) {
          this.searchData.departmentId = this.departmentId
        }
        func = getUserList
      }
      else if (this.listType === 'role') {
        if (this.searchData.departmentId) {
          func = getUserList
        }
        else {
          func = getUserListByRoleFn
          this.searchData.withMyDepartmentTypeParent = false
        }
      }
      else if (this.listType === 'company') {
        func = getCompanyUserListByPageFn
        this.searchData.penetration = true // 穿透
      }
      else if (this.listType === 'contractor') {
        // 承包商用户
        this.searchData.userType = 'contractor'
        func = getUserList
      }
      func(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list
            this.total = res.data.result.total
          }
          else {
            this.$message.warning(res.data.message || '请求用户列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('请求用户列表出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 点击选中回调-多选 */
    pickClick(pickItem) {
      let isExsit = false
      let dataIndex = -1
      for (let i = 0; i < this.pickList.length; i++) {
        if (pickItem.id === this.pickList[i].id) {
          isExsit = true
          dataIndex = i
          break
        }
      }
      if (isExsit) {
        this.pickList.splice(dataIndex, 1)
      }
      else {
        this.pickList.push(pickItem)
      }
    },
    /* 移除回调 */
    delTagClick(index) {
      this.pickList.splice(index, 1)
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', null)
    },
    /* 确认保存 */
    submitClick() {
      let result = { mark: this.mark, data: this.pickList }
      if (this.isSingle) {
        result = { mark: this.mark, data: this.pickData }
      }
      this.$emit('close', result)
    },
    filterNode(value, data) {
      if (!value)
        return true
      return data.departmentName.includes(value)
    },
    handleNodeClick(val) {
      if (val.onlyTreeUse)
        return
      this.searchData.departmentId = val.id || ''
      this.queryClick()
    },
    handleExistLicenceChange() {
      this.searchData.licenceName = '内审员证照'
    },
    handleExistLicenceClear() {
      this.searchData.licenceName = undefined
      this.searchData.existLicence = undefined
    },
    // 点击选中回调 -- 单选
    singlePickClick(v) {
      if (v.status === '0') {
        return
      }
      this.pickData = v
    },
  },
}
</script>

<template>
  <div v-loading="isLoading" class="pick-bg">
    <div class="container dialog-info">
      <el-aside width="300px" style="height: 100%; margin-right: 10px">
        <el-card class="org">
          <div slot="header" class="clearfix">
            <el-input
              v-model="filterText"
              placeholder="请输入关键字过滤"
              size="small"
            />
          </div>
          <el-tree
            ref="officeTree"
            :data="departmentList"
            :props="{
              value: 'id', // ID字段名
              label: 'departmentName', // 显示名称
              children: 'children', // 子级字段名
            }"
            default-expand-all
            highlight-current
            node-key="id"
            :filter-node-method="filterNode"
            :expand-on-click-node="false"
            style="height: calc(100% - 50px)"
            @node-click="handleNodeClick"
          >
            <span v-if="data.onlyTreeUse" slot-scope="{ node, data }">
              <span :style="{ color: '#ccc' }" @click.stop>{{ node.label }}</span>
            </span>
            <span v-else slot-scope="{ node, data }">
              <span>{{ node.label }}</span>
            </span>
          </el-tree>
        </el-card>
      </el-aside>
      <div class="content-wrap">
        <!-- 搜索栏 -->
        <el-form
          ref="sarchForm"
          inline
          :model="searchData"
          label-width="80"
        >
          <el-form-item label="关键字" prop="fuzzyQuery">
            <el-input
              v-model="searchData.fuzzyQuery"
              placeholder="姓名/工号"
              clearable
            />
          </el-form-item>
          <el-form-item label="状态" prop="userStatusList">
            <el-select
              v-model="searchData.userStatusList"
              placeholder="请选择"
              multiple
              clearable
            >
              <el-option
                v-for="item in userStatusList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="showLicence"
            prop="existLicence"
            label="内审员证照"
          >
            <el-select
              v-model="searchData.existLicence"
              clearable
              placeholder="请选择"
              @change="handleExistLicenceChange"
              @clear="handleExistLicenceClear"
            >
              <el-option label="有" :value="true" />
              <el-option label="无" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              style="margin: 0 10px 0 0"
              @click="queryClick"
            >
              查询
            </el-button>
            <el-button
              icon="el-icon-refresh-right"
              @click="handleResetForm()"
            >
              重置
            </el-button>
          </el-form-item>
        </el-form>
        <!-- 表格 -->
        <div class="pick-table">
          <el-table
            height="100%"
            :data="tableData"
            :header-cell-style="{ background: 'var(--ky-head-color)' }"
          >
            <el-table-column v-if="!isSingle" width="55">
              <template slot-scope="scope">
                <i
                  :class="
                    setPickClass(scope.row.id) ? 'el-icon-circle-check activeRadio' : ''
                  "
                  class="radio-normal"
                  @click="pickClick(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column v-if="isSingle" width="55">
              <template slot-scope="scope">
                <!-- <i :class="pickData.id == scope.row.id ? 'el-icon-circle-check activeRadio' : ''" class="radio-normal" @click="pickData = scope.row" /> -->
                <i
                  class="radio-normal"
                  :class="{
                    'el-icon-circle-check activeRadio': pickData.id === scope.row.id,
                    'disabled': scope.row.status === '0',
                  }"
                  @click="singlePickClick(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column
              type="index"
              width="50"
              align="center"
              label="序号"
            />
            <el-table-column
              label="所属企业"
              align="center"
              prop="companyName"
            />
            <el-table-column
              label="组织架构"
              align="center"
              prop="departmentName"
            />
            <el-table-column
              label="姓名"
              align="center"
              prop="fullName"
            />
            <el-table-column
              label="岗位"
              align="center"
              prop="postName"
            />
            <el-table-column
              label="工号"
              align="center"
              prop="jobNumber"
            />
            <el-table-column
              v-if="showLicence"
              label="内审员证照"
              align="center"
              prop="existLicence"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.existLicence ? "有" : "无" }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" align="center">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.status === '0'" type="danger">
                  禁用
                </el-tag>
                <el-tag v-if="scope.row.status === '1'" type="success">
                  在职
                </el-tag>
                <el-tag v-if="scope.row.status === '2'" type="warning">
                  借调
                </el-tag>
                <el-tag v-if="scope.row.status === '3'" type="danger">
                  离职
                </el-tag>
                <el-tag v-if="scope.row.status === '4'" type="danger">
                  退休
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!-- 分页器 -->
        <div class="pick-page">
          <el-pagination
            slot="page"
            :disabled="isLoading"
            background
            :current-page.sync="searchData.pageNum"
            :page-size.sync="searchData.pageSize"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, prev, pager, next, jumper, sizes"
            :total="total"
            @current-change="searchClick"
            @size-change="searchClick"
          />
        </div>
        <!-- 已选择 -->
        <div v-if="!isSingle" class="pick-list">
          <div class="pick-list-title">
            已选择
          </div>
          <div>
            <el-tag
              v-for="(item, index) in pickList"
              :key="item.id"
              closable
              @close="delTagClick(index)"
            >
              {{ item.fullName }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
    <!-- 底部按钮 -->
    <div class="dialog-footer">
      <el-button
        size="small"
        style="margin: 0 10px 0 0"
        @click="cancelClick"
      >
        取消
      </el-button>
      <el-button
        type="primary"
        size="small"
        @click="submitClick"
      >
        确认保存
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.org ::v-deep {
  .el-card__body {
    height: calc(100% - 60px);
    // overflow: auto;
  }
}
.pick-bg {
  height: 100%;
  .container {
    display: flex;
    height: 475px;
    .org {
      height: 100%;
    }
  }
  .pick-page {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 10px;
  }
  .pick-list {
    // border: 1px solid lightgray;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    min-height: 60px;
    padding: 5px;
    .pick-title {
      margin: 0 0 10px 0;
      font-weight: bold;
    }
  }
  .radio-normal {
    display: block;
    width: 20px;
    height: 20px;
    border: 1px solid lightgray;
    border-radius: 50%;
    font-size: 20px;
    line-height: 20px;
    user-select: none;
    cursor: pointer;
    &.disabled {
      background-color: #f5f7fa;
      border-color: #e4e7ed;
      cursor: not-allowed;
    }
  }
  .activeRadio {
    color: #409eff;
    border: none;
  }
}
.pick-table {
  flex: 1;
  overflow: hidden;
  padding: 10px;
}
.content-wrap {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
