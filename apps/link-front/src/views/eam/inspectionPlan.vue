/* * @Author: xiaorui 巡检计划页面 * @Date: 2022-05-06 17:17:55 * @Last Modified by:
xiaorui * @Last Modified time: 2022-08-10 18:29:27 */
<!-- 新的巡检计划页面 -->
<script>
import { cloneDeep } from 'lodash'
import {
  changeStateFn,
  deleteInspectionPlanFn,
  getInspectionPlanByPageFn,
  getStateCountFn,
} from '@/http/dev_new/inspection-api'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'

export default {
  components: {
    OwnDeparmentTree,
  },
  data: () => ({
    loading: false,
    tableData: [],
    total: 0,
    sForm: {
      pageNum: 1,
      pageSize: 10,
      departmentId: '',
      inspectionType: '', // 巡检类型
      planName: '', // 计划名称
      planState: '', // 状态：待提交-1；发布-2；停用-3
    },
    moreButton: [
      {
        type: 'text',
        props: 'publish',
        btnIcon: 'el-icon-s-promotion',
        size: 'mini',
        text: '发布',
        disabled: false,
      },
      {
        type: 'text',
        props: 'stop',
        icon: 'stop',
        size: 'mini',
        text: '停用',
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
    typeList: [
      {
        label: '日常巡检',
        value: '1',
        id: 1,
      },
      {
        label: '专业点检',
        value: '2',
        id: 2,
      },
      {
        label: '精密点检',
        value: '3',
        id: 3,
      },
      {
        label: '辅助记录',
        value: '4',
        id: 4,
      },
    ], // 巡检类型list
    cycleOptions: [
      {
        label: '每天',
        value: 'DAY',
        id: 1,
      },
      {
        label: '每周',
        value: 'WEEK',
        id: 2,
      },
      {
        label: '每月',
        value: 'MONTH',
        id: 3,
      },
      {
        label: '每年',
        value: 'YEAR',
        id: 4,
      },
    ],
    statusOptions: [], // 状态集合
  }),
  computed: {
    getMoreButton() {
      return function (scope) {
        return this.moreButton.filter((item) => {
          return (
            (['1', '3'].includes(scope.planState) && item.props === 'publish')
            || (scope.planState === '2' && item.props === 'stop')
            || item.props === 'delete'
          )
        })
      }
    },
  },
  mounted() {
    this.getDataList()
  },
  methods: {
    // 添加计划
    addFn() {
      this.$router.push({
        path: `/detail/inspectionPlanDetail/${null}/add`,
      })
    },
    // 编辑计划
    editFn(v) {
      this.$router.push({
        path: `/detail/inspectionPlanDetail/${v.id}/edit`,
      })
    },
    // 查看计划
    viewFn(v) {
      this.$router.push({
        path: `/detail/inspectionPlanDetail/${v.id}/view`,
      })
    },
    // 发布计划
    changeState(planId, planState) {
      const params = {
        planId,
        planState,
      }
      changeStateFn(params).then(({ data }) => {
        if (data.success) {
          this.$message.success(data.message || '状态切换成功')
          this.getDataList()
        }
        else {
          this.$message.warning(data.message || '状态切换失败')
        }
      })
    },
    // 删除
    delFn(v) {
      this.$confirm(`您确认要删除计划 ${v.planName} ?`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          deleteInspectionPlanFn(v.id)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.warning(data.message || '删除失败')
                this.loading = false
              }
            })
            .catch((err) => {
              this.$message.error('删除失败')
              this.loading = false
            })
        })
        .catch(() => {})
    },
    // 点击部门树的item
    treeNodeTap(v) {
      // 记录 部门名字 和 id
      if (v.onlyTreeUse)
        return
      this.sForm.pageNum = 1
      this.sForm.departmentId = v.id
      this.getDataList()
    },
    getDataList() {
      // 查询计划
      this.loading = true
      // 获取巡检计划列表的时候需要深拷贝，因为状态为全部的时候，调接口的时候需要删除状态的key
      // 获取状态列表
      const arr = [
        getInspectionPlanByPageFn(cloneDeep(this.sForm)),
        getStateCountFn(this.sForm),
      ]
      Promise.all(arr)
        .then((res) => {
          this.loading = false
          const deviceList = res[0].data // 设备列表的数据
          const stateList = res[1].data // 状态列表的数据
          if (deviceList.success) {
            this.tableData = deviceList.result.list || []
            this.total = deviceList.result.total
          }
          else {
            this.$message.warning(deviceList.message || '查询巡检计划失败')
          }
          if (stateList.success) {
            let totalCount = 0
            stateList.result.forEach((item) => {
              item.label
                = item.planState === '1'
                  ? '待发布'
                  : item.planState === '2'
                    ? '已发布'
                    : '停用'
              totalCount += item.count
            })
            this.statusOptions = [
              {
                planState: '0',
                label: '全部',
                count: totalCount,
              },
            ].concat(stateList.result || [])
          }
          else {
            this.$message.warning(stateList.message || '查询状态失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('查询失败')
        })
    },
    searchFn() {
      this.sForm.pageNum = 1
      this.getDataList()
    },
    // 点击状态tag
    statusChange(state) {
      this.sForm.planState = state === this.sForm.planState ? '' : state // 如果未选中则选中，如果已选中则置空
      this.searchFn()
    },
    getLabel(val, list) {
      return this[list].find((item) => {
        return item.value === val
      }).label
    },
    resetSearch() {
      this.sForm.planName = ''
      this.sForm.inspectionType = ''
      this.getDataList()
    },
  },
}
</script>

