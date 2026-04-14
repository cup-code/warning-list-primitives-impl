<script>
import { getSysRoleById, getSysRoleList } from '@/http/safe-production/flowable-api'

export default {
  props: {
    limit: {
      type: Number,
      default: 999999,
    },
    columns: {
      type: Array,
      default() {
        return []
      },
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    searchs: {
      type: Array,
      default() {
        return []
      },
    },
    dataListUrl: {
      type: String,
      default() {
        return null
      },
    },
    queryEntityUrl: {
      type: String,
      default() {
        return null
      },
    },
    entityBeanName: {
      type: String,
      default() {
        return null
      },
    },
    value: {
      type: String,
      default() {
        return null
      },
    },
    title: {
      type: String,
      default() {
        return ''
      },
    },
    placeholder: {
      type: String,
      default() {
        return '请选择'
      },
    },
    labelName: {
      type: String,
      default() {
        return ''
      },
    },
    labelValue: {
      type: String,
      default() {
        return ''
      },
    },
    size: {
      type: String,
      default() {
        return 'mini'
      },
    },
  },
  data() {
    return {
      searchForms: [],
      filterText: '',
      dataListAllSelections: [],
      // 所有选中的数据包含跨页数据
      dataListSelections: [],
      idKey: 'id',
      // 标识列表数据中每一行的唯一键的名称(需要按自己的数据改一下)
      dataList: [],
      dynamicTags: [],
      selectData: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      orderBy: '',
      loading: false,
      visible: false,
      name: '',
    }
  },
  watch: {
    value: {
      handler(newVal) {
        if (newVal && newVal.startsWith('${') && newVal.endsWith('}')) {
          this.name = newVal
        }
        else {
          this.selectData = []

          if (newVal) {
            newVal.split(',').forEach((value) => {
              if (value) {
                // this.$http.get("".concat(this.queryEntityUrl, "?").concat(this.labelValue, "=").concat(value)).then(_ref => {
                //     var data = _ref.data;

                //     if(data[this.entityBeanName][this.labelValue] !== '') {
                //         this.selectData.push(data[this.entityBeanName]);
                //     }
                // });
                getSysRoleById(value).then(({ data }) => {
                  if (data.role && data.role.id) {
                    this.selectData.push(data.role)
                  }
                })
              }
            })
          }
        }
      },
      immediate: true,
      deep: false,
    },
    selectData: {
      handler(newVal) {
        this.dataListAllSelections = JSON.parse(JSON.stringify(this.selectData))
        this.name = this.dataListAllSelections
          .map((item) => {
            return item[this.labelName]
          })
          .join(',')
      },
      immediate: false,
      deep: false,
    },
  },
  methods: {
    init() {
      this.visible = true
      this.$nextTick(() => {
        this.resetSearch()
      })
    },
    // 设置选中的方法
    setSelectRow() {
      if (!this.dataListAllSelections || this.dataListAllSelections.length <= 0) {
        this.$refs.gridTable.clearSelection()
        return
      } // 标识当前行的唯一键的名称

      const idKey = this.idKey
      const selectAllIds = []
      this.dataListAllSelections.forEach((row) => {
        selectAllIds.push(row[idKey])
      })
      this.$refs.gridTable.clearSelection()

      for (let i = 0; i < this.dataList.length; i++) {
        if (selectAllIds.includes(this.dataList[i][idKey])) {
          // 设置选中，记住table组件需要使用ref="table"
          this.$refs.gridTable.toggleRowSelection(this.dataList[i], true)
        }
      }
    },
    // 记忆选择核心方法
    changePageCoreRecordData() {
      // 标识当前行的唯一键的名称
      const idKey = this.idKey

      // 如果总记忆中还没有选择的数据，那么就直接取当前页选中的数据，不需要后面一系列计算
      if (this.dataListAllSelections.length <= 0) {
        this.dataListSelections.forEach((row) => {
          this.dataListAllSelections.push(row)
        })
        return
      }

      // 总选择里面的key集合
      const selectAllIds = []
      this.dataListAllSelections.forEach((row) => {
        selectAllIds.push(row[idKey])
      })
      const selectIds = [] // 获取当前页选中的id

      this.dataListSelections.forEach((row) => {
        selectIds.push(row[idKey]) // 如果总选择里面不包含当前页选中的数据，那么就加入到总选择集合里

        if (!selectAllIds.includes(row[idKey])) {
          this.dataListAllSelections.push(row)
        }
      })
      const noSelectIds = [] // 得到当前页没有选中的id

      this.dataList.forEach((row) => {
        if (!selectIds.includes(row[idKey])) {
          noSelectIds.push(row[idKey])
        }
      })
      noSelectIds.forEach((id) => {
        if (selectAllIds.includes(id)) {
          for (let i = 0; i < this.dataListAllSelections.length; i++) {
            if (this.dataListAllSelections[i][idKey] === id) {
              // 如果总选择中有未被选中的，那么就删除这条
              this.dataListAllSelections.splice(i, 1)
              break
            }
          }
        }
      })
    },
    // 得到选中的所有数据
    getAllSelectionData() {
      // 再执行一次记忆勾选数据匹配，目的是为了在当前页操作勾选后直接获取选中数据
      this.changePageCoreRecordData()
    },
    filterNode(value, data) {
      if (!value)
        return true
      return data.name.includes(value)
    },
    del(tag) {
      this.dataListAllSelections.splice(this.dataListAllSelections.indexOf(tag), 1)
      this.$nextTick(() => {
        this.setSelectRow()
      })
    },
    // 获取数据列表
    refreshList() {
      this.loading = true
      const searchForm = {}
      this.searchs.forEach((search, index) => {
        searchForm[search.prop] = this.searchForms[index]
      })

      // this.$http({
      //     url: this.dataListUrl,
      //     method: 'get',
      //     params: _objectSpread2({
      //         'pageNo': this.pageNo,
      //         'pageSize': this.pageSize,
      //         'orderBy': this.orderBy
      //     }, searchForm)
      // }).then(_ref2 => {
      //     var data = _ref2.data;

      //     if(data && data.success) {
      //         this.dataList = data.page.list;
      //         this.total = data.page.count;
      //         this.loading = false;
      //     }

      //     this.$nextTick(() => {
      //         this.setSelectRow();
      //     });
      // });

      getSysRoleList({
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        orderBy: this.orderBy,
        ...searchForm,
      }).then(({ data }) => {
        if (data && data.success) {
          this.dataList = data.page.list
          this.total = data.page.count
          this.loading = false
        }

        this.$nextTick(() => {
          this.setSelectRow()
        })
      })
    },
    // 每页数
    sizeChangeHandle(val) {
      this.pageSize = val
      this.pageNo = 1
      this.refreshList()
      this.$nextTick(() => {
        this.changePageCoreRecordData()
      })
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageNo = val
      this.refreshList()
      this.$nextTick(() => {
        this.changePageCoreRecordData()
      })
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val
      this.$nextTick(() => {
        this.changePageCoreRecordData()
      })
    },
    // 排序
    sortChangeHandle(obj) {
      if (obj.order === 'ascending') {
        this.orderBy = `${obj.prop} asc`
      }
      else if (obj.order === 'descending') {
        this.orderBy = `${obj.prop} desc`
      }
      else {
        this.orderBy = ''
      }

      this.refreshList()
    },
    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.searchForms = []
      this.refreshList()
    },
    doSubmit() {
      if (this.limit < this.dataListAllSelections.length) {
        this.$message.error(
          '\u4F60\u6700\u591A\u53EA\u80FD\u9009\u62E9'.concat(this.limit, '\u6761\u6570\u636E'),
        )
        return
      }

      this.visible = false
      this.name = this.dataListSelections
        .map((item) => {
          return item[this.labelName]
        })
        .join(',')
      const value = this.dataListSelections
        .map((item) => {
          return item[this.labelValue]
        })
        .join(',')
      this.$emit('getValue', value)
    },
    showSelectDialog() {
      this.visible = true
      this.init()
    },
    change() {
      if (this.name === '' || (this.name.startsWith('${') && this.name.endsWith('}'))) {
        this.$emit('getValue', this.name, this.name)
      }
    },
  },
}
</script>

