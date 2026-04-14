<script>
import TestDataChild1Form from './TestDataChild1Form'
import TestDataChild2Form from './TestDataChild2Form'

export default {
  components: {
    TestDataChild1Form,
    TestDataChild2Form,
  },
  data() {
    return {
      window,
      title: '',
      method: '',
      visible: false,
      loading: false,
      testDataMainFormTab: '0',
      inputForm: {
        id: '',
        testDataChild1List: [],
        testDataChild2List: [],
        name: '',
        sex: '',
        address: '',
        remarks: '',
      },
    }
  },
  methods: {
    init(method, id) {
      this.method = method
      if (method === 'add') {
        this.title = `新建票务代理`
      }
      else if (method === 'edit') {
        this.title = '修改票务代理'
      }
      else if (method === 'view') {
        this.title = '查看票务代理'
      }
      this.visible = true
      this.loading = false
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        this.inputForm.id = id
        this.testDataMainFormTab = '0'
        this.inputForm.testDataChild1List = []
        this.inputForm.testDataChild2List = []
        if (method === 'edit' || method === 'view') {
          // 修改或者查看
          this.loading = true
          this.$http({
            url: `/test/onetomany/testDataMainForm/queryById?id=${this.inputForm.id}`,
            method: 'get',
          }).then(({ data }) => {
            this.inputForm = this.recover(this.inputForm, data.testDataMainForm)
            this.loading = false
          })
        }
      })
    },
    saveTestDataChild1Row(child) {
      if (child[0] === '') {
        this.inputForm.testDataChild1List.push(child[1])
      }
      else {
        this.inputForm.testDataChild1List.forEach((item, index) => {
          if (item === child[0]) {
            this.inputForm.testDataChild1List.splice(index, 1, child[1])
          }
        })
      }
    },
    addTestDataChild1Row(child) {
      this.$refs.testDataChild1Form.init('add')
    },
    viewTestDataChild1Row(child) {
      this.$refs.testDataChild1Form.init('view', child)
    },
    editTestDataChild1Row(child) {
      this.$refs.testDataChild1Form.init('edit', child)
    },
    delTestDataChild1Row(child) {
      this.inputForm.testDataChild1List.forEach((item, index) => {
        if (item === child && item.id === '') {
          this.inputForm.testDataChild1List.splice(index, 1)
        }
        else if (item === child) {
          item.delFlag = '1'
          this.inputForm.testDataChild1List.splice(index, 1, item)
        }
      })
    },
    saveTestDataChild2Row(child) {
      if (child[0] === '') {
        this.inputForm.testDataChild2List.push(child[1])
      }
      else {
        this.inputForm.testDataChild2List.forEach((item, index) => {
          if (item === child[0]) {
            this.inputForm.testDataChild2List.splice(index, 1, child[1])
          }
        })
      }
    },
    addTestDataChild2Row(child) {
      this.$refs.testDataChild2Form.init('add')
    },
    viewTestDataChild2Row(child) {
      this.$refs.testDataChild2Form.init('view', child)
    },
    editTestDataChild2Row(child) {
      this.$refs.testDataChild2Form.init('edit', child)
    },
    delTestDataChild2Row(child) {
      this.inputForm.testDataChild2List.forEach((item, index) => {
        if (item === child && item.id === '') {
          this.inputForm.testDataChild2List.splice(index, 1)
        }
        else if (item === child) {
          item.delFlag = '1'
          this.inputForm.testDataChild2List.splice(index, 1, item)
        }
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          this.$http({
            url: `/test/onetomany/testDataMainForm/save`,
            method: 'post',
            data: this.inputForm,
          }).then(({ data }) => {
            this.loading = false
            if (data && data.success) {
              this.visible = false
              this.$message.success(data.msg)
              this.$emit('refreshDataList')
            }
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
      :title="title"
      size="small"
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
          <el-col :span="12">
            <el-form-item
              label="名称"
              prop="name"
              :rules="[]"
            >
              <el-input
                v-model="inputForm.name"
                placeholder="请填写名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="性别"
              prop="sex"
              :rules="[]"
            >
              <el-input
                v-model="inputForm.sex"
                placeholder="请填写性别"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="地址"
              prop="address"
              :rules="[]"
            >
              <el-input
                v-model="inputForm.address"
                placeholder="请填写地址"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
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
          <el-col :span="24">
            <el-form-item label-width="0">
              <el-tabs v-model="testDataMainFormTab">
                <el-tab-pane label="火车票">
                  <el-button
                    size="small"
                    type="primary"
                    @click="addTestDataChild1Row"
                  >
                    新增
                  </el-button>
                  <el-table
                    class="table"
                    size="small"
                    :data="
                      inputForm.testDataChild1List.filter(function (item) {
                        return item.delFlag !== '1'
                      })
                    "
                    style="width: 100%"
                  >
                    <el-table-column
                      prop="srartarea"
                      header-align="center"
                      align="center"
                      show-overflow-tooltip
                      label="出发地"
                    />
                    <el-table-column
                      prop="endarea"
                      header-align="center"
                      align="center"
                      show-overflow-tooltip
                      label="目的地"
                    />
                    <el-table-column
                      prop="remarks"
                      header-align="center"
                      align="center"
                      show-overflow-tooltip
                      label="备注信息"
                    />
                    <el-table-column
                      fixed="right"
                      label="操作"
                      width="150"
                    >
                      <template slot-scope="scope">
                        <el-button
                          type="text"
                          size="small"
                          @click="viewTestDataChild1Row(scope.row)"
                        >
                          查看
                        </el-button>
                        <el-button
                          type="text"
                          size="small"
                          @click="editTestDataChild1Row(scope.row)"
                        >
                          编辑
                        </el-button>
                        <el-button
                          type="text"
                          size="small"
                          @click="delTestDataChild1Row(scope.row)"
                        >
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-tab-pane>
                <el-tab-pane label="飞机票">
                  <el-button
                    size="small"
                    type="primary"
                    @click="addTestDataChild2Row"
                  >
                    新增
                  </el-button>
                  <el-table
                    class="table"
                    size="small"
                    :data="
                      inputForm.testDataChild2List.filter(function (item) {
                        return item.delFlag !== '1'
                      })
                    "
                    style="width: 100%"
                  >
                    <el-table-column
                      prop="startarea"
                      header-align="center"
                      align="center"
                      show-overflow-tooltip
                      label="出发地"
                    />
                    <el-table-column
                      prop="endarea"
                      header-align="center"
                      align="center"
                      show-overflow-tooltip
                      label="目的地"
                    />
                    <el-table-column
                      prop="remarks"
                      header-align="center"
                      align="center"
                      show-overflow-tooltip
                      label="备注信息"
                    />
                    <el-table-column
                      fixed="right"
                      label="操作"
                      width="150"
                    >
                      <template slot-scope="scope">
                        <el-button
                          type="text"
                          size="small"
                          @click="viewTestDataChild2Row(scope.row)"
                        >
                          查看
                        </el-button>
                        <el-button
                          type="text"
                          size="small"
                          @click="editTestDataChild2Row(scope.row)"
                        >
                          编辑
                        </el-button>
                        <el-button
                          type="text"
                          size="small"
                          @click="delTestDataChild2Row(scope.row)"
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
          v-if="method != 'view'"
          v-noMoreClick
          size="small"
          type="primary"
          @click="doSubmit()"
        >确定</el-button>
      </span>
    </el-dialog>
    <TestDataChild1Form
      ref="testDataChild1Form"
      @addRow="saveTestDataChild1Row(arguments)"
    />
    <TestDataChild2Form
      ref="testDataChild2Form"
      @addRow="saveTestDataChild2Row(arguments)"
    />
  </div>
</template>
