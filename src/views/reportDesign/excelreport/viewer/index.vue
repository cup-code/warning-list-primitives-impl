<script>
import { exportExcel, preview } from '@/http/anji-report/GaeaReport'
import { loadLuckysheet } from '@/utils/loadLuckysheet'

export default {
  data() {
    return {
      options: {},
      sheet: {},
      reportId: null,
      reportCode: null,
      reportName: null,
      dataSet: null,
      tableData2: [],
      excelData: {},
      params: {
        reportCode: '',
        setParam: '',
      },
      vis_prt: false,
      down_loading: false,
    }
  },
  async mounted() {
    // 动态加载 Luckysheet
    try {
      await loadLuckysheet()
      console.log('✅ Luckysheet 加载完成，开始初始化报表预览')
      this.preview()
    }
    catch (error) {
      this.$message.error('Excel 编辑器加载失败，请刷新页面重试')
      console.error('Luckysheet 加载失败:', error)
    }
  },
  created() {
    this.reportCode = this.$route.query.reportCode
  },
  methods: {
    async searchPreview() {
      const arr = this.toObject(this.tableData2)
      this.params.setParam = JSON.stringify(arr)
      // 每次都重新加载需要改成刷新
      this.preview()
    },
    async preview() {
      this.excelData = {}
      this.params.reportCode = this.reportCode
      const { code, data } = await preview(this.params)
      if (code != 200)
        return
      // this.reportName = JSON.parse(data.jsonStr).name
      this.reportName = data.reportName
      // 渲染查询表单
      this.params.setParam = JSON.parse(data.setParam)
      const extendArry = []
      const extendObj = this.params.setParam
      for (const i in extendObj) {
        const children = []
        for (const y in extendObj[i]) {
          children.push({ name: y, value: extendObj[i][y] })
        }
        extendArry.push({ name: i, children })
      }
      this.tableData2 = extendArry

      this.excelData = data.jsonStr
      this.sheetData = data == null ? [{}] : JSON.parse(data.jsonStr)
      this.createSheet()
    },
    async download(val) {
      if (val == 'gaea_template_pdf') {
        this.$message('暂不支持pdf')
        return
      }
      const result = {}
      result.reportCode = this.reportCode
      result.setParam = JSON.stringify(this.params.setParam)
      if (val != '') {
        result.exportType = val
      }
      this.down_loading = true
      const {
        code,
        message,
        data,
      } = await exportExcel(result)
      this.down_loading = false
      if (code != 200)
        return
      // this.$message.success(message);
      window.open(data, '_self')
    },
    // 表单封装json
    toObject(val) {
      const objfirst = {}
      const objSecond = {}
      val.forEach((el) => {
        el.name ? (objfirst[el.name] = el.children) : ''
      })
      for (const key in objfirst) {
        const newObj = {}
        objfirst[key].map((ev) => {
          Object.assign(newObj, { [ev.name]: ev.value })
        })
        objSecond[key] = newObj
      }
      return objSecond
    },
    // 初始化表格
    createSheet() {
      // 整体配置
      const options = {
        container: 'luckysheet', // 设定DOM容器的id
        title: '报表设计', // 设定表格名称
        lang: 'zh', // 设定表格语言
        // plugins:['chart'],
        data: [
          {
            name: 'report', // 工作表名称
            color: '', // 工作表颜色
            index: 0, // 工作表索引
            status: 1, // 激活状态
            order: 0, // 工作表的下标
            hide: 0, // 是否隐藏
            row: 36, // 行数
            column: 18, // 列数
            defaultRowHeight: 19, // 自定义行高
            defaultColWidth: 73, // 自定义列宽
            celldata: [], // 初始化使用的单元格数据
            config: {
              merge: {}, // 合并单元格
              rowlen: {}, // 表格行高
              columnlen: {}, // 表格列宽
              rowhidden: {}, // 隐藏行
              colhidden: {}, // 隐藏列
              borderInfo: {}, // 边框
              authority: {}, // 工作表保护
            },
            scrollLeft: 0, // 左右滚动条位置
            scrollTop: 315, // 上下滚动条位置
            luckysheet_select_save: [], // 选中的区域
            calcChain: [], // 公式链
            isPivotTable: false, // 是否数据透视表
            pivotTable: {}, // 数据透视表设置
            filter_select: {}, // 筛选范围
            filter: null, // 筛选配置
            luckysheet_alternateformat_save: [], // 交替颜色
            luckysheet_alternateformat_save_modelCustom: [], // 自定义交替颜色
            luckysheet_conditionformat_save: {}, // 条件格式
            frozen: {}, // 冻结行列配置
            chart: [], // 图表配置
            zoomRatio: 1, // 缩放比例
            image: [], // 图片
            showGridLines: 1, // 是否显示网格线
            dataVerification: {}, // 数据验证配置
          },
        ],

        // 行数和列数都设置为1可以自动去掉空的单元格
        row: 1,
        column: 1,

        // 是否显示顶部信息栏
        showinfobar: false,
        // 是否显示公式栏
        sheetFormulaBar: false,
        // 是否显示底部sheet页按钮
        // showsheetbar: false,
        // 是否显示工具栏
        showtoolbar: false,
        // 允许添加行
        enableAddRow: false,
        // 允许回到顶部
        enableAddBackTop: false,
        // 不允许编辑
        allowEdit: false,
        // 去掉行号列
        rowHeaderWidth: 0,
        // 去掉列号行
        columnHeaderHeight: 0,

        // 底部sheet页配置
        showsheetbarConfig: {
          add: false, // 添加sheet
          menu: false, // sheet菜单
          sheet: true, // sheet页
        },
        // sheet页右击菜单
        sheetRightClickConfig: {
          delete: false, // 删除
          copy: false, // 复制
          rename: false, // 重命名
          color: false, // 更改颜色
          hide: false, // 隐藏，取消隐藏
          move: false, // 向左移，向右移
        },
      }

      this.filterFn() // 过滤数据（去掉空白的行和列）
      options.data = this.sheetData // 工作表配置(也就是每个sheet表)

      $(() => {
        luckysheet.create(options)
      })
    },
    // 打印
    printFn() {
      // 第一种: html方式(问题是打印样式和预览的不一样)
      // this.vis_prt = true;
      // const html = luckysheet.getRangeHtml();
      // this.$nextTick(() => {
      //     document.querySelector('#print_html').innerHTML = html;
      // })

      // 第二种: 生成base64图片的方式(调用的luckysheet的getScreenshot接口)
      // this.vis_prt = true;
      $('#luckysheet-left-top').click()
      const src = luckysheet.getScreenshot()
      const $img = `<img src=${src} style="max-width: 90%;" />`
      this.$nextTick(() => {
        document.querySelector('#print_html').innerHTML = $img
      })
    },
    // 过滤数据（去掉空白的行和列）
    filterFn() {
      this.sheetData.forEach((sheet) => {
        sheet.celldata = sheet.celldata.filter(item => item.v.v)
      })
    },
  },
}
</script>

