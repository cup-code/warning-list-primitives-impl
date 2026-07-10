<script>
import { pick } from 'lodash'
import Sortable from 'sortablejs'
import SelectTree from '@/components/treeSelect/treeSelect'
import {
  getContentByIdFn,
  getDictListFn,
  getQueryConfigFn,
  getTreetFn,
  saveContentFn,
} from '@/http/safe-production/genCode/table-list-api'
import GenGridForm from './GenGridForm'
import GenJavaPropertyForm from './GenJavaPropertyForm'

export default {
  components: {
    SelectTree,
    GenGridForm,
    GenJavaPropertyForm,
  },
  data() {
    return {
      config: '',
      dictList: {},
      tableList: [],
      dataListSelections: [],
      dataSourceTree: [],
      baseTableField: [
        'id',
        'create_by',
        'update_by',
        'create_date',
        'update_date',
        'remarks',
        'del_flag',
      ],
      baseTreeField: [
        'id',
        'create_by',
        'update_by',
        'create_date',
        'update_date',
        'remarks',
        'del_flag',
        'parent_id',
        'parent_ids',
        'name',
        'sort',
      ],
      step: 0,
      visible: false,
      method: '',
      title: '新增',
      currRow: '',
      initColumnList: [
        {
          sort: '0',
          isInsert: '1',
          isEdit: '0',
          name: 'id',
          comments: '主键',
          jdbcType: 'varchar(64)',
          isPk: '1',
          javaType: 'String',
          javaField: 'id',
          isForm: '0',
          showType: 'input',
          dictType: '',
          fieldLabels: '',
          fieldKeys: '',
          searchLabel: '',
          searchKey: '',
          isNull: '0',
          validateType: '',
          minLength: '',
          maxLength: '',
          minValue: '',
          maxValue: '',
          isList: '0',
          isQuery: '0',
          queryType: '=',
        },
        {
          sort: '1',
          isInsert: '1',
          isEdit: '0',
          name: 'create_by',
          comments: '创建者',
          jdbcType: 'varchar(64)',
          isPk: '0',
          javaType: 'String',
          javaField: 'createBy.id',
          isForm: '0',
          showType: 'input',
          dictType: '',
          fieldLabels: '',
          fieldKeys: '',
          searchLabel: '',
          searchKey: '',
          isNull: '0',
          validateType: '',
          minLength: '',
          maxLength: '',
          minValue: '',
          maxValue: '',
          isList: '0',
          isQuery: '0',
          queryType: '=',
        },
        {
          sort: '2',
          isInsert: '1',
          isEdit: '0',
          name: 'create_date',
          comments: '创建时间',
          jdbcType: 'datetime',
          isPk: '0',
          javaType: 'java.util.Date',
          javaField: 'createDate',
          isForm: '0',
          showType: 'dateselect',
          dictType: '',
          fieldLabels: '',
          fieldKeys: '',
          searchLabel: '',
          searchKey: '',
          isNull: '0',
          validateType: '',
          minLength: '',
          maxLength: '',
          minValue: '',
          maxValue: '',
          isList: '0',
          isQuery: '0',
          queryType: '=',
        },
        {
          sort: '3',
          isInsert: '1',
          isEdit: '1',
          name: 'update_by',
          comments: '更新者',
          jdbcType: 'varchar(64)',
          isPk: '0',
          javaType: 'String',
          javaField: 'updateBy.id',
          isForm: '0',
          showType: 'input',
          dictType: '',
          fieldLabels: '',
          fieldKeys: '',
          searchLabel: '',
          searchKey: '',
          isNull: '0',
          validateType: '',
          minLength: '',
          maxLength: '',
          minValue: '',
          maxValue: '',
          isList: '0',
          isQuery: '0',
          queryType: '=',
        },
        {
          sort: '4',
          isInsert: '1',
          isEdit: '1',
          name: 'update_date',
          comments: '更新时间',
          jdbcType: 'datetime',
          isPk: '0',
          javaType: 'java.util.Date',
          javaField: 'updateDate',
          isForm: '0',
          showType: 'dateselect',
          dictType: '',
          fieldLabels: '',
          fieldKeys: '',
          searchLabel: '',
          searchKey: '',
          isNull: '0',
          validateType: '',
          minLength: '',
          maxLength: '',
          minValue: '',
          maxValue: '',
          isList: '0',
          isQuery: '0',
          queryType: '=',
        },
        {
          sort: '5',
          isInsert: '1',
          isEdit: '1',
          name: 'remarks',
          comments: '备注信息',
          jdbcType: 'nvarchar(255)',
          isPk: '0',
          javaType: 'String',
          javaField: 'remarks',
          isForm: '1',
          showType: 'textarea',
          dictType: '',
          fieldLabels: '',
          fieldKeys: '',
          searchLabel: '',
          searchKey: '',
          isNull: '1',
          validateType: '',
          minLength: '',
          maxLength: '',
          minValue: '',
          maxValue: '',
          isList: '1',
          isQuery: '0',
          queryType: '=',
        },
        {
          sort: '6',
          isInsert: '1',
          isEdit: '0',
          name: 'del_flag',
          comments: '逻辑删除标记（0：显示；1：隐藏',
          jdbcType: 'varchar(64)',
          isPk: '0',
          javaType: 'String',
          javaField: 'delFlag',
          isForm: '0',
          showType: 'radiobox',
          dictType: '',
          fieldLabels: '',
          fieldKeys: '',
          searchLabel: '',
          searchKey: '',
          isNull: '0',
          validateType: '',
          minLength: '',
          maxLength: '',
          minValue: '',
          maxValue: '',
          isList: '0',
          isQuery: '0',
          queryType: '=',
        },
      ],
      inputForm: {
        id: '',
        isSync: '0',
        name: '',
        dataSource: {
          id: 'master',
          name: '本地数据库',
          type: '',
        },
        comments: '',
        genIdType: '1',
        tableType: '0',
        className: '',
        parentTable: '',
        parentTableFk: '',
        columnList: [],
      },
    }
  },
  watch: {
    'inputForm.tableType': function inputFormTableType(value) {
      const names
        = `,${
          this.inputForm.columnList
            .map((item) => {
              return `${item.name},`
            })
            .join(',')}`
      if (value === '3' || value === '4') {
        if (!names.includes('parent_id')) {
          this.inputForm.columnList.push({
            sort: '',
            isInsert: '1',
            isEdit: '1',
            name: 'parent_id',
            comments: '父级编号',
            jdbcType: 'varchar(64)',
            isPk: '0',
            javaType: 'This',
            javaField: 'parent.id|name',
            isForm: '1',
            showType: 'treeselect',
            dictType: '',
            fieldLabels: '',
            fieldKeys: '',
            searchLabel: '',
            searchKey: '',
            isNull: '1',
            validateType: '',
            minLength: '',
            maxLength: '',
            minValue: '',
            maxValue: '',
            isList: '0',
            isQuery: '0',
            queryType: '=',
          })
        }
        if (!names.includes('parent_ids')) {
          this.inputForm.columnList.push({
            sort: '',
            isInsert: '1',
            isEdit: '1',
            name: 'parent_ids',
            comments: '所有父级编号',
            jdbcType: 'varchar(2000)',
            isPk: '0',
            javaType: 'String',
            javaField: 'parentIds',
            isForm: '0',
            showType: 'input',
            dictType: '',
            fieldLabels: '',
            fieldKeys: '',
            searchLabel: '',
            searchKey: '',
            isNull: '0',
            validateType: '',
            minLength: '',
            maxLength: '',
            minValue: '',
            maxValue: '',
            isList: '0',
            isQuery: '0',
            queryType: 'like',
          })
        }
        if (!names.includes('name')) {
          this.inputForm.columnList.push({
            sort: '',
            isInsert: '1',
            isEdit: '1',
            name: 'name',
            comments: '名称',
            jdbcType: 'varchar(100)',
            isPk: '0',
            javaType: 'String',
            javaField: 'name',
            isForm: '1',
            showType: 'input',
            dictType: '',
            fieldLabels: '',
            fieldKeys: '',
            searchLabel: '',
            searchKey: '',
            isNull: '0',
            validateType: '',
            minLength: '',
            maxLength: '',
            minValue: '',
            maxValue: '',
            isList: '1',
            isQuery: '1',
            queryType: 'like',
          })
        }
        if (!names.includes('sort')) {
          this.inputForm.columnList.push({
            sort: '',
            isInsert: '1',
            isEdit: '1',
            name: 'sort',
            comments: '排序',
            jdbcType: 'integer',
            isPk: '0',
            javaType: 'Integer',
            javaField: 'sort',
            isForm: '1',
            showType: 'input',
            dictType: '',
            fieldLabels: '',
            fieldKeys: '',
            searchLabel: '',
            searchKey: '',
            isNull: '0',
            validateType: 'isNumber',
            minLength: '',
            maxLength: '',
            minValue: '',
            maxValue: '',
            isList: '0',
            isQuery: '0',
            queryType: '=',
          })
        }
      }
      else {
        this.delRowByName('parent_id')
        this.delRowByName('parent_ids')
        this.delRowByName('name')
        this.delRowByName('sort')
      }
      if (value === '6') {
        if (!names.includes('proc_ins_id')) {
          this.inputForm.columnList.push({
            sort: '',
            isInsert: '1',
            isEdit: '1',
            name: 'proc_ins_id',
            comments: '流程实例id',
            jdbcType: 'varchar(64)',
            isPk: '0',
            javaType: 'String',
            javaField: 'procInsId',
            isForm: '0',
            showType: 'input',
            dictType: '',
            fieldLabels: '',
            fieldKeys: '',
            searchLabel: '',
            searchKey: '',
            isNull: '1',
            validateType: '',
            minLength: '',
            maxLength: '',
            minValue: '',
            maxValue: '',
            isList: '0',
            isQuery: '0',
            queryType: '=',
          })
        }
      }
      else {
        this.delRowByName('proc_ins_id')
      }
    },
  },
  methods: {
    init(method, id) {
      this.method = method
      this.inputForm.id = id
      if (method === 'add') {
        this.title = '新增表单'
      }
      else if (method === 'edit') {
        this.title = '修改表单'
      }
      else if (method === 'view') {
        this.title = '查看表单'
      }
      const params = {
        pageSize: -1,
        pageNo: 1,
      }
      getDictListFn(params).then(({ data }) => {
        this.dictList = data.page.list
      })
      getQueryConfigFn().then(({ data }) => {
        this.config = data.config
        this.tableList = data.tableList
      })
      getTreetFn()
        .then(({ data }) => {
          this.dataSourceTree = data.treeData
        })
        .then(() => {
          this.visible = true
          this.$nextTick(function () {
            this.inputForm.columnList = JSON.parse(JSON.stringify(this.initColumnList))
            this.inputForm.dataSource.id = 'master'
            this.inputForm.dataSource.type = this.dataSourceTree[0].children[0].dbType
            this.step = 0
            this.$refs.inputForm.resetFields()
            setTimeout(() => {
              this.rowDrop()
            }, 1000)
          })
        })
        .then(() => {
          if (method === 'edit' || method === 'view') {
            // 修改或者查看
            getContentByIdFn(this.inputForm.id).then(({ data }) => {
              this.inputForm = this.recover(this.inputForm, data.genTable)
              this.inputForm.columnList = []
              data.genTable.columnList.forEach((column) => {
                column = pick(
                  column,
                  'id',
                  'sort',
                  'isInsert',
                  'isEdit',
                  'name',
                  'comments',
                  'jdbcType',
                  'isPk',
                  'javaType',
                  'javaField',
                  'isForm',
                  'showType',
                  'dictType',
                  'fieldLabels',
                  'fieldKeys',
                  'searchLabel',
                  'searchKey',
                  'isNull',
                  'validateType',
                  'minLength',
                  'maxLength',
                  'minValue',
                  'maxValue',
                  'isList',
                  'isQuery',
                  'queryType',
                )
                this.inputForm.columnList.push(column)
              })
            })
          }
        })
    },
    querySearch(queryString, cb) {
      const dbType = this.inputForm.dataSource.type
      let restaurants = this.config.mysqlFieldType
      if (dbType === 'oracle') {
        restaurants = this.config.oracleFieldType
      }
      else if (dbType === 'mssql' || dbType === 'sqlserver') {
        restaurants = this.config.mssqlFieldType
      }
      else if (dbType === 'postgre') {
        restaurants = this.config.postGreSqlFieldType
      }
      cb(restaurants)
    },
    // 行拖拽
    rowDrop() {
      const tbody = document.querySelectorAll('.el-table__body-wrapper > table > tbody')[1]
      const _this = this
      Sortable.create(tbody, {
        handle: '.handle',
        animation: 150,
        onEnd: function onEnd(_ref5) {
          const newIndex = _ref5.newIndex
          const oldIndex = _ref5.oldIndex
          const currRow = _this.inputForm.columnList.splice(oldIndex, 1)[0]
          _this.inputForm.columnList.splice(newIndex, 0, currRow)
        },
      })
    },
    addRow() {
      const length = this.inputForm.columnList.size
      if (length === 0) {
        this.inputForm.columnList.push({
          sort: '',
          isInsert: '1',
          isEdit: '1',
          name: '',
          comments: '',
          jdbcType: 'varchar(64)',
          isPk: '0',
          javaType: 'String',
          javaField: '',
          isForm: '1',
          showType: 'input',
          dictType: '',
          fieldLabels: '',
          fieldKeys: '',
          searchLabel: '',
          searchKey: '',
          isNull: '1',
          validateType: '',
          minLength: '',
          maxLength: '',
          minValue: '',
          maxValue: '',
          isList: '1',
          isQuery: '0',
          queryType: '=',
        })
      }
      else {
        this.inputForm.columnList.splice(1, 0, {
          sort: '',
          isInsert: '1',
          isEdit: '1',
          name: '',
          comments: '',
          jdbcType: 'varchar(64)',
          isPk: '0',
          javaType: 'String',
          javaField: '',
          isForm: '1',
          showType: 'input',
          dictType: '',
          fieldLabels: '',
          fieldKeys: '',
          searchLabel: '',
          searchKey: '',
          isNull: '1',
          validateType: '',
          minLength: '',
          maxLength: '',
          minValue: '',
          maxValue: '',
          isList: '1',
          isQuery: '0',
          queryType: '=',
        })
      }
    },
    delRow() {
      this.dataListSelections.map((item) => {
        for (let i = 0; i < this.inputForm.columnList.length; i++) {
          if (this.inputForm.columnList[i] === item) {
            this.inputForm.columnList.splice(i, 1)
            break
          }
        }
      })
    },
    delRowByName(name) {
      for (let i = 0; i < this.inputForm.columnList.length; i++) {
        if (
          this.inputForm.columnList[i].name === name
          && !this.inputForm.columnList[i].id
        ) {
          this.inputForm.columnList.splice(i, 1)
          break
        }
      }
    },
    selectJavaType(row) {
      if (row.javaType && row.javaType.startsWith('com.')) {
        row.showSelect = true
        if (row.javaType.endsWith('User')) {
          row.showType = 'userselect'
        }
        else if (row.javaType.endsWith('Area')) {
          row.showType = 'areaselect'
        }
        else if (row.javaType.endsWith('Office')) {
          row.showType = 'officeselect'
        }
        else {
          row.showType = 'gridselect'
        }
        if (
          (this.inputForm.tableType !== '3'
            && this.inputForm.tableType !== '4'
            && !this.baseTableField.includes(row.name.toLowerCase()))
          || ((this.inputForm.tableType === '3' || this.inputForm.tableType === '4')
            && !this.baseTreeField.includes(row.name.toLowerCase()))
        ) {
          if (
            row.javaType.endsWith('User')
            || row.javaType.endsWith('Area')
            || row.javaType.endsWith('Office')
          ) {
            if (!row.javaField.split('.')[0]) {
              row.javaField = this.toUpTreeJavaField(row.name)
            }
            else if (row.javaField.split('.')[0].toLowerCase().endsWith('id')) {
              row.javaField
                = `${row.javaField
                  .split('.')[0]
                  .substring(0, row.javaField.split('.')[0].length - 2)}.id|name`
            }
            else {
              row.javaField = `${row.javaField.split('.')[0]}.id|name`
            }
          }
          else if (!row.javaField.includes('.')) {
            if (!row.javaField) {
              row.javaField = this.toUpJavaField(row.name)
            }
            else if (row.javaField.toLowerCase().endsWith('id')) {
              row.javaField
                = `${row.javaField.substring(0, row.javaField.length - 2)}.id`
            }
            else {
              row.javaField = `${row.javaField}.id`
            }
          }
        }
      }
      else {
        row.showSelect = false
        if (
          row.javaType === 'String'
          || row.javaType === 'Long'
          || row.javaType === 'Integer'
          || row.javaType === 'Double'
        ) {
          row.showType = 'input'
        }
        if (row.javaType === 'java.util.Date') {
          row.showType = 'dateselect'
        }
        if (
          row.showType === 'userselect'
          || row.showType === 'officeselect'
          || row.showType === 'areaselect'
        ) {
          row.showType = 'input'
        }
        if (
          (this.inputForm.tableType !== '3'
            && this.inputForm.tableType !== '4'
            && !this.baseTableField.includes(row.name.toLowerCase()))
          || ((this.inputForm.tableType === '3' || this.inputForm.tableType === '4')
            && !this.baseTreeField.includes(row.name.toLowerCase()))
        ) {
          row.javaField = row.javaField.split('.')[0]
        }
      }
    },
    showGridForm(row) {
      if (row.showType === 'gridselect') {
        this.$refs.gridForm.init(row)
      }
      else {
        this.$refs.gridForm.drawer = false
      }
    },
    getJavaFieldNames(value) {
      let name = this.currRow.javaField.split('.')[0]
      if (name === '') {
        name = this.toUpJavaField(this.currRow.name).split('.')[0]
      }
      this.currRow.javaField = `${name}.${value}`
    },
    showGenJavaPropertyForm(row, type) {
      this.currRow = row
      this.$refs.genJavaPropertyForm.init(row, type)
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val
    },
    toUpTreeJavaField(str) {
      const arr = str.split('_')
      let size = arr.length
      if (arr[arr.length - 1] === 'id') {
        size = size - 1
      }
      let javaField = arr[0]
      for (let i = 1; i < size; i++) {
        javaField = javaField + arr[i].charAt(0).toUpperCase() + arr[i].substring(1)
      }
      return `${javaField}.id|name`
    },
    toUpJavaField(str) {
      const arr = str.split('_')
      let size = arr.length
      if (arr[arr.length - 1] === 'id') {
        size = size - 1
      }
      let javaField = arr[0]
      for (let i = 1; i < size; i++) {
        javaField = javaField + arr[i].charAt(0).toUpperCase() + arr[i].substring(1)
      }
      return `${javaField}.id`
    },
    toUp(str) {
      const arr = str.split('_')
      for (let i = 1; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].substring(1)
      }
      return arr.join('')
    },
    next() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          let valid2 = true
          this.inputForm.columnList.forEach((item) => {
            if (this.step === 0 && item.name === '') {
              this.$message.error('列名不能为空')
              valid2 = false
              return
            }
            if (this.step === 0 && item.comments === '') {
              this.$message.error(
                '\u5217['.concat(item.name, ']\u7684\u8BF4\u660E\u4E0D\u80FD\u4E3A\u7A7A'),
              )
              valid2 = false
              return
            }
            if (this.step === 0 && item.jdbcType === '') {
              this.$message.error(
                '\u5217['.concat(
                  item.name,
                  ']\u7269\u7406\u7C7B\u578B\u4E0D\u80FD\u4E3A\u7A7A',
                ),
              )
              valid2 = false
              return
            }

            if (this.step === 0) {
              // 左树右表的附表
              if (
                this.inputForm.tableType === '5'
                && (!item.javaField || !item.javaField.endsWith('.id|name'))
                && item.name === this.inputForm.parentTableFk
              ) {
                item.javaField = this.toUpTreeJavaField(item.name) // 主附表的附表
              }
              else if (
                this.inputForm.tableType === '2'
                && (!item.javaField || !item.javaField.endsWith('.id'))
                && item.name === this.inputForm.parentTableFk
              ) {
                item.javaField = this.toUpJavaField(item.name)
              }
              else if (
                (!item.javaField || item.javaField.indexOf('.')) < 0
                && item.name === this.inputForm.parentTableFk
              ) {
                item.javaField = this.toUpJavaField(item.name)
              }
              else if (
                item.javaType
                && item.javaType.startsWith('com.')
                && (!item.javaField || !item.javaField.includes('.'))
              ) {
                if (item.javaField === '') {
                  item.javaField = this.toUpJavaField(item.name)
                }
                else {
                  if (item.javaField.toLowerCase().endsWith('id')) {
                    item.javaField
                      = `${item.javaField.substring(0, item.javaField.length - 2)}.id`
                  }
                  else {
                    item.javaField = `${item.javaField}.id`
                  }
                }
              }
              else if (!item.javaField) {
                item.javaField = this.toUp(item.name)
              }
            }

            if (item.javaType && item.javaType.startsWith('com.')) {
              item.showSelect = true
            }
            else {
              item.showSelect = false
            } // 左树右表的附表

            if (
              this.inputForm.tableType === '5'
              && item.name === this.inputForm.parentTableFk
            ) {
              item.isQuery = '1'
              item.showType = 'treeselect'
            }

            if (this.step === 1) {
              if (!item.javaType) {
                this.$message.error(
                  '\u5217['.concat(
                    item.name,
                    ']\u7684Java\u7C7B\u578B\u4E0D\u80FD\u4E3A\u7A7A',
                  ),
                )

                valid2 = false
                return false
              }

              if (!item.javaField) {
                this.$message.error(
                  '\u5217['.concat(
                    item.name,
                    ']\u7684Java\u5C5E\u6027\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A',
                  ),
                )

                valid2 = false
                return false
              }

              if (item.javaField.endsWith('.') || item.javaField.startsWith('.')) {
                this.$message.error(
                  'Java\u5C5E\u6027\u540D\u79F0\u3010'.concat(
                    item.javaField,
                    '\u3011\u975E\u6CD5',
                  ),
                )

                valid2 = false
                return false
              }

              if (
                item.javaType
                && item.javaType.startsWith('com.')
                && !item.javaField.includes('.')
              ) {
                this.$message.error(
                  'Java\u5C5E\u6027\u3010'.concat(
                    item.javaField,
                    '\u3011\u81F3\u5C11\u8981\u9009\u62E9\u4E00\u6761\u5173\u8054\u5B57\u6BB5',
                  ),
                )

                valid2 = false
                return false
              }
            }

            if (this.step === 2) {
              if (item.showType === 'gridselect') {
                if (
                  item.searchLabel === ''
                  || item.searchKey === ''
                  || item.fieldLabels === ''
                  || item.fieldKeys === ''
                ) {
                  this.$message.error(
                    '\u5217\u3010'.concat(
                      item.name,
                      '\u3011\u7684\u8868\u5355\u7C7B\u578B\u662F\u3010gridslect\u3011\uFF0C\u4F46\u662F\u4F60\u6CA1\u6709\u8BBE\u7F6Ejava\u5C5E\u6027\u6807\u7B7E\u6216\u8005\u68C0\u7D22\u6807\u7B7E\uFF0C\u8BF7\u8BBE\u7F6E\u3002',
                    ),
                  )

                  valid2 = false
                  return false
                }
              }
            }
          })

          if (valid2 && this.step < 4)
            this.step++
        }
      })
    },
    prev() {
      if (this.step > 0)
        this.step--
    },
    // 表单提交
    doSubmit() {
      let valid2 = true
      this.inputForm.columnList.forEach((item) => {
        if (
          this.inputForm.tableType === '5'
          && item.name === this.inputForm.parentTableFk
        ) {
          if (item.isQuery === '0') {
            this.$message.error(
              '\u5217\u3010'.concat(
                item.name,
                '\u3011\u4F5C\u4E3A\u5DE6\u6811\u53F3\u8868\u7684\u9644\u8868\u7684\u5916\u952E\uFF0C\u5B83\u7684\u67E5\u8BE2\u5C5E\u6027\u5FC5\u987B\u52FE\u9009\u3002',
              ),
            )
            valid2 = false
          } // 主附表的附表
        }
      })
      this.$refs.inputForm.validate((valid) => {
        if (valid && valid2) {
          saveContentFn(this.inputForm).then(({ data }) => {
            if (data && data.success) {
              this.$message.success(data.msg)
              this.visible = false
              this.$emit('refreshDataList')
            }
          })
        }
      })
    },
  },
}
</script>

