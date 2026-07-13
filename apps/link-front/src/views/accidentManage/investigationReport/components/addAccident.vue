<!-- @description：addAccident 上报事故 -->
<!--  @modified By：  -->
<!--  @version: 1.0.0  -->
<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
// import { getDepartListSimple, getAllUsersByTenant, getAllUsersByCompany } from '@/http/safe-production/depart-manage-api'
import { reportingAccidents } from '@/http/accidentManage/investigation'
import { upLoadImg } from '@/http/manage-api'
import {
  getAllUsersByCompany,
  getDepartListDetail,
  getDepartListSimple,
} from '@/http/safe-production/depart-manage-api'
import { getAllPostByCompanyFn } from '@/http/safe-production/post-manage-api'
import FileUpload from '@/views/common-ui/FileUpload'

export default {
  name: 'addAccident',
  components: {
    FileUpload,
    TreeSelect,
  },
  data() {
    return {
      colWidth: 12,
      visible: false,
      loading: false,
      inputForm: {
        accidentName: '',
        accidentNumber: '',
        accidentDescription: '',
        enclosure: '',
        enclosureAddress: '',
        idOfTheInjuredPerson: '',
        nameOfTheInjuredPerson: '',
        locationOfOccurrence: '',
        occurringUnit: '',
        occurringUnitCode: '',
        // personnelInjury: '',
        placeOfOccurrence: '',
        // position: '',
        // positionCode: '',
        timeOfAccident: null,
        // updatedBy: '',
        // updatedTime: null,
        // createdBy: '',
        // createdTime: null
      },
      fileProp: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 1, // 最大文件上传数量
        deleteFront: true,
        editable: true,
      },

      dataRule: {
        accidentName: [
          {
            required: true,
            message: '事故名称不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        accidentNumber: [
          {
            required: true,
            message: '事故编号不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        placeOfOccurrence: [
          {
            required: true,
            message: '发生地点不能为空',
            leaderNametrigger: 'blur',
          },
        ],
      },
      personList: [],
      personListShow: [],

      treeData: [], // 发生地点
      departList: [], // 发生单位
      userOptions: [], // 受伤人员
      // positionOptions: [], //岗位
      currentNode: '', // 记录当前选中的节点
      tableData: [],
    }
  },
  watch: {
    visible(val) {
      if (val) {
        const companyId = this.$store.state.user.user.companyId
        this.inputForm.occurringUnit = this.$store.state.user.user.companyName // 发生单位
        this.inputForm.occurringUnitCode = companyId // 发生单位编码
      }
    },
  },
  mounted() {
    this.getTree()
    this.getOptions()
  },
  methods: {
    changeInjuredPersonTable(row) {
      this.tableData = []
      this.tableData = row?.map((item) => {
        const temp = this.userOptions.find((x) => {
          return x.id == item
        })
        return {
          name: temp.fullName,
          company: temp.companyName,
          organization: temp.departTypeDepartName,
          post: temp.postName,
          injurySituation: null,
        }
      })
    },
    checkTime(i) {
      if (i < 10) {
        i = `0${i}`
      }
      return i
    },
    showtime() {
      const nowdate = new Date()
      const year = nowdate.getFullYear()
      const month = nowdate.getMonth() + 1
      const date = nowdate.getDate()
      var h = nowdate.getHours()
      var m = nowdate.getMinutes()
      var s = nowdate.getSeconds()
      var h = this.checkTime(h)
      var m = this.checkTime(m)
      var s = this.checkTime(s)
      return `${year}-${month}-${date} ${h}:${m}:${s}`
    },
    doSubmit() {
      this.$refs.inputForm.validate(async (valid) => {
        if (valid) {
          const form = JSON.parse(JSON.stringify(this.inputForm))
          if (form.idOfTheInjuredPerson) {
            // 获取受伤人员姓名 转字符串
            form.nameOfTheInjuredPerson = form.idOfTheInjuredPerson
              ?.map((item) => {
                const temp = this.userOptions.find((x) => {
                  return x.id == item
                })
                return temp.fullName
              })
              ?.join(',')
            // 受伤人员id 转字符串
            form.idOfTheInjuredPerson = form.idOfTheInjuredPerson.join(',')
          }
          //   获取所属岗位编码
          // form.position =
          //   this.positionOptions.find((item) => {
          //     return item.id == form.positionCode
          //   })?.postName || ''
          // 受伤人员table数据
          form.detailsOfTheInjuredPerson = JSON.stringify(this.tableData)
          // 事故上报时间
          form.accidentReportingTime = this.showtime()
          this.loading = true
          const res = await reportingAccidents(form)
          this.loading = false
          if (res.success) {
            this.$message.success(res.message || '保存成功')
            this.visible = false
            this.$emit('getList')
          }
          else {
            this.$message.warning(res.message || '保存失败')
          }
        }
        else {
          return false
        }
      })
    },

    closeDialog() {
      this.fileProp.oldFileList = [] // 重置上传附件
      Object.assign(this.inputForm, this.$options.data().inputForm)
      this.$refs.inputForm.resetFields()
      this.inputForm.placeOfOccurrence = ''
    },
    getDepartmentId(value) {
      this.inputForm.companyId = value
    },

    filterUserOptions(val) {
      if (!val) {
        // 列表中展示的人员
        this.personListShow = this.personList.slice(0, 20)
        // 如果之前设置了人员，需要把设置的人员信息加入展示列表中，为了回显
        if (this.inputForm.leaderName) {
          const currentResponsibilityUser = this.personList.find((item) => {
            return item.id === this.inputForm.leaderName
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

    uploadEvt(fileList) {
      if (fileList.length) {
        upLoadImg(fileList[0], 'DOC_PATH').then(({ data }) => {
          if (data.success) {
            this.inputForm.enclosure = fileList[0].name // 文件名称
            this.inputForm.enclosureAddress = data.result // 文件地址
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.inputForm.enclosure = ''
        this.inputForm.enclosureAddress = ''
      }
    },

    // 删除附件
    delDocPath() {
      this.inputForm.enclosure = ''
      this.inputForm.enclosureAddress = ''
    },
    getTree() {
      this.loading = true
      getDepartListDetail(true)
        .then(({ data }) => {
          this.loading = false
          if (data.success) {
            data.result.forEach((item) => {
              item.businessTypeList = item.businessTypeList || [] // 如果没有业务类型，则赋值[]
            })
            this.treeData = this.setTreeData(data.result || [])
          }
          else {
            this.$message.error(data.message || '查询部门失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('查询部门失败')
        })
    },
    getOptions() {
      const companyId = this.$store.state.user.user.companyId
      this.inputForm.occurringUnit = this.$store.state.user.user.companyName // 发生单位
      this.inputForm.occurringUnitCode = companyId // 发生单位编码
      Promise.all([
        getDepartListSimple(),
        getAllUsersByCompany(companyId),
        getAllPostByCompanyFn(companyId),
      ])
        .then((res) => {
          this.departList = res[0].data.result || []
          this.userOptions = res[1].data.result || []
          // this.positionOptions = res[2].data.result || []
          //   this.filterUserOptions()
        })
        .catch((err) => {
          this.$message.error('获取列表失败')
        })
    },
  },
}
</script>

<template>
  <el-dialog
    title="上报事故"
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
            label="事故名称"
            prop="accidentName"
          >
            <el-input v-model="inputForm.accidentName" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="事故编号"
            prop="accidentNumber"
          >
            <el-input v-model="inputForm.accidentNumber" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item label="发生单位">
            <el-input
              v-model="inputForm.occurringUnit"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="发生地点"
            prop="placeOfOccurrence"
          >
            <el-input v-model="inputForm.placeOfOccurrence" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item label="发生部位">
            <el-input v-model="inputForm.locationOfOccurrence" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item label="发生时间">
            <el-date-picker
              v-model="inputForm.timeOfAccident"
              type="datetime"
              placeholder="选择日期时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-form-item label="受伤人员">
            <el-select
              v-model="inputForm.idOfTheInjuredPerson"
              multiple
              placeholder="请选择"
              style="width: 100%"
              filterable
              @change="changeInjuredPersonTable(inputForm.idOfTheInjuredPerson)"
            >
              <el-option
                v-for="item in userOptions"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="colWidth">
                    <el-form-item label="人员伤害情况">
                        <el-input v-model="inputForm.personnelInjury"></el-input>
                    </el-form-item>
                </el-col> -->
      </el-row>
      <!-- <el-row>
                <el-col :span="colWidth">
                    <el-form-item label="所属岗位">
                        <el-select v-model="inputForm.positionCode" placeholder="请选择" style="width: 100%" filterable>
                            <el-option v-for="item in positionOptions" :key="item.id" :label="item.postName" :value="item.id"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row> -->
      <!-- 表格 -->
      <el-table
        v-if="inputForm.idOfTheInjuredPerson.length > 0"
        ref="table"
        v-loading="loading"
        :data="tableData"
        size="mini"
        height="200px"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column
          label="序号"
          type="index"
          width="50"
        />
        <el-table-column
          label="姓名"
          prop="name"
          align="center"
        >
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.name"
              disabled
              class="cell-input"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="公司"
          prop="company"
          align="center"
        >
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.company"
              disabled
              class="cell-input"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="所属组织"
          prop="organization"
          align="center"
        >
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.organization"
              disabled
              class="cell-input"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="岗位"
          prop="post"
          align="center"
        >
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.post"
              disabled
              class="cell-input"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="人员伤害情况"
          prop="injurySituation"
          align="center"
        >
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.injurySituation"
              type="textarea"
              class="cell-input"
            />
          </template>
        </el-table-column>
      </el-table>
      <el-row>
        <el-col>
          <el-form-item label="事故简单描述">
            <el-input
              v-model="inputForm.accidentDescription"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item
          label="上传附件"
          style="width: 500px"
        >
          <FileUpload
            v-if="visible"
            v-bind="fileProp"
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
        :loading="loading"
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
</template>

<style scoped lang="scss"></style>
