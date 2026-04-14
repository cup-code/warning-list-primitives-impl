<script>
import Qrcode from '@chenfengyuan/vue-qrcode'
import {
  addAlertContact,
  deleteAlertContact,
  editAlertContact,
  getAlertContactList,
  getQrcodeBindInfo,
  getQrcodeUrl,
  setDefaultContact,
} from '@/http/notice/notice-api'

export default {
  components: {
    Qrcode,
  },
  data: () => ({
    loading: false,
    tableData: [],
    pageFlag: true,
    sForm: {
      page: 1,
      pageSize: 10,
    },
    total: 0,
    drawer: false,
    drawerType: 0,
    drawerTitle: '',
    form: {},
    rules: {},
    submitLoading: false,
    drawer_sh: false,
    options: [], // 查询条件
    sFormCopy: null, // sForm的原始数据
    qrCode: {}, // 包含二维码id 和 二维码url
    scanInfo: {}, // 接口返回的 二维码扫码情况
    inter: null, // 定时器
  }),
  created() {
    this.getDataList()
  },
  methods: {
    getDataList() {
      this.loading = true
      getAlertContactList(this.sForm)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message
          if (resD.success === true) {
            this.tableData = resD.result.list
            this.total = resD.result.total
          }
          else {
            this.$message.error(msg || '查询联系人失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('查询联系人失败')
        })
    },
    // 获取二维码url
    getQrUrl() {
      getQrcodeUrl().then((res) => {
        const resD = res.data
        if (resD.success) {
          this.qrCode = resD.result || {}
        }
      })
    },
    // 查询二维码扫码信息
    getScanInfo() {
      const cid = this.qrCode.qrcodeId // 二维码id
      if (!cid)
        return
      getQrcodeBindInfo(cid).then((res) => {
        const resD = res.data
        if (resD.success) {
          this.scanInfo = resD.result || {}
        }
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
    // 添加 联系人
    addFn() {
      this.form = {
        isDefault: false,
      }
      this.drawerTitle = '添加联系人'
      this.drawerType = 0
      this.drawer = true

      this.getQrUrl() // 获取二维码图片
      this.startInter() // 开启轮询
    },
    // 编辑 联系人
    editFn(v) {
      this.form = JSON.parse(JSON.stringify(v))
      if (!this.form.isDefault) {
        this.form.isDefault = false
      }

      this.drawerTitle = '编辑联系人'
      this.drawerType = 1
      this.drawer = true
    },
    // 删除 联系人
    delFn(v) {
      this.$confirm(`您确认要删除 ${v.name}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          deleteAlertContact(v.id)
            .then((res) => {
              this.loading = false
              const resD = res.data
              const msg = resD.message
              if (resD.success === true) {
                this.$message.success(msg || '删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(msg || '删除失败!')
              }
            })
            .catch((err) => {
              this.loading = false
              this.$message.error('删除失败!')
            })
        })
        .catch(() => {})
    },
    submitFn() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true

        const {
          isDefault,
          name,
          mobile,
          email,
        } = this.form
        const params = { isDefault, name, mobile, email }

        // 添加
        if (this.drawerType === 0) {
          const cid = this.qrCode.qrcodeId
          // 如果扫码用户已经关注公众号 && 二维码id存在
          if (this.scanInfo.state == 3 && cid) {
            params.qrcodeId = cid
          }
          addAlertContact(params)
            .then((res) => {
              this.submitLoading = false
              const resD = res.data
              const msg = resD.message
              if (resD.success) {
                this.$message.success(msg || '添加成功')
                this.getDataList()
                this.drawer = false
              }
              else {
                this.$message.error(msg || '添加失败')
              }
            })
            .catch((err) => {
              this.submitLoading = false
              this.$message.error('添加失败')
            })
        }
        // 编辑
        else {
          params.id = this.form.id
          editAlertContact(params)
            .then((res) => {
              this.submitLoading = false
              const resD = res.data
              const msg = resD.message
              if (resD.success) {
                this.$message.success(msg || '编辑成功')
                this.getDataList()
                this.drawer = false
              }
              else {
                this.$message.error(msg || '编辑失败')
              }
            })
            .catch((err) => {
              this.submitLoading = false
              this.$message.error('编辑失败')
            })
        }
      })
    },
    // 设为默认联系人
    setDefault(v) {
      setDefaultContact(v.id)
        .then((res) => {
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.$message.success(msg || '设置成功')
            this.getDataList()
          }
          else {
            this.$message.error(msg || '设置失败')
          }
        })
        .catch((err) => {
          this.$message.error('设置失败')
        })
    },
    // 添加和编辑抽屉的 关闭
    addCloseFn() {
      // 如果是编辑抽屉, 就退出
      if (this.drawerType === 1)
        return

      this.qrCode = {} // 置空二维码信息
      this.endInter() // 关闭轮询
    },
    // 开启定时器, 轮询二维码扫码情况
    startInter() {
      if (this.inter) {
        clearInterval(this.inter)
      }
      this.inter = setInterval(() => {
        this.getScanInfo()
      }, 1000)
    },
    // 关闭定时器
    endInter() {
      this.inter && clearInterval(this.inter)
      this.inter = null
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
  <div class="people-notice">
    <!-- 按钮 -->
    <el-row>
      <el-col :span="12">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="addFn"
        >
          添加联系人
        </el-button>
      </el-col>
      <el-col
        :span="12"
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
            label="联系人名称"
            prop="name"
            align="center"
          />
          <el-table-column
            label="手机号"
            prop="mobile"
            align="center"
          />
          <el-table-column
            label="微信"
            prop="wechatNickname"
            align="center"
          />
          <el-table-column
            label="邮箱"
            prop="email"
            align="center"
          />
          <el-table-column
            label="默认联系人"
            prop="isDefault"
            align="center"
          >
            <template slot-scope="props">
              <el-button
                v-if="!props.row.isDefault"
                type="success"
                plain
                size="mini"
                @click="setDefault(props.row)"
              >
                设为默认
              </el-button>
              <el-tag
                v-else
                type="danger"
                size="mini"
              >
                默认联系人
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                @click="editFn(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                size="mini"
                type="danger"
                @click="delFn(scope.row)"
              >
                删除
              </el-button>
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
          <el-form-item label="联系人名称">
            <el-input v-model="sForm.name" />
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

    <!-- 添加/编辑 抽屉 -->
    <el-drawer
      :visible.sync="drawer"
      :with-header="false"
      @close="addCloseFn"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        {{ drawerTitle }}
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-form
          ref="form"
          :model="form"
          label-width="85px"
          :rules="rules"
          size="mini"
        >
          <el-form-item
            label="默认联系人"
            prop="isDefault"
          >
            <el-switch v-model="form.isDefault" />
          </el-form-item>
          <el-form-item
            label="联系人名称"
            prop="name"
          >
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item
            label="手机号"
            prop="mobile"
          >
            <el-input v-model="form.mobile" />
          </el-form-item>
          <el-form-item
            label="邮箱"
            prop="email"
          >
            <el-input v-model="form.email" />
          </el-form-item>
          <!-- 编辑 -->
          <el-form-item
            v-if="drawerType === 1"
            label="关联微信"
            class="wx"
          >
            <el-input
              v-model="form.wechatNickname"
              disabled
            />
          </el-form-item>
          <!-- 新增 -->
          <el-form-item
            v-if="drawerType === 0"
            label="关联微信"
            class="wx"
          >
            <el-input
              v-model="scanInfo.wechatNickname"
              disabled
            />
            <el-popover
              placement="left"
              trigger="hover"
            >
              <Qrcode
                :value="qrCode.qrcodeUrl"
                tag="img"
                :options="{ size: 150 }"
              />
              <Qrcode
                slot="reference"
                :value="qrCode.qrcodeUrl"
                tag="img"
              />
            </el-popover>
            <!-- <Qrcode :value="qrCode.qrcodeUrl" tag="img" :options="{size: 600}" /> -->
          </el-form-item>
          <el-form-item
            v-if="drawerType === 0"
            label="扫码反馈"
          >
            <el-tag
              v-if="scanInfo.state != 3 && scanInfo.state != -1"
              type="warning"
            >
              未关注公众号
            </el-tag>
            <el-tag
              v-if="scanInfo.state == 3"
              type="success"
            >
              已关注, 可绑定
            </el-tag>
            <el-tag
              v-if="scanInfo.state == -1"
              type="danger"
            >
              二维码已失效
            </el-tag>
          </el-form-item>
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            :loading="submitLoading"
            @click="submitFn"
          >
            提交
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.people-notice {
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
  .drawer-con {
    .wx {
      display: flex;
      align-items: center;
      .el-form-item__content {
        margin: 0 !important;
        flex: 1;
        display: flex;
        align-items: center;
        img {
          margin-left: 20px;
          width: 60px;
          height: 60px;
        }
      }
    }
  }
}
</style>
