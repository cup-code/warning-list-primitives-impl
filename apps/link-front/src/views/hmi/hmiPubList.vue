<script>
import Qrcode from '@chenfengyuan/vue-qrcode'
import { getHmi, getHmiShareUrl } from '@/http/hmi/manage-api'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'

export default {
  components: {
    Qrcode,
    OwnDeparmentTree,
  },
  data: () => ({
    loading: false,
    tableData: [],
    pageFlag: true,
    sForm: {
      page: 1,
      pageSize: 10,
      status: '0',
      departmentId: '',
    },
    total: 0,
    drawer_share: false,
    shareUrl: '',
  }),
  created() {
    this.getPrefix()
  },
  mounted() {
    this.getDataList()
  },
  methods: {
    getDataList() {
      this.loading = true
      getHmi(this.sForm)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            if (resD.result.list.length) {
              resD.result.list.forEach((item) => {
                if (item.thumbnailUrl) {
                  item.showThumbnailUrl = this.filePrefix + item.thumbnailUrl
                }
              })
            }
            this.tableData = resD.result.list || []
            this.total = resD.result.total
          }
          else {
            this.$message.error(msg || '查询组态失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('查询组态失败')
        })
    },
    pageCurFn(v) {
      this.sForm.page = v
      this.getDataList()
    },
    // 点击部门树的item
    treeNodeTap(v) {
      // 记录 部门名字 和 id
      if (v.onlyTreeUse)
        return
      this.sForm.pageNum = 1
      this.sForm.departmentId = v.id
      this.getDataList()
    },
    // 运行
    previewFn(v) {
      window.open(v.hmiIndex)
    },
    // 分享
    shareFn(v) {
      this.drawer_share = true
      this.shareUrl = ''
      getHmiShareUrl(v.id)
        .then((res) => {
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.shareUrl = resD.result || ''
          }
          else {
            this.$message.error(msg || '获取分享链接失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取分享链接失败')
        })
    },
  },
}
</script>

<template>
  <TreeTable :isShowSearch="false">
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 内容 -->
    <ECard slot="table">
      <el-table
        v-loading="loading"
        :data="tableData"
        size="small"
        style="width: 100%; height: 100%; overflow: auto"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column
          label="图片"
          prop="thumbnailUrl"
          align="center"
        >
          <template slot-scope="props">
            <div style="display: flex; align-items: center; justify-content: center">
              <img
                v-if="props.row.thumbnailUrl"
                :src="props.row.showThumbnailUrl"
                style="height: 30px"
              >
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="名称"
          prop="name"
          align="center"
        />
        <el-table-column
          label="所属分组"
          prop="groupName"
          align="center"
        />
        <el-table-column
          label="创建时间"
          width="150"
          prop="createdTime"
          align="center"
        />
        <el-table-column
          label="描述"
          min-width="120"
          prop="remarks"
          align="center"
        />
        <el-table-column
          label="操作"
          fixed="right"
          width="200"
          align="right"
        >
          <template slot-scope="scope">
            <!-- <el-button size="mini" type="warning" @click="previewFn(scope.row)">查看</el-button> -->
            <EButton
              icon="check"
              size="mini"
              type="text"
            >
              <router-link
                tag="a"
                target="_blank"
                :to="{
                  name: 'editor',
                  query: { id: scope.row.encryptHmiId || scope.row.code },
                }"
              >
                查看
              </router-link>
            </EButton>
            <EButton
              icon="share"
              size="mini"
              type="text"
              @click="shareFn(scope.row)"
            >
              分享
            </EButton>
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <!-- 页码 -->
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        background
        style="text-align: right"
        :current-page="sForm.page"
        :page-size="sForm.pageSize"
        layout="total, prev, pager, next, jumper"
        :total="total"
        @current-change="pageCurFn"
      />
    </ECard>

    <!-- 分享 -->
    <el-drawer
      slot="dialog"
      :visible.sync="drawer_share"
      :with-header="false"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        分享
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-form
          slot="table"
          label-width="85px"
          size="mini"
        >
          <el-form-item label="分享二维码">
            <Qrcode
              :value="shareUrl"
              tag="img"
              :options="{ size: 150 }"
            />
          </el-form-item>
          <el-form-item label="分享链接">
            <el-input
              v-model="shareUrl"
              disabled
            >
              <el-button
                slot="append"
                v-clipboard="shareUrl"
                type="warning"
                @success="$message({ type: 'success', message: '复制成功' })"
              >
                复制
              </el-button>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
    <!-- </div> -->
  </TreeTable>
</template>
