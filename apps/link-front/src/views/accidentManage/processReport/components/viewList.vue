<!-- @description：addProcess 新增修改处置报告  -->
<!--  @modified By：  -->
<!--  @version: 1.0.0  -->
<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import FileUpload from '@/views/common-ui/FileUpload'
import UnitInfo from '../../../doubleDefense/shandong/riskControl/components/UnitInfo.vue'
import SafePlanInfo from '../../../doubleDefense/shandong/safeCheck/safePlan.vue'
import OtherInfo from './otherInfo.vue'

export default {
  name: 'addAccident',
  components: {
    FileUpload,
    TreeSelect,
    UnitInfo,
    SafePlanInfo,
    OtherInfo,
  },
  data() {
    return {
      planreportList: [
        { label: '风险分析', value: '风险分析' },
        { label: '隐患排查计划', value: '隐患排查计划' },
        { label: '其他', value: '其他' },
      ],
      dialogTitle: '', // 弹窗标题
      showInfoDialog: false, // 是否显示编辑弹窗
      showInfoDialogSafe: false,
      showInfoDialogOther: false,
      showInfoDialogOther: false,
      propData: {}, // 弹窗绑定数据
      loading: false,
      filterUserList: '',
      personListShow: [],
      flag: true,
      flag_two: true,
      colWidth: 12,
      visible: false,
      inputForm: {
        planreport: '',
        report: [
          {
            leaderName: '',
            leaderPhone: '',
            leader: '',
          },
        ],
        planreport: [
          {
            leaderName: '',
            leaderPhone: '',
            leader: '',
          },
        ],
      },
      fileProp: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 1, // 最大文件上传数量
        deleteFront: true,
        editable: true,
      },

      dataRule: {
        teamType: [
          {
            required: true,
            message: '事故名称不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        name: [
          {
            required: true,
            message: '事故编号不能为空',
            leaderNametrigger: 'blur',
          },
        ],
      },
    }
  },
  methods: {
    uploadEvt() {},
    delDocPath() {},

    getDepartmentId() {},
    doSubmit() {},
    addNormal(val) {
      if (val == '风险分析') {
        this.showDialog('新增风险分析单元', true)
      }
      else if (val == '隐患排查计划') {
        this.showDialog('新增隐患排查计划', true)
      }
      else if (val == '其他') {
        this.showDialog('其他处置措施任务', true)
      }
    },
    /* 展示弹窗 */
    showDialog(title, editable, info) {
      this.dialogTitle = title
      if (title == '新增风险分析单元') {
        this.showInfoDialog = true
      }
      else if (title == '新增隐患排查计划') {
        this.showInfoDialogSafe = true
      }
      else if (title == '其他处置措施任务') {
        this.showInfoDialogOther = true
      }
    },
    /* 关闭弹窗事件 */
    closeDialogEvt(isRefresh) {
      if (this.dialogTitle == '新增风险分析单元') {
        this.showInfoDialog = false
      }
      else if (this.dialogTitle == '新增隐患排查计划') {
        this.showInfoDialogSafe = false
      }
      else if (this.dialogTitle == '其他处置措施任务') {
        this.showInfoDialogOther = false
      }
      if (isRefresh) {
        this.searchClick()
      }
    },
    // 表单添加一行
    addDomain() {
      const arr = { leaderName: '', leaderPhone: '', leader: '' }
      this.inputForm.report.push(arr)
      this.flags('report')
    },
    // 表单减少一行
    deleteDomain() {
      this.inputForm.report.length = this.inputForm.report.length - 1
      this.flags('report')
    },
    // 表单添加一行
    addPlanReport() {
      const arr = { leaderName: '', leaderPhone: '', leader: '' }
      this.inputForm.planreport.push(arr)
      this.flags('planreport')
    },
    // 表单减少一行
    deletePlanReport() {
      this.inputForm.planreport.length = this.inputForm.planreport.length - 1
      this.flags('planreport')
    },
    // 判断数组长度
    flags(data) {
      if (data === 'report') {
        if (this.inputForm.report.length < 2) {
          this.flag = true
        }
        else {
          // 先赋值为true再赋为false, 不然会没反应
          this.flag = true
          this.flag = false
        }
      }
      else {
        if (this.inputForm.planreport.length < 2) {
          this.flag_two = true
        }
        else {
          // 先赋值为true再赋为false, 不然会没反应
          this.flag_two = true
          this.flag_two = false
        }
      }
    },
    closeDialog() {
      this.fileProp.oldFileList = [] // 重置上传附件
      this.$refs.inputForm.resetFields()
    },
  },
}
</script>

