<script>
import { getDataBaseDetailFn } from '@/http/safe-production/genCode/data-base-type-api'
import GenTableFieldTypeForm from './GenTableFieldTypeForm'

export default {
  components: {
    GenTableFieldTypeForm,
  },
  data() {
    return {
      title: '',
      method: '',
      visible: false,
      loading: false,
      genDataBaseTypeTab: '0',
      inputForm: {
        id: '',
        genTableFieldTypeList: [],
        type: '',
      },
    }
  },
  methods: {
    init(method, id) {
      this.method = method
      this.inputForm.id = id
      if (method === 'add') {
        this.title = '\u65B0\u5EFA\u6570\u636E\u5E93\u5B57\u6BB5\u7C7B\u578B'
      }
      else if (method === 'edit') {
        this.title = '修改数据库字段类型'
      }
      else if (method === 'view') {
        this.title = '查看数据库字段类型'
      }
      this.visible = true
      this.loading = false
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        this.genDataBaseTypeTab = '0'
        this.inputForm.genTableFieldTypeList = []
        if (method === 'edit' || method === 'view') {
          // 修改或者查看
          this.loading = true
          getDataBaseDetailFn(this.inputForm.id).then(({ data }) => {
            this.inputForm = this.recover(this.inputForm, data.genDataBaseType)
            this.loading = false
          })
        }
      })
    },
    saveGenTableFieldTypeRow(child) {
      if (child[0] === '') {
        this.inputForm.genTableFieldTypeList.push(child[1])
      }
      else {
        this.inputForm.genTableFieldTypeList.forEach((item, index) => {
          if (item === child[0]) {
            this.inputForm.genTableFieldTypeList.splice(index, 1, child[1])
          }
        })
      }
    },
    addGenTableFieldTypeRow() {
      this.$refs.genTableFieldTypeForm.init('add')
    },
    viewGenTableFieldTypeRow(child) {
      this.$refs.genTableFieldTypeForm.init('view', child)
    },
    editGenTableFieldTypeRow(child) {
      this.$refs.genTableFieldTypeForm.init('edit', child)
    },
    delGenTableFieldTypeRow(child) {
      this.inputForm.genTableFieldTypeList.forEach((item, index) => {
        if (item === child && item.id === '') {
          this.inputForm.genTableFieldTypeList.splice(index, 1)
        }
        else if (item === child) {
          item.delFlag = '1'
          this.inputForm.genTableFieldTypeList.splice(index, 1, item)
        }
      })
    },
    // 表单提交
    doSubmit: function doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          // _this4.$http({
          //   url: "/gencode/genDataBaseType/save",
          //   method: 'post',
          //   data: _this4.inputForm
          // })
          saveDataBaseFn(this.inputForm).then(({ data }) => {
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
            label="数据库类型"
            prop="type"
            :rules="[
              {
                required: true,
                message: '数据库类型不能为空',
                trigger: 'blur',
              },
            ]"
          >
            <el-select
              v-model="inputForm.type"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in $dictUtils.getDictList('db_type')"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label-width="0">
            <el-tabs :model="genDataBaseTypeTab">
              <el-tab-pane label="表字段物理类型">
                <el-button
                  type="primary"
                  size="mini"
                  @click="addGenTableFieldTypeRow()"
                >
                  新增
                </el-button>
                <el-table
                  style="width: 100%; overflow: auto"
                  height="300px"
                  :data="
                    inputForm.genTableFieldTypeList.filter(item => {
                      return item.delFlag !== '1'
                    })
                  "
                >
                  <el-table-column
                    prop="label"
                    header-align="center"
                    align="center"
                    label="标签"
                  />
                  <el-table-column
                    prop="value"
                    header-align="center"
                    align="center"
                    label="值"
                  />
                  <el-table-column
                    prop="sort"
                    header-align="center"
                    align="center"
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
                        @click="viewGenTableFieldTypeRow(scope.row)"
                      >
                        查看
                      </el-button>
                      <el-button
                        type="text"
                        size="small"
                        @click="editGenTableFieldTypeRow(scope.row)"
                      >
                        修改
                      </el-button>
                      <el-button
                        type="text"
                        size="small"
                        @click="delGenTableFieldTypeRow(scope.row)"
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
        v-noMoreClick
        type="primary"
        size="small"
        @click="doSubmit()"
      >确定</el-button>
    </span>
    <gen-table-field-type-form
      ref="genTableFieldTypeForm"
      @addRow="saveGenTableFieldTypeRow(arguments)"
    />
  </el-dialog>
</template>
