<script>
import {
  threeTimeRiskWasteOutputById,
  threeTimeRiskWasteOutputSave,
  threeTimeRiskWasteOutputUpdate,
} from '@/http/pro-env/time3danger-api.js'

export default {
  props: {
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
      default: null,
    },
    // 带过来的数据
    shareData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      loadingDialog: false,
      // 新增/修改数据
      changeData: {},
      wasteType: [], // 固废类型下拉列表
      wasteName: [], // 固废名称下拉列表
      keepDeptList: [], // 贮存部门下拉列表
      keepPersonList: [], // 贮存经办人下拉列表
      transferPersonList: [], // 运送经办人下拉列表
    }
  },
  created() {
    this.getInfoData()
    const dicList = JSON.parse(sessionStorage.getItem('dictList'))
    this.wasteType = dicList.waste_type
    this.wasteName = dicList.waste_name
    this.keepDeptList = dicList.keep_dept
    this.keepPersonList = dicList.keep_person
    this.transferPersonList = dicList.transfer_person
    if (this.shareData.type) {
      this.changeData.type = this.shareData.type
      this.changeData.name = this.shareData.name
      this.changeData.keepingDept = this.shareData.keepingDept
      this.changeData.keepingPerson = this.shareData.keepingPerson
    }
  },
  methods: {
    /* 初始化固废信息 */
    getInfoData() {
      // 新增
      if (this.isNew) {
        this.changeData = { outTime: new Date().getTime() }
        if (this.infoId) {
          this.changeData.id = this.infoId
        }
      }
      // 修改或查看
      else {
        this.loadingDialog = true
        threeTimeRiskWasteOutputById(this.infoId)
          .then((res) => {
            if (res.data.success) {
              this.changeData = res.data.result
              this.changeData.outTime = new Date(this.changeData.outTime).getTime()
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
      this.$refs.dangerForm.validate((valid) => {
        if (valid) {
          let saveFunc = threeTimeRiskWasteOutputSave
          if (!this.isNew) {
            saveFunc = threeTimeRiskWasteOutputUpdate
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
      this.$emit('succ', isRefresh)
    },
  },
}
</script>

<template>
  <div
    v-loading="loadingDialog"
    class="danger-bg"
  >
    <el-form
      ref="dangerForm"
      :model="changeData"
      label-width="100px"
      style="width: 750px"
      inline
      :disabled="!editable"
    >
      <el-form-item
        label="危废分类"
        prop="type"
        :rules="{
          required: true,
          message: '请选择危废分类',
          trigger: 'change',
        }"
      >
        <el-select
          v-model="changeData.type"
          style="width: 250px"
          :disabled="!!shareData.type"
        >
          <el-option
            v-for="item in wasteType"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="危废名称"
        prop="name"
        :rules="{
          required: true,
          message: '请选择危废名称',
          trigger: 'change',
        }"
      >
        <el-select
          v-model="changeData.name"
          style="width: 250px"
          :disabled="!!shareData.type"
        >
          <el-option
            v-for="item in wasteName"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="出库数量"
        prop="num"
        :rules="{ required: true, message: '请填写出库数量', trigger: 'blur' }"
      >
        <el-input
          v-model="changeData.num"
          style="width: 250px"
          type="number"
        />
      </el-form-item>
      <el-form-item
        label="单位"
        prop="unit"
        :rules="{ required: true, message: '请填写单位', trigger: 'blur' }"
      >
        <el-input
          v-model="changeData.unit"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="贮存部门"
        prop="keepingDept"
        :rules="{
          required: true,
          message: '请选择贮存部门',
          trigger: 'change',
        }"
      >
        <el-select
          v-model="changeData.keepingDept"
          style="width: 250px"
          :disabled="!!shareData.type"
        >
          <el-option
            v-for="item in keepDeptList"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="贮存经办人"
        prop="keepingPerson"
        :rules="{
          required: true,
          message: '请选择贮存经办人',
          trigger: 'change',
        }"
      >
        <el-select
          v-model="changeData.keepingPerson"
          style="width: 250px"
          :disabled="!!shareData.type"
        >
          <el-option
            v-for="item in keepPersonList"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="运送经办人"
        prop="transportPerson"
        :rules="{
          required: true,
          message: '请选择运送经办人',
          trigger: 'change',
        }"
      >
        <el-select
          v-model="changeData.transportPerson"
          style="width: 250px"
        >
          <el-option
            v-for="item in transferPersonList"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="危废去向"
        prop="whereabouts"
        :rules="{ required: true, message: '请填写危废去向', trigger: 'blur' }"
      >
        <el-input
          v-model="changeData.whereabouts"
          style="width: 610px"
        />
      </el-form-item>
      <el-form-item
        label="出库日期"
        prop="outTime"
        :rules="{ required: true, message: '请选出库日期', trigger: 'change' }"
      >
        <el-date-picker
          v-model="changeData.outTime"
          type="date"
          value-format="timestamp"
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
