<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { getFireOrderList } from '@/http/fireControl-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'

export default {
  components: {
    SelectTree,
  },
  data() {
    return {
      form: {
        pageNum: 1,
        pageSize: 10,
      },
      loading: false,
      data: [],
      total: 0,
      departList: [],
      ynList: [
        { dictCode: true, dictName: '是' },
        { dictCode: false, dictName: '否' },
      ],
      dialog: false,
      editForm: {},
    }
  },
  async created() {
    this.getDataList()
    const departRes = await getDepartListSimple() // 获取当前用户所拥有的部门
    this.departList = departRes.data.result || []
  },
  methods: {
    async getDataList() {
      this.loading = true
      const { data } = await getFireOrderList(this.form)
      this.loading = false
      if (data.code == 200) {
        this.data = data.result.list || []
        this.total = data.result.total
      }
      else {
        this.$message.error(data.message || '查询失败')
        this.data = []
        this.total = 0
      }
    },
    pageSizeFn(v) {
      this.form.pageNum = 1
      this.form.pageSize = v
      this.getDataList()
    },
    pageCurFn(v) {
      this.form.pageNum = v
      this.getDataList()
    },
    // 重置
    resetFn() {
      this.form = {
        pageNum: 1,
        pageSize: 10,
      }
      this.getDataList()
    },
    // 查看回执列表
    seeFn(v) {
      this.$router.push({
        path: `/fireControlLocal/backSheet/${v.workOrderCode}`,
      })
    },
  },
}
</script>

<template>
  <div class="workSheet-fireControl">
    <div class="rightCon">
      <!-- 查询条件 -->
      <el-form
        :model="form"
        label-width="60px"
        class="searchForm"
      >
        <el-row>
          <el-col :span="7">
            <el-form-item
              label="工单编号"
              prop="workOrderCode"
            >
              <el-input
                v-model="form.workOrderCode"
                placeholder="工单编号"
              />
            </el-form-item>
          </el-col>
          <el-col
            :span="7"
            style="padding-left: 10px"
          >
            <el-form-item
              label="归属部门"
              prop="department"
            >
              <SelectTree
                :props="{
                  value: 'id', // ID字段名
                  label: 'departmentName', // 显示名称
                  children: 'children', // 子级字段名
                }"
                :list="departList"
                :value="form.department"
                :clearable="true"
                :accordion="true"
                @getValue="
                  value => {
                    form.department = value
                  }
                "
              />
            </el-form-item>
          </el-col>

          <!-- 按钮 -->
          <el-col
            :span="10"
            style="padding-left: 10px"
          >
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="getDataList"
            >
              查询
            </el-button>
            <el-button
              icon="el-icon-refresh-right"
              @click="resetFn"
            >
              重置
            </el-button>
          </el-col>
        </el-row>
      </el-form>

      <div class="main-box">
        <!-- 表格 -->
        <el-table
          v-loading="loading"
          :data="data"
          style="width: 100%"
          size="mini"
          :header-cell-style="{ background: '#f5f5f5' }"
          height="100%"
          :border="true"
          class="customer-table"
        >
          <el-table-column
            label="工单编号"
            prop="workOrderCode"
            align="center"
          />
          <el-table-column
            label="创建日期"
            prop="createdTime"
            align="center"
          />
          <el-table-column
            label="报警时间"
            prop="alarmTime"
            align="center"
          />
          <el-table-column
            label="报警编码"
            prop="alarmCode"
            align="center"
          />
          <el-table-column
            label="报警设备类型"
            prop="alarmType"
            align="center"
          />
          <el-table-column
            label="报警位置"
            prop="alarmPosition"
            align="center"
          />
          <el-table-column
            label="消防控制室是否报警"
            prop="alarmTag"
            align="center"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.alarmTag ? '是' : '否' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="工单状态"
            prop="orderStatus"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag
                v-if="scope.row.orderStatus"
                size="mini"
                type="success"
              >
                已回执
              </el-tag>
              <el-tag
                v-else
                size="mini"
                type="danger"
              >
                未回执
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="值班人"
            prop="caretakerUserName"
            align="center"
          />
          <el-table-column
            label="归属部门"
            prop="departmentName"
            align="center"
          />
          <el-table-column
            align="center"
            fixed="right"
            label="回执列表"
            width="80"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="seeFn(scope.row)"
              >
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
          :current-page.sync="form.pageNum"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="form.pageSize"
          layout="total, prev, pager, next, jumper, sizes"
          :total="total"
          @size-change="pageSizeFn"
          @current-change="pageCurFn"
        />
      </div>
    </div>

    <el-dialog
      class="normal-dialog edit-dialog"
      title="工单详情"
      :visible.sync="dialog"
      width="70%"
    >
      <el-form
        ref="editForm"
        :model="editForm"
        label-width="85px"
        size="mini"
        :disabled="true"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="工单单号"
              prop="workOrderCode"
            >
              <el-input
                v-model="editForm.workOrderCode"
                placeholder="工单单号"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="创建日期"
              prop="a"
            >
              <el-date-picker
                v-model="editForm.a"
                style="width: 100%"
                type="datetime"
                placeholder="创建日期"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="报警位置"
              prop="alarmPosition"
            >
              <el-input
                v-model="editForm.alarmPosition"
                placeholder="报警位置"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="报警时间"
              prop="alarmTime"
            >
              <el-date-picker
                v-model="editForm.alarmTime"
                style="width: 100%"
                type="datetime"
                placeholder="报警时间"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="报警编码"
              prop="alarmCode"
            >
              <el-input
                v-model="editForm.alarmCode"
                placeholder="报警编码"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="值班人"
              prop="caretakerUserName"
            >
              <el-input
                v-model="editForm.caretakerUserName"
                placeholder="值班人"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="消防控制室是否报警"
              prop="alarmTag"
            >
              <el-select
                v-model="editForm.alarmTag"
                placeholder="消防控制室是否报警"
                style="width: 100%"
              >
                <el-option
                  v-for="item in ynList"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="报警信息"
              prop="c"
            >
              <el-input
                v-model="editForm.c"
                placeholder="报警信息"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialog = false">
          关闭
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.workSheet-fireControl {
  height: calc(100vh - 50px);
  padding: 10px;
  background: #f3f7f9;
  display: flex;
  .leftCon {
    width: 200px;
    height: 100%;
    .leftTree .el-card {
      display: flex;
      flex-direction: column;
    }
  }
  .rightCon {
    flex: 1;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    .searchForm {
      margin-bottom: 10px;
      padding: 18px 8px 0 10px;
      background: #fff;
    }
    .main-box {
      background: #fff;
      flex: 1;
      overflow: hidden;
      padding: 10px;
      display: flex;
      flex-direction: column;

      .el-table {
        flex: 1;
        margin: 10px 0;
        .el-button + .el-button {
          margin-left: 5px;
        }
      }
      .el-pagination {
        text-align: right;
        padding: 0;
        .el-pagination__sizes {
          margin-right: 0;
          .el-input {
            margin-right: 0;
          }
        }
      }
    }
  }
}

.normal-dialog.edit-dialog {
  .el-dialog__header {
    min-height: 46px;
    .el-dialog__title {
      font-size: 16px;
      &::before {
        height: 20px;
      }
    }
  }
  .el-dialog__footer {
    padding: 8px 20px;
    border-top: 1px solid #e8e8e8;
    .dialog-footer {
      height: 30px;
    }
  }
}
</style>
