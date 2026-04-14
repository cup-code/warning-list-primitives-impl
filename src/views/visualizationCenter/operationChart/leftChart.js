// 初始化图表
const assessmentList = [
  { name: `东北`, value: 10, Proportion: '10%' },
  { name: '华北 ', value: 26, Proportion: '26%' },
  { name: '华东', value: 24, Proportion: '24%' },
  { name: '华中', value: 12, Proportion: '12%' },
  { name: '华南', value: 14, Proportion: '14%' },
  { name: '西南', value: 10, Proportion: '10%' },
  { name: '西北', value: 4, Proportion: '4%' },
]

const censusSeries = [
  {
    name: '百度',
    data: [15, 23, 40, 20, 0, 0, 19],
  },
  {
    name: '海康',
    data: [20, 12, 0, 5, 0, 0, 30],
  },
]
censusSeries.forEach((item) => {
  item.barWidth = 16
  item.type = 'bar'
  item.itemStyle = {
    shadowBlur: 5.5,
    shadowColor: 'rgba(83, 101, 166, 1)',
    shadowOffsetY: 1,
    shadowOffsetX: 1,
  }
})
const options = {
  assessment: {
    color: ['#e1d45c', '#04c5be', '#b3a3da', '#a5c970', '#f4bc89', '#70afea', '#d566a0'],
    legend: {
      pageIconColor: '#e1d45c',
      pageTextStyle: {
        color: '#fff',
      },
      x: 'center',
      y: 'top',
      itemHeight: 10,
      itemWidth: 12,
      itemGap: 10,
      icon: 'roundRect',
      textAlign: 'center',
      textStyle: {
        color: '#fff',
        fontSize: '12',
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['80%', '50%'],
        left: '26%',
        top: '26%',
        width: '40%',
        label: {
          normal: {
            show: true,
            position: 'center',
            color: '#ffffff',
            formatter: `{total|${605}}` + `\n\r` + `{active|` + `分布数量` + `}`,
            rich: {
              total: { fontSize: 20, color: '#ffffff' },
              active: { fontSize: 12, color: '#ffffff' },
            },
          },
        },
        data: assessmentList,
      },
    ],
  },

  product: {
    color: ['#05c5be', '#ef9364'],
    grid: {
      left: '5%',
      right: '1%',
      bottom: '0%',
      top: '15%',
      width: '90%',
      containLabel: true,
    },
    legend: {
      width: '90%',
      right: '5%',
      orient: 'horizontal',
      padding: 10,
      itemWidth: 8,
      itemHeight: 8,
      textStyle: {
        color: '#fff',
        fontSize: '2px',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'category',
      data: ['2025', '2024'],
      axisLabel: {
        color: '#FEFFFF',
      },
      axisLine: {
        // 坐标轴 轴线
        show: true,
        lineStyle: {
          color: '#76859f',
        },
      },
      axisTick: {
        // 坐标轴 刻度线
        show: false,
      },
      splitLine: {
        // 坐标轴 grid区域中的分隔线
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#FEFFFF',
      },
      axisLine: {
        // 坐标轴 轴线
        show: true,
        lineStyle: {
          color: '#76859f',
        },
      },
      axisTick: {
        // 坐标轴 刻度线
        show: true,
      },
      splitLine: {
        // 坐标轴 grid区域中的分隔线
        show: false,
      },
    },
    series: censusSeries,
  },
}

export default options
