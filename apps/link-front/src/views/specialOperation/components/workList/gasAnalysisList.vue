<script>
import ImageSelect from '@/components/ImageSelect'
import { getGasAnalysisList } from '@/http/specialOperation/specialWork-api.js'
import GasAnalysisDetail from '../recordDetail/gasAnalysisDetail.vue'

export default {
  components: { ImageSelect, GasAnalysisDetail },
  props: {
    // 特殊作业id
    sid: {
      type: [String, Number],
      default: '',
    },
  },
  data() {
    return {
      tableData: [],
      showInfoDialog: false,
      propData: {},
      text: '',
    }
  },
  created() {
    this.getPrefix() // 获取图片/文件前缀
    this.getGasAnalysisList()
  },
  methods: {
    getGasAnalysisList() {
      getGasAnalysisList(this.sid).then(({ data }) => {
        this.tableData = data.result || []
      })
    },
    checkClick(item) {
      this.propData = {
        detailData: item,
      }
      this.showInfoDialog = true
    },
    /* 关闭弹窗事件 */
    closeDialogEvt() {
      this.showInfoDialog = false
    },
  },
}
</script>

<template>
  <div style="min-height: 400px">
    <!-- 表格 -->
    <el-table
      :data="tableData"
      row-key="sort"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      align="center"
    >
      <el-table-column
        label="序号"
        align="center"
        type="index"
      />
      <el-table-column
        label="任务下发时间"
        align="center"
        prop="createdTime"
        width="140"
      />
      <el-table-column
        label="任务执行时间"
        align="center"
        prop="signTime"
        width="140"
      />
      <el-table-column
        label="气体分析人"
        align="center"
        prop="executorName"
        width="100"
      />
      <el-table-column
        label="分析地点"
        align="center"
        prop="analyzePlace"
        width="140"
      />
      <el-table-column
        label="检测照片"
        align="center"
      >
        <template slot-scope="scope">
          <div style="display: flex; align-items: center; justify-content: center">
            <ImageSelect
              :signUrl="scope.row.checkImage ? filePrefix + scope.row.checkImage : ''"
              width="60px"
              height="30px"
              disabled
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="分析结果"
        width="140"
        align="center"
      >
        <template
          v-if="scope.row.analyzeResult && scope.row.analyzeResult.length"
          slot-scope="scope"
        >
          <span>{{
            `检测含氧量(${scope.row.analyzeResult[0]})%,可燃气体(${scope.row.analyzeResult[1]})%LEL,氢气(${scope.row.analyzeResult[2]})%LEL,氨气(${scope.row.analyzeResult[3]})%LEL,有毒介质气体(${scope.row.analyzeResult[4]})ppm,符合特殊作业要求`
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="签名"
        align="center"
      >
        <template slot-scope="scope">
          <div style="display: flex; align-items: center; justify-content: center">
            <ImageSelect
              :signUrl="scope.row.signImagePath ? filePrefix + scope.row.signImagePath : ''"
              width="60px"
              height="30px"
              disabled
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="100"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            @click="checkClick(scope.row)"
          >
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 弹窗 -->
    <div slot="dialog">
      <el-dialog
        class="large-dialog"
        width="1200px"
        title="气体分析任务详情"
        :visible.sync="showInfoDialog"
        append-to-body
        :close-on-click-modal="false"
      >
        <GasAnalysisDetail
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </div>
</template>

<style></style>
