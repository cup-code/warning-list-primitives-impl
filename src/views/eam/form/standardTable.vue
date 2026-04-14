/* * @Author: xiaorui 巡检点里的设备，点击查看巡检标准的弹框 * @Date: 2022-04-28 16:47:44 * @Last
Modified by: xiaorui * @Last Modified time: 2022-04-28 17:14:06 */
<script>
import { getInspectionContentByIdFn } from '@/http/dev_new/inspection-api'

export default {
  data: () => ({
    visible: false,
    loading: false,
    tableData: [],
  }),
  methods: {
    init(deviceId) {
      this.visible = true
      this.loading = true
      getInspectionContentByIdFn({ deviceId })
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result || []
          }
          else {
            this.$message.warning(data.message || '获取列表数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表数据出错', err)
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 把巡检方式保存的code转为label
    getLabel(valArr) {
      const labelArr = []
      valArr.forEach((item) => {
        const label = this.$dictUtils.getDictLabel('inspection_methods', item)
        labelArr.push(label)
      })
      return labelArr
    },
  },
}
</script>

<template>
  <el-dialog
    title="查看巡检标准"
    :close-on-click-modal="false"
    width="700px"

    :visible.sync="visible"
    class="normal-dialog"
  >
    <el-table
      v-loading="loading"
      :data="tableData"
      :header-cell-style="{ background: '#f5f5f5' }"
      height="400px"
    >
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-table
            :data="props.row.contentVOList"
            class="demo-table-expand"
          >
            <el-table-column
              label="编号"
              align="center"
              prop="contentCode"
            />
            <el-table-column
              label="巡检内容"
              align="center"
              prop="contentName"
            />
            <el-table-column
              label="排序"
              align="center"
              prop="sortOrder"
            />
            <el-table-column
              label="基准"
              align="center"
              prop="inspectionBenchmark"
            />
            <el-table-column
              label="巡检方法"
              align="center"
              prop="inspectionModeList"
            >
              <template slot-scope="scope">
                <el-tag
                  v-for="item in getLabel(scope.row.inspectionModeList)"
                  :key="item"
                  type="success"
                >
                  {{ item }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              label="数据类别"
              align="center"
              prop="dataType"
            >
              <template slot-scope="scope">
                <el-tag type="success">
                  {{
                    scope.row.dataType === 'RADIO' ? '单选' : '数值'
                  }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              label="辅助功能"
              align="center"
            >
              <template slot-scope="scope">
                <el-tag
                  v-if="scope.row.mustPhotograph"
                  type="'success"
                >
                  强拍
                </el-tag>
                <el-tag
                  v-if="scope.row.abnormalMustPhotograph"
                  type="'success"
                >
                  异常强拍
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column
        label="编号"
        align="center"
        prop="positionCode"
      />
      <el-table-column
        label="部位名称"
        align="center"
        prop="positionName"
      />
      <el-table-column
        label="排序"
        align="center"
        prop="sortOrder"
      />
      <el-table-column
        label="状态"
        align="center"
        prop="enable"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.enable ? 'success' : 'danger'">
            {{
              scope.row.enable ? '启用' : '停用'
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="备注"
        align="center"
        prop="remarks"
      />
    </el-table>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button @click="visible = false">关闭</el-button>
    </span>
  </el-dialog>
</template>
