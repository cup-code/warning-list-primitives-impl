<script>
export default {
  name: 'RiskTroubleDetail',
  props: {
    timeLineProp: {
      type: Object,
      default: {},
    },
    troubleDetail: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      // 图片
      imageSrcList: ['ticket.jpg', 'workers01.png', 'ticket.jpg', 'workers01.png', 'ticket.jpg'],
    }
  },
  created() {
    // 获取图片路径前缀
    this.getPrefix()
  },
  mounted() {},
  methods: {},
}
</script>

<template>
  <!-- style="width:100%" -->
  <div class="dialog-content">
    <!-- 时间轴审核步骤   finish-status完成步骤状态 process-status 当前步骤状态  wait/process/finish -->
    <el-steps
      style="padding: 15px; border: 1px solid #0f81a3"
      :active="timeLineProp.curStep"
      align-center
      process-status="finish"
      finish-status="success"
    >
      <el-step
        :title="timeLineProp.dataList[0].name"
        :description="timeLineProp.dataList[0].content"
      />
      <el-step
        :title="timeLineProp.dataList[1].name"
        :description="timeLineProp.dataList[1].content"
      />
      <el-step
        :title="timeLineProp.dataList[2].name"
        :description="timeLineProp.dataList[2].content"
      />
      <el-step
        :title="timeLineProp.dataList[3].name"
        :description="timeLineProp.dataList[3].content"
      />
      <el-step
        :title="timeLineProp.dataList[4].name"
        :description="timeLineProp.dataList[4].content"
      />
    </el-steps>
    <!-- 基本信息 -->
    <div class="content-box">
      <span>基本信息</span>
      <div class="conent-layout-y">
        <div class="row-text">
          <span class="span-lable">隐患来源 :&nbsp;&nbsp; </span>
          <span class="span-text-3row">{{
            $dictUtils.getDictLabel('sourceOfHiddenDanger', troubleDetail.troubleSource, '--')
          }}</span>
        </div>

        <!-- <div class="row-text">
                <span class="span-lable">分析单元 :&nbsp;&nbsp;</span>
                <span>{{ troubleDetail.troubleExtInfo.riskAnalysisUnit }}</span>
                </div>
                <div class="row-text">
                    <span class="span-lable">排查内容 :&nbsp;&nbsp;</span>
                    <span class="span-text-3row">{{ troubleDetail.troubleExtInfo.checkContent }}</span>
                </div>
                <div class="row-text"> <span class="span-lable">风险事件 :&nbsp;&nbsp;</span> <span>{{ troubleDetail.troubleExtInfo.riskEvent }}</span> </div> -->

        <div class="row-text">
          <span class="span-lable">排查人 :&nbsp;&nbsp;</span>
          <span>{{ troubleDetail.checkUserFullName }}</span>
        </div>
        <div class="row-text">
          <span class="span-lable">隐患位置 :&nbsp;&nbsp;</span>
          <span>{{ troubleDetail.troubleLocation }}</span>
        </div>
        <div class="row-text">
          <span class="span-lable">隐患等级 :&nbsp;&nbsp;</span>
          <span>{{
            $dictUtils.getDictLabel(
              'hiddenDangerLevel',
              troubleDetail.troubleLevel,
              '隐患等级待审核',
            )
          }}</span>
        </div>

        <div class="row-text">
          <span class="span-lable">排查时间 :&nbsp;&nbsp;</span>
          <span>{{ troubleDetail.troubleFindTime }}</span>
        </div>
        <div class="row-text">
          <span class="span-lable">隐患描述 :&nbsp;&nbsp;</span>
          <span class="span-text-3row">{{ troubleDetail.troubleDesc }}</span>
        </div>
        <div class="row-text">
          <span class="span-lable">隐患照片 :&nbsp;&nbsp; </span>
          <el-image
            v-for="(item, index) in troubleDetail.troubleFile"
            :key="index"
            :src="filePrefix + item"
            style="height: 80px; width: 80px; margin-right: 10px"
            :preview-src-list="[filePrefix + item]"
          />
        </div>
      </div>
    </div>
    <!-- 审核及整改信息 -->
    <div class="content-box">
      <span>审核及整改信息</span>
      <div class="conent-layout-y">
        <div class="row-text">
          <span class="span-lable">审核人 :&nbsp;&nbsp;</span>
          <span>{{ troubleDetail.judgeUserFullName }}</span>
        </div>
        <div class="row-text">
          <span class="span-lable">审核时间 :&nbsp;&nbsp;</span>
          <span>{{ troubleDetail.judgeTime }}</span>
        </div>
        <div class="row-text">
          <span class="span-lable">整改部门 :&nbsp;&nbsp;</span>
          <span>{{ troubleDetail.rectificationDeptName }}</span>
        </div>
        <div class="row-text">
          <span class="span-lable">整改责任人 :&nbsp;&nbsp;</span>
          <span>{{ troubleDetail.rectificationUserFullName }}</span>
        </div>
        <div class="row-text">
          <span class="span-lable">整改期限 :&nbsp;&nbsp;</span>
          <span>{{ troubleDetail.rectificationTerm }}</span>
        </div>
        <div class="row-text">
          <span class="span-lable">整改时间 :&nbsp;&nbsp;</span>
          <span>{{ troubleDetail.rectificationTime }}</span>
        </div>
        <div class="row-text">
          <span class="span-lable">整改费用 :&nbsp;&nbsp;</span>
          <span>{{ troubleDetail.rectificationCost }}</span>
        </div>

        <div class="row-text">
          <span class="span-lable">整改意见 :&nbsp;&nbsp;</span>
          <span class="span-text-3row">{{ troubleDetail.rectificationOpinions }}</span>
        </div>
        <div class="row-text">
          <span class="span-lable">整改情况 :&nbsp;&nbsp;</span>
          <span class="span-text-3row">{{ troubleDetail.rectificationSituation }}</span>
        </div>
        <div class="row-text">
          <span class="span-lable">整改照片 :&nbsp;&nbsp; </span>
          <div class="image-div">
            <el-image
              v-if="troubleDetail.rectificationFile"
              :src="filePrefix + troubleDetail.rectificationFile"
              :preview-src-list="[filePrefix + troubleDetail.rectificationFile]"
              class="el-image-set"
            />
            <span
              v-else
              class="spanText"
            >无</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 验收信息 -->
    <div class="content-box">
      <span>验收信息</span>
      <div class="conent-layout-y">
        <div class="row-text">
          <span class="span-lable">验收部门 :&nbsp;&nbsp; </span>
          <span>{{ troubleDetail.acceptanceDeptName }}</span>
        </div>
        <div class="row-text">
          <span class="span-lable">验收责任人 :&nbsp;&nbsp; </span>
          <span>{{ troubleDetail.acceptanceUserFullName }}</span>
        </div>
        <div class="row-text">
          <span class="span-lable">验收结果 :&nbsp;&nbsp; </span>
          <span>
            <el-tag
              v-if="troubleDetail.acceptanceResult === 0"
              style="font-size: 12px"
              effect="dark"
              type="error"
            >不合格</el-tag>
            <el-tag
              v-if="troubleDetail.acceptanceResult === 1"
              style="font-size: 12px"
              effect="dark"
              type="success"
            >合格</el-tag>
          </span>
        </div>
        <div class="row-text">
          <span class="span-lable">验收时间 :&nbsp;&nbsp; </span>
          <span>{{ troubleDetail.acceptanceTime }}</span>
        </div>

        <div class="row-text">
          <span class="span-lable">验收情况 :&nbsp;&nbsp; </span>
          <span class="span-text-3row">{{ troubleDetail.acceptanceSituation }}</span>
        </div>
        <div class="row-text">
          <span class="span-lable">验收照片 :&nbsp;&nbsp; </span>
          <div class="image-div">
            <el-image
              v-if="troubleDetail.acceptanceFile"
              :src="filePrefix + troubleDetail.acceptanceFile"
              :preview-src-list="[filePrefix + troubleDetail.acceptanceFile]"
              class="el-image-set"
            />
            <span
              v-else
              class="spanText"
            >无</span>
          </div>
        </div>
      </div>
    </div>
    <div
      v-for="(item, index) in troubleDetail.troubleReviews"
      :key="index"
      class="content-box"
    >
      <span>复查信息【 {{ index + 1 }} 】</span>
      <div class="conent-layout-y">
        <div class="row-text">
          <span class="span-lable">复查责任人 :&nbsp;&nbsp; </span>
          <span>{{ item.reviewerUserName }}</span>
        </div>
        <div class="row-text">
          <span class="span-lable">复查结果结果 :&nbsp;&nbsp; </span>
          <span>
            <el-tag
              v-if="item.reviewResult === 0"
              style="font-size: 12px"
              effect="dark"
              type="error"
            >不合格</el-tag>
            <el-tag
              v-if="item.reviewResult === 1"
              style="font-size: 12px"
              effect="dark"
              type="success"
            >合格</el-tag>
          </span>
        </div>
        <div class="row-text">
          <span class="span-lable">复查情况 :&nbsp;&nbsp; </span>
          <span>{{ item.reviewSituation }}</span>
        </div>
        <div class="row-text">
          <span class="span-lable">复查时间 :&nbsp;&nbsp; </span>
          <span>{{ item.reviewTime }}</span>
        </div>
        <div class="row-text">
          <span class="span-lable">复查照片 :&nbsp;&nbsp; </span>
          <div class="image-div">
            <el-image
              v-if="item.reviewFile"
              :src="filePrefix + item.reviewFile"
              :preview-src-list="[filePrefix + item.reviewFile]"
              class="el-image-set"
            />
            <span
              v-else
              class="spanText"
            >无</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// dialog concent
.dialog-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100% - 64px);
  overflow-y: auto;
  .content-box {
    display: flex;
    flex-direction: column;
    margin-top: 10px;
    > span {
      color: #606266;
      font-size: 14px;
      font-weight: bold;
      margin: 5px;
    }
    .conent-layout-y {
      display: flex;
      flex-flow: column wrap;
      border: 1px solid #0f81a3;
      padding: 15px;
      max-height: 260px;
      .row-text {
        display: flex;
        align-items: center;
        width: 46%;
        border: 1px solid #0f81a3;
        padding: 5px 10px 5px 10px;
        padding-left: 10px;
        padding-right: 10px;
        background-color: #fefff9;

        span {
          color: #606266;
          font-size: 14px;

          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        /* Span 下的width不可用 ,span有根据内容自动伸缩的能力  修改display：inline-block；*/
        .span-lable {
          display: inline-block;
          min-width: 72px;
          max-width: 100px;
        }
        //文本超出3行限制
        .span-text-3row {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }
        .image-div {
          height: 60px;
          overflow-y: auto;
          .el-image-set {
            width: 55px;
            height: 55px;
          }
          .spanText {
            line-height: 60px;
          }
        }
      }
    }
  }
}
</style>
