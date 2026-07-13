<script>
import { cloneDeep } from 'lodash'
import { addInspectionContentFn } from '@/http/dev_new/inspection-api'

export default {
  data() {
    return {
      title: '',
      visible: false,
      loading: false,
      method: '',
      inputForm: {
        id: '',
        inspectionPositionId: '', // 巡检部位id
        contentName: '', // 内容名称
        contentCode: '', // 内容编号
        contentCategory: '', // 内容分类
        dataType: '', // 数据类别
        dataOptionList: '', // 类型为单选时，为所有选项的label + des的数组；类型为数值时，为单个开闭区间表达式对应的编号value
        enable: true, // 是否启用
        inspectionBenchmark: '', // 基准
        inspectionModeList: [], // 巡检方法
        mustPhotograph: true, // 强拍
        abnormalMustPhotograph: true, // 异常强制拍照
        sortOrder: 0, // 排序
        normalA: 0, // 类型为数值时,正常值a
        normalB: 0, // 类型为数值时,正常值b
      },
      dataRule: {
        contentName: [{ required: true, message: '内容名称不能为空', trigger: 'blur' }],
        contentCode: [{ required: true, message: '内容编号不能为空', trigger: 'blur' }],
        contentCategory: [
          { required: true, message: '内容分类不能为空', trigger: 'change' },
        ],
        inspectionModeList: [
          { required: true, message: '巡检方法不能为空', trigger: 'change' },
        ],
        dataType: [{ required: true, message: '数据类别不能为空', trigger: 'change' }],
        dataOptionList: [
          { required: true, message: '区间类型不能为空', trigger: 'change' },
        ],
        normalA: [{ required: true, message: '正常值a不能为空', trigger: 'blur' }],
        normalB: [{ required: true, message: '正常值b不能为空', trigger: 'blur' }],
      },
      typeOptions: [
        {
          label: '单选',
          value: 'RADIO',
        },
        {
          label: '数值',
          value: 'NUMERICAL_INTERVAL',
        },
      ],
      expressionOptions: [
        {
          label: 'a>x',
          value: '1',
        },
        {
          label: 'a≥x',
          value: '2',
        },
        {
          label: 'a<x',
          value: '3',
        },
        {
          label: 'a≤x',
          value: '4',
        },
        {
          label: '[a,b]',
          value: '5',
        },
        {
          label: '(a,b]',
          value: '6',
        },
        {
          label: '[a,b)',
          value: '7',
        },
        {
          label: '(a,b)',
          value: '8',
        },
      ],
      radioList: [
        {
          label: 'A、',
          des: '',
        },
        {
          label: 'B、',
          des: '',
        },
      ],
      normalVal: 'A、', // 类型为单选时，选中的正常项
    }
  },
  methods: {
    init(method, obj) {
      this.method = method
      this.visible = true
      if (method === 'add') {
        this.title = '新增巡检内容'
        this.inputForm.id = '' // 新增时要置空
        this.inputForm.inspectionPositionId = obj.partId // 新增时赋值部位id
        this.radioList = [
          {
            label: 'A、',
            des: '',
          },
          {
            label: 'B、',
            des: '',
          },
        ] // 新增时单选的选项初始化
        this.normalVal = 'A、'
      }
      else if (method === 'edit') {
        this.title = '编辑巡检内容'
      }
      else if (method === 'view') {
        this.title = '查看巡检内容'
      }
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        if (method !== 'add') {
          const cloneObj = cloneDeep(obj)
          if (cloneObj.dataType === 'NUMERICAL_INTERVAL') {
            // 如果是数值类型的，需把后台传的值，转为前端显示的值
            cloneObj.dataOptionList = cloneObj.dataOptionList[0]
            cloneObj.normalA = cloneObj.dataVlaueList[0]
            cloneObj.normalB = cloneObj.dataVlaueList[1] || 0
          }
          else {
            // 如果是单选类型的，需把dataOptionList转为radioList的格式
            this.radioList = []
            cloneObj.dataOptionList.forEach((item) => {
              this.radioList.push({
                label: `${item.split('、')[0]}、`,
                des: item.split('、')[1],
              })
            })
            // 设置正常选择的值
            this.normalVal = `${cloneObj.dataVlaueList[0].split('、')[0]}、`
          }
          this.inputForm = this.recover(this.inputForm, cloneObj)
        }
      })
    },
    // 类型为单选时，添加选项按钮
    addRadioOption() {
      const length = this.radioList.length
      let label = ''
      switch (length) {
        case 2:
          label = 'C、'
          break
        case 3:
          label = 'D、'
          break
        case 4:
          label = 'E、'
          break
        case 5:
          label = 'F、'
          break
        default:
          break
      }
      this.radioList.push({
        label,
        des: '',
      })
    },
    // 类型为单选时，删除选项按钮
    deleteRadioOption() {
      this.radioList.pop()
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          // 需改造为后台需要的格式
          const cloneForm = cloneDeep(this.inputForm)
          if (cloneForm.dataType === 'RADIO') {
            // 先判断每个选项的des不为空
            const isAllHasDes = this.radioList.every(item => item.des)
            if (!isAllHasDes) {
              this.$message.error('选项请输入描述')
              return
            }
            // 所有的选项转为['', '']格式
            cloneForm.dataOptionList = this.radioList.map((item) => {
              return item.label + item.des
            })
            // 正常的选项转为['']格式
            const normalOption = this.radioList.filter((item) => {
              return item.label === this.normalVal
            })
            cloneForm.dataVlaueList = normalOption.map((item) => {
              return item.label + item.des
            })
          }
          else if (cloneForm.dataType === 'NUMERICAL_INTERVAL') {
            // 为数值区间表达式对应的编号，后台接收的是个数组
            cloneForm.dataOptionList = [cloneForm.dataOptionList]
            if (
              this.inputForm.dataOptionList == '5'
              || this.inputForm.dataOptionList == '6'
              || this.inputForm.dataOptionList == '7'
              || this.inputForm.dataOptionList == '8'
            ) {
              if (this.inputForm.normalA > this.inputForm.normalB) {
                this.$message.error('b需大于a')
                return
              }
              cloneForm.dataVlaueList = [this.inputForm.normalA, this.inputForm.normalB]
            }
            else {
              cloneForm.dataVlaueList = [this.inputForm.normalA]
            }
          }
          delete cloneForm.normalA
          delete cloneForm.normalB
          this.loading = true
          addInspectionContentFn(cloneForm).then(({ data }) => {
            this.loading = false
            if (data && data.success) {
              this.$message.success(data.message)
              this.visible = false
              this.$emit('refreshDataList')
            }
            else {
              this.$message.error(data.message || '提交失败')
            }
          })
        }
      })
    },
  },
}
</script>

