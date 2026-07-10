<script>
import { uploadFile } from '@/http/fireControl-api'
import { addNeWWork } from '@/http/workmanage/work-api'
import FileUpload from '@/views/common-ui/FileUpload'
import PickPeople from '@/views/common-ui/PickPeople'
import CTabs from './CTabs.vue'
import EquipmentList from './equipmentList.vue'

import ExamineLog from './examineLog.vue'

export default {
  name: 'AddWork',
  components: { FileUpload, CTabs, ExamineLog, PickPeople, EquipmentList },
  props: {
    visibleDialog: {
      type: Boolean,
      default: false,
    },
    isDetail: {
      type: Boolean,
      default: false,
    },
    dialogInfo: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      activeNames: ['1'],
      editable: true,
      detailType: '1',
      peopleProp: {},
      showPeopleDialog: false,
      fileProp: {
        editable: this.editable,
        oldFileList: [],
        fileLimit: 9,
      },
      EquipmentDialog: false,
      temporaryFiles: {},
      infoText: [
        { text: '设备名称', props: 'assetName', value: '' },
        { text: '设备编号', props: 'assetCode', value: '' },
        { text: '设备类别', props: 'assetTypeName', value: '' },
        { text: '联系人', props: 'assetPrincipalName', value: '' },
        { text: '联系方式', props: 'assetPrincipalName', value: '' },
        { text: '规格型号', props: 'model', value: '' },
        { text: '设备位置', props: 'installationLocation', value: '' },
        { text: '设备状态', props: 'assetState', value: '' },
        { text: '有效期剩余', props: 'expireMonth', value: '' },
      ],
      info: [],
      formInline: {},
      rules: {
        maintenanceName: [{ required: true, message: '请输入报修名称', trigger: 'blur' }],
        repairs: [{ required: true, message: '请选择报修人员', trigger: 'change' }],
        dealUserName: [{ required: true, message: '请选择处理人员', trigger: 'change' }],
        level: [{ required: true, message: '请设置工单等级', trigger: 'change' }],
        emergency: [{ required: true, message: '请设置紧急程度', trigger: 'change' }],
        check: [{ required: true, message: '请选择验收人员', trigger: 'change' }],
        faultDesc: [{ required: true, message: '请描述处置措施', trigger: 'blur' }],
      },
      selected: {},
      // tabsList: [
      //   { label: '故障详情', name: '1' },
      //   { label: '处理记录', name: '2' }
      // ],
      // repairman: [
      //   { label: '张班长', value: '1' },
      //   { label: '赵良', value: '2' },
      //   { label: '蒋湘芝', value: '3' }
      // ],
      // workers: [
      //   { label: '张班长', value: '1' },
      //   { label: '赵良', value: '2' },
      //   { label: '蒋湘芝', value: '3' }
      // ],
      // level: [
      //   { label: '一级', value: '1' },
      //   { label: '二级', value: '2' },
      //   { label: '三级', value: '3' }
      // ],
      // emergency: [
      //   { label: '一般', value: '1' },
      //   { label: '紧急', value: '2' }
      // ],
      // check: [
      //   { label: '张班长', value: '1' },
      //   { label: '赵良', value: '2' },
      //   { label: '蒋湘芝', value: '3' }
      // ]
    }
  },
  watch: {
    visibleDialog: {
      handler() {
        const info = this.dialogInfo

        if (this.isDetail) {
          // 查看详情回显数据
          const {
            deviceName: assetName,
            deviceLoc: installationLocation,
            deviceNo: assetCode,
            lifespan: expireMonth,
            deviceType: assetTypeName,
            deviceSpec: model,
            deviceStatus: assetState,
            contactPeople: assetPrincipalName,
          } = info

          const mechine = {
            assetName,
            installationLocation,
            assetCode,
            expireMonth,
            assetPrincipalName,
            assetTypeName,
            model,
            assetState,
          }

          this.info = this.infoText.map((item) => {
            return {
              text: item.text,
              value:
                item.props === 'expireMonth'
                  ? this.getExpireMonthLabel(mechine[item.props])
                  : mechine[item.props],
            }
          })

          const {
            dealUserId,
            faultDesc,
            maintenanceName,
            dealUserName,
            reportFile,
          } = info
          this.formInline = {
            dealUserId,
            faultDesc,
            maintenanceName,
            dealUserName,
          }

          const files = reportFile?.split(',') || []
          this.fileProp.oldFileList = files.map((item) => {
            return {
              urlPath: item,
              originalName: item.split('/')[item.split('/').length - 1],
            }
          })
        }
        this.editable = !this.isDetail
      },
      deep: true,
    },
  },
  methods: {
    onConfirm() {
      if (this.isDetail) {
        this.onClose()
        return
      }

      this.$refs.faultForm.validate((valid) => {
        // 创建工单信息校验
        if (!Object.keys(this.selected).length) {
          this.$message.warning('您还未选择故障设备')
          return
        }
        if (!valid) {
          this.$message.warning('请填写完整的故障信息')
          return
        }
        if (!this.temporaryFiles) {
          this.$message.warning('未上传图片文件，请上传！')
          return
        }

        if (valid) {
          const {
            assetName: deviceName,
            installationLocation: deviceLoc,
            assetCode: deviceNo,
            expireMonth: lifespan,
            assetTypeName: deviceType,
            model: deviceSpec,
            assetState: deviceStatus,
            assetPrincipalName: contactPeople,
          } = this.selected

          const params = {
            deviceName,
            deviceLoc,
            deviceNo,
            lifespan,
            deviceType,
            deviceSpec,
            deviceStatus,
            contactPeople,
            reportFile: this.temporaryFiles,
            ...this.formInline,
          }

          addNeWWork(params)
            .then((res) => {
              const { data } = res
              if (data.success) {
                this.$message.success(`创建成功`)
                this.$emit('confirm')
                this.onClose()
              }
            })
            .catch(() => {
              this.$message.error(`创建失败`)
            })
        }
      })
    },

    // tab切换查看(暂时不做)
    onChange(e) {
      this.detailType = e
    },
    // 显示到期时间格式化
    getExpireMonthLabel(v) {
      if (v === -1) {
        return '--'
      }
      else if (v === 0) {
        return '到报废期限'
      }
      else {
        return `${v}个月`
      }
    },

    // 选择设备
    onAdd() {
      this.EquipmentDialog = true
    },

    // 选择处理人员
    onSelect() {
      this.peopleProp.oldPickData = {
        id: this.formInline.dealUserId || '',
        fullName: this.formInline.dealUserName || '',
      }
      this.peopleProp.isSingle = true
      this.peopleProp.listType = 'role'
      this.peopleProp.withoutChildrenDepartment = true
      this.showPeopleDialog = true
    },
    // 已选处理人员
    closePeopleEvt(e) {
      if (e) {
        this.formInline.dealUserId = e.data.id
        this.formInline.dealUserName = e.data.fullName
      }
      this.showPeopleDialog = false
    },
    // 选择故障设备
    onSelected(e) {
      this.selected = e
      this.info = this.infoText.map((item) => {
        return {
          text: item.text,
          value:
            item.props === 'expireMonth' ? this.getExpireMonthLabel(e[item.props]) : e[item.props],
        }
      })
    },
    // 关闭弹窗并清空数据
    onClose() {
      this.info = []
      this.formInline = {}
      this.temporaryFiles = []
      this.fileProp = {
        editable: this.editable,
        oldFileList: [],
        fileLimit: 9,
      }
      this.$emit('update:visibleDialog', false)
      this.$emit('update:isDetail', false)
      this.$emit('close')
      this.detailType = '1'
    },

    /* 文件上传 */
    async uploadFiles(fileType, files) {
      const upFileData = {
        files,
        fileType,
        isRetainFileName: true,
      }
      const uploadFileResult = await uploadFile(upFileData)

      const { result } = uploadFileResult.data
      this.temporaryFiles = result.join(',')

      if (!uploadFileResult.data.success) {
        this.$message.warning(uploadFileResult.data.message || '文件上传失败')
      }
    },
    // 文件回调
    uploadEvt(fileList, fileType) {
      this.uploadFiles(fileType, fileList)
    },
  },
}
</script>

