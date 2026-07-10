<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import UserSelectDia from '@/components/userSelect/UserSelectDialog'
import { getRiskAreaAll } from '@/http/defense/shandong/riskControl-api'
import {
  getImportantSourceDetail,
  importantSourceAdd,
} from '@/http/major-hazard/dangerSourceAnqi-api'
import { importFileByID, uploadFileList } from '@/http/occupationalHealth/sanitation-api'
import { getUUID } from '@/utils/UUID'
import FileUpload from '@/views/common-ui/FileUpload'
import DangerMap from '../dangerMap'
import HmiTable from '../HmiTable'
import PointTable from '../PointTable'
import RiskFile from '../riskFile'
import VideoTable from '../VideoTable'

export default {
  name: 'InformationDetails',
  components: {
    SelectTree,
    UserSelectDia,
    FileUpload,
    RiskFile,
    DangerMap,
    PointTable,
    VideoTable,
    HmiTable,
  },
  props: {
    method: {
      type: String,
      default: '',
    },
    formData: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    const editableFile = this.method != 'view'
    return {
      isLoading: false,
      userType: '', // 人员类型
      inputForm: {
        companyId: '',
        companyName: '',
        unitDesc: '',
        unitName: '',
        riskRegion: '',
        riskUnit: '',
        location: '',
        // 楼层
        // floorId:1,
        //  true 进行室内外判断，false 以室外处理，
        // judgeInOrOutDoor: false,
        insuranceUserId: '',
        insuranceUserName: '',
        liableUserId: ' ',
        liableUserName: '',
        safetyUserId: '',
        safetyUserName: '',
        sceneUserId: '',
        sceneUserName: '',
      },
      riskFile: {
        editable: editableFile,
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
      },
      // 相关文件模块
      riskFileList: [
        { fileType: 'contingency-plan', id: getUUID(32) },
        { fileType: 'management-plan', id: getUUID(32) },
        { fileType: 'management-system', id: getUUID(32) },
        { fileType: 'other', id: getUUID(32) },
      ],
      // 风险区域列表
      riskRegionList: [],
      userList: [],
    }
  },
  computed: {
    setRiskRegionDes() {
      return function (id) {
        let des = '--'
        for (const item of this.riskRegionList) {
          if (item.id == id) {
            des = item.name
            break
          }
        }
        return des
      }
    },
  },
  async created() {
    if (this.method !== 'add') {
      this.isLoading = true
      getImportantSourceDetail(this.formData.id)
        .then(({ data }) => {
          if (data.success) {
            // Object.assign(this.inputForm, data.result);
            this.inputForm = data.result
            this.$emit('succSubmit', this.inputForm)
            this.getFileList(this.inputForm.id)

            if (this.inputForm.relevantFilesVOS.length > 0) {
              this.riskFileList = JSON.parse(JSON.stringify(this.inputForm.relevantFilesVOS))
            }
            this.riskFileList.forEach((item) => {
              if (!item.id) {
                item.id = getUUID(32)
              }
            })
          }
          else {
            this.$message.warning(data.message || '获取数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取数据失败', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    }
    else {
      this.inputForm.id = getUUID(32)
      this.riskFileList.forEach((data) => {
        data.id = getUUID(32)
      })
    }

    // 风险区域表
    const areaRes = await getRiskAreaAll()
    this.riskRegionList = areaRes.data.result || []
  },
  methods: {
    // 打开人员弹窗
    openUserSelectDialog(value) {
      this.userType = value
      const id = `${value}Id`
      const name = `${value}Name`
      let temp = []
      if (this.inputForm[id]) {
        temp = [
          {
            id: this.inputForm[id],
            fullName: this.inputForm[name],
          },
        ]
      }
      else {
        temp = []
      }
      this.userList = temp

      this.$refs.UserSelectDia.init()
    },
    userIdSubmit(Selections, userType) {
      const id = `${userType}Id`
      const name = `${userType}Name`
      if (Selections.length > 0) {
        // 回调数据
        // this.inputForm[id] = Selections[0].id;
        // this.inputForm[name] = Selections[0].fullName;
        this.$set(this.inputForm, id, Selections[0].id)
        this.$set(this.inputForm, name, Selections[0].fullName)
      }
      else {
        // 回调空数据
        // this.inputForm[id] = "";
        // this.inputForm[name] = "";
        this.$set(this.inputForm, id, '')
        this.$set(this.inputForm, name, '')
      }
    },
    async uploadFile(type, id, file) {
      const upFileData = {
        files: file,
        entityId: id,
        businessName: 'importantSourceDetail',
        categoryName: `${type}`,
      }
      this.isLoading = true
      const uploadFileResult = await uploadFileList(upFileData)
      if (!uploadFileResult.data.success) {
        this.$message.warning(uploadFileResult.data.message || '文件上传失败')
      }
    },
    async getFileList(entityId) {
      const getFileResult = await importFileByID(entityId)
      if (getFileResult.data.success) {
        this.riskFile.oldFileList = getFileResult.data.result
      }
      else {
        this.$message.warning(getFileResult.data.message || '查询文件失败')
      }
    },
    // 提交表单数据
    doInformationSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          // 数据处理
          this.$refs.riskFile.doSubmitFile()
          this.inputForm.relevantFilesDTOS = JSON.parse(JSON.stringify(this.riskFileList))
          importantSourceAdd(this.inputForm)
            .then(({ data }) => {
              if (data.success) {
                // this.inputForm.id = data.result;
                this.$message.success('提交成功')
                this.$emit('succSubmit', this.inputForm)
              }
              else {
                this.$message.warning(data.message || '提交失败')
              }
            })
            .catch((err) => {
              this.$message.error('提交出错', err)
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
  <div>
    <el-form
      ref="inputForm"
      v-loading="isLoading"
      :model="inputForm"
      label-width="100px"
      :class="method === 'view' ? 'readonly' : ''"
      :disabled="method === 'view'"
      @submit.native.prevent
    >
      <!-- 基本信息 -->
      <el-row>
        <el-col :span="8">
          <el-form-item
            label="所属公司"
            prop="companyId"
          >
            <SelectTree
              :props="{
                value: 'id', // ID字段名
                label: 'companyName', // 显示名称
                children: 'children', // 子级字段名
              }"
              url="sysCompany/getSubordinateCompany"
              :value="inputForm.companyId ? inputForm.companyId : ''"
              :label="inputForm.companyName ? inputForm.companyName : ''"
              :clearable="true"
              :accordion="true"
              disabled
              @getValue="
                (value, name) => {
                  inputForm.companyId = value
                  inputForm.companyName = name
                }
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="责任部门"
            prop="departmentName"
          >
            <el-input
              v-model="inputForm.departmentName"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="区域"
            prop="region"
          >
            <el-input
              v-model="inputForm.region"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="责任人"
            prop="liableUserName"
          >
            <el-input
              v-model="inputForm.liableUserName"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="重要危险源名称"
            prop="unitName"
          >
            <el-input
              v-model="inputForm.unitName"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="类型"
            prop="unitType"
          >
            <el-input
              disabled
              :value="$dictUtils.getDictLabelById('analysis_type', inputForm.unitType, '--')"
            />
          </el-form-item>
        </el-col>
        <!-- <el-col :span="8">
                    <el-form-item label="风险单元" prop="riskUnit">
                        <el-input v-model="inputForm.riskUnit" disabled />
                    </el-form-item>
                </el-col> -->
        <el-col :span="8">
          <el-form-item
            label="风险区域"
            prop="riskRegion"
          >
            <el-input
              :value="setRiskRegionDes(inputForm.riskRegion)"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="来源"
            prop="source"
          >
            <el-input
              disabled
              :value="$dictUtils.getDictLabelById('analysis_source', inputForm.source, '--')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="所处位置"
            prop="location"
          >
            <el-input
              :value="JSON.stringify(inputForm.location)"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="描述"
            prop="unitDesc"
          >
            <el-input
              v-model="inputForm.unitDesc"
              type="textarea"
              :rows="3"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="安全员"
            prop="safetyUserName"
            class="lh-unset"
          >
            <el-input
              v-model="inputForm.safetyUserName"
              placeholder="点击右侧选择"
              disabled
            >
              <el-button
                slot="append"
                icon="el-icon-search"
                @click="openUserSelectDialog('safetyUser')"
              />
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="现场负责人"
            prop="sceneUserName"
          >
            <el-input
              v-model="inputForm.sceneUserName"
              placeholder="点击右侧选择"
              disabled
            >
              <el-button
                slot="append"
                icon="el-icon-search"
                @click="openUserSelectDialog('sceneUser')"
              />
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="包保责任人"
            prop="insuranceUserName"
          >
            <el-input
              v-model="inputForm.insuranceUserName"
              placeholder="点击右侧选择"
              disabled
            >
              <el-button
                slot="append"
                icon="el-icon-search"
                @click="openUserSelectDialog('insuranceUser')"
              />
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 重大危险源位置 -->
      <div class="paragraph-title">
        <span class="paragraph-title-item" />重要危险源位置
      </div>
      <!-- 地图 -->
      <DangerMap :inputForm="inputForm" />

      <div class="paragraph-title">
        <span class="paragraph-title-item" />相关文件
      </div>
      <RiskFile
        ref="riskFile"
        :method="method"
        :riskFileList.sync="riskFileList"
      />

      <div class="paragraph-title">
        <span class="paragraph-title-item" />实时数据监测点
      </div>
      <PointTable
        :method="method"
        :info="inputForm"
      />

      <div class="paragraph-title">
        <span class="paragraph-title-item" />实时视频监测点
      </div>
      <VideoTable
        :method="method"
        :info="inputForm"
      />

      <div class="paragraph-title">
        <span class="paragraph-title-item" />关联组态图
      </div>
      <HmiTable
        :method="method"
        :info="inputForm"
      />
    </el-form>

    <UserSelectDia
      ref="UserSelectDia"
      :limit="1"
      :userType="userType"
      :selectData="userList"
      @doSubmit="userIdSubmit"
    />
  </div>
</template>

<style scoped lang="scss">
.lh-unset {
  ::v-deep .el-form-item__content {
    line-height: unset !important;
  }
}
::v-deep .file-upload {
  margin-top: 0 !important;
}

.risk-row {
  display: flex;
  height: 50px;
  line-height: 30px;
  font-size: 14px;
  margin: 10px;
}

.paragraph-title {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 15px;
  margin: 10px 0;

  .paragraph-title-item {
    display: inline-block;
    content: '';
    margin: 0 10px 0 0;
    width: 4px;
    height: 20px;
    background-color: #409eff;
  }
}
</style>
