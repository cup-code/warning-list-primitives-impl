<script>
import { CriticalityByNameAdd, getCriticalityByNameByPage } from '@/http/major-hazard/Anpi-chemical'

export default {
  name: 'criticalityByNameDia',
  components: {},
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
    const validate = function (rule, value, callback) {
      const num = Number(value)
      if (/^\+?(\d+).?(\d+)$/.test(num) == false) {
        callback(new Error('请输入仅一位小数的正数'))
      }
      else {
        callback()
      }
    }
    return {
      isLoading: false,
      chemistryList: [],
      quantityRules: [
        { required: true, message: '临界值', trigger: 'blur' },
        { validator: validate, trigger: 'blur' },
      ],
      inputForm: {
        chemistryName: '',
        asName: '',
        cas: '',
        id: '',
        quantity: '',
      },
    }
  },
  created() {
    this.getChemistryList()
    if (this.Method !== 'add') {
      Object.assign(this.inputForm, JSON.parse(JSON.stringify(this.FromData)))
    }
    else {
    }
  },
  methods: {
    getChemistryList() {
      this.isLoading = true
      const searchData = {
        pageNum: 1,
        pageSize: 10,
        isPage: false,
        isQuantity: false,
        toxicityName: '',
      }
      getCriticalityByNameByPage(searchData)
        .then(({ data }) => {
          if (data.success) {
            this.total = data.result.total
            this.chemistryList = data.result.list || []
          }
          else {
            this.$message.warning(data.message || '获取列表数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表数据出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    selectEven(id) {
      const tar = this.chemistryList.find(item => item.id == id)
      if (tar) {
        this.inputForm.id = tar.id
        this.inputForm.asName = tar.asName
        this.inputForm.cas = tar.cas
      }
      else {
        this.inputForm.id = ''
        this.inputForm.asName = ''
        this.inputForm.cas = ''
      }
    },
    // 提交数据
    doSubmitPersonneDialog() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          this.inputForm.quantity = Number(this.inputForm.quantity)
          CriticalityByNameAdd(this.inputForm)
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
      :inline="true"
      :model="inputForm"
      label-width="120px"
      :class="Method === 'view' ? 'readonly' : ''"
      :disabled="Method === 'view'"
      @submit.native.prevent
    >
      <el-form-item
        label="危化品名称"
        prop="chemistryName"
        :rules="{
          required: true,
          message: '危化品名称不能为空',
          trigger: 'blur',
        }"
      >
        <el-select
          v-model="inputForm.chemistryName"
          class="small-row"
          placeholder="请选择"
          clearable
          @change="selectEven"
        >
          <el-option
            v-for="item in chemistryList"
            :key="item.id"
            :value="item.id"
            :label="item.chemistryName"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="别名"
        prop="asName"
      >
        <el-input
          v-model="inputForm.asName"
          class="small-row"
          placeholder="请选择危化品名称"
          disabled
        />
      </el-form-item>
      <el-form-item
        label="CAS号"
        prop="cas"
      >
        <el-input
          v-model="inputForm.cas"
          class="small-row"
          placeholder="请选择危化品名称"
          disabled
        />
      </el-form-item>
      <el-form-item
        label="临界值/t"
        prop="quantity"
        :rules="quantityRules"
      >
        <el-input
          v-model="inputForm.quantity"
          class="small-row"
          placeholder="请输入"
          clearable
          type="number"
        />
      </el-form-item>
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
.small-row {
  width: 192px;
}

.big-row {
  width: 515px;
}

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
