<script>
import {
  deleteLicense,
  deleteLicenseType,
  getLicenseCategoryList,
  saveLicense,
  saveLicenseType,
} from '@/http/base-module/staffCertificate-api.js'
// 特殊作业枚举
const SPECIALWORK = [
  {
    id: '8811ff5a5979ccc2708e1d8c14221f38',
    parentId: 'e5b5c14b581567b4997fe6e13224ddc2',
    dictName: '动火作业',
    dictCode: 1001,
    sort: 1,
    remarks: '',
  },
  {
    id: '5eca673ef8f0e3fb1761080b9de6cb06',
    parentId: 'e5b5c14b581567b4997fe6e13224ddc2',
    dictName: '受限空间作业',
    dictCode: 1002,
    sort: 2,
    remarks: '',
  },
  {
    id: 'c30db2f956e5017f1444cda4d46f7ac2',
    parentId: 'e5b5c14b581567b4997fe6e13224ddc2',
    dictName: '登高作业',
    dictCode: 1003,
    sort: 3,
    remarks: '',
  },
  {
    id: 'ad418d9d460bc195246d28a81145b109',
    parentId: 'e5b5c14b581567b4997fe6e13224ddc2',
    dictName: '临时用电作业',
    dictCode: 1004,
    sort: 4,
    remarks: '',
  },
  {
    id: 'c23c28109a65559ce10429e39f6ee121',
    parentId: 'e5b5c14b581567b4997fe6e13224ddc2',
    dictName: '断路作业',
    dictCode: 1005,
    sort: 7,
    remarks: '',
  },
  {
    id: '2fcc7554e9fe79d1ac9199e623294a32',
    parentId: 'e5b5c14b581567b4997fe6e13224ddc2',
    dictName: '动土作业',
    dictCode: 1006,
    sort: 6,
    remarks: '',
  },
  {
    id: '0b8f7f66113fbccfdce9540b1318d175',
    parentId: 'e5b5c14b581567b4997fe6e13224ddc2',
    dictName: '吊装作业',
    dictCode: 1007,
    sort: 5,
    remarks: '',
  },
  {
    id: '20e39482dcfd3debf80f17d79473c19d',
    parentId: 'e5b5c14b581567b4997fe6e13224ddc2',
    dictName: '盲板抽堵作业',
    dictCode: 1008,
    sort: 8,
    remarks: '',
  },
]
// "特殊作业类型" 对应的 "作业方式"
const SPECIALTOWORK = {
  hotWork_type: 1001, // 动火作业
  confined_space_operation: 1002, // 受限空间作业
  ascend_operation: 1003, // 登高作业
  temporary_electricity_operation: 1004, // 临时用电作业
  open_circuit_operation: 1005, // 断路作业
  earth_moving_operation: 1006, // 动土作业
  crane_operation: 1007, // 吊装作业
  blind_plate_plugging_operation: 1008, // 盲板抽堵作业
}
export default {
  name: 'staffCertificate',
  components: {},
  data() {
    return {
      dialogVisible: false,
      dataSource: {},
      crudOption: {
        labelWidth: '70px',
        // 查询表单条件
        queryFormFields: [
          {
            inputType: 'input',
            label: '证照名称',
            field: 'categoryName',
            placeholder: '证照名称',
          },
          {
            inputType: 'anji-tree',
            anjiTreeOption: {
              isOpen: false,
              enableFilter: true,
              url: '/license/type/all',
              props: {
                value: 'id',
                label: 'typeName',
              },
            },
            label: '证照类型',
            field: 'typeId',
            canDo: true,
            dialog: {
              width: '50%',
              formFields: [
                {
                  type: 'input',
                  label: '编号',
                  prop: 'typeCode',
                  span: 12,
                  rules: [{ required: true, message: '不能为空', trigger: 'change' }],
                },
                {
                  type: 'input',
                  label: '名称',
                  prop: 'typeName',
                  span: 12,
                  rules: [{ required: true, message: '不能为空', trigger: 'change' }],
                },
                {
                  type: 'input-number',
                  label: '排序号',
                  prop: 'sort',
                  span: 12,
                  rules: [{ required: true, message: '不能为空', trigger: 'change' }],
                },
                {
                  type: 'textarea',
                  label: '备注',
                  prop: 'remarks',
                  span: 24,
                  rows: 2,
                  rules: [{ required: false, message: '', trigger: 'blur' }],
                },
              ],
              dataSource: {},
              api: saveLicenseType,
            },
            delApi: deleteLicenseType,
          },
        ],
        // 操作按钮
        buttons: {
          customButton: {
            operationWidth: 150, // 操作列 的 宽度
          },
          query: {
            api: getLicenseCategoryList, // 查询接口
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
            label: '证照类型编码',
            field: 'typeCode',
            minWidth: 120,
          },
          {
            label: '证照类型名称',
            field: 'typeName',
            minWidth: 120,
          },
          {
            label: '证照名称',
            field: 'categoryName',
            minWidth: 120,
          },
          {
            label: '特殊作业许可类型',
            field: 'workTicketType',
            fieldTableRowRenderer: this.fieldTableRowRenderer,
          },
          {
            label: '作业方式许可类型',
            field: 'workMethod',
            fieldTableRowRenderer(row) {
              return (row.workMethod || []).join(', ') || ''
            },
          },
          {
            label: '排序号',
            field: 'sort',
          },
        ],
      },
      // 新增或编辑弹窗的 表单
      formFields: [
        {
          type: 'anji-select',
          label: '证照类型',
          prop: 'typeId',
          span: 12,
          rules: [{ required: true, message: '证照类型不能为空', trigger: 'change' }],
          anjiSelectOption: {
            url: 'license/type/all',
            label: 'typeName',
            option: 'id',
          },
          fn: this.handleType,
        },
        {
          type: 'input',
          label: '证照类型编码',
          prop: 'typeCode',
          span: 12,
          disabled: true,
          placeholder: '请选择证照类型',
          rules: [
            {
              required: true,
              message: '证照类型编码不能为空',
              trigger: 'change',
            },
          ],
        },
        {
          type: 'input',
          label: '证照名称',
          prop: 'categoryName',
          span: 12,
          rules: [{ required: true, message: '证照名称不能为空', trigger: 'change' }],
        },
        {
          type: 'anji-select',
          label: '特殊作业类型',
          prop: 'workTicketType',
          span: 12,
          rules: [{ required: false, message: '不能为空', trigger: 'change' }],
          anjiSelectOption: {
            localOptions: [],
            label: 'dictName',
            option: 'dictCode',
          },
          fn: this.handleWorkTicketType,
        },
        {
          type: 'checkbox',
          label: '作业方式许可',
          prop: 'workMethod',
          span: 12,
          props: {
            options: [],
          },
          rules: [{ required: false, message: '不能为空', trigger: 'change' }],
        },
        {
          type: 'input-number-pure',
          label: '排序号',
          prop: 'sort',
          span: 12,
          rules: [{ required: false, message: '不能为空', trigger: 'change' }],
        },
      ],
      formDisabled: false,
      dialogTitle: '新建证照',
      api: saveLicense,
      extraParams: {},
      specialWorkWorkTypeEunm: [],
      hotWorkTypeEunm: [],
    }
  },
  created() {
    // 设置表单里的特殊作业类型
    const specialWorkWorkTypeEunm = (this.$dictUtils.getDictList('specialWork_workType') || []).map(
      (item) => {
        item.dictCode = Number(item.dictCode)
        return item
      },
    )
    this.specialWorkWorkTypeEunm = specialWorkWorkTypeEunm
    this.$set(this.formFields[3].anjiSelectOption, 'localOptions', specialWorkWorkTypeEunm)
  },
  methods: {
    openDialog(type, row) {
      this.formDisabled = type === 'view'
      const currentWorkTicket = ((row || {}).msg || {}).workTicketType
      this.setWorkMethodOptions(Number(currentWorkTicket))
      if (type === 'view') {
        this.dialogTitle = '查看证照'
        this.dataSource = row.msg
      }
      else if (type === 'edit') {
        this.dialogTitle = '编辑证照'
        this.dataSource = row.msg
      }
      else {
        this.dialogTitle = '新建证照'
        this.dataSource = {}
      }
      this.dialogVisible = true
    },
    refreshList() {
      this.$refs.listPage.handleQueryForm('query')
    },
    // 删除
    deleteItem(row) {
      this.$confirm('确认要删除吗?', '提示', {
        type: 'warning',
      })
        .then(() => {
          deleteLicense(row.msg.id).then(({ data }) => {
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
        .catch((e) => {})
    },
    // 弹窗关闭
    dialogClose() {
      this.dialogVisible = false
      this.dataSource = {}
    },
    handleType(value, item, form, table, optionItem) {
      this.$refs.KyBaseDialog.dialogForm.typeCode = optionItem.typeCode
    },
    fieldTableRowRenderer(row) {
      return (
        (
          (this.specialWorkWorkTypeEunm || []).filter(
            item => item.dictCode === row.workTicketType,
          )[0] || {}
        ).dictName || ''
      )
    },
    handleWorkTicketType(value) {
      this.$refs.KyBaseDialog.dialogForm.workMethod = []
      this.setWorkMethodOptions(Number(value))
    },
    setWorkMethodOptions(code) {
      let eunmRes = []
      switch (code) {
        case 1001: // 动火作业
          eunmRes = (this.$dictUtils.getDictList('hotWork_type') || []).map(
            ({ dictName, dictCode }) => ({ label: dictName, value: dictName }),
          )
          this.setWorkMethodResult(eunmRes)
          break
        case 1002: // 受限空间作业
          eunmRes = (this.$dictUtils.getDictList('confined_space_operation') || []).map(
            ({ dictName, dictCode }) => ({
              label: dictName,
              value: dictName,
            }),
          )
          this.setWorkMethodResult(eunmRes)
          break
        case 1003: // 登高作业
          eunmRes = (this.$dictUtils.getDictList('ascend_operation') || []).map(
            ({ dictName, dictCode }) => ({ label: dictName, value: dictName }),
          )
          this.setWorkMethodResult(eunmRes)
          break
        case 1004: // 临时用电作业
          eunmRes = (this.$dictUtils.getDictList('temporary_electricity_operation') || []).map(
            ({ dictName, dictCode }) => ({
              label: dictName,
              value: dictName,
            }),
          )
          this.setWorkMethodResult(eunmRes)
          break
        case 1005: // 断路作业
          eunmRes = (this.$dictUtils.getDictList('open_circuit_operation') || []).map(
            ({ dictName, dictCode }) => ({
              label: dictName,
              value: dictName,
            }),
          )
          this.setWorkMethodResult(eunmRes)
          break
        case 1006: // 动土作业
          eunmRes = (this.$dictUtils.getDictList('earth_moving_operation') || []).map(
            ({ dictName, dictCode }) => ({
              label: dictName,
              value: dictName,
            }),
          )
          this.setWorkMethodResult(eunmRes)
          break
        case 1007: // 吊装作业
          eunmRes = (this.$dictUtils.getDictList('crane_operation') || []).map(
            ({ dictName, dictCode }) => ({ label: dictName, value: dictName }),
          )
          this.setWorkMethodResult(eunmRes)
          break
        case 1008: // 盲板抽堵作业
          eunmRes = (this.$dictUtils.getDictList('blind_plate_plugging_operation') || []).map(
            ({ dictName, dictCode }) => ({
              label: dictName,
              value: dictName,
            }),
          )
          this.setWorkMethodResult(eunmRes)
          break
        default:
          this.setWorkMethodResult([])
          console.log('无匹配值')
      }
    },
    setWorkMethodResult(list) {
      this.hotWorkTypeEunm = list
      this.$set(this.formFields[4].props, 'options', list)
    },
  },
}
</script>

<template>
  <!-- 人员资格证书配置 -->
  <KyBasePage
    ref="listPage"
    :option="crudOption"
  >
    <template #buttonLeftOnTable>
      <el-button
        type="primary"
        icon="el-icon-plus"
        plain
        @click="openDialog('add')"
      >
        添加
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
      slot="edit"
      slot-scope="props"
    >
      <el-button
        type="text"
        style="color: var(--ky-warning)"
        @click="openDialog('edit', props)"
      >
        编辑
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

    <template #pageSection>
      <KyBaseDialog
        v-if="dialogVisible"
        ref="KyBaseDialog"
        width="80%"
        :title="dialogTitle"
        :visible="dialogVisible"
        :disabled="formDisabled"
        :formFields="formFields"
        :dataSource="dataSource"
        labelWidth="110px"
        :extraParams="extraParams"
        :api="api"
        @handleClose="dialogClose"
        @refreshList="refreshList"
      />
    </template>
  </KyBasePage>
</template>
