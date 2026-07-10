<script>
import n01 from '@/assets/anhuan3d/01.png'
import n02 from '@/assets/anhuan3d/02.png'
import n03 from '@/assets/anhuan3d/03.png'
import n04 from '@/assets/anhuan3d/04.png'
import n06 from '@/assets/anhuan3d/06.png'
import cl_bg from '@/assets/anhuan3d/cl_bg.png'
import left_hide from '@/assets/anhuan3d/left_hide.png'
import right_hide from '@/assets/anhuan3d/right_hide.png'
import JessibucaPlayer from '@/components/JessibucaPlayer/index'
import { videoPlayById } from '@/http/hkAi-api' // 播放视频
import {
  chemistryDetails, // 详情查询危化品 ( 化学品详细 )
  dangerOriginDetail, // 危险源详情
  getAlertByLevel, // 请求危险源数
  getBindCameraInfo, // 危险源下绑定的摄像头
  getByEndityId, // 获取文件集 ( 应急预案)
  getIORealTimeData,
  getIoTrendHis, // 获取测点历史数据
  hazardBindPointTotal, // 所有测点数
  queryAlertRecord, // 测点报警记录
  queryPointGroupIoByPage, // 危险源下绑定的测点
  statisticsTotal, // 6天报警统计大屏
} from '@/http/map/gis-map.js'
import { formatDate } from '@/utils'
import { showFileWindow } from '@/utils/checkFile.js'
import ChemistryInfoDialog from './components/ChemistryInfoDialog.vue'
import { dangerOrigin } from './js/index.js'