<template>
  <div class="layout">
    <div class="layout-right">
      <div class="block">
        <div class="download">
          <a
            v-if="reportCode != null"
            download="xxx.xlsx"
          >
            <el-button
              type="success"
              plain
              :loading="down_loading"
              @click="download('gaea_template_excel')"
            >导出excel</el-button>
          </a>
          <!-- <a v-if="reportCode != null" download="xxx.pdf"> -->
          <!-- <el-button @click="download('gaea_template_pdf')" type="success" plain>导出pdf</el-button> -->
          <!-- </a> -->
          <div v-if="reportCode != null">
            <el-button
              v-print="'#print_html'"
              type="success"
              plain
              @click="printFn"
            >
              打印
            </el-button>
          </div>
        </div>

        <el-form>
          <!-- <h2>表格查询</h2> -->
          <h2>{{ reportName }}</h2>
          <div
            v-for="(item, num) in tableData2"
            :key="`${num}excel`"
          >
            <!-- <h4>{{ item.name }}</h4> -->
            <div
              v-for="(son, y) in item.children"
              :key="`${y}excel2`"
              class="search_input"
            >
              <label>{{ son.name }}：</label>
              <el-input v-model="son.value" />
            </div>
          </div>
          <el-button
            style="width: 100%"
            type="primary"
            plain
            @click="searchPreview"
          >
            查询
          </el-button>
        </el-form>
        <!-- <el-pagination :current-page="currentPage4" :page-sizes="[100, 200, 300, 400]" :page-size="100" layout="total, sizes, prev, pager, next, jumper" :total="400" @size-change="handleSizeChange" @current-change="handleCurrentChange" /> -->
      </div>
    </div>

    <div class="layout-middle">
      <div id="luckysheet" />
    </div>

    <!-- 打印弹窗 -->
    <!-- <el-dialog class="dialog-print-reportDesign" title="打印预览" :visible.sync="vis_prt" width="1000px">
            <div id="print_html" style="text-align: center;"></div>
            <div style="text-align: right;" slot="footer">
                <el-button type="primary" size="mini" v-print="'#print_html'">打印</el-button>
            </div>
        </el-dialog> -->
    <div
      id="print_html"
      style="text-align: center"
    />
  </div>
</template>

<style scoped lang="scss">
.download {
  width: 100%;
  float: left;
  button {
    margin-bottom: 10px;
  }
}
.block {
  position: relative;
  /* z-index: 10000; */
  top: 0;
  background: #fff;
  width: 100%;
  h2 {
    font-size: 14px;
    line-height: 30px;
  }
  h4 {
    font-size: 12px;
  }
  .search_input {
    font-size: 12px;
    margin-bottom: 10px;
    label {
      line-height: 20px;
    }
  }
}
.layout {
  display: block;
  position: relative;
  margin: 0;
  padding: 0;
  height: 100vh;
  overflow: hidden;
}
.layout-middle {
  display: block;
  position: absolute;
  left: 200px;
  right: 0;
  width: calc(100% - 200px);
  margin: 0;
  padding: 0;
  height: 100%;

  #luckysheet {
    margin: 0px;
    padding: 0px;
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0px;
    bottom: 0px;
  }

  .excel-designer {
    display: block;
    position: relative;
    margin: 0;
    padding: 0;
  }
}
.layout-right {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  padding: 20px;
  width: 200px;
  min-height: 99.98vh;
  border-left: 1px solid #dcdee2;
  border-color: #e8eaec;
  background: #fff;
  border-radius: 4px;
  font-size: 14px;
  -webkit-transition: all 0.2s ease-in-out;
  transition: all 0.2s ease-in-out;
}
</style>

<style lang="scss" scoped>
.dialog-print-reportDesign .el-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: calc(100% - 30px);
  max-width: calc(100% - 30px);
  margin: 0 !important;
  display: flex;
  flex-direction: column;
  .el-dialog__header {
    border-bottom: 1px solid #e8e8e8;
  }
  .el-dialog__body {
    overflow: auto;
  }
  .el-dialog__footer {
    border-top: 1px solid #e8e8e8;
    border-radius: 0 0 4px 4px;
  }
  table {
    border-collapse: collapse;
  }
}
</style>