<template>
  <TreeTable>
    <!-- 左侧树 -->
    <OwnDeparmentTree slot="tree" @treeNodeTap="treeNodeTap" />
    <ECard
      slot="search"
      customStyle="margin-bottom:0;"
      type="search"
    >
      <el-form
        ref="sForm"
        :inline="true"
        :model="sForm"
        size="mini"
        @submit.native.prevent
      >
        <el-form-item prop="planName" label="计划名称">
          <el-input
            v-model="sForm.planName"
            placeholder="计划名称"
            clearable
          />
        </el-form-item>
        <el-form-item prop="model" label="巡检类型">
          <el-select
            v-model="sForm.inspectionType"
            placeholder="请选择"
            filterable
            clearable
          >
            <el-option
              v-for="item in typeList"
              :key="item.id"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            :loading="loading"
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
          type="primary"
          plain
          icon="el-icon-plus"
          @click="addFn"
        >
          新增
        </el-button>
        <EButton
          v-for="(item, index) in statusOptions"
          :key="index"
          size="mini"
          type="primary"
          plain
          :effect="sForm.planState === item.planState ? 'dark' : 'plain'"
          @click="statusChange(item.planState)"
        >
          {{ item.label }}
          {{ item.count }}
        </EButton>
      </div>
      <el-table
        ref="table"
        v-loading="loading"
        height="90%"
        :data="tableData"
        size="mini"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column
          label="编号"
          prop="planCode"
          align="center"
        />
        <el-table-column
          label="计划名称"
          prop="planName"
          align="center"
          min-width="120"
        >
          <template slot-scope="scope">
            <span class="check" @click="viewFn(scope.row)">{{ scope.row.planName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="所属部门"
          prop="departmentName"
          align="center"
        />
        <el-table-column
          label="巡检类型"
          prop="inspectionType"
          align="center"
          min-width="100"
        >
          <template slot-scope="scope">
            {{ getLabel(scope.row.inspectionType, "typeList") }}
          </template>
        </el-table-column>
        <el-table-column
          label="巡检周期"
          prop="cycleFiled"
          align="center"
        >
          <template slot-scope="scope">
            {{
              scope.row.scheduleMode === "CYCLE"
                ? `${
                  getLabel(scope.row.cycleFiled, "cycleOptions") + scope.row.frequency
                }次`
                : ""
            }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="巡检岗位" prop="postName" align='center' min-width="100"></el-table-column> -->
        <el-table-column
          label="巡检人"
          prop="executeUserList"
          align="center"
          min-width="100"
        >
          <template slot-scope="scope">
            {{ scope.row.executeUserList.join("、") }}
          </template>
        </el-table-column>
        <el-table-column
          label="上次巡检人"
          prop="lastExecuteUserList"
          align="center"
        />
        <el-table-column
          label="上次巡检时间"
          prop="lastExecuteTime"
          align="center"
          min-width="120"
        />
        <el-table-column
          label="状态"
          prop="planState"
          align="center"
        >
          <template slot-scope="props">
            <el-tag v-if="props.row.planState === '1'">
              待发布
            </el-tag>
            <el-tag v-if="props.row.planState === '2'" type="success">
              已发布
            </el-tag>
            <el-tag v-if="props.row.planState === '3'" type="danger">
              停用
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          min-width="180"
          align="right"
          fixed="right"
        >
          <template slot-scope="scope">
            <EButton
              icon="check"
              type="text"
              @click="viewFn(scope.row)"
            >
              查看
            </EButton>
            <EButton
              icon="edit"
              type="text"
              @click="editFn(scope.row)"
            >
              编辑
            </EButton>
            <EMoreButton
              icon="more"
              text="更多"
              :list="getMoreButton(scope.row)"
              @publish="changeState(scope.row.id, '2')"
              @stop="changeState(scope.row.id, '3')"
              @delete="delFn(scope.row)"
            />
            <!-- <EButton
              @click="changeState(scope.row.id, '2')"
              btnIcon="el-icon-s-promotion"
              type="text"
              v-if="scope.row.planState === '1' || scope.row.planState === '3'"
            >
              发布
            </EButton> -->
            <!-- <EButton @click="changeState(scope.row.id, '3')" icon="stop" type="text" v-if="scope.row.planState === '2'">停用</EButton>
            <EButton @click="delFn(scope.row)" type="text" icon="delete">删除</EButton> -->
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <ECard slot="page" type="footer">
      <el-pagination
        style="text-align: right"
        :current-page.sync="sForm.pageNum"
        :page-sizes="[10, 20, 50]"
        background
        :page-size.sync="sForm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getDataList"
        @current-change="getDataList"
      />
    </ECard>
  </TreeTable>
</template>

<style lang="scss" scoped>
.sForm {
  margin-bottom: 10px;
}
.sForm ::v-deep {
  .el-form-item--mini {
    margin-bottom: 18px;
  }
}

.auxiliary-button {
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.tagStyle {
  cursor: pointer;
  border: 1px solid var(--ky-info);
  height: 28px;
  line-height: 28px;
  padding: 0 10px;
  border-radius: 3px;
  margin-left: 5px;
  color: var(--ky-info);
}
.tagStyle:hover {
  background: var(--ky-info);
  color: #ffffff;
}
</style>
