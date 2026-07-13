/* * @Author: yangjie 应急物资新增、修改弹框 * @Date: 2023-03-14 14:55:13 */
<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import {
  addGoods,
  getByIdGoods,
  removeInfoById,
  updateGoods,
} from '@/http/contingency/contingencyGoods.js' // 应急物资接口路径
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
        companyId: [{ required: true, message: '所属公司不能为空', trigger: 'blur' }],
        category: [{ required: true, message: '物品分类不能为空', trigger: 'blur' }],
        unit: [{ required: true, message: '品名及单位不能为空', trigger: 'blur' }],
        number: [{ required: true, message: '库存数量不能为空', trigger: 'blur' }],
        place: [{ required: true, message: '存放地点不能为空', trigger: 'blur' }],
        person: [{ required: true, message: '负责人不能为空', trigger: 'blur' }],
        phone: [{ required: true, message: '负责人电话不能为空', trigger: 'blur' }],
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
    changeTeammember(id, index) {
      if (this.tableData.length > 0) {
        const arr = this.tableData
        for (let i = 0; i < arr.length; i++) {
          for (let j = i + 1; j < arr.length; j++) {
            if ((arr[i].checkPerson == arr[j].checkPerson) & (i != j)) {
              this.$message.warning('不能重复添加同一队员')
              this.tableData.splice(index, 1)
            }
          }
        }
      }
    },
    closeDialog() {
      this.tableData = []
      this.inputForm = {}
      this.$refs.inputForm.resetFields()
    },
    getDepartmentId(value, name) {
      this.inputForm.companyId = value
      this.inputForm.companyName = name
    },
    init(row, method) {
      this.visible = true
      this.method = method
      if (row) {
        this.getByIdGoodsFn(row.id)
      }
    },
    getByIdGoodsFn(id) {
      getByIdGoods(id).then((res) => {
        if (res.code == 200) {
          this.inputForm = {
            id: res.result.id,
            companyId: res.result.companyId, // 所属公司
            category: res.result.category, // 物品分类
            unit: res.result.unit, // 品名及单位
            number: res.result.number, // 库存数量
            place: res.result.place, // 存放地点
            person: res.result.person, // 负责人
            phone: res.result.phone, // 负责人电话
            remark: res.result.remark, // 备注
          }
          if (res.result.checkInfo) {
            this.tableData = res.result.checkInfo
          }
        }
      })
    },
    // 添加队员
    addUser() {
      const _commodity = {
        id: '',
        checkPerson: '',
        checkDate: '',
        remark: null,
      }
      this.tableData.unshift(_commodity)
    },
    // 删除队员
    delUser(row, index) {
      removeInfoById(row.id).then((res) => {
        if (res.code == 200) {
          this.tableData.splice(index, 1)
        }
      })
    },
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          let params, funcFn
          params = Object.assign(this.inputForm, { checkInfo: this.tableData })
          if (this.method === 'edit') {
            funcFn = updateGoods // 编辑
          }
          else {
            funcFn = addGoods // 新增
          }
          console.log(params)
          funcFn(params)
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
    :title="`${method == 'add' ? '新增' : method == 'edit' ? '修改' : '查看'}应急物资`"
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
            label="所属公司"
            prop="companyId"
          >
            <TreeSelect
              ref="officeTree"
              class="small-box"
              :props="{
                value: 'id', // ID字段名
                label: 'companyName', // 显示名称
                children: 'children', // 子级字段名
              }"
              url="sysCompany/getSubordinateCompany"
              :value="inputForm.companyId"
              :clearable="true"
              :accordion="true"
              @getValue="getDepartmentId"
            />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="物资分类"
            prop="category"
          >
            <el-select
              v-model="inputForm.category"
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
      </el-row>
      <el-row>
        <el-col>
          <el-form-item
            label="品名及单位"
            prop="unit"
          >
            <el-input v-model="inputForm.unit" />
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
              type="number"
            />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="存放地点"
            prop="place"
          >
            <el-input v-model="inputForm.place" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="负责人"
            prop="person"
          >
            <el-input v-model="inputForm.person" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="负责人电话"
            prop="phone"
          >
            <el-input v-model="inputForm.phone" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-form-item
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
      <el-button
        size="small"
        type="primary"
        @click="addUser"
      >
        新增检查记录
      </el-button>
    </el-form>
    <!-- 表格 -->
    <el-table
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
            @change="changeTeammember(scope.row.checkPerson, scope.$index)"
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
          <el-date-picker
            v-model="scope.row.checkDate"
            value-format="yyyy-MM-dd hh:mm:ss"
            type="datetime"
            placeholder="选择日期时间"
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
      <el-table-column
        label="操作"
        min-width="50"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            style="color: var(--ky-danger)"
            size="mini"
            @click="delUser(scope.row, scope.$index)"
          >
            删除
          </el-button>
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
