<script>
import {
  breakGroundLabel,
  checkboxValue,
  circuitLabel,
  closeSignSections,
  confirmSections,
  otherWorkItem,
  powerLabel,
  signatureSections,
  spaceLabel,
  specialWorkItems,
  textLabel,
  workRisks,
} from './baseStatic'

import SignBlock from './signBlock.vue'

export default {
  name: 'BaseInfo',
  components: {
    SignBlock,
  },
  props: {
    baseForm: {
      type: Object,
      default: () => ({
        fieldManagerSign: '',
        relatedPartySign: '',
        guardianSign: '',
        electricianSign: '',
        deptManagerSign: '',
        localDeptSign: '',
        companyApproverSign: '',
        finalApprovalSignUser: [],
        approvalUser: [],
        safetyMeasures: '',
      }),
    },
  },
  data() {
    return {
      minioFilePrefix: '',
      checkboxValue,
      closeSignSections,
      confirmSections,
      signatureSections,
      specialWorkItems,
      textLabel,
      spaceLabel,
      powerLabel,
      circuitLabel,
      otherWorkItem,
      breakGroundLabel,
      getInfo: [],
      workRisks,
      workText: '',
    }
  },
  computed: {
    getTextLabel() {
      const labels = {
        1001: this.textLabel,
        1002: this.textLabel,
        1007: this.spaceLabel,
        1004: this.powerLabel,
        1005: this.circuitLabel,
        1006: this.breakGroundLabel,
      }
      return labels[Number(this.baseForm.workTicketType)]
    },

    getOther() {
      return function (value) {
        const other = value?.filter(e => e.includes('other'))[0]?.split('other：')[1]
        return other
      }
    },
    getSigned() {
      return function (stage, name, type = '') {
        const stages = Array.isArray(stage) ? stage : [stage]
        const list = this.baseForm.finalApprovalSignUser || []
        const signUser = list.find(
          item => stages.includes(item.stage) && item.key === name,
        )
        if (type === 'time') {
          return signUser?.signTime
            ? signUser.signTime.replace(
                /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/,
                '$1年$2月$3日$4时$5分$6秒',
              )
            : '年 月 日 时 分 秒'
        }
        else if (type === 'opinion') {
          return [Number(signUser?.opinion)] || []
        }
        return signUser?.signImagePath || ''
      }
    },
    getTime() {
      return function (time) {
        if (!time)
          return ''
        const date = new Date(Number(time))
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      }
    },
    getRowSpan() {
      return this.getInfo?.length ? this.getInfo.length + 2 : 2
    },
    getPerson() {
      return function (name) {
        const user = this.baseForm.approvalUser?.find(item => item.key === name)
        return user?.signUserName || ''
      }
    },
  },
  watch: {
    baseForm: {
      handler(newVal) {
        if ([1001, 1002].includes(Number(newVal.workTicketType))) {
          this.getInfo = newVal.workInfo.gasAnalysisInfo
          this.workText = '作业前作业区域气体分析'
        }
        else if ([1004, 1005, 1006, 1007].includes(Number(newVal.workTicketType))) {
          this.getInfo = newVal.workInfo.safeConfirmInfo
          this.workText = '作业前作业区域安全环保条件确认'
        }

        const index = this.otherWorkItem.findIndex(
          e => e.code === Number(newVal.workTicketType),
        )
        if (index !== -1) {
          this.otherWorkItem.splice(index, 1)
        }
      },
      immediate: true,
      deep: true,
    },
  },
  created() {
    this.getPrefix()
  },
}
</script>

