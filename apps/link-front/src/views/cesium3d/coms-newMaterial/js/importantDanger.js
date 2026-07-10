// 重要危险源
const importantDanger = {
  // 和风险区域一致
  level: [
    {
      label: '低风险',
      value: Number.NaN,
      // 无值透明
      color: '#2DAFF9',
    },
    {
      label: '低风险',
      value: 0,
      color: '#2DAFF9',
    },
    {
      label: '一般风险',
      value: 1,
      color: '#dbdb04', // #FFFF02
    },
    {
      label: '较大风险',
      value: 2,
      color: '#FFBF01',
    },
    {
      label: '重大风险',
      value: 3,
      color: '#FE0001',
    },
  ],
}

export default importantDanger
