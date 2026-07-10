<script>
import { getAuthToken } from '@/utils/tab-session'
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import {
  delFirePointById,
  fireFightingPoint,
  firePointAdd,
  firePointEdit,
  importMeasurementPointEode,
} from '@/http/fireControl-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import DrawMapPoint from '@/views/common-ui/DrawMapPoint'
import ExcelExport from '@/views/common-ui/excelHandle/ExcelExport'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree.vue'
import PickPeople from '@/views/common-ui/PickPeople'

export default {
  components: {
    OwnDeparmentTree,
    SelectTree,
    DrawMapPoint,
    PickPeople,
    ExcelExport,
  },
  data() {
    return {
      form: {
        pageNum: 1,
        pageSize: 10,
      },
      loading: false,
      data: [],
      total: 0,
      ynList: [
        { dictCode: true, dictName: '是' },
        { dictCode: false, dictName: '否' },
      ],
      departList: [],

      editForm: {
        generateWorkOrder: false,
        eventForGenerateWorkOrder: [],
      },
      editRules: {},
      title: '新增组织报警编码',
      dialog: false,
      editLoading: false,
      editable: true,
      showPeopleDialog: false,
      peopleProp: {}, // 选择人员组件传递信息
      dataUploadParams: {
        header: {
          Authorization: getAuthToken(),
          clientChannel: 'WEB',
        },
        accept: [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
      },
      // 导出传参
      exportProp: {
        reqData: {},
        pickList: [],
      },
      showExportDialog: false,
      firePointType: [], // 消费点位类型
      hideLeft: false,
      treeWidth: '240px',
      conWidth: 'calc(100% - 240px)',
    }
  },
  async created() {
    this.getDataList()
    const departRes = await getDepartListSimple() // 获取当前用户所拥有的部门
    this.departList = (departRes.data.result || []).filter((item) => {
      return item.departmentType === 'DEPARTMENT'
    })
    // 消防点位类型 fire_point
    // this.firePointType = this.$dictUtils.getDictList('fire_point');
    // console.log('消防点位类型:',this.firePointType);
  },
  methods: {
    async getDataList() {
      const { data } = await fireFightingPoint(this.form)
      this.loading = false
      if (data.code == 200) {
        this.data = data.result.list || []
        this.total = data.result.total
        this.data.forEach((item) => {
          item.pointOnMap = JSON.parse(item.pointOnMap || '{}')
        })
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
      if (data.onlyTreeUse)
        return
      this.form.pageNum = 1
      this.form.department = data.id
      this.getDataList()
    },
    // 部门选择
    departFn(v) {
      this.editForm.department = v
      try {
        this.departList.forEach((item) => {
          if (item.id === v) {
            this.editForm.departmentName = item.departmentName
            throw '已找到'
          }
        })
      }
      catch (err) {}
    },
    // 新增
    addFn() {
      this.editable = true
      this.editForm = {
        generateWorkOrder: false,
        eventForGenerateWorkOrder: [],
      }
      this.title = '新增组织报警编码'
      this.dialog = true
    },
    // 查看
    seeFn(v) {
      this.editable = false
      this.title = '查看组织报警编码'
      this.dialog = true
      if (!v.generateWorkOrder) {
        v.generateWorkOrder = false
      }
      if (!v.eventForGenerateWorkOrder) {
        v.eventForGenerateWorkOrder = []
      }
      this.$nextTick(() => {
        this.editForm = JSON.parse(JSON.stringify(v))
      })
    },
    // 导入
    downloadDataImportTemplateClick() {
      this.$utils.download('/excel/getImportTemplate/fireFightingPointImport', null)
    },
    uploadDataImportTemplateClick(data) {
      const params = {
        file: data.file,
      }
      this.isLoading = true
      importMeasurementPointEode(params)
        .then(({ data }) => {
          if (data.success) {
            this.$message.success('导入成功')
            this.getDataList()
          }
          else {
            this.$message.warning(data.message || '导入失败')
          }
        })
        .catch((err) => {
          this.$message.error('导入出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /**
     * 上传前验证
     */
    onBeforeUpload(file) {
      const me = this
      const isValid = me.dataUploadParams.accept.includes(file.type)
      if (!isValid) {
        this.$message.error('选择的模板文件类型不正确')
      }
      return isValid
    },
    /* 点击导出 */
    exportClick() {
      //   this.exportProp.reqData = {}
      //   for (let key in this.form) {
      //     if (!['pageNum', 'pageSize'].includes(key)) {
      //       this.exportProp.reqData[key] = this.form[key]
      //     }
      //   }

      const params = {}
      for (const key in this.form) {
        if (this.form[key] && !['pageNum', 'pageSize'].includes(key)) {
          params[key] = this.form[key]
        }
      }
      this.exportProp = {
        businessData: {
          key: 'fireFightingPointExport',
          name: '测点编码导出',
        },
        reqData: params,
      }
      this.showExportDialog = true
    },
    // 编辑
    editFn(v) {
      this.editable = true
      this.title = '编辑组织报警编码'
      this.dialog = true
      if (!v.generateWorkOrder) {
        v.generateWorkOrder = false
      }
      if (!v.eventForGenerateWorkOrder) {
        v.eventForGenerateWorkOrder = []
      }
      this.$nextTick(() => {
        this.editForm = JSON.parse(JSON.stringify(v))
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
          delFirePointById(v.id)
            .then(({ data }) => {
              if (data.code === 200) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(msg || '删除失败')
              }
            })
            .catch((err) => {
              this.$message.error('删除失败')
            })
        })
        .catch(() => {})
    },
    // 前往绘制
    goDrawPoint() {
      this.$refs.drawMapPoint.initMap(this.editForm.pointOnMap || {})
    },
    // 保存绘制的点
    changePoint(pointOnMap) {
      const isDrawed = Object.keys(pointOnMap).length > 0 ? '1' : '0'
      this.editForm = Object.assign({}, this.editForm, {
        pointOnMap,
        isDrawed,
      })
    },
    // 保存
    saveFn() {
      this.$refs.editForm.validate((valid) => {
        if (!valid)
          return
        this.editLoading = true
        const fn = this.title.includes('编辑') ? firePointEdit : firePointAdd

        delete this.editForm.createdTime
        delete this.editForm.updatedTime
        if (typeof this.editForm.pointOnMap === 'object') {
          this.editForm.pointOnMap = JSON.stringify(this.editForm.pointOnMap)
        }

        fn(this.editForm).then(({ data }) => {
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
    // 选择责任人
    choosePeople() {
      this.peopleProp.oldPickData = {
        id: this.editForm.caretakerUserId || '',
        fullName: this.editForm.caretakerUserName || '',
      }
      this.peopleProp.isSingle = true
      this.peopleProp.listType = 'role'
      this.peopleProp.withoutChildrenDepartment = true
      this.showPeopleDialog = true
    },
    // 选择责任人之后的回调
    closePeopleEvt(params) {
      if (params) {
        this.editForm.caretakerUserId = params.data.id
        this.editForm.caretakerUserName = params.data.fullName
      }
      this.showPeopleDialog = false
    },
    genEventStr(v) {
      if (!v)
        return '-'

      const tarList = this.$dictUtils.getDictList('eventForGenerateWorkOrder')
      const res = []

      v.forEach((code) => {
        for (let i = 0; i < tarList.length; i++) {
          if (code == tarList[i].dictCode) {
            res.push(tarList[i].dictName)
            break
          }
        }
      })

      return res.join(', ')
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
  // mounted(){}
}
</script>

<template>
  <div class="point-fireControl">
    <div
      class="leftCon"
      :style="`width: ${treeWidth}`"
    >
      <OwnDeparmentTree
        slot="tree"
        ref="companyTree"
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
          <el-col :span="6">
            <el-form-item label="报警编码">
              <el-input
                v-model="form.code"
                placeholder="报警编码"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col
            :span="6"
            style="padding-left: 10px"
          >
            <el-form-item
              label="是否生成工单"
              label-width="90px"
            >
              <el-select
                v-model="form.generateWorkOrder"
                placeholder="是否生成工单"
                style="width: 100%"
                clearable
              >
                <el-option
                  v-for="item in ynList"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            :span="6"
            style="padding-left: 10px"
          >
            <el-form-item
              label="是否地图标注"
              label-width="90px"
            >
              <el-select
                v-model="form.isDrawed"
                placeholder="是否地图标注"
                style="width: 100%"
                clearable
              >
                <el-option
                  v-for="item in ynList"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 按钮 -->
          <el-col
            :span="6"
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
          <el-dropdown style="margin: 0 10px">
            <el-button
              type="success"
              icon="el-icon-upload2"
              plain
            >
              Excel导入
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <el-button
                  type="success"
                  icon="el-icon-download"
                  plain
                  @click="downloadDataImportTemplateClick"
                >
                  下载数据模板
                </el-button>
              </el-dropdown-item>

              <el-dropdown-item>
                <el-upload
                  ref="fileUpload"
                  action="#"
                  name="file"
                  :headers="dataUploadParams.header"
                  :limit="1"
                  :accept="dataUploadParams.accept.toString()"
                  :http-request="uploadDataImportTemplateClick"
                  :before-upload="onBeforeUpload"
                  :show-file-list="false"
                  :auto-upload="true"
                >
                  <el-button
                    type="success"
                    icon="el-icon-upload2"
                    plain
                  >
                    导入模板数据
                  </el-button>
                </el-upload>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button
            type="success"
            icon="el-icon-upload2"
            plain
            @click="exportClick"
          >
            Excel导出
          </el-button>
        </div>
        <!-- 表格 -->
        <el-table
          v-loading="loading"
          :data="data"
          style="width: 100%"
          size="mini"
          :header-cell-style="{ background: 'var(--ky-head-color)' }"
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
            label="报警编码"
            prop="alarmCode"
            align="center"
          />
          <el-table-column
            label="归属部门"
            prop="departmentName"
            align="center"
          />
          <el-table-column
            label="责任人"
            prop="caretakerUserName"
            align="center"
          />
          <el-table-column
            label="是否生成工单"
            prop="generateWorkOrder"
            align="center"
            width="100"
          >
            <template slot-scope="scope">
              {{ scope.row.generateWorkOrder ? '是' : '否' }}
            </template>
          </el-table-column>
          <el-table-column
            label="报警位置"
            prop="alarmPosition"
            align="center"
          />
          <el-table-column
            label="是否地图标注"
            prop="isDrawed"
            align="center"
            width="100"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.isDrawed === true">是</span>
              <span v-else-if="scope.row.isDrawed === false">否</span>
              <span v-else />
            </template>
          </el-table-column>
          <el-table-column
            label="设备类型"
            prop="alarmType"
            align="center"
          >
            <!-- isNaN()  code类型是否数字  -->
            <template slot-scope="scope">
              <!-- {{isNaN(scope.row.alarmType) ? scope.row.alarmType : $dictUtils.getDictLabel('fire_point',scope.row.alarmType)}} -->
              {{ scope.row.alarmType }}
            </template>
          </el-table-column>
          <el-table-column
            label="工单产生事件"
            prop="eventForGenerateWorkOrder"
            align="center"
            width="100"
          >
            <template slot-scope="scope">
              <span>{{ genEventStr(scope.row.eventForGenerateWorkOrder) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="报警备注"
            prop="alarmRemarks"
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

    <el-dialog
      class="normal-dialog edit-dialog point-fireControl-dialog"
      :title="title"
      :visible.sync="dialog"
      width="70%"
    >
      <el-form
        ref="editForm"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
        size="mini"
        :disabled="!editable"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="报警编码"
              prop="alarmCode"
              :rules="[
                {
                  required: true,
                  message: '报警编码不能为空',
                  trigger: 'blur',
                },
                {
                  required: true,
                  len: 6,
                  message: '长度必须为6',
                  trigger: 'blur',
                },
              ]"
            >
              <el-input
                v-model="editForm.alarmCode"
                placeholder="报警编码"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="归属部门"
              prop="department"
              :rules="{
                required: true,
                message: '归属部门不能为空',
                trigger: 'blur',
              }"
            >
              <!-- <SelectTree
                :props="{
                  value: 'id', // ID字段名
                  label: 'departmentName', // 显示名称
                  children: 'children' // 子级字段名
                }"
                :list="departList"
                :value="editForm.department"
                :clearable="true"
                :accordion="true"
                @getValue="(value) => departFn(value)"
              /> -->
              <el-select
                v-model="editForm.department"
                placeholder="请选择"
                filterable
                style="width: 100%"
                @change="departFn"
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
              label="责任人"
              prop="caretakerUserName"
              :rules="{
                required: true,
                message: '责任人不能为空',
                trigger: 'change',
              }"
            >
              <el-input
                v-model="editForm.caretakerUserName"
                readonly
                @focus="choosePeople"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="报警位置"
              prop="alarmPosition"
            >
              <el-input
                v-model="editForm.alarmPosition"
                placeholder="报警位置"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="设备类型"
              prop="alarmType"
              :rules="{
                required: true,
                message: '请选择设备类型',
                trigger: 'change',
              }"
            >
              <el-select
                v-model="editForm.alarmType"
                placeholder="请选择设备类型"
                clearable
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('fire_point')"
                  :key="item.id"
                  :label="item.dictName"
                  :value="item.dictName"
                />
              </el-select>
              <!-- <el-input v-model="editForm.alarmType" placeholder="设备类型" /> -->
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="是否生成工单"
              prop="generateWorkOrder"
              :rules="{
                required: true,
                message: '是否生成工单必填',
                trigger: 'change',
              }"
            >
              <el-select
                v-model="editForm.generateWorkOrder"
                placeholder="是否生成工单"
                style="width: 100%"
              >
                <el-option
                  v-for="item in ynList"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="editForm.generateWorkOrder"
            :span="24"
          >
            <el-form-item
              label="工单产生事件"
              prop="eventForGenerateWorkOrder"
              :rules="{
                required: true,
                message: '工单产生事件必填',
                trigger: 'change',
              }"
            >
              <el-checkbox-group v-model="editForm.eventForGenerateWorkOrder">
                <el-checkbox
                  v-for="item in $dictUtils.getDictList('eventForGenerateWorkOrder')"
                  :key="item.dictCode"
                  :label="item.dictCode"
                >
                  {{ item.dictName }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item
              label="报警备注"
              prop="alarmRemarks"
            >
              <el-input
                v-model="editForm.alarmRemarks"
                type="textarea"
                :rows="6"
                placeholder="报警备注"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="区域范围">
              <el-button
                type="primary"
                @click="goDrawPoint"
              >
                前往绘制
              </el-button>
              <el-tag
                v-if="editForm.isDrawed"
                type="success"
                style="margin-left: 10px; cursor: pointer"
                @click="goDrawPoint"
              >
                已绘制
              </el-tag>
              <el-tag
                v-else
                type="info"
                style="margin-left: 10px"
              >
                未绘制
              </el-tag>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div
        slot="footer"
        class="dialog-footer"
      >
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
      </div>
    </el-dialog>
    <draw-map-point
      ref="drawMapPoint"
      @changePoint="changePoint"
    />

    <el-dialog
      class="fixed-dialog"
      title="选择人员"
      :visible.sync="showPeopleDialog"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <PickPeople
        v-if="showPeopleDialog"
        v-bind="peopleProp"
        @close="closePeopleEvt"
      />
    </el-dialog>
    <el-dialog
      slot="dialog"
      class="normal-dialog"
      title="Excel导出"
      :visible.sync="showExportDialog"
      width="650px"
      append-to-body
      :close-on-click-modal="false"
    >
      <ExcelExport
        v-if="showExportDialog"
        v-bind="exportProp"
        @close="showExportDialog = false"
      />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.point-fireControl {
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
.point-fireControl-dialog {
  .el-checkbox-group {
    .el-checkbox__label {
      font-size: 12px !important;
      font-weight: normal !important;
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
}
</style>
