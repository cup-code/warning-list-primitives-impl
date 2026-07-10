<script>
import {
  emRehearsalRecordAdd,
  emRehearsalRecordById,
  emRehearsalRecordUpdate,
} from '@/http/emergency/rehearsal-api.js'
import FileUpload from '@/views/common-ui/FileUpload.vue'
import PickEmPlan from '@/views/emergency/common/PickEmPlan.vue'
import PickRePlan from '@/views/emergency/common/PickRePlan.vue'
import { STATE_LIST } from './constant'
import RecordData from './recordData'

export default {
  components: {
    FileUpload,
    PickEmPlan,
    PickRePlan,
  },
  props: {
    // 详情id
    infoId: {
      type: [Number, String],
      default: null,
    },
    // 是否可编辑，暂时没有查看功能
    editable: {
      type: Boolean,
      default: true,
    },
    // 所属公司树数据
    companyData: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      showEmPlanDialog: false,
      showRePlanDialog: false,
      stateList: STATE_LIST, // 演练状态下拉列表
      isLoading: false,
      changeData: {},
      // 选择弹窗prop
      pickProp: {},
      // 演练评估参数
      evaluationProp: {
        editable: this.editable,
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
      },
      // 上传附件参数
      accessorysProp: {
        editable: this.editable,
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
      },
      // 演练照片参数
      imagesProp: {
        editable: this.editable,
        accept: ['image/png', 'image/jpg', 'image/jpeg'],
        noticMsg: 'png/jpg/jpeg',
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
      },
      isShow: false,
    }
  },
  created() {
    // 编辑需要获取数据
    if (this.infoId) {
      this.getInfoData()
    }
    // 新增需要默认选择当前登录用户的公司id、name
    else {
      this.changeData = new RecordData()
    }
  },
  methods: {
    /* 获取详情数据 */
    getInfoData() {
      this.isLoading = true
      emRehearsalRecordById(this.infoId)
        .then((res) => {
          if (res.data.success) {
            this.changeData = new RecordData(res.data.result)
            this.evaluationProp.oldFileList = res.data.result.evaluation
            this.accessorysProp.oldFileList = res.data.result.accessorys
            this.imagesProp.oldFileList = res.data.result.images
          }
          else {
            this.$message.warning(res.data.message || '获取详情失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取详情出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 所属公司下拉列表点击 */
    companyTreeNodeTap(data) {
      this.changeData.companyId = data.id
      this.changeData.companyName = data.companyName
      this.$refs.tableTypeSelect.blur()
    },
    /* 点击清空公司下拉列表 */
    clearClick() {
      this.changeData.companyName = ''
      this.changeData.companyId = ''
    },
    /* 文件上传回调 */
    uploadEvt(fileList, type) {
      switch (type) {
        case 1: // 演练评估
          this.changeData.evaluation = fileList
          break
        case 2: // 附件
          this.changeData.accessorys = fileList
          break
        case 3: // 演练照片
          this.changeData.images = fileList
          break
        default:
      }
    },
    /* 点击选择演练计划/应急预案 */
    pickClick(type) {
      switch (type) {
        case 'rePlan':
          this.showRePlanDialog = true
          this.pickProp = {
            isSingle: true,
            oldPickData: {
              id: this.changeData.drillPlanId,
              drillName: this.changeData.drillPlanName,
            },
          }
          break
        case 'emPlan':
          this.showEmPlanDialog = true
          this.pickProp = {
            isSingle: true,
            oldPickData: {
              id: this.changeData.emergencyPlanId,
              drillName: this.changeData.emergencyPlanName,
            },
          }
          break
        default:
      }
    },
    /* 选择弹窗回调 */
    closeDialogEvt(item, type) {
      if (!item) {
        this.showEmPlanDialog = false
        this.showRePlanDialog = false
        return
      }
      switch (type) {
        case 'rePlan':
          this.changeData.drillPlanId = item.data.id
          this.changeData.drillPlanName = item.data.drillName
          this.showRePlanDialog = false
          break
        case 'emPlan':
          this.changeData.emergencyPlanId = item.data.id
          this.changeData.emergencyPlanName = item.data.planName
          this.showEmPlanDialog = false
          break
        default:
      }
    },
    /* 点击标签移除选择数据 */
    removePick(type) {
      switch (type) {
        case 'rePlan':
          this.changeData.drillPlanId = ''
          this.changeData.drillPlanName = ''
          break
        case 'emPlan':
          this.changeData.emergencyPlanId = ''
          this.changeData.emergencyPlanName = ''
          break
        default:
      }
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击提交 */
    submitClick() {
      console.log(this.changeData)
      this.$refs.recordForm.validate((valid) => {
        if (
          !this.changeData.drillPlanId
          || !this.changeData.emergencyPlanId
          || (this.evaluationProp.oldFileList.length == 0 && this.changeData.evaluation.length == 0)
          || (this.accessorysProp.oldFileList.length == 0 && this.changeData.accessorys.length == 0)
          || (this.imagesProp.oldFileList.length == 0 && this.changeData.images.length == 0)
        ) {
          this.isShow = true
          return
        }
        if (valid) {
          let submitFunc = () => {}
          if (this.infoId) {
            submitFunc = emRehearsalRecordUpdate
          }
          else {
            submitFunc = emRehearsalRecordAdd
            delete this.changeData.id
          }
          this.isLoading = true
          submitFunc(this.changeData)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('保存成功')
                this.$emit('close', true)
              }
              else {
                this.$message.warning(res.data.message || '保存失败')
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
  <div
    v-loading="isLoading"
    class="record-info"
  >
    <el-form
      ref="recordForm"
      :model="changeData"
      label-width="100px"
      style="width: 750px"
      :disabled="!editable"
    >
      <el-form-item
        label="演练时间"
        prop="drillTime"
        :rules="[{ required: true, message: '请选择演练时间', trigger: 'change' }]"
      >
        <el-date-picker
          v-model="changeData.drillTime"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item
        label="演练状态"
        prop="drillState"
        :rules="[{ required: true, message: '请选择演练状态', trigger: 'change' }]"
      >
        <el-select
          v-model="changeData.drillState"
          style="width: 100%"
        >
          <el-option
            v-for="item in stateList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="演练地点"
        prop="drillSite"
        :rules="[{ required: true, message: '请填写演练地点', trigger: 'blur' }]"
      >
        <el-input v-model="changeData.drillSite" />
      </el-form-item>
      <el-form-item
        label="所属公司"
        prop="companyId"
        :rules="[{ required: true, message: '请选择所属公司', trigger: 'change' }]"
      >
        <el-select
          ref="tableTypeSelect"
          v-model="changeData.companyId"
          style="width: 100%"
          clearable
          @clear="clearClick"
        >
          <el-option
            :value="changeData.companyId"
            :label="changeData.companyName"
          >
            <el-tree
              :data="companyData"
              :props="{ children: 'childrenCompany', label: 'companyName' }"
              highlight-current
              :expand-on-click-node="false"
              node-key="id"
              check-strictly
              @node-click="companyTreeNodeTap"
            />
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="演练计划"
        :rules="[{ required: true, message: '请选择演练计划', trigger: 'blur' }]"
      >
        <div class="pick-box">
          <el-button
            type="primary"
            @click="pickClick('rePlan')"
          >
            选择
          </el-button>
          <el-tag
            v-if="changeData.drillPlanId"
            class="pick-box-tag"
            :closable="editable"
            @close="removePick('rePlan')"
          >
            {{ changeData.drillPlanName }}
          </el-tag>
        </div>
        <span
          v-show="isShow && !changeData.drillPlanId"
          style="color: #f56c6c"
        >请选择演练计划</span>
      </el-form-item>
      <el-form-item
        label="应急预案"
        :rules="[{ required: true, message: '请选择应急预案', trigger: 'blur' }]"
      >
        <div class="pick-box">
          <el-button
            type="primary"
            @click="pickClick('emPlan')"
          >
            选择
          </el-button>
          <el-tag
            v-if="changeData.emergencyPlanId"
            class="pick-box-tag"
            :closable="editable"
            @close="removePick('emPlan')"
          >
            {{ changeData.emergencyPlanName }}
          </el-tag>
        </div>
        <span
          v-show="isShow && !changeData.emergencyPlanId"
          style="color: #f56c6c"
        >请选择应急预案</span>
      </el-form-item>
      <el-form-item
        label="人员数量"
        prop="personNumber"
        :rules="[{ required: true, message: '请填写人员数量', trigger: 'change' }]"
      >
        <el-input
          v-model="changeData.personNumber"
          type="number"
        />
      </el-form-item>
      <el-form-item
        label="演练内容"
        prop="drillContent"
        :rules="[{ required: true, message: '请填写演练内容', trigger: 'blur' }]"
      >
        <el-input
          v-model="changeData.drillContent"
          type="textarea"
          resize="none"
          :rows="4"
        />
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="changeData.remark"
          type="textarea"
          resize="none"
          :rows="4"
        />
      </el-form-item>
      <el-form-item
        label="演练评估"
        :rules="[{ required: true, message: '请上传演练评估', trigger: 'blur' }]"
      >
        <FileUpload
          v-bind="evaluationProp"
          @upload="uploadEvt($event, 1)"
        />
        <span
          v-show="
            isShow && evaluationProp.oldFileList.length == 0 && changeData.evaluation.length == 0
          "
          style="color: #f56c6c"
        >请上传演练评估</span>
      </el-form-item>
      <el-form-item
        label="附件"
        :rules="[{ required: true, message: '请上传附件', trigger: 'blur' }]"
      >
        <FileUpload
          v-bind="accessorysProp"
          @upload="uploadEvt($event, 2)"
        />
        <span
          v-show="
            isShow && accessorysProp.oldFileList.length == 0 && changeData.accessorys.length == 0
          "
          style="color: #f56c6c"
        >请上传附件</span>
      </el-form-item>
      <el-form-item
        label="演练照片"
        :rules="[{ required: true, message: '请上传演练照片', trigger: 'blur' }]"
      >
        <FileUpload
          v-bind="imagesProp"
          @upload="uploadEvt($event, 3)"
        />
        <span
          v-show="isShow && imagesProp.oldFileList.length == 0 && changeData.images.length == 0"
          style="color: #f56c6c"
        >请上传演练照片</span>
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 20px 0 0"
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
        提交
      </el-button>
    </div>
    <!-- 弹窗 -->
    <el-dialog
      class="normal-dialog"
      title="选择演练计划"
      :visible.sync="showRePlanDialog"
      width="800px"
      append-to-body
      :close-on-click-modal="false"
    >
      <PickRePlan
        v-if="showRePlanDialog"
        v-bind="pickProp"
        @close="closeDialogEvt($event, 'rePlan')"
      />
    </el-dialog>
    <el-dialog
      class="normal-dialog"
      title="选择应急预案"
      :visible.sync="showEmPlanDialog"
      width="800px"
      append-to-body
      :close-on-click-modal="false"
    >
      <PickEmPlan
        v-if="showEmPlanDialog"
        v-bind="pickProp"
        @close="closeDialogEvt($event, 'emPlan')"
      />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.record-info {
  .pick-box {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    .pick-box-tag {
      margin: 0 0 0 5px;
    }
  }
}
</style>
