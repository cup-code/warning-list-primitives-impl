<script>
import LivePlayer from '@liveqing/liveplayer'
import JessibucaPlayer from '@/components/JessibucaPlayer/index'
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import {
  deleteCameraById,
  getCameraById,
  getHkCameraList,
  updateCamera,
  videoPlayById,
} from '@/http/hkAi-api'
import {
  getAllDepartByCompanyFn,
  getAllUsersByTenant,
} from '@/http/safe-production/depart-manage-api.js'
import { loadJsmap } from '@/utils/loadJsmap'
import AllDepartmentTree from '@/views/common-ui/AllDepartmentTree.vue'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree.vue'

export default {
  components: {
    CompanyTree,
    AllDepartmentTree,
    OwnDeparmentTree,
    TreeSelect,
    LivePlayer,
    JessibucaPlayer,
  },
  data() {
    return {
      form: {
        pageNum: 1,
        pageSize: 10,
        isOnlySelfData: true,
      },
      loading: false,
      data: [],
      total: 0,

      editForm: {},
      editRules: {
        companyId: [{ required: true, message: '请选择公司', trigger: 'change' }],
        brand: [{ required: true, message: '请选择品牌', trigger: 'change' }],
        camName: [{ required: true, message: '请输入视频名称', trigger: 'blur' }],
        camIp: [{ required: true, message: '请输入IP地址', trigger: 'blur' }],
        ipChan: [{ required: true, message: '请输入通道号', trigger: 'blur' }],
        nvrIp: [{ required: true, message: '请输入nvrIp地址', trigger: 'blur' }],
        // ,
        // userIds: [
        //     {required: true, message: '请选择报警处理人', trigger: 'change'}
        // ]
      },
      title: '新增视频监控',
      dialog: false,
      editLoading: false,
      editable: true,
      companyData: [], // 公司列表
      personList: [], // 人员列表

      mapServerURL: window.g.MAP_URL, // 地图引用的地址
      zq_map: null, // 真趣地图
      drawTool: null, // 地图画图工具
      dialog_vid: false,
      title_vid: '摄像头播放',
      videoUrl: '',
      departUrl: '', // 部门列表的请求接口地址
      hideLeft: false,
      treeWidth: '240px',
      conWidth: 'calc(100% - 240px)',

      departList: [], // 所属部门
    }
  },
  watch: {
    dialog(v) {
      if (!v) {
        this.zq_map.destroy()
        this.zq_map = null
      }
    },
  },
  async mounted() {
    await loadJsmap()
  },
  created() {
    this.getDataList()
    this.getPersonList()
    this.buildId = this.$store.state.user.user.buildId || '' // 获取当前用户所属公司的建筑id。用于地图初始化
  },
  methods: {
    async getDataList() {
      this.loading = true
      const { data } = await getHkCameraList(this.form)
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
    // 获取人员列表
    async getPersonList() {
      const userData = JSON.parse(sessionStorage.getItem('user'))
      const userRes = await getAllUsersByTenant(userData.tenantId)
      this.personList = userRes.data.result || []
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
        isOnlySelfData: true,
        companyId: this.form.companyId || '',
      }
      this.getDataList()
    },
    addFn() {
      this.editable = true
      this.editForm = {}
      this.title = '新增视频监控'
      this.dialog = true
      // this.companyData = this.$refs['companyTree'].getTreeData();
      this.$nextTick(() => {
        this.initMap()
      })
    },
    editFn(row, flag) {
      getCameraById(row.id)
        .then(({ data }) => {
          if (data.code === 200 && data.result) {
            this.editForm = data.result
            // 获取所属部门部门list：当前人公司的所有组织架构
            getAllDepartByCompanyFn(this.editForm.companyId).then(({ data }) => {
              this.departList = (data.result || []).filter((item) => {
                return item.departmentType === 'DEPARTMENT'
              })
            })
            this.$nextTick(() => {
              if (data.result.geoInfo) {
                this.initMap(JSON.parse(data.result.geoInfo))
              }
              else {
                this.initMap()
              }
            })
          }
          else {
            this.editForm = {}
          }
        })
        .catch((err) => {
          this.editForm = {}
        })

      this.editable = flag
      this.title = '编辑视频监控'
      this.dialog = true
      // this.companyData = this.$refs['companyTree'].getTreeData();
    },
    delFn(row) {
      this.$confirm(`您确认要删除 ${row.camName}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          deleteCameraById(row.id)
            .then(({ data }) => {
              const msg = data.message
              if (data.success === true) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(msg || '删除失败!')
              }
            })
            .catch((err) => {
              this.$message.error('删除失败!')
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

        this.editForm.receiveAlarm = this.editForm.receiveAlarm || false
        updateCamera(this.editForm).then(({ data }) => {
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
    treeNodeTap(data) {
      if (data.onlyTreeUse)
        return
      if (data) {
        this.form.departmentId = data.id
      }
      else {
        delete this.form.departmentId
      }
      this.getDataList()
    },
    // 公司选择
    comFn(id, name) {
      this.editForm.companyId = id || ''
      this.editForm.companyName = name || ''
      this.$refs.treeSelect.closeSelect()

      this.$set(this.editForm, 'departmentId', '')
      // this.departUrl = id ? `sysDepartment/companyDepartment/${this.editForm.companyId}` : ''
      if (!id) {
        this.departList = []
      }
      else {
        getAllDepartByCompanyFn(id).then(({ data }) => {
          this.departList = (data.result || []).filter((item) => {
            return (
              item.departmentType === 'DEPARTMENT' || item.departmentType === 'COMPANY'
            )
          })
        })
      }
    },
    // 部门选择
    depFn(id) {
      this.editForm.departmentId = id
      this.$refs.officeTree.closeSelect()
    },
    // 初始化地图
    initMap(info) {
      this.zq_map = new jsmap.JSMap({
        mapType: jsmap.JSMapType.MAP_3D,
        container: 'zq_map',
        mapServerURL: this.mapServerURL,
        openingAnimation: false, // 是否开启开场动画，默认true
        showLoading: false, // 是否显示地图加载动画，默认true
        buildingSelected: false, // 是否启用建筑选中，默认true
        selectedEffect: false, // 是否启用选中效果，默认true
        showGlobe: true,
      })
      this.zq_map.openMapById(this.buildId)

      this.zq_map.on('loadComplete', (e) => {
        this.drawTool = new jsmap.JSDrawToolControl({
          position: jsmap.JSControlPosition.RIGHT_TOP, // 画图工具在容器中的相对位置，当前为右上
          offset: {
            x: 5,
            y: 5,
          }, // 偏移量
          drawMode: jsmap.JSDrawMode.POINT, // 画图类型POINT:画点  POLYLINE:画线  POLYGON:画面
          // 画图结束的回调，返回所画的面信息
          callback: (feature) => {
            this.genMapInfo(feature)
          },
          // 移除相应面的回调，返回相应面信息
          removeCallback: (feature) => {
            this.genMapInfo(feature, true)
          },
          // 编辑相应面的回调，返回相应面信息
          editCallback: (feature) => {
            this.genMapInfo(feature)
          },
        })
        this.zq_map.addControl(this.drawTool)

        // 如果有点，则在地图上显示
        if (info) {
          this.drawTool.addGraphic(info)
        }
      })
    },
    genMapInfo(feature, isDel) {
      if (isDel) {
        delete this.editForm.geoInfo
        delete this.editForm.longitude
        delete this.editForm.latitude
        this.$set(this.editForm, 'geo', '')
      }
      else {
        this.editForm.geoInfo = JSON.stringify(feature)
        this.editForm.longitude = feature.geometry.coordinates[0]
        this.editForm.latitude = feature.geometry.coordinates[1]
        this.$set(
          this.editForm,
          'geo',
          JSON.stringify({
            lng: feature.geometry.coordinates[0],
            lat: feature.geometry.coordinates[1],
            z: feature.geometry.coordinates[2],
            floorId: feature.properties.floorId,
          }),
        )
      }
    },
    // 表格每行内的switch切换
    rowSwitch(dt) {
      getCameraById(dt.id)
        .then(({ data }) => {
          if (data.code === 200 && data.result) {
            data.result.receiveAlarm = dt.receiveAlarm
            updateCamera(data.result)
              .then(({ data }) => {
                if (data.code !== 200) {
                  dt.receiveAlarm = !dt.receiveAlarm
                  this.$message.error(data.message || '修改失败')
                }
                else {
                  this.$message.success(data.message || '修改成功')
                }
              })
              .catch((err) => {
                dt.receiveAlarm = !dt.receiveAlarm
                this.$message.error('修改失败')
              })
          }
          else {
            dt.receiveAlarm = !dt.receiveAlarm
            this.$message.error(data.message || '修改失败')
          }
        })
        .catch((err) => {
          dt.receiveAlarm = !dt.receiveAlarm
          this.$message.error('修改失败')
        })
    },
    // 播放按钮
    playFn(dt) {
      if (!dt.channelId || !dt.deviceId) {
        this.$message.error('缺少通道编号或者设备编号!')
        return
      }

      videoPlayById(dt.channelId, dt.deviceId)
        .then(({ data }) => {
          if (data.code === 200 && data.result) {
            this.title_vid = dt.camName
            this.dialog_vid = true
            // 读取的是m3u8格式的，用livePlayer播放器
            // this.videoUrl = data.result.hls;

            // 读取的是flv格式的，用JessibucaPlayer播放器
            if (window.g.IS_HTTPS) {
              this.videoUrl = data.result.https_flv
            }
            else {
              this.videoUrl = data.result.flv
            }
          }
          else {
            this.$message.error(data.message || '请求失败!')
          }
        })
        .catch((err) => {
          this.$message.error(err || '请求失败!')
        })

      // videoPlayById('34020000001320000087', '34020000001320000087').then(({data}) => {
      // this.videoUrl = 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8';
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
  <TreeTable ref="treeTable">
    <!-- <div> -->
    <OwnDeparmentTree
      slot="tree"
      ref="depTree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- <div class="leftCon" :style="`width: ${treeWidth}`"> -->
    <!-- <CompanyTree @treeNodeTap="treeNodeTap" ref="companyTree" /> -->
    <!-- <AllDepartmentTree slot="tree" @treeNodeTap="treeNodeTap" ref="companyTree" :hasResponsible="false" /> -->
    <!-- <OwnDeparmentTree slot="tree" @treeNodeTap="treeNodeTap" ref="depTree" />
      <div class="toggle-btn" @click="toggleLeftFn">
        {{ hideLeft ? '展开' : '隐藏' }}
      </div>
    </div> -->

    <!-- 查询条件 -->
    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <!-- 查询条件 -->
      <el-form
        :model="form"
        label-width="100px"
        class="searchForm"
      >
        <el-row>
          <el-col :span="7">
            <el-form-item label="视频名称或位置" prop="cameraNameOrLoc">
              <el-input v-model="form.cameraNameOrLoc" placeholder="视频名称或位置" />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="视频设备品牌" prop="brand">
              <el-select
                v-model="form.brand"
                placeholder="视频设备品牌"
                style="width: 100%"
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('videoType')"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 按钮 -->
          <el-col :span="10" style="padding-left: 10px">
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="getDataList"
            >
              查询
            </el-button>
            <el-button icon="el-icon-refresh-right" @click="resetFn">
              重置
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </ECard>
    <ECard slot="table">
      <!-- 添加功能行 -->
      <div class="card-cell">
        <EButton
          type="primary"
          btnIcon="el-icon-plus"
          plain
          @click="addFn"
        >
          新增
        </EButton>
      </div>

      <!-- 内容 -->
      <el-table
        v-loading="loading"
        :data="data"
        style="width: 100%"
        size="mini"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        height="90%"
      >
        <el-table-column
          label="公司"
          prop="companyName"
          align="center"
          width="200"
        />
        <el-table-column
          label="部门"
          prop="departmentName"
          align="center"
          min-width="120"
        />
        <el-table-column
          label="视频名称"
          prop="camName"
          align="center"
        />
        <el-table-column
          label="所在位置"
          prop="camLocation"
          align="center"
        />
        <el-table-column
          label="视频设备品牌"
          prop="brand"
          align="center"
          width="100"
        >
          <template slot-scope="scope">
            {{
              $dictUtils.getDictLabel("videoType", scope.row.brand)
            }}
          </template>
        </el-table-column>
        <el-table-column
          label="是否接受报警"
          prop="receiveAlarm"
          align="center"
          width="100"
        >
          <template slot-scope="scope">
            <el-switch v-model="scope.row.receiveAlarm" @change="rowSwitch(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column
          label="是否标注"
          prop="isMark"
          align="center"
        >
          <template slot-scope="scope">
            {{ scope.row.isMark ? "是" : "否" }}
          </template>
        </el-table-column>
        <el-table-column
          label="报警处理人"
          prop="userNames"
          align="center"
          width="90"
        />
        <el-table-column
          align="center"
          fixed="right"
          label="操作"
          width="160"
        >
          <template slot-scope="scope">
            <el-button type="text" @click="editFn(scope.row, false)">
              查看
            </el-button>
            <el-button type="text" @click="playFn(scope.row)">
              播放
            </el-button>
            <el-button
              type="text"
              style="color: var(--ky-warning)"
              @click="editFn(scope.row, true)"
            >
              编辑
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
    </ECard>

    <!-- 分页 -->
    <ECard slot="page" type="footer">
      <el-pagination
        :current-page.sync="form.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="form.pageSize"
        layout="total, prev, pager, next, jumper, sizes"
        :total="total"
        @size-change="pageSizeFn"
        @current-change="pageCurFn"
      />
    </ECard>
    <!-- </div> -->

    <template slot="dialog">
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
          label-width="85px"
          size="mini"
          :disabled="!editable"
        >
          <div>
            <div class="barSty">
              基本信息
            </div>
            <el-row>
              <el-col :span="8">
                <el-form-item label="所属公司" prop="companyId">
                  <!-- <TreeSelect
                                    ref="treeSelect"
                                    :data="companyData"
                                    :props="{
                                        value: 'id',
                                        label: 'companyName',
                                        children: 'childrenCompany'
                                    }"
                                    :value="editForm.companyId"
                                    :label="editForm.companyName"
                                    @getValue="comFn"
                                /> -->

                  <TreeSelect
                    v-if="dialog"
                    ref="treeSelect"
                    :props="{
                      value: 'id',
                      label: 'companyName',
                      children: 'children',
                    }"
                    url="sysCompany/getSubordinateCompany"
                    :value="editForm.companyId"
                    :clearable="true"
                    :accordion="true"
                    @getValue="comFn"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="所属部门" prop="departmentId">
                  <!-- <TreeSelect
                                    ref="officeTree"
                                    :props="{
                                        value: 'id',
                                        label: 'departmentName',
                                        children: 'children'
                                    }"
                                    :url="departUrl"
                                    :value="editForm.departmentId"
                                    :clearable="true"
                                    :accordion="true"
                                    v-if="dialog"
                                    @getValue="depFn"
                                /> -->

                  <el-select
                    v-model="editForm.departmentId"
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
              <el-col :span="8">
                <el-form-item label="品牌" prop="brand">
                  <el-select
                    v-model="editForm.brand"
                    placeholder="品牌"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in $dictUtils.getDictList('videoType')"
                      :key="item.dictCode"
                      :label="item.dictName"
                      :value="item.dictCode"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="视频标准" prop="videoCode">
                  <el-select
                    v-model="editForm.videoCode"
                    placeholder="视频标准"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in $dictUtils.getDictList('videoCode')"
                      :key="item.dictCode"
                      :label="item.dictName"
                      :value="item.dictCode"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="视频名称" prop="camName">
                  <el-input v-model="editForm.camName" placeholder="视频名称" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="视频位置" prop="camLocation">
                  <el-input v-model="editForm.camLocation" placeholder="视频位置" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div>
            <div class="barSty">
              配置信息
            </div>
            <el-row>
              <el-col :span="8">
                <el-form-item label="账号" prop="account">
                  <el-input v-model="editForm.account" placeholder="账号" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="密码" prop="pwd">
                  <el-input v-model="editForm.pwd" placeholder="密码" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="IP地址" prop="camIp">
                  <el-input v-model="editForm.camIp" placeholder="IP地址" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="nvrIp地址" prop="nvrIp">
                  <el-input v-model="editForm.nvrIp" placeholder="nvrIp地址" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="端口号" prop="camPort">
                  <el-input v-model="editForm.camPort" placeholder="端口号" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="通道号" prop="ipChan">
                  <el-input v-model="editForm.ipChan" placeholder="通道号" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="报警处理人" prop="userIds">
                  <el-select
                    v-model="editForm.userIds"
                    placeholder="报警处理人"
                    style="width: 100%"
                    multiple
                    filterable
                  >
                    <el-option
                      v-for="item in personList"
                      :key="item.id"
                      :label="item.fullName"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="设备编号" prop="deviceId">
                  <el-input v-model="editForm.deviceId" placeholder="设备编号" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="通道编号" prop="channelId">
                  <el-input v-model="editForm.channelId" placeholder="通道编号" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="是否接收报警" prop="receiveAlarm">
                  <el-switch v-model="editForm.receiveAlarm" />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="摄像头类型" prop="rtmpUrl">
                  <el-select
                    v-model="editForm.rtmpUrl"
                    placeholder="摄像头类型"
                    style="width: 100%"
                    clearable
                  >
                    <el-option
                      v-for="item in $dictUtils.getDictList('cameraType')"
                      :key="item.dictCode"
                      :label="item.dictName"
                      :value="item.dictCode"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div>
            <div class="barSty">
              位置信息
            </div>
            <el-row>
              <el-col :span="24">
                <el-form-item label="地图位置" prop="geo">
                  <el-input
                    v-model="editForm.geo"
                    placeholder="请在地图上标记"
                    disabled
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <div id="zq_map" />
              </el-col>
            </el-row>
          </div>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button @click="dialog = false">
            {{ editable ? "取消" : "关闭" }}
          </el-button>
          <el-button
            v-show="editable"
            type="primary"
            :loading="editLoading"
            @click="saveFn"
          >
            保存
          </el-button>
        </div>
      </el-dialog>

      <!-- 播放弹窗 -->
      <el-dialog
        class="normal-dialog edit-dialog video-dialog"
        :title="title_vid"
        :visible.sync="dialog_vid"
        width="50%"
        :close-on-click-modal="false"
        @close="videoUrl = ''"
      >
        <!-- <LivePlayer :videoUrl="videoUrl" fluent autoplay live stretch /> -->
        <JessibucaPlayer :id="Math.floor(Math.random() * 10 + 1)" :videoUrl="videoUrl" />
      </el-dialog>
    </template>
  </TreeTable>
</template>

<style lang="scss" scoped>
.manage-videoAi {
  height: calc(100vh - 50px);
  background: #f3f7f9;
  display: flex;
  position: relative;
  .leftCon {
    position: absolute;
    height: 100%;
    top: 0;
    left: 0;
    height: 100%;
    padding: 10px;
    padding-right: 0px;
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
  .barSty {
    display: flex;
    align-items: center;
    font-weight: bold;
    margin-bottom: 10px;
    &::before {
      display: inline-block;
      content: "";
      margin-right: 6px;
      width: 5px;
      height: 14px;
      background-color: #409eff;
    }
  }

  // &.video-dialog {
  //     .el-dialog__body {
  //         padding: 0;
  //     }
  //     .player-wrapper {
  //         height: 400px;
  //     }
  //     .video-wrapper {
  //         height: 100%;
  //         padding-bottom: 0 !important;
  //     }
  // }

  &.video-dialog {
    .el-dialog__body {
      padding: 0;
      height: 480px;
    }
  }
}
</style>
