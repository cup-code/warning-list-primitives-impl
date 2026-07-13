<script>
import anjiSelect from '@/components/AnjiPlus/anji-select'
import request from '@/utils/request'
import LeftTree from './components/left-tree'
import optSelect from './components/opt-select'

export default {
  components: {
    LeftTree,
    OptSelect: optSelect,
    AnjiSelect: anjiSelect,
  },
  props: {
    option: {
      require: true,
      type: Object,
      default: () => {
        return {
          // 查询表单条件
          queryFormFields: [],
          // 按钮
          buttons: {
            query: {},
          },
          // 表格列
          columns: [],
          queryFormChange: (fileName, val) => {},
        }
      },
    },
  },
  data() {
    return {
      // 查询表单提交的值
      queryParams: {
        showMoreSearch: false, // 是否展开更多搜索条件
        pageNum: 1,
        pageSize: 10,
      },
      records: [], // 接口返回的记录列表
      total: 0, // 接口返回的总条数
      hideLeft: false,
      treeWidth: '25%',
      conWidth: '75%',
    }
  },
  computed: {
    // 左侧树形查询条件
    queryFormTreeField() {
      const treeField = this.option.queryFormFields.find(
        item => item.inputType == 'anji-tree',
      )
      return treeField
    },
    // 查询条件里是否有树形控件
    hasTreeFieldInQueryForm() {
      return this.isNotBlank(this.queryFormTreeField)
    },
    // 不包含树形控件的查询条件
    queryFormFieldExcludeTree() {
      const treeFields = this.option.queryFormFields.filter(
        item => item.inputType != 'anji-tree',
      )
      return treeFields
    },
  },
  mounted() {
    // 为查询框中所有input加上默认值
    this.option.queryFormFields.forEach((item) => {
      // 动态添加属性
      this.$set(this.queryParams, item.field, item.defaultValue || null)
    })
    // 查询列表
    this.handleQueryForm('query')
    this.queryFormChange()
  },
  methods: {
    queryFormFieldSpan(item) {
      if (item.span != null) {
        return item.span
      }
      else {
        return 6
      }
    },

    // 切换更多搜索条件
    handleToggleMoreSearch() {
      this.queryParams.showMoreSearch = !this.queryParams.showMoreSearch
    },

    // 查询按钮
    handleQueryForm(from) {
      // // 如果是点查询按钮，把树的查询属性去掉
      // if (from == "query") {
      //     if (this.hasTreeFieldInQueryForm) {
      //         delete this.queryParams[this.queryFormTreeField.field];
      //         this.$refs.queryFormTree.setCurrentKey(null);
      //     }
      // }
      // // 如果是点树查询，把查询区里的属性去掉
      // if (from == "tree") {
      //     if (this.hasTreeFieldInQueryForm) {
      //         var treeVal = this.queryParams[this.queryFormTreeField.field];
      //         this.queryParams = {
      //             pageNum: 1,
      //             pageSize: 10
      //         };
      //         this.queryParams[this.queryFormTreeField.field] = treeVal;
      //     }
      // }

      this.queryParams.pageNum = 1
      this.handleQueryPageList()
    },

    // 列表查询
    async handleQueryPageList() {
      const params = this.queryParams
      const { data } = await this.option.buttons.query.api(params)
      if (data.code != '200')
        return
      this.records = data.result.list
      this.total = data.result.total
    },

    // 重置
    handleResetForm() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
      }
      this.$refs.formSearch.resetFields()
      this.records = []
      this.total = 0

      if (this.hasTreeFieldInQueryForm) {
        this.$refs.queryFormTree.setCurrentKey(null)
      }

      this.handleQueryPageList()
    },

    // 树形查询条件点击回调
    handleTreeNodeCheck() {
      this.handleQueryForm('tree')
      // 为新建页面的对应属性值，绑定上对应的默认值
      const treeFieldName = this.queryFormTreeField.field
      for (let i = 0; i < this.option.columns.length; i++) {
        const item = this.option.columns[i]
        if (item.editField == treeFieldName || item.field == treeFieldName) {
          this.$set(
            this.option.columns[i],
            'defaultValue',
            this.queryParams[treeFieldName],
          )
          break
        }
      }
    },

    // 页码改变
    handleCurrentChange(pageNum) {
      this.queryParams.pageNum = pageNum
      this.handleQueryPageList()
    },

    // 每页size改变时
    handleSizeChange(val) {
      this.queryParams.pageNum = 1
      this.queryParams.pageSize = val
      this.handleQueryPageList()
    },

    // 带单位的列，需要转换
    fieldLabel(columnConfig) {
      if (columnConfig == null) {
        return ''
      }
      if (columnConfig.inputType == 'anji-input' && columnConfig.anjiInput != null) {
        return `${columnConfig.label}(${columnConfig.anjiInput.unit})`
      }
      else {
        return columnConfig.label
      }
    },

    // 带单位的输入框
    fieldValueByAnjiInput(value, columnConfig) {
      if (columnConfig == null) {
        return value
      }
      if (columnConfig.inputType == 'anji-input' && columnConfig.anjiInput != null) {
        return value / columnConfig.anjiInput.conversion
      }
      else {
        return value
      }
    },

    // 带表格列格式化的值
    fieldValueByRowRenderer(row, columnConfig) {
      if (
        columnConfig == null
        || typeof columnConfig.fieldTableRowRenderer != 'function'
      ) {
        return row[columnConfig.field]
      }
      else {
        return columnConfig.fieldTableRowRenderer(row)
      }
    },

    async switchChange(val, api) {
      request({
        url: api.url,
        method: 'put',
        headers: { noPrompt: false },
        data: [val.id],
      }).then((response) => {
        this.handleQueryPageList()
      })
    },

    queryFormChange(fileName, fieldVal) {
      if (typeof this.option.queryFormChange == 'function') {
        this.option.queryFormChange(this.queryParams, fileName, fieldVal)
      }
    },

    // 切换左侧菜单的收起与展现
    toggleLeftFn() {
      this.hideLeft = !this.hideLeft
      if (this.hideLeft) {
        this.treeWidth = '0%'
        this.conWidth = '100%'
      }
      else {
        this.treeWidth = '25%'
        this.conWidth = '75%'
      }
    },
  },
}
</script>

