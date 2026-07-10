<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import { newOtherDisposalMeasures } from '@/http/accidentHandling/accidentHandling.js'
import { upLoadImg } from '@/http/manage-api'
import { getAllUsersByTenant, getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import FileUpload from '@/views/common-ui/FileUpload'

export default {
  components: {
    TreeSelect,
    FileUpload,
  },
  props: {
    // 处理报告编号
    accidentNumber: {
      type: String,
      default: '',
    },
    // 处理报告名称
    accidentName: {
      type: String,
      default: '',
    },
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
    // 风险区域下拉列表
    riskAreaList: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      fileProp: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 1, // 最大文件上传数量
        deleteFront: true,
        editable: true,
      },
      visible: false,
      isLoading: false,
      allDic: {}, // 字典信息
      departList: [], // 部门列表
      personList: [], // 人员列表
      personListShow: [], // 页面中展示的人员列表
      changeData: {}, // 编辑的数据
    }
  },
  created() {
    this.$nextTick(() => {
      this.changeData.accidentNumber = this.accidentNumber
      this.changeData.accidentReportName = this.accidentName
    })

    this.getInfoData()
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    const userData = JSON.parse(sessionStorage.getItem('user'))
    this.changeData.originator = userData.fullName
    this.changeData.originatorld = userData.id
    Promise.all([getDepartListSimple(), getAllUsersByTenant(userData.tenantId)])
      .then((res) => {
        this.departList = res[0].data.result || []
        this.personList = res[1].data.result || []
        this.filterUserList()
      })
      .catch((err) => {
        this.$message.error('获取列表失败')
      })
  },
  methods: {
    changeExecutiveName(arrId) {
      const arr = []
      this.personListShow.forEach((item) => {
        for (let i = 0; i < arrId.length; i++) {
          if (item.id == arrId[i]) {
            arr.push(item.fullName)
          }
        }
      })
      this.changeData.executive = arr
    },
    uploadEvt(fileList) {
      if (fileList.length) {
        upLoadImg(fileList[0], 'DOC_PATH').then(({ data }) => {
          if (data.success) {
            this.changeData.enclosure = data.result
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.changeData.enclosure = ''
      }
    },
    delDocPath() {
      this.changeData.enclosure = ''
    },
    /* 获取详情数据 */
    getInfoData() {
      // 查看或修改
      if (this.info.id) {
        this.changeData = this.info
      }
      // 新增
      else {
        this.changeData = {
          department: '',
          departmentName: '',
        }
      }
    },
    // 过滤人员列表，解决数据量过大时卡顿的问题
    filterUserList(val) {
      if (!val) {
        // 列表中展示的人员
        this.personListShow = this.personList.slice(0, 20)
        // 如果之前设置了人员，需要把设置的人员信息加入展示列表中，为了回显
        if (this.info.executiveId) {
          const currentResponsibilityUser = this.personList.find((item) => {
            return item.id === this.info.executiveId
          })
          if (!this.personListShow.includes(currentResponsibilityUser)) {
            this.personListShow.push(currentResponsibilityUser)
          }
        }
      }
      else {
        const result = this.personList.filter((item) => {
          return item.fullName.includes(val)
        }) // 存储符合条件的下拉选项
        this.personListShow = result.slice(0, 20) // 只取前10个
      }
    },
    /* 部门下拉列表选择回调 */
    depChangeEvt(id, name) {
      this.changeData.department = id || ''
      this.changeData.departmentName = name || ''
      this.$refs.treeSelect.closeSelect()
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    ArrChangeStr(arr) {
      let str = ''
      if (arr && arr.length > 0) {
        arr.forEach((item) => {
          str += `${item},`
        })
        str = str.slice(0, -1)
      }
      return str
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.unitForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          const parmas = Object.assign({}, this.changeData)
          parmas.executiveId = this.ArrChangeStr(parmas.executiveId)
          parmas.executive = this.ArrChangeStr(parmas.executive)

          newOtherDisposalMeasures(parmas)
            .then((res) => {
              if (res.success) {
                this.$message.success('保存成功')
                this.$emit('getDataFX', this.changeData.task_name)
                this.$emit('close', true)
              }
              else {
                this.$message.warning(res.message || '保存失败')
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
      ref="unitForm"
      :model="changeData"
      label-width="100px"
      style="width: 750px"
      inline
      :disabled="!editable"
    >
      <el-form-item
        label="任务名称"
        prop="task_name"
        :rules="{ required: true, message: '请填写名称', trigger: 'blur' }"
      >
        <el-input
          v-model="changeData.task_name"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="任务归属部门"
        prop="department"
        :rules="[{ required: true, message: '请选择责任部门', trigger: 'change' }]"
      >
        <TreeSelect
          ref="treeSelect"
          style="width: 250px"
          :list="departList"
          :props="{
            value: 'id',
            label: 'departmentName',
            children: 'children',
          }"
          :value="changeData.department"
          :label="changeData.departmentName"
          @getValue="depChangeEvt"
        />
      </el-form-item>
      <el-form-item
        label="处理报告名称"
        prop="accidentReportName"
      >
        <el-input
          v-model="changeData.accidentReportName"
          disabled
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="执行人"
        prop="executiveId"
      >
        <el-select
          v-model="changeData.executiveId"
          filterable
          multiple
          style="width: 250px"
          :filter-method="filterUserList"
          @change="changeExecutiveName(changeData.executiveId)"
        >
          <el-option
            v-for="item in personListShow"
            :key="item.id"
            :label="item.fullName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="发起人"
        prop="originator"
      >
        <el-input
          v-model="changeData.originator"
          disabled
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item label="任务简单描述">
        <el-input
          v-model="changeData.taskDescription"
          type="textarea"
          :rows="4"
          resize="none"
          style="width: 610px"
        />
      </el-form-item>
      <el-form-item
        label="附件"
        style="width: 500px"
        prop="enclosure"
      >
        <FileUpload
          v-bind="fileProp"
          @upload="uploadEvt"
          @delSucc="delDocPath"
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
