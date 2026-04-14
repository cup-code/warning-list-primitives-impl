<script>
import ImageSelect from '@/components/ImageSelect'
import { getSafetyMeasuresList } from '@/http/specialOperation/specialWork-api.js'
import ImplementationMeasuresDetail from '../recordDetail/implementationMeasuresDetail.vue'

export default {
  components: { ImageSelect, ImplementationMeasuresDetail },
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
    }
  },
  created() {
    this.getPrefix() // 获取图片/文件前缀
    this.getSafetyMeasuresList()
  },
  methods: {
    getSafetyMeasuresList() {
      getSafetyMeasuresList(this.sid).then(({ data }) => {
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
        label="安全落实人"
        align="center"
        prop="executorName"
        width="100"
      />
      <el-table-column
        label="安全措施"
        align="center"
        width="200"
      >
        <template slot-scope="scope">
          <div
            v-for="(item, index) in scope.row.measureContent"
            :key="index"
          >
            {{ `${index + 1}、${item.content}` }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="其他补充措施"
        prop="extraSafetyMeasures"
        width="140"
        align="center"
      />
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
        title="安全落实任务详情"
        :visible.sync="showInfoDialog"
        append-to-body
        :close-on-click-modal="false"
      >
        <ImplementationMeasuresDetail
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </div>
</template>

<style></style>
