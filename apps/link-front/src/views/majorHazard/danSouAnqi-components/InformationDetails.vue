<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import UserSelectDia from '@/components/userSelect/UserSelectDialog'
import { getRiskAreaAll } from '@/http/defense/shandong/riskControl-api'
import { dangerSourceAdd, getDangerSourceDetail } from '@/http/major-hazard/dangerSourceAnqi-api'
import { importFileByID, uploadFileList } from '@/http/occupationalHealth/sanitation-api'
import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api'
import { getUUID } from '@/utils/UUID'
import FileUpload from '@/views/common-ui/FileUpload'
import DangerMap from './dangerMap'
import HmiTable from './HmiTable'
import PointTable from './PointTable'
import RiskFile from './riskFile'
import RiskTable from './riskTable'
import VideoTable from './VideoTable'

export default {
  name: 'InformationDetails',
  components: {
    SelectTree,
    UserSelectDia,
    FileUpload,
    RiskTable,
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
      departList: [], // 所属部门list
      userType: '', // 人员类型
      inputForm: {
        companyId: '',
        companyName: '',
        unifyRef: '',
        unitDesc: '',
        unitName: '',
        riskRegion: '',
        riskUnit: '',
        // 楼层
        floorId: 1,
        // true 进行室内外判断，false 以室外处理，
        judgeInOrOutDoor: false,
        location: '',
        isTest: true,
        useDate: '',
        aroundName: ' ',
        aroundPersonNumber: 0,
        aroundType: ' ',
        hazardDistance: 0,
        aroundContactsName: ' ',
        aroundContactsPhone: ' ',
        insuranceUserId: '',
        insuranceUserName: '',
        liableUserId: ' ',
        liableUserName: '',
        operateUserId: '',
        operateUserName: '',
        safetyUserId: '',
        safetyUserName: '',
        safetyUserPhone: '',
        sceneUserId: '',
        sceneUserName: '',
        technologyUserId: '',
        technologyUserName: '',
        exposePersonNumber: 0, // 场外暴露人数
        hazardLevel: '', // 危险级别
        rvalue: 0, // R
        hazardLocation: '', // 重大危险源位置
      },
      riskFile: {
        editable: editableFile,
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
      }, // 辨识文件
      riskTemporaryFiles: {},
      riskInfosList: [], // 风险辨识表格
      riskFileList: [
        { fileType: 'contingency-plan', id: getUUID(32) },
        { fileType: 'management-plan', id: getUUID(32) },
        { fileType: 'management-system', id: getUUID(32) },
        { fileType: 'other', id: getUUID(32) },
      ], // 相关文件模块
      // 风险区域列表
      riskRegionList: [],
      userList: [],
      // 记录风险辨识表格新增的数据（每次保存完后清空）
      addList: [],
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
    // 校正系数
    coefficient() {
      let res = ''
      const num = this.inputForm.exposePersonNumber
      if (num >= 100) {
        res = 2.0
      }
      else if (num >= 50 && num < 100) {
        res = 1.5
      }
      else if (num >= 30 && num < 50) {
        res = 1.2
      }
      else if (num >= 1 && num < 30) {
        res = 1.0
      }
      else {
        res = 0.5
      }
      return res
    },
    // R值
    rValue() {
      let res = 0
      this.riskInfosList.forEach((item) => {
        if (item.qvalue && item.chemistryQuantity && item.checkCoefficient) {
          res += (item.checkCoefficient * item.qvalue) / item.chemistryQuantity
        }
      })
      res = res * this.coefficient
      return res
    },
    // 重大危险源级别
    level() {
      let res = ''
      const r = this.rValue
      if (r >= 100) {
        res = '一级'
      }
      else if (r >= 50 && r < 100) {
        res = '二级'
      }
      else if (r >= 10 && r < 50) {
        res = '三级'
      }
      else {
        res = '四级'
      }
      return res
    },
  },
  async created() {
    if (this.method !== 'add') {
      this.isLoading = true
      getDangerSourceDetail(this.formData.id)
        .then(({ data }) => {
          if (data.success) {
            // Object.assign(this.inputForm, data.result);
            this.inputForm = data.result
            this.$emit('succSubmit', this.inputForm)
            this.getFileList(this.inputForm.id)
            this.riskInfosList = JSON.parse(JSON.stringify(this.inputForm.riskInfoVOS))
            this.riskInfosList.forEach((data) => {
              // 添加列表项的编辑控制
              data.iseditor = false
            })
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
  mounted() {
    const companyId = this.$store.state.user.user.companyId
    // 获取所属部门部门list：当前人公司的所有组织架构
    getAllDepartByCompanyFn(companyId).then(({ data }) => {
      this.departList = data.result || []
    })
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
    /* 文件 */
    uploadEvt(fileList, fileType) {
      this.riskTemporaryFiles[fileType] = fileList
    },
    async uploadFile(type, id, file) {
      const upFileData = {
        files: file,
        entityId: id,
        businessName: 'dangerSourceDetail',
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
          // 校验风险辨识危化品表格
          this.inputForm.riskInfosDTOS = this.riskInfosList
            .filter(item => item.id)
            .concat(this.addList)
          const riskInfosFlag = this.inputForm.riskInfosDTOS.find(
            item => !item.chemistryName || !item.qvalueType || !item.qvalue || !item.toxicityName,
          )
          if (riskInfosFlag) {
            this.$message.error('风险辨识表格有空项，请检查！')
            return
          }

          this.isLoading = true
          // 数据处理
          this.$refs.riskFile.doSubmitFile()
          if (this.riskTemporaryFiles != undefined) {
            this.uploadFile(
              'riskRecognizeFRiles',
              this.inputForm.id,
              this.riskTemporaryFiles.riskRecognizeFRiles,
            )
          }
          // this.inputForm.riskInfosDTOS = JSON.parse(JSON.stringify(this.riskInfosList));
          this.inputForm.relevantFilesDTOS = JSON.parse(JSON.stringify(this.riskFileList))
          dangerSourceAdd(this.inputForm)
            .then(({ data }) => {
              if (data.success) {
                // this.inputForm.id = data.result;
                this.addList = []
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
            prop="companyName"
            :rules="{
              required: true,
              message: '所属公司不能为空',
              trigger: 'blur',
            }"
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
          <el-form-item label="统一编号">
            <el-input
              v-model="inputForm.unifyRef"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="单元名称">
            <el-input
              v-model="inputForm.unitName"
              disabled
            />
          </el-form-item>
        </el-col>
        <!-- <el-col :span="8">
                    <el-form-item label="风险单元">
                        <el-input v-model="inputForm.riskUnit" disabled />
                    </el-form-item>
                </el-col> -->
        <el-col :span="8">
          <el-form-item label="风险区域">
            <el-input
              :value="setRiskRegionDes(inputForm.riskRegion)"
              disabled
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
              placeholder="请输入"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="描述">
            <el-input
              v-model="inputForm.unitDesc"
              type="textarea"
              :rows="3"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="防雷防静电设施是否定期接受检测"
            prop="isTest"
            label-width="200px"
          >
            <el-radio-group v-model="inputForm.isTest">
              <el-radio :label="true">
                是
              </el-radio>
              <el-radio :label="false">
                否
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="重大危险源投用时间"
            prop="useDate"
            label-width="120px"
          >
            <el-date-picker
              v-model="inputForm.useDate"
              style="width: 100%"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="选择日期"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="周边环境名称"
            prop="aroundName"
          >
            <el-input
              v-model="inputForm.aroundName"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item
            label="与危险源最近距离(m)"
            prop="hazardDistance"
            label-width="150px"
          >
            <el-input
              v-model="inputForm.hazardDistance"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item
            label="周围环境类型"
            prop="a"
          >
            <el-input
              v-model="inputForm.a"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="周边环境人数"
            prop="b"
          >
            <el-input
              v-model="inputForm.b"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="重大危险源周边安全距离(m)"
            prop="c"
            label-width="180px"
          >
            <el-input
              v-model="inputForm.c"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item
            label="周边环境联系人"
            prop="aroundContactsName"
          >
            <el-input
              v-model="inputForm.aroundContactsName"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="周边环境联系人电话"
            prop="aroundContactsPhone"
            label-width="120px"
          >
            <el-input
              v-model="inputForm.aroundContactsPhone"
              placeholder="请输入"
              clearable
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
            label="安全员电话"
            prop="safetyUserPhone"
          >
            <el-input
              v-model="inputForm.safetyUserPhone"
              placeholder="请输入"
              clearable
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
              placeholder="点击右侧选择"
              disabled
            >
              <el-button
                slot="append"
                icon="el-icon-search"
                @click="openUserSelectDialog('liableUser')"
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
        <el-col :span="8">
          <el-form-item
            label="现场责任人"
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
            label="技术责任人"
            prop="technologyUserName"
          >
            <el-input
              v-model="inputForm.technologyUserName"
              placeholder="点击右侧选择"
              disabled
            >
              <el-button
                slot="append"
                icon="el-icon-search"
                @click="openUserSelectDialog('technologyUser')"
              />
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="操作责任人"
            prop="operateUserName"
          >
            <el-input
              v-model="inputForm.operateUserName"
              placeholder="点击右侧选择"
              disabled
            >
              <el-button
                slot="append"
                icon="el-icon-search"
                @click="openUserSelectDialog('operateUser')"
              />
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 重大危险源位置 -->
      <div class="paragraph-title">
        <span class="paragraph-title-item" />重大危险源位置
      </div>
      <!-- 地图 -->
      <DangerMap :inputForm="inputForm" />

      <!-- 风险辨识 -->
      <div class="paragraph-title">
        <span class="paragraph-title-item" />风险辨识
      </div>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="场外500米可能暴露人员数量(人)"
            prop="exposePersonNumber"
            label-width="190px"
          >
            <el-input
              v-model="inputForm.exposePersonNumber"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="校正系数(a)">
            <el-input
              :value="coefficient"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="R值"
            label-width="40px"
          >
            <el-input
              :value="rValue"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="重大危险源级别">
            <el-input
              :value="level"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="辨识文件"
            prop="hazardLevel"
            label-width="60px"
          >
            <FileUpload
              v-bind="riskFile"
              fileType="riskRecognizeFRiles"
              @upload="uploadEvt"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <RiskTable
        :method="method"
        :riskInfosList.sync="riskInfosList"
        :addList="addList"
      />

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
