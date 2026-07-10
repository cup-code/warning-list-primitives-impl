<script>
import ImageSelect from '@/components/ImageSelect'
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { addDeviceGroup, getDeviceGroup } from '@/http/dev/group-api'
import {
  addDevice,
  deleteDevice,
  getDeviceList,
  upLoadDeviceImg,
} from '@/http/dev/manage-api'
import { getAllProduct } from '@/http/dev/product-api'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import DevItem from './components/devItem.vue'

export default {
  components: {
    CompanyTree,
    SelectTree,
    ImageSelect,
    DevItem,
  },
  data: () => ({
    loading: false,
    submitLoading: false,
    sForm: {
      page: 1,
      pageSize: 12,
    },
    data: [],
    total: 0,
    drawer_sh: false,
    drawer_add: false,
    addForm: {},
    addFormRules: {
      groupId: [{ required: true, message: '请选择分组', trigger: 'blur' }],
    },
    groupList: [],
    productList: [],
    map: null,
    marker: null,
    // 终端状态列表
    stateList: [
      { name: '未发布', value: '-1' },
      { name: '未激活', value: '0' },
      { name: '离线', value: '1' },
      { name: '在线', value: '2' },
    ],
    options: [], // 查询条件
    sFormCopy: null, // sForm的原始数据
    dialog_group: false, // 控制添加分组的弹窗
    groupForm: {},
    groupRules: {
      groupName: [{ required: true, message: '不能为空', trigger: 'blur' }],
    },
    groupLoading: false,
  }),
  computed: {
    /* 翻译分组名称 */
    getGroupName() {
      return function (id) {
        let name = ''
        for (const item of this.groupList) {
          if (item.id == id) {
            name = item.groupName
            break
          }
        }
        return name
      }
    },
    /* 翻译产品属性 */
    getProductDes() {
      return function (type, id) {
        let des = ''
        for (const item of this.productList) {
          if (item.id == id) {
            switch (type) {
              case 'token':
                des = item.token
                break
              case 'name':
                des = item.name
                break
              case 'img':
                des = this.filePrefix + item.imageUrl
                break
              default:
            }
            break
          }
        }
        return des
      }
    },
  },
  watch: {
    drawer_add(v) {
      if (v) {
        this.initMap()
      }
      else {
        this.destroyMap()
      }
    },
  },
  created() {
    this.getDataList()
    this.getProList()
    this.getGroupList()
    this.getPrefix()
  },
  methods: {
    getDataList() {
      this.loading = true
      getDeviceList(this.sForm)
        .then(({ data }) => {
          this.loading = false
          const msg = data.message

          if (data.success === true && data.result) {
            const oData = data.result.list || []
            this.fixDataFn(oData)
            this.total = data.result.total
          }
          else {
            this.$message.error(msg || '获取终端失败')
          }
        })
        .catch(() => {
          this.loading = false
          this.$message.error('获取终端失败')
        })
    },
    fixDataFn(dt) {
      this.data = dt.map((item) => {
        return item
      })
    },
    // 获取产品列表
    getProList() {
      getAllProduct().then(({ data }) => {
        if (data.success === true) {
          this.productList = data.result || []
        }
      })
    },
    // 获取分组列表
    getGroupList() {
      getDeviceGroup().then((res) => {
        const resD = res.data
        // msg = resD.message
        if (resD.success === true) {
          this.groupList = resD.result || []
        }
      })
    },

    // 初始化地图
    initMap() {
      this.$nextTick(() => {
        this.map = new window.AMap.Map('map', {
          viewMode: '2D',
          center: [116.397026, 39.918058],
          zoom: 13,
        })
        // 放大缩小工具条插件
        window.AMap.plugin(['AMap.ToolBar'], () => {
          const toolbar = new window.AMap.ToolBar({
            position: 'RB',
            liteStyle: true,
          })
          this.map.addControl(toolbar)
        })
        // 监听map的点击事件
        this.map.on('click', this.mapClickFn)
      })
    },
    // 销毁地图
    destroyMap() {
      this.map.off('click', this.mapClickFn)
      this.map.destroy()
      this.map = null
      this.marker = null
    },
    // 地图的点击事件
    mapClickFn(e) {
      const ll = e.lnglat

      // 如果存在标记， 先删除
      if (this.marker) {
        this.marker.setMap(null)
        this.marker = null
      }

      // 新建marker
      this.marker = new window.AMap.Marker({
        map: this.map,
        position: [ll.lng, ll.lat],
        draggable: true,
        offset: new window.AMap.Pixel(-12.5, -28),
        icon: new window.AMap.Icon({
          image: require('@/assets/site1.png'),
          size: new window.AMap.Size(25, 33),
          imageSize: new window.AMap.Size(25, 33),
        }),
      })
      this.marker.on('dragend', this.markerDragendFn) // 监听marker的 dragend 事件
      this.marker.setMap(this.map)

      // 在表单中 显示 经纬度位置
      const location = `${ll.lng},${ll.lat}`
      this.$set(this.addForm, 'location', location)
    },
    // marker的 拖动结束 事件
    markerDragendFn(e) {
      // 在表单中 显示 经纬度位置
      const ll = e.lnglat
      const location = `${ll.lng},${ll.lat}`
      this.$set(this.addForm, 'location', location)
    },
    pageSizeFn(v) {
      this.sForm.page = 1
      this.sForm.pageSize = v
      this.getDataList()
    },
    pageCurFn(v) {
      this.sForm.page = v
      this.getDataList()
    },
    // 添加产品 按钮
    addFn() {
      this.addForm = {
        sortOrder: 0,
      }
      this.drawer_add = true
    },
    // 添加产品 确认按钮
    addDoFn() {
      this.$refs.addForm.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true

        const params = JSON.parse(JSON.stringify(this.addForm))
        if (params.location) {
          const ll = params.location.split(',')
          params.longitude = ll[0]
          params.latitude = ll[1]
          delete params.location
        }

        addDevice(params)
          .then((res) => {
            this.submitLoading = false
            const resD = res.data
            const msg = resD.message

            if (resD.success) {
              this.$message.success('添加成功')
              this.getDataList()
              this.drawer_add = false
            }
            else {
              this.$message.error(msg || '添加失败')
            }
          })
          .catch(() => {
            this.submitLoading = false
            this.$message.error('添加失败')
          })
      })
    },
    // 删除终端
    delFn(v) {
      this.$confirm(`您确认要删除 ${v.name}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          deleteDevice(v.protocolId, v.id)
            .then((res) => {
              this.loading = false
              const resD = res.data
              const msg = resD.message
              if (resD.success === true) {
                this.$message.success('删除成功')
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
    // 跳转到详情
    toDetail(item) {
      const {
        productId: pid,
        id: did,
        code: dcd,
      } = item
      this.$router.push({
        path: `/detail/device/${pid}/${did}/${dcd}`,
      })
    },
    // 添加分组 按钮
    groupFn() {
      this.groupForm = {
        sortOrder: 0,
      }
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
        addDeviceGroup(params)
          .then((res) => {
            this.groupLoading = false
            const resD = res.data
            const msg = resD.message
            if (resD.success) {
              this.$message.success(msg || '添加成功')
              this.getGroupList()
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
          if (key === 'deviceState') {
            // 终端状态
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
          if (key === 'productId') {
            // 所属产品
            list = this.productList
            len = list.length
            for (i = 0; i < len; i++) {
              cur = list[i]
              if (cur.id == val) {
                temp.name = cur.name
                break
              }
            }
          }
          if (key === 'groupId') {
            // 所属分组
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

          opts.push(temp)
        }
      })
      // 页面展示查询条件需要的 list
      this.options = opts

      // 根据新生成的sForm, 重新请求数据
      this.sForm.page = 1
      this.sForm.pageSize = 12
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
      this.sForm.pageSize = 12
      this.getDataList()
    },
    fileChangeEvt(file) {
      if (file) {
        upLoadDeviceImg(file).then(({ data }) => {
          this.addForm.imageUrl = data.result
        })
      }
      else {
        this.addForm.imageUrl = ''
      }
    },
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data) {
        this.sForm.companyId = data.id
      }
      else {
        delete this.sForm.companyId
      }
      this.getDataList()
    },
  },
}
</script>

<template>
  <KyTreeTable
    v-loading="loading"
    :isShowSearch="false"
  >
    <!-- 左侧树 -->
    <CompanyTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- <div class="manage-dev" slot="search"> -->
    <!-- 头部 -->
    <!-- <ECard customStyle="padding:14px 20px" slot="search">
      <div class="cdns-con">
        <el-button icon="el-icon-plus" size="mini" @click="addFn">添加终端</el-button>
        <div class="cdns">
          <transition-group name="toUp">
            <el-tag v-for="item in options" :key="item.name" type="danger" size="small" closable @close="removeFn(item)">{{ item.name }}</el-tag>
          </transition-group>
        </div>
        <el-button size="mini" type="primary" @click="searchFn">查询终端</el-button>
      </div>
    </ECard> -->

    <!-- 内容 -->
    <ECard
      slot="table"
      customStyle="overflow-y: auto;height:84vh;box-sizing:border-box;padding: 14px"
    >
      <div class="mb-3 flex items-center">
        <el-button
          style="margin-right: 8px"
          icon="el-icon-plus"
          size="mini"
          @click="addFn"
        >
          添加终端
        </el-button>
        <div
          v-if="options.length > 0"
          class="flex items-center pr-2"
        >
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
          查询终端
        </el-button>
      </div>
      <el-col
        v-if="data.length === 0"
        :span="24"
        style="text-align: center; font-size: 16px"
      >
        暂无终端...
      </el-col>
      <div
        v-else
        class="devItem-list"
      >
        <!-- <el-col :span="8" v-for="(item, idx) in data" :key="idx"> -->
        <DevItem
          v-for="(item, idx) in data"
          :key="idx"
          :items="item"
          :filePrefixs="filePrefix"
          :groupList="groupList"
          :productList="productList"
          @detail="toDetail"
          @delete="delFn"
        />
        <!-- <el-card>
              <el-row class="base-info" :gutter="10">
                <el-col :span="7">
                  <el-popover placement="right" trigger="click">
                    <img :src="item.imageUrl ? filePrefix + item.imageUrl : getProductDes('img', item.productId)" style="height: 150px" />
                    <img
                      slot="reference"
                      :src="item.imageUrl ? filePrefix + item.imageUrl : getProductDes('img', item.productId)"
                      style="height: 40px; min-height: 40px; max-width: 100%"
                    />
                  </el-popover>
                </el-col>
                <el-col :span="12">
                  <div style="font-size: 13px; white-space: nowrap">{{ item.name }}</div>
                </el-col>
                <el-col :span="5" class="third-col" style="text-align: right">
                  <el-tag v-if="item.state === -1 || (!item.state && item.state !== 0)" effect="plain" type="warning">未发布</el-tag>
                  <el-tag v-if="item.state === 0" effect="plain" type="warning">未激活</el-tag>
                  <el-tag v-if="item.state === 1" effect="plain" type="danger">离线</el-tag>
                  <el-tag v-if="item.state === 2" effect="plain" type="success">在线</el-tag>
                  <el-tag v-if="item.state === 3" effect="plain" type="warning">报警</el-tag>
                </el-col>
              </el-row>
              <el-row class="more-info">
                <el-col :span="21">
                  <div class="moreInfo-row">
                    <span>产品型号: </span>
                    <span class="row-con">{{ getProductDes('token', item.productId) }}</span>
                  </div>
                  <div class="moreInfo-row">
                    <span>终端编码: </span>
                    <span class="row-con">{{ item.code }}</span>
                  </div>
                  <div class="moreInfo-row">
                    <span>终端分组: </span>
                    <span class="row-con">{{ getGroupName(item.groupId) }}</span>
                  </div>
                </el-col>
              </el-row>
              <el-button-group class="btns">
                <el-button size="mini" @click="toDetail(item.productId, item.id, item.code)"><i class="el-icon-s-tools" style="font-weight: 400" /></el-button>
                <el-button size="mini" @click="delFn(item)"><i class="el-icon-delete" style="color: #f56c6c" /></el-button>
              </el-button-group>
            </el-card> -->
        <!-- </el-col> -->
      </div>
    </ECard>
    <!-- 页码 -->
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        style="text-align: right"
        :current-page="sForm.page"
        :page-sizes="[12, 24, 60]"
        :page-size="sForm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="pageSizeFn"
        @current-change="pageCurFn"
      />
    </ECard>
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
          <el-form-item label="终端名称">
            <el-input v-model="sForm.deviceName" />
          </el-form-item>
          <el-form-item label="终端编码">
            <el-input v-model="sForm.deviceCode" />
          </el-form-item>
          <el-form-item label="终端状态">
            <el-select
              v-model="sForm.deviceState"
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
          <el-form-item label="所属产品">
            <el-select
              v-model="sForm.productId"
              placeholder="请选择"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in productList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="终端分组">
            <el-select
              v-model="sForm.groupId"
              placeholder="请选择"
              clearable
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

    <!-- 添加终端 抽屉 -->
    <el-drawer
      slot="dialog"
      :visible.sync="drawer_add"
      :with-header="false"
      class="drawer-add"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        添加终端
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-form
          ref="addForm"
          :model="addForm"
          :rules="addFormRules"
          label-width="85px"
          size="mini"
        >
          <el-form-item
            label="所属公司"
            prop="companyId"
          >
            <SelectTree
              ref="officeTree"
              :props="{
                value: 'id', // ID字段名
                label: 'companyName', // 显示名称
                children: 'children', // 子级字段名
              }"
              url="sysCompany/getSubordinateCompany"
              :value="addForm.companyId"
              :clearable="true"
              :accordion="true"
              @getValue="
                value => {
                  addForm.companyId = value
                }
              "
            />
          </el-form-item>
          <el-form-item
            label="所属产品"
            prop="productId"
          >
            <el-select
              v-model="addForm.productId"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in productList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="终端编码"
            prop="code"
          >
            <el-input
              v-model="addForm.code"
              placeholder="请输入"
            />
          </el-form-item>
          <el-form-item
            label="终端名称"
            prop="name"
          >
            <el-input
              v-model="addForm.name"
              placeholder="请输入"
            />
          </el-form-item>
          <el-form-item
            label="终端分组"
            prop="groupId"
            class="group-item"
          >
            <el-select
              v-model="addForm.groupId"
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
            label="终端描述"
            prop="remarks"
          >
            <el-input
              v-model="addForm.remarks"
              placeholder="请输入"
            />
          </el-form-item>
          <el-form-item
            label="终端图片"
            prop="img"
          >
            <ImageSelect
              width="100px"
              height="100px"
              @fileChange="fileChangeEvt"
            />
          </el-form-item>
          <el-form-item
            label="排序号"
            prop="sortOrder"
          >
            <el-input-number
              v-model="addForm.sortOrder"
              :step="1"
              controls-position="right"
              :min="0"
              label="排序号"
            />
          </el-form-item>
          <el-form-item label="地理位置">
            <el-input
              v-model="addForm.location"
              disabled
            />
          </el-form-item>
          <el-form-item>
            <div
              id="map"
              class="map-con"
            />
          </el-form-item>
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            :loading="submitLoading"
            @click="addDoFn"
          >
            确认
          </el-button>
        </div>
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
        <el-form-item
          label="排序号"
          prop="sortOrder"
        >
          <el-input-number
            v-model="groupForm.sortOrder"
            :step="1"
            controls-position="right"
            :min="0"
            label="排序号"
          />
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
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.cdns-con {
  display: flex;
  // justify-content: flex-end;
  .cdns {
    margin-left: 10px;
    display: flex;
    // justify-content: flex-end;
    align-items: center;
    .el-tag {
      margin-right: 6px;
    }
  }
}

.devItem-list {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  min-width: 800px;
  max-height: 75vh;
  overflow-y: scroll;
  overflow-x: hidden;
  scrollbar-width: none;
  -webkit-scrollbar: none;
}
.manage-dev {
  position: relative;
  // padding: 10px;

  .mid-con {
    height: 100%;
    overflow: auto;
    & > .el-col {
      margin-bottom: 2vh;
      .el-card__body {
        position: relative;
        padding: 10px;
        padding-bottom: 40px;
        height: 170px;

        .base-info {
          display: flex;
          align-items: center;
          .third-col {
            .el-tag {
              padding: 0;
              border: none;
              height: 0;
              line-height: 0;
              font-size: 13px;
              font-weight: bold;
            }
          }
        }

        .more-info {
          margin-top: 10px;
          .el-col {
            display: flex;
            flex-direction: column;
            justify-content: center;
            & > div:nth-child(2) {
              padding: 12px 0;
            }
          }
          .moreInfo-row {
            display: flex;
            .row-con {
              flex: 1;
              // overflow: auto;
              white-space: nowrap;
            }
          }
        }

        .btns {
          position: absolute;
          left: 0;
          bottom: 0;
          display: flex;
          width: 100%;
          .el-button {
            flex: 1;
            i {
              font-weight: bold;
            }
          }
        }
      }
    }
  }

  .drawer-add {
    .map-con {
      height: 250px;
    }
    .group-item {
      .el-form-item__content {
        display: flex;
        .el-select {
          flex: 1;
          padding-right: 8px;
        }
      }
    }
  }

  .group-dialog {
    .el-dialog__body {
      padding: 20px;
    }
  }
}
</style>
