<script>
import { getAuthToken } from '@/utils/tab-session'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/vue-query'
import {
  computed,
  getCurrentInstance,
  onMounted,
  reactive,
  ref,
} from 'vue'
import { createAxiosFromStore } from '@/http/common/utils'
import {
  getStationList,
  importStationData,
} from '@/http/safe-production/production-schedule-api.js'

export default {
  name: 'VolumeCalibration',
  props: {
    station: {
      type: String,
      default: '丹务1',
    },
  },
  setup(props) {
    const vm = getCurrentInstance().proxy
    const queryClient = useQueryClient()
    const checked = ref(false)

    const adjustParams = reactive({
      pageNum: 1,
      pageSize: 10,
      isPage: false,
      station: props.station,
      category: '调节池',
    })

    const reactionParams = reactive({
      pageNum: 1,
      pageSize: 10,
      isPage: false,
      station: props.station,
      category: '反应池',
    })
    const tableData = ref([])
    const reactionTableData = ref([])

    const getVolumeRatio = computed(() => {
      return tableData.value.length > 0
        ? tableData.value
            .sort((a, b) => a.height - b.height)
            .map((item) => {
              const info = tableData.value.find(i => i.height === item.height)
              return info ? [Number(info.height), Number(item.volumeRatio)] : []
            })
        : []
    })

    const getReactionVolumeRatio = computed(() => {
      return reactionTableData.value.length > 0
        ? reactionTableData.value
            .sort((a, b) => a.height - b.height)
            .map((item) => {
              const info = reactionTableData.value.find(i => i.height === item.height)
              return info ? [Number(info.height), Number(item.volumeRatio)] : []
            })
        : []
    })

    const chartInstance = ref(null)
    const updateChartOption = () => {
      if (!chartInstance.value) {
        return
      }

      // 打印数据看看是否正确
      const volumeOption = {
        color: ['#6fbec7', '#6595ee'],
        tooltip: {
          trigger: 'axis',
        },
        grid: {
          left: '2%',
          right: '10%',
          bottom: '10%',
          top: '14%',
          containLabel: true,
        },
        legend: {
          type: 'plain',
          show: true,
          textStyle: {
            color: '#333',
          },
          orient: 'horizontal',
          top: 0,
          left: 3,
        },
        xAxis: {
          name: '高度 单位：mm ',
          type: 'value',
        },
        dataZoom: [
          {
            type: 'slider',
          },
        ],
        yAxis: {
          name: '液位体积 单位：m³',
          type: 'value',
        },
        series: [
          {
            name: '调节池',
            data: getVolumeRatio.value || [],
            type: 'line',
            xAxisIndex: 0,
          },
          {
            name: '反应池',
            data: getReactionVolumeRatio.value || [],
            type: 'line',
            xAxisIndex: 0,
          },
        ],
      }

      try {
        chartInstance.value.setOption(volumeOption, true)
      }
      catch (error) {
        console.error('Error updating chart options:', error)
      }
    }

    const initChart = () => {
      const volumeEl = document.getElementById('volume2')
      if (!volumeEl) {
        return
      }

      try {
        if (!vm.$echarts) {
          return
        }

        if (chartInstance.value) {
          chartInstance.value.dispose()
        }

        chartInstance.value = vm.$echarts.init(volumeEl)
        // updateChartOption();
      }
      catch (error) {
        console.error('Error initializing chart:', error)
      }
    }

    // 监听窗口大小变化
    const handleResize = () => {
      if (chartInstance.value) {
        chartInstance.value.resize()
      }
    }

    onMounted(() => {
      vm.$nextTick(() => {
        initChart()
      })
      // window.addEventListener("resize", handleResize);
    })

    // 调节池
    const { refetch } = useQuery({
      queryKey: ['stationList', adjustParams],
      queryFn: () => getStationList(adjustParams),
      keepPreviousData: true,
      onSuccess: ({ data }) => {
        if (data.success) {
          const { list } = data.result
          tableData.value = list
          updateChartOption()
        }
      },
    })

    // 反应池
    const { refetch: reactionRefetch } = useQuery({
      queryKey: ['volumeCalibration', reactionParams],
      queryFn: () => getStationList(reactionParams),
      keepPreviousData: true,
      onSuccess: ({ data }) => {
        if (data.success) {
          const { list } = data.result
          reactionTableData.value = list
          updateChartOption()
        }
      },
    })

    const file = ref(null)

    const { mutate: importVolume } = useMutation({
      mutationFn: params => importStationData(params),
      onSuccess: ({ data }) => {
        if (data.code === 200) {
          vm.$message.success(data.message)
          queryClient.invalidateQueries({ queryKey: ['stationList'] })
          queryClient.invalidateQueries({ queryKey: ['volumeCalibration'] })
        }
      },
    })

    const downloadTemplate = async (URL, methods, text, params = {}) => {
      try {
        const axios = createAxiosFromStore()
        // 发起下载请求
        const response = await axios({
          url: URL, // 替换为实际的下载模板API
          method: methods,
          headers: {
            Authorization: getAuthToken(),
            clientChannel: 'WEB',
          },
          data: params,
          responseType: 'blob', // 重要：指定响应类型为blob
        })

        // 创建Blob对象
        const blob = new Blob([response.data], {
          type: response.headers['content-type'],
        })

        // 创建下载链接
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = `${text}.xlsx` // 设置下载文件名
        link.click()

        // 清理
        window.URL.revokeObjectURL(link.href)
      }
      catch (error) {
        vm.$message.error('下载模板失败，请重试')
        console.error('下载模板错误:', error)
      }
    }

    const handleButtonClick = (event, item) => {
      switch (item.value) {
        case 'importTemplate':
          downloadTemplate('fc/vc/getTemplate', 'post', '容积标定导入模板')
          break
        case 'volumeImport':
          file.value = event.file
          importVolume({ ...adjustParams, file: file.value })
          break
        case 'volumeExport':
          downloadTemplate('fc/vc/export', 'post', '调节池容积标定', adjustParams)
          break
        case 'reactionImport':
          file.value = event.file
          importVolume({ ...reactionParams, file: file.value })
          break
        case 'reactionExport':
          downloadTemplate('fc/vc/export', 'post', '反应池容积标定', reactionParams)
          break
        default:
          break
      }
    }

    const onBack = () => {
      vm.$router.back()
    }

    return {
      refetch,
      tableData,
      reactionRefetch,
      checked,
      handleButtonClick,
      downloadTemplate,
      chartInstance,
      initChart,
      updateChartOption,
      onBack,
    }
  },
  data() {
    return {}
  },
  // activated() {
  //   this.handleActivated();
  //   console.log(3333);
  // },
  // mounted() {
  //   this.$nextTick(() => {
  //     this.initChart();
  //   });
  // },
  // beforeDestroy() {
  //   window.removeEventListener("resize", this.handleResize);
  //   if (this.chartInstance) {
  //     this.chartInstance.dispose();
  //     this.chartInstance = null;
  //   }
  // },
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex justify-between items-center mb-2">
      <div>
        <el-checkbox v-model="checked">
          修正标定数据
        </el-checkbox>
      </div>
      <div class="flex items-center my-2">
        <EButton
          type="primary"
          @click="handleButtonClick($event, { value: 'startCalibration' })"
        >
          启动标定
        </EButton>
        <EButton
          type="default"
          plain
          btnIcon="el-icon-download"
          @click="handleButtonClick($event, { value: 'importTemplate' })"
        >
          下载容积标定导入模板
        </EButton>
        <EImportFile @excelImport="handleButtonClick($event, { value: 'volumeImport' })">
          <EButton type="primary" btnIcon="el-icon-download">
            导入调节池容积标定曲线
          </EButton>
        </EImportFile>
        <EButton
          type="primary"
          plain
          btnIcon="el-icon-upload2"
          style="margin-left: 10px"
          @click="handleButtonClick($event, { value: 'volumeExport' })"
        >
          导出调节池容积标定曲线
        </EButton>
        <EImportFile
          @excelImport="handleButtonClick($event, { value: 'reactionImport' })"
        >
          <EButton type="primary" btnIcon="el-icon-download">
            导入反应池容积标定曲线
          </EButton>
        </EImportFile>
        <EButton
          type="primary"
          plain
          btnIcon="el-icon-upload2"
          style="margin-left: 10px"
          @click="handleButtonClick($event, { value: 'reactionExport' })"
        >
          导出反应池容积标定曲线
        </EButton>
      </div>
      <!-- <div>
        <EButton type="default" @click="onBack" size="mini"> 返回 </EButton>
      </div> -->
    </div>

    <div class="flex flex-auto justify-center items-center mt-2 w-full">
      <div id="volume2" style="width: 78vw; height: 70vh; background: #fff" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
