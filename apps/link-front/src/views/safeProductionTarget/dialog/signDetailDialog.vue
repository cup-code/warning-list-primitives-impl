/* * @Author: xiaorui 目标责任制，签署详情弹框 * @Date: 2023-04-26 14:42:50 * @Last Modified by:
xiaorui * @Last Modified time: 2023-05-26 10:43:21 */
<script>
import { showFileWindow } from '@/utils/checkFile.js'

export default {
  data() {
    return {
      visible: false,
      detailInfo: {
        initiatorDepName: '', // 下发单位
        initiatorName: '', // 下发人员
        initiatorTime: '', // 下发时间
        targetLevel: '', // 层级
        dutyDepartName: '', // 责任单位
        departmentName: '', // 签署单位
        signPeople: '', // 签署人员
        postName: '', // 岗位
        createdTime: '', // 签署时间
        signUserNum: '', // 签署数量
        assessTotal: '', // 提取基金
        assessRate: '', // 提取比例
        signType: '', // 签署类型
        signStatus: '', // 签署状态
        docPath: '', // 签署附件
      },
    }
  },
  methods: {
    showFileWindow,
    init(obj) {
      this.visible = true
      this.detailInfo = this.recover(this.detailInfo, obj)
    },
  },
}
</script>

<template>
  <el-dialog
    title="目标责任书台账详情"
    :close-on-click-modal="false"
    :append-to-body="true"

    :visible.sync="visible"
    class="normal-dialog"
    width="600px"
  >
    <el-descriptions
      title=""
      size="medium"
      :column="2"
      border
    >
      <el-descriptions-item label="下发单位">
        {{
          detailInfo.initiatorDepName
        }}
      </el-descriptions-item>
      <el-descriptions-item label="下发人员">
        {{ detailInfo.initiatorName }}
      </el-descriptions-item>
      <el-descriptions-item label="下发时间">
        {{ detailInfo.initiatorTime }}
      </el-descriptions-item>
      <el-descriptions-item label="层级">
        {{ $dictUtils.getDictLabel('target_level', detailInfo.targetLevel) }}
      </el-descriptions-item>
      <el-descriptions-item label="责任单位">
        {{ detailInfo.dutyDepartName }}
      </el-descriptions-item>
      <el-descriptions-item label="签署部门">
        {{ detailInfo.departmentName }}
      </el-descriptions-item>
      <el-descriptions-item label="签署人员">
        {{
          detailInfo.signPeople.fullName
        }}
      </el-descriptions-item>
      <el-descriptions-item label="岗位">
        {{ detailInfo.postName }}
      </el-descriptions-item>
      <el-descriptions-item label="签署时间">
        {{ detailInfo.createdTime }}
      </el-descriptions-item>
      <el-descriptions-item label="签署数量">
        {{ detailInfo.signUserNum }}
      </el-descriptions-item>
      <el-descriptions-item label="提取考核基金">
        {{
          `${detailInfo.assessTotal}元`
        }}
      </el-descriptions-item>
      <el-descriptions-item label="提取比例">
        {{ `${detailInfo.assessRate * 100}%` }}
      </el-descriptions-item>
      <el-descriptions-item label="实际提取金额">
        {{ `${detailInfo.assessTotal * detailInfo.assessRate}元` }}
      </el-descriptions-item>
      <el-descriptions-item label="签署类型">
        {{ $dictUtils.getDictLabel('target_sign_type', detailInfo.signType) }}
      </el-descriptions-item>
      <el-descriptions-item label="签署状态">
        {{ detailInfo.signStatus === 0 ? '未签署' : '签署完成' }}
      </el-descriptions-item>
      <el-descriptions-item label="附件">
        <el-link
          type="primary"
          @click="showFileWindow(detailInfo.docPath)"
        >
          查看
        </el-link>
      </el-descriptions-item>
    </el-descriptions>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="visible = false"
      >关闭</el-button>
    </span>
  </el-dialog>
</template>
