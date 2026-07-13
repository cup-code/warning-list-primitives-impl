<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { chemistryListAdd } from '@/http/major-hazard/Anpi-chemical'
import {
  importFileByID,
  uploadFileList,
} from '@/http/occupationalHealth/sanitation-api'
import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api'
import FileUpload from '@/views/common-ui/FileUpload'

export default {
  name: 'chemicalListDia',
  components: { SelectTree, FileUpload },
  props: {
    Method: {
      type: String,
      default: '',
    },
    FromData: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    const editableFile = this.Method != 'view'
    return {
      isLoading: false,
      companyId: '',
      departList: [], // 所属部门list
      onlyDepartList: [], // 通过departmentType为'DEPARTMENT'，过滤出所有部门
      isSelect: [
        { value: 0, label: '否' },
        { value: 1, label: '是' },
      ],
      inputForm: {
        departmentIds: [],
        departmentNames: [],
        asName: '',
        cas: '',
        chemistryName: '',
        cn: '',
        contractor: '',
        englishName: '',
        isCountryControl: '',
        isDrug: '',
        isEnterpriseControl: '',
        isExplosive: '',
        isToxic: '',
        msdsDate: '',
        msdsVersion: '',
        remarks: '',
        stockNumber: 0,
        unit: '',
      },
      fileProp: {
        // 附件
        editable: editableFile,
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
      },
      temporaryFiles: {},
    }
  },
  mounted() {
    // 获取所属部门部门list：当前人公司的所有组织架构
    getAllDepartByCompanyFn(this.companyId).then(({ data }) => {
      this.departList = data.result || []
      this.onlyDepartList = this.departList.filter(item => item.departmentType === 'DEPARTMENT')
    })
  },
  created() {
    this.companyId = this.$store.state.user.user.companyId
    if (this.Method !== 'add') {
      this.getFileList(this.inputForm.id)
      Object.assign(this.inputForm, JSON.parse(JSON.stringify(this.FromData)))
      this.inputForm.isCountryControl
        ? (this.inputForm.isCountryControl = 1)
        : (this.inputForm.isCountryControl = 0)
      this.inputForm.isDrug ? (this.isDrug = 1) : (this.inputForm.isDrug = 0)
      this.inputForm.isEnterpriseControl
        ? (this.inputForm.isEnterpriseControl = 1)
        : (this.inputForm.isEnterpriseControl = 0)
      this.inputForm.isExplosive
        ? (this.inputForm.isExplosive = 1)
        : (this.inputForm.isExplosive = 0)
      this.inputForm.isToxic ? (this.inputForm.isToxic = 1) : (this.inputForm.isToxic = 0)
    }
    else {
    }
  },
  methods: {
    setApplyDepartment(id, title) {
      if (id) {
        this.inputForm.departmentIds = id.split(',')
        this.inputForm.departmentNames = title.split(',')
      }
      else {
        this.inputForm.departmentIds = []
        this.inputForm.departmentNames = []
      }
    },
    departFn(v) {
      const temp = this.onlyDepartList.filter((item) => {
        return v.includes(item.id)
      })
      this.inputForm.departmentNames = temp.map(item => item.departmentName)
    },
    /* 文件回调 */
    uploadEvt(fileList, fileType) {
      this.temporaryFiles[fileType] = fileList
    },
    /* 文件上传 */
    async uploadFile(type, id, file) {
      const upFileData = {
        files: file,
        entityId: id,
        businessName: 'majorHazard',
        categoryName: `${type}`,
      }
      this.isLoading = true
      const uploadFileResult = await uploadFileList(upFileData)
      if (!uploadFileResult.data.success) {
        this.$message.warning(data.message || '文件上传失败')
      }
    },
    // 获取文件回显信息
    async getFileList(entityId) {
      const getFileResult = await importFileByID(entityId)
      if (getFileResult.data.success) {
        this.fileProp.oldFileList = getFileResult.data.result
      }
      else {
        this.$message.warning(data.message || '查询文件失败')
      }
    },
    // 提交数据
    doSubmitPersonneDialog() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          if (this.temporaryFiles != undefined) {
            this.uploadFile(
              'chemicalListDia',
              this.inputForm.id,
              this.temporaryFiles.chemicalListDia,
            )
          }
          chemistryListAdd(this.inputForm)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('提交成功')
                this.closeClick(true)
              }
              else {
                this.$message.warning(data.message || '提交失败')
              }
            })
            .catch((err) => {
              this.$message.error('提交出错', err)
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
    /* 关闭弹窗 */
    closeClick(isRefresh) {
      this.$emit('DialogClose', isRefresh)
    },
  },
}
</script>

