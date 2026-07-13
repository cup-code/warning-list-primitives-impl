/* * @Author: yangjie 问题与不足弹框 * @Date: 2023-03-14 14:55:13 */
<script>
import { upLoadImg } from '@/http/manage-api'
import { fzyGetUserByDepId } from '@/http/user-api.js'
import FileUpload from '@/views/common-ui/FileUpload'
import PickPeople from '@/views/common-ui/PickPeople'

export default {
  components: {
    FileUpload,
    PickPeople,
  },
  data() {
    return {
      visible: false,
      loading: false,
      colWidth: 12,
      userList: [], // 姓名列表
      dataRule: {
        rectifyPersonId: [{ required: true, message: '整改责任人不能为空', trigger: 'change' }],
        rectifyTime: [{ required: true, message: '计划整改时间不能为空', trigger: 'blur' }],
        rectifyRemark: [{ required: true, message: '存在问题不能为空', trigger: 'blur' }],
        filePath: [{ required: true, message: '文档附件不能为空', trigger: 'blur' }],
      },
      inputForm: {
        dangerDescription: '',
        rectifyPersonId: '',
        rectifyTime: '',
        filePath: '',
      },
      curIndex: null,
      fileProps: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 1, // 最大文件上传数量
        deleteFront: true,
        editable: true,
      },
      showPeopleDialog: false,
      peopleProp: {}, // 选择人员组件传递信息
    }
  },
  created() {
    const userData = this.$store.state.user.user
    this.getPersonList(userData.departmentId)
  },
  methods: {
    /* 按部门id查询部门下所有人员 */
    getPersonList(id) {
      this.isLoading = true
      fzyGetUserByDepId(id)
        .then((res) => {
          if (res.data.success) {
            this.userList = res.data.result
          }
          else {
            this.$message.warning(res.data.message || '获取负责人列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取负责人列表出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 文件上传回调 */
    uploadEvt(fileList) {
      console.log(fileList)
      if (fileList.length) {
        upLoadImg(fileList[0], 'DOC_PATH').then(({ data }) => {
          if (data.success) {
            this.inputForm.filePath = data.result
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.inputForm.filePath = ''
      }
    },
    // 删除附件
    delDocPath() {
      this.inputForm.filePath = ''
    },
    closeDialog() {
      console.log(444)
      Object.assign(this.inputForm, this.$options.data().inputForm)
      this.$refs.inputForm.resetFields()
      this.fileProps.oldFileList = [] // 重置上传附件
    },
    init(row, method, index) {
      this.visible = true
    },
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          const params = Object.assign({}, this.inputForm, {
            index: this.curIndex,
          })
          this.$emit('refreshList', params) // 执行回调函数
          this.visible = false
        }
      })
    },
    // 整改责任人change事件
    rbFn(v) {
      const len = this.userList.length
      let item
      for (let i = 0; i < len; i++) {
        item = this.userList[i]
        if (item.id === v) {
          this.inputForm.rectifyPerson = item.fullName
          break
        }
      }
    },
    // 选择整改责任人
    choosePeople() {
      this.peopleProp.oldPickData = {
        id: this.inputForm.rectifyPersonId || '',
        fullName: this.inputForm.rectifyPerson || '',
      }
      this.peopleProp.isSingle = true
      this.peopleProp.listType = 'company'
      this.showPeopleDialog = true
    },
    // 选择人之后的回调
    closePeopleEvt(params) {
      if (params) {
        this.inputForm.rectifyPersonId = params.data.id
        this.$set(this.inputForm, 'rectifyPerson', params.data.fullName)
      }

      this.showPeopleDialog = false
    },
  },
}
</script>

<template>
  <div>
    <el-dialog
      title="存在问题"
      append-to-body
      :close-on-click-modal="false"
      width="800px"

      :visible.sync="visible"
      class="normal-dialog"
      @close="closeDialog"
    >
      <el-form
        ref="inputForm"
        v-loading="loading"
        :model="inputForm"
        :rules="dataRule"
        label-width="120px"
        @submit.native.prevent
      >
        <el-row>
          <el-col :span="colWidth">
            <el-form-item
              label="整改责任人"
              prop="rectifyPersonId"
            >
              <!-- <el-select v-model="inputForm.rectifyPersonId" placeholder="请选择" style="width: 100%" @change="rbFn">
                                <el-option v-for="item in userList" :key="item.id" :label="item.fullName" :value="item.id" />
                            </el-select> -->
              <el-input
                v-model="inputForm.rectifyPerson"
                readonly
                @focus="choosePeople"
              />
            </el-form-item>
          </el-col>
          <el-col :span="colWidth">
            <el-form-item
              label="计划整改时间"
              prop="rectifyTime"
            >
              <el-date-picker
                v-model="inputForm.rectifyTime"
                style="width: 100%"
                value-format="yyyy-MM-dd hh:mm:ss"
                type="date"
                placeholder="选择日期"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item
              label="存在问题"
              prop="dangerDescription"
            >
              <el-input
                v-model="inputForm.dangerDescription"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item
            label="文档附件"
            style="width: 500px"
            prop="filePath"
          >
            <FileUpload
              v-if="visible"
              v-bind="fileProps"
              @upload="uploadEvt"
              @delSucc="delDocPath"
            />
          </el-form-item>
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
          size="small"
          type="primary"
          :loading="loading"
          @click="doSubmit()"
        >确定</el-button>
      </span>
    </el-dialog>

    <!-- 选人 -->
    <el-dialog
      class="fixed-dialog"
      title="选择人员"
      :visible.sync="showPeopleDialog"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <PickPeople
        v-if="showPeopleDialog"
        v-bind="peopleProp"
        @close="closePeopleEvt"
      />
    </el-dialog>
  </div>
</template>
