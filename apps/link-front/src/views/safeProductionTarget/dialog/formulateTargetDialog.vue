/* * @Author: xiaorui 制定责任目标弹框 * @Date: 2023-04-20 10:49:14 * @Last Modified by: xiaorui *
@Last Modified time: 2023-11-10 17:25:20 */
<script>
import SelectTree from '@/components/treeSelect/treeSelect'
import { upLoadImg } from '@/http/manage-api'
import {
  getAllDepartByCompanyFn,
  getAllDepartByDepartFn,
  getDepartStaffingWithName,
} from '@/http/safe-production/depart-manage-api'
import { getUserTypeFn } from '@/http/safe-production/user-manage-api'
import {
  getTargetDetailByIdFn,
  saveTargetFn,
  signTargetFn,
  updateTargetFn,
} from '@/http/safeProductionTarget/safe-production-target-api'
import { fzyGetUserByDepId } from '@/http/user-api'
import FileUpload from '@/views/common-ui/FileUpload'
import PickPeople from '@/views/common-ui/PickPeople.vue'

export default {
  components: {
    SelectTree,
    FileUpload,
    PickPeople,
  },
  data() {
    return {
      visible: false,
      loading: false,
      colWidth: 8,
      title: '安全生产目标',
      method: '',
      dutyDepartmentList: [], // 责任单位的下拉数据列表
      inputForm: {
        id: '', // 新增的时候没有
        initiatorId: '', // 下发人id
        initiatorDepId: '', // 下起人部门id
        targetLevel: '', // 层级
        // 责任目标内容列表
        itemDTOList: [],
        signType: '', // 签署类型：0正常签署，1岗位变动，2新员工
        signUserNum: '', // 签署人数，默认为1，层级为工段时，人数为工段下所有人数
        docPath: '', // 签署时上传的附件
      },
      initiatorList: [], // 发起人列表，新增时为当前登录人员。
      initiatorDepList: [], // 发起人部门列表，新增时为当前登录人员部门
      dataRule: {
        targetLevel: [{ required: true, message: '请选择层级', trigger: 'change' }],
        signType: [{ required: true, message: '请选择签署类型', trigger: 'change' }],
        docPath: [
          {
            required: true,
            message: '请上传安全生产目标责任书',
            trigger: 'change',
          },
        ],
      },
      showPeopleDialog: false, // 选择人员弹框
      peopleProp: {}, // 选择人员组件传递信息
      userType: '', // 用户类型：1：集团级，2：分子公司安环部，3：分子公司非安环部
      dutyDepartNameList: [], // 提示里的责任单位数组
      // 签署时上传附件的属性
      signFileProp: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 1, // 最大文件上传数量
        deleteFront: true,
        editable: true,
      },
    }
  },
  created() {
    const userData = JSON.parse(sessionStorage.getItem('user'))
    getUserTypeFn()
      .then(({ data }) => {
        if (data.success) {
          // 用户类型：1：集团级，2：分子公司安环部，3：分子公司非安环部
          // 集团级可设置4个层级，分子公司安环部可设置3个层级，分子公司非安环部可设置两个层级
          // 类型为1、2时，获取的责任单位列表为登录人所属公司的组织机构；类型为3时，获取的责任单位列表为登录人所属部门的组织架构
          this.userType = data.result
          let func = null
          let paramId = ''
          if (this.userType === '1' || this.userType === '2') {
            func = getAllDepartByCompanyFn
            paramId = userData.companyId
          }
          else {
            func = getAllDepartByDepartFn
            paramId = userData.departmentId
          }
          func(paramId).then(({ data }) => {
            this.dutyDepartmentList = data.result || []
          })
        }
      })
      .catch((err) => {
        this.$message.error('获取用户信息失败')
      })
  },
  methods: {
    init(method, id) {
      this.method = method
      this.visible = true
      const userData = JSON.parse(sessionStorage.getItem('user'))
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        if (method === 'add') {
          this.title = '新增安全生产目标'
          this.initiatorList = [
            {
              id: userData.id,
              fullName: userData.fullName,
            },
          ]
          this.initiatorDepList = [
            {
              id: userData.departmentId,
              departmentName: userData.departmentName,
            },
          ]
          this.inputForm.id = ''
          this.inputForm.itemDTOList = []
          this.dutyDepartNameList = []
          // 发起人默认为当前登录人
          this.inputForm.initiatorId = userData.id
          this.inputForm.initiatorDepId = userData.departmentId
        }
        else if (method === 'view' || method === 'edit' || method === 'sign') {
          getTargetDetailByIdFn(id).then(({ data }) => {
            const itemList = data.result.itemList || []
            this.initiatorList = [
              {
                id: data.result.initiatorId,
                fullName: data.result.initiatorName,
              },
            ]
            this.initiatorDepList = [
              {
                id: data.result.initiatorDepId,
                departmentName: data.result.initiatorDepName,
              },
            ]
            itemList.forEach((item) => {
              item.assessRateShow = item.assessRate * 100
              item.targetList.forEach((tar) => {
                tar.typeName = this.$dictUtils.getDictLabel('safe_duty_target', tar.type)
              })
              // 获取每行可选的责任组织列表
              getAllDepartByDepartFn(item.dutyDepartId).then(({ data }) => {
                // item.departmentList = data.result || []
                this.$set(item, 'departmentList', data.result || [])
              })
              // 获取每行的附件信息
              item.fileProp = {
                oldFileList: item.docPath
                  ? [
                      {
                        originalName: item.docPath,
                        attachmentName: item.docPath,
                        filePath: item.docPath,
                      },
                    ]
                  : [], // 展示的文件列表
                fileLimit: 1, // 最大文件上传数量
                deleteFront: true,
                editable: false,
              }
            })
            data.result.itemDTOList = itemList
            this.inputForm = this.recover(this.inputForm, data.result)
            this.setDutyDepartNameList()
            if (method === 'sign') {
              this.signFileProp.oldFileList = []
              if (this.inputForm.targetLevel === 4) {
                // 签署时，如果是工段级的，需要获取签署部门下的人数
                fzyGetUserByDepId(this.inputForm.itemDTOList[0].departmentId).then(({ data }) => {
                  const result = data.result || []
                  this.inputForm.signUserNum = result.length
                })
              }
              else {
                this.inputForm.signUserNum = 1
              }
            }
          })
          this.title = method === 'view' ? '查看安全生产目标' : '修改安全生产目标'
        }
      })
    },
    // 添加目标
    addClick() {
      this.inputForm.itemDTOList.push({
        dutyDepartId: '', // 责任单位
        dutyDepartName: '', // 责任单位name
        docPath: '', // 附件
        targetList: [
          {
            type: 1,
            typeName: '责任轻微伤',
            value: 0,
          },
          {
            type: 2,
            typeName: '责任轻伤',
            value: 0,
          },
          {
            type: 3,
            typeName: '责任重伤',
            value: 0,
          },
          {
            type: 4,
            typeName: '责任死亡事故',
            value: 0,
          },
        ], // 安全责任目标和指标数量
        assessTotal: 0, // 提取考核基金
        assessRate: 0, // 提取比例，向后台传的，需要小数
        assessRateShow: 0, // 提取比例，输入框中展示的
        assessCount: 0, // 实际提取金额
        departmentId: '', // 责任组织部门
        departmentName: '', // 责任组织部门name
        departmentType: '', // 责任组织部门type
        signPeople: [], // 签署人员
        // 每行数据上传文件的属性，不需要传给后台
        fileProp: {
          oldFileList: [], // 展示的文件列表
          fileLimit: 1, // 最大文件上传数量
          deleteFront: true,
          editable: true,
        },
        // 每行数据可选的责任组织部门，不需要传给后台
        departmentList: [],
      })
    },
    copyClick() {
      if (this.inputForm.itemDTOList.length) {
        const len = this.inputForm.itemDTOList.length
        const LastRow = JSON.parse(JSON.stringify(this.inputForm.itemDTOList[len - 1]))
        this.inputForm.itemDTOList.push(LastRow)
      }
    },
    // 删除表格数据
    deleteClick(index) {
      this.inputForm.itemDTOList.splice(index, 1)
      this.setDutyDepartNameList()
    },
    // 设置责任单位的id和name
    setDutyDepartId(id, name, row) {
      this.$refs.dutyDepTree.closeSelect()
      if (id) {
        row.dutyDepartId = id
        row.dutyDepartName = name
        // 添加到dutyDepartNameList
        this.setDutyDepartNameList()
        // 获取当前行可选的责任组织列表
        getAllDepartByDepartFn(id).then(({ data }) => {
          const result = data.result || []
          // 如果层级是工段级的，签署责任组织只能选择工段
          if (this.inputForm.targetLevel === 4) {
            result.forEach((item) => {
              // 不是工段类型的不可选择
              if (item.departmentType !== 'WORK_SECTION') {
                item.onlyTreeUse = true
              }
            })
          }
          this.$set(row, 'departmentList', result)
        })
      }
    },
    // 设置提示里展示的责任单位
    setDutyDepartNameList() {
      this.dutyDepartNameList = []
      this.inputForm.itemDTOList.forEach((item) => {
        if (!this.dutyDepartNameList.includes(item.dutyDepartName)) {
          this.dutyDepartNameList.push(item.dutyDepartName)
        }
      })
    },
    // 设置签署的责任组织id
    setSignDepartId(id, name, node, row) {
      if (id) {
        row.signPeople = []
        row.departmentId = id
        row.departmentName = name
        // 保存类型，用于判断能否选择人员，未工段类型时，不可选人
        row.departmentType = node.departmentType
        // 如果签署的责任组织是工段类型，则签署人员为工段长，不可修改
        if (node.departmentType === 'WORK_SECTION') {
          getDepartStaffingWithName(id).then(({ data }) => {
            if (data.success && data.result['2']) {
              const result = data.result['2']
              row.signPeople = [
                {
                  id: result[0].id,
                  fullName: result[0].fullName,
                },
              ]
            }
            else {
              this.$message.warning('未获取到工段负责人')
            }
          })
        }
      }
    },
    // 上传附件
    uploadEvt(fileList, row) {
      if (fileList.length) {
        upLoadImg(fileList[fileList.length - 1], 'DOC_PATH').then(({ data }) => {
          if (data.success) {
            row.docPath = data.result
          }
          else {
            this.$message.warning(data.message || '上传失败')
          }
        })
      }
      else {
        row.docPath = ''
      }
    },
    // 删除附件
    delDocPath(row) {
      row.docPath = ''
    },
    // 选择签署人员
    pickPeopleClick(row) {
      if (!row.departmentId) {
        this.$message.warning('请先选择责任组织')
        return
      }
      this.currentRow = row
      this.peopleProp.oldPickList = row.signPeople
      this.peopleProp.listType = 'system'
      this.peopleProp.departmentId = row.departmentId
      this.showPeopleDialog = true
    },
    // 移除签署人员
    removePeople(index, row) {
      row.signPeople.splice(index, 1)
    },
    // 选择人员后回调
    closePeopleEvt(params) {
      if (params) {
        // console.log(params.data)
        this.currentRow.signPeople = params.data.map((item) => {
          return {
            id: item.id,
            fullName: item.fullName,
          }
        })
      }
      this.showPeopleDialog = false
    },
    // 签署时上传附件的回调
    uploadSignEvt(fileList) {
      if (fileList.length) {
        upLoadImg(fileList[fileList.length - 1], 'DOC_PATH').then(({ data }) => {
          if (data.success) {
            this.inputForm.docPath = data.result
          }
          else {
            this.$message.warning(data.message || '上传失败')
          }
        })
      }
      else {
        this.inputForm.docPath = ''
      }
    },
    // 移除签署时上传的附件
    delSignDocPath() {
      this.inputForm.docPath = ''
    },
    // 表单提交
    doSubmit() {
      const isEveryItem = this.inputForm.itemDTOList.every((item) => {
        return item.dutyDepartId && item.docPath && item.departmentId && item.signPeople.length
      })
      if (!isEveryItem) {
        this.$message.warning('请完善责任单位信息')
        return
      }
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          const {
            id,
            initiatorId,
            initiatorDepId,
            targetLevel,
            itemDTOList,
            signType,
            signUserNum,
            docPath,
          } = this.inputForm
          // 删除不需要向后台传的字段
          itemDTOList.forEach((item) => {
            delete item.fileProp
            delete item.departmentList
            item.assessRate = item.assessRateShow / 100
          })
          let params = {}
          let funcFn
          if (this.method === 'add') {
            params = { initiatorId, initiatorDepId, targetLevel, itemDTOList }
            funcFn = saveTargetFn
          }
          else if (this.method === 'edit') {
            params = {
              id,
              initiatorId,
              initiatorDepId,
              targetLevel,
              itemDTOList,
            }
            funcFn = updateTargetFn
          }
          else if (this.method === 'sign') {
            params = { targetId: id, signType, signUserNum, docPath }
            funcFn = signTargetFn
          }
          // console.log(params)
          funcFn(params)
            .then(({ data }) => {
              if (data && data.success) {
                this.$message.success(data.message || '保存成功')
                this.visible = false
                this.$emit('refreshDataList')
              }
              else {
                this.$message.warning(data.message || '保存失败')
              }
            })
            .catch((err) => {
              this.$message.error('保存失败')
            })
            .finally(() => {
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
    :append-to-body="true"

    :visible.sync="visible"
    class="normal-dialog"
    width="1200px"
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
            label="下发人"
            prop="initiatorId"
          >
            <el-select
              v-model="inputForm.initiatorId"
              placeholder="请选择"
              style="width: 100%"
              disabled
            >
              <el-option
                v-for="item in initiatorList"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="下发单位"
            prop="initiatorDepId"
          >
            <el-select
              v-model="inputForm.initiatorDepId"
              placeholder="请选择"
              style="width: 100%"
              disabled
            >
              <el-option
                v-for="item in initiatorDepList"
                :key="item.id"
                :label="item.departmentName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            prop="targetLevel"
            label="层级"
          >
            <el-select
              v-model="inputForm.targetLevel"
              placeholder="请选择"
              filterable
              style="width: 100%"
              :disabled="method !== 'add'"
            >
              <!-- 用户类型为2分子公司安环部，可选分子公司、部门、工段三个层级；用户类型为2分子公司非安环部，可选部门、工段两个层级 -->
              <el-option
                v-for="item in $dictUtils.getDictList('target_level')"
                :key="item.id"
                :label="item.dictName"
                :value="+item.dictCode"
                :disabled="
                  (userType === '2' && item.dictCode === '1')
                    || (userType === '3' && (item.dictCode === '1' || item.dictCode === '2'))
                "
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-button
        v-if="method === 'add'"
        icon="el-icon-plus"
        type="primary"
        plain
        style="margin-bottom: 10px"
        @click="addClick"
      >
        新增
      </el-button>
      <el-button
        v-if="method === 'add' && inputForm.itemDTOList.length"
        icon="el-icon-document-copy"
        type="primary"
        plain
        style="margin-bottom: 10px"
        @click="copyClick"
      >
        复制
      </el-button>
      <el-table
        :data="inputForm.itemDTOList"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        style="margin-bottom: 10px"
      >
        <el-table-column
          label="序号"
          type="index"
          width="50"
        />
        <el-table-column
          align="center"
          label="责任单位"
          min-width="160"
        >
          <template slot-scope="scope">
            <SelectTree
              ref="dutyDepTree"
              style="width: 150px"
              :list="dutyDepartmentList"
              :props="{
                value: 'id',
                label: 'departmentName',
                children: 'children',
              }"
              :value="scope.row.dutyDepartId"
              :label="scope.row.dutyDepartName"
              :disabled="method !== 'add'"
              @getValue="(val, name) => setDutyDepartId(val, name, scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="上传附件"
          min-width="400"
        >
          <template slot-scope="scope">
            <FileUpload
              v-bind="scope.row.fileProp"
              @upload="uploadEvt($event, scope.row)"
              @delSucc="delDocPath(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="安全责任目标"
          min-width="130"
        >
          <template slot-scope="scope">
            <el-input
              v-for="item in scope.row.targetList"
              :key="item.type"
              v-model="item.typeName"
              style="height: 30px; width: 120px; margin: 6px 0"
              readonly
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="指标数量"
          min-width="130"
        >
          <template slot-scope="scope">
            <el-input-number
              v-for="item in scope.row.targetList"
              :key="item.type"
              v-model="item.value"
              controls-position="right"
              :min="0"
              style="height: 30px; width: 120px; margin: 6px 0"
              :disabled="method === 'sign'"
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="提取考核基金(元)"
          min-width="130"
        >
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.assessTotal"
              controls-position="right"
              :min="0"
              style="width: 120px"
              :disabled="method === 'sign'"
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="提取比例"
          min-width="130"
        >
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.assessRateShow"
              controls-position="right"
              :min="0"
              style="width: 90px; display: inline-block"
              :disabled="method === 'sign'"
            />
            %
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="实际提取金额"
          min-width="130"
        >
          <template slot-scope="scope">
            {{ scope.row.assessTotal * (scope.row.assessRateShow / 100) }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="责任组织"
          min-width="160"
        >
          <template slot-scope="scope">
            <SelectTree
              style="width: 150px"
              :list="scope.row.departmentList"
              :props="{
                value: 'id',
                label: 'departmentName',
                children: 'children',
              }"
              :value="scope.row.departmentId"
              :label="scope.row.departmentName"
              :disabled="method !== 'add'"
              @getValue="(val, name, node) => setSignDepartId(val, name, node, scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="签署人员"
          min-width="160"
        >
          <template slot-scope="scope">
            <el-button
              v-if="method === 'add' && scope.row.departmentType !== 'WORK_SECTION'"
              type="primary"
              @click="pickPeopleClick(scope.row)"
            >
              选择人员
            </el-button>
            <el-tag
              v-for="(item, index) in scope.row.signPeople"
              :key="item.id"
              class="pick-box-tag"
              :closable="method === 'add' && scope.row.departmentType !== 'WORK_SECTION'"
              @close="removePeople(index, scope.row)"
            >
              {{ item.fullName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="method === 'add'"
          label="操作"
          align="center"
          width="100"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              style="color: var(--ky-danger)"
              type="text"
              @click="deleteClick(scope.$index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-tag
        v-if="dutyDepartNameList.length"
        type="warning"
      >
        提示：当前已添加 {{ dutyDepartNameList.length }} 个责任单位：{{
          dutyDepartNameList.join('，')
        }}
      </el-tag>
      <template v-if="method === 'sign'">
        <el-row>
          <el-col :span="colWidth">
            <el-form-item
              label="签署类型"
              prop="signType"
            >
              <el-select
                v-model="inputForm.signType"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('target_sign_type')"
                  :key="item.id"
                  :label="item.dictName"
                  :value="+item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="colWidth">
            <el-form-item
              label="签署人员数量"
              prop="signUserNum"
            >
              <el-input
                v-model="inputForm.signUserNum"
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item
            label="安全生产目标责任书"
            prop="docPath"
          >
            <FileUpload
              v-bind="signFileProp"
              @upload="uploadSignEvt"
              @delSucc="delSignDocPath"
            />
          </el-form-item>
        </el-row>
      </template>
    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        style="margin: 0 10px 0 0"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        v-if="method !== 'view'"
        v-noMoreClick
        size="small"
        type="primary"
        @click="doSubmit()"
      >确定</el-button>
    </span>
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
  </el-dialog>
</template>
