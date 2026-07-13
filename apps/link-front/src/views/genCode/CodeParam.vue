<script>
import { getCodeParamFn } from '@/http/safe-production/genCode/code-param-api'
import GenCodeParamForm from './GenCodeParamForm'

export default {
  name: 'genCodeParamList',
  components: {
    GenCodeParamForm,
  },
  data() {
    return {
      pageNo: 1,
      pageSize: 10,
      result: {
        projectPath: '',
        frontPath: '',
        packageName: '',
        author: '',
      },
    }
  },
  mounted() {
    this.refreshList()
  },
  methods: {
    // 获取数据列表
    refreshList() {
      const params = {
        pageNo: this.pageNo,
        pageSize: this.pageSize,
      }
      getCodeParamFn(params).then(({ data }) => {
        if (data && data.success) {
          this.result = data.page.list[0]
        }
      })
    },
    // 修改
    edit(id) {
      this.$refs.genCodeParamForm.init('edit', '1')
    },
  },
}
</script>

<template>
  <div>
    <el-card style="margin: 10px">
      <div slot="header">
        <span>代码生成器默认参数配置</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="edit()"
        >
          修改
        </el-button>
      </div>
      <div class="el-table el-table--enable-row-hover el-table--medium">
        <table
          style="width: 100%"
          cellspacing="0"
        >
          <tbody>
            <tr class="row">
              <td>
                <div class="cell">
                  后端生成路径
                </div>
              </td>
              <td>
                <div class="cell">
                  {{ result.projectPath }}
                </div>
              </td>
            </tr>
            <tr class="row">
              <td>
                <div class="cell">
                  前端生成路径
                </div>
              </td>
              <td>
                <div class="cell">
                  {{ result.frontPath }}
                </div>
              </td>
            </tr>
            <tr class="row">
              <td>
                <div class="cell">
                  默认包名
                </div>
              </td>
              <td>
                <div class="cell">
                  {{ result.packageName }}
                </div>
              </td>
            </tr>
            <tr class="row">
              <td>
                <div class="cell">
                  默认作者
                </div>
              </td>
              <td>
                <div class="cell">
                  {{ result.author }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-card>
    <gen-code-param-form
      ref="genCodeParamForm"
      @refreshDataList="refreshList"
    />
  </div>
</template>

<style lang="scss" scoped>
.row {
  margin-bottom: 10px;
}
</style>
