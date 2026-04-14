<script>
import ImageSelect from '@/components/ImageSelect'
import { getCheckList } from '@/http/specialOperation/specialWork-api.js'
import CheckDetail from '../recordDetail/checkDetail.vue'

export default {
  components: { ImageSelect, CheckDetail },
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
    this.getCheckList()
  },
  methods: {
    getCheckList() {
      getCheckList(this.sid).then(({ data }) => {
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
        label="任务执行人员"
        align="center"
        prop="executorName"
        width="100"
      />
      <el-table-column
        label="核实人员照片"
        align="center"
        width="180"
      >
        <template slot-scope="scope">
          <div style="display: flex; align-items: center; justify-content: center">
            <ImageSelect
              v-for="(item, index) in scope.row.verifyPersonPhoto"
              v-if="item"
              :key="index"
              :signUrl="item ? filePrefix + item : ''"
              width="60px"
              height="30px"
              disabled
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="检测行为照片"
        align="center"
        width="180"
      >
        <template slot-scope="scope">
          <div style="display: flex; align-items: center; justify-content: center">
            <ImageSelect
              v-for="(items, indexs) in scope.row.verifyActionPhoto"
              v-if="items"
              :key="indexs"
              :signUrl="items ? filePrefix + items : ''"
              width="60px"
              height="30px"
              disabled
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="巡检意见"
        align="center"
        prop="opinion"
        width="140"
      />
      <el-table-column
        label="作业情况"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.existProblems ? '有问题' : '无问题' }}</span>
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
        title="巡检任务详情"
        :visible.sync="showInfoDialog"
        append-to-body
        :close-on-click-modal="false"
      >
        <CheckDetail
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </div>
</template>

<style></style>
