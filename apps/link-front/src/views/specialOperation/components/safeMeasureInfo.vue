<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import { safeMeasureSave } from '@/http/specialOperation/safeControl-api.js'

export default {
  components: {
    TreeSelect,
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
      isLoading: false,
      allDic: {}, // 字典信息
      changeData: {}, // 编辑的数据
    }
  },
  computed: {},
  created() {
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.getInfoData()
  },
  methods: {
    /* 获取详情数据 */
    getInfoData() {
      // 查看或修改
      if (this.info.id) {
        this.changeData = this.info
        this.changeData.applySite = this.info.applySite.split(',')
        // 对作业类型进行翻译
        for (const i in this.allDic.specialWork_workType) {
          if (this.changeData.jobTypeId === this.allDic.specialWork_workType[i].id) {
            this.changeData.jobTypeName = this.allDic.specialWork_workType[i].dictName
          }
        }
      }
      // 新增
      else {
        this.changeData = {
          companyId: '',
          companyName: '',
        }
      }
    },
    /* 部门下拉列表选择回调 */
    depChangeEvt(id, name) {
      this.changeData.companyId = id || ''
      this.changeData.companyName = name || ''
      this.$refs.treeSelect.closeSelect()
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    handleChange(e) {
      this.changeData.sort = e
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.areaForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          this.changeData.applySite = this.changeData.applySite.join(',')
          safeMeasureSave(this.changeData)
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
  <!-- 分析单元详情 -->
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
        label="所属公司"
        prop="companyId"
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
        label="作业类型"
        prop="jobTypeCode"
        :rules="{ required: true, message: '请选择类型', trigger: 'change' }"
      >
        <el-select
          v-model="changeData.jobTypeCode"
          filterable
          clearable
          style="width: 250px"
        >
          <el-option
            v-for="item in allDic.specialWork_workType"
            :key="item.id"
            :label="item.dictName"
            :value="item.dictCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="适用场所"
        prop="applySite"
        :rules="{ required: true, message: '请选择适用场所', trigger: 'blur' }"
      >
        <el-select
          v-model="changeData.applySite"
          filterable
          clearable
          style="width: 250px"
          :multiple="true"
        >
          <el-option
            v-for="item in allDic.place_application_list"
            :key="item.id"
            :label="item.dictName"
            :value="item.dictName"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="类别"
        prop="type"
        :rules="{ required: true, message: '请选择类别', trigger: 'blur' }"
      >
        <el-select
          v-model="changeData.type"
          filterable
          clearable
          style="width: 250px"
        >
          <el-option
            v-for="item in allDic.security_type"
            :key="item.id"
            :label="item.dictName"
            :value="item.dictName"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="序号"
        prop="sort"
        :rules="{ required: true, message: '请选择序号', trigger: 'blur' }"
      >
        <el-input-number
          v-model="changeData.sort"
          controls-position="right"
          :min="0"
          @change="handleChange"
        />
      </el-form-item>
      <el-form-item
        label="措施内容"
        prop="measureContent"
        :rules="{
          required: true,
          message: '请填写措施内容',
          trigger: 'change',
        }"
      >
        <el-input
          v-model="changeData.measureContent"
          type="textarea"
          :rows="4"
          resize="none"
          style="width: 610px"
        />
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remarks"
      >
        <el-input
          v-model="changeData.remarks"
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
</style>
