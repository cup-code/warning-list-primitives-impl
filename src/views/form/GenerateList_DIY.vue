<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import UserSelect from '@/components/userSelect'
import { isURL } from '@/utils/validate'
import { getAuthToken } from '@/utils/tab-session'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import TextTooltip from './components/TextTooltip.vue'
import GenerateForm from './GenerateForm'
import TreeSelectText from './TreeSelectText.vue'

export default {
  components: {
    UserSelect,
    SelectTree,
    TreeSelectText,
    GenerateForm,
    CompanyTree,
    TextTooltip,
  },
  data() {
    return {
      page: {
        currentPage: 1,
        total: 0,
        pageSize: 10,
      },
      header: {
        Authorization: getAuthToken(),
        clientChannel: 'WEB',
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
      compTreeData: [],
      hideLeft: false,
      treeWidth: '240px',
      conWidth: 'calc(100% - 240px)',
    }
  },
  computed: {
    showSearchBtn() {
      const searchs = this.dataBindFields.filter((field) => {
        return field.isSearch && field.type !== 'comp'
      })
      return searchs.length > 0
    },
    hasLeftCompTree() {
      const res = this.dataBindFields.find(
        field => field.isSearch && field.type == 'comp',
      )
      if (res) {
        this.treeWidth = '240px'
        this.conWidth = 'calc(100% - 240px)'
      }
      else {
        this.treeWidth = '0%'
        this.conWidth = '100%'
      }
      return res
    },
    getButtons() {
      return (
        this.options?.config?.actions?.filter((action) => {
          return (
            action.position.includes('1')
            && ($route.query.previewMode || !action.auth)
          )
        }) || []
      )
    },
    getActions() {
      return (
        this.options?.config?.actions?.filter((action) => {
          return (
            action.position.includes('2')
            && ($route.query.previewMode || !action.auth)
          )
        }) || []
      )
    },
  },
  watch: {
    hasLeftCompTree(val) {
      if (val) {
        // 请求公司树
        this.refreshTree()
      }
    },
  },
  mounted() {
    this.getPrefix()
    this.$http({
      url: `/form/make/queryById?id=${this.$route.query.id}`,
      method: 'get',
    }).then(({ data }) => {
      if (data.form.source) {
        this.options = JSON.parse(data.form.source)
      }
      else {
        //  this.options = {'list': [], 'config': {'labelWidth': 100, 'labelPosition': 'right', 'size': 'mini', 'customClass': ''}}
      }
      this.tableName = data.form.tableName
      this.dataBindFields = []
      this.generateModel(this.options.list)
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
              isKeySearch: genList[i].options.isKeySearch,
              colWidth: genList[i].options.colWidth,
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
      const params = this.params
      for (const p in params) {
        if (!params[p]) {
          delete params[p]
        }
      }
      this.$http({
        url: `/form/generate/list`,
        method: 'post',
        data: {
          formId: this.$route.query.id,
          params: JSON.stringify(params),
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
      // zbs: 对应自己实现的左侧树版本 --- begin
      // if(this.hasLeftCompTree) {
      //     this.$refs.compTree.setCurrentKey(null);
      //     this.params[this.hasLeftCompTree.model] = undefined;
      // }

      // this.$refs.searchForm.resetFields();
      // this.refreshList()
      // zbs: 对应自己实现的左侧树版本 --- end

      // zbs: 对应统一的公共组件左侧树版本 --- begin
      this.$refs.searchForm.resetFields()
      if (this.hasLeftCompTree) {
        this.$refs.companyTree.refreshTree()
        this.params[this.hasLeftCompTree.model] = undefined
      }
      this.refreshList()
      // zbs: 对应统一的公共组件左侧树版本 --- end
    },
    handleNodeClick(data) {
      this.params[this.hasLeftCompTree.model] = data.id
      this.refreshList()
    },
    // 获取树数据
    refreshTree() {
      this.$http({
        url: '/sysCompany/getSubordinateCompany',
        method: 'get',
      }).then(({ data }) => {
        this.compTreeData = this.setTreeData(data.result)
      })
    },
    treeNodeTap(data) {
      if (data) {
        this.params[this.hasLeftCompTree.model] = data.id
      }
      else {
        delete this.params[this.hasLeftCompTree.model]
      }
      this.refreshList()
    },
    toBreak(val) {
      if (val.split) {
        return val.split('\n').join('<br/>')
      }
      else {
        return val
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
        this.treeWidth = '240px'
        this.conWidth = 'calc(100% - 240px)'
      }
    },
  },
}
</script>

<template>
  <div class="generateList-diy">
    <div
      v-if="hasLeftCompTree"
      class="diy-left"
      :style="`width: ${treeWidth}`"
    >
      <!-- zbs: 自己实现的版本 -->
      <!-- <div class="scrollbar el-scrollbar">
                <div class="el-scrollbar__wrap">
                    <div class="el-scrollbar__view">
                        <el-tree
                            class="filter-tree"
                            :data="compTreeData"
                            :props="{
                                value: 'id',             // ID字段名
                                label: 'companyName',         // 显示名称
                                children: 'children'    // 子级字段名
                            }"
                            default-expand-all
                            :expand-on-click-node="false"
                            node-key="id"
                            highlight-current
                            @node-click="handleNodeClick"
                            ref="compTree"
                        />
                    </div>
                </div>
            </div> -->

      <!-- zbs: 使用统一的公共组件 -->
      <CompanyTree ref="companyTree" @treeNodeTap="treeNodeTap" />
      <div class="toggle-btn" @click="toggleLeftFn">
        {{ hideLeft ? "展开" : "隐藏" }}
      </div>
    </div>

    <div class="diy-right" :style="`width: ${conWidth}`">
      <el-form
        v-if="showSearchBtn"
        ref="searchForm"
        size="mini"
        :inline="true"
        class="query-form"
        :model="params"
        @keyup.enter.native="refreshList()"
        @submit.native.prevent
      >
        <!-- 关键字搜索框 -->
        <el-form-item
          v-if="dataBindFields.findIndex((item) => item.isKeySearch) > -1"
          label="关键字"
          prop="key_words_custom_value"
        >
          <el-input
            v-model="params.key_words_custom_value"
            size="mini"
            placeholder="关键字"
          />
        </el-form-item>

        <!-- 搜索框 -->
        <el-form-item
          v-for="(option, index) in dataBindFields.filter((field) => {
            return field.isSearch && field.type !== 'comp';
          })"
          :key="index"
          :prop="option.model"
          :label="option.name"
        >
          <user-select
            v-if="option.type === 'user'"
            v-model="params[`${option.model}`]"
            size="mini"
            @getValue="
              (value, label) => {
                params[`${option.model}`] = value;
              }
            "
          />

          <SelectTree
            v-else-if="option.type === 'office'"
            v-model="params[`${option.model}`]"
            size="mini"
            :props="{
              value: 'id', // ID字段名
              label: 'departmentName', // 显示名称
              children: 'childrenDepartment', // 子级字段名
            }"
            url="/sys/office/treeData"
            :clearable="true"
            :accordion="true"
            @getValue="
              (value) => {
                params[`${option.model}`] = value;
              }
            "
          />

          <SelectTree
            v-else-if="option.type === 'area'"
            v-model="params[`${option.model}`]"
            size="mini"
            :props="{
              value: 'id', // ID字段名
              label: 'name', // 显示名称
              children: 'children', // 子级字段名
            }"
            url="/sys/area/treeData"
            :clearable="true"
            :accordion="true"
            @getValue="
              (value) => {
                params[`${option.model}`] = value;
              }
            "
          />

          <el-select
            v-else-if="option.type === 'select' && option.options.dictType"
            v-model="params[`${option.model}`]"
            size="mini"
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
            size="mini"
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
                        size="mini"
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
                        size = "mini"
                        v-model="params[`${option.model}`]"
                    >
                    </el-switch> -->
          <!-- <el-slider
                        v-else-if="option.type === 'slider'"
                        size="mini"
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
      <el-dialog title="导入Excel" :visible.sync="isImportCollapse">
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
              :headers="header"
              :on-success="uploadSuccess"
              :data="{ formId: $route.query.id }"
              :show-file-list="true"
              :limit="1"
            >
              <el-button size="mini" type="primary">
                点击上传
              </el-button>
              <div slot="tip" class="el-upload__tip">
                只允许导入“xls”或“xlsx”格式文件！
              </div>
            </el-upload>
          </el-form-item>
        </el-form>
      </el-dialog>

      <div class="main-con">
        <div>
          <!-- <el-button v-if="$route.query.previewMode || hasPermission(`form:${tableName}:add`)" type="primary" size="mini" icon="el-icon-plus" @click="add()">新建</el-button>
                    <el-button v-if="$route.query.previewMode || hasPermission(`form:${tableName}:edit`)" type="warning" size="mini" icon="el-icon-edit-outline" @click="edit()" :disabled="dataListSelections.length != 1" plain>修改</el-button>
                    <el-button v-if="$route.query.previewMode || hasPermission(`form:${tableName}:del`)" type="danger"   size="mini" icon="el-icon-delete" @click="del()" :disabled="dataListSelections.length <= 0" plain>删除</el-button>
                    <el-button :disabled="dataListSelections.length != 1" v-for="(item, index) in options.config.actions.filter((action)=>{return action.position.indexOf('1') > -1 && ($route.query.previewMode || !action.auth || hasPermission(action.auth))})" :key="index"  size="mini" icon="el-icon-link"  @click="go(item)">
                        {{item.name}}
                    </el-button>
                    <el-button-group class="pull-right">
                        <el-button v-if="$route.query.previewMode || hasPermission(`form:${tableName}:import`)" type="default" size="mini" icon="el-icon-upload2" title="导入" @click="isImportCollapse = !isImportCollapse"></el-button>
                        <el-button v-if="$route.query.previewMode || hasPermission(`form:${tableName}:export`)" type="default" size="mini" icon="el-icon-download" title="导出" @click="exportExcel()"></el-button>
                        <el-button type="default" size="mini" icon="el-icon-refresh"  @click="refreshList" />
                    </el-button-group> -->

          <el-button
            type="primary"
            plain
            size="mini"
            icon="el-icon-plus"
            @click="add()"
          >
            新增
          </el-button>
          <el-button
            type="success"
            size="mini"
            icon="el-icon-upload2"
            title="导入"
            @click="isImportCollapse = !isImportCollapse"
          >
            excel导入
          </el-button>
          <el-button
            type="success"
            size="mini"
            icon="el-icon-download"
            title="导出"
            @click="exportExcel()"
          >
            excel导出
          </el-button>
          <!-- <el-button type="warning" size="mini" icon="el-icon-edit-outline" @click="edit()" :disabled="dataListSelections.length != 1" plain>修改</el-button> -->
          <!-- <el-button type="danger"   size="mini" icon="el-icon-delete" @click="del()" :disabled="dataListSelections.length <= 0" plain>删除</el-button> -->
          <el-button
            v-for="(item, index) in getButtons"
            :key="index"
            :disabled="dataListSelections.length != 1"
            size="mini"
            icon="el-icon-link"
            @click="go(item)"
          >
            {{ item.name }}
          </el-button>
          <!-- <el-button type="success" size="mini" icon="el-icon-upload2" @click="exportExcel">excel导出</el-button> -->
          <el-button-group class="pull-right">
            <!-- <el-button type="default" size="mini" icon="el-icon-refresh" @click="refreshList" /> -->
          </el-button-group>
        </div>

        <el-table
          v-loading="loading"
          :data="dataList"
          size="mini"
          class="table"
          style="width: 100%"
          :header-cell-style="{ background: '#f5f5f5' }"
          height="100%"
          @selection-change="selectionChangeHandle"
          @sort-change="sortChangeHandle"
        >
          <!-- <el-table-column type="selection" header-align="center" align="center" width="50" /> -->

          <el-table-column
            v-for="(option, index) in dataBindFields.filter((item) => {
              return item.isShow;
            })"
            :key="index"
            :prop="option.model"
            :sortable="option.isSort ? 'custom' : false"
            :label="option.name"
            :width="option.colWidth"
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
                  v-for="(item, index) in JSON.parse(
                    scope.row[`${option.model}`] || '[]',
                  )"
                  :key="index"
                  style="height: 50px; width: 50px; margin-right: 10px"
                  :src="filePrefix + item.url"
                  :preview-src-list="
                    JSON.parse(scope.row[`${option.model}`]).map((item) => {
                      return filePrefix + item.url;
                    })
                  "
                />
              </div>
              <div v-else-if="option.type === 'fileupload'">
                <a
                  v-for="(item, index) in JSON.parse(
                    scope.row[`${option.model}`] || '[]',
                  )"
                  :key="index"
                  :href="filePrefix + item.url"
                  target="_blank"
                >
                  {{
                    decodeURIComponent(item.url.substring(item.url.lastIndexOf("/") + 1))
                  }}
                </a>
              </div>
              <div v-else-if="option.type === 'dict'">
                {{
                  $dictUtils.getDictLabel(
                    `${option.options.dictType}`,
                    scope.row[`${option.model}`],
                  )
                }}
              </div>
              <div v-else-if="option.type === 'selectTree'">
                <TreeSelectText
                  v-model="scope.row[`${option.model}`]"
                  size="mini"
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
                  v-for="(item, index) in JSON.parse(
                    scope.row[`${option.model}`] || '[]',
                  )"
                  :key="index"
                >
                  {{ $dictUtils.getDictLabel(`${option.options.dictType}`, item) }}
                  <span
                    v-if="
                      index + 1
                        !== JSON.parse(scope.row[`${option.model}`] || '[]').length
                    "
                  >
                    |
                  </span>
                </span>
              </div>

              <div
                v-else-if="
                  option.type === 'select'
                    && option.options.remote === 3
                    && option.options.multiple
                "
              >
                <span
                  v-for="(item, index) in JSON.parse(
                    scope.row[`${option.model}`] || '[]',
                  )"
                  :key="index"
                >
                  {{ $dictUtils.getDictLabel(`${option.options.dictType}`, item) }}
                  <span
                    v-if="
                      index + 1
                        !== JSON.parse(scope.row[`${option.model}`] || '[]').length
                    "
                  >
                    |
                  </span>
                </span>
              </div>
              <div
                v-else-if="
                  option.type === 'select'
                    && option.options.remote === 3
                    && !option.options.multiple
                "
              >
                {{
                  $dictUtils.getDictLabel(
                    `${option.options.dictType}`,
                    scope.row[`${option.model}`],
                  )
                }}
              </div>

              <div v-else-if="option.type === 'radio' && option.options.remote === 3">
                {{
                  $dictUtils.getDictLabel(
                    `${option.options.dictType}`,
                    scope.row[`${option.model}`],
                  )
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
                    @click="view(scope.row.id)"
                  >
                    {{ scope.row[`${option.model}`] || "" }}
                  </el-link>
                </div>
                <!-- <span v-else>{{scope.row[`${option.model}`] === undefined ? '' : scope.row[`${option.model}`]}} </span> -->
                <!-- <rich-text v-else :des="scope.row[`${option.model}`] === undefined ? '' : scope.row[`${option.model}`]"></rich-text> -->
                <!-- <span v-else style="overflow: hidden; text-overflow: ellipsis; display: inline-block; white-space: nowrap; width: 100%;">{{scope.row[`${option.model}`] === undefined ? '' : scope.row[`${option.model}`]}} </span> -->

                <!-- 不管溢出与否，都有tooltip -->
                <!-- <el-tooltip v-else>
                                    <div slot="content" v-html="scope.row[`${option.model}`] === undefined ? '' : toBreak(scope.row[`${option.model}`])">
                                    </div>
                                    <span style="overflow: hidden; text-overflow: ellipsis; display: inline-block; white-space: nowrap; width: 100%;">{{scope.row[`${option.model}`] === undefined ? '' : scope.row[`${option.model}`]}} </span>
                                </el-tooltip> -->

                <!-- 只有溢出才有tooltip -->
                <TextTooltip v-else overflow>
                  <div
                    slot="content"
                    v-html="
                      scope.row[`${option.model}`] === undefined
                        ? ''
                        : toBreak(scope.row[`${option.model}`])
                    "
                  />
                  <span
                    style="
                      overflow: hidden;
                      text-overflow: ellipsis;
                      display: inline-block;
                      white-space: nowrap;
                      width: 100%;
                    "
                  >{{
                    scope.row[`${option.model}`] === undefined
                      ? ""
                      : scope.row[`${option.model}`]
                  }}
                  </span>
                </TextTooltip>
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
                size="mini"
                @click="view(scope.row.id)"
              >
                查看
              </el-button>
              <el-button
                type="text"
                style="color: var(--ky-warning)"
                size="mini"
                @click="edit(scope.row.id)"
              >
                修改
              </el-button>
              <el-button
                type="text"
                size="mini"
                style="color: var(--ky-danger)"
                @click="del(scope.row.id)"
              >
                删除
              </el-button>
              <el-button
                v-for="(item, index) in getActions"
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
        <GenerateForm ref="previewForm" @refreshDataList="refreshList" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.generateList-diy {
  height: calc(100vh - 50px);
  background: #f3f7f9;
  display: flex;
  position: relative;
  .diy-left {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    padding: 10px;
    padding-right: 0px;

    .title {
      padding-top: 10px;
    }
    .scrollbar {
      flex: 1;
      .el-scrollbar__wrap {
        overflow: auto !important;
        .filter-tree {
          margin-top: 15px;
          font-size: 14px;
          .el-tree-node__label {
            font-size: 14px;
          }
        }
      }
    }
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
    .leftTree {
      height: 100% !important;
    }
  }
  .diy-right {
    position: absolute;
    top: 0;
    right: 0;
    flex: 1;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 10px;

    .query-form {
      margin-bottom: 10px;
      padding: 18px 8px 0 10px;
      background: #fff;
    }

    .main-con {
      background: #fff;
      flex: 1;
      overflow: hidden;
      padding: 10px;
      display: flex;
      flex-direction: column;
      position: relative;

      .pull-right {
        float: right;
      }

      .el-table {
        flex: 1;
        margin: 10px 0;
        .el-button + .el-button {
          margin-left: 5px;
        }
      }

      .el-pagination {
        text-align: right;
        padding: 0;
        .el-pagination__sizes {
          margin-right: 0;
          .el-input {
            margin-right: 0;
          }
        }
      }
    }
  }
}
.el-tooltip__popper {
  max-width: 400px;
  max-height: 50%;
  overflow: hidden;
}
</style>
