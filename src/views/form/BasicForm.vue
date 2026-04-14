<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'

export default {
  components: {
    SelectTree,
  },
  data() {
    return {
      title: '',
      method: '',
      visible: false,
      loading: false,
      dataSourceTree: [],
      dataTable: [],
      oldCode: '',
      oldTableName: '',
      inputForm: {
        id: '',
        code: '',
        autoCreate: '1',
        dataSource: {
          id: 'master',
          name: '本地数据库',
          enName: 'master',
          dbType: '',
        },
        name: '',
        tableName: '',
        remarks: '',
      },
    }
  },
  watch: {
    'inputForm.dataSource.id': {
      handler(newVal) {
        this.$http({
          url: `/form/make/getTableList?dataSource.enName=${this.inputForm.dataSource.enName}`,
          method: 'get',
        }).then(({ data }) => {
          this.dataTable = data.rows
        })
      },
      immediate: true,
      deep: false,
    },
    dataTable(val) {
      if (this.inputForm.autoCreate === '0') {
        const list = val.filter((table) => {
          return table.name === this.inputForm.tableName
        })
        if (list.length === 0) {
          this.inputForm.tableName = ''
        }
      }
    },
  },
  methods: {
    init(method, id) {
      this.method = method
      this.inputForm.id = id
      if (method === 'add') {
        this.title = `新建表单`
      }
      else if (method === 'edit') {
        this.title = '修改表单'
      }
      else if (method === 'view') {
        this.title = '查看表单'
      }
      this.$http.get(`/database/datalink/dataSource/treeData2`).then(({ data }) => {
        this.dataSourceTree = data.treeData
      })
      this.visible = true
      this.loading = false
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        if (method === 'edit' || method === 'view') {
          // 修改或者查看
          this.loading = true
          this.$http({
            url: `/form/make/queryById?id=${this.inputForm.id}`,
            method: 'get',
          }).then(({ data }) => {
            this.inputForm = this.recover(this.inputForm, data.form)
            this.oldCode = this.inputForm.code
            this.oldTableName = this.inputForm.tableName
            this.loading = false
          })
        }
      })
    },
    changeAutoCreate() {
      this.inputForm.tableName = ''
    },
    createTableName() {
      this.inputForm.tableName = `ky_form_${new Date().getTime()}`
    },
    validateNoExist(rule, value, callback) {
      if (this.method === 'edit' && this.inputForm.code === this.oldCode) {
        callback()
      }
      this.$http.get(`/form/make/validateKey?key=${value}`).then(({ data }) => {
        if (data.noExist) {
          callback()
        }
        else {
          callback(new Error('表单key已经存在'))
        }
      })
    },
    validateTableExist(rule, value, callback) {
      if (this.method === 'edit' && this.inputForm.tableName === this.oldTableName) {
        callback()
      }
      this.$http
        .get(
          `/form/make/validateTableExist?name=${value}&dataSource.enName=${this.inputForm.dataSource.enName}`,
        )
        .then(({ data }) => {
          if (data.noExist) {
            callback()
          }
          else {
            callback(new Error('表在数据库中已经存在'))
          }
        })
    },
    validateValid(rule, value, callback) {
      // if (value && !/^[A-Za-z]+[A-Za-z0-9_-]*$/.test(value)) {
      if (value && !/^ky_form_[a-z0-9_]*$/.test(value)) {
        // callback(new Error('请输入合法的表名，只能包含A-Za-z0-9_-这些字符，且必须以英文字符开头!'))
        callback(new Error('请输入合法的表名，只能以ky_form_开头, 包含a-z、0-9和_'))
      }
      else {
        callback()
      }
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          this.$http({
            url: `/form/make/saveBasicInfo`,
            method: 'post',
            data: this.inputForm,
          }).then(({ data }) => {
            if (data && data.success) {
              this.visible = false
              this.$message.success(data.msg)
              this.$emit('refreshDataList')
            }
            this.loading = false
          })
        }
      })
    },
  },
}
</script>

