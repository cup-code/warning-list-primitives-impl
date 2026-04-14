<script>
import { getRemainConfigFn, saveRemainConfigFn } from '@/http/companyConfig/companyConfig-api.js'
import { getAllUsersByCompany } from '@/http/safe-production/depart-manage-api'

export default {
  props: {
    companyId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      loading: false,
      personList: [], // 所有的人员列表
      personListShow: [], // 页面中展示的人员列表
      remainConfig: {
        id: '',
        companyId: this.companyId,
        advanceDays: 0,
        meteringDays: 0,
        alarmReminder: [],
        warningReminder: [],
      },
    }
  },
  created() {
    Promise.all([getRemainConfigFn(this.companyId), getAllUsersByCompany(this.companyId)])
      .then((res) => {
        this.remainConfig = Object.assign(this.remainConfig, res[0].data.result || {})
        this.personList = (res[1].data.result || []).map((item) => {
          return {
            id: item.id,
            fullName: item.fullName,
          }
        })
        this.filterUserList()
      })
      .catch((err) => {
        this.$message.error('获取列表失败')
      })
  },
  methods: {
    // 过滤人员列表，解决数据量过大时卡顿的问题
    filterUserList(val) {
      if (!val) {
        // 列表中展示的人员
        this.personListShow = this.personList.slice(0, 10)
        // 如果之前设置了人员，需要把设置的人员信息加入展示列表中，为了回显
        if (this.remainConfig.alarmReminder.length) {
          this.remainConfig.alarmReminder.forEach((item) => {
            if (
              !this.personListShow.find((person) => {
                return person.id === item.id
              })
            ) {
              this.personListShow.push(item)
            }
          })
        }
        if (this.remainConfig.warningReminder.length) {
          this.remainConfig.warningReminder.forEach((item) => {
            if (
              !this.personListShow.find((person) => {
                return person.id === item.id
              })
            ) {
              this.personListShow.push(item)
            }
          })
        }
      }
      else {
        const result = this.personList.filter((item) => {
          return item.fullName.includes(val)
        }) // 存储符合条件的下拉选项
        this.personListShow = result.slice(0, 10) // 只取前10个
      }
    },
    saveRemainConfig() {
      this.loading = true
      saveRemainConfigFn(this.remainConfig)
        .then(({ data }) => {
          if (data.success) {
            this.$message.success(data.message || '保存成功')
          }
          else {
            this.$message.warning(data.message || '保存失败')
          }
        })
        .catch((err) => {
          this.$message.error('保存错误')
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
}
</script>

<template>
  <el-form
    ref="remainConfig"
    :model="remainConfig"
    label-width="140px"
  >
    <el-form-item
      label="特种设备提前预警天数"
      prop="advanceDays"
    >
      <el-input-number
        v-model="remainConfig.advanceDays"
        controls-position="right"
        :min="0"
        :max="300"
      />
    </el-form-item>
    <el-form-item
      label="计量设备提前预警天数"
      prop="meteringDays"
    >
      <el-input-number
        v-model="remainConfig.meteringDays"
        controls-position="right"
        :min="0"
        :max="300"
      />
    </el-form-item>
    <el-form-item
      label="预警提醒人员"
      prop="warningReminder"
    >
      <el-select
        v-model="remainConfig.warningReminder"
        filterable
        clearable
        multiple
        style="width: 350px"
        :filter-method="filterUserList"
        value-key="id"
      >
        <el-option
          v-for="item in personListShow"
          :key="item.id"
          :label="item.fullName"
          :value="item"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      label="报警提醒人员"
      prop="alarmReminder"
    >
      <el-select
        v-model="remainConfig.alarmReminder"
        filterable
        clearable
        multiple
        style="width: 350px"
        :filter-method="filterUserList"
        value-key="id"
      >
        <el-option
          v-for="item in personListShow"
          :key="item.id"
          :label="item.fullName"
          :value="item"
        />
      </el-select>
    </el-form-item>
    <el-tag type="warning">
      提示：预警、报警都将通过消息通知提醒相应人员，报警将会失效，且产生隐患。
    </el-tag>
    <div class="button">
      <el-button
        type="primary"
        :loading="loading"
        @click="saveRemainConfig"
      >
        保存
      </el-button>
    </div>
  </el-form>
</template>

<style lang="scss" scoped>
.button {
  margin: 10px 0 0 150px;
}
</style>
