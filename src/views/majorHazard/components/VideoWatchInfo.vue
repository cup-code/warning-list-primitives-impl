<script>
import { auditAlarmInfo } from '@/http/hkAi-api'
import SafeBookInfo from '@/views/doubleDefense/shandong/safeCheck/components/SafeBookInfo'
import CheckVideo from './CheckVideo.vue'

export default {
  components: {
    CheckVideo,
    SafeBookInfo,
  },
  props: {
    // 详情数据
    infoData: {
      type: Object,
      default() {
        return {}
      },
    },
    // 公司数据 - 扁平
    companyList: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      isLoading: false,
      showCheckDialog: false, // 审核弹窗
      showInfoDialog: false, // 台账详情弹窗
      propData: {}, // 弹窗传参
    }
  },
  computed: {
    /* 设置状态类别 */
    setTag() {
      let tagType = ''
      switch (this.infoData.auditStatus) {
        case '待审核':
          tagType = 'warning'
          break
        case '已验收':
          tagType = 'success'
          break
        case '误报':
          tagType = 'info'
          break
        default:
          tagType = 'danger'
      }
      return tagType
    },
    /* 翻译公司名称 */
    setCompanyName() {
      let name = ''
      for (const item of this.companyList) {
        if (item.id == this.infoData.companyId) {
          name = item.name
          break
        }
      }
      return name
    },
  },
  created() {
    this.getPrefix()
  },
  methods: {
    /* 审核结果变化回调 */
    auditResChangeEvt(value) {
      if (value == '属实') {
        this.propData = {
          alarmInfoId: this.infoData.id,
          auditResult: this.infoData.auditRes,
          pic: this.infoData.pic,
        }
        this.showCheckDialog = true
      }
    },
    /* 点击查看详情 */
    showDetailClick() {
      this.propData = {
        troubleId: this.infoData.troubleId,
        isDevice: true,
      }
      this.showInfoDialog = true
    },
    /* 点击提交审核 - 针对误报 */
    submitClick() {
      const params = {
        alarmInfoId: this.infoData.id,
        auditResult: this.infoData.auditRes,
      }
      this.isLoading = true
      auditAlarmInfo(params)
        .then((res) => {
          if (res.data.success) {
            this.$message.success('审核成功')
            this.$emit('close', true)
          }
          else {
            this.$message.warning(res.data.message || '审核失败')
          }
        })
        .catch((err) => {
          this.$message.error('审核出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 点击关闭 */
    closeClick() {
      this.$emit('close', false)
    },
    /* 弹窗回调 */
    closeDialogEvt(isCloseAll) {
      this.showCheckDialog = false
      this.showInfoDialog = false
      if (isCloseAll) {
        this.$emit('close', true)
      }
    },
  },
}
</script>

<template>
  <div v-loading="isLoading">
    <el-form
      label-width="80px"
      size="mini"
    >
      <el-row>
        <el-col :span="14">
          <el-image
            :src="filePrefix + infoData.pic"
            style="width: 100%"
          />
        </el-col>
        <el-col :span="10">
          <el-form-item label="所属公司:">
            <span>{{ setCompanyName }}</span>
          </el-form-item>
          <el-form-item label="抓拍时间:">
            <span>{{ infoData.createdTime }}</span>
          </el-form-item>
          <el-form-item label="抓拍地点:">
            <span>{{ infoData.camName }}</span>
          </el-form-item>
          <el-form-item label="抓拍设备:">
            <span>{{ infoData.camName }}</span>
          </el-form-item>
          <el-form-item label="告警类型:">
            <span>{{ infoData.aiAlarmType }}</span>
          </el-form-item>
          <el-form-item
            v-if="infoData.hiddenDangerLevel"
            label="隐患等级:"
          >
            <span>{{
              $dictUtils.getDictLabelById('hiddenDangerLevel', infoData.hiddenDangerLevel)
            }}</span>
          </el-form-item>
          <el-form-item label="审核结果:">
            <!-- 待审核状态可以操作 -->
            <el-radio-group
              v-model="infoData.auditRes"
              :disabled="infoData.auditStatus !== '待审核'"
              @change="auditResChangeEvt"
            >
              <el-radio label="误报" />
              <el-radio label="属实" />
            </el-radio-group>
          </el-form-item>
          <el-form-item label="状态:">
            <el-tag :type="setTag">
              {{ infoData.auditStatus }}
            </el-tag>
          </el-form-item>
          <!-- 状态为 处理中/已验收 可查看详情 -->
          <el-form-item
            v-if="infoData.auditStatus === '已验收' || infoData.auditStatus === '处理中'"
            label="详情:"
          >
            <el-button
              type="text"
              @click="showDetailClick"
            >
              查看详情
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="dialog-footer">
      <el-button @click="closeClick">
        关 闭
      </el-button>
      <el-button
        v-show="infoData.auditStatus === '待审核' && infoData.auditRes === '误报'"
        type="primary"
        @click="submitClick"
      >
        提交审核
      </el-button>
    </div>
    <!-- 审核弹窗 -->
    <el-dialog
      class="fixed-dialog"
      title="审核视频报警记录"
      :visible.sync="showCheckDialog"
      width="50%"
      append-to-body
      :close-on-click-modal="false"
    >
      <CheckVideo
        v-if="showCheckDialog"
        v-bind="propData"
        @close="closeDialogEvt"
      />
    </el-dialog>
    <!-- 查看详情弹窗 -->
    <el-dialog
      class="large-dialog"
      title="异常详情"
      :visible.sync="showInfoDialog"
      append-to-body
      :close-on-click-modal="false"
    >
      <SafeBookInfo
        v-if="showInfoDialog"
        v-bind="propData"
        @close="closeDialogEvt"
      />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