export default {
  name: 'DangerOrigin', // 重大危险源
  components: { JessibucaPlayer, ChemistryInfoDialog },
  props: {
    hardDangerOriginData: { type: Array, default: [] },
    companyId: { type: String, default: '' },
  },
  data() {
    return {
      // 图片 begin
      n01,
      n02,
      n03,
      n04,
      n06,
      cl_bg,
      left_hide,
      right_hide,
      // 图片 end
      // dangeSourceData: [], // 列表数据
      dangerSourceDetail: {}, // 危险源详情
      dangerOriginLevel: dangerOrigin.level,
      sKey: '',
      chart_alarm: null, // 报警统计
      isPoint: false, // 是否是测点详情
      realData: [], // 实时监测列表
      chart_his: null, // 历史趋势
      recordData: [], // 报警记录列表
      // companyId: '',
      dangerNums: 0, // 危险源数
      pointNums: 0, // 监测点数

      titleName: '化学品信息',
      chemistryData: [], // 化学品信息列表
      // 化学品信息弹窗：
      showInfoDialog: false,

      // 应急预案文档类型
      docType: [
        {
          name: '应急预案文件',
          fileType: 'contingency-plan',
        },
        {
          name: '管理方案文件',
          fileType: 'management-plan',
        },
        {
          name: '管理制度文件',
          fileType: 'management-system',
        },
        {
          name: '其他文件',
          fileType: 'other',
        },
      ],
      // Emergency plan
      emergencyPlanData: [], // 应急预案
      conData: [], // 组态图
      bindCameraList: [], // 绑定的摄像头

      // total: 0,
      searchData: {
        isPage: false, // false 所有数据不分页 ，true 分页
        pageNum: 1,
        pageSize: 200,
        unitName: '',
        queryKey: '',
        companyId: '',
      },

      // 视频播放
      videoUrl: '',
      dialog_vid: false,

      // 当前测点
      curPoint: {},
    }
  },
  computed: {
    // 设置危险源级别级别
    setDangerOriginLevel() {
      return function (level) {
        const levelInt = Number.parseInt(level)
        let param = {}
        for (const item of this.dangerOriginLevel) {
          if (item.value == levelInt) {
            param = item
            break
          }
        }
        // 没有对应的值
        if (Object.keys(param).length === 0) {
          param = this.dangerOriginLevel[0]
        }
        return param
      }
    },
    // 应急预案文件类型
    setDocType() {
      return function (fileType) {
        let param = {}
        for (const item of this.docType) {
          if (item.fileType === fileType) {
            return (param = item)
          }
        }
      }
    },

    leftHide() {
      return this.$store.state.newMaterial.leftHide
    },
    rightHide() {
      return this.$store.state.newMaterial.rightHide
    },
    /* curPoint() {
            return this.$store.state.newMaterial.curPoint;
        }, */
    dangerOriginList() {
      if (this.searchData.unitName === '') {
        return this.hardDangerOriginData
      }
      else {
        return this.hardDangerOriginData.filter(
          item => item.unitName.includes(this.searchData.unitName),
        )
      }
    },
  },
  watch: {
    isPoint: {
      handler(v) {
        if (!v)
          return
        this.$nextTick(() => {
          this.initHisChart()
        })
      },
      immediate: true,
    },
    hardDangerOriginData: {
      // 初始化执行
      immediate: true,
      handler(newValue) {
        if (newValue.length > 0) {
          // 危险源详情
          this.getDangerOriginDetail(newValue[0].id)
          // 危险源下绑定的 测点
          this.GetQueryPointGrouploByPage(newValue[0].id)
          // 危险源id,下绑定的摄像头
          this.getBindCameraInfoQueryById(newValue[0].id)
        }
      },
    },
  },
  mounted() {
    this.searchData.companyId = this.companyId

    this.initAlarmChart()
    // this.getDangerNum();
    // 获取所有测点
    this.getPointNum()
    // 获取6天报警统计大屏
    this.getStatisticsTotal()

    // this.getAlarmNum();
  },
  // 进入组件
  activated() {
    // 危险源数据
    // if(this.hardDangerOriginData.length > 0){
    //     this.getDangerOriginDetail(this.hardDangerOriginData[0].id);
    // }
  },
  methods: {
    showFileWindow,
    formatDate,
    // 初始化图表
    initChart(name, options) {
      this[name] = this.$echarts.init(document.getElementById(name))
      this[name].setOption(options)
    },
    initAlarmChart() {
      this.initChart('chart_alarm', {
        color: ['#fb2f39', '#fd6539', '#fda53a', '#188be8'], // 图例 和 柱状图 的 颜色
        // legend: {
        //     x: 'right',
        //     itemWidth: 15, // 图例颜色块的 宽度
        //     itemHeight: 9,
        //     itemGap: 5, // 图例 之间的 间隔
        //     inactiveColor: '#666', // 图例未选中时 的 颜色值 (对 图例的 颜色块和文字 都有 作用)
        //     textStyle: {
        //         fontSize: 8,
        //         color: '#fff'  // 图例选中时的 文字颜色
        //     },
        //     data:['一级','二级', '三级', '四级']
        // },
        grid: {
          height: '90%',
          left: '0%',
          right: '0%',
          bottom: '3%',
          containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            crossStyle: {
              color: '#999',
            },
          },
        },
        xAxis: {
          type: 'category',
          axisLine: {
            lineStyle: {
              color: '#474d55', // 控制 x轴的 颜色
            },
          },
          axisTick: {
            show: false, // 控制 x轴 是否显示刻度
          },
          axisLabel: {
            color: '#fff', // 字体颜色
            margin: 4, // x轴 与 刻度值 的 间距
            fontSize: 8, // 刻度字体大小
          },
          // data: ['06/01', '06/02', '06/03', '06/04', '06/05', '06/06']
          data: [],
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#474d55', // 控制 y轴的 颜色
            },
          },
          axisTick: {
            show: false, // 控制 y轴 是否显示刻度
          },
          axisLabel: {
            color: '#fff', // 字体颜色
            margin: 4, // y轴 与 刻度值 的 间距
            fontSize: 8, // 刻度字体大小
          },
          splitLine: {
            show: true, // 分割线显示与否
            lineStyle: {
              color: '#474d55',
            },
          },
        },
        series: [
          {
            type: 'bar',
            barMaxWidth: 10,
            data: [],
          },
        ],
        // series: [
        //     {
        //         name:'一级',
        //         type:'bar',
        //         barMaxWidth: 10,
        //         // data:[19, 12, 6, 34, 21, 17]
        //         data: []
        //     },
        //     {
        //         name:'二级',
        //         type:'bar',
        //         barMaxWidth: 10,
        //         // data:[22, 12, 11, 24, 20, 30]
        //         data: []
        //     },
        //     {
        //         name:'三级',
        //         type:'bar',
        //         barMaxWidth: 10,
        //         // data:[20, 22, 11, 34, 40, 30]
        //         data: []
        //     },
        //     {
        //         name:'四级',
        //         type:'bar',
        //         barMaxWidth: 10,
        //         // data:[3, 7, 10, 41, 30, 20]
        //         data: []
        //     },
        // ]
      })
    },
    initHisChart() {
      this.initChart('chart_his', {
        color: ['#1fe3ff'],
        grid: {
          height: '90%',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: '#474d55', // 控制 x轴的 颜色
            },
          },
          axisTick: {
            show: false, // 控制 x轴 是否显示刻度
          },
          axisLabel: {
            color: '#fff', // 字体颜色
            margin: 4, // x轴 与 刻度值 的 间距
            fontSize: 8, // 刻度字体大小
          },
          // data: ['06-06', '07-07', '08-08', '09-09', '10-10']
          data: [],
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#474d55', // 控制 y轴的 颜色
            },
          },
          axisTick: {
            show: false, // 控制 y轴 是否显示刻度
          },
          axisLabel: {
            margin: 4, // y轴 与 刻度值 的 间距
            fontSize: 8, // 刻度字体大小
            color: '#fff', // 字体颜色
          },
          splitLine: {
            show: false, // 分割线显示与否
            lineStyle: {
              color: '#171d25',
            },
          },
        },
        series: [
          {
            type: 'line',
            smooth: true,
            areaStyle: {},
            // data: [2, 12, 32, 62, 102],
            data: [],
          },
        ],
      })
    },

    // 6天报警统计大屏 statisticsTotal
    getStatisticsTotal() {
      const params = {
        // 1 重大危险源  2 重要危险源
        hazardType: 1,
        companyId: this.companyId,
      }
      statisticsTotal(params)
        .then(({ data }) => {
          if (data.success) {
            this.setAlarmChart(data.result || [])
          }
          else {
            this.$message.warning(data.message || '获取报警统计失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取报警统计出错', err)
        })
        .finally(() => {})
    },

    // 危险源详情 / 重大危险源详情
    getDangerOriginDetail(id) {
      if (id) {
        dangerOriginDetail(id)
          .then(({ data }) => {
            if (data.success) {
              this.dangerSourceDetail = data.result
              const chemistryTestData = [
                {
                  id: '59c5f8f50bad070962bcfa5ceed056d9',
                  chemistryName: '名称2',
                  chemistryQuantity: 888,
                  toxicityName: '毒性气体2',
                  checkCoefficient: 8,
                  qvalueType: '设计量',
                  qvalue: 40,
                },
                {
                  id: 'fd70d770da24ef1e6b7de25c96349199',
                  chemistryName: 'test名称',
                  chemistryQuantity: 100,
                  toxicityName: '危化毒性气体1',
                  checkCoefficient: 10,
                  qvalueType: '实际量',
                  qvalue: 50,
                },
                {
                  id: 'fd70d770da24ef1e6b7de25c96349199',
                  chemistryName: 'test名称03',
                  chemistryQuantity: 100,
                  toxicityName: '危化毒性气体1',
                  checkCoefficient: 10,
                  qvalueType: '实际量',
                  qvalue: 50,
                },
                {
                  id: 'fd70d770da24ef1e6b7de25c96349199',
                  chemistryName: 'test名称04',
                  chemistryQuantity: 100,
                  toxicityName: '危化毒性气体1',
                  checkCoefficient: 10,
                  qvalueType: '实际量',
                  qvalue: 50,
                },
              ]
              this.chemistryData = this.dangerSourceDetail.riskInfoVOS
              this.emergencyPlanData = []
              if (this.dangerSourceDetail.relevantFilesVOS.length > 0) {
                this.dangerSourceDetail.relevantFilesVOS.forEach((item) => {
                  this.isExistContingencyPlanDoc(item)
                })
              }
            }
            else {
              this.$message.warning(data.message || '获取危险源详情失败')
            }
          })
          .catch((err) => {
            this.$message.error('获取危险源详情出错', err)
          })
          .finally(() => {})
      }
    },

    // id查询 应急预案
    isExistContingencyPlanDoc(row) {
      getByEndityId(row.id)
        .then(({ data }) => {
          if (data.success) {
            if (data.result.length > 0 && data.result[0].urlPath) {
              // 文档存在
              this.emergencyPlanData.push(row)
            }
          }
          else {
            this.$message.warning(data.message || '获取应急预案失败')
          }
        })
        .catch((error) => {
          this.$message.error('获取应急预案出错', error)
        })
        .finally(() => {})
    },

    // id查询 应急预案
    contingencyPlanDoc(row) {
      /* {compilePerson: "",fileType: "management-system",id: "23067e8aff87340a7f905ff88e3d84a4",majorId: "06fa7a025f9a972f37af64ffc31e0aa8" } */
      getByEndityId(row.id)
        .then(({ data }) => {
          if (data.success) {
            if (data.result.length > 0 && data.result[0].urlPath) {
              // 显示文档
              this.showFileWindow(data.result[0].urlPath)
            }
          }
          else {
            this.$message.warning(data.message || '获取应急预案失败')
          }
        })
        .catch((error) => {
          this.$message.error('获取应急预案出错', error)
        })
        .finally(() => {})
    },

    // 右侧菜单

    // for 循环 axios promise  收集绑定的所有危化品信息
    getAllChemistryInformation(infoList) {
      const array = []
      this.chemistryData = []
      for (let i = 0; i < infoList.length; i++) {
        array.push(this.waitChemistryData(infoList[i].id))
      }

      // 解析 promies
      Promise.all(array)
        .then((res) => {
          console.log('危化品详情列表:', res)
          this.chemistryData = res
        })
        .catch((err) => {
          console.log('error', err)
        })
    },
    // 当化学品信息详情chemistry
    getChemistryInformation(id) {
      console.log('化学品 id:', id)
      return new Promise((resolve, reject) => {
        chemistryDetails(id)
          .then(({ data }) => {
            if (data.success) {
              resolve(data.result || [])
            }
            else {
              this.$message.warning(data.message || '获取化学品详情失败')
            }
          })
          .catch((err) => {
            this.$message.error('获取化学品详情出错', err)
          })
      })
    },
    //  异步请求
    async waitChemistryData(id) {
      return await this.getChemistryInformation(id)
    },

    chemistryDialog() {
      this.showInfoDialog = true
    },

    // 查询危险源id 下绑定的测点
    GetQueryPointGrouploByPage(id) {
      const searchData = {
        pageNum: 1,
        pageSize: 100,
        companyId: this.searchData.companyId,
        groupId: id,
        majorType: 1, // 1重大危险源 ，2重要危险源
      }
      queryPointGroupIoByPage(searchData)
        .then(({ data }) => {
          if (data.success) {
            this.realData = data.result.list || []
          }
          else {
            this.$message.warning(data.message || '获取数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取数据失败', err)
        })
        .finally(() => {})
    },
    // 查询危险源id 绑定的摄像头
    getBindCameraInfoQueryById(id) {
      const searchData = {
        companyId: this.searchData.companyId,
        hazardId: id,
        hazardType: 1, // 1 重大危险源 ，2 重要危险源
      }
      getBindCameraInfo(searchData)
        .then(({ data }) => {
          if (data.success) {
            this.bindCameraList = data.result || []
          }
          else {
            if (data.message === '无相关数据') {
              this.bindCameraList = []
            }
            else {
              this.$message.warning(data.message || '获取数据失败')
            }
          }
        })
        .catch((err) => {
          this.$message.error('获取数据失败', err)
        })
        .finally(() => {})
    },

    // 通过设备id 和 通道id
    videoByChannelIdDevicId(video) {
      this.dialog_vid = true
      if (!video.deviceId) {
        this.$message.error('缺少设备编号!')
        return
      }

      this.dialog_vid = true
      videoPlayById(video.channelId, video.deviceId)
        .then(({ data }) => {
          if (data.code === 200 && data.result) {
            // 读取的是flv格式的，用JessibucaPlayer播放器
            if (window.g.IS_HTTPS) {
              this.videoUrl = data.result.https_flv
            }
            else {
              this.videoUrl = data.result.flv
            }
          }
          else {
            this.$message.error(data.message || '请求失败!')
          }
        })
        .catch((err) => {
          this.$message.error(err || '请求失败!')
        })
    },

    // 获取实时测点信息
    getRealData(id) {
      getIORealTimeData(id).then(({ data }) => {
        if (data.code === 200) {
          this.realData = (data.result || []).map((item) => {
            item.eventDate = item.valueList[0].eventDate
            item.value = item.valueList[0].value
            return item
          })
        }
      })
      // this.realData = [
      //     {
      //         "code": "娃哈哈",
      //         "deviceCode": "设备编码",
      //         "ioType": "温度值",
      //         "ioUnit": "%",
      //         "name": "测点1",
      //         "eventDate": "",
      // 		"value": "17.2"
      //     }
      // ]
    },
    // 重大危险源列表的行点击
    listRowFn(row) {
      this.$store.dispatch('newMaterial/rightHide', false)
      // 危险源详情
      this.getDangerOriginDetail(row.id)
      // 危险源下绑定的 测点
      this.GetQueryPointGrouploByPage(row.id)
      // 危险源id,下绑定的摄像头
      this.getBindCameraInfoQueryById(row.id)
      // this.getRealData(row.id);

      // 定位到 地图危险源
      // this.$store.dispatch('newMaterial/locateTo3dIcon',{id: row.id, type:''});
      this.$emit('locationToMap', { id: row.id, type: '' })
    },
    // 实时测点列表的行点击
    realRowFn(row) {
      this.isPoint = true
      // this.$store.dispatch('newMaterial/curPoint', row);
      this.curPoint = row

      this.getHisData(row)
      this.getAlarmRecords(row.ioCode)
    },

    // 关闭测点详情
    closePoint() {
      this.isPoint = false
    },
    // 请求危险源数
    /* getDangerNum() {
            getArchivesTotalCount(this.companyId).then(({data}) => {
                if(data.code === 200) {
                    this.dangerNums = data.result;
                }
            })
        }, */

    // 请求监测点数
    getPointNum() {
      const searchData = {
        companyId: this.companyId,
        hazardId: '', // 重大危险源id
        hazardType: 1, // 1重大 ，2 重要
      }
      hazardBindPointTotal(searchData)
        .then(({ data }) => {
          if (data.success) {
            this.pointNums = data.result || 0
          }
          else {
            this.$message.warning(data.message || '获取列表数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表数据出错', err)
        })
        .finally(() => {})
    },
    // 请求报警统计
    getAlarmNum() {
      getAlertByLevel({ companyId: this.companyId }).then(({ data }) => {
        if (data.code === 200) {
          this.setAlarmChart(data.result || [])
        }
      })
    },
    // 请求测点的 7天历史数据
    getHisData(row) {
      const staratTime = new Date() - 3600 * 1000 * 24 * 7
      const params = {
        deviceCode: row.deviceCode, // 设备编码
        ioCode: row.ioCode, // 测点编码
        ioName: row.ioName,
        startDate: this.dateFormat(staratTime),
        endDate: this.dateFormat(new Date()),
      }
      getIoTrendHis(params)
        .then(({ data }) => {
          if (data.success) {
            console.log('重大历史数据：', data.result)
            this.setHisChart(data.result[0].valueList || []) // 回填历史图表
          }
          else {
            this.$message.warning(data.message || '获取历史数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取历史数据出错', err)
        })
    },
    // 时间格式化  yyyy-MM-dd HH::mm:ss
    dateFormat(time) {
      const date = new Date(time)
      const year = date.getFullYear()
      // 在日期格式中，月份是从0开始的，因此要加0
      // 使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
      const month
        = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
      const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
      const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
      const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
      const seconds = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds()
      // 拼接
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },

    // 请求报警记录数据
    getAlarmRecords(ioCode) {
      const searchData = {
        pageNum: 1,
        pageSize: 50,
        companyId: this.companyId,
        ioCode,
      }
      queryAlertRecord(searchData)
        .then(({ data }) => {
          if (data.success) {
            this.recordData = data.result.list || []
            console.log('测点报警记录:', this.recordData)
          }
          else {
            this.$message.warning(data.message || '获取数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取数据失败', err)
        })
        .finally(() => {})
    },
    // 设置报警统计图表
    setAlarmChart(dt) {
      const tags = []
      const data = []
      dt.forEach((item) => {
        tags.push(item.eventDate)
        data.push(item.total)
      })

      this.chart_alarm.setOption({
        xAxis: {
          data: tags,
        },
        series: [{ data }],
      })

      // let len = dt.length;
      // let tags = [],
      //     d1 = new Array(len).fill(0),
      //     d2 = new Array(len).fill(0),
      //     d3 = new Array(len).fill(0),
      //     d4 = new Array(len).fill(0);
      // dt.forEach((item, idx) => {
      //     tags.push(item.eventDate);
      //     if(item.level == 1) {
      //         d1[idx] = item.totalCount;
      //     }
      //     if(item.level == 2) {
      //         d2[idx] = item.totalCount;
      //     }
      //     if(item.level == 3) {
      //         d3[idx] = item.totalCount;
      //     }
      //     if(item.level == 4) {
      //         d4[idx] = item.totalCount;
      //     }

      // });

      // this.chart_alarm.setOption({
      //     xAxis: {
      //         data: tags
      //     },
      //     series: [
      //         {data: d1},
      //         {data: d2},
      //         {data: d3},
      //         {data: d4}
      //     ]
      // });
    },
    // 设置历史图表
    setHisChart(dt) {
      const tags = []
      const vals = []
      dt.forEach((item) => {
        tags.push(item.eventDate)
        vals.push(item.value)
      })

      this.chart_his.setOption({
        xAxis: {
          data: tags,
        },
        series: [{ data: vals }],
      })
    },

    // 公共方法

    // 调用父级 请求数据
    updateToParent() {
      // 查所有危险源
      this.searchData.isPage = false // false 所有数据不分页 ，true 分页
      if (this.searchData.unitName) {
        this.searchData.pageSize = 1 // 数量1条
      }
      else {
        this.searchData.pageSize = 200 // 数量200 条
        // 统计6天的报警数量(大屏)
        this.getStatisticsTotal()
      }
      this.$emit('upPublicDataByChildren', {
        name: 'hardDangrOriginData',
        params: this.searchData,
      })
    },

    // 来自地图点击
    from3dMapClick(markerObj) {
      console.log('from map3d:', markerObj.id)
    },

    // 点击左侧隐藏按钮
    toHideLeft() {
      this.$store.dispatch('newMaterial/leftHide', true)
    },
    // 点击左侧显示按钮
    toShowLeft() {
      this.$store.dispatch('newMaterial/leftHide', false)
    },
    // 点击右侧隐藏按钮
    toHideRight() {
      this.$store.dispatch('newMaterial/rightHide', true)
    },
    // 点击右侧显示按钮
    toShowRight() {
      this.$store.dispatch('newMaterial/rightHide', false)
    },
  },
}
</script>

<template>
  <div class="dangerOrigin-buisCon">
    <!-- 左侧 -->
    <div class="left-pc" :class="leftHide ? 'hide' : ''">
      <!-- 左上角 -->
      <div class="title-button">
        <div class="titleImage" :style="{ backgroundImage: `url(${cl_bg})` }">
          <img :src="n01">
          <span>重大危险源数 &nbsp;&nbsp;{{ hardDangerOriginData.length }}</span>
        </div>
        <div class="titleImage" :style="{ backgroundImage: `url(${cl_bg})` }">
          <img :src="n02">
          <span>监测点数 &nbsp;&nbsp;{{ pointNums }}</span>
        </div>
      </div>

      <!-- 列表 -->
      <div class="lists">
        <div class="comm-title">
          <img :src="n03">
          <span>列表</span>
        </div>

        <div class="lCon">
          <!-- <el-input v-model="sKey" prefix-icon="el-icon-search" placeholder="输入名称查找" /> -->
          <div class="searchBox">
            <el-input
              v-model="searchData.unitName"
              prefix-icon="el-icon-search"
              placeholder="输入名称查找"
              clearable
            />
            <el-col :span="3">
              <el-button
                type="primary"
                icon="el-icon-search"
                style="width: 100%"
                @click="updateToParent"
              />
            </el-col>
          </div>
          <el-table
            :data="dangerOriginList"
            class="comm-table"
            header-cell-class-name="table_header"
            height="100%"
            :highlight-current-row="true"
            @row-click="listRowFn"
          >
            <!-- 名称 majorHazardName -->
            <!-- <el-table-column label="序号" type="index" align="center" width="45"></el-table-column> -->
            <el-table-column
              label="序号"
              type="index"
              align="center"
              width="45"
            />
            <el-table-column
              prop="unitName"
              label="名称"
              align="center"
            />
            <el-table-column
              prop="hazardLevel"
              label="等级"
              align="center"
            >
              <template slot-scope="scope">
                <el-tag
                  effect="dark"
                  :color="setDangerOriginLevel(scope.row.hazardLevel).color"
                >
                  {{ setDangerOriginLevel(scope.row.hazardLevel).label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="c"
              label="状态"
              align="center"
              width="45"
            >
              <template>
                <span>正常</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 报警统计 -->
      <div class="alarms">
        <div class="comm-title">
          <img :src="n03">
          <span>报警统计</span>
        </div>
        <div id="chart_alarm" />
      </div>

      <!-- 收起按钮 -->
      <div class="showBtns">
        <div
          v-if="!leftHide"
          :style="{ backgroundImage: `url(${left_hide})` }"
          @click="toHideLeft"
        />
        <div
          v-else
          :style="{ backgroundImage: `url(${right_hide})` }"
          @click="toShowLeft"
        />
      </div>
    </div>

    <!-- 右侧 -->
    <div class="right-pc" :class="rightHide ? 'hide' : ''">
      <!-- 详情 -->
      <template v-if="!isPoint">
        <div class="details">
          <div class="comm-title">
            <img :src="n04">
            <span>详情</span>
          </div>

          <!-- 基本信息 -->
          <div class="baseInfo">
            <div class="list-title">
              基本信息
            </div>
            <div class="baseCon">
              <div class="bs-item">
                <span>重大危险源 :&nbsp;&nbsp;</span>
                <span> {{ dangerSourceDetail.unitName }} </span>
              </div>
              <div class="bs-item">
                <span>等级 :&nbsp;&nbsp;</span>
                <span>{{
                  setDangerOriginLevel(dangerSourceDetail.hazardLevel).label
                }}</span>
              </div>
              <div class="bs-item">
                <span>所在区域 :&nbsp;&nbsp;</span>
                <span>{{ dangerSourceDetail.riskRegion }}</span>
              </div>
              <div class="bs-item">
                <span>包保负责人 :&nbsp;&nbsp;</span>
                <span>{{ dangerSourceDetail.insuranceUserName }}</span>
              </div>
              <div class="bs-item">
                <span>主要负责人 :&nbsp;&nbsp;</span>
                <span>{{ dangerSourceDetail.liableUserName }}</span>
              </div>
            </div>
          </div>

          <!-- 应急预案 style="height:120px"; -->
          <div class="list-box">
            <div class="list-title">
              应急预案
            </div>
            <el-table
              :data="emergencyPlanData"
              class="comm-table"
              height="100%"
            >
              <el-table-column
                prop="fileType"
                label="预案名称"
                align="center"
              >
                <template slot-scope="scope">
                  <span>{{ setDocType(scope.row.fileType).name }}</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="compilePerson"
                label="编写人"
                align="center"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.compilePerson || "--" }}</span>
                </template>
              </el-table-column>
              <el-table-column align="center" label="操作">
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    @click="contingencyPlanDoc(scope.row)"
                  >
                    查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 化学品信息 -->
          <div class="list-box">
            <div class="list-title">
              化学品信息
            </div>
            <el-table
              :data="chemistryData"
              class="comm-table"
              height="100%"
            >
              <el-table-column
                prop="chemistryName"
                label="危险品"
                align="center"
              />
              <el-table-column
                prop="casCharacter"
                label="CAS号"
                align="center"
              />
              <el-table-column
                prop="qvalue"
                label="存储量(t)"
                align="center"
              />
              <el-table-column align="center" label="操作">
                <template>
                  <el-button type="text" @click="chemistryDialog">
                    查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 实时监测值 -->
          <div class="fixed-item">
            <div class="list-title">
              实时监测值
            </div>
            <div class="table-fixed">
              <el-table
                :data="realData"
                class="comm-table"
                height="100%"
                @row-click="realRowFn"
              >
                <el-table-column
                  prop="ioName"
                  label="测点名称"
                  align="center"
                />
                <el-table-column
                  prop="ioCode"
                  label="测点编码"
                  align="center"
                />
                <el-table-column
                  prop="value"
                  label="测点值"
                  align="center"
                />
                <el-table-column
                  prop="c"
                  label="状态"
                  align="center"
                >
                  <template>
                    <span>正常</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <!-- 实时视频 -->
          <div class="fixed-item">
            <div class="list-title">
              实时视频
            </div>
            <div class="table-fixed">
              <el-table
                :data="bindCameraList"
                class="comm-table"
                height="100%"
                :highlight-current-row="true"
              >
                <el-table-column
                  prop="camName"
                  label="摄像头名称"
                  align="center"
                />
                <el-table-column
                  prop="camLocation"
                  label="位置"
                  align="center"
                />
                <el-table-column
                  prop="brand"
                  label="品牌"
                  align="center"
                />
                <el-table-column
                  align="center"
                  label="操作"
                  width="50"
                >
                  <template slot-scope="scope">
                    <el-button
                      type="text"
                      @click="videoByChannelIdDevicId(scope.row)"
                    >
                      查看
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </template>

      <!-- 测点详情 -->
      <template v-if="isPoint">
        <div class="points">
          <div class="comm-title" style="position: relative">
            <img :src="n06">
            <span>查看监测点</span>
            <el-button
              type="text"
              icon="el-icon-close"
              size="medium"
              style="position: absolute; right: 0"
              @click="closePoint"
            />
          </div>

          <!-- 监测点信息 -->
          <div class="baseInfo">
            <div class="list-title">
              监测点信息
            </div>
            <div class="baseCon">
              <div class="bs-item">
                <span>监测点名称</span>
                <span>{{ curPoint.ioName }}</span>
              </div>
              <div class="bs-item">
                <span>监测点编号</span>
                <span>{{ curPoint.ioCode }}</span>
              </div>
              <div class="bs-item">
                <span>监测类型</span>
                <!-- 数据字典 -->
                <span>{{
                  $dictUtils.getDictLabel("output_type", curPoint.varType)
                }}</span>
              </div>
              <div class="bs-item">
                <span>数值单位</span>
                <span>{{ curPoint.unit }}</span>
              </div>
            </div>
          </div>

          <!-- 监测数值 -->
          <div class="nums">
            <div class="list-title">
              监测数值
            </div>
            <div class="numCon">
              <div class="ss">
                <span>实时值</span>
                <span style="font-size: 25px; padding-left: 10px">{{ curPoint.value }}{{ curPoint.ioUnit }}</span>
              </div>
              <div class="ls">
                <span>历史趋势</span>
                <div id="chart_his" />
              </div>
            </div>
          </div>

          <!-- 报警记录 -->
          <div class="records">
            <div class="list-title">
              报警记录
            </div>
            <div class="recCon">
              <el-table
                :data="recordData"
                class="comm-table rec-table"
                height="100%"
              >
                <el-table-column
                  prop="eventDate"
                  label="报警时间"
                  align="center"
                >
                  <template slot-scope="props">
                    {{ formatDate(props.row.eventDate) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="eventValue"
                  label="报警值"
                  align="center"
                />
                <el-table-column
                  prop="level"
                  label="级别"
                  align="center"
                >
                  <template slot-scope="scope">
                    <el-tag
                      effect="dark"
                      :color="setDangerOriginLevel(scope.row.level).color"
                    >
                      {{ setDangerOriginLevel(scope.row.level).label }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="处理状态" align="center" />
                <el-table-column
                  prop="updatedTime"
                  label="处理时间"
                  align="center"
                />
              </el-table>
            </div>
          </div>
        </div>
      </template>

      <!-- 收起按钮 -->
      <div class="showBtns">
        <div
          v-if="!rightHide"
          :style="{ backgroundImage: `url(${right_hide})` }"
          @click="toHideRight"
        />
        <div
          v-else
          :style="{ backgroundImage: `url(${left_hide})` }"
          @click="toShowRight"
        />
      </div>
    </div>

    <!-- 播放弹窗 -->
    <el-dialog
      class="normal-dialog video-dialog-newMaterial"
      :visible.sync="dialog_vid"
      width="60%"
      @close="videoUrl = ''"
    >
      <div class="headTitle">
        视频画面
      </div>
      <!-- <LivePlayer :videoUrl="videoUrl" fluent autoplay live stretch /> -->
      <JessibucaPlayer :id="Math.floor(Math.random() * 10 + 1)" :videoUrl="videoUrl" />
    </el-dialog>
    <!-- 弹出信息 化学品信息 -->
    <div>
      <el-dialog
        v-max-dialog
        class="div-dialog"
        :title="titleName"
        :visible.sync="showInfoDialog"
        width="52%"
        append-to-body
        :close-on-click-modal="false"
        top="8vh"
      >
        <!-- 化学品信息 -->
        <ChemistryInfoDialog :chemistyTable="chemistryData" />
      </el-dialog>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dangerOrigin-buisCon {
  position: relative;
  font-size: 12px;
  color: #fff;
  .left-pc {
    width: 30%;
    height: calc(100vh - 50px);
    position: absolute;
    left: 0;
    top: 0;
    background-image: url("../../../assets/anhuan3d/left.png");
    background-size: 100% 100%;
    padding: 10px 100px 10px 20px;
    display: flex;
    flex-direction: column;

    .title-button {
      display: flex;
      justify-content: space-evenly;
      padding-bottom: 10px;
      /* 带图片的标题 */
      .titleImage {
        background-size: 100% 100%;
        display: flex;
        align-items: center;
        color: #ffffff;
        font-size: 14px;
        margin-right: 5px;
        img {
          margin: 10px;
          height: 20px;
          width: 20px;
        }
        span {
          margin-right: 10px;
          color: white;
          font-weight: bold;
          text-shadow: 0px 0px 1px #11c8e5, 0px 1px 5px #11c8e5, 0px 1px 10px #11c8e5;
        }
      }
    }
    .totals {
      display: flex;
      color: #fff;
      font-size: 14px;
      .tItem {
        padding-right: 20px;
        & > span {
          display: inline-block;
          margin-bottom: 8px;
        }
        & > div {
          padding: 6px 15px;
          background-size: 100% 100%;
          display: flex;
          align-items: center;
          img {
            width: 30px;
            height: 30px;
            margin-right: 6px;
          }
        }
      }
    }
    .lists {
      padding: 0px 0px 20px 0;
      height: 300px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      .lCon {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-size: 12px;
        color: #fff;
        .searchBox {
          display: flex;
          justify-content: space-between;
        }
        .el-input {
          margin-bottom: 6px;
          input {
            background: transparent;
            border-color: #0f81a3;
            color: #fff;
          }
        }
        .table-tc {
          flex: 1;
          overflow: auto;
          background-size: 100% 100%;
          padding: 10px;
          // chrome浏览器隐藏滚动条
          &::-webkit-scrollbar {
            display: none;
          }
          // 火狐浏览器的滚动条隐藏
          scrollbar-width: none;
          .item-table {
            line-height: 20px;
            display: flex;
            justify-content: space-around;
            cursor: pointer;
            &:nth-child(even) {
              background: rgba(15, 129, 163, 0.5);
            }
            & > span {
              flex: 1;
              &:first-child {
                flex: 2;
              }
            }
          }
        }
        .el-tag {
          border: none;
        }
      }
    }
    .alarms {
      flex: 1;
      display: flex;
      flex-direction: column;
      #chart_alarm {
        flex: 1;
      }
    }

    .showBtns {
      position: absolute;
      top: 50%;
      left: calc(100% - 95px);
      transform: translateY(-50%);
      & > div {
        width: 18px;
        height: 61px;
        background-size: 100% 100%;
        cursor: pointer;
      }
    }
    &.hide {
      transform: translateX(calc(-100% + 100px));
    }
  }
  .right-pc {
    width: 30%;
    height: calc(100vh - 50px);
    position: absolute;
    right: 0;
    top: 0;
    background-image: url("../../../assets/anhuan3d/right.png");
    background-size: 100% 100%;
    padding: 10px 20px 10px 100px;
    display: flex;
    flex-direction: column;
    .details {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
      -webkit-box-flex: 1;
      flex: 1;
      .list-box {
        height: 100%;
        overflow: hidden;
      }
      .fixed-item {
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
        .table-fixed {
          position: absolute;
          width: 100%;
          height: 100%;
          padding-top: 28px;
        }
      }
    }
    .points {
      flex: 1;
      display: flex;
      flex-direction: column;
      .nums {
        height: 50%;
        display: flex;
        flex-direction: column;
        .numCon {
          flex: 1;
          border: 1px solid #0f81a3;
          padding: 5px;
          display: flex;
          flex-direction: column;
          .ss {
            display: flex;
            align-items: center;
            line-height: 50px;
          }
          .ls {
            flex: 1;
            display: flex;
            flex-direction: column;
            #chart_his {
              flex: 1;
            }
          }
        }
      }
      .records {
        flex: 1;
        display: flex;
        flex-direction: column;
        .recCon {
          flex: 1;
          .rec-table {
            border-top: none;
          }
        }
      }
    }
    .baseCon {
      border: 1px solid #0f81a3;
      padding: 5px;
      .bs-item {
        line-height: 20px;
        span {
          &:first-child {
            padding-right: 6px;
            font-weight: bold;
          }
          &:nth-child(2) {
            color: #ccc;
          }
        }
      }
    }

    .showBtns {
      position: absolute;
      top: 50%;
      right: calc(100% - 95px);
      transform: translateY(-50%);
      & > div {
        width: 18px;
        height: 61px;
        background-size: 100% 100%;
        cursor: pointer;
      }
    }
    &.hide {
      transform: translateX(calc(100% - 100px));
    }
  }

  .comm-title {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: bold;
    color: #fff;
    padding-bottom: 10px;
    img {
      width: 16px;
      margin-right: 6px;
    }
  }
  .list-title {
    color: #fff;
    font-size: 12px;
    font-weight: bold;
    border: 2px solid #0f81a3;
    background-color: #0f445d7a;
    padding: 6px;
  }
}

/* 中输入框*/
::v-deep .el-input__inner {
  background-color: transparent;
  border-color: #0f81a3;
  color: #fff;
}

/* el-table 深度样式表格透明 */
.comm-table ::v-deep {
  color: #fff;
  background: transparent;
  border: 1px solid #0f81a3;
  th,
  tr {
    background: transparent;
  }
  th {
    color: #fff;
    font-weight: bold;
    padding: 0;
    border: none !important;
    background: transparent !important;
  }
  tr:hover td {
    background: rgba(15, 129, 163, 0.9) !important;
    cursor: pointer;
  }

  td {
    padding: 0;
    border: none !important;
  }
  .el-table__body-wrapper {
    // chrome浏览器隐藏滚动条
    &::-webkit-scrollbar {
      display: none;
    }
    // 火狐浏览器的滚动条隐藏
    scrollbar-width: none;
  }

  //选中高亮
  .current-row > td {
    background: #0794a980 !important;
    border-left: none;
    border-right: none;
  }

  //滑动条 -条空位
  .el-table__body {
    width: 100% !important;
  }
  //滑动条 -表头部位置
  .el-table__cell.gutter {
    display: none !important;
    width: 0px;
  }
  colgroup col[name="gutter"] {
    display: none;
    width: 0px;
  }
}

/* 表头样式 .el-table__heade*/
::v-deep .el-table .table_header,
.el-table__heade {
  /* background: #0c8ab0af !important; */
  border-bottom: 1px solid #0f81a3 !important;
}

/* el-table 行高亮 */
::v-deep .el-table .el-table-row-highlight {
  background: #105d749c;
}

/* el-table去掉表格最底横线 */
::v-deep.el-table::before {
  height: 0px;
}

// 化学品信息-弹窗效果
.div-dialog {
  padding-bottom: 30px;
}
.div-dialog ::v-deep {
  .el-dialog__header {
    background: #e5e5e5;
    min-height: 56px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .el-dialog__headerbtn {
      position: inherit;
    }
    .el-dialog__title {
      display: flex;
      align-items: center;
      font-weight: bold;
      font-size: 18px;
    }
    .el-dialog__title::before {
      display: inline-block;
      content: "";
      margin: 0 10px 0 0;
      width: 4px;
      height: 24px;
      background-color: #409eff;
    }
  }
  .el-dialog {
    height: 90vh;
    margin: 5vh auto !important;
    overflow: hidden;
    background-color: white;
  }
  .el-dialog__body {
    height: calc(90vh - 56px);
    padding: 24px 24px 0 24px;
  }
  .dialog-info {
    height: calc(100% - 64px);
    padding: 0 0 10px 0;
    overflow-y: auto;
  }
  .el-dialog__footer {
    background: #ffff00 !important;
  }
  .dialog-footer {
    width: 100%;
    height: 64px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    background: #e4e7ed;
  }
}
</style>
