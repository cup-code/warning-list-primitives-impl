<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import { getCompanyById } from '@/http/GeneralQuery.js'
import { addSafetyCost } from '@/http/safetyInvestment/safety-api.js'
import { commonFileGetByEntityId } from '@/http/user-api.js'
import FileUpload from '@/views/common-ui/FileUpload.vue'

export default {
  components: {
    TreeSelect,
    FileUpload,
  },
  props: {
    // 是否可编辑
    editable: {
      type: Boolean,
      default: true,
    },
    // 详情数据
    info: {
      type: Object,
      default() {
        return {}
      },
    },
    // 所属公司树数据
    companyData: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      accept: ['image/png', 'image/jpg', 'image/jpeg'],
      isLoading: false,
      allDic: {}, // 字典信息
      changeData: [], // 编辑的数据
      fileProp: {
        editable: this.editable,
        accept: ['image/png', 'image/jpg', 'image/jpeg'],
        noticMsg: 'png/jpg/jpeg',
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
      },
      infoItem: [], // 存储部门对象
      peopleItem: [],
    }
  },
  created() {
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.getInfoData()
    this.getFiles()
  },
  methods: {
    companyItem(id) {
      getCompanyById(id)
        .then((res) => {
          if (res.data.success) {
            this.infoItem = res.data.result
            for (let i = 0, len = this.infoItem.length; i < len; i++) {
              const item = this.infoItem[i]
              if (item.id == id) {
                return item.departmentName
              }
            }
          }
          else {
            this.$message.warning(res.data.message || '获取列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表出错', err)
        })
    },
    /* 获取详情数据 */
    getInfoData() {
      // 查看或修改
      if (this.info.id) {
        this.changeData = this.info
        this.changeData.costYear = this.changeData.costYear.toString()
        this.companyItem(this.info.companyId)
      }
      // 新增
      else {
        this.changeData = {
          companyId: '',
          companyName: '',
        }
      }
    },
    /* 获取详情附件 */
    getFiles() {
      if (this.info.id) {
        this.isLoading = true
        commonFileGetByEntityId(this.info.id)
          .then((res) => {
            if (res.data.success) {
              this.fileProp.oldFileList = res.data.result
              // this.$message.success('获取附件成功')
            }
            else {
              this.$message.warning(res.data.message || '获取附件失败')
            }
          })
          .catch((err) => {
            this.$message.error('获取附件出错', err)
          })
          .finally(() => {
            this.isLoading = false
          })
      }
    },
    /* 下拉列表选择回调 */
    depChangeEvt(id, name) {
      this.changeData.companyId = id || ''
      this.changeData.companyName = name || ''
      this.$refs.treeSelect.closeSelect()
      this.companyItem(id)
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 上传事件 */
    uploadEvt(fileList) {
      this.changeData.files = fileList
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.areaForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          addSafetyCost(this.changeData)
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
  <!-- 安全投入计划详情 -->
  <div v-loading="isLoading">
    <el-form
      ref="areaForm"
      :model="changeData"
      label-width="100px"
      style="width: 750px"
      inline
      :disabled="!editable"
    >
      <el-form-item
        label="公司"
        prop="companyName"
        :rules="[{ required: true, message: '请选择公司', trigger: 'change' }]"
      >
        <TreeSelect
          ref="treeSelect"
          style="width: 250px"
          :data="companyData"
          :props="{
            value: 'id',
            label: 'companyName',
            children: 'childrenCompany',
          }"
          :value="changeData.companyId"
          :label="changeData.companyName"
          @getValue="depChangeEvt"
        />
      </el-form-item>
      <el-form-item
        label="年份"
        prop="costYear"
        :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
      >
        <el-date-picker
          v-model="changeData.costYear"
          type="year"
          placeholder="选择年"
          value-format="yyyy"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="物料描述"
        prop="costDetails"
        :rules="{ required: true, message: '请选择', trigger: 'change' }"
      >
        <el-input
          v-model="changeData.costDetails"
          style="width: 610px"
        />
      </el-form-item>
      <el-form-item
        label="数量"
        prop="costAmount"
        :rules="[{ required: true, message: '请填写', trigger: 'change' }]"
      >
        <el-input
          v-model="changeData.costAmount"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="投入资金"
        prop="investmentFunds"
        :rules="[{ required: true, message: '请填写', trigger: 'change' }]"
      >
        <el-input
          v-model="changeData.investmentFunds"
          style="width: 250px"
        />元
      </el-form-item>
      <el-form-item
        label="凭证类"
        prop="voucherType"
        :rules="[{ required: true, message: '请填写', trigger: 'change' }]"
      >
        <el-input
          v-model="changeData.voucherType"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="使用对象"
        prop="usingObjectsName"
        :rules="{
          required: true,
          message: '请选择类型',
          trigger: 'change,blur',
        }"
      >
        <el-select
          v-model="changeData.usingObjectsName"
          clearable
          style="width: 250px"
          filterable
        >
          <el-option
            v-for="item in infoItem"
            :key="item.id"
            :label="item.departmentName"
            :value="item.departmentName"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="过账时间"
        prop="postingDate"
        :rules="[{ required: true, message: '请填写', trigger: 'blur' }]"
      >
        <el-date-picker
          v-model="changeData.postingDate"
          type="date"
          placeholder="选择日期"
          value-format="yyyy-MM-dd"
          format="yyyy-MM-dd"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="changeData.remark"
          type="textarea"
          :rows="4"
          resize="none"
          style="width: 610px"
        />
      </el-form-item>
      <el-form-item
        label="附件"
        prop="files"
      >
        <FileUpload
          v-bind="fileProp"
          @upload="uploadEvt"
        />
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 20px 0 0"
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
.tips-box {
  width: 710px;
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
  border: 1px solid #e6a23c;
  border-radius: 5px;
  padding: 5px;
  font-size: 14px;
  i {
    margin: 0 10px 0 0;
  }
}
// 上传文件
.file-upload {
  margin: 5px 0 0 0;
  .el-upload {
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .el-upload:hover {
    border-color: #409eff;
  }
  .upload-img {
    display: block;
    width: 100px;
    height: 100px;
  }
  .upload-icon {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
  }
}
</style>
