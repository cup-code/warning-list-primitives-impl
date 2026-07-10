<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import UserSelect from '@/components/userSelect'
import { isURL } from '@/utils/validate'
import GenerateForm from './GenerateForm'
import TreeSelectText from './TreeSelectText.vue'

export default {
  components: {
    UserSelect,
    SelectTree,
    TreeSelectText,
    GenerateForm,
  },
  data() {
    return {
      page: {
        currentPage: 1,
        total: 0,
        pageSize: 10,
      },
      params: {},
      title: '',
      tableName: '',
      dataList: [],
      options: {
        config: {
          actions: [],
        },
        list: [],
      },
      dataListSelections: [],
      dataBindFields: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      orderBy: '',
      isImportCollapse: false,
      loading: false,
    }
  },
  computed: {
    showSearchBtn() {
      const searchs = this.dataBindFields.filter((field) => {
        return field.isSearch
      })
      return searchs.length > 0
    },
  },
  mounted() {
    this.$http({
      url: `/form/make/queryById?id=${this.$route.query.id}`,
      method: 'get',
    }).then(({ data }) => {
      if (data.form.source) {
        this.options = JSON.parse(data.form.source)
        console.log(this.options)
      }
      else {
        //  this.options = {'list': [], 'config': {'labelWidth': 100, 'labelPosition': 'right', 'size': 'small', 'customClass': ''}}
      }
      this.tableName = data.form.tableName
      this.dataBindFields = []
      this.generateModel(this.options.list)
      console.log(this.dataBindFields)
      this.dataBindFields.forEach((option) => {
        if (option.isSearch) {
          this.$set(this.params, option.model, undefined)
        }
      })
      this.refreshList()
    })
  },
  methods: {
    generateModel(genList) {
      for (let i = 0; i < genList.length; i++) {
        if (genList[i].type === 'grid') {
          genList[i].columns.forEach((item) => {
            this.generateModel(item.list)
          })
        }
        else if (genList[i].type === 'tabs') {
          genList[i].tabs.forEach((item) => {
            this.generateModel(item.list)
          })
        }
        else if (genList[i].type === 'report') {
          genList[i].rows.forEach((row) => {
            row.columns.forEach((column) => {
              this.generateModel(column.list)
            })
          })
        }
        else {
          // 处理老版本没有dataBind值的情况，默认绑定数据
          if (genList[i].options.dataBind) {
            this.dataBindFields.push({
              model: genList[i].model,
              options: genList[i].options,
              name: genList[i].name,
              type: genList[i].type,
              isShow: genList[i].options.isShow,
              isSort: genList[i].options.isSort,
              isSearch: genList[i].options.isSearch,
            })
          }
        }
      }
      return this.dataBindFields
    },
    selectionChange(list) {
      this.selections = list
    },
    refreshList() {
      this.loading = true
      this.$http({
        url: `/form/generate/list`,
        method: 'post',
        data: {
          formId: this.$route.query.id,
          params: JSON.stringify(this.params),
          orderBy: this.orderBy,
          pageNo: this.pageNo,
          pageSize: this.pageSize,
        },
      }).then(({ data }) => {
        this.dataList = data.page.list
        this.total = data.page.count
        this.loading = false
      })
    },
    // 跳转
    go(item, row) {
      row
        = row
          || this.dataListSelections.map((item) => {
            return item.id
          })[0]
      let keyValue = item.paramValue
      if (/^\$\{.*\}$/.test(item.paramValue)) {
        const keyName = item.paramValue.match(/\$\{[a-z0-9]*\.+(\S*)\}/i)[1]
        keyValue = row[keyName]
      }
      if (isURL(item.link)) {
        this.$router.push({
          path: '/form/explorer',
          query: {
            title: item.name,
            iframeUrl: `${item.link}?${item.paramKey}=${keyValue}`,
          },
        })
      }
      else {
        this.$router.push({
          path: `${item.link}?${item.paramKey}=${keyValue}`,
          query: { title: item.name },
        })
      }
    },
    // 新增
    add() {
      this.$refs.previewForm.init('add', `${this.$route.query.id}`)
    },
    // 编辑
    edit(id) {
      id
        = id
          || this.dataListSelections.map((item) => {
            return item.id
          })[0]
      this.$refs.previewForm.init('edit', `${this.$route.query.id}`, id)
    },
    // 每页数
    sizeChangeHandle(val) {
      this.pageSize = val
      this.pageNo = 1
      this.refreshList()
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageNo = val
      this.refreshList()
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val
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
    // 查看
    view(id) {
      this.$refs.previewForm.init('view', `${this.$route.query.id}`, id)
    },
    del(id) {
      const ids
        = id
          || this.dataListSelections
            .map((item) => {
              return item.id
            })
            .join(',')
      this.$confirm(`确定删除所选项吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true
        this.$http({
          url: '/form/generate/delete',
          method: 'delete',
          params: { formId: this.$route.query.id, ids },
        }).then(({ data }) => {
          this.loading = false
          if (data && data.success) {
            this.$message.success(data.msg)
            this.refreshList()
          }
        })
      })
    },
    // 导入成功
    uploadSuccess(res, file) {
      if (res.success) {
        this.$message.success({
          dangerouslyUseHTMLString: true,
          message: res.msg,
        })
        this.refreshList()
      }
      else {
        this.$message.error(res.msg)
      }
    },
    // 下载模板
    downloadTpl() {
      this.$http({
        method: 'post',
        url: '/form/generate/import/template',
        data: {
          formId: this.$route.query.id,
        },
        responseType: 'blob',
      })
        .then((response) => {
          if (!response) {
            return
          }
          const link = document.createElement('a')
          link.href = window.URL.createObjectURL(new Blob([response.data]))
          link.target = '_blank'
          const filename = response.headers['content-disposition']
          link.download = decodeURI(filename)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        })
        .catch((error) => {})
    },
    exportExcel() {
      this.$http({
        method: 'post',
        url: '/form/generate/export',
        data: {
          formId: this.$route.query.id,
          params: JSON.stringify(this.params),
          orderBy: this.orderBy,
        },
        responseType: 'blob',
      })
        .then((response) => {
          if (!response) {
            return
          }
          const link = document.createElement('a')
          link.href = window.URL.createObjectURL(new Blob([response.data]))
          link.target = '_blank'
          const filename = response.headers['content-disposition']
          link.download = decodeURI(filename)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        })
        .catch((error) => {})
    },
    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.refreshList()
    },
  },
}
</script>

<template>
  <div class="generateList-form">
    <el-form
      v-if="showSearchBtn"
      ref="searchForm"
      size="small"
      :inline="true"
      class="query-form"
      :model="params"
      @keyup.enter.native="refreshList()"
      @submit.native.prevent
    >
      <!-- 搜索框 -->
      <el-form-item
        v-for="(option, index) in dataBindFields.filter(field => {
          return field.isSearch
        })"
        :key="index"
        :prop="option.model"
      >
        <user-select
          v-if="option.type === 'user'"
          v-model="params[`${option.model}`]"
          size="small"
          @getValue="
            (value, label) => {
              params[`${option.model}`] = value
            }
          "
        />

        <SelectTree
          v-else-if="option.type === 'office'"
          v-model="params[`${option.model}`]"
          size="small"
          :props="{
            value: 'id', // ID字段名
            label: 'name', // 显示名称
            children: 'children', // 子级字段名
          }"
          url="/sys/office/treeData"
          :clearable="true"
          :accordion="true"
          @getValue="
            value => {
              params[`${option.model}`] = value
            }
          "
        />

        <SelectTree
          v-else-if="option.type === 'area'"
          v-model="params[`${option.model}`]"
          size="small"
          :props="{
            value: 'id', // ID字段名
            label: 'name', // 显示名称
            children: 'children', // 子级字段名
          }"
          url="/sys/area/treeData"
          :clearable="true"
          :accordion="true"
          @getValue="
            value => {
              params[`${option.model}`] = value
            }
          "
        />

        <el-select
          v-else-if="option.type === 'select' && option.options.dictType"
          v-model="params[`${option.model}`]"
          size="small"
        >
          <el-option
            v-for="item in $dictUtils.getDictList(`${option.options.dictType}`)"
            :key="item.dictCode"
            :label="item.dictName"
            :value="item.dictCode"
          />
        </el-select>
        <el-select
          v-else-if="option.type === 'select' && !option.options.dictType"
          v-model="params[`${option.model}`]"
          size="small"
        >
          <el-option
            v-for="item in option.options.options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <!-- <el-rate
                    v-else-if="option.type === 'rate'"
                    v-model="params[`${option.model}`]"
                ></el-rate> -->
        <!-- <el-color-picker
                    v-else-if="option.type === 'color'"
                    size="small"
                    v-model="params[`${option.model}`]"
                ></el-color-picker> -->

        <!-- <el-select
                    v-else-if="option.type === 'select'"
                    v-model="params[`${option.model}`]"
                >
                    <el-option v-for="item in (options.remote ? remoteOptions : options.options)" :key="item.value" :value="item.value" :label="options.showLabel || options.remote?item.label:item.value"></el-option>
                </el-select> -->

        <!-- <el-switch
                    v-else-if="option.type === 'switch'"
                    size = "small"
                    v-model="params[`${option.model}`]"
                >
                </el-switch> -->
        <!-- <el-slider
                    v-else-if="option.type === 'slider'"
                    size="small"
                    v-model="params[`${option.model}`]"
                    ></el-slider> -->

        <el-time-picker
          v-else-if="option.type === 'time'"
          v-model="params[`${option.model}`]"
          size="mini"
          :placeholder="option.name"
        />

        <el-date-picker
          v-else-if="option.type === 'date'"
          v-model="params[`${option.model}`]"
          size="mini"
          :placeholder="option.name"
        />

        <el-input
          v-else
          v-model="params[`${option.model}`]"
          size="mini"
          :placeholder="option.name"
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-search"
          @click="refreshList()"
        >
          查询
        </el-button>
        <el-button
          size="mini"
          icon="el-icon-refresh-right"
          @click="resetSearch()"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 导入导出 -->
    <el-dialog
      title="导入Excel"
      :visible.sync="isImportCollapse"
    >
      <el-form
        ref="importForm"
        size="mini"
        :inline="true"
        class="query-form"
      >
        <el-form-item>
          <el-button
            type="default"
            size="mini"
            @click="downloadTpl()"
          >
            下载模板
          </el-button>
        </el-form-item>

        <el-form-item prop="loginName">
          <el-upload
            class="upload-demo"
            :action="`${$http.BASE_URL}/form/generate/import`"
            :on-success="uploadSuccess"
            :data="{ formId: $route.query.id }"
            :show-file-list="true"
          >
            <el-button
              size="mini"
              type="primary"
            >
              点击上传
            </el-button>
            <div
              slot="tip"
              class="el-upload__tip"
            >
              只允许导入“xls”或“xlsx”格式文件！
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
    </el-dialog>

    <div
      class="main-con"
      :style="showSearchBtn ? 'height:calc(100% - 76px)' : 'height:100%'"
    >
      <el-row>
        <!-- <el-button v-if="$route.query.previewMode || hasPermission(`form:${tableName}:add`)" type="primary" size="mini" icon="el-icon-plus" @click="add()">新建</el-button>
                <el-button v-if="$route.query.previewMode || hasPermission(`form:${tableName}:edit`)" type="warning" size="mini" icon="el-icon-edit-outline" @click="edit()" :disabled="dataListSelections.length != 1" plain>修改</el-button>
                <el-button v-if="$route.query.previewMode || hasPermission(`form:${tableName}:del`)" type="danger"   size="mini" icon="el-icon-delete" @click="del()" :disabled="dataListSelections.length <= 0" plain>删除</el-button>
                <el-button :disabled="dataListSelections.length != 1" v-for="(item, index) in options.config.actions.filter((action)=>{return action.position.indexOf('1') > -1 && ($route.query.previewMode || !action.auth || hasPermission(action.auth))})" :key="index"  size="mini" icon="el-icon-link"  @click="go(item)">
                    {{item.name}}
                </el-button>
                <el-button-group class="pull-right">
                    <el-button v-if="$route.query.previewMode || hasPermission(`form:${tableName}:import`)" type="default" size="small" icon="el-icon-upload2" title="导入" @click="isImportCollapse = !isImportCollapse"></el-button>
                    <el-button v-if="$route.query.previewMode || hasPermission(`form:${tableName}:export`)" type="default" size="small" icon="el-icon-download" title="导出" @click="exportExcel()"></el-button>
                    <el-button
                        type="default"
                        size="small"
                        icon="el-icon-refresh"
                        @click="refreshList">
                    </el-button>
                </el-button-group> -->

        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          @click="add()"
        >
          新建
        </el-button>
        <el-button
          type="warning"
          size="mini"
          icon="el-icon-edit-outline"
          :disabled="dataListSelections.length != 1"
          plain
          @click="edit()"
        >
          修改
        </el-button>
        <el-button
          type="danger"
          size="mini"
          icon="el-icon-delete"
          :disabled="dataListSelections.length <= 0"
          plain
          @click="del()"
        >
          删除
        </el-button>
        <el-button
          v-for="(item, index) in options.config.actions.filter(action => {
            return action.position.includes('1') && ($route.query.previewMode || !action.auth)
          })"
          :key="index"
          :disabled="dataListSelections.length != 1"
          size="mini"
          icon="el-icon-link"
          @click="go(item)"
        >
          {{ item.name }}
        </el-button>
        <el-button-group class="pull-right">
          <el-button
            type="default"
            size="small"
            icon="el-icon-refresh"
            @click="refreshList"
          />
        </el-button-group>
      </el-row>

      <el-table
        v-loading="loading"
        :data="dataList"
        size="mini"
        height="calc(100% - 84px)"
        class="table"
        @selection-change="selectionChangeHandle"
        @sort-change="sortChangeHandle"
      >
        <el-table-column
          type="selection"
          header-align="center"
          align="center"
          width="50"
        />

        <el-table-column
          v-for="(option, index) in dataBindFields.filter(item => {
            return item.isShow
          })"
          :key="index"
          :prop="option.model"
          show-overflow-tooltip
          :sortable="option.isSort ? 'custom' : false"
          :label="option.name"
        >
          <template slot-scope="scope">
            <div
              v-if="option.type === 'html'"
              v-html="scope.row[`${option.model}`]"
            />
            <div v-else-if="option.type === 'color'">
              <el-color-picker
                v-model="scope.row[`${option.model}`]"
                disabled
              />
            </div>
            <div v-else-if="option.type === 'editor'">
              <p v-html="$utils.unescapeHTML(scope.row[`${option.model}`] || '')" />
            </div>
            <div v-else-if="option.type === 'imgupload'">
              <el-image
                v-for="(item, index) in JSON.parse(scope.row[`${option.model}`] || '[]')"
                :key="index"
                style="height: 50px; width: 50px; margin-right: 10px"
                :src="item.url"
                :preview-src-list="
                  JSON.parse(scope.row[`${option.model}`]).map(item => {
                    return item.url
                  })
                "
              />
            </div>
            <div v-else-if="option.type === 'fileupload'">
              <a
                v-for="(item, index) in JSON.parse(scope.row[`${option.model}`] || '[]')"
                :key="index"
                :href="item.url"
                target="_blank"
              >
                {{ decodeURIComponent(item.url.substring(item.url.lastIndexOf('/') + 1)) }}
              </a>
            </div>
            <div v-else-if="option.type === 'dict'">
              {{
                $dictUtils.getDictLabel(`${option.options.dictType}`, scope.row[`${option.model}`])
              }}
            </div>
            <div v-else-if="option.type === 'selectTree'">
              <TreeSelectText
                v-model="scope.row[`${option.model}`]"
                size="small"
                :props="{
                  value: 'id', // ID字段名
                  label: 'name', // 显示名称
                  children: 'children', // 子级字段名
                }"
                :url="option.options.dataUrl"
                :clearable="true"
                :accordion="true"
              />
            </div>
            <div v-else-if="option.type === 'checkbox' && option.options.remote === 3">
              <span
                v-for="(item, index) in JSON.parse(scope.row[`${option.model}`] || '[]')"
                :key="index"
              >
                {{ $dictUtils.getDictLabel(`${option.options.dictType}`, item) }}
                <span v-if="index + 1 !== JSON.parse(scope.row[`${option.model}`] || '[]').length">
                  |
                </span>
              </span>
            </div>

            <div
              v-else-if="
                option.type === 'select' && option.options.remote === 3 && option.options.multiple
              "
            >
              <span
                v-for="(item, index) in JSON.parse(scope.row[`${option.model}`] || '[]')"
                :key="index"
              >
                {{ $dictUtils.getDictLabel(`${option.options.dictType}`, item) }}
                <span v-if="index + 1 !== JSON.parse(scope.row[`${option.model}`] || '[]').length">
                  |
                </span>
              </span>
            </div>
            <div
              v-else-if="
                option.type === 'select' && option.options.remote === 3 && !option.options.multiple
              "
            >
              {{
                $dictUtils.getDictLabel(`${option.options.dictType}`, scope.row[`${option.model}`])
              }}
            </div>

            <div v-else-if="option.type === 'radio' && option.options.remote === 3">
              {{
                $dictUtils.getDictLabel(`${option.options.dictType}`, scope.row[`${option.model}`])
              }}
            </div>
            <div v-else>
              <div v-if="index === 0">
                <!-- <el-link style="font-size: 12px;" type="primary" :underline="false" v-if="$route.query.previewMode || hasPermission(`form:${tableName}:edit`)" @click="edit(scope.row.id)">{{scope.row[`${option.model}`] || ''}} </el-link>
                                <el-link style="font-size: 12px;" type="primary" :underline="false" v-else-if="$route.query.previewMode || hasPermission(`form:${tableName}:view`)"  @click="view(scope.row.id)">{{scope.row[`${option.model}`] || ''}} </el-link>
                                <span v-else>{{scope.row[`${option.model}`] === undefined ? '' : scope.row[`${option.model}`]}} </span> -->

                <el-link
                  style="font-size: 12px"
                  type="primary"
                  :underline="false"
                  @click="edit(scope.row.id)"
                >
                  {{ scope.row[`${option.model}`] || '' }}
                </el-link>
              </div>
              <span v-else>{{
                scope.row[`${option.model}`] === undefined ? '' : scope.row[`${option.model}`]
              }}
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          :key="Math.random()"
          header-align="center"
          align="center"
          fixed="right"
          width="200"
          label="操作"
        >
          <template slot-scope="scope">
            <!-- <el-button v-if="$route.query.previewMode || hasPermission(`form:${tableName}:view`)" type="text" icon="el-icon-view" size="mini" @click="view(scope.row.id)">
                            查看
                        </el-button>
                        <el-button v-if="$route.query.previewMode || hasPermission(`form:${tableName}:edit`)" type="text" icon="el-icon-edit" size="mini" @click="edit(scope.row.id)">
                            修改
                        </el-button>
                        <el-button v-if="$route.query.previewMode || hasPermission(`form:${tableName}:del`)" type="text" size="mini" icon="el-icon-delete"  @click="del(scope.row.id)">
                            删除
                        </el-button>
                        <el-button v-for="(item, index) in options.config.actions.filter((action)=>{return action.position.indexOf('2') > -1 && ($route.query.previewMode || !action.auth || hasPermission(action.auth))})" :key="index"  type="text" size="mini" icon="el-icon-link"  @click="go(item, scope.row)">
                            {{item.name}}
                        </el-button> -->

            <el-button
              type="text"
              icon="el-icon-view"
              size="mini"
              @click="view(scope.row.id)"
            >
              查看
            </el-button>
            <el-button
              type="text"
              icon="el-icon-edit"
              size="mini"
              @click="edit(scope.row.id)"
            >
              修改
            </el-button>
            <el-button
              type="text"
              size="mini"
              icon="el-icon-delete"
              @click="del(scope.row.id)"
            >
              删除
            </el-button>
            <el-button
              v-for="(item, index) in options.config.actions.filter(action => {
                return (
                  action.position.includes('2') && ($route.query.previewMode || !action.auth)
                )
              })"
              :key="index"
              type="text"
              size="mini"
              icon="el-icon-link"
              @click="go(item, scope.row)"
            >
              {{ item.name }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        :current-page="pageNo"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="sizeChangeHandle"
        @current-change="currentChangeHandle"
      />

      <!-- 弹窗, 新增 / 修改 -->
      <GenerateForm
        ref="previewForm"
        @refreshDataList="refreshList"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.generateList-form {
  padding: 10px;
  height: calc(100vh - 50px);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  .query-form {
    box-shadow: 0 0 12px 2px rgba(0, 0, 0, 0.1);
    padding-left: 12px;
    padding-top: 12px;
    margin-bottom: 10px;
    .el-form-item {
      margin-bottom: 12px;
    }
    .el-form-item__label {
      font-size: 14px !important;
    }
  }
  .main-con {
    box-shadow: 0 0 12px 2px rgba(0, 0, 0, 0.1);
    flex: 1;
    padding: 10px;
    .pull-right {
      float: right;
    }
    .el-table {
      margin-top: 10px;
      margin-bottom: 10px;
      border-top: 1px solid #ebeef5;
      .el-table__header {
        thead tr {
          background-color: #f6f7fa;
          font-weight: 400;
          th {
            background-color: #f6f7fa;
            font-weight: 400;
          }
        }
      }
    }
    .el-pagination {
      text-align: right;
    }
  }
}
</style>
