<script>
import Sortable from 'sortablejs'
import optSelect from '@/components/BasePage/components/opt-select'
import SelectTree from '@/components/treeSelect/treeSelect.vue'

export default {
  components: {
    SelectTree,
    OptSelect: optSelect,
  },
  props: {
    config: {
      type: Object,
      default: () => {
        return {}
      },
    },
    value: null,
    api: '',
    apiCallback: null,
  },
  data() {
    return {
      // 默认配置
      defaultConfig: {
        btnType: 'success',
        btnText: '添加',
        btnDisabled: false,
        btnSize: 'mini',
        selectable: false,
        draggable: true,
      },
      // 默认配置 和 传进来的config 合并后的结果
      conf: {},
      columnList: [],
      dataListSelections: [],
      tempListsObj: {},
      radioVal: '',
    }
  },
  methods: {
    init() {
      this.genConfData(() => {
        this.getData()
        this.rowDrop()
      })
    },
    // 获取数据
    getData() {
      this.columnList = []
      if (this.value && this.api) {
        this.api(this.value).then(({ data }) => {
          this.apiCallback(data, this.columnList, this.conf, this.$data)
          this.$emit('change', JSON.parse(JSON.stringify(this.columnList)))
        })
      }
    },
    // 生成配置数据
    genConfData(fn) {
      this.conf = { ...this.defaultConfig, ...this.config }
      const arr = []
      this.config.columns.forEach((item) => {
        if (item.type === 'selectTree') {
          if (this.config[item.url])
            return
          // 初始化
          this.config[item.url] = []

          // 构造请求项
          arr.push([item.url, this.$http({ url: item.url, method: 'GET' })])
        }
      })

      // 如果有后台接口
      if (arr.length > 0) {
        Promise.all(arr.map(item => item[1])).then((res) => {
          let temp
          res.forEach((r, i) => {
            // this.config[arr[i][0]] = r.data.result || r.data.treeData || []

            temp
              = r.data.result && Array.isArray(r.data.result)
                ? r.data.result
                : Array.isArray(r.data.result.list)
                  ? r.data.result.list
                  : ''
            this.config[arr[i][0]] = temp || r.data.treeData || []
          })

          // 生成最终结果
          this.conf = { ...this.defaultConfig, ...this.config }

          fn()
        })
      }
      else {
        fn()
      }
    },
    // 添加
    addFn() {
      if (JSON.stringify(this.conf) === '{}')
        return
      const obj = { sort: '' }
      this.conf.columns.map((item) => {
        obj[item.prop] = ''

        if (item.type === 'selectTree') {
          obj[item.url] = this.conf[item.url]
        }
      })
      this.columnList.push(obj)
    },
    // 删除
    delFn(idx) {
      this.columnList.splice(idx, 1)
      this.$emit('change', this.columnList)
    },
    // 多选
    selectionChange(val) {
      this.dataListSelections = val
    },
    // 行拖拽
    rowDrop() {
      const tbody = document.querySelectorAll('.el-table__body-wrapper > table > tbody')[1]
      Sortable.create(tbody, {
        handle: '.handle',
        animation: 150,
        onEnd: (_ref) => {
          const newIndex = _ref.newIndex
          const oldIndex = _ref.oldIndex
          const currRow = this.columnList.splice(oldIndex, 1)[0]
          this.columnList.splice(newIndex, 0, currRow)
        },
      })
    },
    // 下拉树的点击
    treeTap(val, scope, config) {
      scope.row[config.prop] = val

      const keys = Object.keys(scope.row)

      if (config.hasNext) {
        this.conf.columns.forEach((c) => {
          if (c.type === 'selectTree' && c.prop !== config.prop) {
            scope.row[c.url] = this.conf[c.url].filter(item => item[config.prop] === val)
          }
        })
        // 清空后面的内容
        keys.forEach((key) => {
          if (key !== config.prop && key !== 'sort' && !key.includes('/')) {
            scope.row[key] = ''
          }
        })
        // 退出treeTap, 不再执行后续代码
        return
      }

      const tar = scope.row[config.url].find(item => item[config.prop] === val)
      if (tar) {
        keys.forEach((key) => {
          if (key in tar) {
            scope.row[key] = tar[key]
          }
        })
      }
      else {
        keys.forEach((key) => {
          const col = this.conf.columns.find(c => c.prop == key)
          const clearFlag = col && col.type !== 'selectTree' // 排除前一个下拉框

          if (key !== config.prop && key !== 'sort' && !key.includes('/') && clearFlag) {
            scope.row[key] = ''
          }
        })
      }

      this.$emit('change', JSON.parse(JSON.stringify(this.columnList)))
    },
    // 输入框的change事件
    inputChange() {
      this.$emit('change', JSON.parse(JSON.stringify(this.columnList)))
    },
    // checkbox的change事件
    checkboxChange() {
      this.$emit('change', JSON.parse(JSON.stringify(this.columnList)))
    },
    // radio的change事件
    radioChange(val) {
      this.columnList.forEach((item) => {
        item.rightAnswer = 0
        if (item.itemOption === val) {
          item.rightAnswer = 1
        }
      })
      this.$emit('change', JSON.parse(JSON.stringify(this.columnList)))
    },
    inputNumChange(val, scope) {},
    optSelectChange(val, scope, config) {
      scope.row[config.prop] = val
      config.callback && config.callback(val, scope, config)
    },
  },
}
</script>