<template>
  <div>
    <el-dialog
      :visible="visibleDialog"
      destroy-on-close
      :close-on-click-modal="false"
      show-close
      width="70%"
      @close="onClose"
    >
      <div
        slot="title"
        class="text-lg font-semibold"
      >
        {{ isDetail ? '工单详情' : '创建故障工单' }}
      </div>

      <!-- <CTabs v-if="isDetail" :tabsList="tabsList" @change="onChange" /> -->

      <!-- <div v-if="detailType === '1' || !isDetail"> -->
      <el-collapse
        v-model="activeNames"
        accordion
      >
        <el-collapse-item name="1">
          <div
            slot="title"
            class="title"
          >
            <h4 class="subTitle">
              设备信息
            </h4>

            <div
              class="add-btn"
              @click.stop="onAdd"
            >
              <EButton
                :disabled="isDetail"
                type="text"
                size="mini"
                btnIcon="el-icon-plus"
              >
                选择故障设备
              </EButton>
            </div>
          </div>

          <div
            v-if="info.length"
            class="info-wrap"
          >
            <div
              v-for="item in info"
              :key="item.text"
              class="machine-info"
            >
              <strong>{{ item.text }}：</strong>
              <div>{{ item.value }}</div>
            </div>
          </div>

          <el-empty
            v-else
            :image-size="50"
            description="您暂未选择故障设备"
          />
        </el-collapse-item>
      </el-collapse>

      <h4 class="subTitle">
        故障信息
      </h4>
      <div class="info-wrap">
        <el-form
          ref="faultForm"
          :disabled="isDetail"
          :rules="rules"
          :model="formInline"
          label-width="70px"
          label-positin="left"
          class="fault-message"
        >
          <el-form-item
            prop="maintenanceName"
            class="fault-item"
            label="报修名称"
          >
            <el-input
              v-model="formInline.maintenanceName"
              placeholder="请输入报修名称"
            />
          </el-form-item>
          <!-- <el-form-item prop="repairs" class="fault-item" label="报修人员">
              <el-select v-model="formInline.repairs" placeholder="请选择报修人员">
                <el-option v-for="(item, index) in repairman" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item> -->
          <el-form-item
            prop="dealUserName"
            class="fault-item"
            label="处理人员"
          >
            <el-input
              v-model="formInline.dealUserName"
              placeholder="请选择处理人员"
              readonly
              @focus="onSelect"
            />
            <!-- <el-select v-model="formInline.dealUserId" placeholder="请选择处理人员">
              <el-option v-for="(item, index) in workers" :key="index" :label="item.label" :value="item.value"></el-option>
            </el-select> -->
          </el-form-item>
          <!-- <el-form-item prop="level" class="fault-item" label="工单等级">
              <el-select v-model="formInline.level" placeholder="请设置工单等级">
                <el-option v-for="(item, index) in level" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="emergency" class="fault-item" label="紧急程度">
              <el-select v-model="formInline.emergency" placeholder="请设置紧急程度">
                <el-option v-for="(item, index) in emergency" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="check" class="fault-item" label="验收人员">
              <el-select v-model="formInline.check" placeholder="请选择验收人员">
                <el-option v-for="(item, index) in check" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item> -->
          <el-form-item
            prop="faultDesc"
            class="fault-item"
            style="width: 100%; padding: 6px 24px 6px 6px"
            label="故障描述"
          >
            <el-input
              v-model="formInline.faultDesc"
              class="relative"
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 6 }"
              placeholder="请描述故障信息"
            />
          </el-form-item>
        </el-form>
      </div>
      <h4 class="subTitle">
        上传附件
      </h4>
      <div
        class="info-wrap"
        style="padding: 0 38px 30px"
      >
        <FileUpload
          v-bind="fileProp"
          fileType="WORK_ORDER"
          :editable="editable"
          @upload="uploadEvt"
        />
      </div>
      <!-- </div> -->

      <div v-if="detailType === '2'">
        <h4 class="subTitle">
          审批流程
        </h4>
        <ExamineLog />
      </div>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <EButton
          plain
          @click="onClose"
        >
          取消
        </EButton>
        <EButton
          type="primary"
          @click="onConfirm"
        >
          {{ isDetail ? '确认' : '提交' }}
        </EButton>
      </div>
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
    <EquipmentList
      :visible.sync="EquipmentDialog"
      @confirm="onSelected"
    />
  </div>
