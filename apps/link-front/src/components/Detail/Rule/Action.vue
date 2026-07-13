<script>
import { getAllDevice, getAllIoById } from '@/http/dev/manage-api'
import { getCommandById } from '@/http/dev/product-api'
import {
  addRuleAction,
  deleteRuleAction,
  editRuleAction,
  getRuleAction,
} from '@/http/rule/rule-api'
import { $checkNum } from '@/utils/validate'

export default {
  props: ['rid'],
  data: () => ({
    loading: false,
    tableData: [],
    drawer: false,
    drawerType: 0,
    drawerTitle: '',
    form: {
      actionCycle: 10, // 推送间隔， 默认10分钟
    },
    rules: {
      actionCycle: [{ required: true, trigger: 'blur', validator: $checkNum }],
    },
    submitLoading: false,
    actionList: [
      { name: '发送通知', value: 'SEND_MESSAGE' },
      // {name: '执行命令', value: 'EXECUTE_COMMAND'},
      { name: '设备写值', value: 'SET_IO_VALUE' },
      // {name: '执行脚本', value: 'EXECUTE_SCRIPT'}
    ],
    noticeList: [
      { name: '企业微信', value: 'QIYE_WECHAT' },
      { name: '短信', value: 'MESSAGE' },
      { name: '邮件', value: 'MAIL' },
      // {name: '语音', value: 'VOICE'}
    ],
    userList: [], // 联系人列表
    deviceList: [], // 设备列表
    commandList: [], // 命令列表
    paramList: [], // 命令参数列表
    paramForm: {},
    ioList: [], // 设备测点列表
    // 人员选择
    showPeopleDialog: false, // 选择人员弹框是否显示
    peopleProp: {
      listType: 'company',
      oldPickList: [],
    },
    checkedNoticeUserList: [], // 已选人员
  }),
  created() {
    this.getDataList()
    this.getDevList()
    this.tenantId = this.$store.state.user.user.tenantId
  },
  methods: {
    getDataList() {
      getRuleAction(this.rid)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            resD.result.forEach((item) => {
              // 获取的是数组，展示的话需要转为字符串
              item.displayNoticeUserNameList = item.noticeUserNameList.toString()
            })
            this.tableData = resD.result || []
          }
          else {
            this.$message.error(msg || '获取 规则动作 失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('获取 规则动作 失败')
        })
    },
    // 查询所有设备
    getDevList() {
      getAllDevice().then((res) => {
        const resD = res.data
        if (resD.success) {
          this.deviceList = resD.result || []
        }
      })
    },
    // 根据产品id, 获取命令数据
    getCommandByPid(id, fn) {
      getCommandById(id).then((res) => {
        const resD = res.data
        if (resD.success) {
          this.commandList = resD.result || []

          if (fn) {
            fn()
          }
        }
      })
    },
    // 根据设备id获取测点列表
    getIOsByDevId(id) {
      getAllIoById(id).then((res) => {
        const resD = res.data
        if (resD.success) {
          this.ioList = resD.result
        }
      })
    },

    // 新建动作
    addFn() {
      this.clearCheckedUsers()
      this.form = {
        actionCycle: 10, // 推送间隔， 默认10分钟
      }
      this.drawerTitle = '添加触发动作'
      this.drawerType = 0
      this.drawer = true
    },
    // 编辑动作
    editFn(v) {
      this.clearCheckedUsers()
      this.form = JSON.parse(JSON.stringify(v))
      this.drawerTitle = '修改触发动作'
      this.drawerType = 1
      this.drawer = true
      this.assignCheckedNoticeUsers(v)

      // 如果是 执行命令 则生成 命令列表 和 命令参数列表， 以及生成 命令参数表单
      if (v.actionType === 'EXECUTE_COMMAND' && v.actionDeviceId) {
        let i
        let tar
        const list = this.deviceList
        const len = list.length
        for (i = 0; i < len; i++) {
          tar = list[i]
          if (tar.id == v.actionDeviceId) {
            // 请求所属产品的命令数据
            this.getCommandByPid(tar.productId, () => {
              this.commandList.forEach((cmd) => {
                if (cmd.id == v.commandId) {
                  this.paramList = cmd.uDProductCmdParamList // 生成命令参数列表
                }
              })
            })
            break
          }
        }
        this.paramForm = JSON.parse(v.commandParams || '{}') // 生成命令参数表单
      }

      // 如果是 设备写值 则生成 io测点列表
      if (v.actionType === 'SET_IO_VALUE' && v.actionDeviceId) {
        this.getIOsByDevId(v.actionDeviceId)
      }
    },
    // 删除动作
    delFn(v) {
      this.$confirm('您确认要删除这个动作?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          deleteRuleAction(v.id)
            .then((res) => {
              const resD = res.data
              const msg = resD.message

              if (resD.success === true) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(msg || '删除失败')
              }
            })
            .catch((err) => {
              this.$message.error('删除失败')
            })
        })
        .catch(() => {})
    },
    // 提交
    submitFn() {
      this.form.noticeUserIdList = this.checkedNoticeUserList.map(item => item.id)
      this.form.noticeUserNameList = this.checkedNoticeUserList.map(item => item.fullName)
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true

        this.form.ruleId = this.rid // 添加当前的规则id
        // 如果是执行命令 则拼接命令参数
        if (this.form.actionType === 'EXECUTE_COMMAND') {
          let key
          let val
          const paramObj = {}
          Object.entries(this.paramForm).forEach((item) => {
            key = item[0]
            val = item[1]
            paramObj[key] = val
          })
          this.form.commandParams = JSON.stringify(paramObj)
          delete this.form.setValueIoCode // 删除设备写值相关的参数
        }
        // 如果是设备写值
        if (this.form.actionType === 'SET_IO_VALUE') {
          delete this.form.commandId // 删除设备命令相关的参数
        }

        // 添加
        if (this.drawerType === 0) {
          addRuleAction(this.form)
            .then((res) => {
              const resD = res.data
              const msg = resD.message
              this.submitLoading = false

              if (resD.success === true) {
                this.$message.success(msg || '添加成功')
                this.getDataList()
                this.drawer = false
              }
              else {
                this.$message.error(msg || '添加失败')
              }
            })
            .catch((err) => {
              this.submitLoading = false
              this.$message.error('添加失败')
            })
        }
        // 编辑
        else {
          editRuleAction(this.form)
            .then((res) => {
              const resD = res.data
              const msg = resD.message
              this.submitLoading = false

              if (resD.success === true) {
                this.$message.success(msg || '修改成功')
                this.getDataList()
                this.drawer = false
              }
              else {
                this.$message.error(msg || '修改失败')
              }
            })
            .catch((err) => {
              this.submitLoading = false
              this.$message.error('修改失败')
            })
        }
      })
    },

    // 动作类型 change
    actionFn(v) {
      // 清空上次所选
      // 新增
      if (this.drawerType === 0) {
        this.form = {
          actionCycle: this.form.actionCycle,
        }
      }
      // 编辑
      else {
        this.form = {
          id: this.form.id,
          actionCycle: this.form.actionCycle,
        }
      }
      this.form.actionType = v
    },
    // 通知方式 change
    noticeFn(v) {
      this.clearCheckedUsers() // 先清空上次选择的联系人
    },
    // 联系人 change
    // userFn(v) {
    //     // 在form 中记录 联系人姓名
    //     let i, tar, list = this.userList, len = list.length;
    //     for(i = 0; i < len; i++) {
    //         tar = list[i];
    //         if(tar.id == v) {
    //             this.form.noticeUserName = tar.username;
    //             break;
    //         }
    //     }
    // },
    // 设备 change
    devFn(v) {
      const actionType = this.form.actionType
      // 0.1 清空 命令、命令参数
      this.$set(this.form, 'commandId', '')
      this.commandList = []
      this.paramForm = {}

      // 0.2 清空设备写值相关内容
      this.ioList = []
      this.$set(this.form, 'setValueIoCode', '') // io的

      // 如果 设备写值 动作
      if (actionType === 'SET_IO_VALUE') {
        // 请求设备下的测点列表
        this.getIOsByDevId(v)
      }

      // 在form 中记录 设备名称
      let i
      let tar
      const list = this.deviceList
      const len = list.length
      for (i = 0; i < len; i++) {
        tar = list[i]
        if (tar.id == v) {
          this.form.actionDeviceName = tar.name
          // 如果 执行命令 动作
          if (actionType === 'EXECUTE_COMMAND') {
            // 请求所属产品的命令数据
            this.getCommandByPid(tar.productId)
          }
          break
        }
      }
    },
    // 命令 change
    commandFn(v) {
      // 清空命令参数
      this.paramForm = {}

      // 在form 中记录 命令名称
      let i
      let tar
      const list = this.commandList
      const len = list.length
      for (i = 0; i < len; i++) {
        tar = list[i]
        if (tar.id == v) {
          this.form.commandName = tar.name

          // 记录命令参数列表
          this.paramList = tar.uDProductCmdParamList || []
          break
        }
      }
    },
    pickPeopleClick() {
      this.peopleProp.oldPickList = this.checkedNoticeUserList
      this.showPeopleDialog = true
    },
    removePeople(index) {
      this.checkedNoticeUserList.splice(index, 1)
    },
    closePeopleEvt(res) {
      if (res) {
        const userData = res.data
        if (userData) {
          this.checkedNoticeUserList = userData.map((item) => {
            return {
              id: item.id,
              fullName: item.fullName,
            }
          })
        }
      }
      this.showPeopleDialog = false
    },
    // 赋值
    assignCheckedNoticeUsers({ noticeUserIdList = [], noticeUserNameList = [] }) {
      this.checkedNoticeUserList = noticeUserIdList.map((item, idx) => ({
        id: item,
        fullName: noticeUserNameList[idx],
      }))
    },
    clearCheckedUsers() {
      this.checkedNoticeUserList = []
    },
  },
}
</script>

