<script>
import {
  emProficientAdd,
  emProficientGetById,
  emProficientUpdate,
} from '@/http/emergency/emsource-api.js'

export default {
  props: {
    // 所属公司树数据
    companyData: {
      type: Array,
      default() {
        return []
      },
    },
    companyId: {
      type: String,
      default: '',
    },
    companyName: {
      type: String,
      default: '',
    },
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
      default: '',
    },
  },
  data() {
    return {
      loadingDialog: false,
      // classify 0专家 1队员
      changeData: {
        companyId: '',
        companyName: '',
        classify: 0,
      },
      eduTypeList: [],
      tableData: [],
    }
  },
  created() {
    const dictList = JSON.parse(sessionStorage.getItem('dictList'))
    this.eduTypeList = dictList ? dictList.education : []
    this.getInfoData()
  },
  methods: {
    /* 所属公司下拉列表点击 */
    companyTreeNodeTap(data) {
      this.changeData.companyId = data.id
      this.changeData.companyName = data.companyName
      this.$refs.tableTypeSelect.blur()
    },
    /* 点击清空公司下拉列表 */
    clearClick() {
      this.changeData.companyName = ''
      this.changeData.companyId = ''
    },
    /* 初始化信息 */
    getInfoData() {
      // 新增
      if (this.isNew) {
        this.changeData.classify = 0
        this.changeData.companyId = this.companyId
        this.changeData.companyName = this.companyName
      }
      // 修改或查看
      else {
        this.loadingDialog = true
        emProficientGetById(this.infoId)
          .then((res) => {
            if (res.data.success) {
              this.changeData = res.data.result
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
      this.$refs.profForm.validate((valid) => {
        if (valid) {
          let saveFunc = emProficientUpdate
          if (this.isNew) {
            saveFunc = emProficientAdd
          }
          this.loadingDialog = true
          saveFunc(this.changeData)
            .then((res) => {
              if (res.data.success) {
                this.$message.success(res.data.message || '保存成功！')
                this.closeClick(true)
              }
              else {
                this.$message.warning(res.data.message || '保存失败')
              }
            })
            .catch((err) => {
              this.$message.error('保存出错！', err)
            })
            .finally(() => {
              this.loadingDialog = false
            })
        }
      })
    },
    /* 关闭弹窗 */
    closeClick(isRefresh = false) {
      this.$emit('succ', isRefresh)
    },
  },
}
</script>

<template>
  <div
    v-loading="loadingDialog"
    class="prof-info"
  >
    <el-form
      ref="profForm"
      :model="changeData"
      label-width="100px"
      style="width: 750px"
      inline
      :disabled="!editable"
    >
      <el-form-item
        label="所属公司"
        prop="companyId"
        :rules="{
          required: true,
          message: '请选择所属公司',
          trigger: 'change',
        }"
      >
        <el-select
          ref="tableTypeSelect"
          v-model="changeData.companyId"
          class="header-item-data"
          clearable
          style="width: 250px"
          @clear="clearClick"
        >
          <el-option
            :value="changeData.companyId"
            :label="changeData.companyName"
          >
            <el-tree
              :data="companyData"
              :props="{ children: 'childrenCompany', label: 'companyName' }"
              highlight-current
              :expand-on-click-node="false"
              node-key="id"
              check-strictly
              @node-click="companyTreeNodeTap"
            />
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="专家姓名"
        prop="fullName"
        :rules="{ required: true, message: '请填写专家姓名', trigger: 'blur' }"
      >
        <el-input
          v-model="changeData.fullName"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="专家电话"
        prop="phone"
        :rules="{ required: true, message: '请填写专家电话', trigger: 'blur' }"
      >
        <el-input
          v-model="changeData.phone"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="专业领域"
        prop="professionTerritory"
        :rules="{ required: true, message: '请填写专业领域', trigger: 'blur' }"
      >
        <el-input
          v-model="changeData.professionTerritory"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item label="学历">
        <el-select
          v-model="changeData.education"
          filterable
          clearable
          style="width: 250px"
        >
          <el-option
            v-for="item in eduTypeList"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="专业"
        prop="profession"
      >
        <el-input
          v-model="changeData.profession"
          style="width: 610px"
        />
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="changeData.remark"
          type="textarea"
          resize="none"
          :rows="4"
          style="width: 610px"
        />
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 20px 0 0"
        type="primary"
        plain
        @click="closeClick"
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
