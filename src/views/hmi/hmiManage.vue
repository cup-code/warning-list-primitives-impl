<script>
import Qrcode from '@chenfengyuan/vue-qrcode'
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { addHmiGroup, getAllHmiGroup } from '@/http/hmi/group-api'
import {
  addHmi,
  deleteHmi,
  editHmi,
  editHmiState,
  editHmiUpPic,
  getAllTemplate,
  getHmi,
  getHmiShareUrl,
} from '@/http/hmi/manage-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'

export default {
  components: {
    Qrcode,
    OwnDeparmentTree,
    SelectTree,
  },
  data: () => ({
    loading: false,
    tableData: [],
    pageFlag: true,
    sForm: {
      page: 1,
      pageSize: 10,
      departmentId: '',
    },
    total: 0,
    drawer: false,
    drawerType: 0,
    drawerTitle: '',
    form: {},
    rules: {
      name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      groupId: [{ required: true, message: '请选择分组', trigger: 'change' }],
      templateId: [{ required: true, message: '请选择模板', trigger: 'blur' }],
      departmentId: [{ required: true, message: '请选择部门', trigger: 'change' }],
    },
    submitLoading: false,
    groupList: [],
    tempList: [],
    drawer_share: false,
    shareUrl: '',
    dialog_group: false, // 控制添加分组的弹窗
    groupForm: {},
    groupRules: {
      groupName: [{ required: true, message: '不能为空', trigger: 'blur' }],
    },
    groupLoading: false,
    loading_pic: false, // 上传图片 loading
    drawer_sh: false,
    // 组态状态列表
    stateList: [
      { name: '上架', value: '0' },
      { name: '下架', value: '1' },
    ],
    options: [], // 查询条件
    sFormCopy: null, // sForm的原始数据
    departList: [], // 部门列表
    moreEButton: [
      {
        type: 'text',
        icon: 'share',
        size: 'mini',
        text: '分享',
        props: 'share',
      },
      {
        type: 'text',
        icon: 'unShelve',
        size: 'mini',
        text: '下架',
        props: 'unShelve',
      },
      {
        type: 'text',
        icon: 'shelve',
        size: 'mini',
        text: '上架',
        props: 'shelve',
      },
      {
        type: 'text',
        icon: 'setting',
        size: 'mini',
        text: '设置',
        props: 'set',
      },
      {
        type: 'text',
        icon: 'delete',
        size: 'mini',
        text: '删除',
        props: 'delete',
      },
    ],
  }),
  computed: {
    getMoreList() {
      return function (scope) {
        return this.moreEButton
          .map((item) => {
            if (item.icon === 'share') {
              return {
                ...item,
                disabled: scope.status === 1,
              }
            }
            if (item.icon === 'delete') {
              return {
                ...item,
                disabled: scope.status === 0,
              }
            }
            return {
              ...item,
              disabled: false,
            }
          })
          .filter((item) => {
            return (
              (scope.status === 0 && item.icon !== 'shelve')
              || (scope.status === 1 && item.icon !== 'unShelve')
            )
          })
      }
    },
    // getIsDisabled() {}
  },
  created() {
    this.getPrefix()
    this.getSimpleDepart()
  },
  mounted() {
    this.getDataList()
    this.getAllGroupList()
    this.getTempList()
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
        .catch(() => {
          this.loading = false
          this.$message.error('查询组态失败')
        })
    },
    getAllGroupList() {
      getAllHmiGroup().then((res) => {
        const resD = res.data
        if (resD.success === true) {
          this.groupList = resD.result
        }
      })
    },
    // 获取所有画面模板列表
    getTempList() {
      getAllTemplate().then((res) => {
        const resD = res.data
        if (resD.success) {
          this.tempList = resD.result || []
          this.tempList.unshift({
            id: 0,
            name: '空白模板',
          })
        }
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
      this.form.departmentId = v.id
      this.getDataList()
    },
    // 新建 组态
    addFn() {
      this.form = {
        type: 1, // 画面
        departmentId: this.form.departmentId,
      }
      this.drawerTitle = '新建组态'
      this.drawerType = 0
      this.drawer = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    // 编辑 组态
    editFn(v) {
      this.form = JSON.parse(JSON.stringify(v))
      this.form.type = 1 // 画面
      this.drawerTitle = '编辑组态'
      this.drawerType = 1
      this.drawer = true
    },
    // 删除 组态
    delFn(v) {
      this.$confirm(`您确认要删除 ${v.name}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          deleteHmi(v.id)
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
            .catch(() => {
              this.loading = false
              this.$message.error('删除失败!')
            })
        })
        .catch(() => {})
    },
    // 上下架 组态
    ableFn(v, state) {
      this.loading = true

      let str = ''
      if (state === 1) {
        str = '下架'
      }
      else {
        str = '上架'
      }
      const params = {
        id: v.id,
        state,
      }
      editHmiState(params)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.$message.success(msg || `${str}成功`)
            this.getDataList()
          }
          else {
            this.$message.error(msg || `${str}失败`)
          }
        })
        .catch(() => {
          this.loading = false
          this.$message.error(`${str}失败`)
        })
    },
    // 预览、编辑 组态画面
    previewFn(v, isEditor) {
      let hmiUrl = v.hmiIndex
      if (isEditor) {
        hmiUrl += '&mode=editor'
      }
      window.open(hmiUrl)
    },
    // 下载
    // downFn(v) {
    //     window.open(v.archiveUrl);
    // },
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
        .catch(() => {
          this.$message.error('获取分享链接失败')
        })
    },

    submitFn() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true

        const {
          name,
          groupId,
          type,
          remarks,
          templateId,
          password,
          thumbnailUrl,
          departmentId,
        }
          = this.form
        const params = {
          name,
          groupId,
          type,
          remarks,
          templateId,
          password,
          thumbnailUrl,
          departmentId,
        }

        // 添加
        if (this.drawerType === 0) {
          addHmi(params)
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

          // let flag = (this.form.thumbnailUrl.indexOf('http://') > -1) || (this.form.thumbnailUrl.indexOf('https://') > -1); // 图片是否 没有变动过
          // params.thumbnailUrl = flag ? this.form.thumbnailUrl.split('static/')[1] : this.form.thumbnailUrl;

          editHmi(params)
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
            .catch(() => {
              this.submitLoading = false
              this.$message.error('编辑失败')
            })
        }
      })
    },
    // 添加分组 按钮
    groupFn() {
      this.groupForm = {}
      this.dialog_group = true
    },
    // 添加分组 确认按钮
    groupDoneFn() {
      this.$refs.groupForm.validate((valid) => {
        if (!valid)
          return
        this.groupLoading = true

        const { groupName, remarks } = this.groupForm
        const params = { groupName, remarks }
        addHmiGroup(params)
          .then((res) => {
            this.groupLoading = false
            const resD = res.data
            const msg = resD.message
            if (resD.success) {
              this.$message.success(msg || '添加成功')
              this.getAllGroupList()
              this.dialog_group = false
            }
            else {
              this.$message.error(msg || '添加失败')
            }
          })
          .catch(() => {
            this.groupLoading = false
            this.$message.error('添加失败')
          })
      })
    },
    // 上传组态图片
    upBeforeFn(file) {
      this.loading_pic = true
      // 调用接口
      editHmiUpPic(file)
        .then((res) => {
          this.loading_pic = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.$message.success(msg || '上传成功')
            this.$set(this.form, 'thumbnailUrl', resD.result)
          }
          else {
            this.$message.error(msg || '上传失败')
          }
        })
        .catch(() => {
          this.loading_pic = false
          this.$message.error('上传失败')
        })

      return false
    },

    // 查询产品 按钮
    searchFn() {
      this.drawer_sh = true

      // 记录sForm数据 到 sFormCopy
      this.sFormCopy = JSON.parse(JSON.stringify(this.sForm))
    },
    // 查询 按钮
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
          if (key === 'groupId') {
            // 组态分组
            list = this.groupList
            len = list.length
            for (i = 0; i < len; i++) {
              cur = list[i]
              if (cur.id == val) {
                temp.name = cur.groupName
                break
              }
            }
          }
          if (key === 'status') {
            // 组态状态
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
    getSimpleDepart() {
      getDepartListSimple().then(({ data }) => {
        this.departList = data.result || []
      })
    },
  },
}
</script>

<template>
  <TreeTable>
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 按钮 -->
    <ECard
      slot="search"
      noneBottom
    >
      <div style="display: flex">
        <EButton
          btnIcon="el-icon-plus"
          type="primary"
          plain
          size="mini"
          @click="addFn"
        >
          新建组态
        </EButton>
        <!-- <el-button icon="el-icon-upload" size="mini" type="warning">快速导入</el-button> -->

        <div class="flex items-center px-2">
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
        <EButton
          size="mini"
          type="primary"
          @click="searchFn"
        >
          查询组态
        </EButton>
      </div>
    </ECard>
    <ECard slot="table">
      <!-- 内容 -->
      <el-table
        v-loading="loading"
        height="100%"
        :data="tableData"
        size="small"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column
          label="图片"
          width="130"
          prop="thumbnailUrl"
          align="center"
        >
          <template slot-scope="props">
            <div style="display: flex; align-items: center; justify-content: center">
              <img
                v-if="props.row.thumbnailUrl"
                :src="`${props.row.showThumbnailUrl}?random=${new Date().getTime()}`"
                style="height: 30px"
              >
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="名称"
          width="200"
          prop="name"
          align="center"
        />
        <!-- <el-table-column label="ID" prop="id" align='center'></el-table-column> -->
        <el-table-column
          label="状态"
          prop="status"
          align="center"
        >
          <template slot-scope="props">
            <el-tag
              v-if="props.row.status === 0"
              size="mini"
              type="success"
            >
              上架
            </el-tag>
            <el-tag
              v-if="props.row.status === 1"
              size="mini"
              type="danger"
            >
              下架
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="所属分组"
          prop="groupName"
          align="center"
        />
        <el-table-column
          label="创建时间"
          width="200"
          prop="createdTime"
          align="center"
        />
        <el-table-column
          label="描述"
          width="200"
          prop="remarks"
          align="center"
        />
        <el-table-column
          label="操作"
          fixed="right"
          width="180"
          align="right"
        >
          <template slot-scope="scope">
            <div>
              <EButton
                icon="edit"
                size="mini"
                type="text"
              >
                <router-link
                  tag="a"
                  target="_blank"
                  :to="{
                    name: 'editor',
                    query: {
                      mode: 'editor',
                      id: scope.row.encryptHmiId || scope.row.code,
                    },
                  }"
                >
                  编辑
                </router-link>
              </EButton>
              <EButton
                icon="running"
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
                  运行
                </router-link>
              </EButton>
              <EMoreButton
                icon="more"
                text="更多"
                :list="getMoreList(scope.row)"
                @shelve="ableFn(scope.row, 0)"
                @unShelve="ableFn(scope.row, 1)"
                @share="shareFn(scope.row)"
                @set="editFn(scope.row)"
                @delete="delFn(scope.row)"
              />
              <!-- <EButton size="mini" type="text" @click="shareFn(scope.row)" :disabled="scope.row.status === 1">分享</EButton> -->
            </div>
            <!-- <div style="margin-top: 4px">
            <el-button v-if="scope.row.status === 0" size="mini" type="warning" @click="ableFn(scope.row, 1)">下架</el-button>
            <el-button v-if="scope.row.status === 1" size="mini" type="warning" @click="ableFn(scope.row, 0)">上架</el-button>
            // <el-button size="mini" type="success" @click="downFn(scope.row)">下载</el-button>
            <el-button size="mini" type="success" @click="editFn(scope.row)">设置</el-button>
            <el-button @click="delFn(scope.row)" size="mini" type="danger" :disabled="scope.row.status === 0">删除</el-button>
          </div> -->
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
        :current-page="sForm.page"
        :page-size="sForm.pageSize"
        layout="total, prev, pager, next, jumper"
        :total="total"
        @current-change="pageCurFn"
      />
    </ECard>
    <!-- 添加/编辑 抽屉 -->
    <el-drawer
      slot="dialog"
      :visible.sync="drawer"
      :with-header="false"
      class="drawer-add"
    >
      <div
        v-loading="loading_pic"
        style="display: flex; flex-direction: column; overflow: hidden"
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
            label-width="70px"
            :rules="rules"
            size="mini"
          >
            <el-form-item
              label="组态名称"
              prop="name"
            >
              <el-input v-model="form.name" />
            </el-form-item>
            <el-form-item
              label="组态描述"
              prop="remarks"
            >
              <el-input v-model="form.remarks" />
            </el-form-item>
            <el-form-item
              label="组态分组"
              prop="groupId"
              class="group-item"
            >
              <el-select
                v-model="form.groupId"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in groupList"
                  :key="item.id"
                  :label="item.groupName"
                  :value="item.id"
                >
                  <span>{{ item.groupName }}</span>
                </el-option>
              </el-select>
              <el-button
                type="primary"
                icon="el-icon-plus"
                @click="groupFn"
              />
            </el-form-item>
            <el-form-item
              label="所属部门"
              prop="departmentId"
            >
              <SelectTree
                :props="{
                  value: 'id', // ID字段名
                  label: 'departmentName', // 显示名称
                  children: 'children', // 子级字段名
                }"
                :list="departList"
                :value="form.departmentId"
                :clearable="true"
                :accordion="true"
                @getValue="
                  value => {
                    form.departmentId = value
                  }
                "
              />
            </el-form-item>
            <el-form-item
              v-if="drawerType !== 1"
              label="选择模板"
              prop="templateId"
            >
              <el-select
                v-model="form.templateId"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="item in tempList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                  <span>{{ item.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="访问密码"
              prop="password"
            >
              <el-input
                v-model="form.password"
                show-password
              />
            </el-form-item>
            <el-form-item
              v-if="drawerType === 1"
              label="组态图片"
              class="ex-item"
            >
              <el-input
                v-model="form.thumbnailUrl"
                disabled
              />
              <div class="ex-info">
                <el-upload
                  action=""
                  :before-upload="upBeforeFn"
                >
                  <el-button type="success">
                    上传图片
                  </el-button>
                </el-upload>
              </div>
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
      </div>
    </el-drawer>

    <!-- 查询 抽屉 -->
    <el-drawer
      slot="dialog"
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
          <el-form-item label="组态名称">
            <el-input v-model="sForm.name" />
          </el-form-item>
          <el-form-item
            label="组态分组"
            prop="groupId"
          >
            <el-select
              v-model="sForm.groupId"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in groupList"
                :key="item.id"
                :label="item.groupName"
                :value="item.id"
              >
                <span>{{ item.groupName }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="组态状态">
            <el-select
              v-model="sForm.status"
              placeholder="请选择"
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
            @click="searchDoFn"
          >
            查询
          </el-button>
        </div>
      </div>
    </el-drawer>

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

    <!-- 添加分组 弹窗 -->
    <el-dialog
      slot="dialog"
      title="添加分组"
      :visible.sync="dialog_group"
      width="30%"
      custom-class="group-dialog"
    >
      <el-form
        ref="groupForm"
        :model="groupForm"
        label-width="70px"
        :rules="groupRules"
        size="mini"
      >
        <el-form-item
          label="分组名称"
          prop="groupName"
        >
          <el-input v-model="groupForm.groupName" />
        </el-form-item>
        <el-form-item
          label="分组描述"
          prop="remarks"
        >
          <el-input v-model="groupForm.remarks" />
        </el-form-item>
        <el-form-item style="text-align: right; margin: 0">
          <el-button @click="dialog_group = false">
            取消
          </el-button>
          <el-button
            type="primary"
            :loading="groupLoading"
            @click="groupDoneFn"
          >
            确定
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- </div> -->
  </TreeTable>
</template>
