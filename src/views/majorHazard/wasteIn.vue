<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { getCompanyPeopleById } from '@/http/GeneralQuery'
import {
  delMajorRubbishPut,
  examMajorRubbishPut,
  getMajorRubbishAll,
  getMajorRubbishPut,
  pushMajorRubbishPut,
  saveMajorRubbishPut,
} from '@/http/major-hazard/dangerSourceAnqi-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import { getUsersByDepartIdFn } from '@/http/safe-production/user-manage-api'
import AllDepartmentTree from '@/views/common-ui/AllDepartmentTree.vue'

export default {
  components: {
    AllDepartmentTree,
    SelectTree,
  },
  data() {
    return {
      form: {
        pageNum: 1,
        pageSize: 10,
        showMore: false,
      },
      loading: false,
      data: [],
      total: 0,
      rubList: [], // 废物列表
      // 材质列表
      materList: [
        { dictCode: '圆桶', dictName: '圆桶' },
        { dictCode: '吨桶', dictName: '吨桶' },
        { dictCode: '塑料袋', dictName: '塑料袋' },
        { dictCode: '其他', dictName: '其他' },
      ],
      departList: [],
      // 申请人列表
      userList: [],
      // 通知方式
      wayList: [{ dictCode: 1, dictName: '微信' }],
      // 通知人列表
      notList: [],

      dialog: false,
      title: '新增危废入库申请',
      editForm: {},
      editRules: {},
      editLoading: false,
      editable: true,

      isAudit: false,
      auditForm: {},
      auditRules: {
        examineStatus: [{ required: true, message: '请选择审核状态', trigger: 'change' }],
      },

      dialog_in: false,
      inForm: {},
      inRules: {},
      user: JSON.parse(sessionStorage.getItem('user')),
      hideLeft: false,
      treeWidth: '240px',
      conWidth: 'calc(100% - 240px)',
    }
  },
  async created() {
    this.getDataList()
    const departRes = await getDepartListSimple() // 获取当前用户所拥有的部门
    this.departList = departRes.data.result || []
  },
  methods: {
    async getDataList() {
      const { data } = await getMajorRubbishPut(this.form)
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
    // 重置
    resetFn() {
      this.form = {
        pageNum: 1,
        pageSize: 10,
        showMore: false,
      }
      this.getDataList()
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
    toggleMore() {
      this.form.showMore = !this.form.showMore
    },
    treeNodeTap(data) {
      if (data) {
        this.form.departmentId = data.id
      }
      else {
        delete this.form.departmentId
      }
      this.getDataList()
    },
    rubFn(v) {
      const tar = this.rubList.find(item => item.id === v)
      if (tar) {
        this.editForm.rubbishCode = tar.rubbishCode
        this.editForm.rubbishName = tar.rubbishName
      }
    },
    departFn(v) {
      this.editForm.departmentId = v
      const tar = this.departList.find(item => item.id === v)
      if (tar) {
        this.editForm.departmentName = tar.departmentName
      }

      getCompanyPeopleById(v).then(({ data }) => {
        if (data.code === 200) {
          this.userList = data.result
        }
      })
    },
    userFn(v) {
      const tar = this.userList.find(item => item.id === v)
      if (tar) {
        this.editForm.applyPersonName = tar.fullName
      }
    },
    // 入库
    inFn() {
      this.inForm = {}
      this.dialog_in = true
      if (this.notList.length === 0) {
        const depId = JSON.parse(sessionStorage.getItem('user')).departmentId
        getUsersByDepartIdFn(depId).then(({ data }) => {
          this.notList = data.result || []
        })
      }
    },
    inDone() {
      this.$refs.inForm.validate((valid) => {
        if (!valid)
          return
        this.editLoading = true
        let {
          msgType,
          msgContent,
          ids,
        } = this.inForm
        ids = ids.join(',')
        const params = {
          msgType,
          msgContent,
          ids,
          companyId: this.user.companyId,
        }

        pushMajorRubbishPut(params).then(({ data }) => {
          this.editLoading = false
          if (data.code === 200) {
            this.$message.success(data.message || '保存成功')
            this.dialog_in = false
          }
          else {
            this.$message.error(data.message || '保存失败')
          }
        })
      })
    },
    // 新增
    addFn() {
      this.isAudit = false
      this.editable = true
      this.editForm = {}
      this.title = '新增危废入库申请'
      this.dialog = true
    },
    // 查看
    seeFn(v) {
      this.isAudit = false
      this.editable = false
      this.title = '查看危废入库申请'
      this.dialog = true
      this.editForm = JSON.parse(JSON.stringify(v))
    },
    // 编辑
    editFn(v) {
      this.isAudit = false
      this.editable = true
      this.title = '编辑危废入库申请'
      this.dialog = true
      this.editForm = JSON.parse(JSON.stringify(v))
      getCompanyPeopleById(v.departmentId).then(({ data }) => {
        if (data.code === 200) {
          this.userList = data.result
        }
      })
    },
    // 删除
    delFn(v) {
      this.$confirm(`您确认要删除么?`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          delMajorRubbishPut(v.id)
            .then(({ data }) => {
              if (data.success === true) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(data.message || '删除失败!')
              }
            })
            .catch((err) => {
              this.$message.error('删除失败!')
            })
        })
        .catch(() => {})
    },
    // 审核
    auditFn(v) {
      this.isAudit = true
      this.title = '审核危废入库申请'
      this.editForm = JSON.parse(JSON.stringify(v))
      this.editable = false
      this.dialog = true
    },
    // 保存
    saveFn() {
      this.$refs.editForm.validate((valid) => {
        if (!valid)
          return
        this.editForm.year = +this.editForm.year
        this.editLoading = true
        saveMajorRubbishPut(this.editForm).then(({ data }) => {
          this.editLoading = false
          if (data.code === 200) {
            this.$message.success(data.message || '保存成功')
            this.dialog = false
            this.getDataList()
          }
          else {
            this.$message.error(data.message || '保存失败')
          }
        })
      })
    },
    // 审核
    auditDone() {
      this.$refs.auditForm.validate((valid) => {
        if (!valid)
          return
        this.editLoading = true
        this.auditForm.id = this.editForm.id
        this.auditForm.rubbishId = this.editForm.rubbishId
        this.auditForm.rubbishNumber = this.editForm.rubbishNumber
        examMajorRubbishPut(this.auditForm).then(({ data }) => {
          this.editLoading = false
          if (data.code === 200) {
            this.$message.success(data.message || '保存成功')
            this.dialog = false
            this.getDataList()
          }
          else {
            this.$message.error(data.message || '保存失败')
          }
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
    yearFn(v) {
      if (v) {
        getMajorRubbishAll(v).then(({ data }) => {
          this.rubList = data.result || []
        })
      }
      else {
        this.rubList = []
      }
    },
  },
}
</script>

<template>
  <div class="wasteIn-majorHazard">
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
      <!-- 查询条件 -->
      <el-form
        :model="form"
        label-width="60px"
        class="searchForm"
      >
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="年份"
              label-width="40px"
            >
              <el-date-picker
                v-model="form.year"
                style="width: 100%"
                type="year"
                placeholder="年份"
                format="yyyy"
                value-format="yyyy"
              />
            </el-form-item>
          </el-col>
          <el-col
            :span="8"
            style="padding-left: 10px"
          >
            <el-form-item label="废物名称">
              <el-input
                v-model="form.rubbishName"
                placeholder="废物名称"
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="8"
            style="padding-left: 10px"
          >
            <el-form-item label="废物来源">
              <el-input
                v-model="form.rubbishSource"
                placeholder="废物来源"
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="8"
          >
            <el-form-item
              label="申请人"
              label-width="50px"
            >
              <el-input
                v-model="form.applyPersonName"
                placeholder="申请人"
              />
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
        <!-- 功能区域 -->
        <div>
          <el-button
            type="primary"
            icon="el-icon-plus"
            plain
            @click="addFn"
          >
            新增
          </el-button>
          <el-button
            plain
            @click="inFn"
          >
            危废入库通知
          </el-button>
        </div>
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
            label="年份"
            prop="year"
            align="center"
          />
          <el-table-column
            label="废物来源"
            prop="rubbishSource"
            align="center"
          />
          <el-table-column
            label="废物名称"
            prop="rubbishName"
            align="center"
          />
          <el-table-column
            label="废物代码"
            prop="rubbishCode"
            align="center"
          />
          <el-table-column
            label="废物数量(吨)"
            prop="rubbishNumber"
            align="center"
            width="100"
          />
          <el-table-column
            label="容器材质及容量"
            prop="containerMaterial"
            align="center"
            width="110"
          />
          <el-table-column
            label="容器个数"
            prop="containerTotal"
            align="center"
          />
          <el-table-column
            label="废物贮放位置"
            prop="rubbishLocation"
            align="center"
            width="100"
          />
          <el-table-column
            label="申请部门"
            prop="departmentName"
            align="center"
          />
          <el-table-column
            label="申请人"
            prop="applyPersonName"
            align="center"
          />
          <el-table-column
            label="申请时间"
            prop="createdTime"
            align="center"
            width="100"
          />
          <el-table-column
            label="审核状态"
            prop="examineStatus"
            align="center"
          >
            <template slot-scope="scope">
              {{
                scope.row.examineStatus == 0
                  ? '待审核'
                  : scope.row.examineStatus == 1
                    ? '通过'
                    : scope.row.examineStatus == 2
                      ? '拒绝'
                      : ''
              }}
            </template>
          </el-table-column>
          <el-table-column
            label="备注"
            prop="remarks"
            align="center"
          />
          <el-table-column
            align="center"
            fixed="right"
            label="操作"
            width="120"
          >
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.examineStatus == 0"
                type="text"
                @click="auditFn(scope.row)"
              >
                审核
              </el-button>
              <el-button
                type="text"
                @click="seeFn(scope.row)"
              >
                查看
              </el-button>
              <el-button
                type="text"
                style="color: var(--ky-warning)"
                @click="editFn(scope.row)"
              >
                修改
              </el-button>
              <el-button
                type="text"
                style="color: var(--ky-danger)"
                @click="delFn(scope.row)"
              >
                删除
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

    <!-- 新增、编辑、审核 -->
    <el-dialog
      class="normal-dialog edit-dialog"
      :title="title"
      :visible.sync="dialog"
      width="70%"
    >
      <el-form
        ref="editForm"
        :model="editForm"
        :rules="editRules"
        label-width="110px"
        size="mini"
        :disabled="!editable"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item
              label="年份"
              prop="year"
              :rules="{
                required: true,
                message: '年份不能为空',
                trigger: 'blur',
              }"
            >
              <el-date-picker
                v-model="editForm.year"
                style="width: 100%"
                type="year"
                placeholder="年份"
                format="yyyy"
                value-format="yyyy"
                @change="yearFn"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="废物来源"
              prop="rubbishSource"
              :rules="{
                required: true,
                message: '废物来源不能为空',
                trigger: 'blur',
              }"
            >
              <el-input
                v-model="editForm.rubbishSource"
                placeholder="废物来源"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="废物名称"
              prop="rubbishId"
              :rules="{
                required: true,
                message: '废物名称不能为空',
                trigger: 'blur',
              }"
            >
              <el-select
                v-model="editForm.rubbishId"
                placeholder="废物名称"
                style="width: 100%"
                @change="rubFn"
              >
                <el-option
                  v-for="item in rubList"
                  :key="item.id"
                  :label="item.rubbishName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="废物代码"
              prop="rubbishCode"
            >
              <el-input
                v-model="editForm.rubbishCode"
                placeholder="废物代码"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="废物数量(吨)"
              prop="rubbishNumber"
              :rules="{
                required: true,
                message: '废物数量不能为空',
                trigger: 'blur',
              }"
            >
              <el-input
                v-model="editForm.rubbishNumber"
                placeholder="废物数量(吨)"
                type="number"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="容器材质及容量"
              prop="containerMaterial"
              :rules="{
                required: true,
                message: '容器材质及容量不能为空',
                trigger: 'blur',
              }"
            >
              <el-select
                v-model="editForm.containerMaterial"
                placeholder="容器材质及容量"
                style="width: 100%"
              >
                <el-option
                  v-for="item in materList"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="容器个数"
              prop="containerTotal"
              :rules="{
                required: true,
                message: '容器个数不能为空',
                trigger: 'blur',
              }"
            >
              <el-input
                v-model="editForm.containerTotal"
                placeholder="容器个数"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="废物贮放位置"
              prop="rubbishLocation"
              :rules="{
                required: true,
                message: '废物贮放位置不能为空',
                trigger: 'blur',
              }"
            >
              <el-input
                v-model="editForm.rubbishLocation"
                placeholder="废物贮放位置"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="申请部门"
              prop="departmentId"
              :rules="{
                required: true,
                message: '申请部门不能为空',
                trigger: 'blur',
              }"
            >
              <SelectTree
                :props="{
                  value: 'id', // ID字段名
                  label: 'departmentName', // 显示名称
                  children: 'children', // 子级字段名
                }"
                :list="departList"
                :value="editForm.departmentId"
                :clearable="true"
                :accordion="true"
                @getValue="value => departFn(value)"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="申请人"
              prop="applyPerson"
              :rules="{
                required: true,
                message: '申请人不能为空',
                trigger: 'blur',
              }"
            >
              <el-select
                v-model="editForm.applyPerson"
                placeholder="请选择"
                style="width: 100%"
                filterable
                @change="userFn"
              >
                <el-option
                  v-for="item in userList"
                  :key="item.id"
                  :label="item.fullName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 审核 -->
      <el-form
        v-if="isAudit"
        ref="auditForm"
        :model="auditForm"
        :rules="auditRules"
        label-width="60px"
        size="mini"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="审核"
              prop="examineStatus"
            >
              <el-radio-group v-model="auditForm.examineStatus">
                <el-radio :label="1">
                  通过
                </el-radio>
                <el-radio :label="2">
                  拒绝
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="备注"
              prop="remarks"
            >
              <el-input
                v-model="auditForm.remarks"
                type="textarea"
                :rows="6"
                placeholder="备注"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <template v-if="!isAudit">
          <el-button @click="dialog = false">
            {{ editable ? '取消' : '关闭' }}
          </el-button>
          <el-button
            v-show="editable"
            type="primary"
            :loading="editLoading"
            @click="saveFn"
          >
            保存
          </el-button>
        </template>
        <template v-else>
          <el-button @click="dialog = false">
            取消
          </el-button>
          <el-button
            type="primary"
            :loading="editLoading"
            @click="auditDone"
          >
            审核
          </el-button>
        </template>
      </div>
    </el-dialog>

    <!-- 入库通知 弹窗 -->
    <el-dialog
      class="normal-dialog edit-dialog"
      title="入库通知"
      :visible.sync="dialog_in"
      width="40%"
    >
      <el-form
        ref="inForm"
        :model="inForm"
        :rules="inRules"
        label-width="60px"
        size="mini"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item
              label="通知人"
              prop="ids"
            >
              <el-select
                v-model="inForm.ids"
                multiple
                placeholder="通知人"
                style="width: 100%"
              >
                <el-option
                  v-for="item in notList"
                  :key="item.id"
                  :label="item.fullName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="通知方式"
              prop="msgType"
            >
              <el-select
                v-model="inForm.msgType"
                placeholder="通知方式"
                style="width: 100%"
              >
                <el-option
                  v-for="item in wayList"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="通知内容"
              prop="msgContent"
            >
              <el-input
                v-model="inForm.msgContent"
                type="textarea"
                :rows="6"
                placeholder="通知内容"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialog_in = false">
          关闭
        </el-button>
        <el-button
          type="primary"
          :loading="editLoading"
          @click="inDone"
        >
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.wasteIn-majorHazard {
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
