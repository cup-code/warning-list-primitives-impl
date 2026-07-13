<script>
import { getMobileTerminalPage } from '@/http/safe-production/appmanage-api'
import AppManageInfo from './form/appManageInfo'
import AppManageTwo from './form/appManageTwo'

export default {
  components: {
    AppManageInfo,
    AppManageTwo,
  },
  data() {
    return {
      isLoading: true,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        fuzzyQuery: '',
        osType: '',
        uploadState: '',
      },
      tableData: [],
      total: 0,
      loading: false,
      showInfoAgain: false, // 再次上传弹窗
      dialogTitle: '', // 弹窗标题
      showInfoDialog: false, // 是否显示编辑弹窗
      systemType: [
        {
          label: 'Android',
        },
        {
          label: 'IOS',
        },
      ],
      uploadStatus: [
        {
          label: '上传成功',
          value: 1,
        },
        {
          label: '上传中',
          value: 0,
        },
        {
          label: '上传失败',
          value: -1,
        },
      ],
    }
  },

  created() {
    this.searchClick()
  },
  methods: {
    /* 点击搜索 */
    searchClick() {
      this.isLoading = true
      getMobileTerminalPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list
            this.total = res.data.result.total
          }
          else {
            this.$message.warning(res.data.message || '获取列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    // 查询
    inquire() {
      this.searchData.pageNum = 1
      this.searchClick()
    },
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data) {
        this.searchData.companyId = data.id
      }
      else {
        delete this.searchData.companyId
      }
      this.searchClick()
    },
    /* 点击新增 */
    addClick() {
      this.dialogTitle = '新增App版本'
      this.propData = {
        editable: true,

        staffName: this.staffName,
      }
      this.showInfoDialog = true
    },
    // 点击查看修改
    editClick(info, editable) {
      this.dialogTitle = '查看App版本'
      this.propData = {
        info: JSON.parse(JSON.stringify(info)),
        staffName: this.staffName,
        editable,
      }
      // 给修改设置属性，在查看中传参false，让查看不能修改
      this.showInfoDialog = true
    },
    // 再次上传
    againClick(infoId, editable) {
      this.dialogTitle = '重新上传'
      this.propData = {
        infoId,
        staffName: this.staffName,
        editable,
      }
      // 给修改设置属性，在查看中传参false，让查看不能修改
      this.showInfoAgain = true
    },
    /* 关闭弹窗事件 */
    closeDialogEvt(isRefresh) {
      this.showInfoDialog = false
      if (isRefresh) {
        this.searchClick()
      }
    },
    closeAgainEvt(isRefresh) {
      this.showInfoAgain = false
      if (isRefresh) {
        this.searchClick()
      }
    },
  },
}
</script>

<template>
  <TreeTable :isShowLeft="false">
    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <el-form inline>
        <el-form-item label="版本">
          <el-input
            v-model="searchData.fuzzyQuery"
            placeholder="请输入版本"
            clearable
          />
        </el-form-item>
        <el-form-item label="系统类型">
          <el-select
            v-model="searchData.osType"
            placeholder="请选择系统类型"
            clearable
          >
            <el-option
              v-for="item in systemType"
              :key="item.label"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="上传状态">
          <el-select
            v-model="searchData.uploadState"
            placeholder="请选择上传状态"
            clearable
          >
            <el-option
              v-for="item in uploadStatus"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="inquire"
          >
            查询
          </el-button>
          <el-button
            v-if="hasBtnPermission('manage_role_addRole')"
            type="primary"
            icon="el-icon-plus"
            @click="addClick"
          >
            新增版本
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>
    <ECard slot="table">
      <el-table
        v-loading="loading"
        :data="tableData"
        highlight-hover-row
        size="small"
        height="71vh"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        class="table"
      >
        <el-table-column
          type="index"
          label="序号"
          width="50"
        />
        <el-table-column
          align="center"
          prop="version"
          label="版本号"
        />
        <el-table-column
          align="center"
          prop="uploadState"
          label="状态"
        >
          <template slot-scope="scope">
            {{
              scope.row.uploadState === 1
                ? '上传完成'
                : scope.row.uploadState === 0
                  ? '上传中'
                  : scope.row.uploadState === -1
                    ? '上传失败'
                    : '~~'
            }}
          </template>
        </el-table-column>

        <el-table-column
          align="center"
          prop="updatedTime"
          label="更新时间"
        />
        <el-table-column
          align="center"
          prop="remarks"
          label="更新内容"
        />
        <el-table-column
          align="center"
          prop="osType"
          label="系统类别"
        />
        <el-table-column
          label="操作"
          align="center"
          width="150"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.uploadState !== 0"
              type="text"
              size="mini"
              @click="againClick(scope.row.id, true)"
            >
              重新上传
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <ECard
      slot="page"
      type="footer"
    >
      <!-- 分页器 -->
      <el-pagination
        class="pagination"
        :disabled="isLoading"
        style="margin: 0 20px 0 0"
        :current-page.sync="searchData.pageNum"
        :page-size.sync="searchData.pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, prev, pager, next, jumper, sizes"
        :total="total"
        @current-change="searchClick"
        @size-change="searchClick"
      />
    </ECard>
    <!-- 弹窗 -->
    <div slot="dialog">
      <el-dialog
        class="normal-dialog"
        :title="dialogTitle"
        :visible.sync="showInfoDialog"
        width="850px"
        append-to-body
        :close-on-click-modal="false"
        top="5vh"
      >
        <AppManageInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
    <!-- 再次上传 -->
    <div slot="dialog">
      <el-dialog
        class="normal-dialog"
        :title="dialogTitle"
        :visible.sync="showInfoAgain"
        width="850px"
        append-to-body
        :close-on-click-modal="false"
        top="5vh"
      >
        <AppManageTwo
          v-if="showInfoAgain"
          v-bind="propData"
          @close="closeAgainEvt"
        />
      </el-dialog>
    </div>
  </TreeTable>
</template>

<style lang="scss" scoped>
.page {
  padding: 10px;

  .pagination {
    float: right;
  }
}
</style>
