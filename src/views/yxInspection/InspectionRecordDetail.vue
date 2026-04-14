<script>
import { getCurrentInstance, onMounted, ref, computed } from "vue";
import { getScheduleRecordDetail } from "@/http/inspection/yx-inspection-api";
import { parseMediaUrls, resolveMediaUrl } from "@/utils/media";
import MediaCarousel from "@/components/MediaCarousel/index.vue";
import InspectionReportPrint from "./components/InspectionReportPrint.vue";

export default {
  name: "InspectionRecordDetail",
  components: {
    MediaCarousel,
    InspectionReportPrint,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const loading = ref(false);
    const detail = ref({});
    const executePlaceInfoList = ref([]);
    const activeNames = ref([]);
    const lineName = computed(() => proxy.$route.params.lineName);
    const postName = computed(() => proxy.$route.params.postName);

    const recordId = computed(() => proxy.$route.params.id);

    // 打印报告弹窗
    const printDialogVisible = ref(false);

    // 媒体预览相关
    const mediaDialogVisible = ref(false);
    const mediaItems = ref([]);
    const currentMediaIndex = ref(0);

    // 完成条件文字转换
    const completionConditionText = computed(() => {
      const map = { 0: "任意一人", 1: "全部人员", 2: "组合完成" };
      return map[detail.value.completionCondition] ?? "-";
    });

    // 巡检人名称列表
    const executorNames = computed(() => {
      const names = detail.value.executeUsersName;
      if (Array.isArray(names) && names.length) {
        return names.join("、");
      }
      return "-";
    });

    const fetchDetail = async () => {
      if (!recordId.value) return;
      loading.value = true;
      try {
        const { data } = await getScheduleRecordDetail(recordId.value);
        if (data?.success && data.result) {
          detail.value = data.result;
          const places = data.result.executePlaceInfoList || [];
          executePlaceInfoList.value = places;
          activeNames.value = places.map((_, i) => String(i));
        } else {
          proxy.$message.error("获取详情失败");
        }
      } finally {
        loading.value = false;
      }
    };

    const handlePrint = () => {
      printDialogVisible.value = true;
    };

    const handlePrintClose = () => {
      printDialogVisible.value = false;
    };

    const handleViewPhoto = (row) => {
      if (!row.photo) {
        proxy.$message.warning("暂无照片");
        return;
      }
      // TODO: 实现照片预览
      proxy.$message.info("查看照片功能开发中");
    };

    const handlePlayVideo = (row) => {
      if (!row.video) {
        proxy.$message.warning("暂无视频");
        return;
      }
      // TODO: 实现视频播放
      proxy.$message.info("播放视频功能开发中");
    };

    const handlePlayVoice = (row) => {
      if (!row.audio) {
        proxy.$message.warning("暂无语音");
        return;
      }
      // TODO: 实现语音播放
      proxy.$message.info("播放语音功能开发中");
    };

    // 查看媒体（统一入口）
    const handleViewMedia = (row) => {
      const items = parseMediaUrls(row);
      if (!items.length) {
        proxy.$message.warning("暂无媒体文件");
        return;
      }
      mediaItems.value = items;
      currentMediaIndex.value = 0;
      mediaDialogVisible.value = true;
    };

    // 检查是否有媒体文件
    const hasMedia = (row) => {
      return !!(row.photo || row.video || row.audio);
    };

    const handleBack = () => {
      proxy.$router.go(-1);
    };

    // 解析打卡媒体文件
    const parseMarkMedia = (markInfoList) => {
      if (!markInfoList || !markInfoList.length) return [];
      const items = [];
      markInfoList.forEach((mark, markIndex) => {
        if (mark.markPhoto) {
          mark.markPhoto
            .split(",")
            .filter((url) => url.trim())
            .forEach((url, photoIndex) => {
              items.push({
                type: "image",
                url: resolveMediaUrl(url.trim()),
                name: `${mark.markUserName || "打卡"} 照片 ${photoIndex + 1}`,
              });
            });
        }
      });
      return items;
    };

    // 打卡照片预览
    const handleViewMarkPhoto = (markInfoList, markIndex, photoIndex) => {
      const items = parseMarkMedia(markInfoList);
      if (items.length) {
        mediaItems.value = items;
        // 计算在合并数组中的实际索引
        let actualIndex = 0;
        for (let i = 0; i < markIndex; i++) {
          const photos =
            markInfoList[i].markPhoto?.split(",").filter((u) => u.trim()) || [];
          actualIndex += photos.length;
        }
        actualIndex += photoIndex;
        currentMediaIndex.value = actualIndex;
        mediaDialogVisible.value = true;
      }
    };

    onMounted(() => {
      fetchDetail();
    });

    return {
      loading,
      detail,
      executePlaceInfoList,
      activeNames,
      completionConditionText,
      executorNames,
      lineName,
      postName,
      handlePrint,
      handleViewPhoto,
      handlePlayVideo,
      handlePlayVoice,
      handleViewMedia,
      hasMedia,
      handleBack,
      // 打卡照片预览
      parseMarkMedia,
      handleViewMarkPhoto,
      // 媒体预览
      mediaDialogVisible,
      mediaItems,
      currentMediaIndex,
      // 打印相关
      printDialogVisible,
      recordId,
      handlePrintClose,
      // 工具函数
      resolveMediaUrl,
    };
  },
};
</script>

