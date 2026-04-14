<script>
import { saveParams } from '@/http/specialEquipment/management-api'
import BoilerForm from '@/views/specialEquipment/management/components/form/boilerForm.vue'
import CraneForm from '@/views/specialEquipment/management/components/form/craneForm.vue'
import LiftForm from '@/views/specialEquipment/management/components/form/liftForm.vue'
import PressureVesselForm from '@/views/specialEquipment/management/components/form/pressureVesselForm.vue'
import SimplePressureVesselForm from '@/views/specialEquipment/management/components/form/simplePressureVesselForm.vue'
import SteamPipesForm from '@/views/specialEquipment/management/components/form/steamPipesForm.vue'
import VehicleForm from '@/views/specialEquipment/management/components/form/vehicleForm.vue'

export default {
  name: 'paramsInfo',
  components: {
    LiftForm,
    CraneForm,
    VehicleForm,
    BoilerForm,
    PressureVesselForm,
    SimplePressureVesselForm,
    SteamPipesForm,
  },
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
      isLoading: false,
      formActiveStatus: {
        isActive1: false,
        isActive2: false,
        isActive3: false,
        isActive4: false,
        isActive5: false,
        isActive6: false,
        isActive7: false,
      },
      inputForm: {
        id: '',
        equipmentParams: '',
      },
    }
  },
  watch: {
    did: {
      immediate: true,
      handler(val) {
        if (val) {
          this.inputForm.id = val
        }
      },
    },
  },
  methods: {
    /**
     * 激活设备类型对应的设备参数表单
     * @param v 当前设备类型值
     */
    activeEquipmentParamsForm(v) {
      const me = this
      for (const key in me.formActiveStatus) {
        me.formActiveStatus[key] = `isActive${v}` === key
      }
    },
    /**
     * 表单保存
     * @param formData 表单数据
     * @param formRef 表单对象
     */
    saveForm(formData, formRef) {
      const me = this
      formRef.validate((valid) => {
        if (valid) {
          me.isLoading = true
          me.inputForm.equipmentParams = formData
          saveParams(me.inputForm)
            .then((r) => {
              const res = r.data
              if (res.success) {
                me.$message.success(res.message)
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
  },
}
</script>

<template>
  <div>
    <div class="special-equipment-title">
      相关参数信息
    </div>
    <LiftForm
      v-show="formActiveStatus.isActive1"
      :data-record="dataRecord"
      :op-type="opType"
      :is-loading="isLoading"
      @formSubmit="saveForm"
    />
    <CraneForm
      v-show="formActiveStatus.isActive2"
      :data-record="dataRecord"
      :op-type="opType"
      :is-loading="isLoading"
      @formSubmit="saveForm"
    />
    <VehicleForm
      v-show="formActiveStatus.isActive3"
      :data-record="dataRecord"
      :op-type="opType"
      :is-loading="isLoading"
      @formSubmit="saveForm"
    />
    <BoilerForm
      v-show="formActiveStatus.isActive4"
      :data-record="dataRecord"
      :op-type="opType"
      :is-loading="isLoading"
      @formSubmit="saveForm"
    />
    <PressureVesselForm
      v-show="formActiveStatus.isActive5"
      :data-record="dataRecord"
      :op-type="opType"
      :is-loading="isLoading"
      @formSubmit="saveForm"
    />
    <SteamPipesForm
      v-show="formActiveStatus.isActive6"
      :data-record="dataRecord"
      :op-type="opType"
      :is-loading="isLoading"
      @formSubmit="saveForm"
    />
    <SimplePressureVesselForm
      v-show="formActiveStatus.isActive7"
      :data-record="dataRecord"
      :op-type="opType"
      :is-loading="isLoading"
      @formSubmit="saveForm"
    />
  </div>
</template>

<style scoped></style>