<template>
  <el-dialog
    :title="title"
    :close-on-click-modal="false"

    fullscreen
    class="table-form"
    append-to-body
    :visible.sync="visible"
  >
    <el-steps
      :active="step"
      simple
      finish-status="success"
      style="margin: -30px -20px 10px -20px"
    >
      <el-step title="数据库表设置" />
      <el-step title="Java实体设置" />
      <el-step title="表单页面" />
      <el-step title="表单校验" />
      <el-step title="列表页面" />
    </el-steps>
    <el-form
      v-show="step === 0"
      ref="inputForm"
      size="small"
      :model="inputForm"
      label-width="120px"
      :disabled="method === 'view'"
    >
      <el-row :gutter="15">
        <el-col :span="12">
          <el-form-item
            label="表名"
            prop="name"
            :rules="[{ required: true, message: '表名不能为空', trigger: 'blur' }]"
          >
            <el-input v-model="inputForm.name" placeholder="请输入表名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="所属数据库"
            prop="dataSource.id"
            :rules="[
              {
                required: true,
                message: '所属数据库不能为空',
                trigger: 'blur',
              },
            ]"
          >
            <SelectTree
              v-if="visible"
              ref="dataSourceTree"
              :props="{
                value: 'id', // ID字段名
                label: 'label', // 显示名称
                children: 'children', // 子级字段名
              }"
              :data="dataSourceTree"
              :value="inputForm.dataSource.id"
              :label="inputForm.dataSource.name"
              :clearable="true"
              :accordion="true"
              :disabled="method !== 'add'"
              @getValue="
                (id, label, node) => {
                  (inputForm.dataSource.id = id),
                  (inputForm.dataSource.type = node ? node.dbType : '');
                }
              "
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="说明"
            prop="comments"
            :rules="[{ required: true, message: '说明不能为空', trigger: 'blur' }]"
          >
            <el-input v-model="inputForm.comments" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="主键策略"
            prop="genIdType"
            :rules="[{ required: true, message: '主键策略不能为空', trigger: 'blur' }]"
          >
            <el-select
              v-model="inputForm.genIdType"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in $dictUtils.getDictList('gen_id_type')"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="表类型"
            prop="tableType"
            :rules="[{ required: true, message: '表类型不能为空', trigger: 'blur' }]"
          >
            <el-select
              v-model="inputForm.tableType"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in $dictUtils.getDictList('table_type')"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="类名"
            prop="className"
            :rules="[{ required: true, message: '类名不能为空', trigger: 'blur' }]"
          >
            <el-input
              v-model="inputForm.className"
              placeholder="类名首字符必须大写"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="主表表名" prop="parentTable">
            <el-select
              v-model="inputForm.parentTable"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="(item, index) in tableList"
                :key="index"
                :label="item.nameAndComments"
                :value="item.name"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="当前表外键" prop="parentTableFk">
            <el-select
              v-model="inputForm.parentTableFk"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="(item, index) in inputForm.columnList"
                :key="index"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-row v-show="step === 0" style="margin-bottom: 10px">
      <el-button type="primary" @click="addRow">
        新增
      </el-button>
      <el-button type="danger" @click="delRow">
        删除
      </el-button>
    </el-row>
    <el-table
      v-show="step === 0"
      :data="inputForm.columnList"
      row-key="sort"
      height="500px"
      :header-cell-style="{ background: '#F6F7FA' }"
      @selection-change="selectionChangeHandle"
    >
      <el-table-column
        type="selection"
        align="center"
        width="50"
      />
      <el-table-column
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
      <el-table-column
        prop="name"
        width="200"
        label="列名"
      >
        <template slot-scope="scope">
          <el-input v-model="scope.row.name" />
        </template>
      </el-table-column>
      <el-table-column
        prop="comments"
        width="200"
        label="说明"
      >
        <template slot-scope="scope">
          <el-input v-model="scope.row.comments" />
        </template>
      </el-table-column>
      <el-table-column prop="jdbcType" label="物理类型">
        <template slot-scope="scope">
          <el-autocomplete
            v-model="scope.row.jdbcType"
            class="inline-input"
            :fetch-suggestions="querySearch"
            placeholder="请输入内容"
            style="width: 100%"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="isPk"
        width="200"
        label="主键"
      >
        <template slot-scope="scope">
          <el-checkbox
            v-model="scope.row.isPk"
            true-label="1"
            false-label="0"
          />
        </template>
      </el-table-column>
    </el-table>
    <el-table
      v-show="step === 1"
      :data="inputForm.columnList"
      :header-cell-style="{ background: '#F6F7FA' }"
    >
      <el-table-column
        prop="name"
        width="200"
        label="列名"
      />
      <el-table-column
        prop="comments"
        width="200"
        label="说明"
      />
      <el-table-column prop="javaType" label="Java类型">
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.javaType"
            placeholder="请选择"
            style="width: 100%"
            @change="selectJavaType(scope.row)"
          >
            <el-option
              v-for="(item, index) in config.javaTypeList"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="javaField" label="Java属性名称">
        <template slot-scope="scope">
          <el-input v-model="scope.row.javaField">
            <el-button
              v-if="scope.row.showSelect"
              slot="append"
              icon="el-icon-search"
              @click="showGenJavaPropertyForm(scope.row, 2)"
            />
          </el-input>
        </template>
      </el-table-column>
    </el-table>
    <el-table
      v-show="step === 2"
      :data="inputForm.columnList"
      :header-cell-style="{ background: '#F6F7FA' }"
    >
      <el-table-column
        prop="name"
        width="200"
        label="列名"
      />
      <el-table-column
        prop="comments"
        width="200"
        label="说明"
      />
      <el-table-column prop="isForm" label="表单显示">
        <template slot-scope="scope">
          <el-checkbox
            v-model="scope.row.isForm"
            true-label="1"
            false-label="0"
          />
        </template>
      </el-table-column>
      <el-table-column prop="showType" label="表单类型">
        <template slot-scope="scope">
          <div class="el-input el-input-group el-input-group--append">
            <el-select
              v-model="scope.row.showType"
              placeholder="请选择"
              style="width: 100%"
              @change="showGridForm(scope.row)"
            >
              <el-option
                v-for="(item, index) in config.showTypeList"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <div
              v-show="scope.row.showType === 'gridselect'"
              class="el-input-group__append"
            >
              <button
                type="button"
                class="el-button el-button--default"
                @click="showGridForm(scope.row)"
              >
                <i class="el-icon-search" />
              </button>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="dictType" label="字典类型">
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.dictType"
            placeholder="请选择"
            style="width: 100%"
            clearable
            filterable
          >
            <el-option
              v-for="(item, index) in dictList"
              :key="index"
              :label="`${item.dictName}:${item.dictCode}`"
              :value="item.dictCode"
            />
          </el-select>
        </template>
      </el-table-column>
    </el-table>
    <el-table
      v-show="step === 3"
      :data="inputForm.columnList"
      :header-cell-style="{ background: '#F6F7FA' }"
    >
      <el-table-column
        prop="name"
        width="200"
        label="列名"
      />
      <el-table-column
        prop="comments"
        width="200"
        label="说明"
      />
      <el-table-column
        prop="isNull"
        :width="150"
        label="可空"
      >
        <template slot-scope="scope">
          <el-checkbox
            v-model="scope.row.isNull"
            true-label="1"
            false-label="0"
          />
        </template>
      </el-table-column>
      <el-table-column prop="validateType" label="校验类型">
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.validateType"
            placeholder="请选择"
            style="width: 100%"
            clearable
            filterable
          >
            <el-option
              v-for="(item, index) in config.validateTypeList"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="minLength" label="最小长度">
        <template slot-scope="scope">
          <el-input v-model="scope.row.minLength" />
        </template>
      </el-table-column>
      <el-table-column prop="maxLength" label="最大长度">
        <template slot-scope="scope">
          <el-input v-model="scope.row.maxLength" />
        </template>
      </el-table-column>
      <el-table-column prop="minValue" label="最小值">
        <template slot-scope="scope">
          <el-input v-model="scope.row.minValue" />
        </template>
      </el-table-column>
      <el-table-column prop="maxValue" label="最大值">
        <template slot-scope="scope">
          <el-input v-model="scope.row.maxValue" />
        </template>
      </el-table-column>
    </el-table>
    <el-table
      v-show="step === 4"
      :data="inputForm.columnList"
      :header-cell-style="{ background: '#F6F7FA' }"
    >
      <el-table-column
        prop="name"
        width="200"
        label="列名"
      />
      <el-table-column
        prop="comments"
        width="200"
        label="说明"
      />
      <el-table-column prop="isList" label="列表字段">
        <template slot-scope="scope">
          <el-checkbox
            v-model="scope.row.isList"
            true-label="1"
            false-label="0"
          />
        </template>
      </el-table-column>
      <el-table-column prop="isQuery" label="查询">
        <template slot-scope="scope">
          <el-checkbox
            v-model="scope.row.isQuery"
            true-label="1"
            false-label="0"
          />
        </template>
      </el-table-column>
      <el-table-column prop="queryType" label="查询匹配方式">
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.queryType"
            placeholder="请选择"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="(item, index) in config.queryTypeList"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>
    </el-table>
    <span slot="footer" class="dialog-footer">
      <el-button
        :disabled="step === 0"
        size="small"
        @click="prev"
      >上一步</el-button>
      <el-button
        :disabled="step === 4"
        size="small"
        @click="next"
      >下一步</el-button>
      <el-button size="small" @click="visible = false">关闭</el-button>
      <el-button
        v-if="method !== 'view'"
        v-noMoreClick
        :disabled="step !== 4"
        type="primary"
        size="small"
        @click="doSubmit"
      >确定</el-button>
    </span>
    <gen-grid-form ref="gridForm" />
    <gen-java-property-form
      ref="genJavaPropertyForm"
      @getJavaFieldNames="getJavaFieldNames"
    />
  </el-dialog>
</template>

<style lang="scss" scoped>
.handle {
  cursor: pointer;
}
.table-form {
  margin: 15px 10px 10px 10px;
}
.table-form .el-dialog {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.table-form .el-dialog__body {
  height: 80%;
  overflow: auto;
}
</style>
