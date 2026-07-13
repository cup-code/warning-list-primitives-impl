<script>
import GenJavaPropertyForm from './GenJavaPropertyForm'

export default {
  components: {
    GenJavaPropertyForm,
  },
  data() {
    return {
      drawer: false,
      direction: 'rtl',
      row: '',
      type: 1,
      javaType: '',
      dialogTableVisible: false,
      javaFields: [],
      dataListSelections: [],
      gridForm: {
        fieldLabels: '',
        fieldKeys: '',
        searchLabel: '',
        searchKey: '',
      },
      rules: {
        fieldLabels: [
          {
            required: true,
            message: '请输入JAVA属性标签',
            trigger: 'blur',
          },
        ],
        fieldKeys: [
          {
            required: true,
            message: '请输入JAVA属性名称',
            trigger: 'blur',
          },
        ],
        searchLabel: [
          {
            required: true,
            message: '请输入检索标签',
            trigger: 'blur',
          },
        ],
        searchKey: [
          {
            required: true,
            message: '请输入检索key',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  watch: {
    'gridForm.fieldLabels': function gridFormFieldLabels(value) {
      this.row.fieldLabels = value
    },
    'gridForm.fieldKeys': function gridFormFieldKeys(value) {
      this.row.fieldKeys = value
      if (!this.row.javaField.includes('|')) {
        this.row.javaField = `${this.row.javaField}|${this.row.fieldKeys.split('|')[0]}`
      }
    },
    'gridForm.searchLabel': function gridFormSearchLabel(value) {
      this.row.searchLabel = value
    },
    'gridForm.searchKey': function gridFormSearchKey(value) {
      this.row.searchKey = value
    },
  },
  methods: {
    init(row) {
      this.row = row
      this.javaType = row.javaType
      this.drawer = true
      this.$nextTick(() => {
        this.$refs.gridForm.resetFields()
        this.gridForm = this.recover(this.gridForm, row)
      })
    },
    showGenJavaPropertyForm(type) {
      this.type = type
      if (type === 1) {
        this.$refs.genJavaPropertyForm.init(
          {
            javaType: this.javaType,
            javaField: `.${this.gridForm.fieldKeys}`,
          },
          3,
        )
      }
      else {
        this.$refs.genJavaPropertyForm.init(
          {
            javaType: this.javaType,
            javaField: `.${this.gridForm.searchKey}`,
          },
          3,
        )
      }
    },
    getJavaFieldNames(value) {
      if (this.type === 1) {
        this.gridForm.fieldKeys = value
      }
      else {
        this.gridForm.searchKey = value
      }
    },
    getJavaFieldLabels(value) {
      if (this.type === 1) {
        this.gridForm.fieldLabels = value
      }
      else {
        this.gridForm.searchLabel = value
      }
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val
    },
  },
}
</script>

<template>
  <el-drawer
    title="自定义Grid对象配置"
    :visible.sync="drawer"
    append-to-body
    :direction="direction"
  >
    <el-form
      ref="gridForm"
      size="small"
      :model="gridForm"
      label-width="120px"
      style="padding: 10px"
      status-icon
      :rules="rules"
      @submit.native.prevent
    >
      <el-form-item
        label="JAVA属性标签"
        prop="fieldLabels"
      >
        <el-input
          v-model="gridForm.fieldLabels"
          placeholder="例如：名字|年龄|备注"
          clearable
        >
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="showGenJavaPropertyForm(1)"
          />
        </el-input>
      </el-form-item>
      <el-form-item
        label="JAVA属性名称"
        prop="fieldKeys"
      >
        <el-input
          v-model="gridForm.fieldKeys"
          placeholder="例如：name|age|remarks"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="检索标签"
        prop="searchLabel"
      >
        <el-input
          v-model="gridForm.searchLabel"
          placeholder="例如：名字|年龄"
          clearable
        >
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="showGenJavaPropertyForm(2)"
          />
        </el-input>
      </el-form-item>
      <el-form-item
        label="检索key"
        prop="searchKey"
      >
        <el-input
          v-model="gridForm.searchKey"
          placeholder="例如：name|age"
          clearable
        />
      </el-form-item>
    </el-form>
    <gen-java-property-form
      ref="genJavaPropertyForm"
      @getJavaFieldLabels="getJavaFieldLabels"
      @getJavaFieldNames="getJavaFieldNames"
    />
  </el-drawer>
</template>
