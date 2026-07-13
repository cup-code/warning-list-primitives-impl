const censusSeries = [
  {
    name: '人员入侵',
    data: [23, 12, 8, 6, 5],
  },
  {
    name: '未带安全帽',
    data: [2, 15, 1, 5, 4],
  },
  {
    name: '人员聚集',
    data: [2, 6, 9, 2, 9],
  },
  {
    name: '未穿工服',
    data: [8, 4, 6, 1, 17],
  },
]
censusSeries.forEach((item) => {
  item.barWidth = 8
  item.type = 'bar'
  item.itemStyle = {
    shadowBlur: 5.5,
    shadowColor: 'rgba(83, 101, 166, 1)',
    shadowOffsetY: 1,
    shadowOffsetX: 1,
  }
})
const options = {
  statics: {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} :{d}%',
    },
    color: ['#3dbadf', '#b3a3da', '#a5c970', '#54afd4', '#376e95'],
    legend: {
      orient: 'horizontal',
      x: 'center',
      y: 'top',
      itemGap: 10,
      itemWidth: 12,
      itemHeight: 10,
      textStyle: { color: '#fff', fontSize: '3px' },
      data: ['已完成', '待执行', '待接单', '待评价', '待验收'],
    },
    calculable: true,
    series: [
      {
        name: '面积模式',
        type: 'pie',
        radius: ['40%', '60%'],
        center: ['-10%', '58%'],
        roseType: 'radius',
        x: '50%', // for funnel
        max: 90, // for funnel
        sort: 'ascending', // for funnel
        label: {
          fontSize: '1px',
          formatter: '{per|{b}}',
          borderWidth: 20,
          borderRadius: 4,
          lineHeight: 25,
          padding: [-16, -20, 0], // 文字位置
          rich: {
            b: {
              color: '#fff',
              lineHeight: 33,
            },
            per: {
              fontSize: 10,
              padding: [2, 4],
              borderRadius: 2,
            },
          },
        },
        data: [
          { value: 40.28, name: '已完成' },
          { value: 17.04, name: '待执行' },
          { value: 10.41, name: '待接单' },
          { value: 7.04, name: '待评价' },
          { value: 24.23, name: '待验收' },
        ],
      },
    ],
  },

  failureType: {
    color: ['#2c8eef', '#05c5be', '#ef9364', '#d566a0'],
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
      data: ['2025', '2024', '2023'],
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
    calculable: true,
    series: censusSeries,
  },
}

export default options
