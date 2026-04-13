<script>
import ImageSelect from '@/components/ImageSelect'
import { upLoadImg } from '@/http/manage-api'
import { getWeekRange } from '../../test/dateUtils'

export default {
  name: 'ReportForm',
  components: {
    ImageSelect,
  },
  props: {
    formData: {
      type: Object,
      required: true,
      default: () => ({
        reportTitle: '',
        reportSummary: '',
        showTable: false,
        wechat: '',
        phone: '',
        machineCount: '',
      }),
    },
  },
  data() {
    return {
      timeType: 1,
      dateRange: [],
      imageUrl: '',
    }
  },
  created() {
    this.getPrefix()
  },
  methods: {
    updateField(field, value) {
      this.$emit('update-field', { field, value })
    },
    handleReset() {
      this.$emit('reset')
    },
    handleExport() {
      this.$emit('export-pdf')
    },
    fileChangeEvt(file) {
      if (file) {
        upLoadImg(file, 'USER_ICON_PATH', false).then(({ data }) => {
          if (data.success) {
            this.imageUrl = data.result
            this.$emit('update-field', { field: 'wechat', value: data.result })
          }
          else {
            this.$message.warning(data.message || '上传失败')
          }
        })
      }
      else {
        this.$emit('update-field', { field: 'wechat', value: '' })
      }
    },

    handleDateTypeChange(value) {
      if (value === 'custom') {
        return
      }
      this.timeType = value
      const searchForm = getWeekRange(value, '')
      this.$emit('search', searchForm)
    },

    handleDateChange(value) {
      this.dateRange = value
      const searchForm = getWeekRange(this.timeType, value)
      this.$emit('search', searchForm)
    },
  },
}
</script>

<template>
  <div class="box-border px-2 py-3 w-1/3">
    <el-form :model="formData" label-position="left" label-width="80px">
      <el-form-item label="报告标题">
        <el-input
          :value="formData.reportTitle"
          placeholder="请输入报告标题"
          @input="updateField('reportTitle', $event)"
        />
      </el-form-item>
      <el-form-item label="总结">
        <el-input
          :value="formData.reportSummary"
          type="textarea"
          :rows="4"
          placeholder="请输入本周总结内容"
          @input="updateField('reportSummary', $event)"
        />
      </el-form-item>
      <el-form-item label="一体机数量">
        <el-input
          v-model="formData.machineCount"
          placeholder="请输入一体机数量"
          clearable
          @change="updateField('machineCount', $event)"
        />
      </el-form-item>
      <el-form-item label="表格显示">
        <el-checkbox
          :value="formData.showTable"
          @input="updateField('showTable', $event)"
        >
          显示详细表格
        </el-checkbox>
      </el-form-item>
      <el-form-item label="时间范围">
        <div class="date-filter">
          <el-radio-group v-model="timeType" @change="handleDateTypeChange">
            <el-radio-button :label="0">
              日
            </el-radio-button>
            <el-radio-button :label="1">
              周
            </el-radio-button>
            <el-radio-button :label="2">
              月
            </el-radio-button>
            <el-radio-button label="custom">
              自定义
            </el-radio-button>
          </el-radio-group>
        </div>
      </el-form-item>
      <el-form-item v-if="timeType === 'custom'">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 100%"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
          @change="handleDateChange"
        />
      </el-form-item>
      <el-form-item label="联系方式">
        <div>
          <div class="flex items-end">
            <ImageSelect
              :signUrl="imageUrl ? filePrefix + imageUrl : ''"
              showBtn
              width="100px"
              height="100px"
              @fileChange="fileChangeEvt"
            />

            <span class="text-xs text-gray-500 ml-2">上传企业微信二维码</span>
          </div>

          <el-input
            style="margin-top: 10px"
            :value="formData.phone"
            placeholder="请输入联系方式(电话号码)"
            @input="updateField('phone', $event)"
          />
        </div>
      </el-form-item>
      <el-form-item>
        <div class="py-3">
          <el-button @click="handleReset">
            重置
          </el-button>
          <el-button type="primary" @click="handleExport">
            导出PDF
          </el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>
