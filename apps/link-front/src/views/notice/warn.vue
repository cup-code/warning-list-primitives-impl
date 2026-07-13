<script>
import { getAlertRecordList } from '@/http/notice/notice-api'
import { formatDate } from '@/utils'

export default {
  data: () => ({
    loading: false,
    tableData: [],
    pageFlag: true,
    sForm: {
      page: 1,
      pageSize: 10,
    },
    total: 0,
    drawer_sh: false,
    sourceList: [
      { name: 'mqtt上报', value: 'MQTT' },
      { name: '触发规则', value: 'RULE' },
    ],
    executeList: [
      { name: '已执行', value: 1 },
      { name: '未执行', value: 0 },
    ],
    options: [], // 查询条件
    sFormCopy: null, // sForm的原始数据
  }),
  created() {
    this.getDataList()
  },
  methods: {
    formatDate,
    getDataList() {
      this.loading = true
      getAlertRecordList(this.sForm)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message

          if (resD.success === true) {
            this.tableData = resD.result.list || []
            this.total = resD.result.total
          }
          else {
            this.$message.error(msg || '查询规则失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('查询规则失败')
        })
    },
    pageCurFn(v) {
      this.sForm.page = v
      this.getDataList()
    },
    // 查询 按钮
    searchFn() {
      this.drawer_sh = true

      // 记录sForm数据 到 sFormCopy
      this.sFormCopy = JSON.parse(JSON.stringify(this.sForm))
    },
    // 查询 确定 按钮
    searchDoFn() {
      this.drawer_sh = false

      this.sFormCopy = JSON.parse(JSON.stringify(this.sForm))
      // 生成搜索条件数据
      this.genOpts()
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
        val = `${item[1]}`
        if (key !== 'page' && key !== 'pageSize' && val) {
          temp.name = val
          temp.type = key

          let i, list, len, cur
          if (key === 'source') {
            // 报警来源
            list = this.sourceList
            len = list.length
            for (i = 0; i < len; i++) {
              cur = list[i]
              if (cur.value == val) {
                temp.name = cur.name
                break
              }
            }
          }
          if (key === 'actionExecuted') {
            // 执行动作
            list = this.executeList
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

      // 页面展示查询条件需要的 list
      this.options = opts

      // 根据新生成的sForm, 重新请求数据
      this.sForm.page = 1
      this.sForm.pageSize = 10
      this.getDataList()
    },
    // 查询抽屉的 关闭
    dCloseFn() {
      this.sForm = JSON.parse(JSON.stringify(this.sFormCopy))
    },
    // 移除筛选条件
    removeFn(v) {
      const opts = this.options
      const idx = opts.indexOf(v)
      this.options.splice(idx, 1)

      Object.keys(this.sForm).forEach((key) => {
        if (v.type === key) {
          this.sForm[key] = ''
        }
      })

      // 根据新生成的sForm, 重新请求数据
      this.sForm.page = 1
      this.sForm.pageSize = 10
      this.getDataList()
    },
  },
}
</script>

<template>
  <div class="warn-notice">
    <!-- 按钮 -->
    <el-row>
      <el-col
        :span="24"
        class="cdns-con"
      >
        <div class="cdns">
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
        <el-button
          size="mini"
          type="primary"
          @click="searchFn"
        >
          查询
        </el-button>
      </el-col>
    </el-row>

    <!-- 内容 -->
    <el-row class="mid-con">
      <el-col :span="24">
        <el-table
          v-loading="loading"
          class="group-table"
          :data="tableData"
          border
          size="mini"
          style="width: 100%"
          :header-cell-style="{ background: '#f5f5f5' }"
        >
          <el-table-column
            label="设备名称"
            prop="deviceName"
            align="center"
          />
          <el-table-column
            label="发生时间"
            prop="eventDate"
            align="center"
          >
            <template slot-scope="props">
              {{ formatDate(props.row.eventDate) }}
            </template>
          </el-table-column>
          <el-table-column
            label="测点名称"
            prop="ioName"
            align="center"
          />
          <el-table-column
            label="动作执行"
            prop="isExecuteAction"
            align="center"
          >
            <template slot-scope="props">
              <el-tag
                v-if="props.row.isExecuteAction"
                size="mini"
                type="success"
              >
                已执行
              </el-tag>
              <el-tag
                v-else
                size="mini"
                type="danger"
              >
                未执行
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="规则名称"
            prop="ruleName"
            align="center"
          >
            <template slot-scope="props">
              <el-tag size="mini">
                {{ props.row.ruleName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="报警来源"
            prop="source"
            align="center"
          >
            <template slot-scope="props">
              <el-tag
                size="mini"
                type="warning"
              >
                {{ props.row.source }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <!-- 页码 -->
    <el-row>
      <el-pagination
        v-if="pageFlag"
        style="text-align: right"
        :current-page="sForm.page"
        :page-size="sForm.pageSize"
        layout="total, prev, pager, next, jumper"
        :total="total"
        @current-change="pageCurFn"
      />
    </el-row>

    <!-- 查询 抽屉 -->
    <el-drawer
      :visible.sync="drawer_sh"
      :with-header="false"
      @close="dCloseFn"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        查询条件
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-form
          ref="sForm"
          :model="sForm"
          label-width="85px"
          size="mini"
        >
          <el-form-item label="设备编码">
            <el-input v-model="sForm.deviceCode" />
          </el-form-item>
          <el-form-item label="设备名称">
            <el-input v-model="sForm.deviceName" />
          </el-form-item>
          <el-form-item label="测点编码">
            <el-input v-model="sForm.ioCode" />
          </el-form-item>
          <el-form-item label="测点名称">
            <el-input v-model="sForm.ioName" />
          </el-form-item>
          <el-form-item label="报警来源">
            <el-select
              v-model="sForm.source"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in sourceList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="动作执行">
            <el-select
              v-model="sForm.actionExecuted"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in executeList"
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
            @click="searchDoFn"
          >
            查询
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.warn-notice {
  position: relative;
  padding: 10px;
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
    .group-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
}
</style>
