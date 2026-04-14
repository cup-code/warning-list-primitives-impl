/* * @Author: xiaorui 安全奖励中引用随手拍收据弹框 * @Date: 2023-03-30 14:22:28 * @Last Modified by:
xiaorui * @Last Modified time: 2023-04-03 10:39:27 */
<script>
import SelectTree from '@/components/treeSelect/treeSelect'
import { getSafeCheckAccountByPage } from '@/http/defense/shandong/safeCheck-api'

export default {
  components: {
    SelectTree,
  },
  props: {
    // 人员列表
    personList: {
      type: Array,
      default() {
        return []
      },
    },
    // 部门列表
    departList: {
      type: Array,
      default() {
        return []
      },
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
      visible: false,
      loading: false,
      total: 0,
      timeValue: '',
      personListShow: [],
      searchData: {
        pageNum: 1,
        pageSize: 10,
        troubleFindTimeStart: '', // 隐患发现起始日期
        troubleFindTimeEnd: '', // 隐患发现截止日期
        checkUserId: '', // 发现人id
        troubleFindDeptId: '', // 	部门id
        troubleSource: 3,
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
    init() {
      this.filterUserList()
      this.visible = true
    },
    /* 点击搜索 */
    queryClick() {
      this.searchData.pageNum = 1
      this.searchClick()
    },
    /* 搜索 */
    searchClick() {
      this.loading = true
      getSafeCheckAccountByPage(this.searchData)
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
          this.loading = false
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
    // 获取起止时间
    getTimeValue(v) {
      if (v && v.length) {
        this.searchData.troubleFindTimeStart = v[0]
        this.searchData.troubleFindTimeEnd = v[1]
      }
      else {
        this.searchData.troubleFindTimeStart = ''
        this.searchData.troubleFindTimeEnd = ''
      }
    },
    filterUserList(val) {
      if (!val) {
        // 列表中展示的人员
        this.personListShow = this.personList.slice(0, 30)
      }
      else {
        const result = this.personList.filter((item) => {
          return item.fullName.includes(val)
        }) // 存储符合条件的下拉选项
        this.personListShow = result.slice(0, 30) // 只取前30个
      }
    },
    /* 确认保存 */
    submitClick() {
      let result = { data: this.pickList }
      if (this.isSingle) {
        result = { data: this.pickData }
      }
      this.$emit('submitChoosePeople', result)
      this.visible = false
    },
  },
}
</script>

<template>
  <el-dialog
    class="normal-dialog"
    title="引用安全随手拍数据"
    :visible.sync="visible"
    width="900px"
    append-to-body
    :close-on-click-modal="false"
  >
    <!-- 搜索栏 -->
    <el-form
      inline
      label-width="80"
    >
      <el-form-item label="日期">
        <el-date-picker
          v-model="timeValue"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          @change="getTimeValue"
        />
      </el-form-item>
      <el-form-item label="姓名">
        <el-select
          v-model="searchData.checkUserId"
          filterable
          clearable
          style="width: 120px"
          :filter-method="filterUserList"
        >
          <el-option
            v-for="item in personListShow"
            :key="item.id"
            :label="item.fullName"
            :value="item.id"
          >
            <span style="float: left">{{ item.fullName }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{
              item.departmentName
            }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="部门">
        <SelectTree
          style="width: 150px"
          :list="departList"
          :props="{
            value: 'id',
            label: 'departmentName',
            children: 'children',
          }"
          :value="searchData.troubleFindDeptId"
          @getValue="
            val => {
              searchData.troubleFindDeptId = val
            }
          "
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          :loading="loading"
          @click="queryClick"
        >
          查询
        </el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table
      v-loading="loading"
      class="pick-table"
      :data="tableData"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
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
        label="日期"
        align="center"
        prop="troubleFindTime"
      />
      <el-table-column
        label="被奖励人员姓名"
        align="center"
        prop="checkUserFullName"
      />
      <el-table-column
        label="被奖励人员单位"
        align="center"
        prop="checkUserDepartName"
      />
      <el-table-column
        label="隐患整改进度"
        align="center"
      >
        <template slot-scope="props">
          <el-tag
            v-if="props.row.troubleState === 0"
            type="warning"
          >
            待审核
          </el-tag>
          <el-tag
            v-if="props.row.troubleState === 1"
            type="warning"
          >
            待派发
          </el-tag>
          <el-tag
            v-if="props.row.troubleState === 2"
            type="warning"
          >
            待整改
          </el-tag>
          <el-tag
            v-if="props.row.troubleState === 3"
            type="warning"
          >
            待验收
          </el-tag>
          <el-tag
            v-if="props.row.troubleState === 4"
            type="warning"
          >
            待复查
          </el-tag>
          <el-tag
            v-if="props.row.troubleState === 5"
            type="success"
          >
            已复查
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <div class="pick-page">
      <el-pagination
        :disabled="loading"
        :current-page.sync="searchData.pageNum"
        :page-size.sync="searchData.pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, prev, pager, next, jumper, sizes"
        :total="total"
        style="text-align: right; margin-top: 5px"
        @current-change="searchClick"
        @size-change="searchClick"
      />
    </div>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        v-noMoreClick
        size="small"
        type="primary"
        @click="submitClick"
      >确定</el-button>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
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
</style>
