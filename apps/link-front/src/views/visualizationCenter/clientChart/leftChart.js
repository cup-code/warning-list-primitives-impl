const censusSeries = [
  {
    name: '一般故障',
    data: [23, 12, 8, 6, 5],
  },
  {
    name: '电气故障',
    data: [2, 15, 1, 5, 4],
  },
  {
    name: '机械故障',
    data: [2, 6, 9, 2, 9],
  },
  {
    name: '其他故障',
    data: [8, 4, 6, 1, 17],
  },
]
censusSeries.forEach((item) => {
  item.barWidth = 12
  item.type = 'bar'
  item.itemStyle = {
    barBorderRadius: [2, 2, 0, 0],
    shadowBlur: 5.5,
    shadowColor: 'rgba(83, 101, 166, 1)',
    shadowOffsetY: 1,
    shadowOffsetX: 1,
  }
})

export const options = {
  analyse: {
    color: ['#2c8eef', '#05c5be', '#da99d7'],
    calculable: true,
    grid: {
      left: '5%',
      right: '1%',
      bottom: '4%',
      top: '20%',
      width: '90%',
      containLabel: true,
    },
    legend: {
      y: 'top',
      x: 'right',
      orient: 'horizontal',
      padding: 10,
      itemWidth: 12,
      itemHeight: 10,
      textStyle: {
        color: '#fff',
        fontSize: '3px',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: [
      {
        axisLabel: {
          color: '#fff',
        },
        type: 'category',
        data: ['2023-12', '2024-02', '2024-04'],
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
    ],
    yAxis: [
      {
        type: 'value',
        name: '数量',
        nameTextStyle: { color: '#fff' },
        nameLocation: 'start',
        splitNumber: 4,
        axisLabel: {
          color: '#fff',
          formatter: '{value}',
        },
      },
      {
        type: 'value',
        name: '完成率',
        nameLocation: 'start',
        nameTextStyle: { color: '#fff' },
        splitNumber: 4,
        axisLabel: {
          color: '#fff',
          formatter: '{value}%',
        },
      },
    ],
    series: [
      {
        name: '完成率',
        type: 'line',
        yAxisIndex: 1,
        data: [32, 90, 120],
      },
      {
        name: '维修保养',
        type: 'bar',
        itemStyle: {
          barWidth: 16,
          barBorderRadius: [4, 4, 0, 0],
        },
        data: [8, 16, 32],
      },
      {
        name: '故障报修',
        type: 'bar',
        itemStyle: {
          barWidth: 16,
          barBorderRadius: [4, 4, 0, 0],
        },
        data: [16, 8, 30],
      },
    ],
  },
  distribution: {
    color: ['#4fa9e9'],
    tooltip: {
      trigger: 'axis',
    },
    // legend: {
    //   y: 'top',
    //   x: 'right',
    //   orient: 'horizontal',
    //   padding: 10,
    //   itemWidth: 8,
    //   itemHeight: 8,
    //   textStyle: {
    //     color: '#fff',
    //     fontSize: '2px'
    //   }
    // },
    grid: {
      left: '5%',
      right: '5%',
      top: '8%',
      bottom: '0%',
      containLabel: true,
    },
    calculable: true,
    xAxis: [
      {
        type: 'value',
        boundaryGap: true,
        axisLabel: {
          color: '#fff',
        },
      },
    ],
    yAxis: [
      {
        type: 'category',
        splitNumber: 9,
        data: ['钻探1', '钻探2', '钻探3', '钻探4', '钻探5', '钻探6', '钻探7', '钻探8'],
        axisLabel: {
          color: '#fff',
        },
      },
    ],
    series: [
      {
        type: 'bar',
        itemStyle: {
          barBorderRadius: [0, 4, 4, 0],
        },
        data: [7, 5, 4, 4, 3, 7, 1, 9],
      },
    ],
  },

  statistics: {
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
      data: ['2013', '2021', '2020', '2023', '2024'],
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
