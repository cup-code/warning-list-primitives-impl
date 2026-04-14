/* * @Author: xiaorui 选择角色弹框 * @Date: 2023-07-06 11:20:03 * @Last Modified by: xiaorui * @Last
Modified time: 2023-12-18 14:59:15 */
<script>
import { getAllRoles } from '@/http/safe-production/role-manage-api'

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
    companyId: {
      type: String,
      default: '',
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
  },
  data() {
    return {
      isLoading: false,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        companyId: '',
        fuzzyQuery: '',
      },
      tableData: [],
      total: 0,
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
  created() {
    this.searchClick()
    if (this.isSingle) {
      this.pickData = JSON.parse(JSON.stringify(this.oldPickData))
    }
    else {
      this.pickList = JSON.parse(JSON.stringify(this.oldPickList))
    }
  },
  methods: {
    // 重置
    handleResetForm() {
      this.$refs.sarchForm.resetFields()
      this.searchClick()
    },
    /* 搜索 */
    searchClick() {
      this.isLoading = true
      this.searchData.companyId = this.companyId
      getAllRoles(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list || []
            this.total = res.data.result.total
          }
          else {
            this.$message.warning(res.data.message || '请求角色列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('请求角色列表失败', err)
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
  },
}
</script>

<template>
  <div class="pick-bg">
    <div class="dialog-info">
      <!-- 搜索栏 -->
      <el-form
        ref="sarchForm"
        inline
        :model="searchData"
        label-width="80"
        style="height: 50px"
      >
        <el-form-item
          label="角色名称"
          prop="fuzzyQuery"
        >
          <el-input
            v-model="searchData.fuzzyQuery"
            placeholder="角色名称"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            style="margin: 0 10px 0 0"
            :loading="isLoading"
            @click="searchClick"
          >
            查询
          </el-button>
          <el-button
            icon="el-icon-refresh-right"
            :loading="isLoading"
            @click="handleResetForm()"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
      <!-- 表格 -->
      <el-table
        v-loading="isLoading"
        class="pick-table"
        :data="tableData"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        height="calc(100% - 150px)"
      >
        <el-table-column
          v-if="!isSingle"
          width="55"
        >
          <template slot-scope="scope">
            <i
              :class="setPickClass(scope.row.id) ? 'el-icon-circle-check activeRadio' : ''"
              class="radio-normal"
              @click="pickClick(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="isSingle"
          width="55"
        >
          <template slot-scope="scope">
            <i
              :class="pickData.id == scope.row.id ? 'el-icon-circle-check activeRadio' : ''"
              class="radio-normal"
              @click="pickData = scope.row"
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
          label="责任组织"
          align="center"
          prop="departmentName"
        />
        <el-table-column
          label="角色名称"
          align="center"
          prop="roleName"
        />
      </el-table>
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
      <div
        v-if="!isSingle"
        class="pick-list"
      >
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
            {{ item.roleName }}
          </el-tag>
        </div>
      </div>
    </div>
    <!-- 底部按钮 -->
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 10px 0 0"
        @click="cancelClick"
      >
        取消
      </el-button>
      <el-button
        type="primary"
        size="medium"
        @click="submitClick"
      >
        确认保存
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pick-bg {
  height: 100%;
  .pick-list {
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
  }
  .activeRadio {
    color: #409eff;
    border: none;
  }
}
</style>
