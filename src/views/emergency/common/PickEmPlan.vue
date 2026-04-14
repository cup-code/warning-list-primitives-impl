<script>
import { emPlanGetByPage } from '@/http/emergency/emsource-api.js'

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
      planTypeList: [], // 预案类别下拉列表
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
    const allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.planTypeList = allDic.emplan_type
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
    /* 点击搜索 */
    searchClick() {
      this.isLoading = true
      emPlanGetByPage(this.searchData)
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
      console.log(pickItem)
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
        this.pickList.push({ id: pickItem.id, name: pickItem.pmdw })
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
  <div
    v-loading="isLoading"
    class="pick-bg"
  >
    <!-- 搜索栏 -->
    <el-form
      inline
      label-width="100"
    >
      <el-form-item label="预案类型">
        <el-select
          v-model="searchData.planType"
          clearable
          placeholder="全部"
        >
          <el-option
            v-for="item in planTypeList"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          size="mini"
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
        label="预案类型"
        align="center"
        min-width="100"
      >
        <template slot-scope="scope">
          <span>{{ $dictUtils.getDictLabelById('emplan_type', scope.row.planType, '--') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="预案名称"
        align="center"
        prop="planName"
      />
      <el-table-column
        label="是否备案"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.isFiling ? 'success' : 'danger'">
            {{
              scope.row.isFiling ? '是' : '否'
            }}
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
          {{ item.name }}
        </el-tag>
      </div>
    </div>
    <!-- 底部按钮 -->
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 20px 0 0"
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
  .pick-page {
    display: flex;
    align-items: center;
    justify-content: flex-end;
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
  }
  .activeRadio {
    color: #409eff;
    border: none;
  }
}
</style>
