<script>
import {
  deleteSafeLibEvalItem,
  deleteSafeLibEvalType,
  pageQuerySafeLibEvalItem,
  saveOrUpdateSafeLibEvalType,
} from '@/http/fireControl-api'
import EditDialog from './components/EditDialog'

export default {
  components: {
    EditDialog,
  },
  data() {
    return {
      dialogVisible: false,
      dataSource: {},
      dialoagFormFields: [
        {
          type: 'input-number',
          label: '序号',
          prop: 'sortOrder',
          span: 12,
          rules: [{ required: true, message: '不能为空', trigger: 'blur' }],
        },
        {
          type: 'selectTree',
          label: '上级类别',
          prop: 'parentId',
          span: 12,
          url: '/fireControl/safeLibEval/getAllType',
          props: {
            value: 'id',
            label: 'typeName',
            children: 'children',
          },
        },
        {
          type: 'input',
          label: '考评名称',
          prop: 'typeName',
          span: 12,
          rules: [{ required: true, message: '不能为空', trigger: 'blur' }],
          firstLevel: 2,
        },
        {
          type: 'selectTree',
          label: '公司名称',
          prop: 'companyId',
          span: 12,
          clearable: true,
          rules: [{ required: true, message: '不能为空', trigger: 'blur' }],
          url: '/sysCompany/getSubordinateCompany',
          props: {
            value: 'id',
            label: 'companyName',
            children: 'children',
          },
          firstLevel: 1,
          labelInValue: 'typeName',
        },
        {
          type: 'input-number-pure',
          label: '总分',
          prop: 'score',
          span: 12,
          rules: [{ required: true, message: '不能为空', trigger: 'blur' }],
          firstLevel: 1,
        },
      ],
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
            canDo: true,
            dialog: {
              width: '50%',
              formFields: [],
              dataSource: {},
              api: saveOrUpdateSafeLibEvalType,
              dialogTitle: '安全标准类别',
            },
            delApi: deleteSafeLibEvalType,
            levelLimit: 3,
            openDialogSuccess: this.openDialogSuccess,
            subLabel: {
              field: 'score',
              // prefix:'总分值',
              suffix: '分',
              level: 1,
            },
            saveExternalParams: {
              companyId: '',
            },
          },
        ],
        leftTreeClickCallback: this.leftTreeClickCallback,

        // 操作按钮
        buttons: {
          customButton: {
            operationWidth: 200, // 操作列 的 宽度
          },
          query: {
            api: pageQuerySafeLibEvalItem, // 查询接口
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
            label: '标准分值',
            field: 'standardScore',
          },
        ],
      },
      formDisabled: false,
      dialogTitle: '安全标准化自评',
      formStatus: '',
      currentNodeData: {},
      showAddBtn: false,
    }
  },
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
      else if (type === 'add') {
        this.dialogTitle = '新建安全标准化自评'
        this.dataSource = { ...this.currentNodeData }
        this.dialogVisible = true
      }
    },
    refreshList() {
      this.$refs.listPage.handleQueryForm('query')
      this.$refs.listPage.handleQueryTree()
    },
    // 删除
    deleteItem(row) {
      this.$confirm('确认要删除吗?', '提示', {
        type: 'warning',
      })
        .then(() => {
          deleteSafeLibEvalItem({ id: row.msg.id }).then(({ data }) => {
            if (data.code != '200') {
              this.$message.error(data.message || '删除失败!')
              return
            }
            else {
              this.$message.success('删除成功')
            }
            this.refreshList()
          })
        })
        .catch((e) => {
          e
        })
    },
    // 弹窗关闭
    dialogClose() {
      this.dialogVisible = false
      this.dataSource = {}
    },
    openDialogSuccess(type, data, level) {
      // 添加自评公司，安全标准类别
      const targetTreeFiled = this.crudOption.queryFormFields.filter(
        item => item.inputType == 'anji-tree',
      )[0]
      if (type == 'add' || (type == 'edit' && level == 1)) {
        targetTreeFiled.dialog.dialogTitle = type == 'add' ? '添加自评公司' : '编辑自评公司'
        targetTreeFiled.dialog.formFields = this.dialoagFormFields.filter(
          item => !item.firstLevel || item.firstLevel === 1,
        )
      }
      else {
        targetTreeFiled.dialog.dialogTitle
          = type == 'addSub' ? '新建安全标准类别' : '编辑安全标准类别'
        targetTreeFiled.dialog.formFields = this.dialoagFormFields.filter(
          item => !item.firstLevel || item.firstLevel === 2,
        )
      }
    },
    leftTreeClickCallback(queryParams, id, data, node) {
      if (node.level === 3) {
        this.showAddBtn = true
        this.currentNodeData = {
          category: node.parent.data.id,
          categoryName: node.parent.data.typeName,
          item: data.id,
          itemName: data.typeName,
          companyId: data.companyId, // node.parent.parent.data.companyId,
        }
      }
      else {
        this.showAddBtn = false
        this.currentNodeData = {}
      }
    },
  },
}
</script>

<template>
  <!-- 安全标准化评审库录入 -->
  <KyBasePage
    ref="listPage"
    :option="crudOption"
  >
    <template
      v-if="showAddBtn"
      #buttonLeftOnTable
    >
      <el-button
        type="primary"
        icon="el-icon-plus"
        plain
        @click="openDialog('add')"
      >
        新增
      </el-button>
    </template>
    <template
      slot="view"
      slot-scope="props"
    >
      <el-button
        type="text"
        @click="openDialog('view', props)"
      >
        查看
      </el-button>
    </template>
    <template
      slot="delete"
      slot-scope="props"
    >
      <el-button
        type="text"
        style="color: var(--ky-danger)"
        @click="deleteItem(props)"
      >
        删除
      </el-button>
    </template>
    <template
      v-if="(props.msg || {}).publishStatus !== '审核通过'"
      slot="edit"
      slot-scope="props"
    >
      <el-button
        type="text"
        @click="openDialog('edit', props)"
      >
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