<template>
  <div>
    <el-form
      ref="inputForm"
      v-loading="isLoading"
      :model="inputForm"
      label-width="120px"
      :class="Method === 'view' ? 'readonly' : ''"
      :disabled="Method === 'view'"
      @submit.native.prevent
    >
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="危化品名称"
            prop="chemistryName"
            :rules="{
              required: true,
              message: '危化品名称不能为空',
              trigger: 'blur',
            }"
          >
            <el-input
              v-model="inputForm.chemistryName"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="CAS号"
            prop="cas"
            :rules="{
              required: true,
              message: 'CAS号不能为空',
              trigger: 'blur',
            }"
          >
            <el-input
              v-model="inputForm.cas"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="CN号"
            prop="cn"
            :rules="{
              required: true,
              message: 'CN号不能为空',
              trigger: 'blur',
            }"
          >
            <el-input
              v-model="inputForm.cn"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="英文名"
            prop="englishName"
          >
            <el-input
              v-model="inputForm.englishName"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="库存数量"
            prop="stockNumber"
            :rules="{
              required: true,
              message: '库存数量不能为空',
              trigger: 'blur',
            }"
          >
            <el-input
              v-model="inputForm.stockNumber"
              placeholder="请输入"
              clearable
              type="number"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="单位"
            prop="unit"
            :rules="{
              required: true,
              message: '单位不能为空',
              trigger: 'blur',
            }"
          >
            <el-input
              v-model="inputForm.unit"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="别名"
            prop="asName"
          >
            <el-input
              v-model="inputForm.asName"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="供应商"
            prop="contractor"
          >
            <el-input
              v-model="inputForm.contractor"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <div class="paragraph-title">
        <span class="paragraph-title-item" /> 关注焦点
      </div>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="是否剧毒"
            prop="isToxic"
            :rules="{
              required: true,
              message: '是否剧毒不能为空',
              trigger: 'change',
            }"
          >
            <el-radio-group v-model="inputForm.isToxic">
              <el-radio
                v-for="item in isSelect"
                :key="item.value"
                :label="item.value"
              >
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="是否易剧毒"
            prop="isDrug"
            :rules="{
              required: true,
              message: '是否易剧毒不能为空',
              trigger: 'change',
            }"
          >
            <el-radio-group v-model="inputForm.isDrug">
              <el-radio
                v-for="item in isSelect"
                :key="item.value"
                :label="item.value"
              >
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="是否易制爆"
            prop="isExplosive"
            :rules="{
              required: true,
              message: '是否易制爆不能为空',
              trigger: 'change',
            }"
          >
            <el-radio-group v-model="inputForm.isExplosive">
              <el-radio
                v-for="item in isSelect"
                :key="item.value"
                :label="item.value"
              >
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="是否国家重点监控"
            prop="isCountryControl"
            :rules="{
              required: true,
              message: '国家重点监控不能为空',
              trigger: 'change',
            }"
          >
            <el-radio-group v-model="inputForm.isCountryControl">
              <el-radio
                v-for="item in isSelect"
                :key="item.value"
                :label="item.value"
              >
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="是否企业重点监控"
            prop="isEnterpriseControl"
            :rules="{
              required: true,
              message: '企业重点监控不能为空',
              trigger: 'change',
            }"
          >
            <el-radio-group v-model="inputForm.isEnterpriseControl">
              <el-radio
                v-for="item in isSelect"
                :key="item.value"
                :label="item.value"
              >
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="公司内部门"
            prop="departmentIds"
            :rules="{
              required: true,
              message: '部门名称不能为空',
              trigger: 'blur',
            }"
          >
            <!-- <SelectTree
                            :props="{
                                value: 'id',             // ID字段名
                                label: 'departmentName', // 显示名称
                                children: 'children'    // 子级字段名
                                }"
                            :list="departList"
                            :value="inputForm.departmentIds? inputForm.departmentIds.toString() : ''"
                            :label="inputForm.departmentNames? inputForm.departmentNames.toString(): ''"
                            :clearable="true"
                            :accordion="true"
                            :showCheckbox="true"
                            @getValue="setApplyDepartment"
                        /> -->
            <el-select
              v-model="inputForm.departmentIds"
              multiple
              style="width: 100%"
              @change="departFn"
            >
              <el-option
                v-for="item in onlyDepartList"
                :key="item.id"
                :label="item.departmentName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="paragraph-title">
        <span class="paragraph-title-item" /> MSDS
      </div>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="MSDS版本"
            prop="msdsVersion"
          >
            <el-input
              v-model="inputForm.msdsVersion"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="MSDS发布日期"
            prop="msdsDate"
          >
            <el-date-picker
              v-model="inputForm.msdsDate"
              style="width: 192px"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="选择日期"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="MSDS文件"
            prop="temporaryFiles"
            style="width: 650px"
          >
            <FileUpload
              v-bind="fileProp"
              fileType="chemicalListDia"
              @upload="uploadEvt"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="备注"
            prop="remarks"
          >
            <el-input
              v-model="inputForm.remarks"
              type="textarea"
              :rows="4"
              placeholder="请填写"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="dialog-footer">
      <span style="float: right">
        <el-button @click="closeClick(false)">关闭</el-button>
        <el-button
          v-if="Method !== 'view'"
          v-noMoreClick
          type="primary"
          @click="doSubmitPersonneDialog()"
        >确定保存</el-button>
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.paragraph-title {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 15px;
  .paragraph-title-item {
    display: inline-block;
    content: '';
    margin: 0 10px 0 0;
    width: 4px;
    height: 20px;
    background-color: #409eff;
  }
}
</style>
