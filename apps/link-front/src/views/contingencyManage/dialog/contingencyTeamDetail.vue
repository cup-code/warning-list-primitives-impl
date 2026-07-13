<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import {
  addTeam,
  getByIdTeam,
  updateTeam,
} from '@/http/contingency/contingencyTeam.js' // 应急队伍接口路径
import { upLoadImg } from '@/http/manage-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import FileUpload from '@/views/common-ui/FileUpload'
import PickPeople from '@/views/common-ui/PickPeople'

export default {
  components: {
    TreeSelect,
    FileUpload,
    PickPeople,
  },
  data() {
    return {
      visible: false,
      loading: false,
      colWidth: 12,
      departList: [], // 部门列表
      personList: [], // 所有的人员列表
      personListShow: [], // 页面中展示的人员列表
      dataRule: {
        teamType: [
          {
            required: true,
            message: '队伍类型不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        name: [
          {
            required: true,
            message: '队伍名称不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        department: [
          {
            required: true,
            message: '组长部门不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        leaderName: [
          {
            required: true,
            message: '组长姓名不能为空',
            leaderNametrigger: 'blur',
          },
        ],
      },
      tableData: [], // 表格数据
      method: '',
      inputForm: {
        id: '',
        teamType: '', // 队伍类型
        name: '', // 队伍名称
        department: '', // 组长部门
        leaderName: '', // 组长姓名
        leaderPhone: '', // 组长电话
        docPath: '', // 上传文件
      },
      fileProp: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 1, // 最大文件上传数量
        deleteFront: true,
        editable: true,
      },
      userData: {},

      userType: 1, // 1：队长；2：队员
      curMember: {}, // 记录当前队员
      showPeopleDialog: false,
      peopleProp: {}, // 选择人员组件传递信息
    }
  },
  created() {
    this.userData = JSON.parse(sessionStorage.getItem('user'))
    this.inputForm.companyId = this.userData.companyId
    this.inputForm.companyName = this.userData.companyName
    getDepartListSimple()
      .then((res) => {
        this.departList = (res.data.result || []).filter((item) => {
          return item.departmentType === 'DEPARTMENT'
        })
      })
      .catch((err) => {
        this.$message.error('获取列表失败')
      })
  },

  methods: {
    closeDialog() {
      this.tableData = [] // 重置表格
      this.inputForm = {}
      this.fileProp.oldFileList = [] // 重置上传附件
      this.$refs.inputForm.resetFields()
    },

    // 部门下拉列表选择回调
    depChangeEvt(id, name) {
      this.inputForm.department = id || ''
      this.$refs.treeSelect.closeSelect()
    },
    init(row, method) {
      this.visible = true
      this.method = method
      if (row) {
        if (row.docPath) {
          this.fileProp.oldFileList = [
            {
              originalName: row.docPath,
              attachmentName: row.docPath,
              filePath: row.docPath,
            },
          ]
        }
        this.getByIdTeamFn(row.id)
      }
    },
    getByIdTeamFn(id) {
      getByIdTeam(id).then((res) => {
        if (res.code == 200) {
          this.inputForm = {
            id: res.result.id,
            teamType: res.result.teamType, // 队伍类型
            name: res.result.name, // 队伍名称
            department: res.result.department, // 组长部门
            leaderName: res.result.leaderName, // 组长姓名
            leaderId: res.result.leaderId, // 组长id
            leaderPhone: res.result.leaderPhone, // 组长电话
            docPath: res.result.docPath, // 上传文件
            companyId: this.userData.companyId,
            companyName: this.userData.companyName,
          }
          this.tableData = res.result.teamMembers
        }
      })
    },
    // 添加队员
    addUser() {
      const _commodity = {
        fullName: '',
        phone: '',
        remark: null,
      }
      this.tableData.unshift(_commodity)
    },
    // 删除队员
    delUser(index) {
      this.tableData.splice(index, 1)
    },
    uploadEvt(fileList) {
      if (fileList.length) {
        upLoadImg(fileList[0], 'DOC_PATH').then(({ data }) => {
          if (data.success) {
            this.inputForm.docPath = data.result
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.inputForm.docPath = ''
      }
    },
    // 删除附件
    delDocPath() {
      this.inputForm.docPath = ''
    },
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          let params, funcFn
          params = Object.assign(this.inputForm, {
            teamMembers: this.tableData,
            classify: 1,
          })
          if (this.method === 'edit') {
            funcFn = updateTeam // 编辑
          }
          else {
            funcFn = addTeam // 新增
          }
          funcFn(params)
            .then((data) => {
              if (data.success) {
                this.$message.success(data.message || '提交成功')
                this.$emit('refreshList') // 执行回调函数
                this.visible = false
              }
              else {
                this.$message.warning(data.message || '提交失败')
              }
            })
            .catch(() => {
              this.$message.error('提交失败')
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },

    // 选择队长
    choosePeople() {
      this.userType = 1
      this.peopleProp.oldPickData = {
        id: this.inputForm.leaderId || '',
        fullName: this.inputForm.leaderName || '',
      }
      this.peopleProp.isSingle = true
      this.peopleProp.listType = 'company'
      this.showPeopleDialog = true
    },
    // 选择队员
    chooseMember(v) {
      this.userType = 2
      this.curMember = v
      this.peopleProp.oldPickData = {
        id: v.userId || '',
        fullName: v.fullName || '',
      }
      this.peopleProp.isSingle = true
      this.peopleProp.listType = 'company'
      this.showPeopleDialog = true
    },
    // 选择人之后的回调
    closePeopleEvt(params) {
      if (params && this.userType === 1) {
        // 队长
        this.inputForm.leaderId = params.data.id
        // this.inputForm.leaderName = params.data.fullName;
        this.$set(this.inputForm, 'leaderName', params.data.fullName)
        this.inputForm.leaderPhone = params.data.mobile
      }
      else if (params && this.userType === 2) {
        // 队员
        this.curMember.userId = params.data.id
        this.curMember.fullName = params.data.fullName
        this.curMember.phone = params.data.mobile
      }

      this.showPeopleDialog = false
    },
  },
}
</script>

<template>
  <div>
    <el-dialog
      :title="`${method == 'add' ? '新增' : method == 'edit' ? '修改' : '查看'}应急队伍`"
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
        :disabled="method === 'view'"
        @submit.native.prevent
      >
        <el-row>
          <el-col :span="colWidth">
            <el-form-item
              label="队伍类型"
              prop="teamType"
            >
              <el-select
                v-model="inputForm.teamType"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('teamType')"
                  :key="item.id"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="colWidth">
            <el-form-item
              label="队伍名称"
              prop="name"
            >
              <el-input v-model="inputForm.name" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="colWidth">
            <el-form-item
              label="组长部门"
              prop="department"
            >
              <!-- <TreeSelect
                            style="width: 100%"
                            ref="treeSelect"
                            :list="this.departList"
                            :props="{
                                value: 'id',
                                label: 'departmentName',
                                children: 'children'
                            }"
                            :value="inputForm.department"
                            :label="inputForm.responsibilityDeptName"
                            @getValue="depChangeEvt"
                        /> -->

              <el-select
                v-model="inputForm.department"
                placeholder="请选择"
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="item in departList"
                  :key="item.id"
                  :label="item.departmentName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="colWidth">
            <el-form-item
              label="组长姓名"
              prop="leaderName"
            >
              <el-input
                v-model="inputForm.leaderName"
                readonly
                @focus="choosePeople"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="colWidth">
            <el-form-item
              label="组长电话"
              prop="leaderPhone"
            >
              <el-input v-model="inputForm.leaderPhone" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-form-item
            label="文档附件"
            style="width: 500px"
            prop="docPath"
          >
            <FileUpload
              v-if="visible"
              v-bind="fileProp"
              @upload="uploadEvt"
              @delSucc="delDocPath"
            />
          </el-form-item>
        </el-row>

        <el-row>
          <el-col :span="colWidth">
            <el-form-item
              label="添加队员"
              style="width: 500px"
            >
              <el-button
                size="small"
                type="primary"
                @click="addUser"
              >
                添加队员
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 表格 -->
      <el-table
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
          label="队员姓名"
          prop="fullName"
          align="center"
        >
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.fullName"
              :disabled="method === 'view'"
              readonly
              @focus="chooseMember(scope.row)"
            />
          </template>
        </el-table-column>

        <el-table-column
          label="队员电话"
          prop="phone"
          align="center"
        >
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.phone"
              :disabled="method === 'view'"
              class="cell-input"
            />
          </template>
        </el-table-column>

        <el-table-column
          label="备注"
          prop="remark"
          align="center"
        >
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.remark"
              :disabled="method === 'view'"
              class="cell-input"
            />
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          min-width="50"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              :disabled="method === 'view'"
              type="text"
              style="color: var(--ky-danger)"
              size="mini"
              @click="delUser(scope.$index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          size="small"
          @click="visible = false"
        >关闭</el-button>
        <el-button
          v-if="method !== 'view'"
          size="small"
          type="primary"
          :loading="loading"
          @click="doSubmit()"
        >确定</el-button>
      </span>
    </el-dialog>

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
