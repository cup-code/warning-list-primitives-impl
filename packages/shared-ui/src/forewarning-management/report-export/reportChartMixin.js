export function createReportChartMixin({ showAlarmTypeAxisLabels = false } = {}) {
  return {
    name: 'ReportChart',
    data() {
      return {
        chart: null,
        showAlarmTypeAxisLabels,
      }
    },
    methods: {
      initAlarmTrend(data = {}) {
        try {
          const sortedKeys = Object.keys(data)?.sort() || []

          const chartDom = document.getElementById('trend')
          const chart = this.$echarts.init(chartDom)

          const option = {
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow',
              },
              textStyle: {
                fontSize: 12,
              },
            },
            grid: {
              top: '15%',
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true,
            },
            xAxis: {
              type: 'category',
              data: sortedKeys,
              axisLabel: {
                color: '#000',
                fontSize: 12,
                interval: 'auto',
                rotate: 30,
              },
            },
            yAxis: {
              type: 'value',
              minInterval: 1,

              axisLabel: {
                color: '#000',
                fontSize: 12,
                formatter(value) {
                  if (value >= 1000) {
                    return `${Math.floor(value / 1000)}k`
                  }
                  return Math.floor(value)
                },
              },
            },
            series: [
              {
                data: sortedKeys.map(key => data[key] || 0) || [],
                type: 'line',
                label: {
                  show: true,
                  position: 'top',
                },
              },
            ],
          }
          chart.setOption(option)
        }
        catch (error) {
          console.error('初始化趋势图表失败:', error)
        }
      },
      initAlarmTypeRank(data = []) {
        const chartDom = document.getElementById('TypeChart')
        const chart = this.$echarts.init(chartDom)

        chart.setOption({
          color: ['#5470C6', '#91CC75'],
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
          },
          legend: {
            data: ['数量'],
            right: '1%',
          },
          grid: {
            top: '15%',
            left: '2%',
            right: '4%',
            bottom: '1%',
            containLabel: true,
          },
          yAxis: {
            type: 'value',
            minInterval: 1,
          },
          xAxis: {
            type: 'category',
            data: data?.map(item => item.alarmType || '') || [],
            axisTick: {
              alignWithLabel: true,
            },
            ...(this.showAlarmTypeAxisLabels
              ? {
                  axisLabel: {
                    interval: 0,
                    showMinLabel: true,
                    showMaxLabel: true,
                    formatter(value) {
                      return value
                    },
                  },
                }
              : {}),
          },
          series: [
            {
              name: '数量',
              type: 'bar',
              data: data?.map(item => item.alarmNumber || 0) || [],
              barWidth: 20,
              label: {
                show: true,
                position: 'top',
              },
            },
          ],
        })
      },

      initCameraAlarmRank(data = {}) {
        const chartDom = document.getElementById('cameraAlarmRankChart')
        const chart = this.$echarts.init(chartDom)
        chart.setOption({
          color: ['#5470C6', '#91CC75'],
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
          },
          legend: {
            data: ['数量'],
            right: '1%',
          },
          grid: {
            top: '15%',
            left: '2%',
            right: '4%',
            bottom: '1%',
            containLabel: true,
          },
          xAxis: {
            type: 'value',
            minInterval: 1,
          },
          yAxis: {
            type: 'category',
            data: Object.keys(data)?.reverse() || [],
          },
          series: [
            {
              name: '数量',
              type: 'bar',
              data: Object.values(data)?.reverse() || [],
              barWidth: 20,
              label: {
                show: true,
                position: 'right',
              },
            },
          ],
        })
      },

      initAlarmLevelRank(data = {}, total = 0) {
        const level = [
          { name: '一级预警', value: 1 },
          { name: '二级预警', value: 2 },
          { name: '三级预警', value: 3 },
          { name: '四级预警', value: 4 },
        ]
        const color = ['#FF4500', '#fc8452', '#fac858', '#0069b9']

        const alarmLevelData = level.map((item, index) => {
          return {
            name: item.name,
            value: data[item?.value] || 0,
            itemStyle: { color: color[item?.value - 1] },
            percent: total ? `${((data[item?.value] || 0) / total * 100).toFixed(2)}%` : '0.00%',
          }
        })
        // 预警等级饼图
        const chartDom = document.getElementById('TypeRankChart')
        const chart = this.$echarts.init(chartDom)

        chart.setOption({
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)',
          },
          legend: {
            orient: 'vertical',
            left: '1%',
            top: '1%',
            textStyle: {
              fontSize: 13,
              align: 'right',
            },
            itemGap: 18,
            padding: [5, 10],
            borderRadius: 4,
            itemWidth: 15,
            itemHeight: 15,
            icon: 'circle',
          },
          series: [{
            name: '预警等级',
            type: 'pie',
            radius: '50%',
            center: ['50%', '50%'],
            height: '100%',
            width: 700,
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 1,
            },
            label: {
              alignTo: 'edge',
              formatter(data) {
                return `${data.name}: ${data.value}(${data.percent}%)`
              },
              minMargin: 18,
              edgeDistance: 10,
              lineHeight: 20,
              rich: {
                time: {
                  fontSize: 10,
                  color: '#999',
                },
              },
              show: true,
              position: 'top',
              bleedMargin: 10,
              distanceToLabelLine: 10,
            },
            labelLine: {
              length: 20,
              length2: 10,
              maxSurfaceAngle: 100,
            },
            labelLayout(params) {
              const isLeft = params.labelRect.x < chart.getWidth()
              const points = params.labelLinePoints
              // Update the end point.
              points[2][0] = !isLeft
                ? params.labelRect.x
                : params.labelRect.x + params.labelRect.width + 10
              return {
                labelLinePoints: points,
              }
            },
            data: alarmLevelData,
          }],
        })
      },
    },
  }
}

export default createReportChartMixin()
