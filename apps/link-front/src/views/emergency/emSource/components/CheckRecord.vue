<script>
import {
  emSupplyRecordAdd,
  emSupplyRecordGetById,
  emSupplyRecordUpdate,
} from '@/http/emergency/emsource-api.js'

export default {
  props: {
    // 保存完毕是否需要刷新列表
    isRefresh: {
      type: Boolean,
      default: false,
    },
    // 物品类别
    wplb: {
      type: String,
      default: '',
    },
    // 详细类别
    xxfl: {
      type: String,
      default: '',
    },
    pmdw: {
      type: String,
      default: '',
    },
    // 是否新创建
    isNew: {
      type: Boolean,
      default: true,
    },
    // 详情id
    infoId: {
      type: [String, Number],
      default: '',
    },
    recordId: {
      type: [String, Number],
      default: '',
    },
  },
  data() {
    return {
      loadingDialog: false,
      // 新增/修改数据
      changeData: {},
    }
  },
  created() {
    this.getInfoData()
    const dicList = JSON.parse(sessionStorage.getItem('dictList'))
    this.wasteType = dicList.waste_type
    this.wasteName = dicList.waste_name
    this.productUnit = dicList.organization_type
    this.personList = dicList.responsible
  },
  methods: {
    /* 初始化信息 */
    getInfoData() {
      // 新增
      if (this.isNew) {
        this.changeData = { jcsj: new Date().getTime(), byid: this.infoId }
      }
      // 修改或查看
      else {
        this.loadingDialog = true
        emSupplyRecordGetById(this.recordId)
          .then((res) => {
            if (res.data.success) {
              this.changeData = res.data.result
              this.changeData.id = this.recordId
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
    /* 确认保存 */
    saveChangeClick() {
      this.$refs.recordForm.validate((valid) => {
        if (valid) {
          let saveFunc = emSupplyRecordAdd
          if (!this.isNew) {
            saveFunc = emSupplyRecordUpdate
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
      const refresh = isRefresh && this.isRefresh
      this.$emit('succ', refresh)
    },
  },
}
</script>

<template>
  <div
    v-loading="loadingDialog"
    class="record-bg"
  >
    <el-form
      ref="recordForm"
      :model="changeData"
      label-width="100px"
      inline
    >
      <el-form-item label="物品类型">
        <el-input
          v-model="wplb"
          disabled
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item label="详细类别">
        <el-input
          v-model="xxfl"
          disabled
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item label="品名及单位">
        <el-input
          v-model="pmdw"
          style="width: 610px"
          disabled
        />
      </el-form-item>
      <el-form-item
        label="检查人"
        prop="jcr"
        :rules="{ required: true, message: '请填写检查人', trigger: 'blur' }"
      >
        <el-input
          v-model="changeData.jcr"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="检查时间"
        prop="jcsj"
        :rules="{
          required: true,
          message: '请选择检查时间',
          trigger: 'change',
        }"
      >
        <el-date-picker
          v-model="changeData.jcsj"
          type="date"
          value-format="timestamp"
          placeholder="选择检查时间"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="备注"
        prop="bz"
        :rules="{ required: true, message: '请填写备注', trigger: 'blur' }"
      >
        <el-input
          v-model="changeData.bz"
          type="textarea"
          :rows="4"
          resize="none"
          style="width: 610px"
        />
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button
        size="medium"
        plain
        type="primary"
        style="margin: 0 20px 0 0"
        :disabled="loadingDialog"
        @click="closeClick(false)"
      >
        取消
      </el-button>
      <el-button
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
