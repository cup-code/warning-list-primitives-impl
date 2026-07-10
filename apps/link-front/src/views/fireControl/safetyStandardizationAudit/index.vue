<script>
import { pageQuerySafeLibEvalItemByUser } from '@/http/fireControl-api'
import EditDialog from './components/EditDialog'
// import { rowRenderStatus } from 'link-sdk'
export default {
  components: {
    EditDialog,
  },
  data() {
    const blankOptions = [
      { label: '是', value: true },
      { label: '否', value: false },
    ]
    const statusOptions = [
      { label: '已自评', value: '已自评' },
      { label: '未自评', value: '未自评' },
    ]
    return {
      dialogVisible: false,
      dataSource: {},
      crudOption: {
        labelWidth: '90px',
        queryFormFields: [
          {
            inputType: 'input',
            label: '关键字',
            field: 'fuzzyQuery',
            placeholder: '考评内容、考评办法',
          },
          {
            inputType: 'anji-select',
            label: '自评状态',
            field: 'reviewStatus',
            placeholder: '请选择',
            anjiSelectOption: {
              localOptions: statusOptions,
              label: 'label',
              option: 'value',
            },
          },
          {
            inputType: 'anji-select',
            label: '是否空项',
            field: 'isBlank',
            placeholder: '请选择',
            anjiSelectOption: {
              localOptions: blankOptions,
              label: 'label',
              option: 'value',
            },
          },
          {
            inputType: 'anji-select',
            label: '是否扣分', // '扣分项'
            field: 'isDeduct',
            placeholder: '请选择',
            anjiSelectOption: {
              localOptions: blankOptions,
              label: 'label',
              option: 'value',
            },
          },
          {
            inputType: 'anji-tree',
            anjiTreeOption: {
              isOpen: false,
              enableFilter: true,
              url: '/fireControl/safeLibEval/getAllType',
              props: {
                value: 'id',
                label: 'typeName',
                children: 'children',
              },
            },
            label: '安全标准类别',
            field: 'typeId',
            canDo: false,
            subLabel: {
              field: 'score',
              // prefix:'总分值',
              suffix: '分',
              level: 1,
            },
          },
        ],

        // 操作按钮
        buttons: {
          customButton: {
            operationWidth: 200, // 操作列 的 宽度
          },
          query: {
            api: pageQuerySafeLibEvalItemByUser, // 查询接口
          },
        },

        // 表格列
        columns: [
          {
            label: '',
            field: 'id',
            primaryKey: true, // 根据主键查询详情或者根据主键删除时, 主键的
            tableHide: true, // 表格中不显示
            editHide: true, // 编辑弹框中不显示
          },
          {
            label: '所属公司',
            field: 'companyName',
            minWidth: 200,
          },
          {
            label: '考评类目',
            field: 'categoryName',
          },
          {
            label: '考评项目',
            field: 'itemName',
          },
          {
            label: '考评内容',
            field: 'evalContent',
          },
          {
            label: '考评办法',
            field: 'evalMeasure',
            minWidth: 300,
          },
          {
            label: '自评/评审描述',
            field: 'evalDesc',
            minWidth: 150,
          },
          {
            label: '是否空项',
            field: 'isBlank',
            fieldTableRowRenderer(row) {
              return row.isBlank === true ? '是' : row.isBlank === false ? '否' : ''
            },
          },
          {
            label: '标准分值',
            field: 'standardScore',
          },
          {
            label: '实际得分',
            field: 'realScore',
          },
          {
            label: '评审人部门',
            field: 'reviewDeptName',
          },
          {
            label: '评审人',
            field: 'reviewUserName',
          },
          {
            label: '自评状态',
            field: 'reviewStatus',
            vHtml: true,
            fieldTableRowRenderer(row) {
              return this.$rowRenderStatus(row.reviewStatus)
            },
          },
        ],
      },
      formDisabled: false,
      dialogTitle: '安全标准化自评',
      formStatus: '',
    }
  },
  created() {},
  methods: {
    openDialog(type, row) {
      this.formDisabled = type === 'view'
      if (type === 'view') {
        this.dialogTitle = '查看安全标准化自评'
        this.dataSource = row.msg
        this.dialogVisible = true
      }
      else if (type === 'edit') {
        this.dialogTitle = '编辑安全标准化自评'
        this.dataSource = row.msg
        this.dialogVisible = true
      }
    },
    refreshList() {
      this.$refs.listPage.handleQueryForm('query')
      this.$refs.listPage.handleQueryTree()
    },
    // 弹窗关闭
    dialogClose() {
      this.dialogVisible = false
      this.dataSource = {}
    },
  },
}
</script>

<template>
  <!-- 安全标准化评审-具体人员 -->
  <KyBasePage ref="listPage" :option="crudOption">
    <template slot="view" slot-scope="props">
      <el-button type="text" @click="openDialog('view', props)">
        查看
      </el-button>
    </template>
    <template
      v-if="(props.msg || {}).publishStatus !== '审核通过'"
      slot="edit"
      slot-scope="props"
    >
      <el-button type="text" @click="openDialog('edit', props)">
        编辑
      </el-button>
    </template>
    <template #pageSection>
      <EditDialog
        v-if="dialogVisible"
        width="80%"
        :title="dialogTitle"
        :visible="dialogVisible"
        :disabled="formDisabled"
        :dataSource="dataSource"
        :formStatus="formStatus"
        labelWidth="100px"
        @handleClose="dialogClose"
        @refreshList="refreshList"
      />
    </template>
  </KyBasePage>
</template>