<template>
  <div class="innerTable-baseDialog">
    <div>
      <el-button
        :type="conf.btnType"
        :disabled="conf.btnDisabled"
        :size="conf.btnSize"
        @click="addFn"
      >
        {{ conf.btnText }}
      </el-button>
    </div>

    <el-table
      :data="columnList"
      row-key="sort"
      :header-cell-style="{ background: '#F6F7FA' }"
      @selection-change="selectionChange"
    >
      <el-table-column
        v-if="conf.selectable"
        type="selection"
        align="center"
        width="50"
      />

      <el-table-column
        v-if="conf.draggable"
        prop="sort"
        width="50"
        align="center"
        label="拖动"
      >
        <i class="el-icon-rank handle" />
      </el-table-column>

      <el-table-column
        prop="sort"
        label="序号"
        width="50"
      >
        <template slot-scope="scope">
          {{ (scope.row.sort = scope.$index) }}
        </template>
      </el-table-column>

      <template v-for="item in conf.columns">
        <el-table-column
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          align="center"
          :width="item.width"
        >
          <template slot-scope="scope">
            <span v-if="item.type === 'text'">{{ scope.row[item.prop] }}</span>

            <el-checkbox
              v-if="item.type === 'checkbox'"
              v-model="scope.row[item.prop]"
              :true-label="1"
              :false-label="0"
              @change="checkboxChange"
            />

            <el-radio
              v-if="item.type === 'radio'"
              v-model="radioVal"
              :label="scope.row.itemOption"
              @change="radioChange"
            />

            <el-input
              v-if="item.type === 'input'"
              v-model="scope.row[item.prop]"
              @change="inputChange"
            />

            <el-input-number
              v-if="item.type === 'input-num'"
              v-model="scope.row[item.prop]"
              :controls-position="item.controlPos"
              :min="item.min"
              @change="val => inputNumChange(val, scope)"
            />

            <template v-if="item.type === 'selectTree'">
              <SelectTree
                v-model="scope.row[item.prop]"
                size="mini"
                :props="item.props"
                :list="scope.row[item.url]"
                :clearable="true"
                :accordion="true"
                @getValue="value => treeTap(value, scope, item)"
              />
            </template>

            <!-- 下拉框 -->
            <opt-select
              v-if="item.type == 'anji-select'"
              v-model.trim="scope.row[item.prop]"
              :multiple="item.anjiSelectOption.multiple"
              :dict-code="item.anjiSelectOption.dictCode"
              :url="item.anjiSelectOption.url"
              :method="item.anjiSelectOption.method"
              :query-param="item.anjiSelectOption.queryParam"
              :option="item.anjiSelectOption.option"
              :label="item.anjiSelectOption.label"
              :disabled-options="item.anjiSelectOption.disabledOptions"
              :disabled="item.disabled"
              :merge-label="item.anjiSelectOption.mergeLabel"
              :localOptions="item.anjiSelectOption.localOptions"
              @change="value => optSelectChange(value, scope, item)"
            />
          </template>
        </el-table-column>
      </template>

      <el-table-column
        label="操作"
        align="center"
        width="120"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            style="color: #f56c6c"
            type="text"
            @click="delFn(scope.$index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style lang="scss">
.innerTable-baseDialog {
  .el-table {
    margin-top: 10px;
  }
  .handle {
    cursor: pointer;
  }
}
</style>
