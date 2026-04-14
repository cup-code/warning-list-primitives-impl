/* * @Author: yangjie 应急物资检查记录、查看应急物资检查记录弹框 * @Date: 2023-03-14 14:55:13 */
<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import { addGoodsRecord, getByIdGoodsRecord } from '@/http/contingency/contingencyGoods.js' // 应急物资接口路径
import { getAllUsersByCompany } from '@/http/safe-production/depart-manage-api'

export default {
  components: {
    TreeSelect,
  },
  data() {
    return {
      visible: false,
      loading: false,
      colWidth: 12,
      userList: [], // 队员姓名列表
      dataRule: {
        category: [{ required: true, message: '物品分类不能为空', trigger: 'blur' }],
        unit: [{ required: true, message: '品名及单位不能为空', trigger: 'blur' }],
        number: [{ required: true, message: '库存数量不能为空', trigger: 'blur' }],
        place: [{ required: true, message: '存放地点不能为空', trigger: 'blur' }],
        person: [{ required: true, message: '负责人不能为空', trigger: 'blur' }],
        phone: [{ required: true, message: '负责人电话不能为空', trigger: 'blur' }],
        checkPerson: [{ required: true, message: '检查人不能为空', trigger: 'blur' }],
        checkDate: [{ required: true, message: '检查时间不能为空', trigger: 'blur' }],
      },
      tableData: [],
      method: '',
      inputForm: {},
    }
  },
  created() {
    const companyId = this.$store.state.user.user.companyId
    Promise.all([getAllUsersByCompany(companyId)])
      .then((res) => {
        this.userList = res[0].data.result || []
      })
      .catch((err) => {
        this.$message.error('获取列表失败')
      })
  },
  methods: {
    closeDialog() {
      this.tableData = []
      this.inputForm = {}
      this.$refs.inputForm.resetFields()
    },
    init(row, method) {
      console.log(row)
      this.visible = true
      this.method = method
      console.log(row)
      this.inputForm = Object.assign({}, row)

      if (row && method == 'view') {
        this.getByIdGoodsRecordFn(row.id)
      }
      else {
        this.inputForm.id = null
        // this.inputForm.remark = null
        this.inputForm.parentId = row.id
      }
    },
    getByIdGoodsRecordFn(id) {
      getByIdGoodsRecord(id).then((res) => {
        if (res.code == 200) {
          this.inputForm.checkPerson = res.result.checkPerson // 检查人
          this.inputForm.checkDate = res.result.checkDate // 检查时间
          this.inputForm.checkRemark = res.result.checkRemark // 备注
          this.tableData = res.result.checkInfo
        }
      })
    },
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          let params, funcFn
          params = Object.assign(this.inputForm)
          addGoodsRecord(params)
            .then((data) => {
              if (data.success) {
                this.$message.success(data.message || '提交成功')
                this.$emit('refreshList') // 执行回调函数
                this.visible = false
              }
              else {
                this.$message.warning(data.message || '提交失败')
              }
            })
            .catch(() => {
              this.$message.error('提交失败')
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
  },
}
</script>

<template>
  <el-dialog
    :title="`${method == 'check' ? '' : '查看'}应急物资检查记录`"
    :close-on-click-modal="false"
    width="800px"

    :visible.sync="visible"
    class="normal-dialog"
    @close="closeDialog"
  >
    <el-form
      ref="inputForm"
      v-loading="loading"
      :model="inputForm"
      :rules="dataRule"
      label-width="120px"
      :disabled="method === 'view'"
      @submit.native.prevent
    >
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="物资分类"
            prop="category"
          >
            <el-select
              v-model="inputForm.category"
              disabled
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in $dictUtils.getDictList('em_supply_type')"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="品名及单位"
            prop="unit"
          >
            <el-input
              v-model="inputForm.unit"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="库存数量"
            prop="number"
          >
            <el-input
              v-model="inputForm.number"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="存放地点"
            prop="place"
          >
            <el-input
              v-model="inputForm.place"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="负责人"
            prop="person"
          >
            <el-input
              v-model="inputForm.person"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="负责人电话"
            prop="phone"
          >
            <el-input
              v-model="inputForm.phone"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="method == 'check'">
        <el-col :span="colWidth">
          <el-form-item
            label="检查人"
            prop="checkPerson"
          >
            <el-select
              v-model="inputForm.checkPerson"
              placeholder="请选择"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="item in userList"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="检查时间"
            prop="checkDate"
          >
            <el-date-picker
              v-model="inputForm.checkDate"
              style="width: 100%"
              value-format="yyyy-MM-dd hh:mm:ss"
              type="date"
              placeholder="选择日期"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-form-item
            v-if="method == 'check'"
            label="备注"
            prop="checkRemark"
          >
            <el-input
              v-model="inputForm.checkRemark"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
          <el-form-item
            v-else
            label="备注"
            prop="remark"
          >
            <el-input
              v-model="inputForm.remark"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- 表格 -->
    <el-table
      v-if="method !== 'check'"
      ref="table"
      v-loading="loading"
      :data="tableData"
      size="mini"
      height="200px"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
    >
      <el-table-column
        label="序号"
        type="index"
        width="50"
      />
      <el-table-column
        label="检查人"
        prop="checkPerson"
        align="center"
      >
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.checkPerson"
            placeholder="请选择"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="item in userList"
              :key="item.id"
              :label="item.fullName"
              :value="item.id"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column
        label="检查时间"
        prop="checkDate"
        align="center"
      >
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.checkDate"
            class="cell-input"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="备注"
        prop="checkRemark"
        align="center"
      >
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.checkRemark"
            class="cell-input"
          />
        </template>
      </el-table-column>
    </el-table>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        v-if="method !== 'view'"
        size="small"
        type="primary"
        :loading="loading"
        @click="doSubmit()"
      >确定</el-button>
    </span>
  </el-dialog>
</template>
