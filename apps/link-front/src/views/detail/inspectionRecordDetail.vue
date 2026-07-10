/* * @Author: xiaorui 巡检记录详情页 * @Date: 2022-05-17 09:59:36 * @Last Modified by: xiaorui *
@Last Modified time: 2022-08-05 17:44:01 */
<script>
import { getInspectionRecordDetailFn } from '@/http/dev_new/inspection-api'

export default {
  data() {
    return {
      loading: false,
      typeList: [
        {
          label: '日常巡检',
          value: '1',
          id: 1,
        },
        {
          label: '专业点检',
          value: '2',
          id: 2,
        },
        {
          label: '精密点检',
          value: '3',
          id: 3,
        },
        {
          label: '辅助记录',
          value: '4',
          id: 4,
        },
      ],
      cycleOptions: [
        {
          label: '每天',
          value: 'DAY',
          id: 1,
        },
        {
          label: '每周',
          value: 'WEEK',
          id: 2,
        },
        {
          label: '每月',
          value: 'MONTH',
          id: 3,
        },
        {
          label: '每年',
          value: 'YEAR',
          id: 4,
        },
      ],
      recordDetail: {},
      rowSpanArr: [],
      position: 0,
      picDatailDialog: false, // 图片详情的弹框
      picUrl: '', // 图片详情的url地址
    }
  },
  created() {
    this.getPrefix()
    this.recordId = this.$route.params.id
    this.getRecordDetail(this.recordId)
  },
  methods: {
    getRecordDetail() {
      this.loading = true
      getInspectionRecordDetailFn(this.recordId).then(({ data }) => {
        this.loading = false
        if (data.success) {
          // 处理数据，转为table需要的格式
          if (data.result.executePlaceInfoList && data.result.executePlaceInfoList.length) {
            data.result.executePlaceInfoList.forEach((place) => {
              if (place.executeAssetDeviceInfoList && place.executeAssetDeviceInfoList.length) {
                place.executeAssetDeviceInfoList.forEach((device) => {
                  if (device.executePositionInfoList && device.executePositionInfoList.length) {
                    device.tableList = []
                    device.executePositionInfoList.forEach((part) => {
                      if (part.executeContentInfoList && part.executeContentInfoList.length) {
                        part.executeContentInfoList.forEach((content) => {
                          const tableItem = Object.assign(content, {
                            positionName: part.positionName,
                          })
                          device.tableList.push(tableItem)
                        })
                      }
                    })
                    // console.log(device.tableList)
                    // this.getRowSpan(device.tableList)
                  }
                })
              }
            })
          }
          this.recordDetail = data.result || {}
        }
        else {
          this.$message.error(data.message || '获取详情失败')
        }
      })
    },
    // 获取需要合并的部位
    // getRowSpan(tableList) {
    //   this.rowSpanArr = []
    //   tableList.forEach((item, index) => {
    //     if (index == 0) {
    //       this.rowSpanArr.push(1)
    //       this.position = 0
    //     } else {
    //       if (tableList[index].positionName == tableList[index - 1].positionName) {
    //         this.rowSpanArr[this.position] += 1 //部位名称相同，合并到同一个数组中
    //         this.rowSpanArr.push(0)
    //         tableList[index].positionName = tableList[index - 1].positionName
    //       } else {
    //         this.rowSpanArr.push(1)
    //         this.position = index
    //       }
    //     }
    //   });
    // },
    getLabel(val, list) {
      if (val) {
        return (
          this[list].find((item) => {
            return item.value === val
          }) || {}
        ).label
      }
    },
    objectSpanMethod({
      row,
      column,
      rowIndex,
      columnIndex,
    }) {
      // 只合并区域位置
      if (columnIndex === 1) {
        const _row = this.rowSpanArr[rowIndex]
        return {
          rowspan: _row, // 行
          colspan: 1, // 列
        }
      }
    },
    // 查看照片
    toPicDetail(picUrl) {
      this.picUrl = picUrl
      this.picDatailDialog = true
    },
    backFn() {
      this.$router.go(-1)
    },
  },
}
</script>

