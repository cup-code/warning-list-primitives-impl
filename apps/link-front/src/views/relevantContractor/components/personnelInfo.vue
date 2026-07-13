<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import { contractorPersonSave, getPersonnerById } from '@/http/relevantContractor/personner-api.js'
import { getAppointedContractor } from '@/http/relevantContractor/qualificationInfo-api.js'
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
    infoId: {
      type: [String, Number],
      default: null,
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
      isLoading: false,
      changeData: {}, // 修改/新增的数据
      showContractorName: [], // 存储承包商名
      searchData: {
        pageSize: 9999,
        pageNum: 1,
        companyId: '',
      },
    }
  },
  created() {
    this.getInfoData()
  },
  methods: {
    /* 获取详情数据 */
    getInfoData() {
      // 查看或修改
      if (this.infoId) {
        getPersonnerById(this.infoId)
          .then((res) => {
            if (res.data.success) {
              this.changeData = res.data.result
              this.searchData.companyId = res.data.result.companyId
              this.getContractorList()
            }
            else {
              this.$message.warning(res.data.message || '获取列表失败')
            }
          })
          .catch((err) => {
            this.$message.error('获取列表出错', err)
          })
          .finally(() => {
            this.isLoading = false
          })
      }
      // 新增
      else {
        this.changeData = {
          companyId: '',
          companyName: '',
          departmentId: '',
          sex: '男',
        }
      }
    },
    /* 下拉列表选择回调 */
    companyChangeEvt(id, name) {
      this.changeData.companyId = id || ''
      this.changeData.companyName = name || ''
      if (this.changeData.companyId) {
        this.searchData.companyId = id
        this.changeData.departmentId = ''
        this.getContractorList()
      }
      this.$refs.treeSelect.closeSelect()
    },
    /* 获取承包商列表 */
    getContractorList() {
      getAppointedContractor(this.changeData.companyId)
        .then((res) => {
          if (res.data.success) {
            this.showContractorName = res.data.result
          }
          else {
            this.$message.warning(res.data.message || '获取承包商数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取承包商数据出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.personForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          contractorPersonSave(this.changeData)
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
    // input输入type为number的时候框禁止滚动加减
    stopScroll(evt) {
      evt = evt || window.event
      if (evt.preventDefault) {
        // Firefox
        evt.preventDefault()
        evt.stopPropagation()
      }
      else {
        // IE
        evt.cancelBubble = true
        evt.returnValue = false
      }
      return false
    },
  },
}
</script>

<template>
  <div v-loading="isLoading">
    <el-form
      ref="personForm"
      :model="changeData"
      label-width="120px"
      style="width: 800px"
      inline
      :disabled="!editable"
    >
      <el-form-item
        label="公司"
        prop="companyId"
        :rules="[{ required: true, message: '请选择承包商', trigger: 'change' }]"
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
          @getValue="companyChangeEvt"
        />
      </el-form-item>
      <el-form-item
        label="承包商名称"
        prop="departmentId"
        :rules="[{ required: true, message: '请填写', trigger: 'change' }]"
      >
        <el-select
          v-model="changeData.departmentId"
          clearable
          style="width: 250px"
        >
          <el-option
            v-for="item in showContractorName"
            :key="item.id"
            :label="item.contractorName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="人员名称"
        prop="fullName"
        :rules="[{ required: true, message: '请填写', trigger: 'blur' }]"
      >
        <el-input
          v-model="changeData.fullName"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="性别"
        prop="sex"
        :rules="[{ required: true, message: '请填写', trigger: 'change' }]"
      >
        <el-radio-group
          v-model="changeData.sex"
          style="width: 250px"
        >
          <el-radio-button label="男" />
          <el-radio-button label="女" />
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="联系电话"
        prop="mobile"
        :rules="[{ required: true, message: '请填写', trigger: 'blur' }]"
      >
        <el-input
          v-model="changeData.mobile"
          type="number"
          style="width: 250px"
          @wheel.native.prevent="stopScroll($event)"
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

<style>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
</style>
