<script>
import { getJavaTypeDetailFn, saveJavaTypeFn } from '@/http/safe-production/genCode/java-type-api'
import GenCustomFieldForm from './GenCustomFieldForm'

export default {
  components: {
    GenCustomFieldForm,
  },
  data() {
    return {
      title: '',
      method: '',
      visible: false,
      loading: false,
      genCustomObjTab: '0',
      inputForm: {
        id: '',
        genCustomFieldList: [],
        label: '',
        value: '',
        dataUrl: '',
        tableName: '',
        sort: 1,
        type: '0',
      },
    }
  },
  methods: {
    init(method, id) {
      this.method = method
      this.inputForm.id = id
      if (method === 'add') {
        this.title = '\u65B0\u5EFAjava\u7C7B\u578B'
      }
      else if (method === 'edit') {
        this.title = '修改java类型'
      }
      else if (method === 'view') {
        this.title = '查看java类型'
      }

      this.visible = true
      this.loading = false
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        this.genCustomObjTab = '0'
        this.inputForm.genCustomFieldList = []
        if (method === 'edit' || method === 'view') {
          // 修改或者查看
          this.loading = true
          getJavaTypeDetailFn(this.inputForm.id).then(({ data }) => {
            this.inputForm = this.recover(this.inputForm, this.removeEmptyField(data.genCustomObj))
            this.loading = false
          })
        }
      })
    },
    saveGenCustomFieldRow(child) {
      if (child[0] === '') {
        this.inputForm.genCustomFieldList.push(child[1])
      }
      else {
        this.inputForm.genCustomFieldList.forEach((item, index) => {
          if (item === child[0]) {
            this.inputForm.genCustomFieldList.splice(index, 1, child[1])
          }
        })
      }
    },
    addGenCustomFieldRow(child) {
      this.$refs.genCustomFieldForm.init('add')
    },
    viewGenCustomFieldRow(child) {
      this.$refs.genCustomFieldForm.init('view', child)
    },
    editGenCustomFieldRow(child) {
      this.$refs.genCustomFieldForm.init('edit', child)
    },
    delGenCustomFieldRow(child) {
      this.inputForm.genCustomFieldList.forEach((item, index) => {
        if (item === child && item.id === '') {
          this.inputForm.genCustomFieldList.splice(index, 1)
        }
        else if (item === child) {
          item.delFlag = '1'
          this.inputForm.genCustomFieldList.splice(index, 1, item)
        }
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          saveJavaTypeFn(this.inputForm).then(({ data }) => {
            if (data && data.success) {
              this.visible = false
              this.$message.success(data.msg)
              this.$emit('refreshDataList')
            }
            else {
              this.$message.error(data.msg)
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
  <el-dialog

    :title="title"
    :close-on-click-modal="false"
    :visible.sync="visible"
  >
    <el-form
      ref="inputForm"
      v-loading="loading"
      label-width="120px"
      :model="inputForm"
      :disabled="method === 'view'"
      @submit.native.prevent
    >
      <el-row :gutter="15">
        <el-col :span="20">
          <el-form-item
            label="标签"
            prop="label"
            :rules="[{ required: true, message: '标签不能为空', trigger: 'blur' }]"
          >
            <el-input
              v-model="inputForm.label"
              placeholder="请填写标签"
            />
          </el-form-item>
        </el-col>
        <el-col :span="20">
          <el-form-item
            label="完整类名"
            prop="value"
            :rules="[{ required: true, message: '完整类名不能为空', trigger: 'blur' }]"
          >
            <el-input
              v-model="inputForm.value"
              placeholder="请填写完整类名"
            />
          </el-form-item>
        </el-col>
        <el-col :span="20">
          <el-form-item
            label="数据接口"
            prop="dataUrl"
          >
            <el-input
              v-model="inputForm.dataUrl"
              placeholder="请填写数据接口"
            />
          </el-form-item>
        </el-col>
        <el-col :span="20">
          <el-form-item
            label="物理表名"
            prop="tableName"
          >
            <el-input
              v-model="inputForm.tableName"
              placeholder="请填写物理表名"
            />
          </el-form-item>
        </el-col>
        <el-col :span="20">
          <el-form-item
            label="排序"
            prop="sort"
          >
            <el-input-number
              v-model="inputForm.sort"
              placeholder="请填写排序号"
              :min="1"
              :max="1000"
            />
          </el-form-item>
        </el-col>
        <el-col :span="20">
          <el-form-item
            label="基本类型"
            prop="type"
            :rules="[{ required: true, message: '基本类型不能为空', trigger: 'blur' }]"
          >
            <el-radio-group v-model="inputForm.type">
              <el-radio label="1">
                是
              </el-radio>
              <el-radio label="0">
                否
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col
          v-if="inputForm.type === '0'"
          :span="24"
        >
          <el-form-item label-width="0">
            <el-tabs :model="genCustomObjTab">
              <el-tab-pane label="java字段">
                <el-button
                  type="primary"
                  @click="addGenCustomFieldRow()"
                >
                  新增
                </el-button>
                <el-table
                  style="width: 100%; overflow: auto"
                  height="300px"
                  :data="
                    inputForm.genCustomFieldList.filter(item => {
                      return item.delFlag !== '1'
                    })
                  "
                >
                  <el-table-column
                    prop="name"
                    header-align="center"
                    align="center"
                    show-overflow-tooltip
                    label="java属性"
                  />
                  <el-table-column
                    prop="remarks"
                    header-align="center"
                    align="center"
                    show-overflow-tooltip
                    label="说明"
                  />
                  <el-table-column
                    prop="sort"
                    header-align="center"
                    align="center"
                    show-overflow-tooltip
                    label="排序"
                  />
                  <el-table-column
                    label="操作"
                    min-width="150px"
                    align="center"
                    header-align="center"
                    fixed="right"
                  >
                    <template slot-scope="scope">
                      <el-button
                        type="text"
                        size="small"
                        @click="viewGenCustomFieldRow(scope.row)"
                      >
                        查看
                      </el-button>
                      <el-button
                        type="text"
                        size="small"
                        @click="editGenCustomFieldRow(scope.row)"
                      >
                        修改
                      </el-button>
                      <el-button
                        type="text"
                        size="small"
                        @click="delGenCustomFieldRow(scope.row)"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        v-show="method !== 'view'"
        v-noMoreClick
        type="primary"
        size="small"
        @click="doSubmit()"
      >确定</el-button>
    </span>
    <gen-custom-field-form
      ref="genCustomFieldForm"
      @addRow="saveGenCustomFieldRow(arguments)"
    />
  </el-dialog>
</template>