<template>
  <el-dialog
    title="选择事故基本情况"
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
      label-width="100px"
      @submit.native.prevent
    >
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="事故编号"
            prop="teamType"
          >
            <el-input v-model="inputForm.name" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="事故名称"
            prop="teamType"
          >
            <el-input v-model="inputForm.name" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="发生单位"
            prop="department"
          >
            <TreeSelect
              ref="officeTree"
              class="small-box"
              :props="{
                value: 'id', // ID字段名
                label: 'companyName', // 显示名称
                children: 'children', // 子级字段名
              }"
              url="sysCompany/getSubordinateCompany"
              :value="inputForm.companyId"
              :clearable="true"
              :accordion="true"
              @getValue="getDepartmentId"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="发生部位"
            prop="leaderPhone"
          >
            <el-input v-model="inputForm.leaderPhone" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="发生地点"
            prop="leaderName"
          >
            <el-select
              v-model="inputForm.leaderName"
              filterable
              clearable
              style="width: 100%"
              @change="changeTeamname(inputForm.leaderName)"
            >
              <el-option
                v-for="item in personListShow"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item label="事故发生时间">
            <el-date-picker
              v-model="inputForm.value1"
              type="datetime"
              placeholder="选择日期时间"
            />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="受伤人员"
            prop="docPath"
          >
            <el-select
              v-model="inputForm.leaderName"
              filterable
              clearable
              style="width: 100%"
              @change="changeTeamname(inputForm.leaderName)"
            >
              <el-option
                v-for="item in personListShow"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item label="人员伤害情况">
            <el-input v-model="inputForm.leaderPhone" />
          </el-form-item>
        </el-col>
      </el-row>
      <div class="title">
        选择事故调查报告
      </div>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="调查报告名称"
            prop="teamType"
          >
            <el-input v-model="inputForm.name" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item label="首次调查时间">
            <el-date-picker
              v-model="inputForm.value1"
              type="datetime"
              placeholder="选择日期时间"
            />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="事故性质"
            prop="docPath"
          >
            <el-select
              v-model="inputForm.leaderName"
              filterable
              clearable
              style="width: 100%"
              @change="changeTeamname(inputForm.leaderName)"
            >
              <el-option
                v-for="item in personListShow"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="首次调查人员"
            prop="docPath"
          >
            <el-select
              v-model="inputForm.leaderName"
              filterable
              clearable
              style="width: 100%"
              @change="changeTeamname(inputForm.leaderName)"
            >
              <el-option
                v-for="item in personListShow"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="首次被调查人"
            prop="docPath"
          >
            <el-select
              v-model="inputForm.leaderName"
              filterable
              clearable
              style="width: 100%"
              @change="changeTeamname(inputForm.leaderName)"
            >
              <el-option
                v-for="item in personListShow"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="事故类型"
            prop="docPath"
          >
            <el-select
              v-model="inputForm.leaderName"
              filterable
              clearable
              style="width: 100%"
              @change="changeTeamname(inputForm.leaderName)"
            >
              <el-option
                v-for="item in personListShow"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item label="首次调查地点">
            <el-input v-model="inputForm.leaderPhone" />
          </el-form-item>
        </el-col>
      </el-row>
      <div class="title">
        事故处理报告处罚措施
      </div>
      <div
        v-for="(inputForm, index) in inputForm.report"
        :key="inputForm.key"
        class="box"
      >
        <el-row class="box_row">
          <el-col :span="1">
            <span>{{ index + 1 }}</span>
          </el-col>
          <el-col :span="4">
            <el-form-item
              label="责任人"
              prop="docPath"
            >
              <el-select
                v-model="inputForm.leaderName"
                filterable
                clearable
                style="width: 120px"
                @change="changeTeamname(inputForm.leaderName)"
              >
                <el-option
                  v-for="item in personListShow"
                  :key="item.id"
                  :label="item.fullName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item
              label="处罚金额"
              style="margin-left: 65px"
            >
              <el-input
                v-model="inputForm.leaderPhone"
                style="width: 80px"
              />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item
              label="处罚说明"
              style="margin-left: 65px"
            >
              <el-input
                v-model="inputForm.leader"
                style="width: 200px"
              />
            </el-form-item>
          </el-col>
          <el-button
            v-if="index == 0"
            icon="el-icon-circle-plus-outline"
            style="margin-left: 160px; border: 0px"
            @click="addDomain"
          />
          <el-button
            v-if="index != 0"
            icon="el-icon-remove-outline"
            style="margin-left: 160px; border: 0px"
            :disabled="flag"
            @click="deleteDomain"
          />
        </el-row>
      </div>
      <div class="title">
        事故处理报告纠正或预防措施
      </div>
      <div
        v-for="(inputForm, index) in inputForm.planreport"
        :key="inputForm.key"
        class="box_two"
      >
        <el-row class="box_row">
          <el-col :span="1">
            <span>{{ index + 1 }}</span>
          </el-col>
          <div style="display: flex">
            <el-form-item label="纠正或预防措施">
              <el-select
                v-model="inputForm.planreport"
                clearable
                style="width: 120px"
              >
                <el-option
                  v-for="item in planreportList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="名称">
              <el-input
                v-model="inputForm.leaderPhone"
                style="width: 180px"
              />
            </el-form-item>
          </div>
          <el-row>
            <el-col :span="1">
