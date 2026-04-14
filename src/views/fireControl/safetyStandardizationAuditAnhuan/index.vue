<script>
import {
  getEvalResult,
  pageQuerySafeLibEvalItemByUserAccount,
} from '@/http/fireControl-api'
import EditDialog from '../safetyStandardizationAudit/components/EditDialog'
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
              url: '/sysCompany/getSubordinateCompany',
              props: {
                value: 'id',
                label: 'companyName',
                children: 'children',
              },
            },
            label: '组织架构',
            field: 'companyId',
            canDo: false,
          },
        ],

        // 操作按钮
        buttons: {
          customButton: {
            operationWidth: 200, // 操作列 的 宽度
          },
          query: {
            api: pageQuerySafeLibEvalItemByUserAccount, // 查询接口
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
        tableOptions: {
          paginationBefore: true,
        },
        leftTreeClickCallback: this.leftTreeClickCallback,
        getQueryParams: this.getQueryParams,
      },
      formDisabled: false,
      dialogTitle: '安全标准化自评',
      formStatus: '',
      evalResult: {},
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
    },
    refreshList() {
      this.$refs.listPage.handleQueryForm('query')
    },
    // 弹窗关闭
    dialogClose() {
      this.dialogVisible = false
      this.dataSource = {}
    },
    getEvalResultByCompany(companyId) {
      getEvalResult({ companyId }).then(({ data }) => {
        if (data.code == 200) {
          this.evalResult = data.result || {}
        }
      })
    },
    leftTreeClickCallback(queryParams, id, data, node) {
      this.getEvalResultByCompany(id)
    },
    getQueryParams(params = {}) {
      if (!params.companyId) {
        this.evalResult = {}
      }
    },
  },
}
</script>

<template>
  <!-- 安全标准化评审-安环部查所有已自评 -->
  <KyBasePage ref="listPage" :option="crudOption">
    <template slot="view" slot-scope="props">
      <el-button type="text" @click="openDialog('view', props)">
        查看
      </el-button>
    </template>
    <template #paginationBefore>
      <div class="self-assessment">
        <span class="self-text">自评结论：</span>
        <span class="fullScoreCount-text">满分项{{ evalResult.fullScoreCount || 0 }}项</span>
        <span class="blankCount-text">空项{{ evalResult.blankCount || 0 }}项</span>
        <span class="deductScoreCount-text">扣分项{{ evalResult.deductScoreCount || 0 }}项</span>
        <span class="reviewScore-text">评审评分{{ evalResult.reviewScore || 0 }}分</span>
        <span
          v-if="evalResult.scoreLevel"
          class="scoreLevel-text"
        >评分等级{{ evalResult.scoreLevel || "" }}</span>
      </div>
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

<style scoped lang="scss">
.self-assessment {
  font-size: 14px;
  span {
    margin: 0 10px;
  }
}
.fullScoreCount-text {
  color: rgb(189, 49, 36);
}
.blankCount-text {
  color: rgb(255, 191, 107);
}
.deductScoreCount-text {
  color: rgb(233, 157, 66);
}
.reviewScore-text {
  color: rgb(129, 179, 55);
}
.scoreLevel-text {
  color: rgb(64, 149, 229);
}
</style>
