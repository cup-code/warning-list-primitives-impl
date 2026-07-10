<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import { saveEquipmentRecord } from '@/http/equipment/records-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'

export default {
  name: 'equipmentRecordsForm',
  components: {
    TreeSelect,
  },
  props: {
    /**
     * 设备类型数据
     */
    equipmentTypeData: {
      type: Array,
      default: [],
    },
    /**
     * 联锁类型数据
     */
    interlockTypeData: {
      type: Array,
      default: [],
    },
    /**
     * 所属记录
     */
    dataRecord: Object,
    /**
     * 操作类型
     */
    opType: String,
  },
  data() {
    return {
      labelPosition: 'right',
      colWidth: 12,
      colItemWidth: 12,
      processingPowerVisible: false,
      equipmentTypeSelected: {},
      inputForm: {
        id: '',
        companyId: '',
        departmentId: '',
        departmentName: '',
        workPostId: '',
        workPostName: '',
        equipmentName: '',
        equipmentType: '',
        equipmentUniqueCode: '',
        equipmentModel: '',
        interlockType: '0',
        processingPower: '',
        factoryName: '',
        remark: '',
      },
      inputFormRule: {
        departmentId: [{ required: true, message: '责任部门不能为空', trigger: 'change' }],
        equipmentName: [{ required: true, message: '设备名称不能为空', trigger: 'blur' }],
        equipmentType: [{ required: true, message: '设备类型不能为空', trigger: 'change' }],
      },
      departmentList: [],
    }
  },
  watch: {
    dataRecord: {
      handler(v) {
        const me = this
        this.$nextTick(() => {
          if (v) {
            me.init()
          }
        })
      },
      immediate: true,
    },
  },
  created() {
    getDepartListSimple().then(({ data }) => {
      if (data.success) {
        this.departmentList = (data.result || []).filter((item) => {
          return item.departmentType === 'DEPARTMENT'
        })
      }
    })
  },
  methods: {
    /**
     * 初始化
     */
    init() {
      const me = this
      me.$refs.inputForm.resetFields()
      me.inputForm.id = ''
      if (Object.keys(me.dataRecord).length > 0) {
        Object.assign(me.inputForm, me.dataRecord)
        me.inputForm.workPostId = me.inputForm.workPostName
      }
    },
    /**
     * 保存
     * @param successCallback 保存成功后回调
     */
    save(successCallback) {
      const me = this
      me.$refs.inputForm.validate((valid) => {
        if (valid) {
          me.isLoading = true
          saveEquipmentRecord(me.inputForm)
            .then((r) => {
              const res = r.data
              if (res.success) {
                me.$message.success(res.message)
                if (typeof successCallback === 'function') {
                  successCallback.call(me)
                }
                return
              }
              me.$message.warning(res.message)
            })
            .catch((e) => {
              me.$message.error(`保存异常：${e}`)
            })
            .finally(() => {
              me.isLoading = false
            })
        }
      })
    },
    /**
     * 所属部门下拉列选择完成回调
     * @param id 部门编号
     * @param name 部门名称
     * @param item 选中项
     */
    departmentSelectedCallback(id) {
      const currentDepart
        = this.departmentList.find((item) => {
          return item.id === id
        }) || {}
      const me = this
      me.inputForm.departmentId = currentDepart.id
      me.inputForm.departmentName = currentDepart.departmentName
      me.inputForm.companyId = currentDepart.companyId
    },
    /**
     * 所在岗位选项改变时的处理函数
     * @param val 当前选择的值
     */
    workPostChangeHandler(val) {
      this.inputForm.workPostName = val
    },
    /**
     * 设备类型选项改变时的处理函数
     * @param val 当前选择的值
     */
    equipmentTypeChangeHandler(val) {
      if (val === '1') {
        this.inputForm.processingPower = ''
      }
    },
  },
}
</script>

<template>
  <div class="wrapper">
    <el-form
      ref="inputForm"
      :model="inputForm"
      :rules="inputFormRule"
      :label-position="labelPosition"
      label-width="150px"
      :disabled="opType === 'look'"
    >
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="责任部门"
            prop="departmentId"
          >
            <el-select
              v-model="inputForm.departmentId"
              placeholder="请选择"
              filterable
              style="width: 100%"
              @change="departmentSelectedCallback"
            >
              <el-option
                v-for="item in departmentList"
                :key="item.id"
                :label="item.departmentName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="设备区域"
            prop="workPostId"
          >
            <el-input
              v-model="inputForm.workPostId"
              placeholder="请填写"
              @input="workPostChangeHandler"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="设备名称"
            prop="equipmentName"
          >
            <el-input v-model="inputForm.equipmentName" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="设备类型"
            prop="equipmentType"
          >
            <el-select
              v-model="inputForm.equipmentType"
              style="width: 100%"
              filterable
              placeholder="请选择"
              @change="equipmentTypeChangeHandler"
            >
              <el-option
                v-for="item in equipmentTypeData"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="出厂编号"
            prop="equipmentUniqueCode"
          >
            <el-input v-model="inputForm.equipmentUniqueCode" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="设备型号"
            prop="equipmentModel"
          >
            <el-input v-model="inputForm.equipmentModel" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="联锁类型"
            prop="interlockType"
          >
            <el-radio-group v-model="inputForm.interlockType">
              <el-radio-button
                v-for="item in interlockTypeData"
                :key="item.id"
                :label="item.dictCode"
              >
                {{ item.dictName }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            v-if="'1' === inputForm.equipmentType"
            label="处理能力"
            prop="processingPower"
          >
            <el-input v-model="inputForm.processingPower" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item
            label="生产厂家"
            prop="factoryName"
          >
            <el-input v-model="inputForm.factoryName" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item
            label="备注"
            prop="remark"
          >
            <el-input
              v-model="inputForm.remark"
              type="textarea"
              :rows="5"
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<style scoped></style>
