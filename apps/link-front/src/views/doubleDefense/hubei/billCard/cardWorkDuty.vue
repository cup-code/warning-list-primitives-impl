<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
// import { getRiskAreaAll } from '@/http/defense/shandong/riskControl-api'
import { workDutyCardByPage, workDutyCardDel } from '@/http/defense/hubei/billCard-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import { getAllPostByCompanyFn } from '@/http/safe-production/post-manage-api'
import CardDutyInfo from './components/CardDutyInfo.vue'

export default {
  components: {
    CardDutyInfo,
    TreeSelect,
  },
  data() {
    return {
      isLoading: false,
      depList: [], // 责任组织下拉列表
      // areaList: [], // 风险区域下拉列表
      postList: [], // 岗位下拉列表
      searchData: {
        pageNum: 1,
        pageSize: 10,
      },
      tableData: [], // 表格数据
      total: 0, // 表格数据总数
      showDialog: false, // 弹窗开关
      dialogTitle: '岗位职责卡', // 弹窗标题
      propData: {}, // 弹窗传参
    }
  },
  computed: {
    /* 根据id翻译名字 */
    getNameById() {
      return function (id, arrList, nameKey, idKey = 'id') {
        let name = ''
        for (const item of arrList) {
          if (id == item[idKey]) {
            name = item[nameKey]
            break
          }
        }
        return name
      }
    },
  },
  created() {
    this.searchClick(true)
  },
  methods: {
    /* 点击搜索 */
    queryClick() {
      this.searchData.pageNum = 1
      this.searchClick()
    },
    /* 点击重置 */
    refreshClick() {
      this.searchData = {
        pageNum: 1,
        pageSize: 10,
      }
      this.searchClick()
    },
    /* 点击查询 */
    searchClick(isReqParams) {
      this.isLoading = true
      workDutyCardByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list
            this.total = res.data.result.total
          }
          else {
            this.$message.warning(res.data.message || '获取分页列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取分页列表出错', err)
        })
        .finally(() => {
          if (isReqParams === true) {
            this.getParams()
          }
          else {
            this.isLoading = false
          }
        })
    },
    /* 获取参数 */
    async getParams() {
      // 人员表
      const userData = JSON.parse(sessionStorage.getItem('user'))
      // 部门表
      const depRes = await getDepartListSimple()
      this.depList = depRes.data.result || []
      // 风险区域表
      // const areaRes = await getRiskAreaAll()
      // this.areaList = areaRes.data.result || []
      // 岗位表
      const postRes = await getAllPostByCompanyFn(userData.companyId)
      this.postList = postRes.data.result
      this.isLoading = false
    },
    /* 点击新增 */
    addClick() {
      this.dialogTitle = '新增岗位职责卡'
      this.propData = {
        editable: true,
        depList: this.depList,
        // areaList: this.areaList
      }
      this.showDialog = true
    },
    /* 点击查看/编辑 */
    editClick(info, editable) {
      if (editable) {
        this.dialogTitle = '编辑岗位职责卡'
      }
      else {
        this.dialogTitle = '查看岗位职责卡'
      }
      this.propData = {
        info,
        editable,
        depList: this.depList,
        // areaList: this.areaList
      }
      this.showDialog = true
    },
    /* 删除表格行 */
    delClick(item) {
      this.$confirm(`您确认要删除第${item.$index + 1}行数据?`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          workDutyCardDel(item.row.id)
            .then((res) => {
              if (res.data.success) {
                this.searchClick()
                this.$message.success('删除成功')
              }
              else {
                this.$message.warning(res.data.message || '删除失败')
              }
            })
            .finally(() => {
              this.isLoading = false
            })
        })
        .catch(() => {})
    },
    /* 弹窗关闭回调 */
    closeDialogEvt(isRefresh) {
      if (isRefresh) {
        this.searchClick()
      }
      this.showDialog = false
    },
  },
}
</script>

