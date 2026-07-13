<script>
import { getNoticSet, noticSetSave } from '@/http/base-module/notic-api.js'
import PickPeople from '@/views/common-ui/PickPeople.vue'

export default {
  components: {
    PickPeople,
  },
  data() {
    return {
      isLoading: false,
      dialogTitle: '', // 弹窗标题
      showDialog: false, // 是否显示弹窗
      curType: '', // 当前弹窗类型
      oldPickList: '', // 已经被选中列表
      formData: {
        earlyWarningLimit: 1,
        earlyWarningContacts: [],
        alarmContacts: [],
      }, // 要提交的表单数据
    }
  },
  created() {
    this.getInfoData()
  },
  methods: {
    /* 获取详情 */
    getInfoData() {
      const userData = JSON.parse(sessionStorage.getItem('user') || '{}')
      this.formData.companyId = userData.companyId
      if (userData.companyId) {
        this.isLoading = true
        getNoticSet(userData.companyId)
          .then((res) => {
            if (res.data.success) {
              const result = res.data.result || {}
              const userData = JSON.parse(sessionStorage.getItem('user') || '{}')
              this.formData = {
                companyId: result.companyId || userData.companyId,
                earlyWarningLimit: result.earlyWarningLimit || '',
                alarmContacts: JSON.parse(result.alarmContacts || '[]'),
                earlyWarningContacts: JSON.parse(result.earlyWarningContacts || '[]'),
              }
              if (result.id) {
                this.formData.id = result.id
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
      }
    },
    /* 天数输入回调 */
    inputEvt() {
      if (this.formData.earlyWarningLimit && this.formData.earlyWarningLimit >= 1) {
        this.formData.earlyWarningLimit = Math.round(this.formData.earlyWarningLimit)
      }
      else {
        this.formData.earlyWarningLimit = 1
      }
    },
    /* 点击打开弹窗 */
    showPickClick(type) {
      switch (type) {
        case 'earlyWarningContacts':
          this.dialogTitle = '选择预警提醒人员'
          break
        case 'alarmContacts':
          this.dialogTitle = '选择报警提醒人员'
          break
        default:
      }
      this.oldPickList = this.formData[type].map((item) => {
        return { id: item.id, fullName: item.name }
      })
      this.curType = type
      this.showDialog = true
    },
    /* 弹窗回调 */
    closeDialogEvt(pickData) {
      this.showDialog = false
      if (pickData && pickData.data) {
        this.formData[this.curType] = pickData.data.map((item) => {
          return { id: item.id, name: item.fullName }
        })
      }
    },
    /* 点击保存 */
    saveClick() {
      this.isLoading = true
      noticSetSave(this.formData)
        .then((res) => {
          if (res.data.success) {
            this.$message.success('保存报警配置成功')
          }
          else {
            this.$message.warning(res.data.message || '保存报警配置失败')
          }
        })
        .catch((err) => {
          this.$message.error('保存报警配置出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
  },
}
</script>

<template>
  <div
    v-loading="isLoading"
    class="notic-bg"
  >
    <el-form
      ref="noticForm"
      :model="formData"
      label-width="100px"
    >
      <el-form-item label="提前预警天数">
        <el-input
          v-model="formData.earlyWarningLimit"
          style="width: 300px"
          type="number"
          :min="1"
          :step="1"
          @change="inputEvt"
        />
      </el-form-item>
      <el-form-item label="预警提醒人员">
        <div class="pick-box">
          <div class="box-left">
            <el-button
              class="pick-btn"
              type="primary"
              size="mini"
              @click="showPickClick('earlyWarningContacts')"
            >
              选择预警人
            </el-button>
          </div>
          <div class="box-right">
            <el-tag
              v-for="(item, index) in formData.earlyWarningContacts"
              :key="item.id"
              class="pick-item"
              closable
              @close="formData.earlyWarningContacts.splice(index, 1)"
            >
              {{ item.name }}
            </el-tag>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="报警提醒人员">
        <div class="pick-box">
          <div class="box-left">
            <el-button
              class="pick-btn"
              type="primary"
              size="mini"
              @click="showPickClick('alarmContacts')"
            >
              选择报警人
            </el-button>
          </div>
          <div class="box-right">
            <el-tag
              v-for="(item, index) in formData.alarmContacts"
              :key="item.id"
              class="pick-item"
              closable
              @close="formData.alarmContacts.splice(index, 1)"
            >
              {{ item.name }}
            </el-tag>
          </div>
        </div>
      </el-form-item>
      <el-form-item>
        <TipBox des="提示：预警、报警都将通过消息通知提醒对应人员" />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="saveClick"
        >
          保存生效
        </el-button>
      </el-form-item>
    </el-form>
    <!-- 弹窗 -->
    <el-dialog
      class="fixed-dialog"
      :title="dialogTitle"
      :visible.sync="showDialog"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <PickPeople
        v-if="showDialog"
        :oldPickList="oldPickList"
        listType="role"
        @close="closeDialogEvt"
      />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.notic-bg {
  padding: 20px 50px 20px 10px;
  .pick-box {
    width: 690px;
    display: flex;
    .box-left {
      width: 100px;
      .pick-btn {
        height: 30px;
      }
    }
    .box-right {
      width: 600px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      .pick-item {
        height: 30px;
        line-height: 30px;
        margin: 0 10px 10px 0;
      }
    }
  }
}
</style>
