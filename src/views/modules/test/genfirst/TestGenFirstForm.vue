<script>
import { getAuthToken } from '@/utils/tab-session'
import SelectTree from '@/components/mjTreeSelect/mjTreeSelect.vue'
import UserSelect from '@/components/userSelect'

export default {
  components: {
    UserSelect,
    SelectTree,
  },
  data() {
    return {
      window,
      title: '',
      method: '',
      visible: false,
      loading: false,
      fieldSevenArra: [],
      fieldEightArra: [],
      inputForm: {
        id: '',
        fieldOne: '',
        fieldTwo: '',
        fieldThree: '',
        fieldFour: {
          id: '',
        },
        fieldFive: {
          id: '',
        },
        fieldSix: {
          id: '',
        },
        fieldSeven: '',
        fieldEight: '',
        fieldNine: '',
        fieldTen: '',
        fieldYyy: '',
        remarks: '',
      },
    }
  },
  computed: {
    fieldTenList: {
      get() {
        return this.inputForm.fieldTen !== '' ? this.inputForm.fieldTen.split(',') : []
      },
      set(val) {
        this.inputForm.fieldTen = val.join(',')
      },
    },
  },
  created() {
    this.getPrefix()
  },
  methods: {
    init(method, id) {
      this.method = method
      this.inputForm.id = id
      if (method === 'add') {
        this.title = `新建测试单表生成`
      }
      else if (method === 'edit') {
        this.title = '修改测试单表生成'
      }
      else if (method === 'view') {
        this.title = '查看测试单表生成'
      }
      this.fieldSevenArra = []
      this.fieldEightArra = []
      this.visible = true
      this.loading = false
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        if (method === 'edit' || method === 'view') {
          // 修改或者查看
          this.loading = true
          this.$http({
            url: `/test/genfirst/testGenFirst/queryById?id=${this.inputForm.id}`,
            method: 'get',
          }).then(({ data }) => {
            this.inputForm = this.recover(this.inputForm, data.testGenFirst)
            this.inputForm.fieldSeven.split('|').forEach((item) => {
              if (item.trim().length > 0) {
                this.fieldSevenArra.push({
                  name: decodeURIComponent(item.substring(item.lastIndexOf('/') + 1)),
                  url: this.filePrefix + item,
                })
              }
            })
            this.inputForm.fieldEight.split('|').forEach((item) => {
              if (item.trim().length > 0) {
                this.fieldEightArra.push({
                  name: decodeURIComponent(item.substring(item.lastIndexOf('/') + 1)),
                  url: this.filePrefix + item,
                })
              }
            })
            this.loading = false
          })
        }
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          this.$http({
            url: `/test/genfirst/testGenFirst/save`,
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
      :close-on-click-modal="false"

      :visible.sync="visible"
    >
      <el-form
        ref="inputForm"
        v-loading="loading"
        :model="inputForm"
        size="small"
        :class="method === 'view' ? 'readonly' : ''"
        :disabled="method === 'view'"
        label-width="120px"
      >
        <el-row :gutter="15">
          <el-col :span="12">
            <el-form-item
              label="字段1"
              prop="fieldOne"
              :rules="[]"
            >
              <el-input
                v-model="inputForm.fieldOne"
                placeholder="请填写字段1"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="字段2"
              prop="fieldTwo"
              :rules="[]"
            >
              <el-select
                v-model="inputForm.fieldTwo"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('control_measures')"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="字段3"
              prop="fieldThree"
              :rules="[]"
            >
              <el-date-picker
                v-model="inputForm.fieldThree"
                style="width: 100%"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                placeholder="选择日期时间"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="字段4"
              prop="fieldFour.id"
              :rules="[]"
            >
              <user-select
                :limit="1"
                :value="inputForm.fieldFour.id"
                @getValue="
                  value => {
                    inputForm.fieldFour.id = value
                  }
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="字段5"
              prop="fieldFive.id"
              :rules="[]"
            >
              <SelectTree
                ref="fieldFive"
                :props="{
                  value: 'id', // ID字段名
                  label: 'departmentName', // 显示名称
                  children: 'childrenDepartment', // 子级字段名
                }"
                url="/sys/office/treeData?type=2"
                :value="inputForm.fieldFive.id"
                :clearable="true"
                :accordion="true"
                @getValue="
                  value => {
                    inputForm.fieldFive.id = value
                  }
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="字段6"
              prop="fieldSix.id"
              :rules="[]"
            >
              <SelectTree
                ref="fieldSix"
                :props="{
                  value: 'id', // ID字段名
                  label: 'districtName', // 显示名称
                  children: 'children', // 子级字段名
                }"
                url="/sys/area/treeData"
                :value="inputForm.fieldSix.id"
                :clearable="true"
                :accordion="true"
                @getValue="
                  value => {
                    inputForm.fieldSix.id = value
                  }
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="字段7"
              prop="fieldSeven"
              :rules="[]"
            >
              <el-upload
                v-if="visible"
                ref="fieldSeven"
                list-type="picture-card"
                :action="`${$http.BASE_URL}/sys/file/webupload/upload?uploadPath=/test/genfirst/testGenFirst`"
                :headers="{
                  Authorization: getAuthToken(),
                  Clientchannel: 'WEB',
                }"
                :on-preview="
                  (file, fileList) => {
                    $alert(
                      `<img style='width:100%' src='${
                        (file.response && file.response.url) || file.url
                      }'/>`,
                      {
                        dangerouslyUseHTMLString: true,
                        showConfirmButton: false,
                        closeOnClickModal: true,
                        customClass: 'showPic',
                      },
                    )
                  }
                "
                :on-success="
                  (response, file, fileList) => {
                    inputForm.fieldSeven = fileList
                      .map(item => (item.response && item.response.url) || item.url)
                      .join('|')
                  }
                "
                :on-remove="
                  (file, fileList) => {
                    $http
                      .post(
                        `/sys/file/webupload/deleteByUrl?url=${
                          (file.response && file.response.url) || file.url
                        }`,
                      )
                      .then(({ data }) => {
                        $message.success(data.msg)
                      })
                    inputForm.fieldSeven = fileList.map(item => item.url).join('|')
                  }
                "
                :before-remove="
                  (file, fileList) => {
                    return $confirm(`确定移除 ${file.name}？`)
                  }
                "
                multiple
                :limit="5"
                :on-exceed="
                  (files, fileList) => {
                    $message.warning(
                      `当前限制选择 5 个文件，本次选择了 ${files.length} 个文件，共选择了 ${
                        files.length + fileList.length
                      } 个文件`,
                    )
                  }
                "
                :file-list="fieldSevenArra"
              >
                <i class="el-icon-plus" />
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="字段8"
              prop="fieldEight"
              :rules="[]"
            >
              <el-upload
                v-if="visible"
                ref="fieldEight"
                :action="`${$http.BASE_URL}/sys/file/webupload/upload?uploadPath=/test/genfirst/testGenFirst`"
                :headers="{
                  Authorization: getAuthToken(),
                  Clientchannel: 'WEB',
                }"
                :on-preview="
                  (file, fileList) => {
                    $window.location.href = (file.response && file.response.url) || file.url
                  }
                "
                :on-success="
                  (response, file, fileList) => {
                    inputForm.fieldEight = fileList
                      .map(item => (item.response && item.response.url) || item.url)
                      .join('|')
                  }
                "
                :on-remove="
                  (file, fileList) => {
                    $http
                      .post(
                        `/sys/file/webupload/deleteByUrl?url=${
                          (file.response && file.response.url) || file.url
                        }`,
                      )
                      .then(({ data }) => {
                        $message.success(data.msg)
                      })
                    inputForm.fieldEight = fileList.map(item => item.url).join('|')
                  }
                "
                :before-remove="
                  (file, fileList) => {
                    return $confirm(`确定移除 ${file.name}？`)
                  }
                "
                multiple
                :limit="5"
                :on-exceed="
                  (files, fileList) => {
                    $message.warning(
                      `当前限制选择 5 个文件，本次选择了 ${files.length} 个文件，共选择了 ${
                        files.length + fileList.length
                      } 个文件`,
                    )
                  }
                "
                :file-list="fieldEightArra"
              >
                <el-button
                  size="small"
                  type="primary"
                >
                  点击上传
                </el-button>
                <div
                  slot="tip"
                  class="el-upload__tip"
                >
                  添加相关附件
                </div>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="字段9"
              prop="fieldNine"
              :rules="[]"
            >
              <el-radio-group v-model="inputForm.fieldNine">
                <el-radio
                  v-for="item in $dictUtils.getDictList('depart_type')"
                  :key="item.dictCode"
                  :label="item.dictCode"
                >
                  {{ item.dictName }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="字段10"
              prop="fieldTen"
              :rules="[]"
            >
              <el-checkbox-group v-model="fieldTenList">
                <el-checkbox
                  v-for="fieldTen in $dictUtils.getDictList('analysis_unit')"
                  :key="fieldTen.dictCode"
                  :label="fieldTen.dictCode"
                >
                  {{ fieldTen.dictName }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="字段yyy"
              prop="fieldYyy"
              :rules="[]"
            >
              <el-input
                v-model="inputForm.fieldYyy"
                placeholder="请填写字段yyy"
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
  </div>
</template>