&nbsp;
            </el-col>
            <el-col :span="17">
              <el-form-item label="纠正或预防措施说明">
                <el-input
                  v-model="inputForm.leader"
                  style="width: 400px"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <div style="display: flex; margin-left: 45px">
                <el-button
                  type="primary"
                  @click="addNormal(inputForm.planreport)"
                >
                  新增
                </el-button>
                <el-button
                  v-if="index == 0"
                  icon="el-icon-circle-plus-outline"
                  style="margin-left: 30px; border: 0px"
                  @click="addPlanReport"
                />
                <el-button
                  v-if="index != 0"
                  icon="el-icon-remove-outline"
                  style="margin-left: 30px; border: 0px"
                  :disabled="flag_two"
                  @click="deletePlanReport"
                />
              </div>
            </el-col>
          </el-row>
        </el-row>
      </div>
      <div class="title">
        事故处理报告
      </div>
      <el-row>
        <el-col :span="24">
          <el-form-item
            label="附件"
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
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item label="处理报告文档编号">
            <el-input v-model="inputForm.leaderPhone" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="处理报告名称"
            prop="teamType"
          >
            <el-input v-model="inputForm.name" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item label="审批类型">
          <el-radio-group v-model="inputForm.name">
            <el-radio label="部门级" />
            <el-radio label="工厂级" />
            <el-radio label="集团级" />
          </el-radio-group>
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
        type="success"
        :loading="loading"
        @click="doSubmit()"
      >保存</el-button>
      <el-button
        size="small"
        type="primary"
        :loading="loading"
        @click="doSubmit()"
      >提交</el-button>
    </span>
    <el-dialog
      class="normal-dialog"
      append-to-body
      :title="dialogTitle"
      :visible.sync="showInfoDialog"
      width="800px"
      :close-on-click-modal="false"
    >
      <UnitInfo
        v-if="showInfoDialog"
        v-bind="propData"
        @close="closeDialogEvt"
      />
    </el-dialog>
    <el-dialog
      class="normal-dialog"
      append-to-body
      :title="dialogTitle"
      :visible.sync="showInfoDialogSafe"
      width="950px"
      :close-on-click-modal="false"
      top="5vh"
    >
      <SafePlanInfo
        v-if="showInfoDialogSafe"
        v-bind="propData"
        @close="closeDialogEvt"
      />
    </el-dialog>
    <el-dialog
      class="normal-dialog"
      append-to-body
      :title="dialogTitle"
      :visible.sync="showInfoDialogOther"
      width="950px"
      :close-on-click-modal="false"
      top="5vh"
    >
      <OtherInfo
        v-if="showInfoDialogOther"
        v-bind="propData"
        @close="closeDialogEvt"
      />
    </el-dialog>
  </el-dialog>
</template>

<style scoped lang="scss">
.title {
  width: 100%;
  height: 56px;
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 18px;
  line-height: 24px;
  color: #303133;
}
.title::before {
  display: inline-block;
  content: '';
  margin: 0 10px 0 0;
  width: 4px;
  height: 24px;
  background-color: #409eff;
}
.theme-default .el-date-editor.el-input,
.theme-default .el-date-editor.el-input__inner {
  width: 267px !important;
}
.box {
  border: 1px solid #dcdfe6;
  height: 50px;
  margin-bottom: 5px;
  .box_row {
    padding-top: 10px;
    span {
      line-height: 30px;
      padding-left: 5px;
    }
  }
}
.box_two {
  border: 1px solid #dcdfe6;
  height: 130px;
  margin-bottom: 5px;
  .box_row {
    padding-top: 10px;
    span {
      line-height: 30px;
      padding-left: 5px;
    }
  }
}
.normal-dialog .dialog-footer {
  justify-content: center !important;
}
</style>