<template>
  <div>
    <el-input
      v-model="name"
      class="input-with-select"
      style="line-hight: 40px"
      :placeholder="placeholder"
      :disabled="disabled"
      :size="size"
      :readonly="true"
      @input="change"
    >
      <el-button
        slot="append"
        :disabled="disabled"
        icon="el-icon-search"
        @click="showSelectDialog"
      />
    </el-input>

    <el-dialog

      class="gridDialog dialog-selfBpmn"
      :title="title"
      :close-on-click-modal="false"
      :append-to-body="true"
      width="900px"
      :visible.sync="visible"
    >
      <el-row :gutter="15">
        <el-col :span="19">
          <el-form
            ref="searchForm"
            class="query-form"
            size="mini"
            inline
            @keyup.enter.native="refreshList"
            @submit.prevent.native
          >
            <el-form-item
              v-for="(search, index) in searchs"
              :key="index"
              :prop="search.prop"
            >
              <el-input
                v-model="searchForms[index]"
                size="mini"
                :placeholder="search.label"
                clearable
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="mini"
                @click="refreshList"
              >
                查询
              </el-button>
              <el-button
                size="mini"
                @click="resetSearch"
              >
                重置
              </el-button>
            </el-form-item>
          </el-form>

          <el-table
            ref="gridTable"
            v-loading="loading"
            style="width: 100%"
            :data="dataList"
            size="mini"
            height="400px"
            @selection-change="selectionChangeHandle"
            @sort-change="sortChangeHandle"
          >
            <el-table-column
              v-if="limit <= 1"
              header-align="center"
              align="center"
              width="50"
            >
              <template slot-scope="scope">
                <el-radio
                  :label="scope.row.id"
                  :value="dataListAllSelections[0] && dataListAllSelections[0].id"
                  @change.native="getTemplateRow(scope.$index, scope.row)"
                >
                  <span />
                </el-radio>
              </template>
            </el-table-column>

            <el-table-column
              v-if="limit > 1"
              type="selection"
              header-align="center"
              align="center"
              width="50"
            />

            <el-table-column
              v-for="(column, index) in columns"
              :key="index"
              :prop="column.prop"
              header-align="center"
              align="center"
              min-width="100px"
              :label="column.label"
            />
          </el-table>

          <el-pagination
            :current-page="pageNo"
            :page-sizes="[5, 10, 50, 100]"
            :page-size="pageSize"
            :total="total"
            background
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="sizeChangeHandle"
            @current-change="currentChangeHandle"
          />
        </el-col>

        <el-col :span="5">
          <el-tag
            v-for="tag in dataListAllSelections"
            :key="tag.id"
            closable
            :disable-transitions="false"
            @close="del(tag)"
          >
            {{ ` ${tag[labelName]} ` }}
          </el-tag>
        </el-col>
      </el-row>

      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          size="mini"
          @click="visible = false"
        >关闭</el-button>
        <el-button
          size="mini"
          type="primary"
          @click="doSubmit"
        >确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.gridDialog {
  .el-dialog {
    .el-dialog__body {
      .query-form {
        padding-top: 15px;
        background-color: #fff;
        padding-left: 15px;
        margin-bottom: 10px;
      }
    }
  }
}
</style>
