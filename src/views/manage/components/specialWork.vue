<script>
import { getSpecifiedModule, setSpecifiedModule } from '@/http/companyConfig/companyConfig-api.js'

export default {
  props: {
    companyId: {
      type: String,
      default: '',
    },
    itemCode: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      specialWork: {
        isElectronicFence: true, // 是否划定电子围栏
        notificationType: [],
      },
      rules: {
        isElectronicFence: [
          {
            required: true,
            message: '请选择是否划定电子围栏',
            trigger: 'change',
          },
        ],
        notificationType: [{ required: true, message: '请选择作业通知方式', trigger: 'blur' }],
      },
      jobNotificationList: [
        {
          name: '企业微信',
        },
        {
          name: '站内信',
        },
        {
          name: '短信',
        },
      ],
    }
  },
  mounted() {
    setTimeout(() => {
      this.getSpecifiedModule()
    }, 100)
  },
  methods: {
    getSpecifiedModule() {
      getSpecifiedModule(this.companyId, this.itemCode).then(({ data }) => {
        if (data.success) {
          if (this.itemCode === 'specialWork') {
            data.result.forEach((res) => {
              this.specialWork[res.item] = res.value
            })
          }
        }
      })
    },
    saveDelineateFence(formName) {
      const dtoList = []
      for (const key in this.specialWork) {
        dtoList.push({
          item: key,
          value: this.specialWork[key],
        })
      }
      this.$refs[formName].validate((valid) => {
        if (valid) {
          setSpecifiedModule(this.companyId, this.itemCode, dtoList).then(({ data }) => {
            this.$message({
              message: data.message,
              type: 'success',
            })
          })
        }
        else {
          console.log('error submit!!')
          return false
        }
      })
    },
  },
}
</script>

<template>
  <div>
    <el-form
      ref="specialWork"
      :model="specialWork"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item
        label="是否划定电子围栏"
        prop="isElectronicFence"
      >
        <el-radio-group v-model="specialWork.isElectronicFence">
          <el-radio :label="true">
            是
          </el-radio>
          <el-radio :label="false">
            否
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="作业通知"
        prop="notificationType"
      >
        <el-checkbox-group v-model="specialWork.notificationType">
          <el-checkbox
            v-for="(item, index) in jobNotificationList"
            :key="index"
            :label="item.name"
          >
            {{ item.name }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <div class="button">
        <el-button
          type="primary"
          @click="saveDelineateFence('specialWork')"
        >
          保存
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.button {
  margin: 10px 0 0 150px;
}
</style>
