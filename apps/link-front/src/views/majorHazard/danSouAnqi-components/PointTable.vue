<script>
import { getGroupPointByPage } from '@/http/dev/pointGroup-api.js'
import {
  getPointGroup,
  pointGroupDeleteByIo,
  pointGroupSave,
} from '@/http/major-hazard/monitorBind-api.js'
import BindPoint from '../components/bindPoint'
import DataWatchInfo from '../components/DataWatchInfo.vue'

export default {
  name: 'PointTable',
  components: {
    DataWatchInfo,
    BindPoint,
  },
  props: {
    method: {
      type: String,
      default: '',
    },
    info: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      pointsList: [],
      propData: {},
      dialogTitle: '',
      visible: false,
      visibleBind: false,
      // 打开前已选的数据
      oldList: [],
    }
  },
  watch: {
    info(v) {
      this.getDataList()
    },
  },
  methods: {
    async getDataList() {
      const { data } = await getGroupPointByPage({
        pageNum: 1,
        pageSize: 1000,
        groupId: this.info.id,
      })
      if (data.code == 200) {
        this.pointsList = data.result.list || []
      }
      else {
        this.pointsList = []
      }
    },
    // 绑定监测点位
    bindFn() {
      getPointGroup(this.info.id)
        .then(({ data }) => {
          if (data.success) {
            this.oldList = data.result || []
          }
          else {
            this.$message.warning(data.message || '获取已有信息失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取已有信息出错', err)
        })
        .finally(() => {
          this.visibleBind = true
        })
    },
    // 点击实时趋势
    realClick(item) {
      this.dialogTitle = '实时趋势'
      this.propData = {
        dataType: 'real',
        deviceCode: item.deviceCode,
        ioCode: item.ioCode,
      }
      this.visible = true
    },
    // 点击历史趋势
    historyClick(item) {
      this.dialogTitle = '历史趋势'
      this.propData = {
        dataType: 'history',
        deviceCode: item.deviceCode,
        ioCode: item.ioCode,
      }
      this.visible = true
    },
    // 关闭趋势弹窗
    closeDialogEvt(isRefresh) {
      this.visible = false
      this.getDataList()
    },
    // 关闭绑定测点弹窗
    closePoint(pickList) {
      if (pickList) {
        const pointLsitSave = {
          companyId: this.info.companyId,
          groupName: this.info.unitName,
          id: this.info.id,
          sort: 0,
          pointsList: [],
          hazardType: this.info.hazardType,
        }
        pickList.forEach((item) => {
          pointLsitSave.pointsList.push({
            ioId: item.ioId,
            sort: 0,
          })
        })
        pointGroupSave(pointLsitSave)
          .then(({ data }) => {
            if (data.success) {
              this.visibleBind = false
              this.$message.success('保存测点信息成功')
              this.getDataList()
            }
            else {
              this.$message.warning(data.message || '保存测点信息失败')
            }
          })
          .catch((err) => {
            console.log(err)
            this.$message.error('保存测点信息出错', err)
          })
      }
      else {
        this.visibleBind = false
      }
    },
    delFn(v) {
      this.$confirm(`您确认要删除 ${v.ioName}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          pointGroupDeleteByIo(v.id)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(data.message || '删除失败!')
              }
            })
            .catch((err) => {
              this.$message.error('删除失败!')
            })
        })
        .catch((e) => {})
    },
  },
}
</script>

<template>
  <div style="margin: 20px 0">
    <div style="margin: 10px 0">
      <el-button
        type="primary"
        plain
        size="mini"
        @click="bindFn"
      >
        绑定监测点位
      </el-button>
    </div>

    <el-table
      slot="table"
      :data="pointsList"
      :header-cell-style="{ background: '#f5f5f5' }"
      align="center"
      height="200"
    >
      <el-table-column
        type="index"
        width="50"
        align="center"
        label="序号"
      />
      <el-table-column
        label="测点名称"
        align="center"
        prop="ioName"
      />
      <el-table-column
        label="测点编码"
        align="center"
        prop="ioCode"
      />
      <el-table-column
        label="测点值"
        align="center"
        prop="value"
      />
      <el-table-column
        label="测点类别"
        align="center"
        prop="varType"
      >
        <template slot-scope="scope">
          {{ $dictUtils.getDictLabel('output_type', scope.row.varType) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="method !== 'view'"
        label="操作"
        min-width="160"
        align="center"
        fixed="right"
      >
        <template
          v-if="method !== 'view'"
          slot-scope="scope"
        >
          <el-button
            type="text"
            @click="realClick(scope.row)"
          >
            实时趋势
          </el-button>
          <el-button
            type="text"
            style="color: var(--ky-warning)"
            @click="historyClick(scope.row)"
          >
            历史趋势
          </el-button>
          <el-button
            type="text"
            style="color: var(--ky-danger)"
            @click="delFn(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 趋势弹窗 -->
    <el-dialog
      class="normal-dialog"
      :title="dialogTitle"
      width="900px"
      top="5vh"
      :visible.sync="visible"
      :close-on-click-modal="false"
      @close="closeDialogEvt"
    >
      <DataWatchInfo
        v-if="visible"
        v-bind="propData"
        @close="closeDialogEvt"
      />
    </el-dialog>

    <!-- 绑定弹窗 -->
    <el-dialog
      class="normal-dialog"
      title="绑定测点"
      :close-on-click-modal="false"

      width="850px"
      :visible.sync="visibleBind"
    >
      <BindPoint
        v-if="visibleBind"
        :oldList="oldList"
        @close="closePoint"
      />
    </el-dialog>
  </div>
</template>

<style scoped></style>
