<script>
import { getScheduleResList } from '@/http/notice/notice-api'
import { formatDate } from '@/utils'

export default {
  data() {
    return {
      loading: false,
      tableData: [],
      pageFlag: true,
      total: 0,
      sForm: {
        page: 1,
        pageSize: 10,
      },
      sFormCopy: null, // sForm的原始数据
      submitLoading: false,
      drawer_sh: false,
      options: [],
      typeList: [
        { name: '设备写值', value: 'SetIoValue' },
        // {name: '设备命令', value: 'CommandInvocation'},
        // {name: '发送短信', value: 'SmsSend'},
        // {name: 'groovy脚本', value: 'GroovyScript'},
        // {name: '批量设备命令', value: 'BatchCommandInvocation'}
      ],
      stateList: [
        { name: '成功', value: 1 },
        { name: '失败', value: 0 },
      ],
    }
  },
  created() {
    this.getDataList()
  },
  methods: {
    formatDate,
    pageSizeFn(v) {
      this.sForm.page = 1
      this.sForm.pageSize = v
      this.getDataList()
    },
    pageCurFn(v) {
      this.sForm.page = v
      this.getDataList()
    },
    getDataList() {
      this.loading = true
      getScheduleResList(this.sForm)
        .then(({ data }) => {
          this.loading = false
          const msg = data.message
          if (data.success) {
            this.tableData = data.result.list || []
            this.total = data.result.total
          }
          else {
            this.$message.error(msg || '查询任务执行记录失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('查询任务执行记录失败')
        })
    },

    // 外部的 查询按钮
    searchFn() {
      this.drawer_sh = true

      // 记录sForm数据 到 sFormCopy
      this.sFormCopy = JSON.parse(JSON.stringify(this.sForm))
    },
    // 抽屉的 查询按钮（确定按钮）
    searchDoFn() {
      this.drawer_sh = false
      this.sFormCopy = JSON.parse(JSON.stringify(this.sForm))

      // 生成搜索条件数据
      this.genOpts()
    },
    // 移除筛选条件
    removeFn(v) {
      const opts = this.options
      const idx = opts.indexOf(v)
      this.options.splice(idx, 1)

      Object.keys(this.sForm).forEach((k) => {
        if (v.type === k) {
          this.sForm[k] = ''
        }
      })
      this.getDataList()
    },
    // 查询抽屉的 关闭
    dCloseFn() {
      this.sForm = JSON.parse(JSON.stringify(this.sFormCopy))
    },
    // 生成搜索条件数据
    genOpts() {
      const opts = []
      let temp
      let key
      let val
      Object.entries(this.sForm).forEach((item) => {
        temp = {}
        key = item[0]
        val = item[1]
        if (key !== 'page' && key !== 'pageSize' && (val || val === 0)) {
          temp.type = key
          temp.name = val

          let i, list, len, cur
          if (key === 'jobType') {
            // 任务类型
            list = this.typeList
            len = list.length
            for (i = 0; i < len; i++) {
              cur = list[i]
              if (cur.value == val) {
                temp.name = cur.name
                break
              }
            }
          }
          if (key === 'state') {
            // 执行结果
            list = this.stateList
            len = list.length
            for (i = 0; i < len; i++) {
              cur = list[i]
              if (cur.value == val) {
                temp.name = cur.name
                break
              }
            }
          }
          opts.push(temp)
        }
      })
      this.options = opts
      this.getDataList()
    },
  },
}
</script>

<template>
  <TreeTable :isShowLeft="false">
    <!-- 按钮 -->
    <ECard
      slot="search"
      noneBottom
      style="display: flex; padding: 14px"
    >
      <div class="flex items-center pr-2">
        <transition-group name="toUp">
          <el-tag
            v-for="item in options"
            :key="item.name"
            type="danger"
            size="small"
            closable
            @close="removeFn(item)"
          >
            {{ item.name }}
          </el-tag>
        </transition-group>
      </div>
      <EButton
        type="primary"
        btnIcon="el-icon-search"
        @click="searchFn"
      >
        查询
      </EButton>
    </ECard>
    <!-- <el-row class="header">
      <el-col :span="24" class="cdns-con">
        <div class="cdns">
          <transition-group name="toUp">
            <el-tag v-for="item in options" :key="item.name" type="danger" size="small" closable @close="removeFn(item)">{{ item.name }}</el-tag>
          </transition-group>
        </div>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="searchFn">查询</el-button>
      </el-col>
    </el-row> -->

    <ECard slot="table">
      <el-table
        v-loading="loading"
        class="schedule-table"
        :data="tableData"
        size="small"
        style="width: 100%"
        height="74vh"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column
          label="任务名称"
          prop="scheduleName"
          align="center"
        />
        <el-table-column
          label="任务类型"
          prop="jobType"
          align="center"
        >
          <template slot-scope="props">
            <el-tag
              v-if="props.row.jobType === 'SetIoValue'"
              size="mini"
              type="primary"
            >
              设备写值
            </el-tag>
            <el-tag
              v-if="props.row.jobType === 'CommandInvocation'"
              size="mini"
              type="primary"
            >
              设备命令
            </el-tag>
            <el-tag
              v-if="props.row.jobType === 'SmsSend'"
              size="mini"
              type="primary"
            >
              发送短信
            </el-tag>
            <el-tag
              v-if="props.row.jobType === 'GroovyScript'"
              size="mini"
              type="primary"
            >
              groovy脚本
            </el-tag>
            <el-tag
              v-if="props.row.jobType === 'BatchCommandInvocation'"
              size="mini"
              type="primary"
            >
              批量设备命令
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="执行结果"
          prop="isSuccess"
          align="center"
        >
          <template slot-scope="props">
            <el-tag
              v-if="props.row.isSuccess"
              size="mini"
              type="success"
            >
              成功
            </el-tag>
            <el-tag
              v-if="!props.row.isSuccess"
              size="mini"
              type="danger"
            >
              失败
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="结果说明"
          prop="resultDesc"
          align="center"
        />
        <el-table-column
          label="更新时间"
          prop="createdTime"
          align="center"
        />
      </el-table>
    </ECard>

    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        v-if="pageFlag"
        style="text-align: right; background: #ffffff"
        :current-page="sForm.page"
        :page-sizes="[10, 20, 50]"
        background
        :page-size="sForm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="pageSizeFn"
        @current-change="pageCurFn"
      />
    </ECard>

    <!-- 内容 -->
    <!-- <el-row class="mid-con">
      <el-col :span="24"> </el-col>
    </el-row> -->

    <!-- 页码 -->
    <!-- <el-row>
      <el-col :span="24">
        <el-pagination
          v-if="pageFlag"
          style="text-align: right; background: #ffffff; padding: 5px 0"
          @size-change="pageSizeFn"
          @current-change="pageCurFn"
          :current-page="sForm.page"
          :page-sizes="[10, 20, 50]"
          background
          :page-size="sForm.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        />
      </el-col>
    </el-row> -->

    <template slot="dialog">
      <!-- 查询 抽屉 -->
      <el-drawer
        :visible.sync="drawer_sh"
        :with-header="false"
        @close="dCloseFn"
      >
        <!-- 标题 -->
        <div class="drawer-title">
          查询
        </div>

        <!-- 分割线 -->
        <el-divider />

        <!-- 内容 -->
        <div class="drawer-con">
          <el-form
            ref="form"
            :model="sForm"
            label-width="70px"
            size="mini"
          >
            <el-form-item
              label="任务名称"
              prop="name"
            >
              <el-input v-model="sForm.name" />
            </el-form-item>
            <el-form-item
              label="任务类型"
              prop="jobType"
            >
              <el-select
                v-model="sForm.jobType"
                placeholder="请选择"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in typeList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                >
                  <span>{{ item.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="执行结果"
              prop="state"
            >
              <el-select
                v-model="sForm.state"
                placeholder="请选择"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in stateList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                >
                  <span>{{ item.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>

          <div class="drawer-con-btns">
            <el-button
              size="mini"
              type="primary"
              :loading="submitLoading"
              @click="searchDoFn"
            >
              查询
            </el-button>
          </div>
        </div>
      </el-drawer>
    </template>
  </TreeTable>
</template>

<style lang="scss" scoped>
.scheduleResList-notice {
  position: relative;
  padding: 10px;
  background: #f3f7f9;
  .header {
    background: #ffffff;
    padding: 10px;
  }
  .cdns-con {
    display: flex;
    justify-content: flex-end;
    .cdns {
      flex: 1;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      .el-tag {
        margin-right: 6px;
      }
    }
  }
  .mid-con {
    padding: 2vh 0;
    .schedule-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
}
</style>
