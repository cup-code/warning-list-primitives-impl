<script>
import {
  threeTimeRiskWasteTransferById,
  threeTimeRiskWasteTransferSave,
  threeTimeRiskWasteTransferUpdate,
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
      wasteType: [], // 类型下拉列表
      wasteName: [], // 名称下拉列表
      prodDeptList: [], // 产生单位下拉列表
      keepDeptList: [], // 贮存单位下拉列表
      prodPersonList: [], // 产生经办人下拉列表
      keepPersonList: [], // 贮存经办人下拉列表
    }
  },
  created() {
    this.getInfoData()
    const dicList = JSON.parse(sessionStorage.getItem('dictList'))
    this.wasteType = dicList.waste_type
    this.wasteName = dicList.waste_name
    this.prodDeptList = dicList.prod_dept
    this.keepDeptList = dicList.keep_dept
    this.prodPersonList = dicList.prod_person
    this.keepPersonList = dicList.keep_person
    if (this.shareData.type) {
      this.changeData.type = this.shareData.type
      this.changeData.name = this.shareData.name
      this.changeData.produceDept = this.shareData.produceDept
      this.changeData.dutyPerson = this.shareData.dutyPerson
    }
  },
  methods: {
    /* 初始化信息 */
    getInfoData() {
      // 新增
      if (this.isNew) {
        this.changeData = { transferTime: new Date().getTime() }
        if (this.infoId) {
          this.changeData.id = this.infoId
        }
      }
      // 修改或查看
      else {
        this.loadingDialog = true
        threeTimeRiskWasteTransferById(this.infoId)
          .then((res) => {
            if (res.data.success) {
              this.changeData = res.data.result
              this.changeData.transferTime = new Date(this.changeData.transferTime).getTime()
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
          let saveFunc = threeTimeRiskWasteTransferSave
          if (!this.isNew) {
            saveFunc = threeTimeRiskWasteTransferUpdate
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
          message: '请选择废物分类',
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
          message: '请选择废物名称',
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
        label="数量"
        prop="num"
        :rules="{ required: true, message: '请填写数量', trigger: 'blur' }"
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
        label="产生部门"
        prop="produceDept"
        :rules="{
          required: true,
          message: '请选择产生部门',
          trigger: 'change',
        }"
      >
        <el-select
          v-model="changeData.produceDept"
          style="width: 250px"
          :disabled="!!shareData.type"
        >
          <el-option
            v-for="item in prodDeptList"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="产生经办人"
        prop="dutyPerson"
        :rules="{
          required: true,
          message: '请选择产生经办人',
          trigger: 'change',
        }"
      >
        <el-select
          v-model="changeData.dutyPerson"
          style="width: 250px"
          :disabled="!!shareData.type"
        >
          <el-option
            v-for="item in prodPersonList"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
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
        label="去向"
        prop="whereabouts"
        :rules="{ required: true, message: '请填写去向', trigger: 'blur' }"
      >
        <el-input
          v-model="changeData.whereabouts"
          style="width: 610px"
        />
      </el-form-item>
      <el-form-item
        label="转移日期"
        prop="transferTime"
        :rules="{ required: true, message: '请选转移日期', trigger: 'change' }"
      >
        <el-date-picker
          v-model="changeData.transferTime"
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