<template>
  <div class="base-info">
    <!-- 表头 -->
    <div class="permit-header">
      <div class="risk-level">
        <div class="risk-level-radio">
          <span>作业级别：</span>
          <el-checkbox-group :value="[baseForm.jobLevel]" disabled>
            <el-checkbox :label="1">
              一般危险
            </el-checkbox>
            <el-checkbox :label="2">
              较大危险
            </el-checkbox>
          </el-checkbox-group>
        </div>
        <span class="permit-no">编号：<strong>{{ baseForm.jobNumber }}</strong></span>
      </div>
    </div>

    <!-- 基本信息表格 -->
    <table class="permit-table">
      <tbody>
        <tr>
          <td class="label-col">
            作业单位/作业实施单位
          </td>
          <td class="content-col" :colspan="4">
            {{ baseForm.workUnitName || "" }}
          </td>
          <td class="label-col">
            作业现场负责人
          </td>
          <td class="content-col" :colspan="3">
            {{ getPerson("作业现场负责人") || "" }}
          </td>
        </tr>
        <tr>
          <td class="label-col">
            作业区域/地点
          </td>
          <td class="content-col" :colspan="4">
            {{ baseForm.workInfo.workAddress || "" }}
          </td>
          <td class="label-col">
            监护人
          </td>
          <td class="content-col" :colspan="3">
            {{ getPerson("监护人") || "" }}
          </td>
        </tr>
        <tr>
          <td class="label-col">
            作业内容/事项
          </td>
          <td class="content-col" :colspan="8">
            {{ baseForm.workInfo.workContent || "" }}
          </td>
        </tr>
        <tr>
          <td class="label-col">
            作业主管部门
          </td>
          <td class="content-col" :colspan="4">
            {{ baseForm.companyName || "" }}
          </td>
          <td class="label-col">
            作业属地单位/部门
          </td>
          <td class="content-col" :colspan="3">
            {{ baseForm.workUnitName || "" }}
          </td>
        </tr>
        <tr>
          <td class="label-col">
            受影响相关方
          </td>
          <td class="content-col" :colspan="8">
            <el-checkbox-group :value="[baseForm.workInfo.isAffected]" disabled>
              <el-checkbox
                v-for="item in checkboxValue"
                :key="`affected-${item.value}`"
                :label="item.value"
              >
                {{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </td>
        </tr>
        <tr>
          <td class="label-col">
            是否附安全工作方案
          </td>
          <td class="content-col" :colspan="4">
            <el-checkbox-group :value="[baseForm.workInfo.isSecurityPlan]" disabled>
              <el-checkbox
                v-for="item in checkboxValue"
                :key="`plan-${item.value}`"
                :label="item.value"
              >
                {{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </td>
          <td class="label-col">
            其他附件（风险辨识等）：
          </td>
          <td class="content-col" :colspan="3">
            <el-image
              v-for="item in baseForm.workInfo.securityPlanImagePath"
              :key="`plan-${item}`"
              :src="`${filePrefix}${item}`"
              style="width: 50px; height: 50px; margin-right: 6px"
            />
          </td>
        </tr>
        <tr>
          <td rowspan="3" class="label-col">
            是否附图纸
          </td>
          <td rowspan="3" class="content-col" :colspan="4">
            <el-checkbox-group :value="[baseForm.workInfo.isDraw]" disabled>
              <el-checkbox
                v-for="item in checkboxValue"
                :key="`draw-${item.value}`"
                :label="item.value"
              >
                {{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </td>
        </tr>
        <tr>
          <td class="label-col">
            图纸附件：
          </td>
          <td class="content-col" :colspan="3">
            <el-image
              v-for="item in baseForm.workInfo.drawFilePath"
              :key="`draw-${item}`"
              :src="`${filePrefix}${item}`"
              style="width: 50px; height: 50px; margin-right: 6px"
            />
          </td>
        </tr>
        <tr>
          <td class="label-col">
            图纸说明：
          </td>
          <td class="content-col" :colspan="3">
            {{ baseForm.workInfo.drawRemark || "" }}
          </td>
        </tr>
        <tr>
          <td class="label-col">
            作业时限
          </td>
          <td class="content-col" :colspan="8">
            自 {{ baseForm.actualStartTime || "" }} 开始至
            {{ baseForm.actualEndTime || "" }} 终止
          </td>
        </tr>

        <tr>
          <td class="label-col">
            涉及其他危险作业①
          </td>
          <td class="content-col" :colspan="8">
            <el-checkbox-group :value="baseForm.workInfo.otherWorkTicket">
              <el-checkbox
                v-for="item in otherWorkItem"
                :key="`item-${item.value}`"
                :label="item.name"
                disabled
              >
                <div style="display: flex; align-items: center; flex-wrap: wrap">
                  {{ item.name }}
                  <div v-if="item.name === '其他'">
                    ： {{ getOther(baseForm.workInfo.otherWorkTicket) }}
                  </div>
                </div>
              </el-checkbox>
            </el-checkbox-group>
            <div class="note">
              （涉及画"√"，不涉及画"×"）
            </div>
          </td>
        </tr>
        <tr>
          <td class="label-col">
            特定作业事项②
          </td>
          <td class="content-col" :colspan="8">
            <el-checkbox-group :value="baseForm.specificWorkItem">
              <el-checkbox
                v-for="item in specialWorkItems"
                :key="`item-${item.value}`"
                :label="item.name"
                disabled
              >
                <div style="display: flex; align-items: center; flex-wrap: wrap">
                  {{ item.name }}
                  <div v-if="item.name === '其他'">
                    ：{{ getOther(baseForm.specificWorkItem) }}
                  </div>
                </div>
              </el-checkbox>
            </el-checkbox-group>
            <div class="note">
              （涉及画"√"，不涉及画"×"）
            </div>
          </td>
        </tr>
        <tr>
          <td class="label-col">
            作业风险③
          </td>
          <td class="content-col" :colspan="8">
            <el-checkbox-group :value="baseForm.hazardIdentification">
              <el-checkbox
                v-for="item in workRisks"
                :key="`risk-${item.value}`"
                :label="item.name"
                disabled
              >
                <div style="display: flex; align-items: center; flex-wrap: wrap">
                  {{ item.name }}
                  <div v-if="item.name === '其他'">
                    ：{{ getOther(baseForm.hazardIdentification) }}
                  </div>
                </div>
              </el-checkbox>
            </el-checkbox-group>
            <div class="note">
              （涉及画"√"，不涉及画"×"）
            </div>
          </td>
        </tr>
        <tr>
          <td class="label-col">
            结合①②③项内容已采取的安环措施
          </td>
          <td class="content-col" :colspan="8">
            <div class="measures-content">
              {{ baseForm.takedSafeMeasure || "" }}
            </div>
          </td>
        </tr>

        <!-- 签名审批部分 -->
        <tr v-for="(section, index) in signatureSections" :key="index">
          <td :colspan="9">
            <div class="signature-container">
              <div
                v-for="(item, itemIndex) in section"
                :key="itemIndex"
                class="signature-section"
              >
                <SignBlock
                  :description="item.description"
                  :title="item.title"
                  :sign-image-url="getSigned('作业申请审批', item.role)"
                  :sign-time="getSigned('作业申请审批', item.role, 'time')"
                >
                  <div
                    v-if="item.role === '公司领导'"
                    style="display: flex; margin: 8px 0"
                  >
                    <span>批准此：</span>
                    <el-checkbox-group
                      disabled
                      :value="getSigned('作业申请审批', '公司领导', 'opinion')"
                    >
                      <el-checkbox :label="1">
                        一般危险
                      </el-checkbox>
                      <el-checkbox :label="2">
                        较大危险
                      </el-checkbox>
                    </el-checkbox-group>
                  </div>
                </SignBlock>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td :colspan="9">
            <div class="title">
              作业实施前现场安全环保条件确认，确认完毕并签字后本作业票正式生效
            </div>
          </td>
        </tr>

        <tr>
          <td
            style="
              width: 120px;
              background-color: #f5f7fa;
              word-break: break-all;
              white-space: normal;
              font-weight: bold;
              text-align: center;
            "
          >
            {{ workText }}
          </td>
          <td :colspan="8" style="padding: 0">
            <table class="table-header">
              <tr>
                <td
                  v-for="item in getTextLabel"
                  :key="`header-${item.id}`"
                  style="
                    background-color: #f5f7fa;
                    word-break: break-all;
                    padding: 4px;
                    white-space: normal;
                    text-align: center;
                    font-size: clamp(8px, 1vw, 11px);
                    font-weight: 500;
                    flex: 1;
                  "
                >
                  {{ item.label }}
                </td>
              </tr>
              <tr v-for="(item, index) in getInfo || []" :key="`analysis-${index}`">
                <td
                  v-for="(i, ind) in getTextLabel"
                  :key="`value-${ind}`"
                  style="
                    word-break: break-all;
                    padding: 4px;
                    white-space: normal;
                    font-size: clamp(8px, 1vw, 11px);
                    font-weight: 500;
                    text-align: center;
                    flex: 1;
                  "
                >
                  <div v-if="i.value === 'signImagePath'">
                    <el-image
                      :src="`${filePrefix}${item[i.value]}`"
                      style="width: 50px; height: 50px; margin-right: 6px"
                    />
                  </div>
                  <div v-else-if="i.value === 'signTime'">
                    {{ getTime(item[i.value]) }}
                  </div>
                  <div v-else>
                    {{ item[i.value] }}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr v-for="(section, sectionIndex) in confirmSections" :key="sectionIndex">
          <td :colspan="9">
            <div class="signature-container">
              <div
                v-for="(item, itemIndex) in section"
                :key="itemIndex"
                class="signature-section"
              >
                <SignBlock
                  :description="item.description"
                  :sign-image-url="getSigned(item.type, item.role)"
                  :sign-time="getSigned(item.type, item.role, 'time')"
                />
              </div>
            </div>
          </td>
        </tr>

        <tr>
          <td :colspan="9">
            <div class="title">
              作业票关闭
            </div>
          </td>
        </tr>
        <tr>
          <td :colspan="9">
            <div class="title-sub">
              作业按照规定时间顺利完成，作业单位已经将作业现场清理完毕,现场检查确认没有隐患，许可证可以关闭。
            </div>
          </td>
        </tr>

        <tr v-for="(section, sectionIndex) in closeSignSections" :key="sectionIndex">
          <td :colspan="9">
            <div class="signature-container">
              <div
                v-for="(item, itemIndex) in section"
                :key="itemIndex"
                class="signature-section"
              >
                <SignBlock
                  :description="item.description"
                  :sign-image-url="getSigned('作业关闭审批', item.role)"
                  :sign-time="getSigned('作业关闭审批', item.role, 'time')"
                />
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.base-info {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;

  .permit-header {
    margin-bottom: 10px;

    .risk-level {
      display: flex;
      align-items: center;
      justify-content: space-between;
      line-height: 30px;

      .risk-level-radio {
        display: flex;
        align-items: center;
      }
    }
  }

  .permit-table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;

    td {
      border: 1px solid #000;
      padding: 8px;
      min-height: 40px;
      word-break: break-word;
      word-wrap: break-word;
      white-space: normal;
      vertical-align: middle;
      font-size: 12px;
      line-height: 1.5;
    }

    .label-col {
      width: 170px;
      background-color: #f5f7fa;
      font-weight: bold;
    }

    .content-col {
      width: 100%;
    }

    .note {
      color: #666;
      font-size: 12px;
      margin-top: 5px;
    }

    .table-header {
      width: 100%;
      border-collapse: collapse;

      td {
        border: 1px solid #eeeeee;
        padding: 8px;
      }
    }
  }

  :deep(.el-checkbox) {
    margin-right: 15px;
  }

  .signature-container {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    gap: 8px;
  }

  .title {
    font-size: 16px;
    font-weight: bold;
    color: #222222;
    text-align: center;

    &-sub {
      font-size: 13px;
      text-align: center;
      font-weight: 500;
    }
  }

  .signature-section {
    flex: 1;
    min-width: 200px;
    padding: 0 6px;
    border-right: 1px solid #000;

    &:last-child {
      border-right: none;
    }
  }

  .measures-content {
    min-height: 60px;
    padding: 10px;
    white-space: pre-wrap;
    word-break: break-word;
  }

  :deep(.el-checkbox-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .el-checkbox {
      margin-right: 0;
      min-width: fit-content;
      padding-right: 8px;
    }
  }
}

/* 隐藏表格滚动条 */
.el-table__body-wrapper::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* 兼容 Firefox */
.el-table__body-wrapper {
  scrollbar-width: none;
}

/* 兼容 IE */
.el-table__body-wrapper {
  -ms-overflow-style: none;
}
</style>
