<script>
import moment from 'moment'
import {
  certSafeManageById,
  certSafeManageSave,
  certSafeManageUpdate,
} from '@/http/base-module/certificateManager-api.js'
import { getLicenseByTypeId } from '@/http/base-module/staffCertificate-api.js'
import { showFileWindow } from '@/utils/checkFile.js'
import FileUpload from '@/views/common-ui/FileUpload.vue'
import PickPeople from '@/views/common-ui/PickPeople.vue'

export default {
  components: {
    PickPeople,
    FileUpload,
  },
  props: {
    editable: {
      type: Boolean,
      default: false,
    },
    infoId: {
      type: [String, Number],
      default: null,
    },
  },
  data() {
    return {
      allDic: {},
      isLoading: false,
      showPickDialog: false,
      changeData: {}, // 修改/新增的数据
      tableData: [],
      showUserInfo: {}, // 用户信息 展示用
      fileProp: {
        editable: this.editable,
        deleteFront: true,
        fileLimit: 9, // 最大文件上传数量
        fileClass: 'EDU_PATH',
      },
      userStatusList: [
        {
          label: '禁用',
          value: '0',
        },
        {
          label: '在职',
          value: '1',
        },
        {
          label: '借调',
          value: '2',
        },
        {
          label: '离职',
          value: '3',
        },
        {
          label: '退休',
          value: '4',
        },
      ],
      categoryNameEnum: [],
    }
  },
  computed: {
    setDate() {
      return function (timestamp) {
        let date = '-'
        if (timestamp) {
          date = moment(timestamp).format('YYYY/MM/DD')
        }
        return date
      }
    },
  },
  created() {
    // 获取字典信息
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.getPrefix()
    if (this.infoId) {
      this.getInfoData()
    }
  },
  methods: {
    showFileWindow,
    getInfoData() {
      this.isLoading = true
      // 获取详情
      certSafeManageById(this.infoId)
        .then((res) => {
          if (res.data.success) {
            const resObj = res.data.result
            this.tableData = resObj.approveList
            this.getCategoryName(resObj.licenceType)
            this.changeData = {
              userId: resObj.userId,
              licenceType: resObj.licenceType,
              licenceName: resObj.licenceName,
              licenceNumber: resObj.licenceNumber,
              mechanism: resObj.mechanism,
              startTime: new Date(resObj.startTime).getTime(),
              endTime: new Date(resObj.endTime).getTime(),
              nextReview: new Date(resObj.nextReview).getTime(),
              remarks: resObj.remarks,
              isSpecialJob: resObj.isSpecialJob,
              enclosure: resObj.enclosure,
            }
            this.showUserInfo = {
              companyName: resObj.companyName,
              departmentName: resObj.departmentName,
              workPostName: resObj.postName,
              fullName: resObj.fullName,
              sex: resObj.sex,
              userState: resObj.userState,
              age: resObj.age,
              mobile: resObj.mobile,
            }
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
    /* 点击选择人员 */
    pickPeopleClick() {
      this.showPickDialog = true
    },
    /* 人员选择回调 */
    picClosekEvt(params) {
      if (params) {
        this.showUserInfo = params.data
        this.showUserInfo.userState = params.data.status
        this.showUserInfo.workPostName = params.data.postName
        this.changeData.userId = params.data.id
        this.changeData.companyId = params.data.companyId
      }
      this.showPickDialog = false
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.safeInfo.validate((valid) => {
        if (valid) {
          if (!this.changeData.userId) {
            this.$message.warning('请选择人员')
            return
          }
          let saveFunc = certSafeManageSave
          if (this.infoId) {
            saveFunc = certSafeManageUpdate
            this.changeData.id = this.infoId
          }
          this.isLoading = true
          const fl = this.changeData.enclosure
          this.changeData.enclosure = Array.isArray(fl) ? fl.join(',') : fl
          saveFunc(this.changeData)
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
    handleLicenceType(id) {
      this.$set(this.changeData, 'licenceName', '')
      this.getCategoryName(id)
    },
    getCategoryName(id) {
      getLicenseByTypeId(id).then(({ data }) => {
        if (data.success) {
          const resList = data.result || []
          this.categoryNameEnum = resList
        }
        else {
          this.$message.error(data.message || '无数据')
          this.categoryNameEnum = []
        }
      })
    },
  },
}
</script>

<template>
  <div
    v-loading="isLoading"
    class="safe-info"
  >
    <div class="dialog-info">
      <!-- 数据表单 -->
      <el-form
        ref="safeInfo"
        inline
        label-width="100px"
        :model="changeData"
        :disabled="!editable"
        style="width: 850px"
      >
        <el-divider content-position="left">
          人员信息
        </el-divider>
        <el-form-item
          label="姓名"
          prop="userId"
        >
          <div class="form-btn-box">
            <el-input
              v-model="showUserInfo.fullName"
              style="width: 245px"
              disabled
            />
            <el-button
              class="btn-pick"
              type="primary"
              @click="pickPeopleClick"
            >
              选择
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="公司">
          <el-input
            v-model="showUserInfo.companyName"
            class="small-box"
            disabled
          />
        </el-form-item>
        <el-form-item label="部门">
          <el-input
            v-model="showUserInfo.departmentName"
            class="small-box"
            disabled
          />
        </el-form-item>
        <el-form-item label="岗位">
          <el-input
            v-model="showUserInfo.workPostName"
            class="small-box"
            disabled
          />
        </el-form-item>
        <el-form-item label="年龄">
          <el-input
            v-model="showUserInfo.age"
            class="small-box"
            disabled
          />
        </el-form-item>
        <el-form-item label="人员状态">
          <el-select
            v-model="showUserInfo.userState"
            class="small-box"
            placeholder="请选择"
            disabled
          >
            <el-option
              v-for="item in userStatusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="性别">
          <el-input
            v-model="showUserInfo.sex"
            class="small-box"
            disabled
          />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input
            v-model="showUserInfo.mobile"
            class="small-box"
            disabled
          />
        </el-form-item>
        <el-divider content-position="left">
          证照信息
        </el-divider>
        <el-form-item
          label="证照类型"
          prop="licenceType"
          :rules="[
            {
              required: editable,
              message: '请选择证照类型',
              trigger: 'change',
            },
          ]"
        >
          <KyOptSelect
            v-model.trim="changeData.licenceType"
            class="small-box"
            :clearable="true"
            option="id"
            label="typeName"
            url="license/type/all"
            @change="handleLicenceType"
          />
        </el-form-item>
        <el-form-item label="证照名称">
          <el-select
            v-model="changeData.licenceName"
            class="small-box"
            clearable
            placeholder="请选择"
            filterable
          >
            <el-option
              v-for="item in categoryNameEnum"
              :key="item.id"
              :label="item.categoryName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="颁证单位">
          <el-select
            v-model="changeData.mechanism"
            class="small-box"
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in allDic.bzdw || []"
              :key="item.id"
              :label="item.dictName"
              :value="item.dictCode"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          label="取证日期"
          prop="startTime"
          :rules="[
            {
              required: editable,
              message: '请选择取证日期',
              trigger: 'change',
            },
          ]"
        >
          <el-date-picker
            v-model="changeData.startTime"
            type="date"
            value-format="timestamp"
            placeholder="取证日期"
            style="width: 310px"
          />
          <!-- <span style="margin: 0 0 0 10px">至</span> -->
        </el-form-item>
        <el-form-item
          label="证照号码"
          prop="licenceNumber"
          :rules="[{ required: editable, message: '请输入证照号码', trigger: 'blur' }]"
        >
          <el-input
            v-model="changeData.licenceNumber"
            class="small-box"
          />
        </el-form-item>
        <el-form-item
          label="证件有效期"
          prop="endTime"
          :rules="[
            {
              required: editable,
              message: '请选择证件有效期',
              trigger: 'change',
            },
            {
              type: 'number',
              min: changeData.startTime,
              message: '不能早于开始时间',
              trigger: 'change',
            },
          ]"
        >
          <el-date-picker
            v-model="changeData.endTime"
            type="date"
            value-format="timestamp"
            placeholder="证件有效期"
            style="width: 310px"
          />
        </el-form-item>
        <el-form-item
          label="下次复审日期"
          prop="nextReview"
          :rules="[
            {
              required: editable,
              message: '请选择复审日期',
              trigger: 'change',
            },
            {
              type: 'number',
              min: changeData.startTime,
              message: '不能早于开始时间',
              trigger: 'change',
            },
          ]"
        >
          <el-date-picker
            v-model="changeData.nextReview"
            class="small-box"
            type="date"
            value-format="timestamp"
            placeholder="复审日期"
            style="width: 310px"
          />
        </el-form-item>
        <el-form-item
          label="是否特种作业"
          prop="isSpecialJob"
          :rules="[{ required: editable, message: '请选择', trigger: 'blur' }]"
        >
          <el-radio-group v-model="changeData.isSpecialJob">
            <el-radio :label="true">
              是
            </el-radio>
            <el-radio :label="false">
              否
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="changeData.remarks"
            type="textarea"
            resize="none"
            :rows="4"
            class="large-box"
          />
        </el-form-item>
        <el-form-item
          label="附件"
          prop="enclosure"
        >
          <KyFileUpload
            v-model="changeData.enclosure"
            v-bind="fileProp"
          />
        </el-form-item>
      </el-form>
      <!-- 复审记录表 -->
      <el-table
        v-if="infoId"
        :data="tableData"
        :header-cell-style="{ borderLeft: 'none', borderRight: 'none' }"
        align="center"
      >
        <el-table-column
          type="index"
          width="50"
          align="center"
          label="序号"
        />
        <el-table-column
          label="复审日期"
          align="center"
        >
          <template slot-scope="scope">
            {{ setDate(scope.row.createdTime) }}
          </template>
        </el-table-column>
        <el-table-column
          label="有效开始日期"
          align="center"
        >
          <template slot-scope="scope">
            {{ setDate(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column
          label="有效截至日期"
          align="center"
        >
          <template slot-scope="scope">
            {{ setDate(scope.row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column
          label="复审结果"
          align="center"
        >
          <template slot-scope="scope">
            {{ scope.row.result === 0 ? '通过' : '未通过' }}
          </template>
        </el-table-column>
        <el-table-column
          label="附件查看"
          align="center"
        >
          <template slot-scope="scope">
            <!-- <el-image v-if="scope.row.enclosure" :src="filePrefix + scope.row.enclosure" :preview-src-list="[filePrefix + scope.row.enclosure]" style="width: 50px; height: 50px" /> -->
            <el-button
              v-if="scope.row.enclosure"
              type="text"
              @click="showFileWindow(scope.row.enclosure)"
            >
              查看
            </el-button>
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column
          label="备注"
          align="center"
          prop="remarks"
        />
      </el-table>
    </div>
    <!-- 底部按钮 -->
    <div class="dialog-footer">
      <el-button
        size="medium"
        @click="cancelClick"
      >
        取消
      </el-button>
      <el-button
        v-if="editable"
        type="primary"
        size="medium"
        @click="submitClick"
      >
        确认保存
      </el-button>
    </div>
    <!-- 选择人员 -->
    <el-dialog
      class="fixed-dialog"
      title="选择人员"
      :visible.sync="showPickDialog"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <PickPeople
        v-if="showPickDialog"
        :isSingle="true"
        listType="role"
        @close="picClosekEvt"
      />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.safe-info {
  // height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  .form-btn-box {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .btn-pick {
      margin: 0 0 0 10px;
    }
  }
  .small-box {
    width: 310px;
  }
  .large-box {
    width: 735px;
  }
  .el-divider--horizontal {
    margin: 10px 0 24px 0;
  }
}
</style>