<template>
  <div>
    <el-dialog
      class="dialog-basicForm-form"
      :title="title"
      :close-on-click-modal="false"

      :visible.sync="visible"
    >
      <el-form
        ref="inputForm"
        v-loading="loading"
        size="small"
        :model="inputForm"
        :class="method === 'view' ? 'readonly' : ''"
        :disabled="method === 'view'"
        label-width="120px"
      >
        <el-row :gutter="15">
          <el-col :span="24">
            <el-form-item
              label="表单名称"
              prop="name"
              :rules="[
                {
                  required: true,
                  message: '表单名称不能为空',
                  trigger: 'blur',
                },
              ]"
            >
              <el-input
                v-model="inputForm.name"
                placeholder="请填写表单名称"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item
              label="表单key"
              prop="code"
              :rules="[
                { required: true, message: '表单key不能为空', trigger: 'blur' },
                { validator: validateNoExist, trigger: 'blur' },
              ]"
            >
              <el-input
                v-model="inputForm.code"
                placeholder="请填写表单编码"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item
              label="所属数据库"
              prop="dataSource.id"
              :rules="[
                {
                  required: true,
                  message: '所属数据库不能为空',
                  trigger: 'blur',
                },
              ]"
            >
              <SelectTree
                ref="dataSourceTree"
                :props="{
                  value: 'id', // ID字段名
                  label: 'label', // 显示名称
                  children: 'children', // 子级字段名
                }"
                :data="dataSourceTree"
                :value="inputForm.dataSource.id"
                :label="inputForm.dataSource.name"
                :clearable="true"
                :accordion="true"
                :disabled="method !== 'add'"
                @getValue="
                  (id, label, node) => {
                    ;(inputForm.dataSource.id = id),
                      (inputForm.dataSource.enName = node.enName),
                      (inputForm.dataSource.dbType = node ? node.dbType : '')
                  }
                "
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item
              label="是否自动建表"
              prop="autoCreate"
              :rules="[
                {
                  required: true,
                  message: '是否自动建表不能为空',
                  trigger: 'blur',
                },
              ]"
            >
              <el-radio-group
                v-model="inputForm.autoCreate"
                :disabled="method !== 'add'"
                @change="changeAutoCreate"
              >
                <el-radio
                  v-for="item in $dictUtils.getDictList('yes_no')"
                  :key="item.id"
                  :label="item.dictCode"
                >
                  {{ item.dictName }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item
              v-if="inputForm.autoCreate === '0'"
              label="表名"
              prop="tableName"
              :rules="[{ required: true, message: '表名不能为空', trigger: 'blur' }]"
            >
              <el-select
                v-model="inputForm.tableName"
                :disabled="method !== 'add'"
                style="width: 100%"
                filterable
                placeholder="请选择表"
              >
                <el-option
                  v-for="item in dataTable"
                  :key="item.name"
                  :label="item.nameAndComments"
                  :value="item.name"
                />
              </el-select>
            </el-form-item>

            <el-form-item
              v-else
              label="表名"
              prop="tableName"
              :rules="[
                { validator: validateValid, trigger: 'blur' },
                { required: true, message: '表名不能为空', trigger: 'blur' },
                { validator: validateTableExist, trigger: 'blur' },
              ]"
            >
              <el-input
                v-model="inputForm.tableName"
                :disabled="method !== 'add'"
                placeholder="请输入表名"
              >
                <el-button
                  slot="append"
                  :disabled="method !== 'add'"
                  @click="createTableName"
                >
                  生成随机表名
                </el-button>
              </el-input>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item
              label="备注信息"
              prop="remarks"
              :rules="[]"
            >
              <el-input
                v-model="inputForm.remarks"
                type="textarea"
                placeholder="请填写备注信息"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          size="mini"
          @click="visible = false"
        >关闭</el-button>
        <el-button
          v-if="method != 'view'"
          v-noMoreClick
          size="mini"
          type="primary"
          @click="doSubmit()"
        >确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.dialog-basicForm-form {
  .el-dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-height: calc(100% - 30px);
    max-width: calc(100% - 30px);
    margin: 0 !important;
    display: flex;
    flex-direction: column;
    .el-dialog__header {
      border-bottom: 1px solid #e8e8e8;
    }
    .el-dialog__body {
      overflow: auto;
    }
    .el-dialog__footer {
      border-top: 1px solid #e8e8e8;
      border-radius: 0 0 4px 4px;
    }
  }
}
</style>
