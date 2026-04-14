<script>
import { getUserList } from '@/http/safe-production/user-manage-api.js'

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
      total: 0,
      searchData: {
        pageNum: 1,
        pageSize: 10,
      },
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
    /* 点击搜索 */
    queryClick() {
      this.searchData.pageNum = 1
      this.searchClick()
    },
    /* 搜索 */
    searchClick() {
      this.isLoading = true
      getUserList(this.searchData)
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
  },
}
</script>

<template>
  <div
    v-loading="isLoading"
    class="person-pick"
  >
    <!-- 搜索栏 -->
    <el-form
      inline
      label-width="80"
    >
      <el-form-item label="关键字">
        <el-input
          v-model="searchData.fuzzyQuery"
          placeholder="姓名/工号"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="queryClick"
        >
          查询
        </el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table
      class="pick-table"
      :data="tableData"
      :header-cell-style="{ borderLeft: 'none', borderRight: 'none' }"
      align="center"
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
        label="所属部门"
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
        label="状态"
        align="center"
      >
        <template slot-scope="scope">
          <el-tag
            v-if="scope.row.status === '0'"
            type="danger"
          >
            禁用
          </el-tag>
          <el-tag
            v-if="scope.row.status === '1'"
            type="success"
          >
            在职
          </el-tag>
          <el-tag
            v-if="scope.row.status === '2'"
            type="warning"
          >
            借调
          </el-tag>
          <el-tag
            v-if="scope.row.status === '3'"
            type="danger"
          >
            离职
          </el-tag>
          <el-tag
            v-if="scope.row.status === '4'"
            type="danger"
          >
            退休
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <div class="pick-page">
      <el-pagination
        slot="page"
        :disabled="isLoading"
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
          {{ item.fullName }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.person-pick {
  padding-bottom: 10px;
  .pick-page {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 10px 0;
  }
  .pick-list {
    box-shadow: 0 0 16px rgba(0, 21, 41, 0.08);
    min-height: 60px;
    padding: 10px;
    .pick-list-title {
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
