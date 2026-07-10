<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import {
  blackListAdd,
  blackListQuery,
  blackListRemove,
  contractorAll,
} from '@/http/contractor-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
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

      editForm: {},
      editRules: {},
      title: '加入黑名单',
      dialog: false,
      editLoading: false,
      cbStaList: [
        { dictCode: 0, dictName: '合格承包商' },
        { dictCode: 1, dictName: '准承包商' },
        { dictCode: 2, dictName: '不合格承包商' },
      ],
      zsStaList: [
        { dictCode: 0, dictName: '失效' },
        { dictCode: 1, dictName: '有效' },
        { dictCode: 2, dictName: '即将失效' },
        { dictCode: 3, dictName: '到期未审' },
        { dictCode: 4, dictName: '即将复审' },
      ],
      departList: [],
      contList: [], // 承包商list
      hideLeft: false,
      treeWidth: '240px',
      conWidth: 'calc(100% - 240px)',
    }
  },
  async created() {
    this.getDataList()

    this.getAllContractor() // 查询所有承包商
    const departRes = await getDepartListSimple() // 获取当前用户所拥有的部门
    this.departList = departRes.data.result || []
  },
  methods: {
    async getDataList() {
      this.loading = true
      const { data } = await blackListQuery(this.form)
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
    // 查询所有承包商list
    async getAllContractor() {
      const { data } = await contractorAll()
      if ((data.code = 200)) {
        this.contList = data.result
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
    treeNodeTap(data) {
      if (data) {
        this.form.competentDepartmentId = data.id
      }
      else {
        delete this.form.competentDepartmentId
      }
      this.getDataList()
    },
    toggleMore() {
      this.form.showMore = !this.form.showMore
    },
    // 承包商下拉框变化
    contChange(v) {
      this.editForm = this.contList.find(item => item.id === v)
    },
    // 确定证书回显
    findZs(code) {
      if (!code && code !== 0)
        return
      return this.zsStaList.find(item => item.dictCode == code).dictName
    },
    addFn() {
      this.editForm = {}
      this.title = '加入黑名单'
      this.dialog = true
    },
    // 移除黑名单
    removeFn(v) {
      this.$confirm(`您确认要移出 ${v.contractorInfoName}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          blackListRemove(v.contractorInfoId)
            .then(({ data }) => {
              if (data.success === true) {
                this.$message.success(data.message || '移出成功')
                this.getDataList()
                this.getAllContractor()
              }
              else {
                this.$message.error(data.message || '移出失败!')
              }
            })
            .catch((err) => {
              this.$message.error('移出失败!')
            })
        })
        .catch(() => {})
    },
    // 保存
    saveFn() {
      this.$refs.editForm.validate((valid) => {
        if (!valid)
          return
        this.editLoading = true
        const params = {
          contractorInfoId: this.editForm.id,
          reason: this.editForm.reason,
        }

        blackListAdd(params).then(({ data }) => {
          this.editLoading = false
          if (data.code === 200) {
            this.$message.success(data.message || '保存成功')
            this.dialog = false
            this.getDataList()
            this.getAllContractor()
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
  },
}
</script>

<template>
  <div class="black-contractor">
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
        label-width="72px"
        class="searchForm"
      >
        <el-row>
          <el-col :span="6">
            <el-form-item label="承包商名称">
              <el-input
                v-model="form.contractorName"
                placeholder="承包商名称"
              />
            </el-form-item>
          </el-col>
          <el-col
            :span="6"
            style="padding-left: 10px"
          >
            <el-form-item label="承包商类型">
              <el-select
                v-model="form.contractorType"
                placeholder="承包商类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('contractor_type')"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="6"
            style="padding-left: 10px"
          >
            <el-form-item label="承包商状态">
              <el-select
                v-model="form.contractorStatus"
                placeholder="承包商状态"
                style="width: 100%"
              >
                <el-option
                  v-for="item in cbStaList"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="6"
          >
            <el-form-item label="证书状态">
              <el-select
                v-model="form.certificateStatus"
                placeholder="证书状态"
                style="width: 100%"
              >
                <el-option
                  v-for="item in zsStaList"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 按钮 -->
          <el-col
            :span="12"
            style="padding-left: 10px; margin-bottom: 12px"
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
            v-if="hasBtnPermission('contractor_black_add')"
            type="primary"
            icon="el-icon-plus"
            plain
            @click="addFn"
          >
            新增
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
            label="承包商名称"
            prop="contractorInfoName"
            align="center"
            width="90"
          />
          <!-- <el-table-column label="所属部门" prop="belongDepartmentName" align="center" /> -->
          <el-table-column
            label="主管部门"
            prop="competentDepartmentName"
            align="center"
          />
          <el-table-column
            label="地址"
            prop="contractorAddress"
            align="center"
          />
          <el-table-column
            label="负责人"
            prop="safetyDirector"
            align="center"
          />
          <el-table-column
            label="负责人联系电话"
            prop="safetyDirectorPhone"
            align="center"
            width="110"
          />
          <el-table-column
            label="承包商类型"
            prop="contractorType"
            align="center"
            width="90"
          >
            <template slot-scope="scope">
              <span>{{
                $dictUtils.getDictLabel('contractor_type', scope.row.contractorType)
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="承包商审核状态"
            prop="contractorStatus"
            align="center"
            width="110"
          >
            <template slot-scope="scope">
              <el-tag
                v-if="scope.row.contractorStatus == 0"
                size="mini"
                type="success"
              >
                合格承包商
              </el-tag>
              <el-tag
                v-if="scope.row.contractorStatus == 1"
                size="mini"
                type="warning"
              >
                准承包商
              </el-tag>
              <el-tag
                v-if="scope.row.contractorStatus == 2"
                size="mini"
                type="danger"
              >
                不合格承包商
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="证书状态"
            prop="certificateStatus"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag
                size="mini"
                :type="
                  scope.row.certificateStatus == 0
                    ? 'danger'
                    : scope.row.certificateStatus == 1
                      ? 'success'
                      : 'warning'
                "
              >
                {{ findZs(scope.row.certificateStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="红黄牌"
            prop="bookingsStatus"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag
                v-if="scope.row.bookingsStatus == 0"
                size="mini"
                type="danger"
              >
                红牌
              </el-tag>
              <el-tag
                v-if="scope.row.bookingsStatus == 1"
                size="mini"
                type="success"
              >
                绿牌
              </el-tag>
              <el-tag
                v-if="scope.row.bookingsStatus == 2"
                size="mini"
                type="warning"
              >
                黄牌
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="创建时间"
            prop="createdTime"
            align="center"
          />
          <el-table-column
            label="加入黑名单原因"
            prop="reason"
            align="center"
            width="110"
          />
          <el-table-column
            label="操作人"
            prop="createByName"
            align="center"
          />
          <el-table-column
            label="操作时间"
            prop="createTime"
            align="center"
          />
          <el-table-column
            align="center"
            fixed="right"
            label="操作"
            width="100"
          >
            <template slot-scope="scope">
              <el-button
                v-if="hasBtnPermission('contractor_black_delete')"
                type="text"
                style="color: var(--ky-danger)"
                @click="removeFn(scope.row)"
              >
                移出黑名单
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

    <!-- 新增、编辑 弹窗 -->
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
      >
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="承包商名称"
              prop="id"
            >
              <el-select
                v-model="editForm.id"
                placeholder="承包商名称"
                style="width: 100%"
                @change="contChange"
              >
                <el-option
                  v-for="item in contList"
                  :key="item.id"
                  :label="item.contractorName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地址">
              <el-input
                v-model="editForm.contractorAddress"
                placeholder="地址"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="承包商法人">
              <el-input
                v-model="editForm.contractorCorporation"
                placeholder="承包商法人"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="法人电话">
              <el-input
                v-model="editForm.contractorCorporationPhone"
                placeholder="法人电话"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安全负责人">
              <el-input
                v-model="editForm.safetyDirector"
                placeholder="安全负责人"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人电话">
              <el-input
                v-model="editForm.safetyDirectorPhone"
                placeholder="负责人电话"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="承包商类型">
              <el-select
                v-model="editForm.contractorType"
                placeholder="承包商类型"
                style="width: 100%"
                disabled
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('contractor_type')"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="统一社会信用代码">
              <el-input
                v-model="editForm.socialCode"
                placeholder="统一社会信用代码"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否三方机构">
              <el-radio-group
                v-model="editForm.thirdPartyFlag"
                disabled
              >
                <el-radio :label="1">
                  是
                </el-radio>
                <el-radio :label="0">
                  否
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主管部门">
              <SelectTree
                disabled
                :props="{
                  value: 'id', // ID字段名
                  label: 'departmentName', // 显示名称
                  children: 'children', // 子级字段名
                }"
                :list="departList"
                :value="editForm.competentDepartmentId"
                :clearable="true"
                :accordion="true"
                @getValue="
                  value => {
                    editForm.competentDepartmentId = value
                  }
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否常驻">
              <el-radio-group
                v-model="editForm.residentFlag"
                disabled
              >
                <el-radio :label="1">
                  是
                </el-radio>
                <el-radio :label="0">
                  否
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="红黄牌">
              <el-radio-group
                v-model="editForm.bookingsStatus"
                disabled
              >
                <el-radio :label="0">
                  红牌
                </el-radio>
                <el-radio :label="1">
                  绿牌
                </el-radio>
                <el-radio :label="2">
                  黄牌
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="业务范围">
              <el-input
                v-model="editForm.businessScope"
                type="textarea"
                :rows="6"
                placeholder="业务范围"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="加入黑名单原因"
              prop="reason"
              :rules="{
                required: true,
                message: '加入黑名单原因不能为空',
                trigger: 'blur',
              }"
            >
              <el-input
                v-model="editForm.reason"
                type="textarea"
                :rows="6"
                placeholder="加入黑名单原因"
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
.black-contractor {
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
      height: 100%;
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
  .el-dialog__body {
    padding-bottom: 24px;
    .el-divider {
      margin-bottom: 40px;
      .el-divider__text {
        padding: 0 6px;
        left: 50px;
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
