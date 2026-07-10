<script>
import moment from 'moment'
import {
  emSupplyAdd,
  emSupplyGetById,
  emSupplyRecordDel,
  emSupplyRecordGetByPage,
  emSupplyUpdate,
} from '@/http/emergency/emsource-api.js'

export default {
  props: {
    // 所属公司树数据
    companyData: {
      type: Array,
      default() {
        return []
      },
    },
    companyId: {
      type: String,
      default: '',
    },
    companyName: {
      type: String,
      default: '',
    },
    // 是否新创建
    isNew: {
      type: Boolean,
      default: true,
    },
    // 是否可编辑
    editable: {
      type: Boolean,
      default: false,
    },
    // 详情id
    infoId: {
      type: [String, Number],
      default: '',
    },
  },
  data() {
    return {
      showCheckDialog: false,
      loadingDialog: false,
      loadingTable: false,
      oldData: {}, // 物资原始数据
      changeData: {
        xxfl: '',
        companyId: '',
        companyName: '',
      }, // 物资数据
      resTypeList: [], // 物资类别
      typeInfo: {}, // 物资详细类别
      tableData: [],
      searchData: {
        pageNum: 1,
        pageSize: 5,
      },
      total: 0,
    }
  },
  computed: {
    setDate() {
      return function (timestamp) {
        const date = moment(timestamp).format('YYYY/MM/DD')
        return date
      }
    },
    setTypeInfoList() {
      let result = []
      if (this.changeData.wplb) {
        let code = ''
        for (const item of this.resTypeList) {
          if (item.id === this.changeData.wplb) {
            code = item.dictCode
          }
        }
        if (this.typeInfo[code]) {
          result = this.typeInfo[code]
        }
      }
      return result
    },
  },
  created() {
    this.searchData.byid = this.infoId
    this.getInfoData()
    if (!this.isNew) {
      this.getRecordData()
    }
    const dicList = JSON.parse(sessionStorage.getItem('dictList'))
    this.resTypeList = dicList.emergency_resource
    this.typeInfo.em_equip_type = dicList.em_equip_type
    this.typeInfo.em_supply_type = dicList.em_supply_type
  },
  methods: {
    /* 所属公司下拉列表点击 */
    companyTreeNodeTap(data) {
      this.changeData.companyId = data.id
      this.changeData.companyName = data.companyName
      this.$refs.tableTypeSelect.blur()
    },
    /* 点击清空公司下拉列表 */
    clearClick() {
      this.changeData.companyName = ''
      this.changeData.companyId = ''
    },
    /* 初始化信息 */
    getInfoData() {
      // 新增
      if (this.isNew) {
        this.oldData = {}
        this.changeData.xxfl = ''
        this.changeData.companyId = this.companyId
        this.changeData.companyName = this.companyName
      }
      // 修改或查看
      else {
        this.loadingDialog = true
        emSupplyGetById(this.infoId)
          .then((res) => {
            if (res.data.success) {
              this.oldData = res.data.result
              this.changeData = JSON.parse(JSON.stringify(this.oldData))
            }
            else {
              this.$message.warning(res.data.message || '请求详情失败')
            }
          })
          .catch((err) => {
            this.$message.error('请求详情出错！', err)
          })
          .finally(() => {
            this.loadingDialog = false
          })
      }
    },
    /* 获取记录列表 */
    getRecordData() {
      this.loadingTable = true
      emSupplyRecordGetByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list
            this.total = res.data.result.total
          }
          else {
            this.$message.warning(res.data.message || '获取记录列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取记录列表出错', err)
        })
        .finally(() => {
          this.loadingTable = false
        })
    },
    /* 确认保存 */
    saveChangeClick() {
      this.$refs.supplyForm.validate((valid) => {
        if (valid) {
          let saveFunc = emSupplyAdd
          if (!this.isNew) {
            saveFunc = emSupplyUpdate
            this.changeData.id = this.infoId
          }
          this.loadingDialog = true
          saveFunc(this.changeData)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('保存成功！')
                this.closeClick(true)
              }
              else {
                this.$message.warning(res.data.message || '保存失败')
              }
            })
            .catch((err) => {
              this.$message.error('保存出错', err)
            })
            .finally(() => {
              this.loadingDialog = false
            })
        }
      })
    },
    /* 关闭窗口 */
    closeClick(isRefresh) {
      // 这里点取消保存也需要刷新，因为可能修改了检查记录，预留不刷新的功能
      this.$emit('succ', isRefresh)
    },
    /* 新增检查记录 */
    addRecordClick(isNew, id) {
      const params = {}
      params.wplb = this.$dictUtils.getDictLabelById('emergency_resource', this.oldData.wplb, '--')
      params.xxfl = this.setTypeInfo(this.oldData.wplb, this.oldData.xxfl)
      params.pmdw = this.oldData.pmdw
      params.isNew = isNew
      params.infoId = this.infoId
      if (!isNew) {
        params.recordId = id
      }
      this.$emit('record', params)
    },
    /* 删除检查记录 */
    delInfoClick(item) {
      this.$confirm(`您确定要删除第${item.$index + 1}条信息吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loadingTable = true
          emSupplyRecordDel(item.row.id)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('删除成功！')
                this.getRecordData()
              }
              else {
                this.$message.warning(res.data.message || '删除失败')
              }
            })
            .catch((err) => {
              this.$message.error('删除出错！', err)
            })
            .finally(() => {
              this.loadingTable = false
            })
        })
        .catch(() => {})
    },
    /* 字段翻译 */
    setTypeInfo(typeId, infoId) {
      let name = '--'
      let dictCode = ''
      for (const item of this.resTypeList) {
        if (item.id === typeId) {
          dictCode = item.dictCode
          break
        }
      }
      name = this.$dictUtils.getDictLabelById(dictCode, infoId, '--')
      return name
    },
    /* 物品类别变化回调 */
    wplbChangeEvt() {
      this.changeData.xxfl = ''
    },
  },
}
</script>

<template>
  <div
    v-loading="loadingDialog"
    class="supply-bg"
  >
    <!-- 表单 -->
    <el-form
      ref="supplyForm"
      :model="changeData"
      label-width="100px"
      style="width: 750px"
      inline
      :disabled="!editable"
    >
      <el-form-item
        label="所属公司"
        prop="companyId"
        :rules="{
          required: true,
          message: '请选择所属公司',
          trigger: 'change',
        }"
      >
        <el-select
          ref="tableTypeSelect"
          v-model="changeData.companyId"
          class="header-item-data"
          clearable
          style="width: 250px"
          @clear="clearClick"
        >
          <el-option
            :value="changeData.companyId"
            :label="changeData.companyName"
          >
            <el-tree
              :data="companyData"
              :props="{ children: 'childrenCompany', label: 'companyName' }"
              highlight-current
              :expand-on-click-node="false"
              node-key="id"
              check-strictly
              @node-click="companyTreeNodeTap"
            />
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="物品分类"
        prop="wplb"
        :rules="{
          required: true,
          message: '请选择物品分类',
          trigger: 'change',
        }"
      >
        <el-select
          v-model="changeData.wplb"
          filterable
          style="width: 250px"
          @change="wplbChangeEvt"
        >
          <el-option
            v-for="item in resTypeList"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="详细类别"
        prop="xxfl"
        :rules="{
          required: true,
          message: '请选择详细类别',
          trigger: 'change',
        }"
      >
        <el-select
          v-model="changeData.xxfl"
          filterable
          style="width: 250px"
        >
          <el-option
            v-for="item in setTypeInfoList"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="品名及单位"
        prop="pmdw"
        :rules="{
          required: true,
          message: '请填写品名及单位',
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="changeData.pmdw"
          style="width: 610px"
        />
      </el-form-item>
      <el-form-item
        label="库存数量"
        prop="sl"
        :rules="{ required: true, message: '请填写库存数量', trigger: 'blur' }"
      >
        <el-input
          v-model="changeData.sl"
          type="number"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="存放地点"
        prop="cfdd"
        :rules="{ required: true, message: '请填写存放地点', trigger: 'blur' }"
      >
        <el-input
          v-model="changeData.cfdd"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="负责人"
        prop="fzr"
        :rules="{ required: true, message: '请填写负责人', trigger: 'blur' }"
      >
        <el-input
          v-model="changeData.fzr"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="负责人电话"
        prop="fzrdh"
        :rules="{
          required: true,
          message: '请填写负责人电话',
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="changeData.fzrdh"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="changeData.bz"
          type="textarea"
          :rows="4"
          resize="none"
          style="width: 610px"
        />
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-button
      v-if="editable"
      v-show="infoId"
      style="margin: 0 0 0 100px"
      type="primary"
      @click="addRecordClick(true)"
    >
      新增检查记录
    </el-button>
    <div
      v-if="!isNew"
      v-loading="loadingTable"
      class="record-box"
    >
      <el-table
        :data="tableData"
        :header-cell-style="{ borderLeft: 'none', borderRight: 'none' }"
        align="center"
      >
        <el-table-column
          type="index"
          width="50"
          align="center"
          label="序号"
        />
        <el-table-column
          label="检查人"
          align="center"
          prop="jcr"
        />
        <el-table-column
          label="检查时间"
          align="center"
          width="100"
        >
          <template slot-scope="scope">
            <span>{{ setDate(scope.row.jcsj) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="备注"
          align="center"
          prop="bz"
          show-overflow-tooltip
        />
        <el-table-column
          v-if="editable"
          label="操作"
          align="center"
          width="100"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="mini"
              @click="addRecordClick(false, scope.row.id)"
            >
              修改
            </el-button>
            <el-button
              type="text"
              size="mini"
              style="color: var(--ky-danger)"
              @click="delInfoClick(scope)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="page-box">
        <el-pagination
          :disabled="loadingTable"
          style="margin: 0 20px 0 0"
          :current-page.sync="searchData.pageNum"
          :page-size.sync="searchData.pageSize"
          layout="total, prev, pager, next, jumper"
          :total="total"
          @current-change="getRecordData"
          @size-change="getRecordData"
        />
      </div>
    </div>
    <!-- 按钮 -->
    <div class="dialog-footer">
      <el-button
        size="medium"
        plain
        type="primary"
        style="margin: 0 20px 0 0"
        :disabled="loadingDialog"
        @click="closeClick(true)"
      >
        取消
      </el-button>
      <el-button
        v-if="editable"
        size="medium"
        type="primary"
        :disabled="loadingDialog"
        @click="saveChangeClick"
      >
        确认保存
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.supply-bg {
  .record-box {
    width: 610px;
    margin: 10px 0 0 100px;
    padding: 0 0 20px 0;
    .page-box {
      display: flex;
      justify-content: center;
    }
  }
}
</style>