<template>
  <div
    v-loading="loading"
    class="page-container record-detail"
  >
    <ECard customStyle="height:calc(100vh - 100px)">
      <el-col
        :span="24"
        class="mb-3 text-left"
      >
        <EButton
          type="primary"
          @click="backFn"
        >
          返回
        </EButton>
      </el-col>
      <ECard>
        <el-descriptions title="专项巡检">
          <el-descriptions-item label="巡检班次">
            {{ recordDetail.taskName }}
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">
            {{
              recordDetail.scheduleStartTime
            }}
          </el-descriptions-item>
          <el-descriptions-item label="结束时间">
            {{
              recordDetail.scheduleEndTime
            }}
          </el-descriptions-item>
          <el-descriptions-item label="上传时间">
            {{
              recordDetail.executeEndTime
            }}
          </el-descriptions-item>
          <el-descriptions-item label="所属部门">
            {{
              recordDetail.departmentName
            }}
          </el-descriptions-item>
          <el-descriptions-item label="巡检类别">
            {{
              getLabel(recordDetail.type, 'typeList')
            }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="recordDetail.scheduleMode === 'CYCLE'"
            label="周期"
          >
            {{
              `${getLabel(recordDetail.cycleFiled, 'cycleOptions') + recordDetail.frequency}次`
            }}
          </el-descriptions-item>
          <el-descriptions-item label="巡检岗位">
            {{ recordDetail.postName }}
          </el-descriptions-item>
          <el-descriptions-item label="巡检责任人">
            {{
              recordDetail.liableUsername
            }}
          </el-descriptions-item>
          <el-descriptions-item label="巡检人">
            {{
              (recordDetail.executeUsersName || []).join(',')
            }}
          </el-descriptions-item>
        </el-descriptions>
        <div
          v-for="(place, index) in recordDetail.executePlaceInfoList"
          :key="index"
          style="margin-top: 10px"
        >
          <div>{{ `【${index + 1}】${place.placeName}` }}</div>
          <el-divider />
          <div
            v-for="(device, devIndex) in place.executeAssetDeviceInfoList"
            :key="devIndex"
          >
            <div>
              {{ `【${index + 1}-${devIndex + 1}】${device.assetName}` }}
            </div>
            <el-divider />
            <el-table
              :data="device.tableList || []"
              :header-cell-style="{ background: 'var(--ky-head-color)' }"
            >
              <el-table-column
                type="index"
                label="序号"
                width="50"
              />
              <el-table-column
                align="center"
                prop="positionName"
                label="部位"
              />
              <el-table-column
                align="center"
                min-width="120px"
                prop="contentName"
                label="内容"
              />
              <el-table-column
                align="center"
                prop="inspectionBenchmark"
                label="基准"
              />
              <el-table-column
                align="center"
                prop="executorName"
                label="巡检人"
              />
              <el-table-column
                align="center"
                prop="executeResult"
                label="观察结果"
              />
              <el-table-column
                align="center"
                prop="abnormal"
                label="是否异常"
              >
                <template slot-scope="props">
                  <el-tag
                    v-if="props.row.abnormal"
                    type="danger"
                  >
                    是
                  </el-tag>
                  <el-tag
                    v-if="!props.row.abnormal"
                    type="success"
                  >
                    否
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                label="照片"
                prop="photo"
                align="center"
              >
                <template slot-scope="props">
                  <el-button
                    v-if="props.row.photo"
                    size="mini"
                    type="text"
                    @click="toPicDetail(props.row.photo)"
                  >
                    查看
                  </el-button>
                  <span v-if="!props.row.photo">无</span>
                </template>
              </el-table-column>
              <el-table-column
                align="center"
                prop="reportingTime"
                min-width="120px"
                label="上报时间"
              />
            </el-table>
          </div>
        </div>
      </ECard>
    </ECard>

    <!-- 查看图片详情的弹框 -->
    <el-dialog
      title="图片详情"

      :visible.sync="picDatailDialog"
    >
      <el-image :src="filePrefix + picUrl" />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.record-detail ::v-deep {
  .el-divider--horizontal {
    margin: 12px 0;
  }
  .el-descriptions__header {
    display: block;
  }
}
.btnArea {
  display: flex;
  justify-content: flex-end;
}
</style>
