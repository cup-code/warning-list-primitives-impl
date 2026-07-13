import { getData } from '@/http/anji-report/bigscreen'
import dayjs from '@/utils/dayjs.js'

export default {
  data() {
    return {
      // form select-input key
      selectInput: {
        keyname: '',
        keyword: '',
      },

      // 日期时间快捷选项
      datetimeRangePickerOptions: {
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              const end = new Date()
              const start = new Date(new Date(new Date().getTime()).setHours(0, 0, 0, 0))
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '昨天',
            onClick(picker) {
              const start = new Date(
                new Date(new Date().getTime() - 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0),
              )
              const end = new Date(
                new Date(new Date().getTime() - 24 * 60 * 60 * 1000).setHours(23, 59, 59, 999),
              )
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(dayjs().subtract(1, 'weeks').valueOf())
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(dayjs().subtract(1, 'months').valueOf())
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(dayjs().subtract(3, 'months').valueOf())
              picker.$emit('pick', [start, end])
            },
          },
        ],
        // disabledDate(time){
        //   return time.getTime() > Date.now()
        // }
      },
    }
  },
  computed: {},
  created() {},
  mounted() {},
  destroyed() {},
  methods: {
    // 搜索重置搜索页码
    search() {
      this.params.currentPage = 1
      this.queryByPage()
    },
    // 把selectInput中的值赋到params查询对象中
    parseParamsBySelectInput(keyname, keyword) {
      if (this.params === undefined || this.params === null) {
        console.warn('query form must bind to params object in vue data')
        return
      }
      // if (!this.params.hasOwnProperty(keyname)) {
      //   console.warn('params has no field:' + keyname)
      //   return
      // }
      if (keyword !== undefined) {
        this.params[keyname] = keyword.trim()
      }
    },
    resetForm(data) {
      const formKeys = Object.keys(data)
      for (const k of formKeys) {
        data[k] = null
      }
    },
    handlerInputchange(val) {
      this.parseParamsBySelectInput(this.selectInput.keyname, val)
    },
    // 查询echarts 数据
    queryEchartsData(params) {
      return new Promise((resolve) => {
        getData(params).then(({ code, data }) => {
          if (code !== 200)
            return
          const analysisData = this.analysisChartsData(params, data)
          resolve(analysisData)
        })
      })
    },
    // 解析不同图标的数据
    analysisChartsData(params, data) {
      const chartType = params.chartType
      if (
        chartType === 'widget-barchart'
        || chartType === 'widget-linechart'
        || chartType === 'widget-barlinechart'
      ) {
        return this.barOrLineChartFn(params.chartProperties, data)
      }

      if (chartType === 'widget-piechart' || chartType === 'widget-funnel') {
        return this.piechartFn(params.chartProperties, data)
      }

      if (chartType === 'widget-text') {
        return this.widgettext(params.chartProperties, data)
      }

      if (chartType === 'widget-stackchart') {
        return this.stackChartFn(params.chartProperties, data)
      }

      return data
    },
    // 柱状图、折线图、柱线图
    barOrLineChartFn(chartProperties, data) {
      const ananysicData = {}
      const xAxisList = []
      const series = []

      for (const key in chartProperties) {
        const obj = {}
        const seriesData = []
        const value = chartProperties[key]
        obj.type = value

        for (let i = 0; i < data.length; i++) {
          if (value.startsWith('xAxis')) {
            xAxisList[i] = data[i][key]
          }
          else {
            seriesData[i] = data[i][key]
          }
        }

        obj.data = seriesData
        if (!obj.type.startsWith('xAxis')) {
          series.push(obj)
        }
      }

      ananysicData.xAxis = xAxisList
      ananysicData.series = series
      return ananysicData
    },
    // 堆叠图
    stackChartFn(chartProperties, data) {
      const ananysicData = {}
      const series = []
      // 全部字段字典值
      const types = Object.values(chartProperties)
      // x轴字段、y轴字段名
      const xAxisField = Object.keys(chartProperties)[types.indexOf('xAxis')]
      const yAxisField = Object.keys(chartProperties)[types.indexOf('yAxis')]

      // x轴数值去重，y轴去重
      const xAxisList = this.setUnique(data.map(item => item[xAxisField]))
      const yAxisList = this.setUnique(data.map(item => item[yAxisField]))
      const dataGroup = this.setGroupBy(data, yAxisField)

      for (const key in chartProperties) {
        if (chartProperties[key] !== 'yAxis' && !chartProperties[key].startsWith('xAxis')) {
          Object.keys(dataGroup).forEach((item) => {
            const values = Array.from({ length: yAxisList.length }).fill(0)
            dataGroup[item].forEach((res) => {
              values[xAxisList.indexOf(res[xAxisField])] = res[key]
            })
            series.push({
              name: yAxisList[item],
              type: chartProperties[key],
              data: values,
            })
          })
        }
      }

      ananysicData.xAxis = xAxisList
      ananysicData.series = series
      return ananysicData
    },
    // 饼图、漏斗图
    piechartFn(chartProperties, data) {
      const ananysicData = []
      for (let i = 0; i < data.length; i++) {
        const obj = {}
        for (const key in chartProperties) {
          const value = chartProperties[key]
          if (value === 'name') {
            obj.name = data[i][key]
          }
          else {
            obj.value = data[i][key]
          }
        }
        ananysicData.push(obj)
      }
      return ananysicData
    },
    widgettext(chartProperties, data) {
      const ananysicData = []
      for (let i = 0; i < data.length; i++) {
        const obj = {}
        for (const key in chartProperties) {
          const value = chartProperties[key]
          if (value === 'name') {
          }
          else {
            obj.value = data[i][key]
          }
        }
        ananysicData.push(obj)
      }
      return ananysicData
    },
    setUnique(arr) {
      const newArr = []
      arr.forEach((item) => {
        return newArr.includes(item) ? '' : newArr.push(item)
      })
      return newArr
    },
    setGroupBy(array, name) {
      const groups = {}
      array.forEach((o) => {
        const group = JSON.stringify(o[name])
        groups[group] = groups[group] || []
        groups[group].push(o)
      })
      return Object.keys(groups).map((group) => {
        return groups[group]
      })
    },
  },
  watch: {
    selectInput: {
      handler(newVal, oldVal) {
        this.resetForm(this.params)
        this.params.currentPage = 1
        this.params.pageSize = 10
        this.parseParamsBySelectInput(newVal.keyname, newVal.keyword)
      },
      deep: true,
    },
  },
}
