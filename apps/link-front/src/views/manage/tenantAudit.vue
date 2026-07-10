<script>
import { getTenantApplyList, processTenantApply } from '@/http/manage-api'
import { formatDate } from '@/utils'
import { $checkFloat } from '@/utils/validate'

export default {
  data() {
    return {
      loading: false,
      tableData: [],
      sForm: {},
      sFormCopy: null, // sForm的原始数据
      drawer: false,
      form: {},
      rules: {
        servePayment: [{ required: true, trigger: 'change', validator: $checkFloat }],
        auditReasons: [{ required: true, trigger: 'blur', message: '不能为空' }],
      },
      auditLoading: false,
      submitLoading: false,
      drawer_sh: false,
      options: [],
      sDate: '',
      stateList: [
        { name: '待处理', value: 'Unprocessed' },
        { name: '已创建', value: 'Created' },
        { name: '未通过', value: 'NotPass' },
      ],
    }
  },
  created() {
    this.getDataList()
  },
  methods: {
    formatDate,
    getDataList() {
      this.loading = true
      getTenantApplyList(this.sForm)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.tableData = resD.result
          }
          else {
            this.$message.error(msg || '查询租户申请列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('查询租户申请列表失败')
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
        if (key !== 'page' && key !== 'pageSize' && val) {
          temp.type = key
          temp.name = val

          let i, list, len, cur
          if (key === 'applyState') {
            // 申请状态
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

    // 审核按钮
    auditFn(v) {
      this.form = JSON.parse(JSON.stringify(v))
      // 回显所选时间
      if (v.serveStartTime) {
        this.sDate = [v.serveStartTime, v.serveEndTime]
      }
      this.drawer = true
    },
    // 选择 服务时间
    dateChange(v) {
      const form = this.form
      if (v) {
        form.serveStartTime = v[0]
        form.serveEndTime = v[1]
      }
      else {
        delete form.serveStartTime
        delete form.serveEndTime
      }
    },
    submitFn(flag) {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.auditLoading = true

        const {
          id: applyId,
          auditReasons,
          serveStartTime,
          serveEndTime,
          servePayment,
        } = this.form
        const params = {
          applyId,
          auditReasons,
          serveStartTime,
          serveEndTime,
          servePayment,
        }
        params.pass = flag

        processTenantApply(params)
          .then((res) => {
            const resD = res.data
            const msg = resD.message
            this.auditLoading = false
            if (resD.success === true) {
              this.$message.success('审核成功')
              this.getDataList()
              this.drawer = false
            }
            else {
              this.$message.error(msg || '审核失败')
            }
          })
          .catch((err) => {
            this.auditLoading = false
            this.$message.error('审核失败')
          })
      })
    },
  },
}
</script>

<template>
  <div class="tenantAudit-manage">
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
          type="primary"
          icon="el-icon-search"
          size="mini"
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
          class="tenant-table"
          :data="tableData"
          border
          size="mini"
          style="width: 100%"
          :header-cell-style="{ background: '#f5f5f5' }"
        >
          <el-table-column
            label="企业logo"
            prop="logo"
            align="center"
          >
            <template slot-scope="props">
              <div style="display: flex; align-items: center; justify-content: center">
                <img
                  v-if="props.row.logo"
                  :src="props.row.logo"
                  style="height: 30px"
                >
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="企业编码"
            prop="token"
            align="center"
          />
          <el-table-column
            label="公司名称"
            prop="name"
            align="center"
          />
          <el-table-column
            label="申请状态"
            prop="applyState"
            align="center"
          >
            <template slot-scope="props">
              <el-tag
                v-if="props.row.applyState === 'Created'"
                size="mini"
                type="success"
              >
                已创建
              </el-tag>
              <el-tag
                v-if="props.row.applyState === 'Unprocessed'"
                size="mini"
                type="warning"
              >
                待处理
              </el-tag>
              <el-tag
                v-if="props.row.applyState === 'NotPass'"
                size="mini"
                type="danger"
              >
                未通过
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="创建日期"
            prop="tm"
            align="center"
          >
            <template slot-scope="props">
              {{ formatDate(props.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="200"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                @click="auditFn(scope.row)"
              >
                审核
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <!-- 审核 抽屉 -->
    <el-drawer
      :visible.sync="drawer"
      :with-header="false"
      class="audit-drawer"
    >
      <div
        v-loading="auditLoading"
        style="display: flex; flex-direction: column; overflow: hidden"
      >
        <!-- 标题 -->
        <div class="drawer-title">
          企业审核
        </div>

        <!-- 分割线 -->
        <el-divider />

        <!-- 内容 -->
        <div class="drawer-con">
          <el-form
            ref="form"
            :model="form"
            label-width="95px"
            :rules="rules"
            size="mini"
          >
            <el-form-item
              label="企业编码"
              prop="token"
            >
              <el-input
                v-model="form.token"
                disabled
              />
            </el-form-item>
            <el-form-item
              label="公司名称"
              prop="name"
            >
              <el-input
                v-model="form.name"
                disabled
              />
            </el-form-item>
            <el-form-item
              label="公司代码"
              prop="socialCreditCode"
            >
              <el-input
                v-model="form.socialCreditCode"
                disabled
              />
            </el-form-item>
            <el-form-item
              label="管理员"
              prop="admin"
            >
              <el-input
                v-model="form.admin"
                disabled
              />
            </el-form-item>
            <el-form-item
              label="联系人姓名"
              prop="contactName"
            >
              <el-input
                v-model="form.contactName"
                disabled
              />
            </el-form-item>
            <el-form-item
              label="联系人电话"
              prop="contactPhone"
            >
              <el-input
                v-model="form.contactPhone"
                disabled
              />
            </el-form-item>
            <el-form-item
              label="支付金额"
              prop="servePayment"
            >
              <el-input v-model="form.servePayment" />
            </el-form-item>
            <el-form-item label="服务时间">
              <el-date-picker
                v-model="sDate"
                style="width: 100%"
                size="mini"
                value-format="timestamp"
                type="daterange"
                unlink-panels
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="dateChange"
              />
            </el-form-item>
            <el-form-item
              label="审核理由"
              prop="auditReasons"
            >
              <el-input
                v-model="form.auditReasons"
                type="textarea"
              />
            </el-form-item>
          </el-form>

          <div class="drawer-con-btns">
            <el-button
              size="mini"
              type="danger"
              :disabled="form.applyState !== 'Unprocessed'"
              @click="submitFn(false)"
            >
              不通过
            </el-button>
            <el-button
              size="mini"
              type="primary"
              :disabled="form.applyState !== 'Unprocessed'"
              @click="submitFn(true)"
            >
              通过
            </el-button>
          </div>
        </div>
      </div>
    </el-drawer>

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
            label="企业编码"
            prop="token"
          >
            <el-input v-model="sForm.token" />
          </el-form-item>
          <el-form-item
            label="申请状态"
            prop="applyState"
          >
            <el-select
              v-model="sForm.applyState"
              placeholder="请选择状态"
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
  </div>
</template>

<style lang="scss" scoped>
.tenantAudit-manage {
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
    .tenant-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
  .audit-drawer {
    .drawer-con-btns button {
      width: auto !important;
    }
  }
}
</style>