<template>
  <div class="action-rule-template">
    <!-- 按钮 -->
    <el-row>
      <el-col :span="12">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="addFn"
        >
          添加执行动作
        </el-button>
      </el-col>
    </el-row>

    <!-- 内容 -->
    <el-row class="mid-con">
      <el-col :span="24">
        <el-table
          v-loading="loading"
          class="action-table"
          :data="tableData"
          size="mini"
          style="width: 100%"
          :header-cell-style="{ background: 'var(--ky-head-color)' }"
        >
          <el-table-column
            label="动作类型"
            prop="actionType"
            align="center"
          >
            <template slot-scope="props">
              <el-tag
                v-if="props.row.actionType === 'SEND_MESSAGE'"
                size="mini"
                type="warning"
              >
                发送通知
              </el-tag>
              <el-tag
                v-if="props.row.actionType === 'EXECUTE_COMMAND'"
                size="mini"
                type="success"
              >
                执行命令
              </el-tag>
              <el-tag
                v-if="props.row.actionType === 'SET_IO_VALUE'"
                size="mini"
                type="success"
              >
                设备写值
              </el-tag>
              <!-- <el-tag size="mini" v-if="props.row.actionType === 'EXECUTE_SCRIPT'" type="danger">执行脚本</el-tag> -->
            </template>
          </el-table-column>
          <el-table-column
            label="通知方式"
            prop="noticeType"
            align="center"
          >
            <template slot-scope="props">
              <span>
                {{
                  props.row.noticeType === 'QIYE_WECHAT'
                    ? '企业微信'
                    : props.row.noticeType === 'MESSAGE'
                      ? '短信'
                      : props.row.noticeType === 'MAIL'
                        ? '邮件'
                        : props.row.noticeType === 'VOICE'
                          ? '语音'
                          : ''
                }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="联系人"
            prop="displayNoticeUserNameList"
            align="center"
          />
          <!-- <el-table-column label="通知模板" prop="d" align='center'></el-table-column> -->
          <el-table-column
            label="设备"
            prop="actionDeviceName"
            align="center"
          />
          <el-table-column
            label="命令"
            prop="commandName"
            align="center"
          />
          <el-table-column
            label="脚本"
            prop="scriptName"
            align="center"
          />
          <el-table-column
            label="测点"
            prop="setValueIoCode"
            align="center"
          />
          <el-table-column
            label="测点值"
            prop="setValue"
            align="center"
          />
          <el-table-column
            label="操作"
            width="150"
            align="right"
          >
            <template slot-scope="scope">
              <EButton
                icon="edit"
                size="mini"
                type="text"
                @click="editFn(scope.row)"
              >
                编辑
              </EButton>
              <EButton
                icon="delete"
                size="mini"
                type="text"
                @click="delFn(scope.row)"
              >
                删除
              </EButton>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <!-- 添加/编辑 抽屉 -->
    <el-drawer
      v-if="drawer"
      :visible.sync="drawer"
      :with-header="false"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        {{ drawerTitle }}
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-form
          ref="form"
          :model="form"
          label-width="85px"
          :rules="rules"
          size="mini"
          tabindex="0"
        >
          <el-form-item
            label="推送间隔"
            prop="actionCycle"
          >
            <el-input
              v-model="form.actionCycle"
              placeholder="请输入动作执行周期"
            >
              <template slot="append">
                分钟
              </template>
            </el-input>
          </el-form-item>
          <el-form-item
            label="动作类型"
            prop="actionType"
          >
            <el-select
              v-model="form.actionType"
              placeholder="请选择"
              style="width: 100%"
              @change="actionFn"
            >
              <el-option
                v-for="item in actionList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="form.actionType === 'SEND_MESSAGE'"
            label="通知方式"
            prop="noticeType"
          >
            <el-select
              v-model="form.noticeType"
              placeholder="请选择"
              style="width: 100%"
              @change="noticeFn"
            >
              <el-option
                v-for="item in noticeList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="form.actionType === 'SEND_MESSAGE'"
            label="联系人"
            prop="noticeUserNameList"
          >
            <div class="pick-box">
              <div
                v-if="checkedNoticeUserList.length"
                style="margin-right: 8px"
              >
                <el-tag
                  v-for="(item, index) in checkedNoticeUserList"
                  :key="item.id"
                  :closable="true"
                  @close="removePeople(index)"
                >
                  {{ item.fullName }}
                </el-tag>
              </div>
              <el-button
                type="primary"
                @click="pickPeopleClick"
              >
                选择人员
              </el-button>
            </div>
          </el-form-item>
          <!-- <el-form-item label="通知模板" prop="d">
                        <el-select v-model="form.d" placeholder="请选择" clearable style="width: 100%;">
                            <el-option label="低电压警告" value="1"></el-option>
                            <el-option label="流量不足警告" value="2"></el-option>
                            <el-option label="温度异常警告" value="3"></el-option>
                        </el-select>
                    </el-form-item> -->
          <el-form-item
            v-if="form.actionType === 'EXECUTE_COMMAND' || form.actionType === 'SET_IO_VALUE'"
            label="设备"
            prop="actionDeviceId"
          >
            <el-select
              v-model="form.actionDeviceId"
              placeholder="请选择"
              style="width: 100%"
              filterable
              @change="devFn"
            >
              <el-option
                v-for="item in deviceList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="form.actionType === 'EXECUTE_COMMAND'"
            label="命令"
            prop="commandId"
          >
            <el-select
              v-model="form.commandId"
              placeholder="请选择"
              style="width: 100%"
              filterable
              @change="commandFn"
            >
              <el-option
                v-for="item in commandList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <!-- 命令参数 -->
          <template v-if="form.commandId">
            <el-form-item
              v-for="cmd in paramList"
              :key="cmd.id"
              :label="cmd.name"
              :prop="cmd.code"
            >
              <el-input v-model="paramForm[cmd.code]" />
            </el-form-item>
          </template>

          <!-- 设备写值 -->
          <template v-if="form.actionType === 'SET_IO_VALUE'">
            <el-form-item
              label="选择测点"
              prop="setValueIoCode"
            >
              <el-select
                v-model="form.setValueIoCode"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="item in ioList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.code"
                >
                  <span>{{ item.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="写入值"
              prop="setValue"
            >
              <el-input v-model="form.setValue" />
            </el-form-item>
          </template>

          <!-- <el-form-item label="脚本" prop="g" v-if="form.actionType === 'EXECUTE_SCRIPT'">
                        <el-select v-model="form.g" placeholder="请选择" clearable style="width: 100%;">
                            <el-option label="脚本1" value="1"></el-option>
                            <el-option label="脚本2" value="2"></el-option>
                            <el-option label="脚本3" value="3"></el-option>
                        </el-select>
                    </el-form-item> -->
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            :loading="submitLoading"
            @click="submitFn"
          >
            提交
          </el-button>
        </div>
      </div>
    </el-drawer>
    <el-dialog
      class="fixed-dialog"
      title="选择人员"
      :visible.sync="showPeopleDialog"
      width="80%"
      append-to-body
      :close-on-click-modal="false"
    >
      <KyPickPeople
        v-if="showPeopleDialog"
        v-bind="peopleProp"
        @close="closePeopleEvt"
      />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.action-rule-template {
  position: relative;
  padding: 10px;
  .mid-con {
    padding: 2vh 0;
    .action-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
}
.pick-box {
  display: flex;
}
</style>
