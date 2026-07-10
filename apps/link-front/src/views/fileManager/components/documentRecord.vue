/* * @Author: xiaorui 指定文档的会签、告知、修订记录弹框 * @Date: 2023-01-11 09:55:30 * @Last
Modified by: xiaorui * @Last Modified time: 2023-04-24 14:42:44 */
<script>
import {
  getInformListByDocIdFn,
  getReviewListByDocIdFn,
  getReviseListByDocIdFn,
} from '@/http/file-manager/document-api'

export default {
  data() {
    return {
      visible: false,
      loading: false,
      title: '记录',
      type: '',
      tableData: [],
      total: 0,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        docId: '',
      },
    }
  },
  methods: {
    init(type, docId) {
      this.type = type
      this.searchData.pageNum = 1
      this.searchData.docId = docId
      this.visible = true
      this.getTableData()
    },
    getTableData() {
      let funcFn
      switch (this.type) {
        case 'review':
          this.title = '会签记录'
          funcFn = getReviewListByDocIdFn
          break
        case 'inform':
          this.title = '告知记录'
          funcFn = getInformListByDocIdFn
          break
        case 'revise':
          this.title = '修订记录'
          funcFn = getReviseListByDocIdFn
          break
        default:
          break
      }
      this.loading = true
      funcFn(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result.list || []
            this.total = data.result.total
          }
          else {
            this.$message.warning(data.message || '获取列表数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表数据失败', err)
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
}
</script>

<template>
  <el-dialog
    :title="title"
    :close-on-click-modal="false"

    :visible.sync="visible"
    class="normal-dialog"
  >
    <el-table
      v-loading="loading"
      :data="tableData"
      :header-cell-style="{ background: '#f5f5f5' }"
      align="center"
      :height="300"
    >
      <el-table-column
        label="文档/文件名称"
        align="center"
        prop="docName"
        min-width="100"
      />
      <el-table-column
        label="文档编号"
        align="center"
        prop="docCode"
        min-width="100"
      />
      <el-table-column
        v-if="type === 'review'"
        label="会签时间"
        align="center"
        prop="reviewDate"
        min-width="100"
      />
      <el-table-column
        v-if="type === 'review'"
        label="会签人"
        align="center"
        prop="reviewerName"
        min-width="100"
      />
      <el-table-column
        v-if="type === 'review'"
        label="会签状态"
        align="center"
        prop="reviewState"
        min-width="100"
      >
        <template slot-scope="props">
          <el-tag
            v-if="props.row.reviewState === -1"
            type="info"
          >
            等待上一步评审完成
          </el-tag>
          <el-tag
            v-if="props.row.reviewState === 0"
            type="warning"
          >
            未评审
          </el-tag>
          <el-tag
            v-if="props.row.reviewState === 1"
            type="danger"
          >
            拒绝
          </el-tag>
          <el-tag
            v-if="props.row.reviewState === 2"
            type="success"
          >
            通过
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="type === 'review'"
        label="会签意见"
        align="center"
        prop="reviewOpinion"
        min-width="150"
      />
      <el-table-column
        v-if="type === 'inform'"
        label="告知时间"
        align="center"
        prop="receiveDate"
        min-width="100"
      />
      <el-table-column
        v-if="type === 'inform'"
        label="告知人"
        align="center"
        prop="receiverName"
        min-width="100"
      />
      <el-table-column
        v-if="type === 'inform'"
        label="告知状态"
        align="center"
        prop="informed"
        min-width="100"
      >
        <template slot-scope="props">
          <el-tag
            v-if="props.row.informed"
            type="info"
          >
            已告知
          </el-tag>
          <el-tag
            v-if="!props.row.informed"
            type="info"
          >
            未告知
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="type === 'revise'"
        label="修订时间"
        align="center"
        prop="reviseDate"
        min-width="100"
      />
      <el-table-column
        v-if="type === 'revise'"
        label="修订人员"
        align="center"
        prop="reviserId"
        min-width="100"
      />
      <el-table-column
        v-if="type === 'revise'"
        label="修订版本"
        align="center"
        prop="reviseVersion"
        min-width="100"
      />
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      :current-page.sync="searchData.pageNum"
      :page-sizes="[10, 20, 50]"
      :page-size.sync="searchData.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      style="text-align: right; margin: 10px"
      @size-change="getTableData"
      @current-change="getTableData"
    />
  </el-dialog>
</template>