<template>
  <!-- 岗位职责卡 -->
  <KyTreeTable ref="treeTable" :isShowLeft="false">
    <!-- 搜索栏 -->
    <ECard slot="search" noneBottom>
      <el-form inline>
        <!-- 组织架构-部门树 --方艺明、谢嘉鹏 20220721 -->
        <el-form-item label="责任组织">
          <TreeSelect
            :props="{
              value: 'id', // ID字段名
              label: 'departmentName', // 显示名称
              children: 'children', // 子级字段名
            }"
            :list="depList"
            :value="searchData.responsibleDepartment"
            :clearable="true"
            :accordion="true"
            @getValue="
              (value) => {
                searchData.responsibleDepartment = value;
              }
            "
          />
        </el-form-item>
        <!-- 风险区域就是-安全装置 --方艺明、谢嘉鹏 20220721 -->
        <!-- <el-form-item label="风险区域">
        <el-select v-model="searchData.riskRegion" placeholder="全部" clearable filterable>
          <el-option v-for="item in areaList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item> -->
        <!-- 当前登陆人公司下的所有岗位 --方艺明 20220721 -->
        <el-form-item label="岗位">
          <el-select
            v-model="searchData.post"
            placeholder="全部"
            clearable
            filterable
          >
            <el-option
              v-for="item in postList"
              :key="item.id"
              :label="item.postName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            size="mini"
            icon="el-icon-refresh-right"
            :loading="isLoading"
            @click="refreshClick"
          >
            重置
          </el-button>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-search"
            :loading="isLoading"
            @click="queryClick"
          >
            查询
          </el-button>
          <el-button
            v-if="hasBtnPermission('card_work_duty_add')"
            type="primary"
            size="mini"
            icon="el-icon-plus"
            plain
            @click="addClick"
          >
            新增
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>
    <!-- 表格 -->
    <ECard slot="table">
      <el-table
        v-loading="isLoading"
        height="100%"
        :data="tableData"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        align="center"
        highlight-current-row
        :border="true"
        class="customer-table"
      >
        <el-table-column
          label="序号"
          type="index"
          align="center"
        />
        <el-table-column
          label="公司"
          prop="companyName"
          align="center"
        />
        <el-table-column
          label="责任组织"
          prop="departmentChain"
          align="center"
        />
        <!-- <el-table-column label="责任组织" align="center">
        <template slot-scope="scope">
          {{ getNameById(scope.row.responsibilityDepartment, depList, 'departmentName') }}
        </template>
      </el-table-column> -->
        <!-- <el-table-column label="风险区域" align="center">
        <template slot-scope="scope">
          {{ getNameById(scope.row.riskRegion, areaList, 'name') }}
        </template>
      </el-table-column> -->
        <el-table-column
          label="岗位"
          prop="postName"
          align="center"
        />
        <el-table-column
          label="岗位安全风险"
          prop="responsibilityScope"
          align="center"
        />
        <el-table-column
          label="岗位安全职责"
          prop="postSafetyResponsibility"
          align="center"
        />
        <el-table-column
          label="岗位安全操作要求"
          prop="postSafetyOperation"
          align="center"
        />
        <el-table-column
          label="岗位应急处理方法"
          prop="postEmergencyResponseMethods"
          align="center"
        />
        <el-table-column
          label="制卡人"
          prop="cardMakerName"
          align="center"
        />
        <el-table-column
          label="制卡时间"
          prop="cardMakingTime"
          align="center"
        />
        <el-table-column
          label="操作"
          width="150"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              v-if="hasBtnPermission('card_work_duty_view')"
              type="text"
              @click="editClick(scope.row, false)"
            >
              查看
            </el-button>
            <el-button
              v-if="hasBtnPermission('card_work_duty_modify')"
              type="text"
              @click="editClick(scope.row, true)"
            >
              编辑
            </el-button>
            <el-button
              v-if="hasBtnPermission('card_work_duty_delete')"
              type="text"
              style="color: var(--ky-danger)"
              @click="delClick(scope)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <!-- 分页器 -->
    <el-pagination
      slot="page"
      style="margin: 0 20px 0 0"
      :current-page.sync="searchData.pageNum"
      :page-size.sync="searchData.pageSize"
      :page-sizes="[10, 20, 30, 50]"
      layout="total, prev, pager, next, jumper, sizes"
      :total="total"
      @current-change="searchClick"
      @size-change="searchClick"
    />
    <!-- 弹窗 -->
    <div slot="dialog">
      <el-dialog
        class="fixed-dialog"
        width="1000px"
        :title="dialogTitle"
        :visible.sync="showDialog"
        :modal-append-to-body="false"
        :close-on-click-modal="false"
      >
        <CardDutyInfo
          v-if="showDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </KyTreeTable>
</template>
