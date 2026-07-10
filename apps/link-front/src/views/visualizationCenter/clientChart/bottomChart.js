const radius = ['40%', '60%']

const labelFromatter = {
  normal: {
    label: {
      show: true,
      formatter(params) {
        return `${params.value}%`
      },
      position: 'inner',
      distance: '1',
      textStyle: {
        baseline: 'top',
      },
    },
  },
}

const labelTop = {
  normal: {
    label: {
      show: true,
      position: 'center',
      formatter: '{b}',
      textStyle: {
        baseline: 'center',
      },
    },
    radius: ['40%', '60%'],
    labelLine: {
      show: true,
    },
  },
}

const labelBottom = {
  normal: {
    color: '#ccc',
    label: {
      show: false,
      position: 'center',
    },
    labelLine: {
      show: true,
    },
  },
}
const options = {
  orderRate: {
    color: ['#ad99d7'],
    animation: false,
    legend: {
      x: 'center',
      bottom: '14px',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: '#fff', fontSize: '12' },
      data: ['接单及时率'],
    },
    series: [
      {
        type: 'pie',
        center: ['50%', '50%'],
        radius,
        avoidLabelOverlap: true,
        itemStyle: labelFromatter,
        hoverAnimation: false, // 禁止鼠标悬浮时的放大动画
        data: [
          { name: 'other', value: 46, itemStyle: labelBottom },
          { name: '接单及时率', value: 54, itemStyle: labelTop },
        ],
      },
    ],
  },
  accountRate: {
    color: ['#4fa9e9'],
    legend: {
      x: 'center',
      bottom: '14px',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: '#fff', fontSize: '12' },
      data: ['结单及时率'],
    },
    series: [
      {
        type: 'pie',
        center: ['50%', '50%'],
        radius,
        avoidLabelOverlap: false,
        itemStyle: labelFromatter,
        hoverAnimation: false, // 禁止鼠标悬浮时的放大动画
        data: [
          { name: 'other', value: 10, itemStyle: labelBottom },
          { name: '结单及时率', value: 90, itemStyle: labelTop },
        ],
      },
    ],
  },
  satisfaction: {
    color: ['#29c0c1'],
    legend: {
      x: 'center',
      bottom: '14px',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: '#fff', fontSize: '12' },
      data: ['客户满意度'],
    },
    series: [
      {
        type: 'pie',
        center: ['50%', '50%'],
        radius,
        avoidLabelOverlap: false,
        itemStyle: labelFromatter,
        hoverAnimation: false, // 禁止鼠标悬浮时的放大动画
        data: [
          { name: 'other', value: 39, itemStyle: labelBottom },
          { name: '客户满意度', value: 61, itemStyle: labelTop },
        ],
      },
    ],
  },
  statics: {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} :{d}%',
    },
    color: ['#3dbadf', '#b3a3da', '#a5c970', '#54afd4', '#376e95'],
    legend: {
      orient: 'horizontal',
      x: 'center',
      y: '16px',
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
        radius: ['48%', '68%'],
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
}

export default options
