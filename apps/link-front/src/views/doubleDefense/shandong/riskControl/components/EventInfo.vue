<script>
import { getAccTypeListAll } from '@/http/defense/accType-api.js'
import { getRiskEventById, riskEventSave } from '@/http/defense/shandong/riskControl-api.js'
import {
  getDataByLEC,
  getDataByLS,
  LEC_C,
  LEC_E,
  LEC_L,
  LS_L,
  LS_S,
} from '@/views/doubleDefense/common/constant'
import { EvaMethod, RiskLevel } from '@/views/doubleDefense/shandong/config/constant.js'
import EventData from '../classData/eventData'

export default {
  props: {
    // 是否可编辑
    editable: {
      type: Boolean,
      default: true,
    },
    // 详情id
    infoId: {
      type: [Number, String],
      default: null,
    },
    // 所有风险分析单元
    unitList: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      allDic: {}, // 字典信息
      EvaMethod, // 风险评价方法列表
      RiskLevel, // 风险等级下拉列表
      LS_L, // 发生性下拉列表
      LS_S, // 严重性下拉列表
      LEC_L, // 可能性下拉列表
      LEC_E, // 频繁程度下拉列表
      LEC_C, // 产生后果下拉列表
      isLoading: false,
      changeData: new EventData(), // 编辑的数据
      accTypeList: [], // 所有事故类型
      label01: '',
      label02: '',
    }
  },
  async created() {
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    const accRes = await getAccTypeListAll()
    this.accTypeList = accRes.data.result || []
    if (this.infoId) {
      this.getInfoData()
    }
  },
  methods: {
    /* 获取详情数据 */
    getInfoData() {
      this.isLoading = true
      getRiskEventById(this.infoId)
        .then((res) => {
          if (res.data.success) {
            this.changeData = new EventData(res.data.result)
            if (this.changeData.eventInfo.evaluationMethod != 1) {
              this.getRiskLevel()
            }
          }
          else {
            this.$message.warning(res.data.message || '获取详情失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取详情出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    // 获取风险单元类型，不同类型展示不同label
    getUnitType(id) {
      const typeId = (
        this.unitList.find((item) => {
          return item.id === id
        }) || {}
      ).extInfo
      const typeName = this.$dictUtils.getDictLabelById('analysis_type', typeId)
      this.label01 = typeName === '作业活动' ? '作业步骤' : '检查项目'
      this.label02 = typeName === '作业活动' ? '危险源或潜在事件' : '标准'
    },
    methodChangeEvt() {
      this.changeData.eventInfo.riskLevel = ''
      this.changeData.ls_l = ''
      this.changeData.ls_s = ''
      this.changeData.lec_l = ''
      this.changeData.lec_e = ''
      this.changeData.lec_c = ''
      this.getRiskLevel()
    },
    /* 获取风险等级 */
    getRiskLevel() {
      let param = {}
      switch (Number.parseInt(this.changeData.eventInfo.evaluationMethod)) {
        case 1: // 直接判定法
          this.changeData.eventInfo.riskLevel = ''
          break
        case 2: // LS判定法
          param = getDataByLS(this.changeData.ls_l * this.changeData.ls_s)
          this.changeData.eventInfo.riskLevel = param.value
          break
        case 3: // LEC判定法
          param = getDataByLEC(
            this.changeData.lec_l * this.changeData.lec_e * this.changeData.lec_c,
          )
          this.changeData.risk_val = Number(
            (this.changeData.lec_l * this.changeData.lec_e * this.changeData.lec_c).toFixed(2),
          )
          this.changeData.eventInfo.riskLevel = param.value
          this.getControlHierarchy(this.changeData.eventInfo.riskLevel)
          break
        default:
          console.log('风险评价类型错误', this.changeData.eventInfo.evaluationMethod)
      }
    },
    // 根据风险等级自动匹配管控层级
    getControlHierarchy(val) {
      let controlHierarchy = ''
      switch (val) {
        case 0:
          controlHierarchy = '4'
          break
        case 1:
          controlHierarchy = '3'
          break
        case 2:
          controlHierarchy = '2'
          break
        case 3:
          controlHierarchy = '1'
          break
      }
      this.changeData.eventInfo.controlHierarchy = controlHierarchy
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.eventForm.validate((valid) => {
        if (valid) {
          if (!this.infoId) {
            delete this.changeData.id
          }
          this.isLoading = true
          const params = this.changeData.getReqData()
          // 保存的时候给后台传可能导致的事故name
          params.accidentTypeNames = params.accidentTypeIds.map((item) => {
            return (
              this.accTypeList.find((accItem) => {
                return accItem.id === item
              }) || {}
            ).accidentTypeName
          })
          riskEventSave(params)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('保存成功')
                this.$emit('close', true)
              }
              else {
                this.$message.warning(res.data.message || '保存失败')
              }
            })
            .catch((err) => {
              this.$message.error('保存出错', err)
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
  },
}
</script>

<template>
  <div
    v-loading="isLoading"
    style="height: 100%"
  >
    <div class="dialog-info">
      <el-form
        ref="eventForm"
        :model="changeData"
        label-width="100px"
        :disabled="!editable"
      >
        <el-form-item
          label="分析单元"
          prop="eventInfo.analysisUnitId"
          :rules="{
            required: true,
            message: '请选择分析单元',
            trigger: 'change',
          }"
        >
          <el-select
            v-model="changeData.eventInfo.analysisUnitId"
            clearable
            class="comp-box"
            filterable
            @change="getUnitType"
          >
            <el-option
              v-for="item in unitList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="label01"
          :label="label01"
          prop="eventInfo.eventName"
          :rules="{
            required: true,
            message: '请填写风险事件',
            trigger: 'blur',
          }"
        >
          <el-input
            v-model="changeData.eventInfo.eventName"
            class="comp-box"
          />
        </el-form-item>
        <el-form-item
          v-if="label02"
          :label="label02"
          prop="eventInfo.eventDesc"
          :rules="[{ required: true, message: '请填写风险描述', trigger: 'blur' }]"
        >
          <el-input
            v-model="changeData.eventInfo.eventDesc"
            type="textarea"
            resize="none"
            :rows="3"
            class="comp-box"
          />
        </el-form-item>
        <!-- <el-form-item label="检查标准">
          <el-input type="textarea" resize="none" :rows="3" v-model="changeData.eventInfo.checkCriteria" class="comp-box" />
        </el-form-item> -->
        <el-form-item
          label="可能导致事故"
          prop="accidentTypeIds"
          :rules="{
            required: true,
            message: '请选择可能导致事故',
            trigger: 'change',
          }"
        >
          <el-checkbox-group v-model="changeData.accidentTypeIds">
            <el-checkbox
              v-for="item in accTypeList"
              :key="item.id"
              :label="item.id"
            >
              {{ item.accidentTypeName }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item
          label=""
          prop="eventInfo.evaluationMethod"
          :rules="{
            required: editable,
            message: '请选择风险评价方法',
            trigger: 'change',
          }"
        >
          <el-radio-group
            v-model="changeData.eventInfo.evaluationMethod"
            @change="methodChangeEvt"
          >
            <el-radio-button
              v-for="item in EvaMethod"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <!-- LS -->
        <el-form-item
          v-if="changeData.eventInfo.evaluationMethod == 2"
          label="发生性"
          prop="ls_l"
          :rules="{ required: editable, message: '请选择', trigger: 'change' }"
        >
          <el-select
            v-model="changeData.ls_l"
            class="comp-box"
            @change="getRiskLevel"
          >
            <el-option
              v-for="item in LS_L"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="changeData.eventInfo.evaluationMethod == 2"
          label="严重性"
          prop="ls_s"
          :rules="{ required: editable, message: '请选择', trigger: 'change' }"
        >
          <el-select
            v-model="changeData.ls_s"
            class="comp-box"
            @change="getRiskLevel"
          >
            <el-option
              v-for="item in LS_S"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <!-- LEC -->
        <el-form-item
          v-if="changeData.eventInfo.evaluationMethod == 3"
          label="可能性(L)"
          prop="lec_l"
          :rules="{ required: editable, message: '请选择', trigger: 'change' }"
        >
          <el-select
            v-model="changeData.lec_l"
            class="comp-box"
            @change="getRiskLevel"
          >
            <el-option
              v-for="item in LEC_L"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="changeData.eventInfo.evaluationMethod == 3"
          label="程度(E)"
          prop="lec_e"
          :rules="{ required: editable, message: '请选择', trigger: 'change' }"
        >
          <el-select
            v-model="changeData.lec_e"
            class="comp-box"
            @change="getRiskLevel"
          >
            <el-option
              v-for="item in LEC_E"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="changeData.eventInfo.evaluationMethod == 3"
          label="严重性(C)"
          prop="lec_c"
          :rules="{ required: editable, message: '请选择', trigger: 'change' }"
        >
          <el-select
            v-model="changeData.lec_c"
            class="comp-box"
            @change="getRiskLevel"
          >
            <el-option
              v-for="item in LEC_C"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="changeData.eventInfo.evaluationMethod == 3"
          label="风险值"
          prop="risk_val"
        >
          <el-input
            v-model="changeData.risk_val"
            class="comp-box"
            disabled
          />
        </el-form-item>
        <el-form-item
          label="风险等级"
          prop="eventInfo.riskLevel"
          :rules="{
            required: editable && changeData.eventInfo.evaluationMethod == 1,
            message: '请选择风险等级',
            trigger: 'change',
          }"
        >
          <el-select
            v-model="changeData.eventInfo.riskLevel"
            :disabled="changeData.eventInfo.evaluationMethod != 1"
            class="comp-box"
            @change="getControlHierarchy"
          >
            <el-option
              v-for="item in RiskLevel"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="管控措施">
          <el-table
            :data="changeData.controlMeasures"
            style="width: 100%"
          >
            <el-table-column
              type="index"
              label="序号"
              width="50"
              align="center"
            />
            <el-table-column
              prop="controlMeasuresType"
              label="管控措施类别"
              align="center"
            >
              <template slot-scope="scope">
                <span>{{
                  $dictUtils.getDictLabelById('measure_main', scope.row.controlMeasuresMainType)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="管控措施"
              align="center"
            >
              <template slot-scope="scope">
                <el-input v-model="scope.row.controlMeasuresDesc" />
              </template>
            </el-table-column>
            <el-table-column
              label="隐患排查内容"
              align="center"
            >
              <template slot-scope="scope">
                <el-input v-model="scope.row.checkContent" />
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item
          label="管控层级"
          prop="eventInfo.controlHierarchy"
          :rules="{
            required: true,
            message: '请选择管控层级',
            trigger: 'change',
          }"
        >
          <el-select
            v-model="changeData.eventInfo.controlHierarchy"
            filterable
            class="comp-box"
            disabled
          >
            <el-option
              v-for="item in $dictUtils.getDictList('control_level')"
              v-if="item.dictCode != '5'"
              :key="item.id"
              :label="item.dictName"
              :value="item.dictCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="建议管控措施">
          <el-input
            v-model="changeData.eventInfo.suggestedImprovementMeasures"
            type="textarea"
            resize="none"
            :rows="3"
            class="comp-box"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="changeData.eventInfo.remark"
            type="textarea"
            resize="none"
            :rows="3"
            class="comp-box"
          />
        </el-form-item>
      </el-form>
    </div>
    <div class="dialog-footer">
      <el-button
        size="medium"
        type="primary"
        plain
        @click="cancelClick"
      >
        取消
      </el-button>
      <el-button
        v-if="editable"
        size="medium"
        type="primary"
        @click="submitClick"
      >
        确认保存
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.comp-box {
  width: calc(100% - 50px);
}
</style>
