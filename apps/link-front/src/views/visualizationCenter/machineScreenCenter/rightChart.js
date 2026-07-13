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
    color: ['#3dbadf', '#b3a3da', '#a5c970', '#54afd4', '#376e95', '#f4bc89', '#eeeeee'],
    legend: {
      orient: 'vertical',
      x: 'left',
      y: 'center',
      left: '5%',
      top: '18%',
      itemGap: 10,
      itemWidth: 12,
      itemHeight: 10,
      textStyle: { color: '#fff', fontSize: '3px' },
      data: ['待审核', '加急', '有效', '无效', '误报', '不确定'],
    },
    calculable: true,
    series: [
      {
        name: '预警状态',
        type: 'pie',
        radius: ['40%', '68%'],
        center: ['10%', '48%'],
        roseType: 'area',
        showEmptyCircle: true,
        emptyCircleStyle: {
          color: '#eeeeee',
          opacity: 1,
        },
        x: '50%',
        z: 2,
        max: 90,
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
        // 当所有数据为0时显示空占位
        data: [
          { value: 0, name: '待审核', itemStyle: { color: '#eeeeee' } },
          { value: 0, name: '加急', itemStyle: { color: '#eeeeee' } },
          { value: 0, name: '有效', itemStyle: { color: '#eeeeee' } },
          { value: 0, name: '无效', itemStyle: { color: '#eeeeee' } },
          { value: 0, name: '误报', itemStyle: { color: '#eeeeee' } },
          { value: 0, name: '不确定', itemStyle: { color: '#eeeeee' } },
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
      top: '26%',
      width: '90%',
      containLabel: true,
    },
    legend: {
      width: '100%',
      top: '1%',
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