<template>
  <div>
    <el-dialog
      :title="title"
      :close-on-click-modal="false"
      width="500px"
      :visible.sync="visible"
      class="inspection-content-form normal-dialog"
    >
      <el-form
        ref="inputForm"
        v-loading="loading"
        :model="inputForm"
        :rules="dataRule"
        label-width="100px"
        :disabled="method === 'view'"
        @submit.native.prevent
      >
        <el-form-item label="内容名称" prop="contentName">
          <el-input v-model="inputForm.contentName" />
        </el-form-item>
        <el-form-item label="内容编号" prop="contentCode">
          <el-input v-model="inputForm.contentCode" />
        </el-form-item>
        <el-form-item label="内容分类" prop="contentCategory">
          <el-select
            v-model="inputForm.contentCategory"
            placeholder="请选择"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="item in $dictUtils.getDictList('content_category')"
              :key="item.dictCode"
              :label="item.dictName"
              :value="item.dictCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="是否启用" prop="enable">
          <el-radio-group v-model="inputForm.enable">
            <el-radio-button :label="true">
              是
            </el-radio-button>
            <el-radio-button :label="false">
              否
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="巡检方法" prop="inspectionModeList">
          <el-checkbox-group v-model="inputForm.inspectionModeList">
            <el-checkbox
              v-for="item in $dictUtils.getDictList('inspection_methods')"
              :key="item.dictCode"
              :label="item.dictCode"
            >
              {{ item.dictName }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="巡检基准" prop="inspectionBenchmark">
          <el-input
            v-model="inputForm.inspectionBenchmark"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </el-form-item>
        <el-form-item label="数据类别" prop="dataType">
          <el-select
            v-model="inputForm.dataType"
            placeholder="请选择"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <!-- 数据类别为 单选显示 -->
        <el-form-item
          v-if="inputForm.dataType === 'RADIO'"
          class="option-item"
          label="选项"
        >
          <!-- 最多可设置6个选项 -->
          <el-button
            type="primary"
            icon="el-icon-plus"
            :disabled="radioList.length === 6"
            @click="addRadioOption"
          >
            添加选项
          </el-button>
          <el-radio-group v-model="normalVal" size="mini">
            <el-row
              v-for="(item, index) in radioList"
              :key="item.label"
              style="margin-top: 6px"
            >
              <el-col :span="19">
                <el-radio :label="item.label">
                  {{ item.label }}
                  <el-input v-model="item.des" placeholder="请输入选项" />
                </el-radio>
              </el-col>
              <el-col :offset="1" :span="4">
                <!-- 只有选项多于2项时，只能删除最后一个选项 -->
                <el-button
                  v-show="index === radioList.length - 1 && radioList.length > 2"
                  type="danger"
                  icon="el-icon-minus"
                  @click="deleteRadioOption"
                />
              </el-col>
            </el-row>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="inputForm.dataType === 'NUMERICAL_INTERVAL'"
          label="区间类型"
          prop="dataOptionList"
        >
          <el-select
            v-model="inputForm.dataOptionList"
            placeholder="请选择"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="item in expressionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="inputForm.dataType === 'NUMERICAL_INTERVAL'"
          label="正常值a"
          prop="normalA"
        >
          <el-input-number
            v-model="inputForm.normalA"
            :step="1"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item
          v-if="
            inputForm.dataType === 'NUMERICAL_INTERVAL'
              && (inputForm.dataOptionList == '5'
                || inputForm.dataOptionList == '6'
                || inputForm.dataOptionList == '7'
                || inputForm.dataOptionList == '8')
          "
          label="正常值b"
          prop="normalB"
        >
          <el-input-number
            v-model="inputForm.normalB"
            :step="1"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="强拍" prop="mustPhotograph">
          <el-radio-group v-model="inputForm.mustPhotograph">
            <el-radio-button :label="true">
              是
            </el-radio-button>
            <el-radio-button :label="false">
              否
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="异常强拍" prop="abnormalMustPhotograph">
          <el-radio-group v-model="inputForm.abnormalMustPhotograph">
            <el-radio-button :label="true">
              是
            </el-radio-button>
            <el-radio-button :label="false">
              否
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序号" prop="sortOrder">
          <el-input-number
            v-model="inputForm.sortOrder"
            :step="1"
            controls-position="right"
            :min="0"
            label="排序号"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="visible = false">关闭</el-button>
        <el-button
          v-if="method != 'view'"
          size="small"
          type="primary"
          :loading="loading"
          @click="doSubmit()"
        >确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.inspection-content-form ::v-deep {
  .el-radio-group {
    width: 100%;
  }
}
</style>