<template>
  <div v-loading="loading" class="inspection-record-detail page-container">
    <ECard class="detail-outer-card">
      <!-- 头部操作 -->
      <div class="detail-header">
        <el-button type="danger" size="small" plain @click="handleBack">
          < 返回
        </el-button>
        <el-button type="success" size="small" @click="handlePrint"> 打印报告 </el-button>
      </div>

      <!-- 可滚动内容区：概要 + 列表 -->
      <div class="detail-body">
        <!-- 巡检记录概要 -->
        <ECard class="summary-card !h-auto">
          <el-descriptions size="medium">
            <!-- 第一行 -->
            <el-descriptions-item label="任务名称">{{
              detail.taskName || "-"
            }}</el-descriptions-item>

            <el-descriptions-item label="所属部门">{{
              detail.departmentName || "-"
            }}</el-descriptions-item>
            <!-- 第二行 -->
            <el-descriptions-item label="巡检岗位">{{
              postName || "-"
            }}</el-descriptions-item>

            <el-descriptions-item label="巡检人">{{
              executorNames
            }}</el-descriptions-item>
            <el-descriptions-item label="巡检路线">{{ lineName }}</el-descriptions-item>
            <!-- 第四行 -->
            <el-descriptions-item label="完成条件">{{
              completionConditionText
            }}</el-descriptions-item>
            <el-descriptions-item label="排班时间">
              {{ detail.scheduleStartTime || "-" }} ~ {{ detail.scheduleEndTime || "-" }}
            </el-descriptions-item>

            <!-- 第三行 -->
            <el-descriptions-item label="执行时间">
              {{ detail.executeStartTime || "-" }} ~ {{ detail.executeEndTime || "-" }}
            </el-descriptions-item>
          </el-descriptions>
        </ECard>

        <!-- 按点位折叠的巡检项列表 -->
        <ECard class="collapse-card">
          <template v-if="executePlaceInfoList.length">
            <el-collapse v-model="activeNames">
              <el-collapse-item
                v-for="(place, pIndex) in executePlaceInfoList"
                :key="pIndex"
                :name="String(pIndex)"
              >
                <template slot="title">
                  <span class="collapse-title">{{ place.placeName }}</span>
                </template>
                <!-- 打卡信息展示 -->
                <div
                  v-if="place.markInfoList && place.markInfoList.length"
                  class="mark-info-section"
                >
                  <div class="mark-info-content">
                    <div
                      v-for="(mark, mIndex) in place.markInfoList"
                      :key="mIndex"
                      class="mark-item"
                    >
                      <span class="mark-user"
                        >打卡人：{{ mark.markUserName || "-" }}</span
                      >
                      <span class="mark-time">打卡时间：{{ mark.markTime || "-" }}</span>
                      <div v-if="mark.markPhoto" class="mark-photos">
                        <span class="photo-label">现场照片：</span>
                        <div class="photo-thumbnails">
                          <img
                            v-for="(url, photoIdx) in mark.markPhoto
                              .split(',')
                              .filter((u) => u.trim())"
                            :key="photoIdx"
                            :src="resolveMediaUrl(url.trim())"
                            class="w-8 h-8 object-cover rounded cursor-pointer border border-gray-200 hover:border-blue-400"
                            @click="
                              handleViewMarkPhoto(place.markInfoList, mIndex, photoIdx)
                            "
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <el-table
                  :data="place.executeContentInfoList"
                  border
                  size="small"
                  :header-cell-style="{ background: 'var(--ky-head-color, #f5f7fa)' }"
                >
                  <el-table-column type="index" label="序号" width="60" align="center" />
                  <el-table-column
                    prop="contentName"
                    label="内容"
                    min-width="160"
                    show-overflow-tooltip
                  />
                  <el-table-column
                    prop="inspectionBenchmark"
                    label="标准"
                    min-width="180"
                    show-overflow-tooltip
                  />
                  <el-table-column
                    prop="executorName"
                    label="巡检人"
                    width="100"
                    align="center"
                  />
                  <!-- <el-table-column label="结果" width="80" align="center">
                    <template slot-scope="{ row }">
                      <span
                        :class="
                          row.executeResult === '正常' ? 'text-success' : 'text-danger'
                        "
                      >
                        {{ row.executeResult || "-" }}
                      </span>
                    </template>
                  </el-table-column> -->
                  <el-table-column label="是否异常" width="80" align="center">
                    <template slot-scope="{ row }">
                      <el-tag v-if="row.abnormal" type="danger" size="mini">异常</el-tag>
                      <el-tag v-else type="success" size="mini">正常</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="照片" width="80" align="center">
                    <template slot-scope="{ row }">
                      <span>
                        {{
                          row.photo && row.photo.trim()
                            ? row.photo.split(",").filter((v) => !!v.trim()).length
                            : 0
                        }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column label="视频" width="70" align="center">
                    <template slot-scope="{ row }">
                      <span>
                        {{
                          row.video && row.video.trim()
                            ? row.video.split(",").filter((v) => !!v.trim()).length
                            : 0
                        }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column label="语音" width="70" align="center">
                    <template slot-scope="{ row }">
                      <span>
                        {{
                          row.audio && row.audio.trim()
                            ? row.audio.split(",").filter((v) => !!v.trim()).length
                            : 0
                        }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="audioText"
                    label="语音文字"
                    min-width="100"
                    show-overflow-tooltip
                  />

                  <el-table-column
                    prop="reportingTime"
                    label="上报时间"
                    width="160"
                    align="center"
                  />
                  <el-table-column label="操作" width="100" align="center">
                    <template slot-scope="{ row }">
                      <el-button
                        type="text"
                        size="small"
                        :disabled="!hasMedia(row)"
                        @click="handleViewMedia(row)"
                      >
                        查看媒体
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-collapse-item>
            </el-collapse>
          </template>
          <el-empty v-else description="暂无巡检项列表" />
        </ECard>
      </div>
    </ECard>

    <!-- 媒体预览弹窗 -->
    <el-dialog
      title="媒体预览"
      :visible.sync="mediaDialogVisible"
      width="800px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <MediaCarousel
        v-if="mediaItems.length"
        :items="mediaItems"
        :initial-index="currentMediaIndex"
      />
      <el-empty v-else description="暂无媒体文件" />
    </el-dialog>

    <!-- 打印报告弹窗 -->
    <InspectionReportPrint
      :visible.sync="printDialogVisible"
      :schedule-record-id="recordId"
      :line-name="lineName"
      :post-name="postName"
      @close="handlePrintClose"
    />
  </div>
</template>

<style lang="scss" scoped>
.inspection-record-detail {
  .detail-outer-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .detail-header {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 16px;
  }

  .detail-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .summary-card {
    margin-bottom: 16px;
  }

  .collapse-card {
    margin-top: 0;
  }

  .collapse-title {
    font-weight: 500;
    color: #303133;
  }

  .text-success {
    color: #67c23a;
    font-weight: 500;
  }

  .text-danger {
    color: #f56c6c;
    font-weight: 500;
  }

  .link-blue {
    color: #409eff;
    padding: 0;
  }

  ::v-deep .el-collapse-item__header {
    font-size: 14px;
  }

  ::v-deep .el-collapse-item__wrap {
    border-bottom: none;
  }

  .mark-info-section {
    margin: 12px 0;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;

    .mark-info-content {
      .mark-item {
        display: flex;
        items-align: center;
        margin-bottom: 8px;
        &:last-child {
          margin-bottom: 0;
        }
      }

      .mark-user,
      .mark-time {
        margin-right: 16px;
        color: #606266;
      }

      .mark-photos {
        display: flex;
        items-align: center;
        .photo-label {
          color: #606266;
        }

        .photo-thumbnails {
          display: flex;
          items-align: center;
        }

        .photo-thumb {
          width: 30px;
          height: 30px;
          object-fit: cover;
          border-radius: 4px;
          cursor: pointer;
          border: 1px solid #dcdfe6;

          &:hover {
            border-color: #409eff;
          }
        }
      }
    }
  }
}
</style>