</template>

<style lang="scss" scoped>
.title {
  display: flex;
  align-items: center;
  position: relative;

  .add-btn {
    position: absolute;
    left: 130px;
    height: 30px;
    line-height: 30px;
    z-index: 8;
  }
}

.info-wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 0 24px 30px;

  .machine-info {
    display: flex;
    align-items: center;
    padding: 8px 14px;
    box-sizing: border-box;
    width: calc(100% / 3);
  }

  .fault-message {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;

    .fault-item {
      padding: 6px;
      box-sizing: border-box;
      width: calc(100% / 3);

      .desc-block {
      }
    }

    ::v-deep .el-form-item__label {
      font-weight: 600;
    }
  }
}

h2 {
  margin: 0;
}

h4 {
  margin-top: 0;
  margin-bottom: 0px;
}

.subTitle {
  font-size: 14px;
  color: #222;
  text-indent: 2em;
  position: relative;
  line-height: 30px;
}

.subTitle::before {
  content: '';
  width: 4px;
  height: 20px;
  background: #409eff;
  position: absolute;
  left: 10px;
  top: 5px;
}

::v-deep .el-collapse {
  border: none;
}

::v-deep .el-collapse-item__content {
  padding: 0;
}

::v-deep .el-collapse-item__header {
  height: 30px;
  width: 120px;
  border: none;

  .el-collapse-item__arrow {
    margin: 0 10px;
  }
}

::v-deep .el-collapse-item:last-child .el-collapse-item__wrap {
  border: none !important;
}
</style>