<template>
  <div :class="[hasTreeFieldInQueryForm ? 'page-baseContainer' : 'page-appContainer']">
    <div
      v-if="hasTreeFieldInQueryForm"
      class="left-container"
      :style="`width: ${treeWidth}`"
    >
      <LeftTree
        ref="queryFormTree"
        v-model.trim="queryParams[queryFormTreeField.field]"
        :is-open="queryFormTreeField.anjiTreeOption.isOpen"
        :enable-filter="queryFormTreeField.anjiTreeOption.enableFilter"
        :label-name="queryFormTreeField.label"
        :url="queryFormTreeField.anjiTreeOption.url"
        :props="queryFormTreeField.anjiTreeOption.props"
        filterKey="companyName"
        :canDo="queryFormTreeField.canDo"
        :dialog="queryFormTreeField.dialog"
        :delApi="queryFormTreeField.delApi"
        @node-click="handleTreeNodeCheck"
      />
      <div class="toggle-btn" @click="toggleLeftFn">
        {{ hideLeft ? "展开" : "隐藏" }}
      </div>
    </div>

    <div class="right-container" :style="`width: ${conWidth}`">
      <!-- 查询表单开始 -->
      <el-form
        ref="formSearch"
        class="sarchForm"
        :model="queryParams"
        :label-width="option.labelWidth"
      >
        <el-row>
          <el-col
            v-for="(item, index) in queryFormFieldExcludeTree"
            :key="item.field"
            :span="queryFormFieldSpan(item)"
          >
            <el-form-item
              v-if="index <= 1 || (index > 1 && queryParams.showMoreSearch)"
              :label="item.label"
              :rules="item.rules"
              :prop="item.field"
              :label-width="item.labelWidth || option.labelWidth"
            >
              <!-- 输入框 -->
              <el-input
                v-if="item.inputType == 'input' || item.inputType == 'input-number'"
                v-model.trim="queryParams[item.field]"
                :placeholder="item.placeholder || '请输入'"
                :clearable="item.clearable !== false"
                :disabled="item.disabled"
                @change="(value) => queryFormChange(item.field, value)"
              />
              <!-- 开关 -->
              <el-switch
                v-else-if="item.inputType == 'switch'"
                v-model.trim="queryParams[item.field]"
                :disabled="item.disabled"
                :active-value="item.switchOption.disableValue"
                :inactive-value="item.switchOption.enableValue"
                active-color="#5887fb"
                inactive-color="#ccc"
                @change="(value) => queryFormChange(item.field, value)"
              />
              <!-- 下拉框 -->
              <opt-select
                v-else-if="item.inputType == 'anji-select'"
                v-model.trim="queryParams[item.field]"
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
                @change="(value) => queryFormChange(item.field, value)"
              />
              <!-- 日期时间框  -->
              <el-date-picker
                v-else-if="item.inputType.includes('date')"
                v-model="queryParams[item.field]"
                style="width: 100%"
                :placeholder="item.placeholder || '请选择'"
                :type="item.inputType"
                :clearable="item.clearable !== false"
                @change="(value) => queryFormChange(item.field, value)"
              />
              <!-- 待扩展的表单类型，请自行扩展 -->
              <el-input
                v-else
                placeholder="组件不支持此类型表单请至组件内部自行扩展"
                disabled
              />
            </el-form-item>
          </el-col>

          <el-col :span="12" style="padding-left: 10px">
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="handleQueryForm('query')"
            >
              查询
            </el-button>
            <el-button
              icon="el-icon-refresh-right"
              @click="handleResetForm()"
            >
              重置
            </el-button>
            <a
              v-if="queryFormFieldExcludeTree.length > 3"
              style="margin-left: 8px"
              @click="handleToggleMoreSearch"
            >
              {{ queryParams.showMoreSearch == true ? "收起" : "高级筛选" }}
              <i
                :class="
                  queryParams.showMoreSearch ? 'el-icon-arrow-up' : 'el-icon-arrow-down'
                "
              />
            </a>
          </el-col>
        </el-row>
      </el-form>
      <!-- 查询表单结束 -->

      <!-- 批量操作 -->
      <div style="background: #fff; padding: 10px 0 0 10px">
        <slot name="buttonLeftOnTable" />
      </div>

      <!-- 表格 -->
      <div style="background: #fff; padding: 10px; flex: 1; overflow: hidden">
        <el-table
          class="anji_curd_table"
          :data="records"
          height="100%"
        >
          <!-- 序号 -->
          <el-table-column
            label="序号"
            min-width="50"
            align="center"
          >
            <template slot-scope="scope">
              {{ queryParams.pageSize * (queryParams.pageNum - 1) + scope.$index + 1 }}
            </template>
          </el-table-column>

          <template v-for="item in option.columns">
            <el-table-column
              v-if="item.tableHide != true && item.columnType != 'expand'"
              :key="item.field"
              :prop="item.field"
              :label="fieldLabel(item)"
              :min-width="item.minWidth || 110"
              :sortable="item.sortable"
              :show-overflow-tooltip="true"
              align="center"
            >
              <template slot-scope="scope">
                <div v-if="item.columnType == 'imgPreview'">
                  <!-- 图片缩略图 -->
                  <el-image
                    style="width: 25%; height: 50%"
                    fit="contain"
                    :src="scope.row[item.field]"
                    :preview-src-list="[scope.row[item.field]]"
                  />
                </div>
                <div v-else>
                  <span v-if="item.inputType == 'switch' && !item.colorStyle">
                    <el-switch
                      v-model.trim="scope.row[item.field]"
                      :active-value="1"
                      :inactive-value="0"
                      active-color="#5887fb"
                      inactive-color="#ccc"
                      @change="switchChange(scope.row, item.switchOption)"
                    />
                  </span>

                  <!-- 带单位 -->
                  <span v-else-if="item.inputType == 'anji-input'">{{
                    fieldValueByAnjiInput(scope.row[item.field], item)
                  }}</span>

                  <!-- 表格 a 合并 b上 -->
                  <span v-else-if="item.mergeColumn">{{ scope.row[item.field] }}({{ scope.row[item.mergeColumn] }})</span>

                  <!-- 没有单位 -->
                  <span
                    v-else-if="item.colorStyle"
                    :class="item.colorStyle[scope.row[item.editField]]"
                  >{{ fieldValueByRowRenderer(scope.row, item) }}</span>

                  <span v-else>{{ fieldValueByRowRenderer(scope.row, item) }}</span>
                </div>
              </template>
            </el-table-column>
          </template>

          <!-- 操作栏 -->
          <el-table-column
            align="center"
            fixed="right"
            label="操作"
            :width="
              option.buttons.customButton && option.buttons.customButton.operationWidth
                ? option.buttons.customButton.operationWidth
                : 100
            "
          >
            <template slot-scope="scope">
              <slot name="view" :msg="scope.row" />
              <slot name="edit" :msg="scope.row" />
              <slot name="detail" :msg="scope.row" />
              <slot name="publish" :msg="scope.row" />
              <slot name="delete" :msg="scope.row" />
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination">
        <el-pagination
          v-show="total > 0"
          background
          :current-page.sync="queryParams.pageNum"
          :page-sizes="$pageSizeAll"
          :page-size="queryParams.pageSize"
          layout="total, prev, pager, next, jumper, sizes"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <slot name="pageSection" />
  </div>
