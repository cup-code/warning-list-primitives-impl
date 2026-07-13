<script>
import { clearAlert, getAlertRecordList } from '@/http/notice/notice-api'
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

    form_relieve: {}, // 解除报警 表单
    rules_relieve: {
      clearReason: [{ required: true, message: '不能为空', trigger: 'blur' }],
    },
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
            this.tableData = (resD.result.list || []).map((item) => {
              item.rlLoading = false // 解除报警loading状态
              return item
            })
            this.total = resD.result.total
          }
          else {
            this.$message.error(msg || '查询报警失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('查询报警失败')
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

    // 解除报警
    relieveFn() {
      // 清空
      this.$set(this.form_relieve, 'clearReason', '')
    },
    // 解除报警 确定按钮
    relieveDoneFn(v) {
      this.$refs[`relieveForm_${v.id}`].validate((valid) => {
        if (!valid)
          return

        v.rlLoading = true

        // 调用接口
        const params = { id: v.id }
        params.clearReason = this.form_relieve.clearReason || '' // 解除原因

        clearAlert(params)
          .then((res) => {
            v.rlLoading = false
            const resD = res.data
            const msg = resD.message
            if (resD.success) {
              v.visible_relieve = false
              this.$message.success(msg || '解除报警成功')
              this.getDataList()
            }
            else {
              this.$message.error(msg || '解除报警失败')
            }
          })
          .catch((err) => {
            v.rlLoading = false
            this.$message.error('解除报警失败')
          })
      })
    },
  },
}
</script>

<template>
  <TreeTable :isShowLeft="false">
    <!-- <ECard>
      <div class="cdns">
        <transition-group name="toUp">
          <el-tag v-for="item in options" :key="item.name" type="danger" size="small" closable @close="removeFn(item)">{{ item.name }}</el-tag>
        </transition-group>
      </div>
      <el-button size="mini" type="primary" @click="searchFn">查询</el-button>
    </ECard> -->

    <!-- 按钮 -->
    <!-- <el-row class="header">
      <el-col :span="24" class="cdns-con"> </el-col>
    </el-row> -->
    <ECard slot="table">
      <div class="card-cell flex">
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
        <el-button
          icon="el-icon-search"
          size="mini"
          type="primary"
          @click="searchFn"
        >
          查询
        </el-button>
      </div>
      <el-table
        v-loading="loading"
        class="group-table"
        :data="tableData"
        size="mini"
        style="width: 100%"
        height="70vh"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
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
          width="140"
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
        <el-table-column
          label="报警值"
          prop="eventValue"
          align="center"
        />
        <el-table-column
          label="解除原因"
          prop="clearReason"
          align="center"
        />
        <!-- <el-table-column label="操作" width="90" align='center'>
                        <template slot-scope="scope"> -->
        <!-- 解除报警 -->
        <!-- <el-popover width="260" v-model="scope.row.visible_relieve">
                                <el-form :ref="'relieveForm_' + scope.row.id" :model="form_relieve" :rules="rules_relieve" label-width="70px" size="mini">
                                    <el-form-item label="解除原因" prop="clearReason">
                                        <el-input v-model="form_relieve.clearReason"></el-input>
                                    </el-form-item>
                                </el-form>

                                <div style="text-align: right; margin: 0">
                                    <el-button size="mini" type="text" @click="scope.row.visible_relieve = false">取消</el-button>
                                    <el-button size="mini" type="primary" :loading="scope.row.rlLoading"  @click="relieveDoneFn(scope.row)">确定</el-button>
                                </div>
                                <el-button v-show="scope.row.canClearManually && !scope.row.isClear" slot="reference" size="mini" type="danger" @click="relieveFn">解除报警</el-button>
                            </el-popover>

                            <el-button v-show="!scope.row.canClearManually" size="mini" type="danger" disabled>工单处理中</el-button>

                        </template>
                    </el-table-column> -->
      </el-table>
    </ECard>
    <!-- 内容 -->
    <!-- <el-row class="mid-con">
      <el-col :span="24"> </el-col>
    </el-row> -->

    <!-- 页码 -->
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        v-if="pageFlag"
        style="text-align: right; background: #ffffff"
        :current-page="sForm.page"
        :page-size="sForm.pageSize"
        background
        layout="total, prev, pager, next, jumper"
        :total="total"
        @current-change="pageCurFn"
      />
    </ECard>
    <!-- <el-row> </el-row> -->

    <template slot="dialog">
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
    </template>
  </TreeTable>
</template>

<style lang="scss" scoped>
.warn-notice {
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
    .group-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
}
</style>
