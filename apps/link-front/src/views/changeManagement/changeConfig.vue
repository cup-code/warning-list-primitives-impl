<script>
import {
  getChangeConfiguration,
  saveChangeConfiguration,
} from '@/http/changeManagement/changeManagement-api.js'
import { getAllUsersByTenant } from '@/http/safe-production/depart-manage-api'

export default {
  data() {
    return {
      loading: false,
      submitLoading: false,
      inputForm: {
        configuration: [],
        deleteIds: [],
      },
      overdueData: [],
      successfulData: [],
      overduePersonnelList: [],
      successfulPersonList: [],
      notifyingOfficerList: [],
      applicantListShow: [],
    }
  },
  created() {
    this.getDataList()
    this.getApplicantList()
  },
  methods: {
    // 获取申请人
    getApplicantList() {
      const tenantId = this.$store.state.user.user.tenantId
      getAllUsersByTenant(tenantId)
        .then(({ data }) => {
          if (data.success) {
            this.notifyingOfficerList = data.result || []
            if (this.notifyingOfficerList.length) {
              this.filterUserList()
            }
          }
          else {
            this.$message.warning(data.message || '获取申请人列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取申请人列表失败', err)
        })
    },
    filterUserList(val) {
      if (!val) {
        // 列表中展示的人员
        this.applicantListShow = this.notifyingOfficerList.slice(0, 20) // 如果之前设置了人员，需要把设置的人员信息加入展示列表中，为了回显
        if (this.overdueData) {
          for (const key of this.overdueData) {
            if (key.userId) {
              const overdueId = this.notifyingOfficerList.find((item) => {
                return item.id === key.userId
              })
              if (!this.applicantListShow.includes(overdueId)) {
                this.applicantListShow.push(overdueId)
              }
            }
          }
        }
        if (this.successfulData) {
          for (const key of this.successfulData) {
            if (key.userId) {
              const successfulId = this.notifyingOfficerList.find((item) => {
                return item.id === key.userId
              })
              if (!this.applicantListShow.includes(successfulId)) {
                this.applicantListShow.push(successfulId)
              }
            }
          }
        }
      }
      else {
        const result = this.notifyingOfficerList.filter((item) => {
          return item.fullName.includes(val)
        }) // 存储符合条件的下拉选项
        this.applicantListShow = result.slice(0, 20) // 只取前10个
      }
    },
    getDataList() {
      this.loading = true
      getChangeConfiguration()
        .then(({ data }) => {
          this.loading = false
          if (data.success) {
            const dataList = data.result || {}
            this.overdueData = data.result[1]
            this.successfulData = data.result[2]
            this.overduePersonnelList = dataList[1].map((item) => {
              return item.userFullName
            })
            this.successfulPersonList = dataList[2].map((item) => {
              return item.userFullName
            })
          }
        })
        .catch((err) => {
          this.loading = false
        })
    },
    confirmSelection(type, e) {
      switch (type) {
        case '变动':
          this.overdueData = e.map((res) => {
            for (const key of this.notifyingOfficerList) {
              if (key.fullName == res) {
                return {
                  configurationType: 1,
                  userFullName: key.fullName,
                  userId: key.id,
                }
              }
            }
          })
          break
        case '通知':
          this.successfulData = e.map((res) => {
            for (const key of this.notifyingOfficerList) {
              if (key.fullName == res) {
                return {
                  configurationType: 2,
                  userFullName: key.fullName,
                  userId: key.id,
                }
              }
            }
          })
          break
      }
    },
    submitFn() {
      this.submitLoading = true
      this.inputForm.configuration = [...this.overdueData, ...this.successfulData]
      saveChangeConfiguration(this.inputForm)
        .then(({ data }) => {
          this.submitLoading = false
          if (data.success === true) {
            this.$message.success('配置成功')
          }
        })
        .catch((err) => {
          this.submitLoading = false
          this.$message.error('配置失败')
        })
    },
  },
}
</script>

<template>
  <div class="wechatMini-manage">
    <el-card>
      <el-form
        ref="inputForm"
        v-loading="loading"
        class="webApp-form"
        label-position="top"
        :model="inputForm"
        label-width="150px"
      >
        <el-form-item
          label="OA人员变动提醒"
          prop="appId"
        >
          <el-select
            v-model="overduePersonnelList"
            class="small-box"
            multiple
            placeholder="请输入通知人员"
            filterable
            :filter-method="filterUserList"
            @change="confirmSelection('变动', $event)"
          >
            <el-option
              v-for="(item, index) in applicantListShow"
              :key="index"
              :label="item.fullName"
              :value="item.fullName"
            >
              <span style="float: left">{{ item.fullName }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{
                item.departmentName
              }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="变更完成修改操作规程通知人员"
          prop="secret"
        >
          <el-select
            v-model="successfulPersonList"
            class="small-box"
            multiple
            placeholder="请输入通知人员"
            filterable
            :filter-method="filterUserList"
            @change="confirmSelection('通知', $event)"
          >
            <el-option
              v-for="(item, index) in applicantListShow"
              :key="index"
              :label="item.fullName"
              :value="item.fullName"
            >
              <span style="float: left">{{ item.fullName }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{
                item.departmentName
              }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <div class="prompt">
          <i class="el-icon-warning-outline" />提示:所有消息通知都将在主页的通知提醒对应人员
        </div>
        <div class="btn-box">
          <el-button
            type="primary"
            class="button-box"
            :loading="submitLoading"
            @click="submitFn"
          >
            保存生效
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.wechatMini-manage {
  position: relative;
  padding: 10px;
  height: 400px;
  .webApp-form {
    width: 50%;
    position: relative;
    .prompt {
      width: 100%;
      height: 30px;
      border: 1px solid #f3c52f;
      background-color: #fdf5e9;
      text-indent: 1em;
      line-height: 30px;
      color: #e29818;
      margin-top: 15px;
      i {
        margin-right: 10px;
      }
    }
    .btn-box {
      padding-top: 20px;
      text-align: right;
    }
  }
}
.small-box {
  width: 100% !important;
}
::v-deep {
  .el-form-item__label {
    padding-bottom: 0 !important;
  }
  .el-form-item {
    margin-bottom: 0 !important;
  }
}
</style>
