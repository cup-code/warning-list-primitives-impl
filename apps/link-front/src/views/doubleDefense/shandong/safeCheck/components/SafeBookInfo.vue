<script>
import { deviceCheckDetailsById, safeCheckDetailsById } from '@/http/defense/shandong/safeCheck-api'

export default {
  props: {
    troubleId: {
      type: String,
      default: '',
    },
    isDevice: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      timeLineProp: {
        curStep: 0,
        numWidth: 50, // 数字宽度
        desWidth: 150, // 描述宽度
        dataList: [
          { name: '问题报告', content: '' },
          { name: '隐患审核', content: '' },
          { name: '整改', content: '' },
          { name: '验收', content: '' },
          { name: '复查', content: '' },
        ],
      },
      tableData: {},
    }
  },
  created() {
    this.getPrefix()
    this.getDataInfo()
  },
  methods: {
    async getDataInfo() {
      this.isLoading = true
      const func = this.isDevice ? deviceCheckDetailsById : safeCheckDetailsById
      await func(this.troubleId)
        .then(({ data }) => {
          if (data.success) {
            const { troubleFile } = data.result
            this.tableData = Object.assign({}, data.result, {
              troubleFile: troubleFile
                ? Array.isArray(troubleFile)
                  ? troubleFile
                  : troubleFile.split('[')[1].split(']')[0].split(',')
                : [],
            })
            if (data.result.troubleState === -1) {
              this.timeLineProp.dataList = [
                {
                  name: '问题报告',
                  content: this.tableData.troubleFindTime,
                },
                {
                  name: '隐患审核(非隐患)',
                  content: this.tableData.judgeTime,
                },
              ]
              this.timeLineProp.curStep = 2
              return
            }
            this.timeLineProp.dataList[0].content = this.tableData.troubleFindTime
            this.timeLineProp.dataList[1].content = this.tableData.judgeTime
            this.timeLineProp.dataList[2].content = this.tableData.rectificationTime
            this.timeLineProp.dataList[3].content = this.tableData.acceptanceTime
            if (this.tableData.troubleReviews && this.tableData.troubleReviews.length) {
              const reviewsLength = this.tableData.troubleReviews.length
              this.timeLineProp.dataList[4].content
                = this.tableData.troubleReviews[reviewsLength - 1].reviewTime
            }
            // 判断当前步骤
            if (this.tableData.troubleReviews && this.tableData.troubleReviews.length) {
              this.timeLineProp.curStep = 5
            }
            else if (this.tableData.acceptanceTime) {
              this.timeLineProp.curStep = 4
            }
            else if (this.tableData.rectificationTime) {
              this.timeLineProp.curStep = 4
            }
            else if (this.tableData.judgeTime) {
              this.timeLineProp.curStep = 2
            }
            else if (this.tableData.troubleFindTime) {
              this.timeLineProp.curStep = 1
            }
            else {
              this.timeLineProp.curStep = 0
            }
          }
          else {
            this.$message.warning(data.message || '获取表格数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取表格数据出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 关闭弹窗 */
    closeClick() {
      this.$emit('close')
    },
  },
}
</script>

<template>
  <div class="hidden-book-info">
    <div class="info-line">
      <TimeLine v-bind="timeLineProp" />
    </div>
    <div class="title">
      基本信息
    </div>
    <div class="inline-box">
      <div class="inline-box-item">
        <span>隐患来源：</span>{{ $dictUtils.getDictLabel('sourceOfHiddenDanger', tableData.troubleSource, '--') }}
      </div>
      <div class="inline-box-item">
        <span>隐患等级：</span>{{
          $dictUtils.getDictLabel('hiddenDangerLevel', tableData.troubleLevel, '隐患等级待审核')
        }}
      </div>
    </div>
    <template v-if="tableData.troubleExtInfo">
      <div
        v-if="tableData.troubleExtInfo.riskAnalysisUnit"
        class="inline-box"
      >
        <div class="inline-box-item">
          <span>分析单元：</span>{{ tableData.troubleExtInfo.riskAnalysisUnit }}
        </div>
        <div class="inline-box-item">
          <span>风险事件：</span>{{ tableData.troubleExtInfo.riskEvent }}
        </div>
      </div>
      <!-- <div class="inline-box">
        <div class="inline-box-item"><span>管控措施：</span>{{ tableData.troubleFindTime }}</div>
      </div> -->
      <div class="inline-box">
        <div class="inline-box-item">
          <span>检查内容：</span>{{ tableData.troubleExtInfo.checkContent }}
        </div>
      </div>
      <div
        v-if="tableData.troubleExtInfo.checkBasis"
        class="inline-box"
      >
        <div class="inline-box-item">
          <span>检查依据：</span>{{ tableData.troubleExtInfo.checkBasis }}
        </div>
      </div>
    </template>
    <div class="inline-box">
      <div class="inline-box-item">
        <span>检查人：</span>{{ tableData.checkUserFullName }}
      </div>
      <div class="inline-box-item">
        <span>上报时间：</span>{{ tableData.troubleFindTime }}
      </div>
    </div>
    <div class="inline-box">
      <div class="inline-box-item">
        <span>业务类型：</span>{{ $dictUtils.getDictLabel('trouble_business_type', tableData.businessType, '--') }}
      </div>
      <div class="inline-box-item">
        <span>隐患位置：</span>{{ tableData.troubleLocation }}
      </div>
    </div>
    <div class="inline-box">
      <div class="inline-box-item">
        <span>隐患现状描述：</span>{{ tableData.troubleDesc }}
      </div>
    </div>
    <div class="inline-box">
      <div
        class="inline-box-item"
        style="display: flex; align-items: flex-start; flex-wrap: wrap"
      >
        <span>隐患照片：</span>
        <el-image
          v-for="(item, index) in tableData.troubleFile"
          :key="index"
          :src="filePrefix + item"
          style="height: 80px; width: 80px; margin-right: 10px"
          :preview-src-list="[filePrefix + item]"
        />
      </div>
    </div>
    <div class="title">
      审核及整改信息
    </div>
    <div class="inline-box">
      <div class="inline-box-item">
        <span>审核人：</span>{{ tableData.judgeUserFullName }}
      </div>
      <div class="inline-box-item">
        <span>审核时间：</span>{{ tableData.judgeTime }}
      </div>
    </div>
    <!-- 如果审核为非隐患则不显示 -->
    <template v-if="tableData.troubleState !== -1">
      <div class="inline-box">
        <div class="inline-box-item">
          <span>整改部门：</span>{{ tableData.rectificationDeptName }}
        </div>
        <div class="inline-box-item">
          <span>整改责任人：</span>{{ tableData.rectificationUserFullName }}
        </div>
      </div>
      <div class="inline-box">
        <div class="inline-box-item">
          <span>要求整改期限：</span>{{ tableData.rectificationTerm }}
        </div>
        <div class="inline-box-item">
          <span>整改措施：</span>{{ tableData.rectificationOpinions }}
        </div>
      </div>
      <div class="inline-box">
        <div class="inline-box-item">
          <span>部门意见：</span>{{ tableData.distributeOpinions }}
        </div>
        <div class="inline-box-item">
          <span>实际整改时间：</span>{{ tableData.rectificationTime }}
        </div>
      </div>
      <div class="inline-box">
        <div class="inline-box-item">
          <span>整改情况：</span>{{ tableData.rectificationSituation }}
        </div>
        <div class="inline-box-item">
          <span>整改费用：</span>{{ tableData.rectificationCost }}
        </div>
      </div>
      <div class="inline-box">
        <div
          class="inline-box-item"
          style="display: flex; align-items: flex-start"
        >
          <span>整改照片：</span>
          <el-image
            v-if="tableData.rectificationFile"
            :src="filePrefix + tableData.rectificationFile"
            :preview-src-list="[filePrefix + tableData.rectificationFile]"
            style="height: 80px; width: 80px"
          />
          <span v-else>-</span>
        </div>
      </div>
      <div class="title">
        验收信息
      </div>
      <div class="inline-box">
        <div class="inline-box-item">
          <span>验收部门：</span>{{ tableData.acceptanceDeptName }}
        </div>
        <div class="inline-box-item">
          <span>验收责任人：</span>{{ tableData.acceptanceUserFullName }}
        </div>
      </div>
      <div class="inline-box">
        <div class="inline-box-item">
          <span>验收结果：</span>
          <el-tag
            v-if="tableData.acceptanceResult === 0"
            type="error"
          >
            不合格
          </el-tag>
          <el-tag
            v-if="tableData.acceptanceResult === 1"
            type="success"
          >
            合格
          </el-tag>
        </div>
        <div class="inline-box-item">
          <span>验收情况：</span>{{ tableData.acceptanceSituation }}
        </div>
      </div>
      <div class="inline-box">
        <div class="inline-box-item">
          <span>验收时间：</span>{{ tableData.acceptanceTime }}
        </div>
      </div>
      <div class="inline-box">
        <div
          class="inline-box-item"
          style="display: flex; align-items: flex-start"
        >
          <span>验收照片：</span>
          <el-image
            v-if="tableData.acceptanceFile"
            :src="filePrefix + tableData.acceptanceFile"
            :preview-src-list="[filePrefix + tableData.acceptanceFile]"
            style="height: 80px; width: 80px"
          />
          <span v-else>-</span>
        </div>
      </div>
      <div
        v-for="(item, index) in tableData.troubleReviews"
        :key="index"
      >
        <div class="title">
          复查信息【 {{ index + 1 }} 】
        </div>
        <div class="inline-box">
          <div class="inline-box-item">
            <span>复查责任人：</span>{{ item.reviewerUserName }}
          </div>
        </div>
        <div class="inline-box">
          <div class="inline-box-item">
            <span>复查结果：</span>
            <el-tag
              v-if="item.reviewResult === 0"
              type="error"
            >
              不合格
            </el-tag>
            <el-tag
              v-if="item.reviewResult === 1"
              type="success"
            >
              合格
            </el-tag>
          </div>
        </div>
        <div class="inline-box">
          <div class="inline-box-item">
            <span>复查情况：</span>{{ item.reviewSituation }}
          </div>
        </div>
        <div class="inline-box">
          <div class="inline-box-item">
            <span>复查时间：</span>{{ item.reviewTime }}
          </div>
        </div>
        <div class="inline-box">
          <div
            class="inline-box-item"
            style="display: flex; align-items: flex-start"
          >
            <span>复查照片：</span>
            <el-image
              v-if="item.reviewFile"
              :src="filePrefix + item.reviewFile"
              :preview-src-list="[filePrefix + item.reviewFile]"
              style="height: 80px; width: 80px"
            />
            <span v-else>-</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.hidden-book-info {
  padding: 0 15px 20px 15px;
  width: 100%;
  height: calc(100% - 50px);
  overflow-y: auto;
  .title {
    font-weight: bold;
    font-size: 16px;
    position: relative;
    text-indent: 10px;
    margin-bottom: 10px;
    padding-left: 3px;
  }
  .title::before {
    content: '';
    width: 5px;
    height: 18px;
    background: var(--ky-primary);
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 0;
  }
  .info-line {
    height: 80px;
    margin: 0 0 10px 0;
  }
  .inline-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 0 20px 0;
    padding: 0 10px;
    .inline-box-item {
      flex: 1;
      overflow: hidden;
      span {
        font-weight: bold;
      }
    }
  }
}
</style>