</template>

<style lang="scss" scoped>
.page-baseContainer,
.page-appContainer {
  height: calc(100vh - 50px);
  padding: 10px;
  box-sizing: border-box;
  background: #f3f7f9;
  .right-container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .sarchForm {
    margin-bottom: 10px;
    padding: 18px 8px 0 10px;
    background: #fff;
  }
  .el-table {
    .el-table__header thead tr,
    .el-table__header thead tr th {
      background-color: #f6f7fa;
      font-weight: 400;
    }
    .cell,
    td div {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .el-dropdown {
    font-size: 12px;
    display: inline;
    color: #5887fb;
    cursor: pointer;
  }
  .el-dropdown-menu--mini .el-dropdown-menu__item {
    min-width: 80px;
    max-width: 110px;
    float: right;
    .el-button--text {
      float: right;
    }
    &:hover {
      background: none !important;
    }
    .el-button--mini {
      float: right;
    }
    .el-button + .el-button {
      margin-left: 0 !important;
      float: right;
    }
  }

  .pagination {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin-top: 10px;
    background: #fff;
    padding: 10px 0;
  }
  .anji_curd_table {
    height: 100%;
  }

  .style-btn {
    pointer-events: none;
  }
}

.page-baseContainer {
  position: relative;
  .left-container {
    // width: 25%;
    position: absolute;
    top: 0;
    left: 0;
    background: transparent;
    border-radius: 4px 0px 0px 4px;
    padding: 10px;
    padding-right: 0px;
    // overflow: hidden;
    height: 100%;
    transition: all 0.1s linear;
    .toggle-btn {
      z-index: 1;
      position: absolute;
      top: 50%;
      left: 100%;
      cursor: pointer;
      user-select: none;
      background: rgba($color: #000000, $alpha: 0.1);
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      padding: 5px;
    }
    .el-card {
      height: 100%;
      .el-card__body {
        padding: 10px;
        height: 100%;
        display: flex;
        flex-direction: column;
        .el-tree {
          flex: 1;
          overflow: auto;
        }
      }
    }
  }
  .right-container {
    // width: 75%;
    position: absolute;
    top: 0;
    right: 0;
    background: transparent;
    border-radius: 0px 4px 4px 0px;
    padding: 10px;
    height: calc(100vh - 50px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: all 0.1s linear;
  }
}
</style>
