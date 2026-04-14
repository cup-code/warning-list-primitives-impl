<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { alertRecordExamine, getAlertRecordList } from '@/http/notice/notice-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import { getUsersByRoleFn } from '@/http/safe-production/user-manage-api'
import AllDepartmentTree from '@/views/common-ui/AllDepartmentTree.vue'

export default {
  name: 'terminalRecord',
  components: {
    AllDepartmentTree,
    SelectTree,
  },
  data() {
    return {
      form: {
        page: 1,
        pageSize: 10,
        showMore: false,
      },
      loading: false,
      data: [],
      total: 0,
      dialog: false,
      editForm: {},
      editLoading: false,
      clearList: [
        { dictName: '未处理', dictCode: 0 },
        { dictName: '已处理', dictCode: 1 },
        { dictName: '处理中', dictCode: 2 },
      ],
      realList: [
        { dictName: '安全隐患', dictCode: true },
        { dictName: '误报', dictCode: false },
      ],
      departList: [], // 整改部门列表
      userList: [], // 整改责任人列表
      hideLeft: false,
      treeWidth: '240px',
      conWidth: 'calc(100% - 240px)',
    }
  },
  created() {
    this.getDataList()
    // 获取整改部门list
    getDepartListSimple().then(({ data }) => {
      this.departList = (data.result || []).filter((item) => {
        return item.departmentType === 'DEPARTMENT'
      })
    })
    getUsersByRoleFn().then(({ data }) => {
      // 节点类型:0-公司;1-部门;2-岗位;3-用户
      this.userList = data.result.filter((item) => {
        return item.type === '3'
      })
    })
  },
  methods: {
    async getDataList() {
      this.loading = true
      const { data } = await getAlertRecordList(this.form)
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
    toggleMore() {
      this.form.showMore = !this.form.showMore
    },
    // 重置
    resetFn() {
      this.form = {
        page: 1,
        pageSize: 10,
        showMore: false,
      }
      this.$refs.companyTree.refreshTree()
    },
    pageSizeFn(v) {
      this.form.page = 1
      this.form.pageSize = v
      this.getDataList()
    },
    pageCurFn(v) {
      this.form.page = v
      this.getDataList()
    },
    treeNodeTap(data) {
      if (data && data.onlyTreeUse)
        return
      if (data) {
        this.form.departmentId = data.id
      }
      else {
        delete this.form.departmentId
      }
      this.getDataList()
    },
    genMonCate(v) {
      if (!v)
        return
      return this.$dictUtils.getDictList('monitor_type').find(item => item.dictCode == v).dictName
    },
    // 审核
    auditFn(v) {
      this.editForm = JSON.parse(JSON.stringify(v))
      this.dialog = true
    },
    saveFn() {
      this.$refs.editForm.validate((valid) => {
        if (!valid)
          return
        this.editLoading = true
        alertRecordExamine(this.editForm)
          .then(({ data }) => {
            this.editLoading = false
            if (data.code === 200) {
              this.dialog = false
              this.getDataList()
            }
            else {
              this.$message.error(data.message || '审核失败')
            }
          })
          .catch((err) => {
            this.$message.error('审核失败！')
          })
      })
    },
    // 切换左侧菜单的收起与展现
    toggleLeftFn() {
      this.hideLeft = !this.hideLeft
      if (this.hideLeft) {
        this.treeWidth = '0%'
        this.conWidth = '100%'
      }
      else {
        this.treeWidth = '240px'
        this.conWidth = 'calc(100% - 240px)'
      }
    },
  },
}
</script>

<template>
  <div class="terminalRecord-majorHazard">
    <div
      class="leftCon"
      :style="`width: ${treeWidth}`"
    >
      <AllDepartmentTree
        slot="tree"
        ref="companyTree"
        :hasResponsible="false"
        @treeNodeTap="treeNodeTap"
      />
      <div
        class="toggle-btn"
        @click="toggleLeftFn"
      >
        {{ hideLeft ? '展开' : '隐藏' }}
      </div>
    </div>
    <div
      class="rightCon"
      :style="`width: ${conWidth}`"
    >
      <el-form
        :model="form"
        label-width="60px"
        class="searchForm"
      >
        <el-row>
          <el-col :span="8">
            <el-form-item label="规则名称">
              <el-input
                v-model="form.ruleName"
                placeholder="规则名称"
              />
            </el-form-item>
          </el-col>
          <el-col
            :span="8"
            style="padding-left: 10px"
          >
            <el-form-item label="监测分类">
              <el-select
                v-model="form.monitorCategory"
                placeholder="监测分类"
                style="width: 100%"
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('monitor_type')"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="8"
            style="padding-left: 10px"
          >
            <el-form-item
              label="状态"
              label-width="40px"
            >
              <el-select
                v-model="form.isClear"
                placeholder="状态"
                style="width: 100%"
              >
                <el-option
                  v-for="item in clearList"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="8"
          >
            <el-form-item label="审核结果">
              <el-select
                v-model="form.realAlarm"
                placeholder="审核结果"
                style="width: 100%"
              >
                <el-option
                  v-for="item in realList"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 按钮 -->
          <el-col
            :span="8"
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
            <el-button
              type="text"
              style="margin-left: 8px"
              @click="toggleMore"
            >
              {{ form.showMore == true ? '收起' : '高级筛选' }}
              <i :class="form.showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
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
            label="序号"
            type="index"
            align="center"
          />
          <el-table-column
            label="所属部门"
            prop="departmentName"
            align="center"
          />
          <el-table-column
            label="报警规则名称"
            prop="ruleName"
            align="center"
            width="100"
          />
          <el-table-column
            label="监测分类"
            prop="monitorCategory"
            align="center"
          >
            <template slot-scope="scope">
              <span>{{ genMonCate(scope.row.monitorCategory) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="测点"
            prop="ioName"
            align="center"
          />
          <el-table-column
            label="阈值"
            prop="thresholdValue"
            align="center"
          />
          <el-table-column
            label="报警值"
            prop="eventValue"
            align="center"
          />
          <el-table-column
            label="报警时间"
            prop="eventDate"
            align="center"
          />
          <el-table-column
            label="状态"
            prop="isClear"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag
                v-if="scope.row.isClear == 0"
                size="mini"
                type="warning"
              >
                未处理
              </el-tag>
              <el-tag
                v-if="scope.row.isClear == 1"
                size="mini"
                type="success"
              >
                已处理
              </el-tag>
              <el-tag
                v-if="scope.row.isClear == 2"
                size="mini"
              >
                处理中
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="审核结果"
            prop="realAlarm"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag
                v-if="scope.row.realAlarm === true"
                size="mini"
                type="error"
              >
                安全隐患
              </el-tag>
              <el-tag
                v-else-if="scope.row.realAlarm === false"
                size="mini"
              >
                误报
              </el-tag>
              <el-tag
                v-else
                size="mini"
              >
                --
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            fixed="right"
            label="操作"
            width="100"
          >
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.isClear == 0"
                type="text"
                @click="auditFn(scope.row)"
              >
                审核
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
          :current-page.sync="form.page"
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
      title="审核报警记录"
      :visible.sync="dialog"
      width="70%"
    >
      <el-form
        ref="editForm"
        :model="editForm"
        label-width="100px"
        size="mini"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="报警规则名称">
              <el-input
                :value="editForm.ruleName"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="监测分类">
              <el-input
                :value="genMonCate(editForm.monitorCategory)"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="测点">
              <el-input
                :value="editForm.ioName"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="阈值">
              <el-input
                :value="editForm.thresholdValue"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报警值">
              <el-input
                :value="editForm.eventValue"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报警时间">
              <el-input
                :value="editForm.eventDate"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属公司">
              <el-input
                :value="editForm.companyName"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属部门">
              <el-input
                :value="editForm.departmentName"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="问题位置"
              prop="location"
              :rules="{
                required: true,
                message: '问题位置不能为空',
                trigger: 'blur',
              }"
            >
              <el-input v-model="editForm.location" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="审核结果"
              prop="realAlarm"
              :rules="{
                required: true,
                message: '请选择审核结果',
                trigger: 'change',
              }"
            >
              <el-radio-group v-model="editForm.realAlarm">
                <el-radio-button :label="true">
                  安全隐患
                </el-radio-button>
                <el-radio-button :label="false">
                  误报
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <template v-if="editForm.realAlarm">
            <el-col :span="12">
              <el-form-item
                label="隐患等级"
                prop="hiddenDangerLevel"
                :rules="{
                  required: true,
                  message: '请选择隐患等级',
                  trigger: 'change',
                }"
              >
                <el-radio-group v-model="editForm.hiddenDangerLevel">
                  <el-radio-button
                    v-for="item in $dictUtils.getDictList('hiddenDangerLevel')"
                    :key="item.dictCode"
                    :label="item.dictCode"
                  >
                    {{ item.dictName }}
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item
                label="问题描述"
                prop="description"
              >
                <el-input
                  v-model="editForm.description"
                  type="textarea"
                  :rows="6"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="整改部门"
                prop="rectificationDepartmentId"
                :rules="{
                  required: true,
                  message: '请选择整改部门',
                  trigger: 'change',
                }"
              >
                <!-- <SelectTree
                                    :props="{
                                        value: 'id',             // ID字段名
                                        label: 'departmentName',         // 显示名称
                                        children: 'children'    // 子级字段名
                                    }"
                                    :list="departList"
                                    :value="editForm.rectificationDepartmentId"
                                    :clearable="true"
                                    :accordion="true"
                                    @getValue="value => {editForm.rectificationDepartmentId = value}"
                                />  -->

                <el-select
                  v-model="editForm.rectificationDepartmentId"
                  placeholder="请选择"
                  filterable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in departList"
                    :key="item.id"
                    :label="item.departmentName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="整改责任人"
                prop="rectificationUserId"
                :rules="{
                  required: true,
                  message: '请选择整改责任人',
                  trigger: 'change',
                }"
              >
                <el-select
                  v-model="editForm.rectificationUserId"
                  placeholder="请选择"
                  style="width: 100%"
                  filterable
                >
                  <el-option
                    v-for="item in userList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="整改期限"
                prop="rectificationEndDate"
                :rules="{
                  required: true,
                  message: '请选择整改期限',
                  trigger: 'change',
                }"
              >
                <el-date-picker
                  v-model="editForm.rectificationEndDate"
                  type="date"
                  placeholder="整改期限"
                  style="width: 100%"
                  value-format="yyyy-MM-dd"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item
                label="整改意见"
                prop="rectificationOpinions"
              >
                <el-input
                  v-model="editForm.rectificationOpinions"
                  placeholder="整改意见"
                  type="textarea"
                  :rows="6"
                />
              </el-form-item>
            </el-col>
          </template>
        </el-row>
      </el-form>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialog = false">
          关闭
        </el-button>
        <el-button
          type="primary"
          :loading="editLoading"
          @click="saveFn"
        >
          保存
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.terminalRecord-majorHazard {
  height: calc(100vh - 50px);
  background: #f3f7f9;
  display: flex;
  position: relative;
  .leftCon {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    padding: 10px;
    padding-right: 0px;
    .leftTree {
      height: 100% !important;
    }
    .leftTree .el-card {
      display: flex;
      flex-direction: column;
    }
    .toggle-btn {
      z-index: 1;
      position: absolute;
      top: 50%;
      left: 100%;
      cursor: pointer;
      user-select: none;
      background: rgba($color: #000000, $alpha: 0.1);
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      padding: 5px;
    }
  }
  .rightCon {
    position: absolute;
    top: 0;
    right: 0;
    flex: 1;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 10px;
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
    border-bottom: 1px solid #e8e8e8;
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
