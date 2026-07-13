<script>
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import { saveBasic } from '@/http/specialEquipment/management-api'
import { recoverNotNull } from '@/utils/fmUtils'

export default {
  name: 'basicInfo',
  props: {
    /**
     * 所属记录
     */
    dataRecord: null,
    /**
     * 操作类型（新增：add；编辑：edit；查看：look）
     */
    opType: String,
    did: String,
  },
  data() {
    return {
      labelPosition: 'right',
      colWidth: 12,
      colItemWidth: 10,
      isLoading: false,
      equipmentTypeOptions: [],
      equipmentStatusOptions: [],
      workPostSelectedData: {
        id: '',
        postName: '',
      },
      inputForm: {
        id: '',
        companyId: '',
        companyName: '',
        departmentId: '',
        departmentName: '',
        workPostId: '',
        workPostName: '',
        equipmentType: '',
        equipmentName: '',
        equipmentModel: '',
        equipmentLocationCode: '',
        equipmentSerialNumber: '',
        equipmentAssetCode: '',
        equipmentInnerCode: '',
        equipmentRegisterCode: '',
        equipmentLife: '',
        equipmentLifeRange: '',
        equipmentLifeExpireDate: '',
        equipmentStatus: 1,
        equipmentRemark: '',
      },
      inputFormRule: {
        departmentId: [{ required: true, message: '所属部门不能为空', trigger: 'change' }],
        equipmentName: [{ required: true, message: '设备名称不能为空', trigger: 'blur' }],
        equipmentType: [{ required: true, message: '设备类型不能为空', trigger: 'change' }],
        equipmentSerialNumber: [{ required: true, message: '出厂编号不能为空', trigger: 'blur' }],
      },
      departmentList: [],
    }
  },
  watch: {
    dataRecord: {
      handler(d) {
        this.$nextTick(() => {
          recoverNotNull(this.inputForm, d)
          this.$emit('equipmentTypeChange', this.inputForm.equipmentType)
        })
      },
    },
  },
  created() {
    const me = this
    me.equipmentTypeOptions = me.$dictUtils.getDictList('special_equipment_type') || []
    me.equipmentStatusOptions = me.$dictUtils.getDictList('special_equipment_status') || []
    getDepartListSimple().then(({ data }) => {
      if (data.success) {
        me.departmentList = (data.result || []).filter((item) => {
          return item.departmentType === 'DEPARTMENT'
        })
      }
    })
  },
  methods: {
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
     * 所在岗位选择发生改变时的处理函数
     * @param value 当前选择的值
     */
    workPostChangeHandler(value) {
      this.inputForm.workPostName = value
    },
    /**
     * 设备类型选择发生改变时的处理函数
     * @param val 当前选中的值
     */
    equipmentTypeChangeHandler(val) {
      this.$emit('equipmentTypeChange', val)
    },
    /**
     * 保存按钮单击
     */
    saveClick() {
      const me = this
      me.$refs.inputForm.validate((valid) => {
        if (valid) {
          me.isLoading = true
          saveBasic(me.inputForm)
            .then((r) => {
              const res = r.data
              if (res.success) {
                me.$message.success(res.message)
                if (this.opType === 'add') {
                  this.$emit('update:did', res.result) // 提交成功之后，更新did，保存技术参数等时需要
                }
              }
              else {
                me.$message.warning(res.message)
              }
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
  },
}
</script>

<template>
  <div class="inputForm">
    <div class="special-equipment-title">
      基本信息
    </div>
    <el-form
      ref="inputForm"
      v-loading="isLoading"
      :model="inputForm"
      :label-position="labelPosition"
      label-width="150px"
      :rules="inputFormRule"
      :disabled="opType === 'look'"
    >
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="所属部门"
            prop="departmentId"
          >
            <el-col :span="colItemWidth">
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
            </el-col>
          </el-form-item>
        </el-col>

        <el-col :span="colWidth">
          <el-form-item
            label="设备区域"
            prop="workPostId"
          >
            <el-col :span="colItemWidth">
              <el-input
                v-model="inputForm.workPostId"
                placeholder="请填写"
                @input="workPostChangeHandler"
              />
            </el-col>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="设备名称"
            prop="equipmentName"
          >
            <el-col :span="colItemWidth">
              <el-input
                v-model="inputForm.equipmentName"
                placeholder="请填写"
              />
            </el-col>
          </el-form-item>
        </el-col>

        <el-col :span="colWidth">
          <el-form-item
            label="设备类型"
            prop="equipmentType"
          >
            <el-col :span="colItemWidth">
              <el-select
                v-model="inputForm.equipmentType"
                placeholder="请选择"
                @change="equipmentTypeChangeHandler"
              >
                <el-option
                  v-for="item in equipmentTypeOptions"
                  :key="item.id"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-col>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="出厂编号"
            prop="equipmentSerialNumber"
          >
            <el-col :span="colItemWidth">
              <el-input
                v-model="inputForm.equipmentSerialNumber"
                placeholder=""
              />
            </el-col>
          </el-form-item>
        </el-col>

        <el-col :span="colWidth">
          <el-form-item
            label="规格型号"
            prop="equipmentModel"
          >
            <el-col :span="colItemWidth">
              <el-input
                v-model="inputForm.equipmentModel"
                placeholder=""
              />
            </el-col>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="功能位置号"
            prop="equipmentLocationCode"
          >
            <el-col :span="colItemWidth">
              <el-input
                v-model="inputForm.equipmentLocationCode"
                placeholder=""
              />
            </el-col>
          </el-form-item>
        </el-col>

        <el-col :span="colWidth">
          <el-form-item
            label="资产号"
            prop="equipmentAssetCode"
          >
            <el-col :span="colItemWidth">
              <el-input
                v-model="inputForm.equipmentAssetCode"
                placeholder=""
              />
            </el-col>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="单位内部编号"
            prop="equipmentInnerCode"
          >
            <el-col :span="colItemWidth">
              <el-input
                v-model="inputForm.equipmentInnerCode"
                placeholder=""
              />
            </el-col>
          </el-form-item>
        </el-col>

        <el-col :span="colWidth">
          <el-form-item
            label="注册代码"
            prop="equipmentRegisterCode"
          >
            <el-col :span="colItemWidth">
              <el-input
                v-model="inputForm.equipmentRegisterCode"
                placeholder=""
              />
            </el-col>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="设计年限"
            prop="equipmentLife"
          >
            <el-col :span="colItemWidth">
              <el-input
                v-model="inputForm.equipmentLife"
                placeholder=""
              />
            </el-col>
          </el-form-item>
        </el-col>

        <el-col :span="colWidth">
          <el-form-item
            label="设计年限范围"
            prop="equipmentLifeRange"
          >
            <el-col :span="colItemWidth">
              <el-input
                v-model="inputForm.equipmentLifeRange"
                placeholder=""
              />
            </el-col>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="设计到期时间"
            prop="equipmentLifeExpireDate"
          >
            <el-col :span="colItemWidth">
              <el-date-picker
                v-model="inputForm.equipmentLifeExpireDate"
                type="date"
                placeholder=""
                value-format="yyyy-MM-dd"
                style="width: 100%"
              />
            </el-col>
          </el-form-item>
        </el-col>

        <el-col :span="colWidth">
          <el-form-item
            label="设备状态"
            prop="equipmentStatus"
          >
            <el-radio-group
              v-model="inputForm.equipmentStatus"
              style="width: 240px"
            >
              <el-radio-button
                v-for="item in equipmentStatusOptions"
                :key="item.id"
                :label="item.dictCode"
              >
                {{ item.dictName }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item
            label="备注"
            prop="equipmentRemark"
          >
            <el-col :span="18">
              <el-input
                v-model="inputForm.equipmentRemark"
                placeholder=""
                type="textarea"
                :rows="10"
                maxlength="20000"
                show-word-limit
                resize="none"
              />
            </el-col>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row v-show="opType !== 'look'">
        <el-col>
          <div style="text-align: right">
            <el-button
              type="primary"
              size="medium"
              @click="saveClick"
            >
              保存
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<style scoped>
.inputForm .el-select {
  width: 100%;
}
</style>
